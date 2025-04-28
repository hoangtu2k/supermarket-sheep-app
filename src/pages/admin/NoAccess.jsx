import { useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { MyContext } from "../../App";

const NoAccess = () => {
  const context = useContext(MyContext); // cần lấy context

  useEffect(() => {
    context.setisHideSidebarAndHeader(true);
    window.scrollTo(0, 0);
    
    // Khi thoát trang => hiện lại sidebar/header
    return () => {
      context.setisHideSidebarAndHeader(false);
    };
  }, [context]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1 style={{ fontSize: "48px", color: "#ff4d4f" }}>403 - Không có quyền truy cập</h1>
      <p style={{ fontSize: "18px", marginTop: "20px" }}>Bạn không có quyền truy cập trang này.</p>
      <Link to="/admin" style={{ marginTop: "30px", display: "inline-block", fontSize: "16px", color: "#1890ff" }}>
        Quay về trang chủ
      </Link>
    </div>
  );
};

export default NoAccess;
