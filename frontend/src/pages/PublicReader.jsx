import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { BookOpen, FileText, ChevronRight, Loader2, AlertCircle } from "lucide-react";

const PublicReader = () => {
  const { id } = useParams();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  useEffect(() => {
    const fetchPublicBook = async () => {
      try {
        setLoading(true);
        setError("");
        // Backend public endpoint
        const { data } = await axios.get(`http://localhost:8000/api/books/public/${id}`);
        setBook(data);
        if (data.chapters && data.chapters.length > 0) {
          setActiveChapterIndex(0);
        }
      } catch (err) {
        console.error("Error fetching public book:", err);
        setError(
          err.response?.data?.message || "Failed to load book. Make sure the book is published."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPublicBook();
  }, [id]);

  // Client-side markdown regex parser
  const parseMarkdown = (mdText) => {
    if (!mdText) {
      return "<p class='text-slate-400 italic'>This chapter has no content.</p>";
    }
    
    let html = mdText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

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

    // Lists
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

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-2 bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
        <p className="text-slate-550 text-sm font-medium">Opening ebook reader...</p>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 bg-slate-50 px-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-2 border border-rose-100">
          <AlertCircle size={28} />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Ebook Unavailable</h3>
        <p className="text-slate-500 text-sm max-w-md text-center leading-relaxed">
          {error || "We couldn't retrieve the specified ebook. It might have been deleted, set to draft status, or doesn't exist."}
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all cursor-pointer"
        >
          Go to eBook Creator Home
        </Link>
      </div>
    );
  }

  const activeChapter = book.chapters[activeChapterIndex];

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
      {/* Top Header */}
      <header className="glass px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-white">
        <div className="flex items-center gap-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7c3aed] text-white shadow-sm">
            <BookOpen size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-850 leading-tight">{book.title}</h2>
            <p className="text-[10px] text-slate-500 mt-0.5">Written by {book.author}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="text-[10px] font-extrabold text-[#7c3aed] bg-[#7c3aed]/10 border border-[#7c3aed]/20 px-3 py-1.5 rounded-lg hover:bg-[#7c3aed]/20 transition-all uppercase tracking-wide cursor-pointer"
          >
            Create Your Own with AI eBook Creator
          </Link>
        </div>
      </header>

      {/* Reader Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Chapter Selector */}
        <aside className="w-64 border-r border-slate-200 flex flex-col bg-white shrink-0">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Chapters</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1 bg-slate-50/20">
            {book.chapters.map((ch, idx) => (
              <button
                key={ch._id || idx}
                onClick={() => setActiveChapterIndex(idx)}
                className={`w-full flex items-center justify-between gap-2 rounded-xl p-2.5 transition-all text-left cursor-pointer ${
                  idx === activeChapterIndex
                    ? "bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/20 font-bold"
                    : "text-slate-650 hover:text-slate-900 hover:bg-slate-100 border border-transparent"
                }`}
              >
                <span className="text-xs truncate">
                  <span className="opacity-50 mr-1">{idx + 1}.</span> {ch.title}
                </span>
                <ChevronRight size={12} className="opacity-40" />
              </button>
            ))}
          </div>
        </aside>

        {/* Content Viewer Pane */}
        <main className="flex-1 overflow-y-auto bg-white p-8">
          <div className="max-w-2xl mx-auto py-6">
            {activeChapter ? (
              <article className="markdown-preview">
                <span className="text-[10px] font-bold text-[#7c3aed] uppercase tracking-widest block mb-1">
                  Chapter {activeChapterIndex + 1} of {book.chapters.length}
                </span>
                <h1 className="text-3xl font-extrabold text-slate-900 border-b border-slate-200 pb-3 mb-6">
                  {activeChapter.title}
                </h1>
                <div
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(activeChapter.content) }}
                />
              </article>
            ) : (
              <p className="text-center text-slate-500 italic">No content in this chapter.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PublicReader;
