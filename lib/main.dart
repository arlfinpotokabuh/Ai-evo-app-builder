import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

// Added a comment to trigger a change
void main() => runApp(const SuperBrowserApp());

class SuperBrowserApp extends StatelessWidget {
  const SuperBrowserApp({super.key});
  @override
  Widget build(BuildContext context) => const MaterialApp(home: BrowserScreen());
}

class BrowserScreen extends StatefulWidget {
  const BrowserScreen({super.key});
  @override
  State<BrowserScreen> createState() => _BrowserScreenState();
}

class _BrowserScreenState extends State<BrowserScreen> {
  late final WebViewController _controller;
  final TextEditingController _urlController = TextEditingController(text: 'https://google.com');

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(Uri.parse('https://ais-dev-ybd3jbe7c4t4q6mib2dqqq-915540977151.asia-southeast1.run.app'));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Evo App Builder'),
        actions: [IconButton(icon: const Icon(Icons.refresh), onPressed: () => _controller.reload())],
      ),
      body: WebViewWidget(controller: _controller),
    );
  }
}