import 'dart:async';
import 'package:path/path.dart' as p;
import 'dart:convert';
import 'dart:io';
import 'package:archive/archive.dart';
import 'package:archive/archive_io.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:webview_flutter/webview_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import 'package:uuid/uuid.dart';
import 'package:in_app_purchase/in_app_purchase.dart';
import 'package:sqflite/sqflite.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MaterialApp(home: AppBuilderHome()));
}

class AppBuilderHome extends StatefulWidget {
  const AppBuilderHome({super.key});

  @override
  State<AppBuilderHome> createState() => _AppBuilderHomeState();
}

class _AppBuilderHomeState extends State<AppBuilderHome> {
  final TextEditingController _promptController = TextEditingController();
  final String baseUrl = "http://168.110.223.212:7777";
  String _userId = "";
  String _previewHtml = "<h3>Preview kosong</h3>";
  List<Map<String, String>> _messages = [];
  Map<String, dynamic>? _currentProject;
  bool _isLoading = false;
  bool _isVip = false;
  String _connectionStatus = "Connecting...";
  Color _connectionColor = Colors.grey;

  // SQLite Database
  Database? _db;
  List<Map<String, dynamic>> _projectList = [];

  @override
  void initState() {
    super.initState();
    _initUserId();
    _initDatabase();
    _loadVipStatus();
    _testConnection();
  }

  Future<void> _initUserId() async {
    final prefs = await SharedPreferences.getInstance();
    String? id = prefs.getString('user_id');
    if (id == null) {
      id = const Uuid().v4();
      await prefs.setString('user_id', id);
    }
    setState(() => _userId = id!);
  }

  Future<void> _initDatabase() async {
    try {
      Directory documentsDirectory = await getApplicationDocumentsDirectory();
      String path = p.join(documentsDirectory.path, 'projects.db');
      _db = await openDatabase(path, version: 1,
          onCreate: (Database db, int version) async {
        await db.execute(
            'CREATE TABLE projects (id INTEGER PRIMARY KEY, name TEXT, data TEXT, updated_at INTEGER)');
      });
      await _loadProjectList();
    } catch (e) {
      print("DB Init Error: $e");
    }
  }

  Future<void> _loadProjectList() async {
    if (_db == null) return;
    final List<Map<String, dynamic>> maps = await _db!.query('projects');
    setState(() {
      _projectList = maps;
    });
  }

