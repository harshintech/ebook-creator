import React, { createContext, useState, useEffect } from "react";
import API from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user data on startup
  useEffect(() => {
    const loadUser = async () => {
      const storedUser = localStorage.getItem("userInfo");
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          // Set initial user info from storage
          setUser(parsed);
          
          // Verify with backend and fetch full profile details (isPro, avatar, etc.)
          const { data } = await API.get("/auth/profile");
          // Merge token with updated profile
          const updatedUser = { ...parsed, ...data };
          setUser(updatedUser);
          localStorage.setItem("userInfo", JSON.stringify(updatedUser));
        } catch (error) {
          console.error("Token verification failed, logging out.", error);
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  // Register User
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const { data } = await API.post("/auth/register", { name, email, password });
      
      // Data contains: { message, token }
      const userInfo = { email, name, token: data.token };
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
      setUser(userInfo);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    } finally {
      setLoading(false);
    }
  };

  // Login User
  const login = async (email, password) => {
    try {
      setLoading(true);
      const { data } = await API.post("/auth/login", { email, password });
      // data contains: { message, _id, name, email, token }
      
      localStorage.setItem("userInfo", JSON.stringify(data));
      setUser(data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Invalid credentials",
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout User
  const logout = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
  };

  // Update Profile Name
  const updateProfile = async (name) => {
    try {
      const { data } = await API.put("/auth/profile", { name });
      // data contains: { _id, name }
      const updatedUser = { ...user, name: data.name };
      localStorage.setItem("userInfo", JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update profile",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
