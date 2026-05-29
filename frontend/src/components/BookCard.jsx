import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, FileText, Download, Trash2, Share2, Edit2 } from "lucide-react";
import { getCoverUrl } from "../utils/api";

const BookCard = ({ book, onDelete, onExportPDF, onExportDoc }) => {
  const coverUrl = getCoverUrl(book.coverImage);

  const handleShareLink = (e) => {
    e.preventDefault(); // Stop click propagating to the card Link
    if (book.status !== "published") {
      alert("This book is still a draft. Set it to 'published' in settings to copy the link!");
      return;
    }
    const publicUrl = `${window.location.origin}/public/books/${book._id}`;
    navigator.clipboard.writeText(publicUrl);
    alert(`Public sharing link copied to clipboard:\n${publicUrl}`);
  };

  const handleDelete = (e) => {
    e.preventDefault(); // Stop click propagating to card Link
    onDelete(book._id);
  };

  const handlePDF = (e) => {
    e.preventDefault();
    onExportPDF(book._id, book.title);
  };

  const handleDoc = (e) => {
    e.preventDefault();
    onExportDoc(book._id, book.title);
  };

  return (
    <Link
      to={`/books/${book._id}`}
      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white aspect-[3/4] transition-all duration-305 hover:-translate-y-1 hover:shadow-xl shadow-sm block w-full"
    >
      {/* Cover Image/Gradient background covering the full card */}
      <div className="absolute inset-0 w-full h-full bg-slate-100">
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={book.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}

        {/* Fallback gradient banner */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-center"
          style={{ display: coverUrl ? "none" : "flex" }}
        >
          <BookOpen className="text-indigo-400 mb-3 opacity-60" size={40} />
          <span className="text-sm font-extrabold text-slate-800 leading-snug max-w-[90%]">
            {book.title}
          </span>
          {book.subtitle && (
            <span className="text-[10px] text-slate-500 mt-1 line-clamp-2 px-2 leading-relaxed">
              {book.subtitle}
            </span>
          )}
        </div>
      </div>

      {/* Top badges (Draft tag) */}
      <div className="absolute top-3 right-3 z-10">
        <span
          className={`rounded-full px-2.5 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${book.status === "published"
              ? "bg-emerald-500/90 text-white"
              : "bg-amber-500/90 text-white"
            }`}
        >
          {book.status === "published" ? "Published" : "Draft"}
        </span>
      </div>

      {/* Bottom Text Overlay with Dark Linear Gradient */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/85 via-black/45 to-transparent pt-16 flex flex-col justify-end text-left z-10">
        <h3 className="text-md font-bold text-white leading-tight line-clamp-2">
          {book.title}
        </h3>
        <p className="text-xs text-slate-200 mt-1 font-medium truncate">
          {book.author}
        </p>
      </div>

      {/* Hover Action Drawer overlay (fades in on hover) */}
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 flex flex-col justify-between p-4">
        {/* Top actions */}
        <div className="flex justify-end gap-1.5">
          <button
            onClick={handleShareLink}
            title="Copy Share Link"
            className="h-8 w-8 rounded-lg bg-white/95 hover:bg-[#7c3aed] text-slate-700 hover:text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
          >
            <Share2 size={13} />
          </button>
          <button
            onClick={handleDelete}
            title="Delete Book"
            className="h-8 w-8 rounded-lg bg-white/95 hover:bg-rose-600 text-rose-600 hover:text-white flex items-center justify-center shadow-md transition-all cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Center overlay "Open Editor" indicator */}
        <div className="mx-auto my-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#7c3aed] text-white shadow-md transform scale-90 group-hover:scale-100 transition-transform duration-200">
          <Edit2 size={16} />
        </div>

        {/* Bottom actions */}
        <div className="flex gap-2">
          <button
            onClick={handlePDF}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/95 hover:bg-[#7c3aed] text-slate-700 hover:text-white text-[10px] font-bold shadow-md transition-all cursor-pointer"
          >
            <Download size={11} />
            PDF Export
          </button>
          <button
            onClick={handleDoc}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/95 hover:bg-[#7c3aed] text-slate-700 hover:text-white text-[10px] font-bold shadow-md transition-all cursor-pointer"
          >
            <FileText size={11} />
            Word Doc
          </button>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;
