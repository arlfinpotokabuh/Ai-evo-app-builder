import 'dart:convert';
import 'dart:async';
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

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (Platform.isAndroid) {
    await AndroidWebViewController.platform;
  }
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
  String _previewHtml = "<h3>Belum ada preview</h3>";
  List<Map<String, String>> _messages = [];
  Map<String, dynamic>? _projectData;
  bool _isLoading = false;
  bool _isVip = false;

  @override
  void initState() {
    super.initState();
    _initUserId();
    _loadSavedProject();
    _loadVipStatus();
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

  Future<void> _loadSavedProject() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString('project_data');
    if (saved != null) {
      setState(() {
        _projectData = jsonDecode(saved);
        _previewHtml = _projectData!['ui_preview_html'] ?? "<h3>Preview tidak tersedia</h3>";
        _messages.add({"role": "system", "content": "✅ Proyek dimuat dari penyimpanan lokal!"});
      });
    }
  }

  Future<void> _saveProjectToLocal() async {
    if (_projectData == null) return;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('project_data', jsonEncode(_projectData));
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("💾 Proyek tersimpan di perangkat")));
    }
  }

  Future<void> _loadVipStatus() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() => _isVip = prefs.getBool('is_vip') ?? false);
  }

  Future<void> _purchaseVip() async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/vip/subscribe'),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"user_id": _userId}),
      );
      if (response.statusCode == 200) {
        setState(() => _isVip = true);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setBool('is_vip', true);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("🎉 VIP aktif!")));
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("❌ Gagal aktivasi VIP: $e")));
      }
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
        body: jsonEncode({
          "user_id": _userId,
          "prompt": prompt,
          "target_platform": "flutter"
        }),
      ).timeout(const Duration(seconds: 30));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _projectData = data;
          _previewHtml = data['ui_preview_html'] ?? "<h3>Preview kosong</h3>";
          String namaProyek = data['project_name'] ?? "Aplikasi Baru";
          _messages.add({"role": "ai", "content": "✅ Proyek '\$namaProyek' berhasil dibuat!"});
        });
        _saveProjectToLocal();
      } else if (response.statusCode == 503) {
        final errorData = jsonDecode(response.body);
        setState(() {
          _messages.add({"role": "ai", "content": "❌ Server Error 503: ${errorData['detail'] ?? 'Server sibuk, coba lagi'}"});
        });
      } else if (response.statusCode == 500) {
        setState(() {
          _messages.add({"role": "ai", "content": "❌ Server Error 500: AI mengirim respons tidak valid."});
        });
      } else if (response.statusCode == 429) {
        setState(() {
          _messages.add({"role": "ai", "content": "⏳ Batas token harian tercapai. Upgrade VIP atau tunggu reset harian."});
        });
      } else {
        setState(() {
          _messages.add({"role": "ai", "content": "❌ Error: ${response.statusCode}"});
        });
      }
    } on http.ClientException catch (e) {
      setState(() {
        _messages.add({"role": "ai", "content": "❌ Koneksi Gagal (Jaringan): $e"});
      });
    } on TimeoutException catch (e) {
      setState(() {
        _messages.add({"role": "ai", "content": "❌ Timeout: Server tidak merespon dalam 30 detik."});
      });
    } catch (e) {
      setState(() {
        _messages.add({"role": "ai", "content": "❌ Error Tidak Diketahui: $e"});
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _exportZip() async {
    if (_projectData == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Belum ada proyek")));
      return;
    }

    final files = _projectData!['files'] as List;
    final archive = Archive();

    for (var file in files) {
      final path = file['path'];
      final content = file['content'];
      archive.addFile(ArchiveFile(path, content.length, utf8.encode(content)));
    }

    final tempDir = await getTemporaryDirectory();
    final zipPath = "${tempDir.path}/${_projectData!['project_name']}_build.zip";
    final outputStream = File(zipPath).openWrite();
    final encoder = ZipEncoder();
    encoder.encode(archive, outputStream);
    await outputStream.close();

    await Share.shareXFiles([XFile(zipPath)], text: "Berikut source code aplikasi ${_projectData!['project_name']}");
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("📦 ZIP berhasil dibuat")));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("AI Evo App Builder"),
        actions: [
          IconButton(icon: const Icon(Icons.save), onPressed: _saveProjectToLocal),
          IconButton(icon: const Icon(Icons.archive), onPressed: _exportZip),
          IconButton(
            icon: Icon(_isVip ? Icons.verified : Icons.star),
            onPressed: _isVip ? null : _purchaseVip,
          ),
        ],
      ),
      body: Row(
        children: [
          Expanded(
            flex: 4,
            child: Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                children: [
                  Expanded(
                    child: ListView.builder(
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
                    ),
                  ),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _promptController,
                          decoration: const InputDecoration(hintText: "Describe your app...", border: OutlineInputBorder()),
                          onSubmitted: (_) => _sendPrompt(_promptController.text),
                        ),
                      ),
                      const SizedBox(width: 8),
                      if (_isLoading)
                        const CircularProgressIndicator()
                      else
                        IconButton(
                          onPressed: () => _sendPrompt(_promptController.text),
                          icon: const Icon(Icons.send, size: 30),
                        ),
                    ],
                  )
                ],
              ),
            ),
          ),
          Expanded(
            flex: 6,
            child: Container(
              margin: const EdgeInsets.all(8.0),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey),
                borderRadius: BorderRadius.circular(8)
              ),
              child: WebViewWidget(
                controller: WebViewController()
                  ..setJavaScriptMode(JavaScriptMode.unrestricted)
                  ..loadHtmlString(_previewHtml),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
