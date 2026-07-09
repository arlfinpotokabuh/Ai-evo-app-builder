import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Code2,
  Plus,
  Trash2,
  Send,
  Copy,
  Check,
  RotateCcw,
  Settings,
  AlertTriangle,
  Smartphone,
  Play,
  FileCode,
  Folder,
  Terminal,
  ArrowRight,
  Download,
  Cpu,
  Layers,
  Wifi,
  CheckCircle2,
  XCircle,
  X,
  FileText,
  Save,
  ChevronRight,
  Loader2,
  HelpCircle,
  GitBranch,
  HardDrive,
  Gauge,
  Sliders,
  Github,
  MessageSquare
} from "lucide-react";
import AiStudioAppsDashboard from "./components/AiStudioAppsDashboard";

// Project Type definitions
interface Project {
  id: string;
  name: string;
  description: string;
  mainDart: string;
  pubspec: string;
  type: "todo" | "counter" | "weather" | "calculator" | "custom";
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  isError?: boolean;
  timestamp: Date;
  codeBlock?: {
    language: string;
    code: string;
  };
}

// Default flutter templates
const TEMPLATE_BROWSER_DART = `import 'package:flutter/material.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() => runApp(const BrowserApp());

class BrowserApp extends StatelessWidget {
  const BrowserApp({super.key});
  @override
  Widget build(BuildContext context) => const MaterialApp(home: BrowserScreen());
}

class BrowserScreen extends StatefulWidget {
  const BrowserScreen({super.key});
  @override
  State<BrowserScreen> createState() => _BrowserScreenState();
}

class _BrowserScreenState extends State<BrowserScreen> {
  late WebViewController _controller;
  final TextEditingController _urlController = TextEditingController(text: 'https://flutter.dev');

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..loadRequest(Uri.parse('https://flutter.dev'));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _urlController,
          decoration: const InputDecoration(hintText: 'Enter URL', border: InputBorder.none),
          onSubmitted: (value) => _controller.loadRequest(Uri.parse(value.startsWith('http') ? value : 'https://$value')),
        ),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: () => _controller.reload()),
        ],
      ),
      body: WebViewWidget(controller: _controller),
    );
  }
}
`;
const TEMPLATE_COUNTER_DART = `import 'package:flutter/material.dart';

void main() {
  runApp(const CounterApp());
}

class CounterApp extends StatelessWidget {
  const CounterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.teal),
        useMaterial3: true,
      ),
      home: const CounterHomePage(),
    );
  }
}

class CounterHomePage extends StatefulWidget {
  const CounterHomePage({super.key});

  @override
  State<CounterHomePage> createState() => _CounterHomePageState();
}

class _CounterHomePageState extends State<CounterHomePage> {
  int _counter = 0;

  void _increment() => setState(() => _counter++);
  void _decrement() => setState(() => _counter > 0 ? _counter-- : 0);
  void _reset() => setState(() => _counter = 0);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Evo Counter'),
        backgroundColor: Colors.teal.shade100,
        centerTitle: true,
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('You have tapped the button:', style: TextStyle(fontSize: 16)),
            Text(
              '$_counter',
              style: const TextStyle(fontSize: 72, fontWeight: FontWeight.bold, color: Colors.teal),
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ElevatedButton.icon(
                  onPressed: _decrement,
                  icon: const Icon(Icons.remove),
                  label: const Text('Less'),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.red.shade50),
                ),
                const SizedBox(width: 12),
                ElevatedButton.icon(
                  onPressed: _reset,
                  icon: const Icon(Icons.refresh),
                  label: const Text('Reset'),
                ),
                const SizedBox(width: 12),
                ElevatedButton.icon(
                  onPressed: _increment,
                  icon: const Icon(Icons.add),
                  label: const Text('Add'),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.teal.shade50),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }
}`;

const TEMPLATE_TODO_DART = `import 'package:flutter/material.dart';

void main() {
  runApp(const TodoApp());
}

class TodoApp extends StatelessWidget {
  const TodoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.indigo),
      home: const TodoListPage(),
    );
  }
}

class TodoListPage extends StatefulWidget {
  const TodoListPage({super.key});

  @override
  State<TodoListPage> createState() => _TodoListPageState();
}

class _TodoListPageState extends State<TodoListPage> {
  final List<String> _todos = ['Learn Flutter basics', 'Design app with AI Evo Builder', 'Build release APK'];
  final TextEditingController _controller = TextEditingController();

  void _addTodo() {
    if (_controller.text.trim().isNotEmpty) {
      setState(() {
        _todos.add(_controller.text.trim());
        _controller.clear();
      });
    }
  }

  void _removeTodo(int index) {
    setState(() => _todos.removeAt(index));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Tasks Manager'),
        centerTitle: true,
        backgroundColor: Colors.indigo,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(
                      labelText: 'Add a new task...',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _addTodo,
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.indigo, padding: const EdgeInsets.all(16)),
                  child: const Icon(Icons.add, color: Colors.white),
                ),
              ],
            ),
          ),
          Expanded(
            child: _todos.isEmpty
                ? const Center(child: Text('All caught up! 🎉'))
                : ListView.builder(
                    itemCount: _todos.length,
                    itemBuilder: (context, index) {
                      return ListTile(
                        leading: const Icon(Icons.check_box_outline_blank, color: Colors.indigo),
                        title: Text(_todos[index]),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete, color: Colors.redAccent),
                          onPressed: () => _removeTodo(index),
                        ),
                      );
                    },
                  ),
          )
        ],
      ),
    );
  }
}`;

const TEMPLATE_WEATHER_DART = `import 'package:flutter/material.dart';

void main() {
  runApp(const WeatherApp());
}

class WeatherApp extends StatelessWidget {
  const WeatherApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const WeatherDashboard(),
    );
  }
}

class WeatherDashboard extends StatefulWidget {
  const WeatherDashboard({super.key});

  @override
  State<WeatherDashboard> createState() => _WeatherDashboardState();
}

class _WeatherDashboardState extends State<WeatherDashboard> {
  String _city = 'Jakarta';
  double _temp = 31.5;
  String _condition = 'Partly Cloudy';

  void _searchCity(String input) {
    setState(() {
      _city = input;
      // Simulated variations based on letters
      if (input.toLowerCase().contains('london')) {
        _temp = 16.0;
        _condition = 'Overcast & Rainy';
      } else if (input.toLowerCase().contains('tokyo')) {
        _temp = 22.0;
        _condition = 'Sunny Skies';
      } else {
        _temp = 28.0 + (input.length % 5);
        _condition = 'Sunny Interval';
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.lightBlue.shade50,
      appBar: AppBar(title: const Text('Evo Weather Live'), centerTitle: true),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              onSubmitted: _searchCity,
              decoration: const InputDecoration(
                hintText: 'Enter city name (e.g. London, Tokyo)...',
                suffixIcon: Icon(Icons.search),
                border: OutlineInputBorder(),
                filled: true,
                fillColor: Colors.white,
              ),
            ),
            const SizedBox(height: 60),
            Text(_city, style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            Text(_condition, style: TextStyle(fontSize: 18, color: Colors.blue.shade800)),
            const SizedBox(height: 20),
            Text('\${_temp.toStringAsFixed(1)}°C', style: const TextStyle(fontSize: 64, fontWeight: FontWeight.w100)),
            const SizedBox(height: 40),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStat(Icons.water_drop, '65%', 'Humidity'),
                _buildStat(Icons.wind_power, '12 km/h', 'Wind'),
              ],
            )
          ],
        ),
      ),
    );
  }

  Widget _buildStat(IconData icon, String val, String label) {
    return Column(
      children: [
        Icon(icon, color: Colors.blue),
        const SizedBox(height: 4),
        Text(val, style: const TextStyle(fontWeight: FontWeight.bold)),
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ],
    );
  }
}`;

const TEMPLATE_CALCULATOR_DART = `import 'package:flutter/material.dart';

void main() => runApp(const CalcApp());

class CalcApp extends StatelessWidget {
  const CalcApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      debugShowCheckedModeBanner: false,
      home: CalculatorScreen(),
    );
  }
}

class CalculatorScreen extends StatefulWidget {
  const CalculatorScreen({super.key});

  @override
  State<CalculatorScreen> createState() => _CalculatorScreenState();
}

class _CalculatorScreenState extends State<CalculatorScreen> {
  String _display = '0';
  double? _firstValue;
  String? _operator;
  bool _shouldClear = false;

  void _onPressed(String label) {
    setState(() {
      if (label == 'C') {
        _display = '0';
        _firstValue = null;
        _operator = null;
        _shouldClear = false;
      } else if (['+', '-', '*', '/'].contains(label)) {
        _firstValue = double.tryParse(_display);
        _operator = label;
        _shouldClear = true;
      } else if (label == '=') {
        if (_firstValue != null && _operator != null) {
          double secondValue = double.tryParse(_display) ?? 0;
          double result = 0;
          switch (_operator) {
            case '+': result = _firstValue! + secondValue; break;
            case '-': result = _firstValue! - secondValue; break;
            case '*': result = _firstValue! * secondValue; break;
            case '/': result = secondValue == 0 ? 0 : _firstValue! / secondValue; break;
          }
          _display = result.toString().endsWith('.0') 
              ? result.toInt().toString() 
              : result.toStringAsFixed(2);
          _firstValue = null;
          _operator = null;
        }
      } else {
        if (_display == '0' || _shouldClear) {
          _display = label;
          _shouldClear = false;
        } else {
          _display += label;
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: Container(
                alignment: Alignment.bottomRight,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                child: Text(
                  _display,
                  style: const TextStyle(fontSize: 64, color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
            ),
            _buildKeypad(),
          ],
        ),
      ),
    );
  }

  Widget _buildKeypad() {
    final buttons = [
      ['7', '8', '9', '/'],
      ['4', '5', '6', '*'],
      ['1', '2', '3', '-'],
      ['C', '0', '=', '+'],
    ];
    return Column(
      children: buttons.map((row) {
        return Row(
          children: row.map((btn) {
            final isOperator = ['/', '*', '-', '+', '='].contains(btn);
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.all(4.0),
                child: AspectRatio(
                  aspectRatio: 1.2,
                  child: ElevatedButton(
                    onPressed: () => _onPressed(btn),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isOperator ? Colors.orange : Colors.grey.shade800,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    child: Text(btn, style: const TextStyle(fontSize: 24, color: Colors.white)),
                  ),
                ),
              ),
            );
          }).toList(),
        );
      }).toList(),
    );
  }
}`;

const DEFAULT_PUBSPEC = `name: ai_evo_app_builder
description: AI Evo App Builder (Stable Build)
version: 1.0.0+1
environment:
  sdk: ">=3.0.0 <4.0.0"
dependencies:
  flutter:
    sdk: flutter
  http: ^1.1.0
  webview_flutter: ^4.8.0
  shared_preferences: ^2.3.2
  uuid: ^4.2.1
  share_plus: ^10.0.0
  path_provider: ^2.1.4
  archive: ^3.4.10
  in_app_purchase: ^3.2.0
  intl: ^0.19.0
  sqflite: ^2.3.3
  path: ^1.9.0`;

