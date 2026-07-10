import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

// Added a comment to trigger a change
import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';
import 'services/auth_service.dart';
import 'auth/login_screen.dart';

void main() => runApp(const SuperBrowserApp());

class SuperBrowserApp extends StatelessWidget {
  const SuperBrowserApp({super.key});
  @override
  Widget build(BuildContext context) => const MaterialApp(home: AuthWrapper());
}

class AuthWrapper extends StatefulWidget {
  const AuthWrapper({super.key});
  @override
  State<AuthWrapper> createState() => _AuthWrapperState();
}

class _AuthWrapperState extends State<AuthWrapper> {
  final _authService = AuthService();
  bool? _isLoggedIn;

  @override
  void initState() {
    super.initState();
    _checkAuth();
  }

  Future<void> _checkAuth() async {
    final token = await _authService.getToken();
    setState(() => _isLoggedIn = token != null);
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoggedIn == null) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    return _isLoggedIn! ? const BrowserScreen() : const LoginScreen();
  }
}

class BrowserScreen extends StatefulWidget {
  const BrowserScreen({super.key});
  @override
  State<BrowserScreen> createState() => _BrowserScreenState();
}
...

class _BrowserScreenState extends State<BrowserScreen> {
  late final WebViewController _controller;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setNavigationDelegate(
        NavigationDelegate(
          onWebResourceError: (WebResourceError error) {
            debugPrint('WebView error: ${error.description}');
          },
        ),
      )
      ..loadRequest(Uri.parse('https://diversity-recommended-spine-helmet.trycloudflare.com'));
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