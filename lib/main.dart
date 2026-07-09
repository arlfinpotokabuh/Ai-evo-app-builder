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
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (Platform.isAndroid) await AndroidWebViewController.platform;
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
  String _previewHtml = "<h3>Pilih atau buat proyek untuk memulai</h3>";
  List<Map<String, String>> _messages = [];
  Map<String, dynamic>? _currentProject;
  bool _isLoading = false;
  Database? _db;
  List<Map<String, dynamic>> _localProjects = [];
  List<Map<String, dynamic>> _serverProjects = [];
  String _connectionStatus = "Connecting...";
  Color _connectionColor = Colors.grey;

  @override
  void initState() {
    super.initState();
    _initUserId();
    _initDatabase();
    _testConnection();
    _loadServerProjects();
  }

  Future<void> _initUserId() async {
    final prefs = await SharedPreferences.getInstance();
    String? id = prefs.getString('user_id');
    if (id == null) { id = const Uuid().v4(); await prefs.setString('user_id', id); }
    setState(() => _userId = id!);
  }

  Future<void> _initDatabase() async {
    final path = join((await getApplicationDocumentsDirectory()).path, 'projects.db');
    _db = await openDatabase(path, version: 1, onCreate: (db, version) async {
      await db.execute('CREATE TABLE projects (id INTEGER PRIMARY KEY, name TEXT, data TEXT, updated_at INTEGER)');
    });
    await _loadLocalProjects();
  }

  Future<void> _loadLocalProjects() async {
    final maps = await _db!.query('projects');
    setState(() => _localProjects = maps);
  }

  Future<void> _loadServerProjects() async {
    try {
      final response = await http.get(Uri.parse('$baseUrl/api/project/list?user_id=$_userId'));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body) as List;
        setState(() => _serverProjects = data.map((e) => {'name': e['name'], 'updated_at': e['updated_at']}).toList());
      }
    } catch (e) { print("Gagal load server projects: $e"); }
  }

  Future<void> _syncAllProjects() async {
    // Ambil semua proyek lokal, simpan ke server
    for (var proj in _localProjects) {
      await _saveProjectToServer(proj['name'], jsonDecode(proj['data']));
    }
    await _loadServerProjects();
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("✅ Sinkronisasi dengan server berhasil")));
  }

  Future<void> _saveProjectToServer(String name, Map<String, dynamic> data) async {
    try {
      await http.post(
        Uri.parse('$baseUrl/api/project/save'),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({'user_id': _userId, 'project_name': name, 'project_data': data}),
      );
    } catch (e) { print("Gagal simpan ke server: $e"); }
  }

  Future<void> _loadProjectFromServer(String name) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/project/load'),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({'user_id': _userId, 'project_name': name}),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        // Simpan ke lokal
        int id = await _db!.insert('projects', {'name': name, 'data': jsonEncode(data), 'updated_at': DateTime.now().millisecondsSinceEpoch});
        await _loadLocalProjects();
        await _loadProject({'id': id, 'name': name, 'data': jsonEncode(data)});
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("❌ Gagal load proyek dari server")));
      }
    } catch (e) { ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("❌ Error: $e"))); }
  }

  Future<void> _createNewProject() async {
    String newName = "Proyek ${_localProjects.length + 1}";
    int id = await _db!.insert('projects', {'name': newName, 'data': '{}', 'updated_at': DateTime.now().millisecondsSinceEpoch});
    await _loadLocalProjects();
    await _loadProject({'id': id, 'name': newName, 'data': '{}'});
    // Simpan ke server
    await _saveProjectToServer(newName, {'messages': [], 'preview': "<h3>Proyek baru</h3>"});
  }

  Future<void> _loadProject(Map<String, dynamic> project) async {
    setState(() {
      _currentProject = project;
      _messages = [];
      _previewHtml = "<h3>Memuat proyek...</h3>";
    });
    try {
      var data = jsonDecode(project['data']);
      if (data['messages'] != null) setState(() => _messages = List<Map<String, String>>.from(data['messages']));
      if (data['preview'] != null) setState(() => _previewHtml = data['preview']);
    } catch (e) { print("Load error: $e"); }
  }

  Future<void> _saveCurrentProject() async {
    if (_currentProject == null || _db == null) return;
    Map<String, dynamic> data = {'messages': _messages, 'preview': _previewHtml};
    await _db!.update('projects', {'data': jsonEncode(data), 'updated_at': DateTime.now().millisecondsSinceEpoch},
        where: 'id = ?', whereArgs: [_currentProject!['id']]);
    // Simpan juga ke server
    await _saveProjectToServer(_currentProject!['name'], data);
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("💾 Proyek tersimpan di lokal & server")));
  }

  Future<void> _deleteProject(int id, String name) async {
    await _db!.delete('projects', where: 'id = ?', whereArgs: [id]);
    if (_currentProject != null && _currentProject!['id'] == id) setState(() => _currentProject = null);
    await _loadLocalProjects();
    // Hapus dari server
    try {
      await http.post(
        Uri.parse('$baseUrl/api/project/delete'),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({'user_id': _userId, 'project_name': name}),
      );
    } catch (e) { print("Gagal hapus server: $e"); }
  }

  Future<void> _testConnection() async {
    try {
      final res = await http.get(Uri.parse(baseUrl)).timeout(const Duration(seconds: 5));
      if (res.statusCode == 404 || res.statusCode == 200) {
        setState(() { _connectionStatus = "Online"; _connectionColor = Colors.green; });
      } else { _connectionStatus = "Offline (${res.statusCode})"; _connectionColor = Colors.red; }
    } catch (e) { _connectionStatus = "Offline"; _connectionColor = Colors.red; }
  }

  Future<void> _sendPrompt(String prompt) async {
    if (prompt.isEmpty) return;
    if (_currentProject == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("⚠️ Silakan buat atau pilih proyek terlebih dahulu.")));
      return;
    }
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
          _previewHtml = data['ui_preview_html'] ?? "<h3>Preview tidak tersedia</h3>";
          _messages.add({"role": "ai", "content": "✅ Proyek '$namaProyek' berhasil diupdate!"});
        });
        await _saveCurrentProject();
      } else {
        String errMsg = "❌ Error ${response.statusCode}: Server sibuk";
        if (response.statusCode == 503) errMsg = "❌ AI sedang sibuk (503). Coba lagi.";
        setState(() => _messages.add({"role": "ai", "content": errMsg}));
      }
    } catch (e) {
      setState(() => _messages.add({"role": "ai", "content": "❌ Koneksi gagal: $e"}));
    } finally {
      setState(() => _isLoading = false);
      await _loadLocalProjects();
    }
  }

  Future<void> _exportZip() async {
    if (_currentProject == null) return;
    try {
      var data = jsonDecode(_currentProject!['data']);
      List files = data['files'] ?? [];
      if (files.isEmpty) { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Tidak ada file untuk diekspor"))); return; }
      final archive = Archive();
      for (var file in files) {
        archive.addFile(ArchiveFile(file['path'], file['content'].length, utf8.encode(file['content'])));
      }
      final tempDir = await getTemporaryDirectory();
      final zipPath = "${tempDir.path}/${_currentProject!['name']}_build.zip";
      final outputStream = File(zipPath).openWrite();
      final encoder = ZipEncoder();
      encoder.encode(archive, outputStream);
      await outputStream.close();
      await Share.shareXFiles([XFile(zipPath)], text: "Source code dari ${_currentProject!['name']}");
    } catch (e) { ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("❌ Gagal ekspor: $e"))); }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("AI Evo Studio"),
        actions: [
          IconButton(icon: const Icon(Icons.cloud_sync), onPressed: _syncAllProjects),
          IconButton(icon: const Icon(Icons.add), onPressed: _createNewProject),
          IconButton(icon: const Icon(Icons.save), onPressed: _saveCurrentProject),
          IconButton(icon: const Icon(Icons.archive), onPressed: _exportZip),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          children: [
            const DrawerHeader(decoration: BoxDecoration(color: Colors.blue),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text("📂 Proyek Saya", style: TextStyle(color: Colors.white, fontSize: 24)),
                  Text("Lokal / Server", style: TextStyle(color: Colors.white70))
                ])),
            const Divider(),
            const Padding(padding: EdgeInsets.all(8), child: Text("🔹 Lokal", style: TextStyle(fontWeight: FontWeight.bold))),
            ..._localProjects.map((p) => ListTile(
              leading: const Icon(Icons.storage),
              title: Text(p['name']),
              subtitle: Text("${DateTime.fromMillisecondsSinceEpoch(p['updated_at'])}"),
              trailing: IconButton(icon: const Icon(Icons.delete, color: Colors.red), onPressed: () => _deleteProject(p['id'], p['name'])),
              onTap: () => Navigator.pop(context, _loadProject(p)),
            )),
            const Divider(),
            const Padding(padding: EdgeInsets.all(8), child: Text("☁️ Server", style: TextStyle(fontWeight: FontWeight.bold))),
            ..._serverProjects.map((p) => ListTile(
              leading: const Icon(Icons.cloud),
              title: Text(p['name']),
              subtitle: Text(p['updated_at'] != null ? "${DateTime.fromMillisecondsSinceEpoch(p['updated_at'])}" : ""),
              trailing: IconButton(icon: const Icon(Icons.download, color: Colors.blue), onPressed: () => _loadProjectFromServer(p['name'])),
            )),
          ],
        ),
      ),
      body: Column(
        children: [
          Container(padding: const EdgeInsets.all(8), color: Colors.grey[200],
            child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text("Proyek: ${_currentProject?['name'] ?? 'Belum dipilih'}"),
                Row(children: [
                  Container(width: 10, height: 10, decoration: BoxDecoration(color: _connectionColor, shape: BoxShape.circle)),
                  const SizedBox(width: 5),
                  Text(_connectionStatus, style: TextStyle(color: _connectionColor))
                ])
              ],
            ),
          ),
          Expanded(child: Row(
            children: [
              Expanded(flex: 4, child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(children: [
                  Expanded(child: ListView.builder(
                    itemCount: _messages.length,
                    itemBuilder: (ctx, i) {
                      final msg = _messages[i];
                      return Align(
                        alignment: msg["role"] == "user" ? Alignment.centerRight : Alignment.centerLeft,
                        child: Container(
                          margin: const EdgeInsets.symmetric(vertical: 4),
                          padding: const EdgeInsets.all(10),
                          decoration: BoxDecoration(
                            color: msg["role"] == "user" ? Colors.blue[100] : Colors.grey[200],
                            borderRadius: BorderRadius.circular(10)
                          ),
                          child: Text(msg["content"] ?? ""),
                        )
                      );
                    }
                  )),
                  Row(children: [
                    Expanded(child: TextField(
                      controller: _promptController,
                      decoration: const InputDecoration(hintText: "Deskripsikan aplikasi...", border: OutlineInputBorder()),
                      onSubmitted: (_) => _sendPrompt(_promptController.text)
                    )),
                    const SizedBox(width: 8),
                    if (_isLoading) const CircularProgressIndicator()
                    else IconButton(onPressed: () => _sendPrompt(_promptController.text), icon: const Icon(Icons.send, size: 30))
                  ])
                ])
              )),
              Expanded(flex: 6, child: Container(
                margin: const EdgeInsets.all(8),
                decoration: BoxDecoration(border: Border.all(color: Colors.grey), borderRadius: BorderRadius.circular(8)),
                child: WebViewWidget(
                  controller: WebViewController()
                    ..setJavaScriptMode(JavaScriptMode.unrestricted)
                    ..loadHtmlString(_previewHtml)
                )
              ))
            ]
          ))
        ]
      )
    );
  }
}
