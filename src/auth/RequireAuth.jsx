import React from 'react';
import { Navigate } from 'react-router-dom';

const RequireAuth = ({ children }) => {
  // Kiểm tra xem token có tồn tại trong localStorage hay không
  const isAuthenticated = !!localStorage.getItem('token');

  if (!isAuthenticated) {
    // Nếu chưa đăng nhập, chuyển hướng về trang login
    return <Navigate to="/admin/login"/>;
  }

  return children; // Nếu đã đăng nhập, hiển thị các component con
};

export default RequireAuth;