import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";
import { BookOpen, Sparkles, ArrowRight, ArrowLeft, Loader2, Plus, Trash2, Edit3 } from "lucide-react";

const CreateBook = () => {
  const navigate = useNavigate();

  // Step state
  const [step, setStep] = useState(1);

  // Ebook Metadata
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [author, setAuthor] = useState("");

  // Setup choice: 'scratch' or 'ai'
  const [setupType, setSetupType] = useState("ai");

  // AI Outline Generation Inputs
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState("Professional");
  const [numChapters, setNumChapters] = useState(5);
  const [topicDescription, setTopicDescription] = useState("");

  // AI Outline Output
  const [chapters, setChapters] = useState([]);
  const [generatingOutline, setGeneratingOutline] = useState(false);
  const [generationError, setGenerationError] = useState("");

  // Temp state for editing generated outline chapters
  const [editingIndex, setEditingIndex] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const handleNextStep = () => {
    if (step === 1) {
      if (!title || !author) {
        alert("Title and Author are required.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (setupType === "scratch") {
        // Go straight to create
        handleCreateBook([]);
      } else {
        setStep(3);
      }
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleGenerateOutline = async () => {
    if (!topic) {
      alert("Please provide a topic for the book.");
      return;
    }

    try {
      setGeneratingOutline(true);
      setGenerationError("");
      const { data } = await API.post("/ai/generate-outline", {
        topic,
        style,
        numChapter: numChapters,
        description: topicDescription,
      });

      if (data && data.outline) {
        setChapters(
          data.outline.map((ch) => ({
            title: ch.title,
            description: ch.description,
            content: "", // Starts empty
          }))
        );
        setStep(4);
      } else {
        setGenerationError("No outline returned from server.");
      }
    } catch (error) {
      console.error("Outline generation error:", error);
      setGenerationError(
        error.response?.data?.message || "Failed to generate outline. Please try again."
      );
    } finally {
      setGeneratingOutline(false);
    }
  };

  const handleCreateBook = async (finalChapters) => {
    try {
      const bookChapters = finalChapters.length > 0 ? finalChapters : [
        { title: "Chapter 1: Introduction", description: "First chapter of the book.", content: "" }
      ];

      const { data } = await API.post("/books", {
        title,
        subtitle,
        author,
        chapters: bookChapters,
      });

      // Redirect to Book Editor
      navigate(`/books/${data._id}`);
    } catch (error) {
      alert("Failed to create book. Please check server connection.");
    }
  };

  // Chapter editing helpers
  const handleEditChapter = (index) => {
    setEditingIndex(index);
    setEditTitle(chapters[index].title);
    setEditDesc(chapters[index].description || "");
  };

  const handleSaveEditedChapter = () => {
    if (!editTitle) return;
    const updated = [...chapters];
    updated[editingIndex] = {
      ...updated[editingIndex],
      title: editTitle,
      description: editDesc,
    };
    setChapters(updated);
    setEditingIndex(null);
  };

  const handleDeleteChapter = (index) => {
    setChapters(chapters.filter((_, i) => i !== index));
  };

  const handleAddChapter = () => {
    setChapters([
      ...chapters,
      {
        title: `Chapter ${chapters.length + 1}: New Chapter`,
        description: "Write a short description here.",
        content: "",
      },
    ]);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Wizard Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-10 text-xs font-bold uppercase tracking-wider text-slate-400">
        <span className={step >= 1 ? "text-indigo-600 font-extrabold" : ""}>1. Metadata</span>
        <ArrowRight size={12} className="text-slate-350" />
        <span className={step >= 2 ? "text-indigo-600 font-extrabold" : ""}>2. Strategy</span>
        <ArrowRight size={12} className="text-slate-350" />
        {setupType === "ai" && (
          <>
            <span className={step >= 3 ? "text-indigo-600 font-extrabold" : ""}>3. AI Generator</span>
            <ArrowRight size={12} className="text-slate-350" />
            <span className={step >= 4 ? "text-indigo-600 font-extrabold" : ""}>4. Review</span>
          </>
        )}
      </div>

      <div className="glass rounded-3xl border border-slate-200 p-8 shadow-lg relative bg-white">
        {/* Glow Effects */}
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>

        {/* STEP 1: METADATA CONFIG */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Book Configurations</h2>
              <p className="text-sm text-slate-500">Specify details about your book to begin.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence: A Modern Approach"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Master algorithms, machine learning models, and neural networks"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="block w-full rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Author Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Harsh Gohil"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="block w-full rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={handleNextStep}
                className="flex items-center gap-1.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] cursor-pointer shadow-sm"
              >
                Next Step
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: SETUP STRATEGY */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Choose Setup Strategy</h2>
              <p className="text-sm text-slate-500">Select how you want to build the structure of your book.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AI Strategy */}
              <button
                onClick={() => setSetupType("ai")}
                className={`p-6 rounded-2xl border text-left flex flex-col transition-all cursor-pointer ${
                  setupType === "ai"
                    ? "bg-indigo-50/50 border-indigo-550/80 shadow-sm shadow-indigo-500/5"
                    : "bg-white border-slate-200 hover:border-slate-350"
                }`}
              >
                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 mb-4 inline-block w-fit">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Generate with AI</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter a topic, writing style, and length. Our AI will build a coherent chapter outline automatically.
                </p>
              </button>

              {/* Empty Scratch Strategy */}
              <button
                onClick={() => setSetupType("scratch")}
                className={`p-6 rounded-2xl border text-left flex flex-col transition-all cursor-pointer ${
                  setupType === "scratch"
                    ? "bg-indigo-50/50 border-indigo-555/80 shadow-sm shadow-indigo-500/5"
                    : "bg-white border-slate-200 hover:border-slate-350"
                }`}
              >
                <div className="p-3 rounded-xl bg-purple-55 text-purple-600 mb-4 inline-block w-fit">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Start from Scratch</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Begin with a single blank chapter and outline your book manually as you go. Best for pre-planned books.
                </p>
              </button>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-650 border border-slate-200 cursor-pointer"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                onClick={handleNextStep}
                className="flex items-center gap-1.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.02] cursor-pointer shadow-sm"
              >
                {setupType === "scratch" ? "Create Ebook" : "Next Step"}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: AI OUTLINE FORM */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Configure AI Outline</h2>
              <p className="text-sm text-slate-500">Our generator builds a detailed structure for your book.</p>
            </div>

            {generationError && (
              <div className="rounded-xl bg-rose-50 border border-rose-100 p-4 text-xs text-rose-600">
                {generationError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">What is the book topic? *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Healthy Eating for Beginners, History of Ancient Rome, Flutter Development"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="block w-full rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Writing Tone/Style</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="block w-full rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
                  >
                    <option value="Professional">Professional & Informative</option>
                    <option value="Creative">Creative & Engaging</option>
                    <option value="Casual">Casual & Conversational</option>
                    <option value="Academic">Academic & Scholarly</option>
                    <option value="Inspirational">Inspirational & Motivating</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1">Number of Chapters</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={numChapters}
                    onChange={(e) => setNumChapters(parseInt(e.target.value, 10) || 5)}
                    className="block w-full rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">
                  Additional Context (Target audience, themes, points to cover)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Focus on meal prep tips, avoid complex jargon, and target young busy professionals."
                  value={topicDescription}
                  onChange={(e) => setTopicDescription(e.target.value)}
                  className="block w-full rounded-xl bg-white border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none shadow-sm"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button
                onClick={handlePrevStep}
                disabled={generatingOutline}
                className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-650 border border-slate-200 disabled:opacity-50 cursor-pointer"
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <button
                onClick={handleGenerateOutline}
                disabled={generatingOutline}
                className="flex items-center gap-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.01] disabled:opacity-50 cursor-pointer"
              >
                {generatingOutline ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating Outline...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate Outline
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: OUTLINE REVIEW & EDIT */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Review AI Outline</h2>
                <p className="text-sm text-slate-500">Reorder, edit, or customize chapters before final creation.</p>
              </div>
              <button
                onClick={handleAddChapter}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-650 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-all cursor-pointer"
              >
                <Plus size={14} /> Add Chapter
              </button>
            </div>

            {/* Editing subform */}
            {editingIndex !== null && (
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-200 space-y-3 mb-4 animate-fade-in">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">Edit Chapter Detail</h4>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="block w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Description / Focus</label>
                  <textarea
                    rows={2}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="block w-full rounded-lg bg-white border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setEditingIndex(null)}
                    className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-[10px] font-semibold text-slate-500 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEditedChapter}
                    className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-[10px] font-semibold text-white cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Outline list */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {chapters.map((ch, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all shadow-sm"
                >
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-0.5">
                      Chapter {idx + 1}
                    </span>
                    <h4 className="text-sm font-bold text-slate-800 line-clamp-1">{ch.title}</h4>
                    {ch.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-normal leading-relaxed">
                        {ch.description}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1 shrink-0 mt-2">
                    <button
                      onClick={() => handleEditChapter(idx)}
                      title="Edit chapter title/description"
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteChapter(idx)}
                      title="Delete chapter"
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-between border-t border-slate-200">
              <button
                onClick={handlePrevStep}
                className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-650 border border-slate-200 cursor-pointer"
              >
                <ArrowLeft size={16} />
                Start Over
              </button>
              <button
                onClick={() => handleCreateBook(chapters)}
                className="flex items-center gap-2 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Plus size={16} />
                Generate and Create Book
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateBook;