  Future<void> _createNewProject() async {
    String newName = "New Project ${_projectList.length + 1}";
    await _db!.insert('projects', {'name': newName, 'data': '{}', 'updated_at': DateTime.now().millisecondsSinceEpoch});
    await _loadProjectList();
    setState(() {
      _currentProject = null;
      _messages = [];
      _previewHtml = "<h3>Proyek baru dibuat</h3>";
    });
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("📁 Proyek '$newName' dibuat")));
  }

  Future<void> _renameProject(int id, String newName) async {
    await _db!.update('projects', {'name': newName}, where: 'id = ?', whereArgs: [id]);
    await _loadProjectList();
  }

  Future<void> _deleteProject(int id) async {
    await _db!.delete('projects', where: 'id = ?', whereArgs: [id]);
    if (_currentProject != null && _currentProject!['id'] == id) {
      setState(() => _currentProject = null);
    }
    await _loadProjectList();
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("🗑️ Proyek dihapus")));
  }

  Future<void> _loadProject(Map<String, dynamic> project) async {
    setState(() {
      _currentProject = project;
      _messages = [];
      _previewHtml = "<h3>Loading...</h3>";
    });
    try {
      var data = jsonDecode(project['data']);
      if (data['messages'] != null) setState(() => _messages = List<Map<String, String>>.from(data['messages']));
      if (data['preview'] != null) setState(() => _previewHtml = data['preview']);
    } catch (e) {
      print("Load error: $e");
    }
  }

  Future<void> _saveCurrentProject() async {
    if (_currentProject == null || _db == null) return;
    Map<String, dynamic> data = {
      'messages': _messages,
      'preview': _previewHtml,
    };
    await _db!.update('projects', {'data': jsonEncode(data), 'updated_at': DateTime.now().millisecondsSinceEpoch},
        where: 'id = ?', whereArgs: [_currentProject!['id']]);
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("💾 Proyek tersimpan")));
  }

  Future<void> _loadVipStatus() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() => _isVip = prefs.getBool('is_vip') ?? false);
  }

  Future<void> _testConnection() async {
    try {
      final response = await http.get(Uri.parse(baseUrl)).timeout(const Duration(seconds: 5));
      if (response.statusCode == 404 || response.statusCode == 200) {
        setState(() {
          _connectionStatus = "Online";
          _connectionColor = Colors.green;
        });
      } else {
        setState(() {
          _connectionStatus = "Offline (${response.statusCode})";
          _connectionColor = Colors.red;
        });
      }
    } catch (e) {
      setState(() {
        _connectionStatus = "Offline";
        _connectionColor = Colors.red;
      });
    }
  }

  Future<void> _sendPrompt(String prompt) async {
    if (prompt.isEmpty) return;
    setState(() {
      _isLoading = true;
      _messages.add({"role": "user", "content": prompt});
    });
    _promptController.clear();

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/v1/chat/completions'),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"user_id": _userId, "prompt": prompt, "target_platform": "flutter"}),
      ).timeout(const Duration(seconds: 45));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        String namaProyek = data['project_name'] ?? "Aplikasi Baru";
        setState(() {
          _currentProject ??= {'id': 0, 'name': 'Unsaved Project'};
          _previewHtml = data['ui_preview_html'] ?? "<h3>Preview tidak tersedia</h3>";
          _messages.add({"role": "ai", "content": "✅ Proyek '$namaProyek' berhasil dibuat!"});
        });
        await _saveCurrentProject();
      } else if (response.statusCode == 503) {
        final errorData = jsonDecode(response.body);
        _messages.add({"role": "ai", "content": "❌ Server Error 503: ${errorData['detail'] ?? 'AI sedang sibuk, coba lagi'}"});
      } else if (response.statusCode == 500) {
        _messages.add({"role": "ai", "content": "❌ Server Error 500: AI gagal memproses respons"});
      } else {
        _messages.add({"role": "ai", "content": "❌ Error: ${response.statusCode}"});
      }
    } on http.ClientException catch (e) {
      _messages.add({"role": "ai", "content": "❌ Koneksi Gagal: Periksa jaringan VM"});
    } on TimeoutException {
      _messages.add({"role": "ai", "content": "❌ Timeout: Server tidak merespon 45 detik"});
    } catch (e) {
      _messages.add({"role": "ai", "content": "❌ Error Tak Dikenal: $e"});
    } finally {
      setState(() => _isLoading = false);
      await _loadProjectList();
    }
  }

  Future<void> _exportZip() async {
    if (_currentProject == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Belum ada proyek untuk diekspor")));
      return;
    }
    try {
      var data = jsonDecode(_currentProject!['data']);
      List files = data['files'] ?? [];
      if (files.isEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Proyek ini belum memiliki file")));
        return;
      }

      final archive = Archive();
      for (var file in files) {
        final path = file['path'];
        final content = file['content'];
        archive.addFile(ArchiveFile(path, content.length, utf8.encode(content)));
      }

      final tempDir = await getTemporaryDirectory();
      final zipPath = "${tempDir.path}/${_currentProject!['name']}_build.zip";
      final outputStream = File(zipPath).openWrite();
      final encoder = ZipEncoder();
      final bytes = encoder.encode(archive);
      if (bytes != null) File(zipPath).writeAsBytesSync(bytes);

      await Share.shareXFiles([XFile(zipPath)], text: "Source code dari ${_currentProject!['name']}");
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text("📦 ZIP berhasil! ${files.length} file diekspor.")));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("❌ Gagal ekspor: $e")));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("AI Evo Studio"),
        actions: [
          IconButton(icon: const Icon(Icons.folder_open), onPressed: () => _loadProjectList()),
          IconButton(icon: const Icon(Icons.add), onPressed: _createNewProject),
          IconButton(icon: const Icon(Icons.save), onPressed: _saveCurrentProject),
          IconButton(icon: const Icon(Icons.archive), onPressed: _exportZip),
          IconButton(
            icon: Icon(_isVip ? Icons.verified : Icons.star_border),
            onPressed: () { /* Placeholder VIP */ },
          ),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            const DrawerHeader(decoration: BoxDecoration(color: Colors.blue),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text("📂 Proyek Saya", style: TextStyle(color: Colors.white, fontSize: 24)),
                  Text("Klik untuk membuka proyek", style: TextStyle(color: Colors.white70))
                ])),
            ..._projectList.map((p) {
              return ListTile(
                leading: const Icon(Icons.code),
                title: Text(p['name']),
                subtitle: Text("Updated ${DateTime.fromMillisecondsSinceEpoch(p['updated_at']).toString().substring(0,16)}"),
                trailing: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    IconButton(icon: const Icon(Icons.edit, size: 18), onPressed: () {
                      _renameProject(p['id'], p['name'] + " (Edit)");
                    }),
                    IconButton(icon: const Icon(Icons.delete, color: Colors.red, size: 18), onPressed: () {
                      _deleteProject(p['id']);
                    }),
                  ],
                ),
                onTap: () => _loadProject(p),
              );
            }).toList(),
          ],
        ),
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            color: Colors.black12,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text("AI Status:", style: TextStyle(color: Colors.grey[700])),
                Row(
                  children: [
                    Container(width: 10, height: 10, decoration: BoxDecoration(color: _connectionColor, shape: BoxShape.circle)),
                    const SizedBox(width: 5),
                    Text(_connectionStatus, style: TextStyle(color: _connectionColor, fontWeight: FontWeight.bold))
                  ],
                )
              ],
            ),
          ),
          Expanded(
            child: Row(
              children: [
                Expanded(flex: 4, child: _buildChatPanel()),
                Expanded(flex: 6, child: _buildPreviewPanel()),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChatPanel() {
    return Padding(
      padding: const EdgeInsets.all(12.0),
      child: Column(
        children: [
          Expanded(child: ListView.builder(
            itemCount: _messages.length,
            itemBuilder: (ctx, i) {
              final msg = _messages[i];
              final isUser = msg["role"] == "user";
              return Align(
                alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  margin: const EdgeInsets.symmetric(vertical: 4),
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: isUser ? Colors.blue[100] : Colors.grey[200],
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(msg["content"] ?? ""),
                ),
              );
            },
          )),
          Row(
            children: [
              Expanded(child: TextField(
                controller: _promptController,
                decoration: const InputDecoration(hintText: "Deskripsikan aplikasi...", border: OutlineInputBorder()),
                onSubmitted: (_) => _sendPrompt(_promptController.text),
              )),
              const SizedBox(width: 8),
              if (_isLoading) const CircularProgressIndicator()
              else IconButton(onPressed: () => _sendPrompt(_promptController.text), icon: const Icon(Icons.send, size: 30)),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildPreviewPanel() {
    return Container(
      margin: const EdgeInsets.all(8.0),
      decoration: BoxDecoration(border: Border.all(color: Colors.grey), borderRadius: BorderRadius.circular(8)),
      child: WebViewWidget(
        controller: WebViewController()
          ..setJavaScriptMode(JavaScriptMode.unrestricted)
          ..loadHtmlString(_previewHtml),
      ),
    );
  }
}
