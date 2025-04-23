import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from '../pages/Admin/Login';

const RoutesComponent = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Thêm các route khác ở đây */}
      </Routes>
    </Router>
  );
};

export default RoutesComponent;