import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { LogOut, User, BookOpen, Sparkles, Menu, X, ChevronDown } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isEditor = location.pathname.startsWith("/books/") && !location.pathname.startsWith("/public/");

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // Get initials for profile badge
  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <nav className={`glass sticky top-0 z-50 w-full px-6 py-3.5 shadow-sm bg-white border-b border-slate-200 ${isEditor ? "hidden" : ""}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo and Name */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#7c3aed] text-white shadow-sm transition-transform group-hover:scale-102">
            <BookOpen size={20} />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            AI eBook Creator
          </span>
        </Link>

        {/* Navigation - Desktop */}
        {user && (
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors hover:text-[#7c3aed] ${isActive("/") ? "text-[#7c3aed] font-bold" : "text-slate-650"
                }`}
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              className={`text-sm font-semibold transition-colors hover:text-[#7c3aed] ${isActive("/profile") ? "text-[#7c3aed] font-bold" : "text-slate-650"
                }`}
            >
              Profile Settings
            </Link>
          </div>
        )}

        {/* User Dropdown / Login Button - Desktop */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 rounded-xl hover:bg-slate-50 p-1.5 transition-all cursor-pointer"
              >
                {/* Avatar Badge */}
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7c3aed] font-bold text-white text-xs">
                  {getInitials(user.name)}
                </div>

                {/* Details */}
                <div className="text-left hidden lg:block pr-1">
                  <p className="text-xs font-bold text-slate-800 leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {user.email}
                  </p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-200 p-1.5 shadow-lg animate-fade-in z-50">
                  <div className="px-3 py-2 border-b border-slate-100 lg:hidden">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Signed in as</p>
                    <p className="text-xs font-bold text-slate-800 truncate">{user.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <User size={16} className="text-slate-400" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                  >
                    <LogOut size={16} className="text-rose-550" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] px-4.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:scale-[1.01]"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 rounded-2xl bg-white border border-slate-200 p-4 flex flex-col gap-3 shadow-md animate-fade-in">
          {user ? (
            <>
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-semibold py-2 px-3 rounded-lg hover:bg-slate-50 ${isActive("/") ? "bg-indigo-50 text-[#7c3aed]" : "text-slate-600"
                  }`}
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-semibold py-2 px-3 rounded-lg hover:bg-slate-50 ${isActive("/profile") ? "bg-indigo-50 text-[#7c3aed]" : "text-slate-600"
                  }`}
              >
                Profile Settings
              </Link>
              <div className="h-px bg-slate-100 my-1"></div>
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7c3aed] text-white font-bold text-sm">
                  {getInitials(user.name)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 rounded-lg text-rose-600 hover:bg-rose-50 px-3 py-2 text-sm font-semibold transition-colors cursor-pointer"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center rounded-xl bg-[#7c3aed] hover:bg-[#6d28d9] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
