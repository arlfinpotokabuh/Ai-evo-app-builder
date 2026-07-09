import express from "express";
import path from "path";
import fs from "fs/promises";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

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

  // 3. Chat with Gemini to generate code
  app.post("/api/project/chat", async (req, res) => {
    try {
      const { message, mainDart, pubspec, simulateError, model, temperature } = req.body;

      if (simulateError) {
        // Trigger simulated API call failure for testing UI error handling
        throw new Error("Simulated API Error: The AI service is currently overloaded or experiencing high latency. Please retry in a moment.");
      }

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

      const systemInstruction = 
        "You are AI Evo App Builder, an expert assistant that helps users build Flutter/Dart applications.\n" +
        "You help users refine their apps, add interactive features, fix errors, or style layouts.\n" +
        "You must output clear conversational explanations accompanied by updated Dart/Flutter code.\n" +
        "CRITICAL: Always output complete or modular code blocks inside Dart markdown code blocks:\n" +
        "```dart\n" +
        "// Your Dart code here\n" +
        "```\n" +
        "Keep the code clean, fully compile-safe, and modern (e.g. using correct widget types, styling, etc.).";

      const promptContext = 
        `We are building an applet. Here is the current source code state.\n\n` +
        `--- CURRENT lib/main.dart ---\n${mainDart || '// Empty'}\n\n` +
        `--- CURRENT pubspec.yaml ---\n${pubspec || '// Empty'}\n\n` +
        `User Prompt: ${message}`;

      const response = await ai.models.generateContent({
        model: model || "gemini-3.5-flash",
        contents: promptContext,
        config: {
          systemInstruction,
          temperature: typeof temperature === "number" ? temperature : 0.7,
        },
      });

      const reply = response.text || "Sorry, I couldn't generate a response.";
      res.json({ reply });
    } catch (error: any) {
      console.error("Error in AI generate content:", error);
      res.status(500).json({ error: error.message || "An unexpected error occurred during AI processing." });
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
