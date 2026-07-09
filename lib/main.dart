import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:webview_flutter/webview_flutter.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';
import 'package:share_plus/share_plus.dart';
import 'package:path_provider/path_provider.dart';
import 'package:archive/archive.dart';
import 'dart:convert';
import 'dart:io';

void main() {
  runApp(const AIEvoApp());
}

class AIEvoApp extends StatelessWidget {
  const AIEvoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AI Evo App Builder',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF121212),
        primaryColor: Colors.blueAccent,
        colorScheme: const ColorScheme.dark(
          primary: Colors.blueAccent,
          secondary: Colors.cyanAccent,
        ),
      ),
      home: const MainScreen(),
    );
  }
}

class ChatMessage {
  final String text;
  final bool isUser;
  ChatMessage({required this.text, required this.isUser});
}

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  final TextEditingController _controller = TextEditingController();
  final List<ChatMessage> _messages = [];
  late final WebViewController _webViewController;
  String? _userId;
  String _currentHtml = '<html><body><h2 style="color:white;text-align:center;margin-top:50px;">Preview App</h2></body></html>';
  Map<String, dynamic>? _projectData;
  List<dynamic>? _files;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _initUserId();
    _webViewController = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setBackgroundColor(const Color(0x00000000))
      ..loadHtmlString(_currentHtml);
  }

  Future<void> _initUserId() async {
    final prefs = await SharedPreferences.getInstance();
    String? id = prefs.getString('user_id');
    if (id == null) {
      id = const Uuid().v4();
      await prefs.setString('user_id', id);
    }
    setState(() {
      _userId = id;
    });
  }

  Future<void> _sendPrompt() async {
    if (_controller.text.isEmpty || _isLoading) return;

    final prompt = _controller.text;
    setState(() {
      _messages.add(ChatMessage(text: prompt, isUser: true));
      _isLoading = true;
    });
    _controller.clear();

    try {
      final response = await http.post(
        Uri.parse('http://168.110.223.212:7777/v1/chat/completions'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'user_id': _userId,
          'prompt': prompt,
          'target_platform': 'flutter',
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final aiResponse = data['choices']?[0]?['message']?['content'] ?? 'No response';
        final html = data['ui_preview_html'] ?? '';
        
        setState(() {
          _messages.add(ChatMessage(text: aiResponse, isUser: false));
          _currentHtml = html;
          _projectData = data['project_data'];
          _files = data['files'];
          if (html.isNotEmpty) {
            _webViewController.loadHtmlString(html);
          }
        });
      } else {
        _showError('Error: ${response.statusCode}');
      }
    } catch (e) {
      _showError('Connection error: $e');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg)));
  }

  Future<void> _saveProject() async {
    if (_projectData == null) return;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('saved_project', jsonEncode(_projectData));
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Project Saved!')));
  }

  Future<void> _loadProject() async {
    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getString('saved_project');
    if (data != null) {
      setState(() {
        _projectData = jsonDecode(data);
      });
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Project Loaded!')));
    }
  }

  Future<void> _exportZip() async {
    if (_files == null || _files!.isEmpty) {
      _showError('No files to export');
      return;
    }

    try {
      final encoder = ZipEncoder();
      final archive = Archive();

      for (var file in _files!) {
        final path = file['path'] as String;
        final content = file['content'] as String;
        final bytes = utf8.encode(content);
        archive.addFile(ArchiveFile(path, bytes.length, bytes));
      }

      final zipData = encoder.encode(archive);
      if (zipData == null) return;

      final tempDir = await getTemporaryDirectory();
      final zipFile = File('${tempDir.path}/project.zip');
      await zipFile.writeAsBytes(zipData);

      await Share.shareXFiles([XFile(zipFile.path)], text: 'Exported AI Evo Project');
    } catch (e) {
      _showError('Export failed: $e');
    }
  }

  Future<void> _upgradeVip() async {
    try {
      final response = await http.post(
        Uri.parse('http://168.110.223.212:7777/vip/subscribe'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'user_id': _userId}),
      );
      if (response.statusCode == 200) {
        _showError('Upgrade Successful!');
      } else {
        _showError('Upgrade failed');
      }
    } catch (e) {
      _showError('Error: $e');
    }
  }

  Widget _buildChat() {
    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: _messages.length,
            itemBuilder: (context, index) {
              final msg = _messages[index];
              return Align(
                alignment: msg.isUser ? Alignment.centerRight : Alignment.centerLeft,
                child: Container(
                  margin: const EdgeInsets.symmetric(vertical: 4),
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: msg.isUser ? Colors.blueAccent : Colors.grey[800],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(msg.text),
                ),
              );
            },
          ),
        ),
        if (_isLoading) const LinearProgressIndicator(),
        Padding(
          padding: const EdgeInsets.all(8.0),
          child: Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _controller,
                  decoration: const InputDecoration(
                    hintText: 'Describe your app...',
                    border: OutlineInputBorder(),
                  ),
                  onSubmitted: (_) => _sendPrompt(),
                ),
              ),
              IconButton(
                icon: const Icon(Icons.send),
                onPressed: _sendPrompt,
              ),
            ],
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Evo App Builder'),
        actions: [
          IconButton(icon: const Icon(Icons.save), onPressed: _saveProject),
          IconButton(icon: const Icon(Icons.file_open), onPressed: _loadProject),
          IconButton(icon: const Icon(Icons.download), onPressed: _exportZip),
          TextButton(
            onPressed: _upgradeVip,
            child: const Text('UPGRADE', style: TextStyle(color: Colors.amber)),
          ),
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          if (constraints.maxWidth > 800) {
            return Row(
              children: [
                Expanded(flex: 2, child: _buildChat()),
                const VerticalDivider(width: 1),
                Expanded(flex: 3, child: WebViewWidget(controller: _webViewController)),
              ],
            );
          } else {
            return _currentIndex == 0 
                ? _buildChat() 
                : WebViewWidget(controller: _webViewController);
          }
        },
      ),
      bottomNavigationBar: MediaQuery.of(context).size.width <= 800 
          ? BottomNavigationBar(
              currentIndex: _currentIndex,
              onTap: (index) => setState(() => _currentIndex = index),
              items: const [
                BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'Chat'),
                BottomNavigationBarItem(icon: Icon(Icons.preview), label: 'Preview'),
              ],
            ) 
          : null,
    );
  }

  int _currentIndex = 0;
}
