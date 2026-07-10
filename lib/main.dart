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
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:path/path.dart';

// --- Pastikan URL ini diganti dengan URL Cloudflare Tunnel Anda ---
const String baseUrl = "https://diversity-recommended-spine-helmet.trycloudflare.com";

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (Platform.isAndroid) await AndroidWebViewController.platform;
  runApp(const MaterialApp(home: AuthWrapper()));
}

// --- AuthWrapper: Menentukan apakah user sudah login ---
class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});
  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  final storage = const FlutterSecureStorage();
  bool _isLoggedIn = false;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _checkLoginStatus();
  }

  Future<void> _checkLoginStatus() async {
    final token = await storage.read(key: 'auth_token');
    setState(() {
      _isLoggedIn = token != null;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }
    return _isLoggedIn ? const AppBuilderHome() : const LoginScreen();
  }
}

// --- Login Screen ---
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final storage = const FlutterSecureStorage();
  bool _isLoading = false;

  Future<void> _login() async {
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();
    if (email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(this.context!).showSnackBar(const SnackBar(content: Text('Email dan password wajib diisi')));
      return;
    }
    setState(() => _isLoading = true);
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      ).timeout(const Duration(seconds: 30));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        await storage.write(key: 'auth_token', value: data['access_token']);
        await storage.write(key: 'user_id', value: data['user_id'].toString());
        await storage.write(key: 'user_name', value: data['full_name']);
        setState(() => _isLoading = false);
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const AppBuilderHome()));
      } else {
        final err = jsonDecode(response.body);
        ScaffoldMessenger.of(this.context!).showSnackBar(SnackBar(content: Text(err['error'] ?? 'Login gagal')));
        setState(() => _isLoading = false);
      }
    } catch (e) {
      ScaffoldMessenger.of(this.context!).showSnackBar(SnackBar(content: Text('Koneksi error: $e')));
      setState(() => _isLoading = false);
    }
  }

  Future<void> _register() async {
    // Navigasi ke Register Screen (bisa dibuat sederhana, tapi untuk demo kita pakai alert)
    Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen()));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login AI Evo Studio')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Selamat datang kembali', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 30),
            TextField(controller: _emailController, decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder())),
            const SizedBox(height: 20),
            TextField(controller: _passwordController, obscureText: true, decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder())),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _login,
                child: _isLoading ? const CircularProgressIndicator() : const Text('Login'),
              ),
            ),
            const SizedBox(height: 10),
            TextButton(
              onPressed: _register,
              child: const Text('Belum punya akun? Daftar'),
            ),
          ],
        ),
      ),
    );
  }
}

