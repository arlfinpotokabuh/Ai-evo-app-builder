import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Send,
  Copy,
  Check,
  Settings,
  Smartphone,
  Play,
  FileCode,
  Folder,
  ArrowRight,
  Cpu,
  Layers,
  CheckCircle2,
  X,
  FileText,
  Search,
  Sliders,
  Clock,
  Key,
  Database,
  Grid,
  Activity,
  Globe,
  HelpCircle,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  Code
} from "lucide-react";

// Mirroring parent Project and Message interfaces
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
}

interface AiStudioAppsDashboardProps {
  projects: Project[];
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  chatHistory: Record<string, Message[]>;
  onSendMessage: (text: string) => Promise<void>;
  isProcessing: boolean;
  aiStage: string;
  onCreateProject: (name: string, type: Project["type"]) => void;
  onDeleteProject: (id: string, e?: React.MouseEvent) => void;
  onOpenProject: (id: string) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  temperature: number;
  setTemperature: (temp: number) => void;
  // Custom server settings & remote syncing
  useCustomAiServer?: boolean;
  setUseCustomAiServer?: (val: boolean) => void;
  customAiServerUrl?: string;
  setCustomAiServerUrl?: (val: string) => void;
  onImportProject?: (project: Project) => void;
}

export default function AiStudioAppsDashboard({
  projects,
  activeProjectId,
  setActiveProjectId,
  chatHistory,
  onSendMessage,
  isProcessing,
  aiStage,
  onCreateProject,
  onDeleteProject,
  onOpenProject,
  selectedModel,
  setSelectedModel,
  temperature,
  setTemperature,
  useCustomAiServer = false,
  setUseCustomAiServer,
  customAiServerUrl = "168.110.223.212:7777",
  setCustomAiServerUrl,
  onImportProject
}: AiStudioAppsDashboardProps) {
  // Navigation tabs in AI Studio
  const [activeSubTab, setActiveSubTab] = useState<"library" | "apikeys" | "gallery" | "settings">("library");

  // Remote sync states
  const [remoteProjects, setRemoteProjects] = useState<any[]>([]);
  const [isFetchingRemote, setIsFetchingRemote] = useState(false);
  const [isSyncingRemote, setIsSyncingRemote] = useState(false);
  const [vipEmail, setVipEmail] = useState("");
  const [isVipSubscribed, setIsVipSubscribed] = useState(() => {
    return localStorage.getItem("ai_evo_vip_subscribed") === "true";
  });
  const [vipMessage, setVipMessage] = useState("");

  // Custom connection test states
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"unchecked" | "online" | "offline">("unchecked");
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const actualCustomUrl = customAiServerUrl || "168.110.223.212:7777";

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus("unchecked");
    setConnectionError(null);
    try {
      const response = await fetch("/api/project/test-server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customAiServerUrl: actualCustomUrl,
          model: selectedModel
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setConnectionStatus("online");
        alert(`Koneksi Sukses!\n\nBerhasil menghubungi server AI VM kustom di ${actualCustomUrl}.\n\nRespon server: "${data.reply || 'OK'}"`);
      } else {
        setConnectionStatus("offline");
        setConnectionError(data.error || "Gagal menghubungi server kustom.");
        alert(`Koneksi Gagal!\n\nError: ${data.error || "Gagal menghubungi server kustom."}`);
      }
    } catch (error: any) {
      setConnectionStatus("offline");
      setConnectionError(error.message || "Kesalahan jaringan.");
      alert(`Koneksi Gagal!\n\nKesalahan jaringan: ${error.message || "Gagal menghubungi server."}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Fetch the list of remote projects
  const fetchRemoteProjects = async () => {
    setIsFetchingRemote(true);
    try {
      const response = await fetch("/api/remote/project/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customServerUrl: actualCustomUrl })
      });
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : (data.projects || data.data || []);
        setRemoteProjects(list);
      } else {
        const err = await response.json();
        console.warn(`Gagal mengambil proyek cloud: ${err.error || 'Server error'}`);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsFetchingRemote(false);
    }
  };

  // Push / Save active project to remote server
  const pushActiveProjectToCloud = async () => {
    const activeProject = projects.find(p => p.id === selectedAppId) || projects[0];
    if (!activeProject) {
      alert("Tidak ada proyek aktif yang terpilih untuk disimpan.");
      return;
    }

    setIsSyncingRemote(true);
    try {
      const response = await fetch("/api/remote/project/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customServerUrl: actualCustomUrl,
          project: {
            id: activeProject.id,
            name: activeProject.name,
            description: activeProject.description,
            mainDart: activeProject.mainDart,
            pubspec: activeProject.pubspec,
            type: activeProject.type
          }
        })
      });

      if (response.ok) {
        alert(`Sukses! Proyek '${activeProject.name}' berhasil disimpan ke Server Cloud kustom Anda.`);
        fetchRemoteProjects();
      } else {
        const err = await response.json();
        alert(`Gagal menyimpan proyek: ${err.error || 'Server error'}`);
      }
    } catch (error: any) {
      console.error(error);
      alert(`Gagal menghubungi server: ${error.message}`);
    } finally {
      setIsSyncingRemote(false);
    }
  };

  // Import / Load project from remote server
  const importProjectFromCloud = async (remoteId: string) => {
    setIsFetchingRemote(true);
    try {
      const response = await fetch("/api/remote/project/load", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customServerUrl: actualCustomUrl,
          id: remoteId
        })
      });

      if (response.ok) {
        const data = await response.json();
        const pData = data.project || data;
        
        const importedProj: Project = {
          id: pData.id || remoteId,
          name: pData.name || "Remote Project",
          description: pData.description || "Project loaded from remote server",
          mainDart: pData.mainDart || "",
          pubspec: pData.pubspec || "",
          type: pData.type || "custom"
        };

        if (onImportProject) {
          onImportProject(importedProj);
        } else {
          alert(`Kode Proyek Berhasil Diambil!\n\nMain.dart:\n${importedProj.mainDart.slice(0, 200)}...`);
        }
      } else {
        const err = await response.json();
        alert(`Gagal memuat proyek dari server: ${err.error || 'Server error'}`);
      }
    } catch (error: any) {
      console.error(error);
      alert(`Gagal menghubungi server: ${error.message}`);
    } finally {
      setIsFetchingRemote(false);
    }
  };

  // Delete project from remote server
  const deleteProjectFromCloud = async (remoteId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus proyek ini dari server remote? Tindakan ini permanen.")) {
      return;
    }
    setIsFetchingRemote(true);
    try {
      const response = await fetch("/api/remote/project/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customServerUrl: actualCustomUrl,
          id: remoteId
        })
      });

      if (response.ok) {
        alert("Proyek berhasil dihapus dari Server Cloud remote!");
        fetchRemoteProjects();
      } else {
        const err = await response.json();
        alert(`Gagal menghapus proyek dari server: ${err.error || 'Server error'}`);
      }
    } catch (error: any) {
      console.error(error);
      alert(`Gagal menghapus proyek: ${error.message}`);
    } finally {
      setIsFetchingRemote(false);
    }
  };

  // Subscribe to VIP
  const handleVipSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipEmail.trim()) return;

    setIsSyncingRemote(true);
    try {
      const response = await fetch("/api/remote/vip/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customServerUrl: actualCustomUrl,
          email: vipEmail.trim()
        })
      });

      if (response.ok) {
        const data = await response.json();
        setIsVipSubscribed(true);
        localStorage.setItem("ai_evo_vip_subscribed", "true");
        setVipMessage(data.message || "Selamat! Akun VIP Anda telah berhasil diaktifkan secara instant di server.");
      } else {
        const err = await response.json();
        alert(`Gagal memproses VIP: ${err.error || 'Server error'}`);
      }
    } catch (error: any) {
      console.error(error);
      alert(`Gagal menghubungi server: ${error.message}`);
    } finally {
      setIsSyncingRemote(false);
    }
  };

  // Fetch remote projects once settings tab opens
  useEffect(() => {
    if (activeSubTab === "settings") {
      fetchRemoteProjects();
    }
  }, [activeSubTab, customAiServerUrl]);
  
  // Dashboard states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "chat" | "utility">("all");
  const [selectedAppId, setSelectedAppId] = useState<string>(activeProjectId || projects[0]?.id || "");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  
  // New App form states
  const [newAppName, setNewAppName] = useState("");
  const [newAppType, setNewAppType] = useState<Project["type"]>("counter");

  // Chat input state inside preview panel
  const [previewInput, setPreviewInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync selectedAppId if activeProjectId changes
  useEffect(() => {
    if (activeProjectId) {
      setSelectedAppId(activeProjectId);
    }
  }, [activeProjectId]);

  // Find currently previewed app object
  const selectedApp = useMemo(() => {
    return projects.find((p) => p.id === selectedAppId) || projects[0] || null;
  }, [projects, selectedAppId]);

  // Filtered projects for the list table
  const filteredApps = useMemo(() => {
    return projects.filter((app) => {
      const matchesSearch =
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (selectedFilter === "all") return matchesSearch;
      if (selectedFilter === "chat") {
        return matchesSearch && (app.type === "custom" || app.type === "todo");
      }
      if (selectedFilter === "utility") {
        return matchesSearch && (app.type === "counter" || app.type === "weather" || app.type === "calculator");
      }
      return matchesSearch;
    });
  }, [projects, searchQuery, selectedFilter]);

  // Scroll chat preview to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, selectedAppId, isProcessing]);

  const handleCopyKey = (keyText: string) => {
    navigator.clipboard.writeText(keyText);
    setCopiedKey(keyText);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName.trim()) return;
    onCreateProject(newAppName.trim(), newAppType);
    setNewAppName("");
    setIsNewAppModalOpen(false);
  };

  const handleSendPreviewMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewInput.trim() || isProcessing) return;
    
    // Set this project active so the message routes to it
    if (selectedApp && selectedApp.id !== activeProjectId) {
      setActiveProjectId(selectedApp.id);
    }
    
    const textToSend = previewInput.trim();
    setPreviewInput("");
    
    // Send message using the central handler
    await onSendMessage(textToSend);
  };

  // Preset Date modified generators for mock aesthetics
  const getAppModifiedDate = (appId: string) => {
    switch (appId) {
      case "proj-counter":
        return "10 menit yang lalu";
      case "proj-todo":
        return "1 jam yang lalu";
      case "proj-weather":
        return "Kemarin";
      case "proj-calculator":
        return "3 hari yang lalu";
      default:
        return "Baru saja";
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden font-sans select-none text-slate-800 h-full w-full">
      
      {/* Mobile Header for Dashboard (visible only on lg:hidden) */}
      <div className="lg:hidden bg-slate-900 border-b border-slate-800 text-white px-4 py-3 flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 text-white rounded-lg">
            <Sparkles className="h-4 w-4 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-tight">AI Evo Core</h2>
            <p className="text-[9px] text-slate-400 font-mono">aievo.com/apps</p>
          </div>
        </div>

        {/* Select Tab for Mobile */}
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveSubTab("library")}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
              activeSubTab === "library" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Apps
          </button>
          <button
            onClick={() => setActiveSubTab("apikeys")}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
              activeSubTab === "apikeys" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Keys
          </button>
          <button
            onClick={() => setActiveSubTab("gallery")}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
              activeSubTab === "gallery" ? "bg-indigo-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Gallery
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-row min-h-0 w-full overflow-hidden">
        
        {/* LEFT SUB-BAR: GOOGLE AI STUDIO NAVIGATION STYLE */}
        <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0">
        {/* Workspace Brand and Logo */}
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">AI Evo Core</h2>
            <p className="text-[10px] text-slate-400 font-mono">aievo.com/apps</p>
          </div>
        </div>

        {/* Create prompt dropdown trigger */}
        <div className="p-4">
          <button
            onClick={() => setIsNewAppModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" />
            Buat Prompt Aplikasi
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
            Menu AI Evo
          </div>
          <button
            onClick={() => setActiveSubTab("library")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === "library"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <Folder className="h-4 w-4 text-indigo-500" />
            <span>Saved Apps & Prompts</span>
            <span className="ml-auto bg-indigo-100 text-indigo-600 font-mono text-[9px] px-1.5 py-0.5 rounded-full font-bold">
              {projects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("apikeys")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === "apikeys"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <Key className="h-4 w-4 text-amber-500" />
            <span>API Keys & Server VM</span>
            <span className="ml-auto text-[9px] text-emerald-500 font-mono font-bold uppercase flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab("gallery")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === "gallery"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <Grid className="h-4 w-4 text-emerald-500" />
            <span>Prompt Gallery</span>
          </button>

          <button
            onClick={() => setActiveSubTab("settings")}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === "settings"
                ? "bg-slate-100 text-slate-900"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-950"
            }`}
          >
            <Settings className="h-4 w-4 text-slate-400" />
            <span>Global Playground Settings</span>
          </button>

          <div className="pt-6">
            <div className="text-[10px] font-bold text-slate-400 px-3 py-1.5 uppercase tracking-wider">
              System Connections
            </div>
            <div className="px-3 py-2 space-y-3.5">
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Globe className="h-3.5 w-3.5 text-slate-400" />
                <span>API Region: Jakarta</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Activity className="h-3.5 w-3.5 text-emerald-400" />
                <span>Latency: ~8ms</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Database className="h-3.5 w-3.5 text-indigo-400" />
                <span>Cache Storage: 4.8MB</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Footer info card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 m-3 rounded-xl space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
            <span>Playground Mode Active</span>
          </div>
          <p className="text-[9px] text-slate-400 leading-normal">
            Menghubungkan langsung workspace lokal Anda ke Gemini API secara aman dan real-time.
          </p>
        </div>
      </aside>

      {/* CENTER WORKSPACE: APP LISTING / KEYS / GALLERY SCREEN */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-y-auto">
        
        {/* VIEW 1: MY LIBRARY APP LIST */}
        {activeSubTab === "library" && (
          <div className="p-8 space-y-6 max-w-5xl w-full mx-auto">
            
            {/* Header row */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">My Prompts & Apps</h1>
                <p className="text-xs text-slate-500 mt-1">Kelola, uji, dan kembangkan aplikasi Flutter Anda menggunakan kecerdasan Gemini AI.</p>
              </div>
              <div className="flex items-center gap-2 bg-indigo-55/10 bg-indigo-50/60 border border-indigo-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700">
                <Clock className="h-3.5 w-3.5 text-indigo-500" />
                <span>Pembaruan otomatis aktif</span>
              </div>
            </div>

            {/* Controls Filter & Search */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Search Bar */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari prompt atau deskripsi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-xl text-xs bg-slate-50 text-slate-800"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-full md:w-auto">
                <button
                  onClick={() => setSelectedFilter("all")}
                  className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedFilter === "all"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Semua ({projects.length})
                </button>
                <button
                  onClick={() => setSelectedFilter("chat")}
                  className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedFilter === "chat"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Chat Prompts
                </button>
                <button
                  onClick={() => setSelectedFilter("utility")}
                  className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedFilter === "utility"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Utility Apps
                </button>
              </div>
            </div>

            {/* App List Table */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="min-w-full divide-y divide-slate-100 table-fixed">
                {/* Table Header */}
                <div className="bg-slate-50 px-4 sm:px-6 py-3.5 grid grid-cols-12 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono border-b border-slate-150">
                  <div className="col-span-8 sm:col-span-6">Nama Prompt / Aplikasi</div>
                  <div className="hidden sm:block sm:col-span-3">Tipe Prompt</div>
                  <div className="hidden md:block md:col-span-1">Model Aktif</div>
                  <div className="col-span-4 sm:col-span-3 md:col-span-2 text-right">Diubah / Aksi</div>
                </div>
                
                {/* Table Body */}
                <div className="divide-y divide-slate-100 bg-white">
                  {filteredApps.length === 0 ? (
                    <div className="p-12 text-center text-slate-400">
                      <Folder className="h-12 w-12 text-slate-300 mx-auto mb-3 animate-pulse" />
                      <p className="text-xs font-semibold">Tidak ada prompt atau aplikasi ditemukan</p>
                      <p className="text-[10px] text-slate-400 mt-1">Gunakan kata kunci pencarian lain atau buat baru.</p>
                    </div>
                  ) : (
                    filteredApps.map((app) => {
                      const isSelected = app.id === selectedAppId;
                      const hasHistory = (chatHistory[app.id] || []).length;
                      return (
                        <div
                          key={app.id}
                          onClick={() => {
                            setSelectedAppId(app.id);
                            // On mobile screens, open project directly on click for instant entry
                            if (window.innerWidth < 1024) {
                              onOpenProject(app.id);
                            }
                          }}
                          className={`px-4 sm:px-6 py-4 grid grid-cols-12 items-center hover:bg-slate-50/80 transition-all cursor-pointer ${
                            isSelected ? "bg-indigo-50/30 border-l-4 border-indigo-500 pl-3 sm:pl-[20px]" : "pl-4 sm:pl-6"
                          }`}
                        >
                          {/* Name & Description */}
                          <div className="col-span-8 sm:col-span-6 min-w-0 pr-2 sm:pr-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`p-2 rounded-lg shrink-0 ${
                                isSelected ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-500"
                              }`}>
                                {app.type === "todo" || app.type === "custom" ? (
                                  <MessageSquare className="h-4 w-4" />
                                ) : (
                                  <Smartphone className="h-4 w-4" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-slate-900 truncate flex items-center gap-1.5">
                                  {app.name}
                                  {app.id === activeProjectId && (
                                    <span className="text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-1 rounded-sm leading-none font-semibold font-mono py-0.5">OPEN</span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                  {app.description || "Tidak ada deskripsi workspace."}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Type */}
                          <div className="hidden sm:block sm:col-span-3">
                            <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider font-mono ${
                              app.type === "todo" || app.type === "custom"
                                ? "bg-indigo-50 text-indigo-600 border border-indigo-100"
                                : "bg-teal-50 text-teal-600 border border-teal-100"
                            }`}>
                              {app.type === "custom" ? "Chat Prompt" : `${app.type.toUpperCase()} APP`}
                            </span>
                          </div>

                          {/* Model */}
                          <div className="hidden md:block md:col-span-1">
                            <span className="text-slate-600 text-[11px] font-mono font-medium truncate block max-w-[120px]">
                              {selectedModel}
                            </span>
                          </div>

                          {/* Last Modified & Hover Quick Open */}
                          <div className="col-span-4 sm:col-span-3 md:col-span-2 text-right text-[11px] text-slate-400 font-medium relative group">
                            <span className="md:group-hover:opacity-0 transition-opacity hidden sm:inline">
                              {getAppModifiedDate(app.id)}
                            </span>
                            
                            {/* Hover Buttons on desktop, ALWAYS visible on mobile */}
                            <div className="absolute inset-y-0 right-0 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-white pl-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenProject(app.id);
                                }}
                                className="p-1 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-md"
                                title="Buka di editor"
                              >
                                <Play className="h-3 w-3" />
                                <span className="hidden sm:inline">Buka</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteProject(app.id, e);
                                }}
                                className="p-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-md cursor-pointer transition-all"
                                title="Hapus prompt"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Quick tips */}
            <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 border border-slate-800 flex items-start gap-4">
              <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0">
                <Sparkles className="h-5 w-5 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Tips AI Evo Workspace</h4>
                <p className="text-xs text-slate-350 text-slate-400 leading-relaxed">
                  Gunakan menu <strong>API Keys & Server VM</strong> di samping untuk mengonfigurasi API Key kustom atau menggunakan AI Server VM alternatif jika Anda ingin memotong rate limits sandbox, atau klik salah satu row di atas untuk langsung membuka <strong>Chat Preview Quick Test</strong> panel di sisi kanan!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: GET API KEYS */}
        {activeSubTab === "apikeys" && (
          <div className="p-8 space-y-6 max-w-5xl w-full mx-auto">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">API Keys & AI Server VM</h1>
              <p className="text-xs text-slate-500 mt-1">Pilih sumber daya kecerdasan buatan utama Anda: API Key Gemini Resmi Google atau AI Server VM Alternatif untuk pengerjaan aplikasi.</p>
            </div>

            {/* Provider Mode Selection */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Pilih Model Provider Utama</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Konfigurasikan apakah chat playground dan generator aplikasi menggunakan API Google atau AI Server VM.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gemini Card */}
                <div 
                  onClick={() => setUseCustomAiServer?.(false)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    !useCustomAiServer 
                      ? "bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/10" 
                      : "bg-white border-slate-200 hover:border-slate-350 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-2xl">♊</span>
                    <h4 className="text-xs font-extrabold text-slate-950">Google Gemini API (Official)</h4>
                    {!useCustomAiServer && <span className="ml-auto text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">Aktif</span>}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Gunakan API Key Gemini resmi Google. Menawarkan tingkat kecerdasan maksimal dan mendukung model terbaru (Gemini 1.5 & 2.0).
                  </p>
                </div>

                {/* AI Server VM Card */}
                <div 
                  onClick={() => setUseCustomAiServer?.(true)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    useCustomAiServer 
                      ? "bg-white border-indigo-600 shadow-md ring-2 ring-indigo-500/10" 
                      : "bg-white border-slate-200 hover:border-slate-350 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-2xl">🖥️</span>
                    <h4 className="text-xs font-extrabold text-slate-950">AI Server VM (Alternatif)</h4>
                    {useCustomAiServer && <span className="ml-auto text-[9px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold">Aktif</span>}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Gunakan AI Server VM alternatif jika Anda ingin pengerjaan aplikasi lebih leluasa. Batas: 5 req/menit, 100k token/hari.
                  </p>
                </div>
              </div>

              {/* Server VM Connection Info / Configuration input */}
              {useCustomAiServer && (
                <div className="bg-white border border-indigo-100 rounded-xl p-4 space-y-3 animate-in fade-in duration-150">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-850">Alamat Koneksi AI Server VM</h4>
                      <p className="text-[10px] text-slate-400">Masukkan IP dan Port VM Anda. Default URL: 168.110.223.212:7777</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isTestingConnection ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span>
                          <span className="text-[10px] text-amber-600 font-mono font-bold">Menguji...</span>
                        </>
                      ) : connectionStatus === "online" ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span className="text-[10px] text-emerald-600 font-mono font-bold">Server Online</span>
                        </>
                      ) : connectionStatus === "offline" ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                          <span className="text-[10px] text-red-600 font-mono font-bold" title={connectionError || ""}>Server Offline</span>
                        </>
                      ) : (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                          <span className="text-[10px] text-slate-500 font-mono font-bold">Belum Diuji</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customAiServerUrl}
                      onChange={(e) => setCustomAiServerUrl?.(e.target.value)}
                      placeholder="e.g. 168.110.223.212:7777"
                      className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-lg px-3 py-2 text-xs font-mono text-slate-850 focus:outline-none"
                    />
                    <button
                      disabled={isTestingConnection}
                      onClick={handleTestConnection}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                      {isTestingConnection ? "Menguji..." : "Uji Koneksi"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Key list card */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Daftar API Key Anda</h3>
                    <p className="text-[11px] text-slate-400">Total 2 Active Keys Terdeteksi</p>
                  </div>
                </div>
                <button
                  onClick={() => alert("Kunci API baru berhasil dibuat (Simulasi). Silakan salin di bawah.")}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create API Key
                </button>
              </div>

              {/* Simulated Keys List Table */}
              <div className="space-y-3">
                {[
                  { name: "My First Project Key", key: "AIzaSyArlf92-D8fJ2lPlkQx982zlmP0193-vla1", date: "July 09, 2026", status: "Active" },
                  { name: "Workspace Android Build Key", key: "AIzaSyD8s92n-K81lXoPqmS1zM89A12-v9sZ8", date: "July 08, 2026", status: "Active" }
                ].map((k, index) => (
                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200/60 gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                        {k.name}
                        <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-bold rounded border border-emerald-100 font-mono">ACTIVE</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-1 flex items-center gap-1.5">
                        <span>{k.key.substring(0, 12)}...{k.key.substring(k.key.length - 8)}</span>
                        <button
                          onClick={() => handleCopyKey(k.key)}
                          className="p-1 hover:bg-slate-200 text-slate-500 rounded transition-colors"
                          title="Salin API Key"
                        >
                          {copiedKey === k.key ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-slate-400 font-mono">Dibuat: {k.date}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">Rate Limit: 15 RPM / 1M TPM</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Statistics Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Stat Card 1 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
                  <TrendingUp className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Total Requests (24h)</div>
                  <div className="text-lg font-extrabold text-slate-800 mt-0.5">14,289 Req</div>
                  <div className="text-[9px] text-emerald-500 font-bold mt-0.5">↑ 24% dari kemarin</div>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
                  <Cpu className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Avg Latency Response</div>
                  <div className="text-lg font-extrabold text-slate-800 mt-0.5">18.5 ms</div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">Server Node: asia-east1</div>
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Token Sandbox Used</div>
                  <div className="text-lg font-extrabold text-slate-800 mt-0.5">48,209 / 1M</div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">Sisa Quota: 95.1%</div>
                </div>
              </div>
            </div>

            {/* Quick API Documentation card */}
            <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileCode className="h-4 w-4 text-indigo-400" />
                Quickstart Integration (Dart / Flutter SDK)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Anda dapat menghubungkan Flutter App buatan AI Evo ini ke API Key rill dengan menambahkan dependency <code>google_generative_ai</code> di <code>pubspec.yaml</code>, lalu panggil SDK modelnya seperti ini:
              </p>
              <pre className="p-4 bg-slate-950 rounded-xl font-mono text-[10px] text-emerald-400 overflow-x-auto leading-relaxed border border-slate-800/80">
{`import 'package:google_generative_ai/google_generative_ai.dart';

final model = GenerativeModel(
  model: 'gemini-1.5-flash',
  apiKey: 'AIzaSyArlf92-D8fJ2lPlkQx982zlmP0193-vla1', // API Key Anda
);

final content = [Content.text('Hai, bantu buat layout dashboard di Flutter!')];
final response = await model.generateContent(content);
print(response.text);`}
              </pre>
            </div>
          </div>
        )}

        {/* VIEW 3: PROMPT GALLERY */}
        {activeSubTab === "gallery" && (
          <div className="p-8 space-y-6 max-w-5xl w-full mx-auto">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Prompt Gallery</h1>
              <p className="text-xs text-slate-500 mt-1">Gunakan template pre-configured gratis untuk memulai aplikasi instan dengan tatanan UI Flutter optimal.</p>
            </div>

            {/* Grid list of templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: "Interactive Counter App", type: "counter" as const, desc: "Aplikasi pencatat angka visual dengan skema material3 warna teal, less/add button, dan reset state.", icon: "🔢" },
                { name: "To-Do Planner Board", type: "todo" as const, desc: "Sistem pengelola list tugas interaktif lengkap dengan input field, hapus task, dan checkboxes.", icon: "📝" },
                { name: "Weather Radar Widget", type: "weather" as const, desc: "Dashboard prakiraan cuaca visual lengkap dengan visualisasi suhu Celsius, kelembapan, dan angin.", icon: "⛅" },
                { name: "Slate Calculator Black", type: "calculator" as const, desc: "Kalkulator grid canggih dengan warna matte black yang mendukung +, -, *, / serta status bar.", icon: "🧮" }
              ].map((tpl, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                  <div className="space-y-2.5">
                    <div className="text-3xl">{tpl.icon}</div>
                    <h3 className="text-sm font-bold text-slate-950 group-hover:text-indigo-600 transition-colors">{tpl.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{tpl.desc}</p>
                    <div className="pt-2 flex gap-1.5">
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 font-mono text-[9px] rounded font-bold uppercase">TEMPLAT</span>
                      <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 font-mono text-[9px] rounded font-bold uppercase">FLUTTER READY</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const name = `${tpl.name} Instance`;
                      onCreateProject(name, tpl.type);
                      alert(`Berhasil menginstansiasi template ${tpl.name}!`);
                    }}
                    className="mt-5 w-full flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Instantiate Template
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: GLOBAL PLAYGROUND SETTINGS */}
        {activeSubTab === "settings" && (
          <div className="p-8 space-y-6 max-w-5xl w-full mx-auto">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Evo Global Configurations</h1>
              <p className="text-xs text-slate-500 mt-1">Atur parameter inferensi model default untuk semua pengerjaan aplikasi.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
              {/* Sliders and fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Model active */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-600 uppercase font-mono tracking-wider">Default Inference Model</label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="gemini-3.5-flash">Gemini 3.5 Flash (Default)</option>
                    <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Heavy Coding)</option>
                    <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Fast Speed)</option>
                  </select>
                </div>

                {/* Creativity Temperature */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-slate-600 uppercase font-mono tracking-wider">Creativity (Temperature)</label>
                    <span className="text-xs font-bold text-indigo-600 font-mono">{temperature.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-55 accent-indigo-600"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-semibold uppercase">
                    <span>Konsisten (0.0)</span>
                    <span>Kreatif (2.0)</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => {
                    setTemperature(0.7);
                    setSelectedModel("gemini-3.5-flash");
                    alert("Semua konfigurasi berhasil direset ke standar.");
                  }}
                  className="px-4 py-2 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl border border-slate-200 cursor-pointer transition-all"
                >
                  Reset ke Default
                </button>
              </div>
            </div>

            {/* CARD 2: KONEKSI SERVER AI KUSTOM & CLOUD SYNCHRONIZATION */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Database className="h-4 w-4 text-indigo-500" />
                  Koneksi Server AI & Sinkronisasi Cloud
                </h2>
                <p className="text-[11px] text-slate-500 mt-1">
                  Atur koneksi ke Server AI kustom gratis Anda untuk pengerjaan kode dan sinkronisasi proyek cloud tanpa batas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Custom AI Toggle */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={useCustomAiServer}
                      onChange={(e) => setUseCustomAiServer && setUseCustomAiServer(e.target.checked)}
                      className="rounded border-slate-300 bg-white text-indigo-600 focus:ring-0 cursor-pointer h-4 w-4"
                    />
                    <span className="text-xs font-bold text-slate-700">Aktifkan Server AI Kustom</span>
                  </label>
                  <p className="text-[10px] text-slate-400 leading-normal pl-6.5">
                    Jika diaktifkan, semua pembuatan kode di playground akan dialihkan ke server kustom Anda alih-alih menggunakan Gemini API resmi.
                  </p>
                </div>

                {/* Server URL Input */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono block">Alamat Server AI</label>
                  <input
                    type="text"
                    value={customAiServerUrl}
                    onChange={(e) => setCustomAiServerUrl && setCustomAiServerUrl(e.target.value)}
                    placeholder="e.g. 168.110.223.212:7777"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[9px] text-slate-400 block leading-tight">
                    Menggunakan IP publik server kustom Anda. Jangan sertakan http:// atau path endpoint.
                  </span>
                </div>
              </div>

              {/* Endpoints status table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-700 font-mono uppercase tracking-wider">Status Endpoints Terdeteksi</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { name: "Chat / Buat App", path: "/v1/chat/completions", method: "POST", active: useCustomAiServer },
                    { name: "Simpan Proyek", path: "/api/project/save", method: "POST", active: true },
                    { name: "Ambil Proyek", path: "/api/project/load", method: "POST", active: true },
                    { name: "List Proyek", path: "/api/project/list", method: "POST", active: true },
                    { name: "Hapus Proyek", path: "/api/project/delete", method: "POST", active: true },
                    { name: "VIP / Subscribe", path: "/vip/subscribe", method: "POST", active: true }
                  ].map((ep, i) => (
                    <div key={i} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg flex flex-col space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-700">{ep.name}</span>
                        <span className={`text-[8px] px-1 py-0.2 rounded font-mono font-bold ${ep.active ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-400"}`}>
                          {ep.active ? "ON" : "OFF"}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono truncate">{ep.path}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cloud Sync Manager */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">Sinkronisasi Proyek Cloud (Remote)</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">Manajemen backup dan transfer proyek aktif Anda langsung ke server cloud kustom.</p>
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      onClick={fetchRemoteProjects}
                      disabled={isFetchingRemote}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isFetchingRemote ? "Memuat..." : "Refresh List Cloud"}
                    </button>
                    <button
                      onClick={pushActiveProjectToCloud}
                      disabled={isSyncingRemote}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-indigo-600/10 disabled:opacity-50"
                    >
                      {isSyncingRemote ? "Menyimpan..." : "Simpan Proyek Aktif ke Cloud"}
                    </button>
                  </div>
                </div>

                {/* Remote list display */}
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                  {isFetchingRemote && remoteProjects.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                      <div className="animate-spin inline-block h-4 w-4 border-2 border-indigo-500 border-t-transparent rounded-full mr-2"></div>
                      Menghubungkan ke server cloud remote di {actualCustomUrl}...
                    </div>
                  ) : remoteProjects.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      Tidak ada proyek di server cloud kustom atau koneksi belum diinisialisasi. Klik "Refresh List Cloud" untuk mencoba.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {remoteProjects.map((proj, i) => (
                        <div key={proj.id || i} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-all">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800">{proj.name || "Remote App"}</span>
                              <span className="text-[9px] font-mono bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded uppercase font-bold">
                                {proj.type || "custom"}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5 max-w-lg">{proj.description || "No description provided."}</p>
                            <span className="text-[8px] font-mono text-slate-500 block mt-1">ID: {proj.id}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => importProjectFromCloud(proj.id)}
                              className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-indigo-600 text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1"
                              title="Ambil proyek ke workspace lokal"
                            >
                              Import
                            </button>
                            <button
                              onClick={() => deleteProjectFromCloud(proj.id)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg cursor-pointer transition-all"
                              title="Hapus proyek dari cloud"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CARD 3: VIP SUBSCRIPTION PANEL */}
            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl shadow-lg p-6 text-white space-y-6">
              <div className="border-b border-indigo-500/20 pb-4 flex justify-between items-start">
                <div>
                  <h2 className="text-sm font-extrabold tracking-tight text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                    VIP premium subscribe
                  </h2>
                  <p className="text-[10px] text-indigo-200/70 mt-1">
                    Aktifkan keanggotaan VIP instan untuk mendapatkan akses ke model kecerdasan buatan super kencang dan performa compile maksimal.
                  </p>
                </div>
                {isVipSubscribed && (
                  <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-extrabold text-[9px] px-2.5 py-1 rounded-full shadow-lg border border-amber-300 tracking-wider uppercase animate-bounce">
                    VIP Premium Active
                  </span>
                )}
              </div>

              {!isVipSubscribed ? (
                <form onSubmit={handleVipSubscribe} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[9px] font-bold text-indigo-300 uppercase tracking-wider font-mono block">Alamat Email Langganan</label>
                      <input
                        type="email"
                        required
                        value={vipEmail}
                        onChange={(e) => setVipEmail(e.target.value)}
                        placeholder="nama@email.com"
                        className="w-full bg-slate-950/80 border border-indigo-500/30 rounded-xl px-3 py-2 text-xs text-indigo-100 placeholder:text-indigo-400/30 focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSyncingRemote}
                      className="w-full py-2.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                    >
                      {isSyncingRemote ? "Memproses..." : "Aktifkan VIP Sekarang"}
                    </button>
                  </div>
                  <div className="text-[10px] text-indigo-300/60 leading-normal">
                    *Tindakan ini akan mendaftarkan email Anda langsung ke database VIP server remote di {actualCustomUrl}.
                  </div>
                </form>
              ) : (
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-2">
                  <h4 className="text-xs font-bold text-indigo-200">Terima kasih telah berlangganan VIP!</h4>
                  <p className="text-[11px] text-indigo-300/80 leading-relaxed">
                    {vipMessage || "Status keanggotaan VIP Anda aktif secara langsung di server cloud. Nikmati akses VIP super cepat dan bebas hambatan."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsVipSubscribed(false);
                      localStorage.removeItem("ai_evo_vip_subscribed");
                    }}
                    className="text-[9px] text-indigo-400 hover:text-white underline cursor-pointer"
                  >
                    Ganti email / Berhenti berlangganan (Simulasi)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* RIGHT SIDE PANEL: SLIDING CHAT PREVIEW / QUICK TEST (AI STUDIO DASHBOARD STYLE!) */}
      {activeSubTab === "library" && selectedApp && (
        <section className="hidden lg:flex w-[380px] bg-white border-l border-slate-200 flex-col shrink-0">
          
          {/* Preview Panel Header */}
          <div className="p-5 border-b border-slate-100 space-y-1 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono border border-indigo-100/50">
                Apps Chat Preview
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500" title="Ready to simulate"></span>
            </div>
            <h2 className="text-sm font-extrabold text-slate-900 tracking-tight truncate mt-1">
              {selectedApp.name}
            </h2>
            <p className="text-[10px] text-slate-400 truncate leading-relaxed">
              {selectedApp.description || "Uji prompt personanya di panel preview di bawah."}
            </p>
          </div>

          {/* Quick Chat History Stream Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30">
            {/* If no history, render empty state instruction bubble */}
            {(chatHistory[selectedApp.id] || []).length === 0 ? (
              <div className="p-4 bg-white border border-slate-250 border-slate-200 rounded-xl shadow-sm text-center text-slate-400">
                <MessageSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-[11px] font-bold">Mulai Percakapan Preview</p>
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  Belum ada riwayat obrolan. Kirim instruksi di bawah untuk merangsang koding AI persona aplikasi ini.
                </p>
              </div>
            ) : (
              (chatHistory[selectedApp.id] || []).map((msg) => {
                const isUser = msg.sender === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${
                      isUser ? "ml-auto items-end" : "mr-auto items-start"
                    }`}
                  >
                    <div className="text-[8px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-0.5 select-none">
                      {isUser ? "You" : "Gemini AI"}
                    </div>
                    <div
                      className={`px-3 py-2 rounded-2xl text-xs leading-relaxed break-words shadow-sm font-normal ${
                        isUser
                          ? "bg-slate-900 text-slate-100 rounded-tr-none"
                          : "bg-white border border-slate-200 text-slate-800 rounded-tl-none"
                      }`}
                    >
                      {/* Shorten markdown code rendering in preview drawer */}
                      {msg.text.length > 180 ? `${msg.text.substring(0, 180)}...` : msg.text}
                      {msg.text.includes("```dart") && (
                        <div className="mt-1 bg-slate-950 p-1.5 rounded text-[9px] font-mono text-emerald-400 leading-none flex items-center justify-between border border-slate-800 select-none">
                          <span>📦 Dart Code block attached</span>
                          <span className="text-[8px] text-indigo-400">Expand on Editor</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}

            {/* AI Generation Status / Streaming Tracker */}
            {isProcessing && selectedApp.id === activeProjectId && (
              <div className="flex flex-col items-start max-w-[85%]">
                <div className="text-[8px] font-bold font-mono text-slate-400 uppercase mb-0.5">Gemini AI</div>
                <div className="px-3 py-2 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2 text-xs text-slate-500">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping"></div>
                  <span>{aiStage || "Menghasilkan kode..."}</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Chat Input Action Bar */}
          <div className="p-3 bg-white border-t border-slate-100">
            <form onSubmit={handleSendPreviewMessage} className="flex gap-1.5 items-center">
              <input
                type="text"
                placeholder="Tulis pesan preview..."
                value={previewInput}
                onChange={(e) => setPreviewInput(e.target.value)}
                disabled={isProcessing}
                className="flex-1 px-3 py-2 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-xl text-xs bg-slate-50"
              />
              <button
                type="submit"
                disabled={isProcessing || !previewInput.trim()}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>

          {/* OPEN PROJECT IN PLAYGROUND FULL VIEW ACTION TRIGGER */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={() => onOpenProject(selectedApp.id)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-850 active:bg-slate-950 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer hover:translate-y-[-0.5px]"
            >
              <Smartphone className="h-4 w-4 text-indigo-400" />
              <span>Buka di Playground Editor ↗</span>
            </button>
          </div>
        </section>
      )}

      {/* MODAL: CREATE NEW PROMPT / APP (GOOGLE AI STUDIO STYLE) */}
      {isNewAppModalOpen && (
        <div className="fixed inset-0 z-[200] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" />
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">Buat Prompt Aplikasi Baru</h3>
              </div>
              <button
                onClick={() => setIsNewAppModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateApp} className="p-6 space-y-4">
              {/* Name field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Nama Aplikasi</label>
                <input
                  type="text"
                  placeholder="Contoh: Flutter Fitness Tracker, My Note Taking App"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-250 border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-slate-50 text-slate-800 font-semibold"
                  autoFocus
                />
              </div>

              {/* Template selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Template Struktur Dasar Flutter</label>
                <select
                  value={newAppType}
                  onChange={(e) => setNewAppType(e.target.value as Project["type"])}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500 bg-slate-50 text-slate-800 font-semibold cursor-pointer"
                >
                  <option value="counter">Interactive Counter (Teal Theme)</option>
                  <option value="todo">To-Do Task List (Indigo Planner)</option>
                  <option value="weather">Weather Forecast Radar (Blue Theme)</option>
                  <option value="calculator">Modern Grid Calculator (Matte Black)</option>
                  <option value="custom">Custom Canvas Template (Emp-state Sandbox)</option>
                </select>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed font-normal">
                *Aplikasi yang baru dibuat akan didasarkan pada template yang Anda pilih dan segera dipetakan ke dalam dashboard pengujian.
              </p>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewAppModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold rounded-xl hover:bg-slate-50 cursor-pointer transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!newAppName.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md shadow-indigo-600/10"
                >
                  Buat Aplikasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </div>
  );
}
