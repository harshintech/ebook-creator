import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../utils/api";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  FileText,
  Settings,
  Sparkles,
  Save,
  Download,
  Upload,
  Loader2,
  CheckCircle,
  AlertCircle,
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Code,
  Share2,
  ChevronDown as ChevronDownIcon,
  Maximize2,
  Columns,
  X
} from "lucide-react";

const BookEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Helper to normalize cover image paths from backend
  const getCoverUrl = (path) => {
    if (!path) return null;
    let cleanPath = path.replace(/\\/g, "/");
    if (cleanPath.startsWith("/")) {
      cleanPath = cleanPath.substring(1);
    }
    if (!cleanPath.startsWith("backend/")) {
      cleanPath = "backend/" + cleanPath;
    }
    return `http://localhost:8000/${cleanPath}`;
  };

  // Core book data
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  // Selection states
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("studio"); // 'studio' (Editor), 'settings' (Book Details)
  const [workspaceMode, setWorkspaceMode] = useState("split"); // 'split', 'edit', 'preview'
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);

  // AI assistant configurations
  const [aiStyle, setAiStyle] = useState("Professional");
  const [generatingContent, setGeneratingContent] = useState(false);
  const [aiOption, setAiOption] = useState("replace"); // 'replace', 'append'

  // Dropdown states
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Saving states
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("saved"); // 'saved', 'unsaved', 'saving'
  const autoSaveTimeout = useRef(null);

  // Textarea Ref for formatting injection
  const textareaRef = useRef(null);

  // File uploads
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Fetch book details on load
  useEffect(() => {
    const fetchBook = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/books/${id}`);
        setBook(data);
        if (data.chapters && data.chapters.length > 0) {
          setActiveChapterIndex(0);
        }
      } catch (error) {
        console.error("Error loading book:", error);
        alert("Failed to load the book. Redirecting to dashboard.");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id, navigate]);

  // Clean up auto-save on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    };
  }, []);

  // Triggers backend save
  const handleSaveBook = async (updatedBook = book) => {
    if (!updatedBook) return;
    try {
      setSaveStatus("saving");
      setSaving(true);
      const { data } = await API.put(`/books/${id}`, updatedBook);
      setBook(data);
      setSaveStatus("saved");
    } catch (error) {
      console.error("Save book error:", error);
      setSaveStatus("unsaved");
    } finally {
      setSaving(false);
    }
  };

  // Triggers auto-save with debounce
  const triggerAutoSave = (updatedBook) => {
    setSaveStatus("unsaved");
    if (autoSaveTimeout.current) clearTimeout(autoSaveTimeout.current);
    autoSaveTimeout.current = setTimeout(() => {
      handleSaveBook(updatedBook);
    }, 2000);
  };

  // Chapter editing
  const handleChapterContentChange = (content) => {
    if (!book || !book.chapters[activeChapterIndex]) return;

    const updatedChapters = [...book.chapters];
    updatedChapters[activeChapterIndex] = {
      ...updatedChapters[activeChapterIndex],
      content
    };

    const updatedBook = { ...book, chapters: updatedChapters };
    setBook(updatedBook);
    triggerAutoSave(updatedBook);
  };

  const handleChapterMetadataChange = (field, value) => {
    if (!book || !book.chapters[activeChapterIndex]) return;

    const updatedChapters = [...book.chapters];
    updatedChapters[activeChapterIndex] = {
      ...updatedChapters[activeChapterIndex],
      [field]: value
    };

    const updatedBook = { ...book, chapters: updatedChapters };
    setBook(updatedBook);
    triggerAutoSave(updatedBook);
  };

  // Book metadata editing
  const handleBookMetadataChange = (field, value) => {
    if (!book) return;
    const updatedBook = { ...book, [field]: value };
    setBook(updatedBook);
    triggerAutoSave(updatedBook);
  };

  // Chapter addition
  const handleAddChapter = () => {
    if (!book) return;
    const newChapter = {
      title: `Chapter ${book.chapters.length + 1}: New Chapter`,
      description: "",
      content: ""
    };
    const updatedBook = { ...book, chapters: [...book.chapters, newChapter] };
    setBook(updatedBook);
    setActiveChapterIndex(updatedBook.chapters.length - 1);
    handleSaveBook(updatedBook);
  };

  // Chapter deletion
  const handleDeleteChapter = (index) => {
    if (!book || book.chapters.length <= 1) {
      alert("A book must have at least one chapter.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this chapter?")) {
      const updatedChapters = book.chapters.filter((_, i) => i !== index);
      const updatedBook = { ...book, chapters: updatedChapters };
      setBook(updatedBook);
      setActiveChapterIndex(0);
      handleSaveBook(updatedBook);
    }
  };

  // Rearranging chapters
  const moveChapter = (index, direction) => {
    if (!book) return;
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= book.chapters.length) return;

    const updatedChapters = [...book.chapters];
    const temp = updatedChapters[index];
    updatedChapters[index] = updatedChapters[newIndex];
    updatedChapters[newIndex] = temp;

    const updatedBook = { ...book, chapters: updatedChapters };
    setBook(updatedBook);
    setActiveChapterIndex(newIndex);
    handleSaveBook(updatedBook);
  };

  // Cover image file uploading
  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("coverImage", file);

    try {
      setUploadingImage(true);
      const { data } = await API.put(`/books/cover/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setBook(data);
      alert("Cover image uploaded successfully!");
    } catch (error) {
      console.error("Cover image upload failed:", error);
      alert("Failed to upload cover image. Limit files to under 2MB (JPEG, PNG, GIF).");
    } finally {
      setUploadingImage(false);
    }
  };

  // AI Content Generator
  const handleGenerateAIContent = async () => {
    const activeChapter = book.chapters[activeChapterIndex];
    if (!activeChapter) return;

    try {
      setGeneratingContent(true);
      const { data } = await API.post("/ai/generate-chapter-content", {
        chapterTitle: activeChapter.title,
        chapterDescription: activeChapter.description || "",
        style: aiStyle
      });

      if (data && data.content) {
        let newContent = "";
        if (aiOption === "replace") {
          newContent = data.content;
        } else {
          newContent = (activeChapter.content || "") + "\n\n" + data.content;
        }
        handleChapterContentChange(newContent);
      } else {
        alert("Failed to receive content from AI.");
      }
    } catch (error) {
      console.error("AI writing error:", error);
      alert("Failed to generate chapter content. Verify your backend API key.");
    } finally {
      setGeneratingContent(false);
    }
  };

  // Formatting injector helper
  const insertFormat = (syntaxBefore, syntaxAfter = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const selection = text.substring(start, end);
    const replacement = syntaxBefore + (selection || "text") + syntaxAfter;

    const newContent = text.substring(0, start) + replacement + text.substring(end);
    handleChapterContentChange(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + syntaxBefore.length,
        start + syntaxBefore.length + (selection ? selection.length : 4)
      );
    }, 0);
  };

  // Exports logic
  const handleExport = async (type) => {
    setExportDropdownOpen(false);
    try {
      const response = await API.get(`/export/${id}/${type}`, {
        responseType: "blob"
      });
      const contentType =
        type === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      const fileExt = type === "pdf" ? ".pdf" : ".docx";

      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${book.title.replace(/[^a-zA-Z0-9]/g, "_")}${fileExt}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Export ${type} failed:`, error);
      alert(`Failed to export as ${type.toUpperCase()}.`);
    }
  };

  const handleCopyShareLink = () => {
    if (book.status !== "published") {
      alert("Please set status to 'published' in Book Settings to copy public reading link.");
      return;
    }
    const publicUrl = `${window.location.origin}/public/books/${book._id}`;
    navigator.clipboard.writeText(publicUrl);
    alert(`Public sharing link copied to clipboard:\n${publicUrl}`);
  };

  // Client-side markdown regex parser
  const parseMarkdown = (mdText) => {
    if (!mdText) {
      return "<p class='text-slate-400 italic'>This chapter has no content. Start writing in the editor panel or use the AI panel on the right.</p>";
    }

    let html = mdText
      .replace(/&/g, "&amp;")
      .replace(/&lt;/g, "<") // avoid double escaping issues
      .replace(/&gt;/g, ">");

    // Headings
    html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

    // Blockquotes
    html = html.replace(/^\> (.*$)/gim, "<blockquote>$1</blockquote>");

    // Code blocks
    html = html.replace(/\`\`\`([\s\S]*?)\`\`\`/gim, "<pre><code>$1</code></pre>");

    // Inline code
    html = html.replace(/\`([^\`]+)\`/gim, "<code>$1</code>");

    // Bold
    html = html.replace(/\*\*([^\*]+)\*\*/gim, "<strong>$1</strong>");

    // Italic
    html = html.replace(/\*([^\*]+)\*/gim, "<em>$1</em>");
    html = html.replace(/_([^_]+)_/gim, "<em>$1</em>");

    // Lists (simple conversion)
    html = html.replace(/^\s*\-\s+(.*$)/gim, "<ul><li>$1</li></ul>");
    html = html.replace(/^\s*\*\s+(.*$)/gim, "<ul><li>$1</li></ul>");
    html = html.replace(/^\s*\d+\.\s+(.*$)/gim, "<ol><li>$1</li></ol>");
    html = html.replace(/<\/ul>\s*<ul>/g, "");
    html = html.replace(/<\/ol>\s*<ol>/g, "");

    // Paragraph groups
    const lines = html.split("\n");
    let result = "";
    let inParagraph = false;

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        if (inParagraph) {
          result += "</p>";
          inParagraph = false;
        }
        return;
      }

      if (
        trimmed.startsWith("<h") ||
        trimmed.startsWith("<blockquote") ||
        trimmed.startsWith("<pre") ||
        trimmed.startsWith("</pre>") ||
        trimmed.startsWith("<ul>") ||
        trimmed.startsWith("</ul>") ||
        trimmed.startsWith("<ol>") ||
        trimmed.startsWith("</ol>") ||
        trimmed.startsWith("<li>")
      ) {
        if (inParagraph) {
          result += "</p>";
          inParagraph = false;
        }
        result += line;
      } else {
        if (!inParagraph) {
          result += "<p>";
          inParagraph = true;
        }
        result += " " + line;
      }
    });

    if (inParagraph) {
      result += "</p>";
    }

    return result;
  };

  if (loading || !book) {
    return <div className="h-screen bg-slate-50" />;
  }

  const activeChapter = book.chapters[activeChapterIndex];

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Main Panel Workspace Header */}
      <header className="px-4 md:px-6 py-2.5 flex flex-wrap gap-3 items-center justify-between border-b border-slate-200 bg-white">
        {/* Workspace tabs: Editor and Book Details */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("studio")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${activeTab === "studio"
                ? "bg-white border-slate-300 text-slate-800 shadow-sm"
                : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
              }`}
          >
            <FileText size={14} className="text-slate-500" />
            <span className="hidden sm:inline">Editor</span>
            <span className="sm:hidden">Edit</span>
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${activeTab === "settings"
                ? "bg-white border-slate-300 text-slate-800 shadow-sm"
                : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
              }`}
          >
            <Settings size={14} className="text-slate-500" />
            <span className="hidden sm:inline">Book Details</span>
            <span className="sm:hidden">Settings</span>
          </button>
        </div>

        {/* Action controls (Export and Save changes) */}
        <div className="flex items-center gap-2 relative">
          <span className="hidden sm:flex items-center gap-1 text-[10px] text-slate-400 mr-2">
            {saveStatus === "saved" && <span className="text-emerald-600 font-medium">Saved</span>}
            {saveStatus === "unsaved" && <span className="text-amber-500 font-medium">Unsaved</span>}
            {saveStatus === "saving" && <span className="text-slate-500 font-medium animate-pulse">Saving...</span>}
          </span>

          {/* Export Dropdown toggle */}
          <div className="relative">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="flex items-center gap-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-300 text-xs font-bold text-slate-700 px-3.5 py-2 transition-all cursor-pointer shadow-sm"
            >
              <Download size={13} className="text-slate-500" />
              Export
              <ChevronDownIcon size={12} className="text-slate-400" />
            </button>

            {exportDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-xl p-1 shadow-lg z-50 animate-fade-in">
                <button
                  onClick={() => handleExport("pdf")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                >
                  <Download size={13} />
                  Export as PDF
                </button>
                <button
                  onClick={() => handleExport("doc")}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                >
                  <FileText size={13} />
                  Export as Word
                </button>
              </div>
            )}
          </div>

          {/* Save Changes button (solid purple) */}
          <button
            onClick={() => handleSaveBook()}
            className="flex items-center gap-1.5 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-xs font-bold text-white px-3 sm:px-4 py-2 transition-all cursor-pointer shadow-md"
          >
            <Save size={13} />
            <span className="hidden sm:inline">Save Changes</span>
            <span className="sm:hidden">Save</span>
          </button>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Backdrop for mobile chapters drawer */}
        {leftSidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setLeftSidebarOpen(false)}
          />
        )}

        {/* LEFT SIDEBAR: CHAPTER LIST AND NAVIGATION */}
        <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 border-r border-slate-200 flex flex-col bg-white shrink-0 justify-between transition-transform duration-300 ease-in-out ${leftSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}>
          <div className="flex flex-col">
            {/* Back to Dashboard and Book Title */}
            <div className="p-4 border-b border-slate-100 flex flex-col gap-3 text-left relative">
              <div className="flex items-center justify-between">
                <Link
                  to="/"
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 font-bold transition-colors cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  Back to Dashboard
                </Link>
                {/* Mobile close button */}
                <button
                  onClick={() => setLeftSidebarOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 md:hidden"
                  title="Close sidebar"
                >
                  <X size={16} />
                </button>
              </div>
              <h2 className="text-sm font-extrabold text-slate-800 leading-snug truncate mt-1">
                {book.title}
              </h2>
            </div>

            {/* Chapters list box */}
            <div className="p-3 overflow-y-auto space-y-1.5 max-h-[55vh]">
              {book.chapters.map((ch, idx) => (
                <div
                  key={ch._id || idx}
                  onClick={() => {
                    setActiveChapterIndex(idx);
                    setActiveTab("studio");
                    setLeftSidebarOpen(false); // Close mobile drawer on selection
                  }}
                  className={`group flex items-center gap-2.5 rounded-xl p-3 border transition-all text-left cursor-pointer ${idx === activeChapterIndex
                      ? "bg-[#7c3aed]/5 text-[#7c3aed] border-[#7c3aed]/30 shadow-sm"
                      : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-slate-200"
                    }`}
                >
                  {/* Grip dots handle representation */}
                  <span className="text-slate-350 shrink-0 font-bold text-xs select-none">
                    :::
                  </span>

                  <span className="flex-1 text-xs font-bold truncate">
                    {ch.title}
                  </span>

                  {/* Rearrange triggers */}
                  <div className="hidden group-hover:flex items-center gap-0.5 shrink-0 text-slate-400">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveChapter(idx, "up");
                      }}
                      disabled={idx === 0}
                      className="p-0.5 hover:text-[#7c3aed] disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronUp size={11} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        moveChapter(idx, "down");
                      }}
                      disabled={idx === book.chapters.length - 1}
                      className="p-0.5 hover:text-[#7c3aed] disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronDown size={11} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteChapter(idx);
                      }}
                      className="p-0.5 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New Chapter button (border dashed) */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <button
              onClick={handleAddChapter}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-slate-300 text-xs font-bold text-slate-500 hover:text-[#7c3aed] hover:border-[#7c3aed] transition-all cursor-pointer"
            >
              <Plus size={14} />
              New Chapter
            </button>
          </div>
        </aside>

        {/* MIDDLE WRITING WORKSPACE */}
        <main className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden">
          {/* 1. STUDIO VIEW */}
          {activeTab === "studio" && activeChapter && (
            <div className="h-full flex flex-col overflow-hidden animate-fade-in">
              {/* Header Title segment */}
              <div className="px-6 py-4 flex flex-wrap gap-4 items-center justify-between border-b border-slate-200 bg-white">
                <div className="flex items-center gap-3 text-left">
                  {/* Mobile sidebar toggle button */}
                  <button
                    onClick={() => setLeftSidebarOpen(true)}
                    className="p-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-500 cursor-pointer shadow-sm md:hidden"
                    title="Open Chapters"
                  >
                    <List size={14} />
                  </button>
                  <div>
                    <h1 className="text-xl font-bold text-slate-800">
                      Chapter Editor
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                      Editing: <span className="font-semibold text-slate-700">{activeChapter.title}</span>
                    </p>
                  </div>
                </div>

                {/* Right controls inside chapter editor: Toggle Mode and AI writer */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Mode switcher tabs (Edit, Preview) */}
                  <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-50 text-xs">
                    <button
                      onClick={() => setWorkspaceMode("edit")}
                      className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${workspaceMode === "edit"
                          ? "bg-white text-[#7c3aed] shadow-sm border border-slate-200/50"
                          : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setWorkspaceMode("split")}
                      className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${workspaceMode === "split"
                          ? "bg-white text-[#7c3aed] shadow-sm border border-slate-200/50"
                          : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                      Split
                    </button>
                    <button
                      onClick={() => setWorkspaceMode("preview")}
                      className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${workspaceMode === "preview"
                          ? "bg-white text-[#7c3aed] shadow-sm border border-slate-200/50"
                          : "text-slate-500 hover:text-slate-800"
                        }`}
                    >
                      Preview
                    </button>
                  </div>

                  {/* Split size icon toggles */}
                  <button
                    onClick={() => setWorkspaceMode(workspaceMode === "split" ? "edit" : "split")}
                    title="Toggle split workspace"
                    className="p-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-slate-500 cursor-pointer shadow-sm hidden sm:block"
                  >
                    <Columns size={13} />
                  </button>

                  {/* Generate button (solid purple) */}
                  <button
                    onClick={handleGenerateAIContent}
                    disabled={generatingContent}
                    className="flex items-center gap-1.5 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] text-xs font-bold text-white px-3.5 py-2 cursor-pointer shadow-sm disabled:opacity-55 transition-colors"
                  >
                    {generatingContent ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Sparkles size={13} />
                    )}
                    Generate with AI
                  </button>
                </div>
              </div>

              {/* Title input and Editor Workspace box */}
              <div className="flex-1 flex flex-col p-6 overflow-hidden gap-4">
                {/* Title Input Field */}
                <div className="text-left">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                    Chapter Title
                  </label>
                  <input
                    type="text"
                    value={activeChapter.title}
                    onChange={(e) => handleChapterMetadataChange("title", e.target.value)}
                    className="w-full rounded-xl bg-white border border-slate-200/50 px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7c3aed] focus:border-[#7c3aed] shadow-sm"
                  />
                </div>

                {/* Markdown writing pad container */}
                <div className="flex-1 flex flex-col border border-slate-200/50 bg-white rounded-xl overflow-hidden shadow-sm">
                  {/* Toolbar title indicator */}
                  <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2 text-left">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <FileText size={13} />
                      Markdown Editor
                    </span>
                  </div>

                  {/* Formatting Toolbar */}
                  <div className="flex items-center justify-between p-2 bg-slate-50 border-b border-slate-200/50 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => insertFormat("**", "**")}
                        title="Bold"
                        className="p-1.5 hover:bg-slate-200 hover:text-slate-900 rounded-lg cursor-pointer transition-colors"
                      >
                        <Bold size={14} />
                      </button>
                      <button
                        onClick={() => insertFormat("*", "*")}
                        title="Italic"
                        className="p-1.5 hover:bg-slate-200 hover:text-slate-900 rounded-lg cursor-pointer transition-colors"
                      >
                        <Italic size={14} />
                      </button>
                      <button
                        onClick={() => insertFormat("<u>", "</u>")}
                        title="Underline"
                        className="p-1.5 hover:bg-slate-200 hover:text-slate-900 rounded-lg cursor-pointer transition-colors"
                      >
                        <Underline size={14} />
                      </button>
                      <div className="h-4 w-px bg-slate-350 mx-1"></div>
                      <button
                        onClick={() => insertFormat("# ")}
                        title="Heading 1"
                        className="p-1.5 hover:bg-slate-200 hover:text-slate-900 rounded-lg cursor-pointer transition-colors"
                      >
                        <Heading1 size={14} />
                      </button>
                      <button
                        onClick={() => insertFormat("## ")}
                        title="Heading 2"
                        className="p-1.5 hover:bg-slate-200 hover:text-slate-900 rounded-lg cursor-pointer transition-colors"
                      >
                        <Heading2 size={14} />
                      </button>
                      <button
                        onClick={() => insertFormat("### ")}
                        title="Heading 3"
                        className="p-1.5 hover:bg-slate-200 hover:text-slate-900 rounded-lg cursor-pointer transition-colors"
                      >
                        <Heading3 size={14} />
                      </button>
                      <div className="h-4 w-px bg-slate-350 mx-1"></div>
                      <button
                        onClick={() => insertFormat("> ")}
                        title="Quote"
                        className="p-1.5 hover:bg-slate-200 hover:text-slate-900 rounded-lg cursor-pointer transition-colors"
                      >
                        <Quote size={14} />
                      </button>
                      <button
                        onClick={() => insertFormat("- ")}
                        title="Bullet List"
                        className="p-1.5 hover:bg-slate-200 hover:text-slate-900 rounded-lg cursor-pointer transition-colors"
                      >
                        <List size={14} />
                      </button>
                      <button
                        onClick={() => insertFormat("1. ")}
                        title="Ordered List"
                        className="p-1.5 hover:bg-slate-200 hover:text-slate-900 rounded-lg cursor-pointer transition-colors"
                      >
                        <ListOrdered size={14} />
                      </button>
                      <button
                        onClick={() => insertFormat("```\n", "\n```")}
                        title="Code Block"
                        className="p-1.5 hover:bg-slate-200 hover:text-slate-900 rounded-lg cursor-pointer transition-colors"
                      >
                        <Code size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => setWorkspaceMode(workspaceMode === "split" ? "edit" : "split")}
                      title="Toggle Split / Editor Full height"
                      className="p-1.5 hover:bg-slate-200 hover:text-slate-900 rounded-lg cursor-pointer"
                    >
                      <Maximize2 size={13} />
                    </button>
                  </div>

                  {/* Split writing text editor and preview */}
                  <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Left Pane: Textarea (visible in 'edit' or 'split' modes) */}
                    {(workspaceMode === "split" || workspaceMode === "edit") && (
                      <textarea
                        ref={textareaRef}
                        value={activeChapter.content || ""}
                        onChange={(e) => handleChapterContentChange(e.target.value)}
                        placeholder="Write your chapter markdown content here..."
                        className="flex-1 p-4 text-sm text-slate-800 bg-white focus:outline-none resize-none font-sans leading-relaxed overflow-y-auto animate-fade-in"
                      />
                    )}

                    {/* Right Pane: Live HTML Render (visible in 'split' or 'preview' modes) */}
                    {(workspaceMode === "split" || workspaceMode === "preview") && (
                      <div className="flex-1 p-4 markdown-preview overflow-y-auto bg-slate-50/20 border-t md:border-t-0 md:border-l border-slate-200 text-left animate-fade-in">
                        <div
                          dangerouslySetInnerHTML={{ __html: parseMarkdown(activeChapter.content) }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. BOOK DETAILS SETTINGS VIEW */}
          {activeTab === "settings" && (
            <div className="max-w-xl mx-auto space-y-8 p-6 overflow-y-auto h-full animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">Book Settings</h3>
                <p className="text-xs text-slate-500">Configure book global identifiers and covers.</p>
              </div>

              {/* Cover upload */}
              <div className="glass p-6 rounded-2xl border border-slate-200 bg-white flex flex-col md:flex-row items-center gap-6 shadow-sm">
                <div className="h-40 w-28 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 flex flex-col items-center justify-center shrink-0">
                  {book.coverImage ? (
                    <img
                      src={getCoverUrl(book.coverImage)}
                      alt="cover"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 text-center p-2">
                      No cover uploaded
                    </span>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left space-y-3">
                  <h4 className="text-sm font-semibold text-slate-800">Cover Artwork</h4>
                  <p className="text-xs text-slate-500">
                    Upload an image for the ebook cover. Limits: Max 2MB, JPEG, PNG, GIF formats.
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploadingImage}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] px-4 py-2 text-xs font-semibold text-white cursor-pointer disabled:opacity-55 shadow-sm"
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload size={13} />
                        Choose Artwork file
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Metadata Fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-655 block mb-1">Book Title</label>
                  <input
                    type="text"
                    value={book.title}
                    onChange={(e) => handleBookMetadataChange("title", e.target.value)}
                    className="block w-full rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7c3aed] shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-655 block mb-1">Subtitle</label>
                  <input
                    type="text"
                    value={book.subtitle || ""}
                    onChange={(e) => handleBookMetadataChange("subtitle", e.target.value)}
                    className="block w-full rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7c3aed] shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-655 block mb-1">Author</label>
                    <input
                      type="text"
                      value={book.author}
                      onChange={(e) => handleBookMetadataChange("author", e.target.value)}
                      className="block w-full rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7c3aed] shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-655 block mb-1">Publish Status</label>
                    <select
                      value={book.status}
                      onChange={(e) => handleBookMetadataChange("status", e.target.value)}
                      className="block w-full rounded-xl bg-white border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#7c3aed] cursor-pointer shadow-sm"
                    >
                      <option value="draft">Draft (Private)</option>
                      <option value="published">Published (Public)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>


      </div>
    </div>
  );
};

export default BookEditor;
