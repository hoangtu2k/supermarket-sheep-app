import React, { createContext, useState } from "react";
import CryptoJS from "crypto-js";

export const AuthContext = createContext();

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), 'your-secret-key').toString();
};

const decryptData = (cipherText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, 'your-secret-key');
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedData ? JSON.parse(decryptedData) : null;
  } catch (error) {
    console.error('Error decrypting data:', error);
    return null; // Trả về null nếu có lỗi
  }
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token"));
  
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? decryptData(savedUser) : null;
  });

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", encryptData(userData[0])); // Lưu toàn bộ dữ liệu người dùng
    setIsAuthenticated(true);
    setUser(userData[0]); // Lưu toàn bộ dữ liệu người dùng
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};