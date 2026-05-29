import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../utils/api";
import BookCard from "../components/BookCard";
import {
  Plus,
  BookOpen,
  Layers,
  CheckCircle2,
  FileText,
  Search,
  Loader2,
  Sparkles,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [exportLoading, setExportLoading] = useState(null); // stores bookId being exported

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/books");
      setBooks(data);
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this book? This action cannot be undone.",
      )
    ) {
      try {
        await API.delete(`/books/${id}`);
        setBooks(books.filter((book) => book._id !== id));
      } catch (error) {
        alert("Failed to delete the book. Please try again.");
      }
    }
  };

  const handleExportPDF = async (bookId, title) => {
    try {
      setExportLoading({ id: bookId, type: "pdf" });
      const response = await API.get(`/export/${bookId}/pdf`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${title.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export PDF failed:", error);
      alert("Failed to export PDF. Ensure all chapters have content.");
    } finally {
      setExportLoading(null);
    }
  };

  const handleExportDoc = async (bookId, title) => {
    try {
      setExportLoading({ id: bookId, type: "docx" });
      const response = await API.get(`/export/${bookId}/doc`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${title.replace(/[^a-zA-Z0-9]/g, "_")}.docx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export DOCX failed:", error);
      alert("Failed to export DOCX document.");
    } finally {
      setExportLoading(null);
    }
  };

  // Filter books based on search query
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Statistics
  const totalBooks = books.length;
  const totalChapters = books.reduce(
    (acc, book) => acc + (book.chapters?.length || 0),
    0,
  );
  const publishedBooks = books.filter(
    (book) => book.status === "published",
  ).length;
  const draftBooks = books.filter((book) => book.status === "draft").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header and User Greeting */}
      <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-x-34 pb-6 border-b border-slate-100 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">All eBooks</h1>
          <p className="text-slate-500 text-sm">
            Create, edit, and manage all your AI-generated eBooks.
          </p>
        </div>

        <Link
          to="/create"
          className="flex items-center justify-center gap-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:scale-[1.01] transition-all cursor-pointer"
        >
          <Plus size={18} />
          Create New eBook
        </Link>
      </div>

      {/* Export Loader Overlay */}
      {exportLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="glass p-6 rounded-2xl border border-slate-200 flex flex-col items-center gap-4 bg-white shadow-xl">
            <Loader2 className="animate-spin text-indigo-650" size={36} />
            <p className="text-sm font-bold text-slate-800">
              Exporting book as {exportLoading.type.toUpperCase()}...
            </p>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search books by title or author..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full rounded-xl bg-white border border-slate-200 pl-10 pr-3 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Book Grid */}
      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
          <p className="text-slate-500 text-sm font-medium">
            Loading your books library...
          </p>
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-6xl mx-auto animate-fade-in">
          {filteredBooks.map((book) => (
            <BookCard
              key={book._id}
              book={book}
              onDelete={handleDeleteBook}
              onExportPDF={handleExportPDF}
              onExportDoc={handleExportDoc}
            />
          ))}
        </div>
      ) : (
        <div className="glass rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto mt-6 bg-white shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-650 mb-4">
            <BookOpen size={28} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">
            No books found
          </h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            {searchQuery
              ? "We couldn't find any books matching your search query. Try another term!"
              : "You haven't created any ebooks yet. Create your first book using AI or start from scratch!"}
          </p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all cursor-pointer"
          >
            <Plus size={16} />
            Create A Book
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
