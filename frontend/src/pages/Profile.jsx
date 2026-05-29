import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { User, Mail, Sparkles, ShieldCheck, Loader2, Save } from "lucide-react";

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);

  const [name, setName] = useState(user?.name || "");
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: '' }

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setUpdating(true);
    setMessage(null);
    const result = await updateProfile(name);
    setUpdating(false);

    if (result.success) {
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } else {
      setMessage({ type: "error", text: result.message });
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <div className="glass rounded-3xl border border-slate-200 p-8 shadow-lg relative bg-white">
        {/* Glow Decor */}
        <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none"></div>

        <div className="flex items-center gap-4 border-b border-slate-200 pb-6 mb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#7c3aed]/10 text-[#7c3aed]">
            <User size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 leading-tight">Profile Settings</h2>
            <p className="text-xs text-slate-500">Manage your profile account settings</p>
          </div>
        </div>

        {message && (
          <div
            className={`rounded-xl border p-4 text-xs mb-6 animate-fade-in ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                : "bg-rose-50 border-rose-100 text-rose-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-4">
            {/* Email Field - Read Only */}
            <div>
              <label className="text-xs font-bold text-slate-650 block mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="block w-full rounded-xl bg-slate-100 border border-slate-200 pl-10 pr-3 py-3 text-sm text-slate-500 cursor-not-allowed shadow-inner"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Your registered email address cannot be changed.</p>
            </div>

            {/* Name Field */}
            <div>
              <label className="text-xs font-bold text-slate-655 block mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl bg-white border border-slate-200 pl-10 pr-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] transition-all shadow-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>
          </div>

          {/* Account Status Segment */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between shadow-inner">
            <div className="flex items-center gap-3">
              {user?.isPro ? (
                <>
                  <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Pro Member</p>
                    <p className="text-[10px] text-slate-550">Enjoy unlimited AI chapters and exports.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-9 w-9 rounded-lg bg-[#7c3aed]/10 text-[#7c3aed] flex items-center justify-center border border-[#7c3aed]/20">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Standard Account</p>
                    <p className="text-[10px] text-slate-550">Upgrade for premium writing speeds.</p>
                  </div>
                </>
              )}
            </div>
            {!user?.isPro && (
              <button
                type="button"
                onClick={() => alert("Payment gateway integration coming soon!")}
                className="rounded-lg bg-[#7c3aed] hover:bg-[#6d28d9] px-3 py-1.5 text-[10px] font-semibold text-white transition-colors cursor-pointer"
              >
                Go Pro
              </button>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={updating || name === user?.name}
              className="flex items-center gap-1.5 rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] px-5 py-3 text-sm font-semibold text-white transition-all disabled:opacity-55 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {updating ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={15} />
                  Save Profile Settings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
