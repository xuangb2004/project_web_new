import { createContext, useEffect, useState } from "react";
// Use shared axios instance configured with VITE_API_URL
import axios from "../utils/axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const login = async (inputs) => {
    const res = await axios.post("/auth/login", inputs);
    setCurrentUser(res.data);
  }; 

  // --- THÊM HÀM NÀY VÀO ---
  const loginWithGoogle = async (token) => {
    // Gọi API backend mà bạn vừa viết ở bước trước
    const res = await axios.post("/auth/google", { token });
    setCurrentUser(res.data);
  }; 
  // -------------------------

  const logout = async (inputs) => {
    await axios.post("/auth/logout");
    setCurrentUser(null);
  }; 

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(currentUser));
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, loginWithGoogle }}> 
    {/* Nhớ thêm loginWithGoogle vào value ở dòng trên */}
      {children}
    </AuthContext.Provider>
  );
};