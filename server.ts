import express from "express";
import path from "path";
import fs from "fs/promises";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-change-me";

// In-memory user store (prototype only!)
const users: any[] = [];

async function startServer() {
  const app = express();
  app.use(express.json());

  // --- Auth Endpoints ---
  app.post("/auth/register", async (req, res) => {
    try {
      const { email, password, full_name } = req.body;
      if (users.find(u => u.email === email)) return res.status(400).json({ error: "Email sudah terdaftar" });
      const hashedPassword = await bcrypt.hash(password, 10);
      users.push({ id: users.length + 1, email, password: hashedPassword, full_name });
      res.json({ success: true });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  app.post("/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = users.find(u => u.email === email);
      if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: "Email atau password salah" });
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, user: { id: user.id, email: user.email, full_name: user.full_name } });
    } catch (err: any) { res.status(500).json({ error: err.message }); }
  });

  // Initialize Gemini API
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } else {
    console.warn("WARNING: GEMINI_API_KEY is not defined in the environment. AI endpoints will return configuration advice.");
  }

  // --- Rate Limiter ---
  const requestLimiter = new Map<string, {count: number, lastReset: number}>();
  const tokenLimiter = new Map<string, {tokens: number, date: string}>();

  function checkLimits(ip: string, tokens: number): {allowed: boolean, message?: string} {
      const now = Date.now();
      const today = new Date().toISOString().split('T')[0];

      // 1. Requests/min
      let reqData = requestLimiter.get(ip) || {count: 0, lastReset: now};
      if (now - reqData.lastReset > 60000) {
          reqData = {count: 0, lastReset: now};
      }
      if (reqData.count >= 5) return {allowed: false, message: "Limit 5 permintaan per menit terlampaui."};
      reqData.count++;
      requestLimiter.set(ip, reqData);

      // 2. Tokens/day
      let tokenData = tokenLimiter.get(ip) || {tokens: 0, date: today};
      if (tokenData.date !== today) {
          tokenData = {tokens: 0, date: today};
      }
      if (tokenData.tokens + tokens > 100000) return {allowed: false, message: "Limit 100k token per hari terlampaui."};
      tokenData.tokens += tokens;
      tokenLimiter.set(ip, tokenData);

      return {allowed: true};
  }

  // API Endpoints
  // 1. Get Flutter project files
  app.get("/api/project/files", async (req, res) => {
    try {
      const mainDartPath = path.join(process.cwd(), "lib", "main.dart");
      const pubspecPath = path.join(process.cwd(), "pubspec.yaml");

      let mainDart = "";
      let pubspec = "";

      try {
        mainDart = await fs.readFile(mainDartPath, "utf-8");
      } catch (err) {
        mainDart = `import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Demo App',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: Scaffold(
        appBar: AppBar(title: const Text('My AI App')),
        body: const Center(child: Text('Hello from AI Evo!')),
      ),
    );
  }
}`;
      }

      try {
        pubspec = await fs.readFile(pubspecPath, "utf-8");
      } catch (err) {
        pubspec = `name: demo_app
description: A new Flutter project.
version: 1.0.0+1
environment:
  sdk: ">=3.0.0 <4.0.0"
dependencies:
  flutter:
    sdk: flutter`;
      }

      res.json({ mainDart, pubspec });
    } catch (error: any) {
      console.error("Error reading project files:", error);
      res.status(500).json({ error: error.message || "Failed to load files" });
    }
  });

  // 2. Save Flutter project files
  app.post("/api/project/save", async (req, res) => {
    try {
      const { mainDart, pubspec } = req.body;
      const mainDartPath = path.join(process.cwd(), "lib", "main.dart");
      const pubspecPath = path.join(process.cwd(), "pubspec.yaml");

      // Ensure directory exists
      await fs.mkdir(path.join(process.cwd(), "lib"), { recursive: true });

      if (typeof mainDart === "string") {
        await fs.writeFile(mainDartPath, mainDart, "utf-8");
      }
      if (typeof pubspec === "string") {
        await fs.writeFile(pubspecPath, pubspec, "utf-8");
      }

      res.json({ success: true, message: "Project files saved successfully" });
    } catch (error: any) {
      console.error("Error saving project files:", error);
      res.status(500).json({ error: error.message || "Failed to save files" });
    }
  });

  // Helper to call custom AI server without requiring a Gemini API key
  async function callCustomAiServer(
    serverUrl: string, 
    model: string, 
    systemInstruction: string, 
    promptContext: string, 
    temp: number,
    userId: string,
    targetPlatform: string
  ) {
    let targetUrl = serverUrl.trim();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "http://" + targetUrl;
    }
    if (typeof targetUrl.endsWith === 'function' && targetUrl.endsWith("/")) {
      targetUrl = targetUrl.slice(0, -1);
    }
    
    console.log(`[Custom AI Server] Mengakses server di: ${targetUrl}`);

    // If targetUrl already contains "/v1/chat/completions", use it as the chatCompletionsUrl directly.
    // Otherwise, append it.
    let chatCompletionsUrl = targetUrl;
    if (!chatCompletionsUrl.includes("/v1/chat/completions")) {
      chatCompletionsUrl = `${chatCompletionsUrl}/v1/chat/completions`;
    }

    // Get a clean base URL without the path to fall back to other endpoints (like /api/generate) if needed
    let baseUrl = targetUrl;
    if (baseUrl.includes("/v1/chat/completions")) {
      baseUrl = baseUrl.replace("/v1/chat/completions", "");
    }
    if (typeof baseUrl.endsWith === 'function' && baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1);
    }

    const promptText = `${systemInstruction}\n\n${promptContext}`;
    
    // STRATEGY 1: Custom API Format with user_id and prompt (Expected by 168.110.223.212:7777)
    // We try calling BOTH the chat completions endpoint and the root endpoint with this format,
    // since this format is required by the user's uvicorn server.
    const customPayload = {
      user_id: userId || "ai_evo_web_user",
      prompt: promptText,
      model: model || "gemini-3.5-flash",
      target_platform: targetPlatform || "web"
    };

    const endpointsToTry = [chatCompletionsUrl, targetUrl, baseUrl];
    
    for (const url of endpointsToTry) {
      try {
        console.log(`[Custom AI Server] Mencoba format kustom (user_id + prompt) ke: ${url}`);
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(customPayload),
        });

        if (response.ok) {
          const data: any = await response.json();
          console.log(`[Custom AI Server] Respon format kustom sukses dari ${url}`);
          
          // Check for custom structure with files and project specifications
          if (data && (data.files || data.build_instructions || data.project_name)) {
            let reply = `### Hasil Generasi Proyek dari Server AI VM\n\n`;
            if (data.project_name) {
              reply += `**Nama Proyek:** \`${data.project_name}\`\n\n`;
            }
            if (data.files && Array.isArray(data.files)) {
              reply += `Berikut adalah berkas-berkas kode yang dihasilkan:\n\n`;
              for (const file of data.files) {
                const ext = file.path && typeof file.path.endsWith === 'function' 
                  ? (file.path.endsWith(".dart") ? "dart" : file.path.endsWith(".yaml") ? "yaml" : "text") 
                  : "text";
                reply += `#### Berkas: \`${file.path}\`\n\`\`\`${ext}\n${file.content}\n\`\`\`\n\n`;
              }
            }
            if (data.build_instructions) {
              reply += `#### Instruksi Build:\n${data.build_instructions}\n\n`;
            }
            return reply;
          }

          // Fallback to other possible fields in case it returned standard OpenAI properties instead
          if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
          }
          if (data.reply) return data.reply;
          if (data.text) return data.text;
          if (data.response) return data.response;
          if (typeof data === "string") return data;
          return JSON.stringify(data);
        } else {
          const text = await response.text();
          console.warn(`[Custom AI Server] Format kustom ke ${url} gagal dengan status ${response.status}: ${text}`);
        }
      } catch (err: any) {
        console.warn(`[Custom AI Server] Format kustom ke ${url} gagal dengan error: ${err.message}`);
      }
    }

    const payload = {
      model: model || "gemini-3.5-flash" || "llama3",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: promptContext }
      ],
      temperature: temp
    };

    // STRATEGY 2: Try OpenAI compatible chat completions endpoint (e.g. /v1/chat/completions)
    try {
      console.log(`[Custom AI Server] Mencoba format OpenAI: ${chatCompletionsUrl}`);
      const response = await fetch(chatCompletionsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data: any = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
          return data.choices[0].message.content;
        }
      } else {
        const text = await response.text();
        console.warn(`[Custom AI Server] Format OpenAI gagal dengan status ${response.status}: ${text}`);
      }
    } catch (err: any) {
      console.warn(`[Custom AI Server] Format OpenAI gagal: ${err.message}`);
    }

    // STRATEGY 3: Try direct POST to the exact root/input endpoint
    try {
      console.log(`[Custom AI Server] Mencoba POST langsung ke: ${targetUrl}`);
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data: any = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
          return data.choices[0].message.content;
        }
        if (data.reply) return data.reply;
        if (data.text) return data.text;
        if (data.response) return data.response;
      } else {
        const text = await response.text();
        console.warn(`[Custom AI Server] POST langsung gagal dengan status ${response.status}: ${text}`);
      }
    } catch (err: any) {
      console.warn(`[Custom AI Server] POST langsung gagal: ${err.message}`);
    }

    // STRATEGY 4: Try Ollama Native generate format (/api/generate)
    const ollamaUrl = `${baseUrl}/api/generate`;
    try {
      console.log(`[Custom AI Server] Mencoba format Ollama: ${ollamaUrl}`);
      const response = await fetch(ollamaUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model || "llama3",
          prompt: `${systemInstruction}\n\n${promptContext}`,
          stream: false,
          options: { temperature: temp }
        }),
      });

      if (response.ok) {
        const data: any = await response.json();
        if (data.response) {
          return data.response;
        }
      } else {
        const text = await response.text();
        console.warn(`[Custom AI Server] Format Ollama gagal dengan status ${response.status}: ${text}`);
      }
    } catch (err: any) {
      console.warn(`[Custom AI Server] Format Ollama gagal: ${err.message}`);
    }

    // STRATEGY 5: Try sending simple raw text format
    try {
      console.log(`[Custom AI Server] Mencoba format teks sederhana ke: ${targetUrl}`);
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `${systemInstruction}\n\n${promptContext}`,
          temperature: temp
        }),
      });

      if (response.ok) {
        const data: any = await response.json();
        return data.text || data.reply || data.response || JSON.stringify(data);
      } else {
        const text = await response.text();
        console.warn(`[Custom AI Server] Format teks sederhana gagal dengan status ${response.status}: ${text}`);
      }
    } catch (err: any) {
      console.error(`[Custom AI Server] Format teks sederhana gagal: ${err.message}`);
    }

    throw new Error(`Gagal menghubungi Server AI di ${serverUrl}. Pastikan server aktif dan dapat diakses tanpa membutuhkan API key.`);
  }

  // Endpoint to test the custom AI Server connection
  app.post("/api/project/test-server", async (req, res) => {
    try {
      const { customAiServerUrl, model } = req.body;
      const serverUrl = customAiServerUrl || "168.110.223.212:7777";
      const testModel = model || "gemini-3.5-flash";
      
      console.log(`[Custom AI Server] Menguji koneksi ke server kustom: ${serverUrl} dengan model: ${testModel}`);
      
      const reply = await callCustomAiServer(
        serverUrl,
        testModel,
        "You are a connection tester. Reply with exactly 'Koneksi Sukses!' or any simple positive acknowledgement.",
        "Ping",
        0.1
      );
      
      res.json({ success: true, message: "Koneksi berhasil!", reply });
    } catch (err: any) {
      console.error("[Custom AI Server] Uji koneksi gagal:", err);
      res.status(500).json({ success: false, error: err.message || "Gagal menghubungi server kustom." });
    }
  });

  // 3. Chat with Gemini to generate code
  app.post("/api/project/chat", async (req, res) => {
    try {
      const ip = req.ip || "unknown";
      const tokens = (req.body.message || "").length / 4;
      const limits = checkLimits(ip, tokens);
      if (!limits.allowed) return res.status(429).json({ error: limits.message });

      const {
        message,
        mainDart,
        pubspec, 
        simulateError, 
        model, 
        temperature, 
        systemInstructionOverride,
        topP,
        topK,
        maxOutputTokens,
        useCustomAiServer,
        customAiServerUrl
      } = req.body;

      if (simulateError) {
        // Trigger simulated API call failure for testing UI error handling
        throw new Error("Simulated API Error: The AI service is currently overloaded or experiencing high latency. Please retry in a moment.");
      }

      const systemInstruction = systemInstructionOverride || (
        "You are AI Evo App Builder, an expert assistant that helps users build Flutter/Dart applications.\n" +
        "You help users refine their apps, add interactive features, fix errors, or style layouts.\n" +
        "You must output clear conversational explanations accompanied by updated Dart/Flutter code.\n" +
        "CRITICAL: Always output complete or modular code blocks inside Dart markdown code blocks:\n" +
        "```dart\n" +
        "// Your Dart code here\n" +
        "```\n" +
        "Keep the code clean, fully compile-safe, and modern (e.g. using correct widget types, styling, etc.)."
      );

      const promptContext = 
        `We are building an applet. Here is the current source code state.\n\n` +
        `--- CURRENT lib/main.dart ---\n${mainDart || '// Empty'}\n\n` +
        `--- CURRENT pubspec.yaml ---\n${pubspec || '// Empty'}\n\n` +
        `User Prompt: ${message}`;

      const tempVal = typeof temperature === "number" ? temperature : 0.7;

      // Handle custom AI server routing
      if (useCustomAiServer) {
        const serverUrl = customAiServerUrl || "168.110.223.212:7777";
        try {
          const reply = await callCustomAiServer(serverUrl, model, systemInstruction, promptContext, tempVal, req.body.userId, req.body.targetPlatform);
          return res.json({ reply });
        } catch (err: any) {
          return res.status(500).json({ error: err.message || "Gagal memproses dengan Server AI kustom." });
        }
      }

      // Default standard Gemini API route
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured on the server. Please define the key in Settings > Secrets to enable active AI generations.");
      }

      if (!ai) {
        ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
      }

      const config: any = {
        systemInstruction,
        temperature: tempVal,
      };

      if (typeof topP === "number") {
        config.topP = topP;
      }
      if (typeof topK === "number") {
        config.topK = topK;
      }
      if (typeof maxOutputTokens === "number") {
        config.maxOutputTokens = maxOutputTokens;
      }

      const response = await ai.models.generateContent({
        model: model || "gemini-3.5-flash",
        contents: promptContext,
        config: config,
      });

      const reply = response.text || "Sorry, I couldn't generate a response.";
      res.json({ reply });
    } catch (error: any) {
      console.error("Error in AI generate content:", error);
      res.status(500).json({ error: error.message || "An unexpected error occurred during AI processing." });
    }
  });

  // Helper to resolve custom server base URL
  function getRemoteServerUrl(overrideUrl?: string): string {
    let url = (overrideUrl || "168.110.223.212:7777").trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "http://" + url;
    }
    if (url.endsWith("/")) {
      url = url.slice(0, -1);
    }
    return url;
  }

  // Remote Project Sync Endpoints (Proxying to http://168.110.223.212:7777 or configured server)
  app.post("/api/remote/project/save", async (req, res) => {
    try {
      const { customServerUrl, project } = req.body;
      const baseUrl = getRemoteServerUrl(customServerUrl);
      const targetUrl = `${baseUrl}/api/project/save`;

      console.log(`[Proxy Save] Mengirim data ke: ${targetUrl}`);
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(project || req.body)
      });

      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      } else {
        const text = await response.text();
        return res.status(response.status).json({ error: text || "Gagal menyimpan proyek ke server remote." });
      }
    } catch (err: any) {
      console.error("[Proxy Save Error]:", err);
      res.status(500).json({ error: `Gagal menghubungi server kustom: ${err.message}` });
    }
  });

  app.post("/api/remote/project/load", async (req, res) => {
    try {
      const { customServerUrl, id, projectId } = req.body;
      const baseUrl = getRemoteServerUrl(customServerUrl);
      const targetUrl = `${baseUrl}/api/project/load`;

      console.log(`[Proxy Load] Mengirim data ke: ${targetUrl}`);
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id || projectId, projectId: projectId || id })
      });

      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      } else {
        const text = await response.text();
        return res.status(response.status).json({ error: text || "Gagal memuat proyek dari server kustom." });
      }
    } catch (err: any) {
      console.error("[Proxy Load Error]:", err);
      res.status(500).json({ error: `Gagal menghubungi server kustom: ${err.message}` });
    }
  });

  app.post("/api/remote/project/list", async (req, res) => {
    try {
      const { customServerUrl } = req.body;
      const baseUrl = getRemoteServerUrl(customServerUrl);
      const targetUrl = `${baseUrl}/api/project/list`;

      console.log(`[Proxy List] Mengambil list dari: ${targetUrl}`);
      let response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        response = await fetch(targetUrl, { method: "GET" });
      }

      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      } else {
        const text = await response.text();
        return res.status(response.status).json({ error: text || "Gagal mendapatkan list proyek dari server kustom." });
      }
    } catch (err: any) {
      console.error("[Proxy List Error]:", err);
      res.status(500).json({ error: `Gagal menghubungi server kustom: ${err.message}` });
    }
  });

  app.post("/api/remote/project/delete", async (req, res) => {
    try {
      const { customServerUrl, id, projectId } = req.body;
      const baseUrl = getRemoteServerUrl(customServerUrl);
      const targetUrl = `${baseUrl}/api/project/delete`;

      console.log(`[Proxy Delete] Menghapus di: ${targetUrl}`);
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: id || projectId, projectId: projectId || id })
      });

      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      } else {
        const text = await response.text();
        return res.status(response.status).json({ error: text || "Gagal menghapus proyek di server kustom." });
      }
    } catch (err: any) {
      console.error("[Proxy Delete Error]:", err);
      res.status(500).json({ error: `Gagal menghubungi server kustom: ${err.message}` });
    }
  });

  app.post("/api/remote/vip/subscribe", async (req, res) => {
    try {
      const { customServerUrl, email, plan } = req.body;
      const baseUrl = getRemoteServerUrl(customServerUrl);
      const targetUrl = `${baseUrl}/vip/subscribe`;

      console.log(`[Proxy Subscribe] Mengirim ke: ${targetUrl}`);
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan: plan || "premium" })
      });

      if (response.ok) {
        const data = await response.json();
        return res.json(data);
      } else {
        const text = await response.text();
        return res.status(response.status).json({ error: text || "Gagal memproses langganan VIP di server." });
      }
    } catch (err: any) {
      console.error("[Proxy Subscribe Error]:", err);
      res.status(500).json({ error: `Gagal menghubungi server kustom: ${err.message}` });
    }
  });

  // Integrate Vite for development, or static file serving for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production build from dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Startup error:", err);
});