export default function App() {
  // Global states (client-side persisted)
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem("ai_evo_projects");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved projects", e);
      }
    }
    return [
      {
        id: "counter",
        name: "Browser App",
        description: "Browser App",
        mainDart: TEMPLATE_BROWSER_DART,
        pubspec: DEFAULT_PUBSPEC,
        type: "browser"
      },
      {
        id: "todo",
        name: "Evo Task List",
        description: "A collaborative task list manager styled in standard Material Design.",
        mainDart: TEMPLATE_TODO_DART,
        pubspec: DEFAULT_PUBSPEC,
        type: "todo"
      },
      {
        id: "weather",
        name: "Live Weather Widget",
        description: "A gorgeous weather forecasting dashboard supporting active queries.",
        mainDart: TEMPLATE_WEATHER_DART,
        pubspec: DEFAULT_PUBSPEC,
        type: "weather"
      },
      {
        id: "calculator",
        name: "Matte Black Calculator",
        description: "Fully interactive math computing grid styled like an elegant handheld calculator.",
        mainDart: TEMPLATE_CALCULATOR_DART,
        pubspec: DEFAULT_PUBSPEC,
        type: "calculator"
      }
    ];
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    return localStorage.getItem("ai_evo_active_project_id") || "counter";
  });

  const [activeTab, setActiveTab] = useState<"preview" | "code" | "pubspec" | "github" | "hardware">("preview");

  const [viewMode, setViewMode] = useState<"playground" | "dashboard">(() => {
    return (localStorage.getItem("ai_evo_view_mode") as "playground" | "dashboard") || "dashboard";
  });

  const [mobileActiveTab, setMobileActiveTab] = useState<"chat" | "preview" | "sidebar">("preview");

  useEffect(() => {
    localStorage.setItem("ai_evo_view_mode", viewMode);
  }, [viewMode]);

  // Model & AI Parameter Settings (client-side persisted)
  const [selectedModel, setSelectedModel] = useState<string>(() => localStorage.getItem("ai_evo_selected_model") || "gemini-3.5-flash");
  const [useCustomAiServer, setUseCustomAiServer] = useState<boolean>(() => {
    const v = localStorage.getItem("ai_evo_use_custom_ai_server");
    return v === "true";
  });
  const [customAiServerUrl, setCustomAiServerUrl] = useState<string>(() => {
    return localStorage.getItem("ai_evo_custom_ai_url") || "168.110.223.212:7777";
  });
  const [temperature, setTemperature] = useState<number>(() => {
    const v = localStorage.getItem("ai_evo_temperature");
    return v ? parseFloat(v) : 0.7;
  });
  const [topP, setTopP] = useState<number>(() => {
    const v = localStorage.getItem("ai_evo_top_p");
    return v ? parseFloat(v) : 0.95;
  });
  const [topK, setTopK] = useState<number>(() => {
    const v = localStorage.getItem("ai_evo_top_k");
    return v ? parseInt(v) : 40;
  });
  const [maxOutputTokens, setMaxOutputTokens] = useState<number>(() => {
    const v = localStorage.getItem("ai_evo_max_tokens");
    return v ? parseInt(v) : 2048;
  });
  const [systemInstruction, setSystemInstruction] = useState<string>(() => {
    return localStorage.getItem("ai_evo_system_instruction") || "";
  });

  // Collapsible state for Hardware stats panel
  const [isHardwarePanelOpen, setIsHardwarePanelOpen] = useState<boolean>(() => {
    const v = localStorage.getItem("ai_evo_hardware_panel_open");
    return v === null ? true : v === "true";
  });

  // GitHub Integration Settings (client-side persisted)
  const [githubRepo, setGithubRepo] = useState<string>(() => localStorage.getItem("ai_evo_github_repo") || "username/my-flutter-app");
  const [githubBranch, setGithubBranch] = useState<string>(() => localStorage.getItem("ai_evo_github_branch") || "main");
  const [githubToken, setGithubToken] = useState<string>(() => localStorage.getItem("ai_evo_github_token") || "");
  const [isGithubSyncing, setIsGithubSyncing] = useState(false);
  const [githubLogs, setGithubLogs] = useState<string[]>([]);
  const [githubSyncStatus, setGithubSyncStatus] = useState<"idle" | "success" | "failed">("idle");

  // Hardware Performance & Diagnostics
  const [fps, setFps] = useState<number>(60);
  const [cpuThreads, setCpuThreads] = useState<number>(8);
  const [gpuName, setGpuName] = useState<string>("Detecting GPU Accelerator...");
  const [deviceRam, setDeviceRam] = useState<string>("Detecting System Memory...");
  const [storageUsage, setStorageUsage] = useState<number>(0);
  const [storageQuota, setStorageQuota] = useState<number>(0);
  const [jsHeapUsed, setJsHeapUsed] = useState<number>(0);
  const [jsHeapTotal, setJsHeapTotal] = useState<number>(0);
  const [jsHeapLimit, setJsHeapLimit] = useState<number>(0);
  const [benchmarkResult, setBenchmarkResult] = useState<{ score: number; mflops: string; grade: string } | null>(null);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  // Chat states (client-side persisted)
  const [chatHistory, setChatHistory] = useState<Record<string, Message[]>>(() => {
    const saved = localStorage.getItem("ai_evo_chat_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const converted: Record<string, Message[]> = {};
        Object.keys(parsed).forEach((projId) => {
          if (Array.isArray(parsed[projId])) {
            converted[projId] = parsed[projId].map((msg: any) => ({
              ...msg,
              timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
            }));
          }
        });
        return converted;
      } catch (e) {
        console.error("Failed to parse saved chat history, using fallback.", e);
      }
    }
    return {
      counter: [
        {
          id: "msg-1",
          sender: "ai",
          text: "Halo! Saya adalah **AI Evo App Builder**. Proyek *Smart Counter App* Anda telah termuat. Anda bisa meminta saya untuk memodifikasi layout, menambah fungsionalitas, atau mengubah skema warna. Coba tanyakan sesuatu!",
          timestamp: new Date()
        }
      ],
      todo: [
        {
          id: "msg-1",
          sender: "ai",
          text: "Selamat datang di *Evo Task List*! Proyek ini menggunakan penyimpanan state internal untuk mendaftar tugas-tugas Anda. Ingin saya menambahkan fitur prioritas tugas atau kategori?",
          timestamp: new Date()
        }
      ],
      weather: [
        {
          id: "msg-1",
          sender: "ai",
          text: "Sistem prakiraan cuaca siap dikembangkan. Anda bisa mencari 'Tokyo', 'London', atau kota apa saja untuk melihat demo simulasi cuaca yang responsif. Beritahu saya fitur apa yang ingin Anda tambahkan selanjutnya!",
          timestamp: new Date()
        }
      ],
      calculator: [
        {
          id: "msg-1",
          sender: "ai",
          text: "Kalkulator Matte Black Anda telah siap. Semua operasi matematika (+, -, *, /) sudah aktif. Apakah Anda ingin menambahkan penghitungan persentase atau tombol akar kuadrat?",
          timestamp: new Date()
        }
      ]
    };
  });

  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiStage, setAiStage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Simulated failure flag to test error components easily
  const [simulateFailure, setSimulateFailure] = useState(false);

  // File system states (connected to server APIs)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Modal / Build APK overlays
  const [isBuildOverlayOpen, setIsBuildOverlayOpen] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildStage, setBuildStage] = useState("");
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [buildStatus, setBuildStatus] = useState<"idle" | "building" | "success" | "failed">("idle");

  // New Project Dialog States
  const [isNewProjOpen, setIsNewProjOpen] = useState(false);
  const [newProjName, setNewProjName] = useState("");
  const [newProjType, setNewProjType] = useState<Project["type"]>("counter");

  // Custom confirmation modal states
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [projectToOverwrite, setProjectToOverwrite] = useState<Project | null>(null);

  // Reference for scrolling chat
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Active project helper
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Load real files from physical disk on mount / change project
  useEffect(() => {
    fetchProjectFiles();
  }, [activeProjectId]);

  // Persist Workspace Projects to LocalStorage
  useEffect(() => {
    localStorage.setItem("ai_evo_projects", JSON.stringify(projects));
  }, [projects]);

  // Persist Active Project ID to LocalStorage
  useEffect(() => {
    localStorage.setItem("ai_evo_active_project_id", activeProjectId);
  }, [activeProjectId]);

  // Persist Chat History to LocalStorage
  useEffect(() => {
    localStorage.setItem("ai_evo_chat_history", JSON.stringify(chatHistory));
  }, [chatHistory]);

  // Persist Model Settings to LocalStorage
  useEffect(() => {
    localStorage.setItem("ai_evo_selected_model", selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem("ai_evo_use_custom_ai_server", useCustomAiServer ? "true" : "false");
  }, [useCustomAiServer]);

  useEffect(() => {
    localStorage.setItem("ai_evo_custom_ai_url", customAiServerUrl);
  }, [customAiServerUrl]);

  useEffect(() => {
    localStorage.setItem("ai_evo_temperature", temperature.toString());
  }, [temperature]);

  useEffect(() => {
    localStorage.setItem("ai_evo_top_p", topP.toString());
  }, [topP]);

  useEffect(() => {
    localStorage.setItem("ai_evo_top_k", topK.toString());
  }, [topK]);

  useEffect(() => {
    localStorage.setItem("ai_evo_max_tokens", maxOutputTokens.toString());
  }, [maxOutputTokens]);

  useEffect(() => {
    localStorage.setItem("ai_evo_system_instruction", systemInstruction);
  }, [systemInstruction]);

  // Persist Hardware Panel State to LocalStorage
  useEffect(() => {
    localStorage.setItem("ai_evo_hardware_panel_open", isHardwarePanelOpen ? "true" : "false");
  }, [isHardwarePanelOpen]);

  // Persist GitHub Settings to LocalStorage
  useEffect(() => {
    localStorage.setItem("ai_evo_github_repo", githubRepo);
  }, [githubRepo]);

  useEffect(() => {
    localStorage.setItem("ai_evo_github_branch", githubBranch);
  }, [githubBranch]);

  useEffect(() => {
    localStorage.setItem("ai_evo_github_token", githubToken);
  }, [githubToken]);

  // Real-time FPS Performance frame calculations
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animId: number;

    const tick = () => {
      frameCount++;
      const now = performance.now();
      const delta = now - lastTime;
      if (delta >= 1000) {
        setFps(Math.round((frameCount * 1000) / delta));
        frameCount = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Detect and monitor CPU Cores, WebGL Graphic Processor, Local storage disk and RAM capacity
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
      if (gl) {
        const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
        if (debugInfo) {
          setGpuName(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "WebGL Generic Renderer");
        } else {
          setGpuName("WebGL Hardware Standard");
        }
      } else {
        setGpuName("Software Rasterizer / Core Graphics");
      }
    } catch (e) {
      setGpuName("Standard GPU Acceleration");
    }

    if (navigator.hardwareConcurrency) {
      setCpuThreads(navigator.hardwareConcurrency);
    }

    if ((navigator as any).deviceMemory) {
      setDeviceRam(`${(navigator as any).deviceMemory} GB`);
    } else {
      setDeviceRam("Est. 8 - 16 GB (Sandboxed)");
    }

    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((est) => {
        setStorageUsage(est.usage || 0);
        setStorageQuota(est.quota || 0);
      });
    }

    const interval = setInterval(() => {
      const perf = (performance as any).memory;
      if (perf) {
        setJsHeapUsed(perf.usedJSHeapSize);
        setJsHeapTotal(perf.totalJSHeapSize);
        setJsHeapLimit(perf.jsHeapSizeLimit);
      } else {
        // Safe animated estimates for Safari/Firefox
        setJsHeapUsed(Math.round(48 * 1024 * 1024 + Math.random() * 6 * 1024 * 1024));
        setJsHeapTotal(Math.round(85 * 1024 * 1024));
        setJsHeapLimit(Math.round(2048 * 1024 * 1024));
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // CPU Mathematical Core Benchmark
  const runCpuBenchmark = () => {
    setIsBenchmarking(true);
    setBenchmarkResult(null);

    setTimeout(() => {
      const start = performance.now();
      let primesCount = 0;
      const limit = 50000;
      
      for (let i = 2; i <= limit; i++) {
        let isPrime = true;
        for (let j = 2; j <= Math.sqrt(i); j++) {
          if (i % j === 0) {
            isPrime = false;
            break;
          }
        }
        if (isPrime) primesCount++;
      }

      const end = performance.now();
      const durationMs = end - start;
      const score = Math.round((limit * limit) / (durationMs || 1) / 10);
      const mflops = ((limit * 100) / (durationMs || 1) / 1000).toFixed(2);

      let grade = "Premium Core (A+)";
      if (durationMs > 120) grade = "Highly Capable (A)";
      else if (durationMs > 250) grade = "Balanced Core (B)";
      else if (durationMs > 500) grade = "Standard Processor (C)";

      setBenchmarkResult({ score, mflops, grade });
      setIsBenchmarking(false);
    }, 500);
  };

  // GitHub Live Synchronization
  const handleGithubSync = async () => {
    if (!githubRepo.includes("/")) {
      alert("Format repositori tidak valid. Gunakan format 'username/nama-repositori'.");
      return;
    }

    setIsGithubSyncing(true);
    setGithubSyncStatus("idle");
    setGithubLogs([
      `[GIT] Memulai sinkronisasi workspace ke repositori GitHub...`,
      `[GIT] Target repositori: https://github.com/${githubRepo}.git`,
      `[GIT] Target cabang: ${githubBranch}`
    ]);

    if (githubToken && githubToken.startsWith("ghp_")) {
      try {
        const headers = {
          "Authorization": `token ${githubToken}`,
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json"
        };

        const syncFile = async (pathName: string, contentStr: string) => {
          setGithubLogs((prev) => [...prev, `[GIT] Mengambil status berkas remote '${pathName}'...`]);
          let sha: string | null = null;
          try {
            const getRes = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${pathName}?ref=${githubBranch}`, { headers });
            if (getRes.ok) {
              const fileData = await getRes.json();
              sha = fileData.sha;
              setGithubLogs((prev) => [...prev, `[GIT] Berkas remote '${pathName}' ditemukan (SHA: ${sha?.slice(0, 7)}).`]);
            } else if (getRes.status !== 404) {
              const errJson = await getRes.json();
              throw new Error(errJson.message || "Gagal memeriksa ketersediaan berkas.");
            } else {
              setGithubLogs((prev) => [...prev, `[GIT] Berkas remote '${pathName}' belum ada. Berkas baru akan dibuat.`]);
            }
          } catch (e: any) {
            console.warn("Retrying file write directly:", e);
          }

          setGithubLogs((prev) => [...prev, `[GIT] Melakukan komit berkas remote '${pathName}'...`]);
          const base64Content = btoa(unescape(encodeURIComponent(contentStr)));
          const payload: any = {
            message: `Update ${pathName} via AI Evo App Builder`,
            content: base64Content,
            branch: githubBranch
          };
          if (sha) {
            payload.sha = sha;
          }

          const putRes = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${pathName}`, {
            method: "PUT",
            headers,
            body: JSON.stringify(payload)
          });

          if (!putRes.ok) {
            const errJson = await putRes.json();
            throw new Error(errJson.message || `Gagal menulis berkas ${pathName}`);
          }

          setGithubLogs((prev) => [...prev, `[GIT] Berkas '${pathName}' berhasil disinkronisasikan secara nyata!`]);
        };

        await syncFile("lib/main.dart", activeProject.mainDart);
        await syncFile("pubspec.yaml", activeProject.pubspec);

        setGithubLogs((prev) => [
          ...prev,
          `[GIT] 🎉 SINKRONISASI SELESAI SECARA NYATA!`,
          `[GIT] Periksa repositori Anda di: https://github.com/${githubRepo}`
        ]);
        setGithubSyncStatus("success");
      } catch (err: any) {
        console.error("Real GitHub Sync Error:", err);
        setGithubLogs((prev) => [
          ...prev,
          `[GIT] ❌ KESALAHAN SINKRONISASI API: ${err.message}`,
          `[GIT] Pastikan token akses (PAT) valid dan cakupan repo diaktifkan.`
        ]);
        setGithubSyncStatus("failed");
      } finally {
        setIsGithubSyncing(false);
      }
    } else {
      const simulationStages = [
        { msg: "Memverifikasi kredensial lokal...", log: "Menggunakan kredensial cache lokal... Mode Simulasi Aktif." },
        { msg: "Membaca pohon revisi lokal (git init)...", log: "Repository git lokal siap." },
        { msg: "Membandingkan perbedaan kode (git diff)...", log: "Dua berkas terdeteksi berubah: lib/main.dart, pubspec.yaml." },
        { msg: "Membuat komit baru (git commit)...", log: "Komit [main d03a11b] 'Sync changes from AI Evo Builder' berhasil dibuat." },
        { msg: "Menghubungi server remote GitHub (git remote)...", log: "Terhubung ke gateway API GitHub." },
        { msg: "Mengirimkan data berkas terkompresi (git push)...", log: "Mengirimkan objek... Kompresi delta berhasil dilakukan." },
        { msg: "Memicu alur kerja integrasi (GitHub Actions trigger)...", log: "Memicu workflow Flutter CI/CD APK Builder secara dinamis!" }
      ];

      let currentIdx = 0;
      const interval = setInterval(() => {
        if (currentIdx < simulationStages.length) {
          const item = simulationStages[currentIdx];
          setGithubLogs((prev) => [...prev, `[GIT] ${item.msg}`, `[SHELL] ${item.log}`]);
          currentIdx++;
        } else {
          clearInterval(interval);
          setGithubLogs((prev) => [
            ...prev,
            `[GIT] 🎉 SINKRONISASI SIMULASI SELESAI!`,
            `[GIT] Kunjungi tab CI/CD untuk compile & unduh APK.`
          ]);
          setGithubSyncStatus("success");
          setIsGithubSyncing(false);
        }
      }, 1000);
    }
  };

  const fetchProjectFiles = async () => {
    try {
      const response = await fetch("/api/project/files");
      if (response.ok) {
        const data = await response.json();
        // Overwrite the first project or current project mainDart and pubspec with the physical files
        if (data.mainDart && data.pubspec) {
          setProjects((prev) =>
            prev.map((proj) => {
              if (proj.id === activeProjectId) {
                return {
                  ...proj,
                  mainDart: data.mainDart,
                  pubspec: data.pubspec
                };
              }
              return proj;
            })
          );
        }
      }
    } catch (error) {
      console.warn("Could not retrieve real files from server (using templates as fallback).", error);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, activeProjectId, isProcessing]);

  // Handle saving current project files back to disk
  const saveProjectToDisk = async (dartCode?: string, specCode?: string) => {
    setIsSaving(true);
    try {
      const payload = {
        mainDart: dartCode !== undefined ? dartCode : activeProject.mainDart,
        pubspec: specCode !== undefined ? specCode : activeProject.pubspec
      };

      const response = await fetch("/api/project/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setHasUnsavedChanges(false);
      } else {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to save to disk");
      }
    } catch (err: any) {
      console.error("Save error:", err);
      alert("Error saving files: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Create new project with specific params (for Dashboard support)
  const handleCreateProjectWithParams = (name: string, type: Project["type"]) => {
    let defaultDart = TEMPLATE_COUNTER_DART;
    let desc = "Custom Flutter counter workspace";

    if (type === "todo") {
      defaultDart = TEMPLATE_TODO_DART;
      desc = "Custom Task manager workspace";
    } else if (type === "weather") {
      defaultDart = TEMPLATE_WEATHER_DART;
      desc = "Custom Weather monitor workspace";
    } else if (type === "calculator") {
      defaultDart = TEMPLATE_CALCULATOR_DART;
      desc = "Custom Calculator grid workspace";
    } else if (type === "custom") {
      defaultDart = `import 'package:flutter/material.dart';\n\nvoid main() => runApp(const CustomApp());\n\nclass CustomApp extends StatelessWidget {\n  const CustomApp({super.key});\n  @override\n  Widget build(BuildContext context) {\n    return const MaterialApp(home: Scaffold(body: Center(child: Text('Custom Workspace ready'))));\n  }\n}`;
      desc = "Fully blank custom sandbox workspace";
    }

    const newId = "proj-" + Date.now();
    const newProj: Project = {
      id: newId,
      name: name.trim(),
      description: desc,
      mainDart: defaultDart,
      pubspec: DEFAULT_PUBSPEC,
      type: type
    };

    setProjects((prev) => [...prev, newProj]);
    setChatHistory((prev) => ({
      ...prev,
      [newId]: [
        {
          id: `msg-init-${Date.now()}`,
          sender: "ai",
          text: `Halo! Selamat datang di proyek baru Anda: **${name}**.\n\nSaya telah mengatur struktur proyek dasar. Tuliskan ide aplikasi Anda di chat di bawah, dan saya akan menuliskan kode Flutter lengkapnya untuk Anda!`,
          timestamp: new Date()
        }
      ]
    }));

    setActiveProjectId(newId);
    setViewMode("playground");
    saveProjectToDisk(defaultDart, DEFAULT_PUBSPEC);
  };

  const handleOpenProjectDashboard = (id: string) => {
    setActiveProjectId(id);
    setViewMode("playground");
  };

  // Create new project
  const handleCreateProject = () => {
    if (!newProjName.trim()) return;

    let defaultDart = TEMPLATE_COUNTER_DART;
    let desc = "Custom Flutter counter workspace";

    if (newProjType === "todo") {
      defaultDart = TEMPLATE_TODO_DART;
      desc = "Custom Task manager workspace";
    } else if (newProjType === "weather") {
      defaultDart = TEMPLATE_WEATHER_DART;
      desc = "Custom Weather monitor workspace";
    } else if (newProjType === "calculator") {
      defaultDart = TEMPLATE_CALCULATOR_DART;
      desc = "Custom Calculator grid workspace";
    } else if (newProjType === "custom") {
      defaultDart = `import 'package:flutter/material.dart';\n\nvoid main() => runApp(const CustomApp());\n\nclass CustomApp extends StatelessWidget {\n  const CustomApp({super.key});\n  @override\n  Widget build(BuildContext context) {\n    return const MaterialApp(home: Scaffold(body: Center(child: Text('Custom Workspace ready'))));\n  }\n}`;
      desc = "Fully blank custom sandbox workspace";
    }

    const newId = "proj-" + Date.now();
    const newProj: Project = {
      id: newId,
      name: newProjName.trim(),
      description: desc,
      mainDart: defaultDart,
      pubspec: DEFAULT_PUBSPEC,
      type: newProjType
    };

    setProjects((prev) => [...prev, newProj]);
    setChatHistory((prev) => ({
      ...prev,
      [newId]: [
        {
          id: `msg-init-${Date.now()}`,
          sender: "ai",
          text: `Halo! Selamat datang di proyek baru Anda: **${newProjName}**.\n\nSaya telah mengatur struktur proyek dasar. Tuliskan ide aplikasi Anda di chat di bawah, dan saya akan menuliskan kode Flutter lengkapnya untuk Anda!`,
          timestamp: new Date()
        }
      ]
    }));

    setActiveProjectId(newId);
    setNewProjName("");
    setIsNewProjOpen(false);

    // Save newly created files to physical disk as well
    saveProjectToDisk(defaultDart, DEFAULT_PUBSPEC);
  };

  // Delete project
  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (projects.length <= 1) {
      alert("Anda harus mempertahankan minimal satu proyek di workspace.");
      return;
    }
    setProjectToDelete(id);
  };

  const confirmDeleteProject = () => {
    if (!projectToDelete) return;
    const remaining = projects.filter((p) => p.id !== projectToDelete);
    setProjects(remaining);
    if (activeProjectId === projectToDelete) {
      setActiveProjectId(remaining[0].id);
    }
    setProjectToDelete(null);
  };

  // Import / Load project from remote cloud server kustom
  const handleImportRemoteProject = (importedProj: Project) => {
    const exists = projects.some((p) => p.id === importedProj.id);
    if (exists) {
      setProjectToOverwrite(importedProj);
    } else {
      setProjects((prev) => [...prev, importedProj]);
      alert(`Proyek '${importedProj.name}' berhasil diimpor dari server remote!`);
      setActiveProjectId(importedProj.id);
      saveProjectToDisk(importedProj.mainDart, importedProj.pubspec);
    }
  };

  const confirmOverwriteProject = () => {
    if (!projectToOverwrite) return;
    setProjects((prev) => prev.map((p) => p.id === projectToOverwrite!.id ? projectToOverwrite! : p));
    setActiveProjectId(projectToOverwrite.id);
    saveProjectToDisk(projectToOverwrite.mainDart, projectToOverwrite.pubspec);
    setProjectToOverwrite(null);
    alert("Proyek berhasil diperbarui dari server remote!");
  };

  // Apply code block extracted from AI response
  const applyGeneratedCode = (code: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === activeProjectId ? { ...p, mainDart: code } : p))
    );
    setHasUnsavedChanges(true);
    saveProjectToDisk(code, undefined);
    
    // Force a minor state update if necessary, but changing the project
    // object in setProjects usually triggers re-render of components using activeProject.
  };

  // Parse chat content for code blocks
  const renderMessageContent = (msg: Message) => {
    const parts = msg.text.split(/(```dart[\s\S]*?```|```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      const isDart = part.startsWith("```dart");
      const isGenericCode = part.startsWith("```") && !isDart;

      if (isDart || isGenericCode) {
        // Extract raw code lines
        const codeLines = part
          .replace(/```dart\n?/, "")
          .replace(/```\n?/, "")
          .replace(/```$/, "")
          .trim();

        return (
          <div key={index} className="my-3 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-lg font-mono text-sm text-slate-100">
            <div className="flex items-center justify-between bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Code2 className="h-3.5 w-3.5 text-indigo-400" />
                {isDart ? "lib/main.dart (Flutter Code)" : "Source Code"}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(codeLines);
                    alert("Kode berhasil disalin!");
                  }}
                  className="flex items-center gap-1 hover:text-white transition-colors py-0.5 px-2 hover:bg-slate-700 rounded"
                >
                  <Copy className="h-3 w-3" />
                  Copy
                </button>
                {isDart && (
                  <button
                    onClick={() => applyGeneratedCode(codeLines)}
                    className="flex items-center gap-1 hover:text-emerald-400 transition-colors py-0.5 px-2 hover:bg-slate-700 rounded font-semibold text-emerald-300"
                  >
                    <Save className="h-3 w-3" />
                    Apply Code
                  </button>
                )}
              </div>
            </div>
            <pre className="p-4 overflow-x-auto text-xs leading-relaxed max-h-72">{codeLines}</pre>
          </div>
        );
      }

      // Format markdown bold asterisks simple replacements
      const boldFormatted = part.split(/\*\*(.*?)\*\*/g).map((sub, idx) => {
        if (idx % 2 === 1) {
          return <strong key={idx} className="font-semibold text-slate-900">{sub}</strong>;
        }
        // Format italic single asterisks simple replacements
        return sub.split(/\*(.*?)\*/g).map((sub2, idx2) => {
          if (idx2 % 2 === 1) {
            return <em key={idx2} className="italic">{sub2}</em>;
          }
          return sub2;
        });
      });

      return <p key={index} className="whitespace-pre-wrap leading-relaxed mb-1.5">{boldFormatted}</p>;
    });
  };

  // Run physical Flutter API or mock chat with Gemini
  const sendPresetMessage = async (promptText: string) => {
    if (isProcessing) return;
    const userText = promptText.trim();
    if (!userText) return;
    setErrorMessage(null);

    // Auto-update if code is detected
    if (userText.startsWith("import 'package:flutter/material.dart';")) {
      setProjects((prev) => prev.map((p) => p.id === activeProjectId ? { ...p, mainDart: userText } : p));
      saveProjectToDisk(userText, undefined);
    }

    // Append user message
    const userMsg: Message = {
      id: "msg-user-" + Date.now(),
      sender: "user",
      text: userText,
      timestamp: new Date()
    };

    setChatHistory((prev) => ({
      ...prev,
      [activeProjectId]: [...(prev[activeProjectId] || []), userMsg]
    }));

    // Start AI processing states with multiple stages to look incredibly responsive
    setIsProcessing(true);
    setAiStage("Analyzing request...");

    const stages = [
      "Initializing connection to Gemini API...",
      "Feeding app context and Dart codebase...",
      "Comparing current widget layout structures...",
      "Assembling compiler-safe updates...",
      "Finalizing response generation..."
    ];

    let currentStageIndex = 0;
    const stageTimer = setInterval(() => {
      if (currentStageIndex < stages.length) {
        setAiStage(stages[currentStageIndex]);
        currentStageIndex++;
      }
    }, 1200);

    try {
      // Call actual Server-Side Gemini endpoint
      const res = await fetch("/api/project/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          mainDart: activeProject.mainDart,
          pubspec: activeProject.pubspec,
          simulateError: simulateFailure, // Trigger simulated failure for testing
          model: selectedModel,
          temperature: temperature,
          systemInstructionOverride: systemInstruction,
          topP: topP,
          topK: topK,
          maxOutputTokens: maxOutputTokens,
          useCustomAiServer: useCustomAiServer,
          customAiServerUrl: customAiServerUrl
        })
      });

      clearInterval(stageTimer);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal menghubungi API server.");
      }

      const data = await res.json();
      const replyText = data.reply;

      // Start streaming simulation
      setAiStage("Streaming response...");
      
      const aiMsgId = "msg-ai-" + Date.now();
      
      // Add initial empty message
      const initialAiMsg: Message = {
        id: aiMsgId,
        sender: "ai",
        text: "",
        timestamp: new Date()
      };
      
      setChatHistory((prev) => ({
        ...prev,
        [activeProjectId]: [...(prev[activeProjectId] || []), initialAiMsg]
      }));

      const words = replyText.split(/(\s+)/);
      let currentWordIdx = 0;
      let currentText = "";

      const streamInterval = setInterval(() => {
        if (currentWordIdx < words.length) {
          currentText += words[currentWordIdx];
          currentWordIdx++;
          
          setChatHistory((prev) => {
            const list = prev[activeProjectId] || [];
            return {
              ...prev,
              [activeProjectId]: list.map((m) => m.id === aiMsgId ? { ...m, text: currentText } : m)
            };
          });
        } else {
          clearInterval(streamInterval);
          setIsProcessing(false);
          setAiStage("");
          
          // If response contains a Dart code block, highlight code tab and update code
          if (replyText.includes("```dart")) {
            const match = replyText.match(/```dart([\s\S]*?)```/);
            if (match && match[1]) {
              const newCode = match[1].trim();
              setProjects((prev) => prev.map((p) => p.id === activeProjectId ? { ...p, mainDart: newCode } : p));
              saveProjectToDisk(newCode, undefined);
              setActiveTab("code");
            }
          }
        }
      }, 15); // Fast, fluid streaming

    } catch (err: any) {
      clearInterval(stageTimer);
      console.error("AI Generation Error:", err);

      // Save error message state
      setErrorMessage(err.message || "Something went wrong during AI synthesis.");

      // Append an error message block into chat history
      const errorMsg: Message = {
        id: "msg-error-" + Date.now(),
        sender: "ai",
        isError: true,
        text: `**ERROR:** Gagal memproses permintaan.\n\n*Penyebab:* ${err.message || "Masalah koneksi atau konfigurasi API."}\n\nSilakan coba lagi atau matikan opsi "Simulasikan Error API" di menu samping.`,
        timestamp: new Date()
      };

      setChatHistory((prev) => ({
        ...prev,
        [activeProjectId]: [...(prev[activeProjectId] || []), errorMsg]
      }));
    } finally {
      setIsProcessing(false);
      setAiStage("");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isProcessing) return;

    const userText = inputMessage.trim();
    setInputMessage("");
    await sendPresetMessage(userText);
  };

  // Simulated active app elements inside the mobile preview frame
  const renderInteractivePreview = () => {
    switch (activeProject.type) {
      case "browser":
        return <BrowserAppPreview code={activeProject.mainDart} />;
      case "counter":
        return <CounterAppPreview code={activeProject.mainDart} />;
      case "todo":
        return <TodoAppPreview code={activeProject.mainDart} />;
      case "weather":
        return <WeatherAppPreview code={activeProject.mainDart} />;
      case "calculator":
        return <CalculatorAppPreview code={activeProject.mainDart} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-900 text-slate-200">
            <Smartphone className="h-16 w-16 text-indigo-400 mb-4 animate-bounce" />
            <h4 className="text-lg font-semibold text-white mb-2">Custom Sandbox UI</h4>
            <p className="text-xs text-slate-400 max-w-[200px]">
              AI Evo sedang merender kode sandbox custom Anda secara real-time. Hubungi AI di samping untuk menambahkan elemen visual.
            </p>
          </div>
        );
    }
  };

  // Trigger simulated GitHub CI build process
  const triggerApkBuild = () => {
    setBuildStatus("building");
    setBuildProgress(0);
    setBuildLogs(["[CI] Initiating Build APK Workflow...", "[CI] Loading GitHub Runner: ubuntu-latest"]);
    setIsBuildOverlayOpen(true);

    const buildStages = [
      { prg: 10, msg: "Setting up JDK 17 (Zulu)", log: "Java SE Runtime Environment 17.0.8 detected." },
      { prg: 20, msg: "Installing stable Flutter SDK", log: "Flutter SDK v3.22.3 downloaded and extracted." },
      { prg: 40, msg: "Resolving pub dependencies", log: "Running: flutter pub get\n-> http: ^1.1.0\n-> webview_flutter: ^4.8.0\n-> share_plus: ^10.0.0\nResolving dependencies complete in 1.4s." },
      { prg: 65, msg: "Running Android toolchain build", log: "Running: gradle assembleRelease\nLoading Android Gradle Plugin 8.7.0...\nConfiguring compileSdk: 34\nGenerating Dalvik bytecode (D8)..." },
      { prg: 85, msg: "Optimizing size with R8 proguard", log: "Compiling assets/flutter_assets...\nAsset bundling complete. Code shrunk by 24%." },
      { prg: 100, msg: "Packaging outputs into APK", log: "APK Generated successfully: app-release.apk (14.2 MB)\nBuild finished in 8.2s." }
    ];

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < buildStages.length) {
        const item = buildStages[currentIdx];
        setBuildProgress(item.prg);
        setBuildStage(item.msg);
        setBuildLogs((prev) => [...prev, `[BUILD] ${item.msg}`, `[SHELL] ${item.log}`]);
        currentIdx++;
      } else {
        clearInterval(interval);
        setBuildStatus("success");
      }
    }, 1500);
  };

  if (viewMode === "dashboard") {
    return (
      <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-800 antialiased overflow-hidden">
        <AiStudioAppsDashboard
          projects={projects}
          activeProjectId={activeProjectId}
          setActiveProjectId={setActiveProjectId}
          chatHistory={chatHistory}
          onSendMessage={sendPresetMessage}
          isProcessing={isProcessing}
          aiStage={aiStage}
          onCreateProject={handleCreateProjectWithParams}
          onDeleteProject={handleDeleteProject}
          onOpenProject={handleOpenProjectDashboard}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          temperature={temperature}
          setTemperature={setTemperature}
          useCustomAiServer={useCustomAiServer}
          setUseCustomAiServer={setUseCustomAiServer}
          customAiServerUrl={customAiServerUrl}
          setCustomAiServerUrl={setCustomAiServerUrl}
          onImportProject={handleImportRemoteProject}
        />

        {/* CUSTOM MODAL FOR PROJECT DELETION CONFIRMATION */}
        {projectToDelete && (
          <div id="delete-confirmation-backdrop" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[300] p-4">
            <div id="delete-confirmation-modal" className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-red-650">
                <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                  <Trash2 className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Hapus Proyek Ini?</h3>
              </div>

              <div className="py-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Apakah Anda yakin ingin menghapus proyek <span className="font-bold text-slate-850">"{projects.find(p => p.id === projectToDelete)?.name}"</span>?
                  Semua file kustom, konfigurasi, dan riwayat chat akan dihapus secara permanen dari perangkat ini. Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>

              <div className="flex items-center gap-2.5 justify-end">
                <button
                  id="cancel-delete-btn"
                  onClick={() => setProjectToDelete(null)}
                  className="px-4 py-2 hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 cursor-pointer transition-all"
                >
                  Batal
                </button>
                <button
                  id="confirm-delete-btn"
                  onClick={confirmDeleteProject}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold shadow-md shadow-red-600/10 cursor-pointer transition-all"
                >
                  Hapus Permanen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM MODAL FOR PROJECT IMPORT OVERWRITE CONFIRMATION */}
        {projectToOverwrite && (
          <div id="overwrite-confirmation-backdrop" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[300] p-4">
            <div id="overwrite-confirmation-modal" className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-amber-500">
                <div className="p-2 bg-amber-50 rounded-xl">
                  <Folder className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Timpa Proyek?</h3>
              </div>

              <div className="py-4">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Proyek dengan ID <span className="font-bold text-slate-800">"{projectToOverwrite.id}"</span> sudah ada di workspace lokal.
                  Apakah Anda ingin menimpanya dengan data dari server remote? File lokal Anda saat ini akan digantikan.
                </p>
              </div>

              <div className="flex items-center gap-2.5 justify-end">
                <button
                  id="cancel-overwrite-btn"
                  onClick={() => setProjectToOverwrite(null)}
                  className="px-4 py-2 hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 cursor-pointer transition-all"
                >
                  Batal
                </button>
                <button
                  id="confirm-overwrite-btn"
                  onClick={confirmOverwriteProject}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-xs font-bold shadow-md shadow-amber-500/10 cursor-pointer transition-all"
                >
                  Timpa Proyek
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 font-sans text-slate-800 antialiased overflow-hidden">
      
      {/* Mobile Header Tabs (visible only on lg:hidden) */}
      <div className="lg:hidden h-14 bg-slate-900 text-white border-b border-slate-800 flex items-center justify-between px-4 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-lg">
            <Sparkles className="h-4 w-4 text-white animate-pulse" />
          </div>
          <span className="text-xs font-bold tracking-tight text-white truncate max-w-[100px] sm:max-w-xs">{activeProject.name}</span>
        </div>
        
        {/* Actions inside Mobile Header */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode("dashboard")}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-indigo-400 text-[10px] font-bold rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer transition-all"
            title="Kembali ke Menu Dashboard"
          >
            <Sparkles className="h-3 w-3 animate-spin" />
            <span>Menu</span>
          </button>

          {/* Mobile Tab Segments switch */}
          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setMobileActiveTab("chat")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                mobileActiveTab === "chat" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setMobileActiveTab("preview")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                mobileActiveTab === "preview" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Smartphone className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setMobileActiveTab("sidebar")}
              className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1 ${
                mobileActiveTab === "sidebar" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Settings className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-row min-h-0 w-full overflow-hidden">
        {/* 1. SIDEBAR FOR PROJECTS NAVIGATION */}
        <aside className={`bg-slate-900 text-slate-100 flex-col border-r border-slate-800 select-none shrink-0 ${
          mobileActiveTab === "sidebar" ? "flex w-full h-full" : "hidden lg:flex lg:w-80"
        }`}>
        {/* Header Title with premium layout */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-lg shadow-md shadow-indigo-500/20">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-md font-bold tracking-tight text-white">AI Evo Builder</h1>
              <p className="text-[10px] text-indigo-400 font-mono font-bold tracking-widest uppercase">Flutter Core v3.22</p>
            </div>
          </div>
        </div>

        {/* Action button to add project */}
        <div className="p-4 space-y-2">
          <button
            onClick={() => setIsNewProjOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-lg font-medium text-xs shadow-md shadow-indigo-600/10 cursor-pointer transition-all hover:translate-y-[-1px]"
          >
            <Plus className="h-4 w-4" />
            New Workspace
          </button>

          <button
            onClick={() => setViewMode("dashboard")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-750 active:bg-slate-850 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold cursor-pointer transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
            AI Evo Apps Menu
          </button>
        </div>

        {/* Project Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Workspaces ({projects.length})
          </div>

          {projects.map((proj) => {
            const isActive = proj.id === activeProjectId;
            return (
              <div
                key={proj.id}
                onClick={() => {
                  setActiveProjectId(proj.id);
                  setErrorMessage(null);
                }}
                className={`group flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer transition-all ${
                  isActive
                    ? "bg-slate-800 text-white shadow-inner border-l-4 border-indigo-500"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-md ${isActive ? "bg-indigo-500/15 text-indigo-400" : "bg-slate-800 text-slate-500"}`}>
                    <Folder className="h-4 w-4" />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-semibold truncate text-slate-200">{proj.name}</div>
                    <div className="text-[10px] text-slate-500 truncate mt-0.5">{proj.description}</div>
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteProject(proj.id, e)}
                  className="p-1 hover:bg-red-500/10 hover:text-red-400 text-slate-600 rounded transition-all md:opacity-0 group-hover:opacity-100"
                  title="Hapus proyek"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Interactive Diagnostics/Error Toggle & APK Export Buttons */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
          {/* AI Config card */}
          <div className="rounded-lg bg-slate-900/60 p-3.5 border border-slate-800/80 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Sliders className="h-4 w-4 text-indigo-400" />
              <span>AI Evo Configuration</span>
            </div>

            {/* Model Selector dropdown */}
            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Active Model</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="gemini-3.5-flash">Gemini 3.5 Flash (Standard)</option>
                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Expert)</option>
                <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Lite)</option>
              </select>
            </div>

            {/* Custom AI Server Option */}
            <div className="space-y-2 pt-2.5 border-t border-slate-800/60">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={useCustomAiServer}
                  onChange={(e) => setUseCustomAiServer(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-[11px] font-semibold text-slate-300">AI Server VM (Alternatif API Key)</span>
              </label>

              {useCustomAiServer && (
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-500 uppercase font-mono tracking-wider block">Alamat Server AI</label>
                  <input
                    type="text"
                    value={customAiServerUrl}
                    onChange={(e) => setCustomAiServerUrl(e.target.value)}
                    placeholder="e.g. 168.110.223.212:7777"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                  <span className="text-[9px] text-slate-400 block leading-tight">Server ini akan digunakan untuk menghasilkan kode gratis tanpa membutuhkan API key.</span>
                </div>
              )}
            </div>

            {/* Temperature Slider */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-500 uppercase font-mono tracking-wider">Creativity (Temp)</span>
                <span className="text-indigo-400 font-mono font-bold">{temperature.toFixed(1)}</span>
              </div>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
              />
            </div>

            {/* Collapsible Advanced Parameters */}
            <details className="group">
              <summary className="flex items-center justify-between text-[10px] text-slate-400 hover:text-slate-200 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden py-1 border-t border-slate-800/60 mt-1">
                <span className="font-mono uppercase tracking-wider font-bold">Advanced Settings</span>
                <ChevronRight className="h-3 w-3 group-open:rotate-90 transition-transform duration-150 text-slate-500" />
              </summary>
              <div className="space-y-3 pt-2.5">
                {/* Max Output Tokens */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-mono tracking-wider uppercase">Max Tokens</span>
                    <span className="text-indigo-400 font-mono">{maxOutputTokens}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="8192"
                    step="50"
                    value={maxOutputTokens}
                    onChange={(e) => setMaxOutputTokens(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Top P */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-mono tracking-wider uppercase">Top P</span>
                    <span className="text-indigo-400 font-mono">{topP.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={topP}
                    onChange={(e) => setTopP(parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                  />
                </div>

                {/* Top K */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-mono tracking-wider uppercase">Top K</span>
                    <span className="text-indigo-400 font-mono">{topK}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={topK}
                    onChange={(e) => setTopK(parseInt(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </details>
          </div>

          <div className="rounded-lg bg-slate-900/60 p-3 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Settings className="h-3.5 w-3.5 text-slate-400" />
                Simulasi Error API
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={() => setSimulateFailure(!simulateFailure)}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
            <p className="text-[9px] text-slate-500 leading-normal">
              Aktifkan untuk menguji penanganan kegagalan panggilan API dengan component UI error dan reload state yang telah didesain.
            </p>
          </div>

          {/* Trigger compilation / APK Export (GitHub Actions Integration simulation) */}
          <button
            onClick={triggerApkBuild}
            className="w-full flex items-center justify-between px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition-all cursor-pointer shadow-lg shadow-emerald-600/10"
          >
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-emerald-100" />
              <span>Compile & Export APK</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-emerald-200" />
          </button>
        </div>
      </aside>

      {/* 2. CHAT & CONVERSATIONAL INTERACTION PANEL */}
      <section className={`flex-1 flex-col bg-slate-50 border-r border-slate-200 min-w-0 h-full ${
        mobileActiveTab === "chat" ? "flex" : "hidden lg:flex"
      }`}>
        {/* Workspace Toolbar Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-800">{activeProject.name}</h2>
                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] rounded font-mono">
                  {activeProject.type.toUpperCase()}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">{activeProject.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasUnsavedChanges && (
              <span className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold animate-pulse">
                <AlertTriangle className="h-3.5 w-3.5" />
                Unsaved Code
              </span>
            )}
            
            {/* Real-time Hardware Telemetry Dashboard Panel Toggle */}
            <button
              onClick={() => setIsHardwarePanelOpen(!isHardwarePanelOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                isHardwarePanelOpen
                  ? "bg-slate-900 border-slate-800 text-slate-100 hover:bg-slate-800"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
              title="Toggle Real-Time Telemetry Monitor Dashboard"
            >
              <Cpu className={`h-3.5 w-3.5 ${isHardwarePanelOpen ? "text-emerald-400 animate-pulse" : "text-slate-400"}`} />
              <span className="hidden sm:inline">Hardware Monitor</span>
            </button>

            <button
              onClick={() => saveProjectToDisk()}
              disabled={isSaving}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                hasUnsavedChanges
                  ? "bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100"
                  : "bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed"
              }`}
            >
              {isSaving ? (
                <Loader2 className="h-3 w-3 animate-spin text-indigo-500" />
              ) : (
                <Save className="h-3 w-3" />
              )}
              {isSaving ? "Saving..." : "Save Workspace"}
            </button>
          </div>
        </header>

        {/* COLLAPSIBLE HARDWARE STATS MONITOR PANEL */}
        {isHardwarePanelOpen && (
          <div className="bg-slate-900 text-slate-100 border-b border-slate-850 px-6 py-3.5 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-200">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Hardware Stats Monitor</span>
                  <span className="text-[9px] bg-slate-800 text-emerald-400 font-mono px-1 rounded border border-slate-700/60 leading-none py-0.5 font-bold font-mono">LIVE</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate max-w-xs md:max-w-md">
                  Renderer: {gpuName}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 flex-1 max-w-3xl">
              {/* Stat 1: CPU Workload */}
              <div className="bg-slate-950/60 border border-slate-850 rounded-lg p-2 flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded">
                  <Cpu className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[8px] text-slate-500 font-mono uppercase tracking-wider leading-none mb-1">CPU Cores</div>
                  <div className="text-xs font-bold font-mono text-slate-200">{cpuThreads} Threads</div>
                </div>
              </div>

              {/* Stat 2: Active Memory (RAM) */}
              <div className="bg-slate-950/60 border border-slate-850 rounded-lg p-2 flex items-center gap-2.5">
                <div className="p-1.5 bg-violet-500/10 text-violet-400 rounded">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[8px] text-slate-500 font-mono uppercase tracking-wider leading-none mb-1">Device RAM</div>
                  <div className="text-xs font-bold font-mono text-slate-200">{deviceRam}</div>
                </div>
              </div>

              {/* Stat 3: JS Active Heap */}
              <div className="bg-slate-950/60 border border-slate-850 rounded-lg p-2 flex flex-col justify-center min-w-0">
                <div className="flex justify-between items-center text-[8px] text-slate-500 font-mono uppercase tracking-wider mb-0.5">
                  <span>JS Heap</span>
                  <span className="text-indigo-400">{(jsHeapUsed / 1024 / 1024).toFixed(0)}MB</span>
                </div>
                <div className="h-1 bg-slate-800 rounded-full overflow-hidden w-full">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000"
                    style={{ width: `${Math.min(100, (jsHeapUsed / (jsHeapLimit || 1)) * 100 * 10)}%` }}
                  />
                </div>
              </div>

              {/* Stat 4: FPS & Speed Index */}
              <div className="bg-slate-950/60 border border-slate-850 rounded-lg p-2 flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded shrink-0">
                  <Gauge className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[8px] text-slate-500 font-mono uppercase tracking-wider leading-none mb-1">Render Rate</div>
                  <div className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-1">
                    {fps} FPS
                    <span className="text-[8px] text-slate-500 font-normal">(16ms)</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setIsHardwarePanelOpen(false)}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1 shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* SYSTEM INSTRUCTIONS OVERRIDE BAR - AI STUDIO STYLE */}
        <div className="bg-white border-b border-slate-200/80 px-6 py-2.5">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-700">System Instructions Override</span>
                {systemInstruction ? (
                  <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 font-mono text-[8px] rounded border border-indigo-100 font-bold">CUSTOMIZED</span>
                ) : (
                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 font-mono text-[8px] rounded border border-slate-200">DEFAULT</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 group-open:rotate-180 transition-transform duration-200">
                <ChevronRight className="h-4 w-4" />
              </div>
            </summary>
            <div className="pt-3 pb-1.5 space-y-3">
              <p className="text-[10px] text-slate-500 leading-normal">
                Tetapkan instruksi sistem khusus untuk mengontrol kepribadian dan gaya pengkodean AI (misalnya: "Gunakan bahasa Indonesia untuk penjelasan", "Output dalam gaya clean architecture").
              </p>
              <textarea
                rows={3}
                placeholder="Tuliskan instruksi sistem di sini (contoh: Semua penjelasan harus dalam format poin-poin singkat dan sopan)..."
                value={systemInstruction}
                onChange={(e) => setSystemInstruction(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl text-xs bg-slate-50 font-mono leading-relaxed"
              />
              {systemInstruction && (
                <div className="flex justify-end">
                  <button
                    onClick={() => setSystemInstruction("")}
                    className="px-2.5 py-1 text-[10px] font-bold text-red-600 hover:bg-red-50 rounded transition-all cursor-pointer"
                  >
                    Reset ke Default Persona
                  </button>
                </div>
              )}
            </div>
          </details>
        </div>

        {/* Chat History Flow */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {(chatHistory[activeProjectId] || []).map((msg) => {
            const isAI = msg.sender === "ai";
            const isError = msg.isError;

            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isAI ? "justify-start" : "justify-end"}`}
              >
                {isAI && (
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isError 
                      ? "bg-red-500/10 text-red-500 border border-red-200" 
                      : "bg-indigo-500 text-white shadow"
                  }`}>
                    {isError ? <AlertTriangle className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  </div>
                )}

                <div className={`max-w-[82%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                  isAI
                    ? isError
                      ? "bg-red-50 border border-red-100 text-red-900 shadow-sm"
                      : "bg-white border border-slate-200 text-slate-700 shadow-sm"
                    : "bg-indigo-600 text-white shadow-md shadow-indigo-600/5 font-medium"
                }`}>
                  {/* Message body rendering formatted elements */}
                  <div className="space-y-2">
                    {renderMessageContent(msg)}
                  </div>

                  <span className={`block text-[9px] mt-2 text-right ${isAI ? "text-slate-400" : "text-indigo-200"}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Glowing AI processing state loading indicator with progress status updates */}
          {isProcessing && (
            <div className="flex gap-3.5 justify-start">
              <div className="h-8 w-8 rounded-lg bg-indigo-500 text-white flex items-center justify-center shrink-0 animate-spin">
                <Loader2 className="h-4 w-4" />
              </div>
              <div className="max-w-[70%] rounded-xl px-4 py-3 bg-white border border-slate-100 text-slate-700 shadow-sm">
                <div className="flex items-center gap-3">
                  {/* Bouncing DOTS animation */}
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800">
                    AI Evo sedang merumuskan kode...
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1 px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded inline-block">
                  {aiStage}
                </div>
              </div>
            </div>
          )}

          {/* Visual error notification card banner if API fails */}
          {errorMessage && (
            <div className="rounded-xl border border-red-200 bg-red-50/60 p-4 shadow-sm flex items-start gap-3.5 max-w-xl mx-auto">
              <div className="p-2 bg-red-500 text-white rounded-lg">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="text-xs font-bold text-red-900">Panggilan API Gagal Dilakukan</h4>
                <p className="text-xs text-red-700 leading-normal">
                  {errorMessage}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <button
                    onClick={() => {
                      setErrorMessage(null);
                      // Trigger a retry with simulation off
                      setSimulateFailure(false);
                    }}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-[10px] font-bold rounded-md transition-all cursor-pointer"
                  >
                    Nonaktifkan Simulasi & Tutup
                  </button>
                  <button
                    onClick={() => {
                      setErrorMessage(null);
                    }}
                    className="px-2.5 py-1.5 border border-red-200 hover:bg-red-50 text-red-700 text-[10px] font-semibold rounded-md transition-all cursor-pointer"
                  >
                    Abaikan
                  </button>
                </div>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Text Input Message Form */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-3">
          {/* Quick Preset Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
            {[
              { label: "🎨 Tema Dark Mode", text: "Ubah tema desain aplikasi menjadi dark mode bernuansa gelap matte yang elegan." },
              { label: "⚡ Optimalkan RAM", text: "Tambahkan manajemen penyimpanan lokal state efisien dan optimalkan RAM." },
              { label: "➕ Tambah Tombol Aksi", text: "Tambahkan tombol aksi kustom (floating action button) dengan ikon menarik." },
              { label: "🐞 Perbaiki Struktur", text: "Tinjau kode lib/main.dart di atas, perbaiki bugs dan bersihkan sisa imports." }
            ].map((chip, index) => (
              <button
                key={index}
                type="button"
                onClick={() => sendPresetMessage(chip.text)}
                disabled={isProcessing}
                className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-50 text-[10px] font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg shrink-0 cursor-pointer transition-all hover:translate-y-[-0.5px]"
              >
                {chip.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex flex-col gap-2 bg-slate-50 border border-slate-200 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 rounded-xl p-1.5 transition-all">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isProcessing}
              placeholder={isProcessing ? "AI Evo sedang mengetik kode..." : "Modifikasi layout, tambahkan tombol, ubah tema warna..."}
              className="px-3 py-2 w-full focus:outline-none rounded-lg text-xs bg-transparent text-slate-800 placeholder-slate-400"
            />
            
            <div className="flex items-center justify-between px-3 pb-1 border-t border-slate-100 pt-2 text-[9px] text-slate-400 font-mono select-none">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-indigo-500 shrink-0" />
                <span>{inputMessage.length} karakter • ~{Math.ceil(inputMessage.length / 3.8)} tokens</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Context: ~{Math.ceil(((chatHistory[activeProjectId] || []).reduce((acc, m) => acc + m.text.length, 0) + inputMessage.length) / 3.8)} / 1M tokens</span>
                <button
                  type="submit"
                  disabled={isProcessing || !inputMessage.trim()}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-200 text-white rounded-lg shadow-md hover:shadow-lg disabled:shadow-none cursor-pointer transition-all flex items-center justify-center shrink-0 font-bold"
                >
                  <Send className="h-3 w-3 mr-1" />
                  Kirim
                </button>
              </div>
            </div>
          </form>
          
          <div className="text-[9px] text-slate-400 text-center font-mono uppercase tracking-wider">
            {useCustomAiServer ? "AI Server VM Mode Active • Unlimited generations" : "AI Evo API Playground Mode Enabled • Multi-turn active context"}
          </div>
        </div>
      </section>

      {/* 3. CODES & INTERACTIVE SMARTPHONE APP PREVIEW */}
      <section className={`bg-white border-l border-slate-200 flex-col min-w-0 h-full ${
        mobileActiveTab === "preview" ? "flex w-full" : "hidden lg:flex lg:w-[540px]"
      }`}>
        {/* Toggle subtabs */}
        <div className="h-16 border-b border-slate-200 flex items-center justify-between px-3.5 gap-1 select-none overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              activeTab === "preview"
                ? "bg-slate-100 text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <Smartphone className="h-4 w-4" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              activeTab === "code"
                ? "bg-slate-100 text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <FileCode className="h-4 w-4" />
            main.dart
          </button>
          <button
            onClick={() => setActiveTab("pubspec")}
            className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              activeTab === "pubspec"
                ? "bg-slate-100 text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <FileText className="h-4 w-4" />
            pubspec
          </button>
          <button
            onClick={() => setActiveTab("github")}
            className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              activeTab === "github"
                ? "bg-indigo-50 text-indigo-100 shadow-md"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            <GitBranch className="h-4 w-4" />
            Sync GitHub
          </button>
          <button
            onClick={() => setActiveTab("hardware")}
            className={`flex-1 flex items-center justify-center gap-1.5 h-10 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
              activeTab === "hardware"
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Cpu className="h-4 w-4" />
            Telemetry
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-hidden p-6 bg-slate-50 flex items-center justify-center">
          {activeTab === "preview" ? (
            /* Beautiful Smartphone Mockup */
            <div className="relative w-80 h-[560px] bg-slate-950 border-[8px] border-slate-800 rounded-[36px] shadow-2xl flex flex-col overflow-hidden ring-4 ring-indigo-500/15">
              {/* Camera Notch Punchhole */}
              <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-24 h-4 bg-slate-800 rounded-full z-20 flex items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-900"></span>
              </div>

              {/* Mobile Screen Output container */}
              <div className="flex-1 bg-white mt-1.5 rounded-[24px] overflow-hidden flex flex-col relative">
                {renderInteractivePreview()}
              </div>

              {/* Home Indicator Bottom bar */}
              <div className="h-4 bg-slate-950 flex items-center justify-center relative select-none">
                <div className="w-28 h-1 bg-slate-700 rounded-full"></div>
              </div>
            </div>
          ) : activeTab === "code" ? (
            /* main.dart interactive code viewer/editor */
            <div className="w-full h-full flex flex-col bg-slate-900 rounded-xl border border-slate-800 shadow-inner overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between bg-slate-950 px-4 py-2 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
                <span>lib/main.dart</span>
                <span className="text-[10px] text-indigo-400">Edit Mode Active</span>
              </div>
              <textarea
                value={activeProject.mainDart}
                onChange={(e) => {
                  const updatedVal = e.target.value;
                  setProjects((prev) =>
                    prev.map((p) => (p.id === activeProjectId ? { ...p, mainDart: updatedVal } : p))
                  );
                  setHasUnsavedChanges(true);
                }}
                className="flex-1 w-full p-4 bg-slate-900 text-emerald-400 border-none outline-none resize-none font-mono text-xs leading-relaxed focus:ring-0 focus:ring-offset-0 overflow-auto"
                spellCheck={false}
              />
            </div>
          ) : activeTab === "pubspec" ? (
            /* pubspec.yaml interactive viewer */
            <div className="w-full h-full flex flex-col bg-slate-900 rounded-xl border border-slate-800 shadow-inner overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between bg-slate-950 px-4 py-2 text-slate-400 text-[11px] font-semibold border-b border-slate-800">
                <span>pubspec.yaml</span>
                <span className="text-indigo-400 text-[10px]">Project Configurations</span>
              </div>
              <textarea
                value={activeProject.pubspec}
                onChange={(e) => {
                  const updatedVal = e.target.value;
                  setProjects((prev) =>
                    prev.map((p) => (p.id === activeProjectId ? { ...p, pubspec: updatedVal } : p))
                  );
                  setHasUnsavedChanges(true);
                }}
                className="flex-1 w-full p-4 bg-slate-900 text-yellow-300 border-none outline-none resize-none font-mono text-xs leading-relaxed focus:ring-0 focus:ring-offset-0 overflow-auto"
                spellCheck={false}
              />
            </div>
          ) : activeTab === "github" ? (
            /* REAL-TIME GITHUB REPOSITORY SYNC ENGINE */
            <div className="w-full h-full flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-5">
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <Github className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">GitHub Repository Sync</h3>
                  <p className="text-[10px] text-slate-400">Sinkronisasikan workspace Flutter langsung ke GitHub</p>
                </div>
              </div>

              {/* Input Form Fields */}
              <div className="mt-4 space-y-3.5 flex-1 overflow-y-auto pr-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider">Repository Path</label>
                  <input
                    type="text"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    placeholder="Contoh: username/my-flutter-app"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider">Branch</label>
                  <input
                    type="text"
                    value={githubBranch}
                    onChange={(e) => setGithubBranch(e.target.value)}
                    placeholder="main"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider">Personal Access Token (PAT)</label>
                    <span className="text-[9px] text-slate-400">Optional</span>
                  </div>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[9px] text-slate-400 leading-normal">
                    *Kosongkan untuk menggunakan <strong>Mode Simulasi Interaktif</strong>. Berikan Token Akses Riil dengan hak akses <code>repo</code> untuk sinkronisasi nyata ke akun Anda.
                  </p>
                </div>

                {/* Status Indicator Banner */}
                {githubSyncStatus === "success" && (
                  <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2 text-xs text-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Workspace berhasil disinkronisasikan! Periksa cabang remote Anda.</span>
                  </div>
                )}
                {githubSyncStatus === "failed" && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-xs text-red-800">
                    <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                    <span>Sinkronisasi gagal. Periksa token Anda dan pastikan repositori ada di GitHub.</span>
                  </div>
                )}

                {/* Git logs terminal section */}
                {githubLogs.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase font-mono tracking-wider">Git Terminal Logs</label>
                    <div className="h-32 bg-slate-900 rounded-lg border border-slate-800 p-3 font-mono text-[10px] text-slate-300 overflow-y-auto space-y-1 leading-relaxed">
                      {githubLogs.map((log, lidx) => {
                        let isShell = log.startsWith("[SHELL]");
                        let isError = log.includes("❌");
                        let isSuccess = log.includes("🎉") || log.includes("berhasil");
                        return (
                          <div
                            key={lidx}
                            className={
                              isError
                                ? "text-red-400"
                                : isSuccess
                                ? "text-emerald-400 font-bold animate-pulse"
                                : isShell
                                ? "text-slate-500"
                                : "text-slate-200"
                            }
                          >
                            {log}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Action sync triggers */}
              <button
                onClick={handleGithubSync}
                disabled={isGithubSyncing}
                className={`w-full py-2.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg mt-4 ${
                  isGithubSyncing
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 shadow-indigo-600/10"
                }`}
              >
                {isGithubSyncing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memproses Komit & Push...
                  </>
                ) : (
                  <>
                    <GitBranch className="h-4 w-4" />
                    Synchronize to GitHub Remote
                  </>
                )}
              </button>
            </div>
          ) : (
            /* LOCAL HARDWARE PERFORMANCE DIAGNOSTIC TAB */
            <div className="w-full h-full flex flex-col bg-slate-950 text-slate-200 rounded-xl border border-slate-800 shadow-2xl p-5 overflow-hidden">
              {/* Header section with pulsating green standard light */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-indigo-400">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Local Hardware Diagnostics</h3>
                    <p className="text-[10px] text-slate-500">Pemrosesan UI & Rendering dioptimalkan ke hardware lokal</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold font-mono">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  GPU ACTIVE
                </div>
              </div>

              {/* Bento Diagnostics grid */}
              <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1">
                <div className="grid grid-cols-2 gap-3.5">
                  {/* Card 1: Frames Per Second rendering rate */}
                  <div className="p-3.5 bg-slate-900/60 border border-slate-850 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Frames (FPS)</span>
                      <Gauge className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div className="text-2xl font-black text-white font-mono tracking-tight">{fps} <span className="text-xs text-slate-500">fps</span></div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${Math.min((fps / 120) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-[9px] text-slate-500 font-mono leading-none pt-1">WebGL dynamic layout canvas</p>
                  </div>

                  {/* Card 2: Processor Cores threads */}
                  <div className="p-3.5 bg-slate-900/60 border border-slate-850 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">CPU Threads</span>
                      <Cpu className="h-4 w-4 text-indigo-400" />
                    </div>
                    <div className="text-2xl font-black text-white font-mono tracking-tight">{cpuThreads} <span className="text-xs text-slate-500">cores</span></div>
                    <div className="text-[9px] text-slate-400 truncate pt-1 leading-none font-mono">
                      navigator.hardwareConcurrency
                    </div>
                  </div>
                </div>

                {/* Card 3: JS Heap consumption */}
                <div className="p-3.5 bg-slate-900/60 border border-slate-850 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-mono font-bold uppercase tracking-wider">Client Active RAM Heap</span>
                    <span className="text-indigo-400 font-mono">{(jsHeapUsed / 1024 / 1024).toFixed(1)} MB / {(jsHeapTotal / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-1000"
                      style={{ width: `${(jsHeapUsed / jsHeapLimit) * 100 * 10}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-500 font-mono leading-none">
                    <span>Heap Allocation</span>
                    <span>Max Limit: {(jsHeapLimit / 1024 / 1024 / 1024).toFixed(1)} GB</span>
                  </div>
                </div>

                {/* Card 4: Persistent storage estimates */}
                <div className="p-3.5 bg-slate-900/60 border border-slate-850 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-500 font-mono font-bold uppercase tracking-wider">Client Sandbox Disk Quota</span>
                    <span className="text-yellow-400 font-mono">{(storageUsage / 1024 / 1024).toFixed(2)} MB Used</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500 transition-all duration-1000"
                      style={{ width: `${Math.max(0.5, (storageUsage / (storageQuota || 1)) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-500 font-mono leading-none">
                    <span>Offline Cache & workspace data</span>
                    <span>Total Disk Quota: {(storageQuota / 1024 / 1024 / 1024).toFixed(2)} GB</span>
                  </div>
                </div>

                {/* GPU Information Banner */}
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-lg space-y-1">
                  <div className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-wider">Unmasked GPU Hardware Acceleration</div>
                  <div className="text-xs text-slate-200 font-semibold truncate flex items-center gap-1.5 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    {gpuName}
                  </div>
                </div>

                {/* CPU compute benchmark segment */}
                <div className="p-4 bg-gradient-to-br from-slate-900 to-indigo-950/20 border border-indigo-900/40 rounded-xl space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white">CPU Mathematical Core Benchmark</h4>
                      <p className="text-[9px] text-slate-500 leading-normal">Uji performa komputasi thread tunggal browser lokal</p>
                    </div>
                    {benchmarkResult && (
                      <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded font-mono font-black text-[9px] border border-indigo-500/30">
                        {benchmarkResult.grade}
                      </span>
                    )}
                  </div>

                  {benchmarkResult && (
                    <div className="grid grid-cols-2 gap-3 p-2.5 bg-slate-950 rounded-lg border border-slate-850 font-mono text-[10px]">
                      <div>
                        <div className="text-slate-500 uppercase text-[8px]">Precision Score</div>
                        <div className="text-sm font-black text-white">{benchmarkResult.score} PTS</div>
                      </div>
                      <div>
                        <div className="text-slate-500 uppercase text-[8px]">Computation Speed</div>
                        <div className="text-sm font-black text-emerald-400">{benchmarkResult.mflops} OPS/ms</div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={runCpuBenchmark}
                    disabled={isBenchmarking}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-800 text-white font-bold text-xs rounded transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                  >
                    {isBenchmarking ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Mengevaluasi floating point primes...
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" />
                        Run CPU Benchmark
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
      </div>

      {/* CUSTOM MODAL FOR PROJECT DELETION CONFIRMATION */}
      {projectToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-red-650">
              <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Hapus Proyek Ini?</h3>
            </div>

            <div className="py-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Apakah Anda yakin ingin menghapus proyek <span className="font-bold text-slate-850">"{projects.find(p => p.id === projectToDelete)?.name}"</span>?
                Semua file kustom, konfigurasi, dan riwayat chat akan dihapus secara permanen dari perangkat ini. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <div className="flex items-center gap-2.5 justify-end">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 cursor-pointer transition-all"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteProject}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold shadow-md shadow-red-600/10 cursor-pointer transition-all"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM MODAL FOR PROJECT IMPORT OVERWRITE CONFIRMATION */}
      {projectToOverwrite && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 text-amber-500">
              <div className="p-2 bg-amber-50 rounded-xl">
                <Folder className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Timpa Proyek?</h3>
            </div>

            <div className="py-4">
              <p className="text-xs text-slate-500 leading-relaxed">
                Proyek dengan ID <span className="font-bold text-slate-800">"{projectToOverwrite.id}"</span> sudah ada di workspace lokal.
                Apakah Anda ingin menimpanya dengan data dari server remote? File lokal Anda saat ini akan digantikan.
              </p>
            </div>

            <div className="flex items-center gap-2.5 justify-end">
              <button
                onClick={() => setProjectToOverwrite(null)}
                className="px-4 py-2 hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-500 cursor-pointer transition-all"
              >
                Batal
              </button>
              <button
                onClick={confirmOverwriteProject}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-xs font-bold shadow-md shadow-amber-500/10 cursor-pointer transition-all"
              >
                Timpa Proyek
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. MODAL FOR NEW WORKSPACE CREATION */}
      {isNewProjOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Create New Workspace</h3>
              <button
                onClick={() => setIsNewProjOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Workspace Name</label>
                <input
                  type="text"
                  placeholder="e.g., Task Board App, Finance Widget..."
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 focus:border-indigo-500 focus:outline-none rounded-xl text-xs bg-slate-50"
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Starter App Template</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: "counter", name: "Counter App", desc: "Digital tap counter grid" },
                    { type: "todo", name: "Todo Manager", desc: "Checkbox dynamic tasks" },
                    { type: "weather", name: "Weather App", desc: "Atmosphere monitoring widget" },
                    { type: "calculator", name: "Calculator Grid", desc: "Interactive math keypads" },
                    { type: "custom", name: "Blank Canvas", desc: "Empty scaffold setup" }
                  ].map((tpl) => (
                    <div
                      key={tpl.type}
                      onClick={() => setNewProjType(tpl.type as Project["type"])}
                      className={`p-3 border rounded-xl cursor-pointer text-left transition-all ${
                        newProjType === tpl.type
                          ? "border-indigo-500 bg-indigo-50/40 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-800">{tpl.name}</div>
                      <div className="text-[10px] text-slate-500 mt-1">{tpl.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                onClick={() => setIsNewProjOpen(false)}
                className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-medium cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjName.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                Create Workspace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL FOR COMPILATION & APK EXPORT PROCESS */}
      {isBuildOverlayOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col p-6 animate-in fade-in zoom-in-95 duration-150 text-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg">
                  <Cpu className="h-4 w-4 animate-spin" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">CI/CD APK Export Pipeline</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Automated GitHub Build Workflow Simulation</p>
                </div>
              </div>
              {buildStatus !== "building" && (
                <button
                  onClick={() => setIsBuildOverlayOpen(false)}
                  className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-300 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Build stage / loading bar */}
            <div className="py-6 space-y-4">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-300">
                  {buildStatus === "building" ? "Workflow running: " + buildStage : "Workflow finished."}
                </span>
                <span className="text-indigo-400 font-mono font-bold">{buildProgress}%</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    buildStatus === "success" ? "bg-emerald-500" : "bg-indigo-500 animate-pulse"
                  }`}
                  style={{ width: `${buildProgress}%` }}
                ></div>
              </div>

              {/* Shell output logs terminal */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 h-48 overflow-y-auto font-mono text-[10px] leading-relaxed text-slate-300 flex flex-col">
                <div className="text-slate-500 flex items-center gap-1 border-b border-slate-900 pb-1.5 mb-2">
                  <Terminal className="h-3.5 w-3.5" />
                  Terminal Build Logger (ubuntu-latest runner)
                </div>
                {buildLogs.map((log, index) => (
                  <div key={index} className="whitespace-pre-wrap">{log}</div>
                ))}
              </div>
            </div>

            {/* Footer triggers */}
            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              {buildStatus === "building" ? (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                  Building package... Please do not close this modal.
                </div>
              ) : buildStatus === "success" ? (
                <>
                  <button
                    onClick={() => setIsBuildOverlayOpen(false)}
                    className="px-4 py-2 border border-slate-700 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    Close Log
                  </button>
                  <button
                    onClick={() => {
                      alert("Membuka unduhan file APK: app-release.apk! Silakan pasang di perangkat fisik Android Anda.");
                      setIsBuildOverlayOpen(false);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                  >
                    <Download className="h-4 w-4" />
                    Download APK Output
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsBuildOverlayOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// MOCK APPS LIVE PREVIEW INTERACTIVE COMPONENTS
// ----------------------------------------------------

function CounterAppPreview({ code }: { code: string }) {
  const [val, setVal] = useState(0);

  // Try to sync initial state or value if specified in Dart
  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-full font-sans select-none">
      <div className="h-14 bg-teal-600 text-white px-4 flex items-center justify-between shadow-sm">
        <span className="text-xs font-bold tracking-wide">AI Evo Counter</span>
        <RotateCcw className="h-4 w-4 opacity-70 hover:opacity-100 transition-all cursor-pointer" onClick={() => setVal(0)} />
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-6 text-center">
        <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-2">You tapped:</span>
        <span className="text-6xl font-black text-teal-600 tracking-tight animate-bounce">{val}</span>

        <div className="mt-8 flex gap-3.5">
          <button
            onClick={() => setVal((prev) => (prev > 0 ? prev - 1 : 0))}
            className="w-12 h-12 bg-rose-100 active:bg-rose-200 hover:bg-rose-50 text-rose-600 rounded-full flex items-center justify-center font-bold text-lg transition-all cursor-pointer"
          >
            -
          </button>
          <button
            onClick={() => setVal(0)}
            className="px-4 h-12 bg-slate-100 active:bg-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold text-xs transition-all cursor-pointer"
          >
            Reset
          </button>
          <button
            onClick={() => setVal((prev) => prev + 1)}
            className="w-12 h-12 bg-teal-100 active:bg-teal-200 hover:bg-teal-50 text-teal-600 rounded-full flex items-center justify-center font-bold text-lg transition-all cursor-pointer"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

function BrowserAppPreview({ code }: { code: string }) {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-full font-sans select-none">
      <div className="h-14 bg-blue-600 text-white px-4 flex items-center justify-between shadow-sm">
        <span className="text-xs font-bold tracking-wide">Browser App</span>
      </div>
      <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
        Browser Preview (WebView not supported in web preview)
      </div>
    </div>
  );
}

function TodoAppPreview({ code }: { code: string }) {
  const [todos, setTodos] = useState<string[]>([
    "Learn Flutter basics",
    "Design app with AI Evo Builder",
    "Build release APK"
  ]);
  const [input, setInput] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setTodos((prev) => [...prev, input.trim()]);
    setInput("");
  };

  const handleRemove = (idx: number) => {
    setTodos((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 h-full font-sans select-none">
      <div className="h-14 bg-indigo-600 text-white px-4 flex items-center justify-center shadow-sm">
        <span className="text-xs font-bold tracking-wide">AI Tasks Manager</span>
      </div>

      <div className="p-4 bg-white border-b border-slate-100">
        <form onSubmit={handleAdd} className="flex gap-2">
          <input
            type="text"
            placeholder="Add task..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-3 py-1.5 border border-slate-200 focus:outline-none focus:border-indigo-500 rounded-lg text-[11px]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg cursor-pointer"
          >
            Add
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {todos.length === 0 ? (
          <div className="text-center text-slate-400 py-10 text-xs">
            All caught up! 🎉
          </div>
        ) : (
          todos.map((todo, idx) => (
            <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-slate-100">
              <span className="text-xs text-slate-700 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
                {todo}
              </span>
              <button onClick={() => handleRemove(idx)} className="p-1 hover:bg-red-50 text-red-500 rounded cursor-pointer">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function WeatherAppPreview({ code }: { code: string }) {
  const [city, setCity] = useState("Jakarta");
  const [temp, setTemp] = useState(31.5);
  const [condition, setCondition] = useState("Partly Cloudy");
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setCity(query);

    const lq = query.toLowerCase();
    if (lq.includes("london")) {
      setTemp(16.0);
      setCondition("Overcast & Rainy");
    } else if (lq.includes("tokyo")) {
      setTemp(22.0);
      setCondition("Sunny Skies");
    } else {
      setTemp(28.0 + (query.length % 5));
      setCondition("Sunny Interval");
    }
    setQuery("");
  };

  return (
    <div className="flex-1 flex flex-col bg-blue-50 h-full font-sans select-none">
      <div className="h-14 bg-blue-500 text-white px-4 flex items-center justify-center shadow-sm">
        <span className="text-xs font-bold tracking-wide">Evo Weather Live</span>
      </div>

      <div className="p-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search Tokyo, London..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-3 py-1.5 border border-slate-200 focus:outline-none focus:border-blue-500 rounded-lg text-[10px] bg-white"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-blue-500 text-white text-[9px] font-bold rounded-lg cursor-pointer"
          >
            Go
          </button>
        </form>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center text-center px-6">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{city}</h3>
        <p className="text-xs text-blue-600 font-semibold mt-1">{condition}</p>

        <span className="text-5xl font-light text-slate-900 tracking-tighter my-4">
          {temp.toFixed(1)}°C
        </span>

        <div className="grid grid-cols-2 gap-4 w-full border-t border-blue-100 pt-4 mt-4">
          <div className="text-center">
            <div className="text-[10px] text-slate-400">Humidity</div>
            <div className="text-xs font-bold text-slate-700">65%</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] text-slate-400">Wind</div>
            <div className="text-xs font-bold text-slate-700">12 km/h</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CalculatorAppPreview({ code }: { code: string }) {
  const [display, setDisplay] = useState("0");
  const [storedVal, setStoredVal] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [clearDisplay, setClearDisplay] = useState(false);

  const handlePress = (char: string) => {
    if (char === "C") {
      setDisplay("0");
      setStoredVal(null);
      setOp(null);
      setClearDisplay(false);
    } else if (["+", "-", "*", "/"].includes(char)) {
      setStoredVal(parseFloat(display));
      setOp(char);
      setClearDisplay(true);
    } else if (char === "=") {
      if (storedVal !== null && op) {
        const sec = parseFloat(display);
        let res = 0;
        switch (op) {
          case "+": res = storedVal + sec; break;
          case "-": res = storedVal - sec; break;
          case "*": res = storedVal * sec; break;
          case "/": res = sec === 0 ? 0 : storedVal / sec; break;
        }
        setDisplay(res.toString().endsWith(".0") ? Math.floor(res).toString() : res.toString());
        setStoredVal(null);
        setOp(null);
        setClearDisplay(true);
      }
    } else {
      if (display === "0" || clearDisplay) {
        setDisplay(char);
        setClearDisplay(false);
      } else {
        setDisplay(display + char);
      }
    }
  };

  const keypad = [
    ["7", "8", "9", "/"],
    ["4", "5", "6", "*"],
    ["1", "2", "3", "-"],
    ["C", "0", "=", "+"]
  ];

  return (
    <div className="flex-1 flex flex-col bg-black h-full font-sans select-none p-4">
      <div className="flex-1 flex flex-col justify-end items-end p-2 pb-6">
        <span className="text-white text-4xl font-light tracking-tight truncate max-w-full">
          {display}
        </span>
      </div>

      <div className="grid grid-rows-4 gap-2">
        {keypad.map((row, rIdx) => (
          <div key={rIdx} className="grid grid-cols-4 gap-2">
            {row.map((btn) => {
              const isOperator = ["/", "*", "-", "+", "="].includes(btn);
              return (
                <button
                  key={btn}
                  onClick={() => handlePress(btn)}
                  className={`aspect-square rounded-full flex items-center justify-center font-bold text-xs cursor-pointer transition-all ${
                    isOperator
                      ? "bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-white"
                      : "bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-900 text-slate-200"
                  }`}
                >
                  {btn}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