// --- Register Screen (Sederhana) ---
class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  bool _isLoading = false;

  Future<void> _register() async {
    final name = _nameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text.trim();
    if (name.isEmpty || email.isEmpty || password.isEmpty) {
      ScaffoldMessenger.of(this.context!).showSnackBar(const SnackBar(content: Text('Semua field wajib diisi')));
      return;
    }
    setState(() => _isLoading = true);
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'full_name': name, 'email': email, 'password': password}),
      ).timeout(const Duration(seconds: 30));
      if (response.statusCode == 200) {
        ScaffoldMessenger.of(this.context!).showSnackBar(const SnackBar(content: Text('Registrasi berhasil, silakan login')));
        Navigator.pop(context);
      } else {
        final err = jsonDecode(response.body);
        ScaffoldMessenger.of(this.context!).showSnackBar(SnackBar(content: Text(err['error'] ?? 'Registrasi gagal')));
      }
    } catch (e) {
      ScaffoldMessenger.of(this.context!).showSnackBar(SnackBar(content: Text('Koneksi error: $e')));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Daftar Akun Baru')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(controller: _nameController, decoration: const InputDecoration(labelText: 'Nama Lengkap', border: OutlineInputBorder())),
            const SizedBox(height: 20),
            TextField(controller: _emailController, decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder())),
            const SizedBox(height: 20),
            TextField(controller: _passwordController, obscureText: true, decoration: const InputDecoration(labelText: 'Password', border: OutlineInputBorder())),
            const SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _register,
                child: _isLoading ? const CircularProgressIndicator() : const Text('Daftar'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// --- Main App (Setelah Login) ---
class AppBuilderHome extends StatefulWidget {
  const AppBuilderHome({super.key});
  @override
  State<AppBuilderHome> createState() => _AppBuilderHomeState();
}

class _AppBuilderHomeState extends State<AppBuilderHome> {
  final TextEditingController _promptController = TextEditingController();
  final storage = const FlutterSecureStorage();
  String _token = '';
  String _userId = '';
  String _userName = '';
  String _previewHtml = "<h3>Pilih atau buat proyek untuk memulai</h3>";
  List<Map<String, String>> _messages = [];
  Map<String, dynamic>? _currentProject;
  bool _isLoading = false;
  Database? _db;
  List<Map<String, dynamic>> _localProjects = [];
  String _connectionStatus = "Connecting...";
  Color _connectionColor = Colors.grey;

  @override
  void initState() {
    super.initState();
    _loadUserData();
    _initDatabase();
    _testConnection();
  }

  Future<void> _loadUserData() async {
    final token = await storage.read(key: 'auth_token');
    final userId = await storage.read(key: 'user_id');
    final userName = await storage.read(key: 'user_name');
    setState(() {
      _token = token ?? '';
      _userId = userId ?? '';
      _userName = userName ?? 'User';
    });
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

  Future<void> _createNewProject() async {
    String newName = "Proyek ${_localProjects.length + 1}";
    int id = await _db!.insert('projects', {'name': newName, 'data': '{}', 'updated_at': DateTime.now().millisecondsSinceEpoch});
    await _loadLocalProjects();
    await _loadProject({'id': id, 'name': newName, 'data': '{}'});
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
    ScaffoldMessenger.of(this.context!).showSnackBar(const SnackBar(content: Text("💾 Proyek tersimpan di perangkat")));
  }

  Future<void> _deleteProject(int id) async {
    await _db!.delete('projects', where: 'id = ?', whereArgs: [id]);
    if (_currentProject != null && _currentProject!['id'] == id) setState(() => _currentProject = null);
    await _loadLocalProjects();
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
      ScaffoldMessenger.of(this.context!).showSnackBar(const SnackBar(content: Text("⚠️ Silakan buat atau pilih proyek terlebih dahulu.")));
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
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer $_token"
        },
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
      } else if (response.statusCode == 401) {
        // Token expired, logout
        await storage.delete(key: 'auth_token');
        Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const AuthWrapper()));
      } else {
        _messages.add({"role": "ai", "content": "❌ Error: ${response.statusCode}"});
      }
    } catch (e) {
      _messages.add({"role": "ai", "content": "❌ Koneksi gagal: $e"});
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
      if (files.isEmpty) { ScaffoldMessenger.of(this.context!).showSnackBar(const SnackBar(content: Text("Tidak ada file untuk diekspor"))); return; }
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
    } catch (e) { ScaffoldMessenger.of(this.context!).showSnackBar(SnackBar(content: Text("❌ Gagal ekspor: $e"))); }
  }

  Future<void> _logout() async {
    await storage.delete(key: 'auth_token');
    await storage.delete(key: 'user_id');
    await storage.delete(key: 'user_name');
    Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const AuthWrapper()));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("AI Evo Studio"),
        actions: [
          IconButton(icon: const Icon(Icons.add), onPressed: _createNewProject),
          IconButton(icon: const Icon(Icons.save), onPressed: _saveCurrentProject),
          IconButton(icon: const Icon(Icons.archive), onPressed: _exportZip),
          IconButton(icon: const Icon(Icons.logout), onPressed: _logout),
        ],
      ),
      drawer: Drawer(
        child: ListView(
          children: [
            DrawerHeader(decoration: const BoxDecoration(color: Colors.blue),
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text("👋 Halo, $_userName", style: const TextStyle(color: Colors.white, fontSize: 20)),
                  const Text("📂 Proyek Saya", style: TextStyle(color: Colors.white70))
                ])),
            ..._localProjects.map((p) => ListTile(
              leading: const Icon(Icons.code),
              title: Text(p['name']),
              subtitle: Text("${DateTime.fromMillisecondsSinceEpoch(p['updated_at'])}"),
              trailing: IconButton(icon: const Icon(Icons.delete, color: Colors.red), onPressed: () => _deleteProject(p['id'])),
              onTap: () => Navigator.pop(context, _loadProject(p)),
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
