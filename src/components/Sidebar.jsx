import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// MUI
import Button from "@mui/material/Button";

// Icons
import { FaAngleRight, FaBell, FaCartArrowDown, FaProductHunt } from "react-icons/fa6";
import { FaUserTie } from "react-icons/fa";
import { MdDashboard, MdMessage } from "react-icons/md";
import { IoIosSettings, IoMdLogOut } from "react-icons/io";
import { HiUsers } from "react-icons/hi";

// Context
import { MyContext } from "../App";


const Sidebar = () => {

    const [activeTab, setActiveTab] = useState(null);
    const [isToggleSubmenu, setIsToggleSubmenu] = useState(false);

    const context = useContext(MyContext);

    const isOpenSubmenu=(index)=> {
        setActiveTab(index);
        setIsToggleSubmenu(!isToggleSubmenu);
    }

  const navigate = useNavigate(); // Khai báo hook navigate

  const handleLogout = () => {
    // Xoá token khỏi Local Storage
    localStorage.removeItem('token');
  
    // Điều hướng đến trang đăng nhập hoặc trang chính
    navigate('/admin/login'); // Sử dụng navigate để điều hướng
  };


    return (
        <>
            <div className="sidebar">
                <ul>
                    <li>
                        <Link to="/admin/dashboard">
                            <Button className={`w-100 ${activeTab === 0 ? 'active': ''}`}>
                                <span className="icon"><MdDashboard /></span>
                                Tổng quan
                                <span className="arrow"><FaAngleRight /></span>
                            </Button>
                        </Link>
                    </li>
                    <li>
                        
                            <Button className={`w-100 ${activeTab === 1 && isToggleSubmenu ===true ? 'active': ''}`} onClick={()=>isOpenSubmenu(1)}>
                                <span className="icon"><FaProductHunt /></span>
                                Sản phẩm
                                <span className="arrow"><FaAngleRight /></span>
                            </Button>
                            
                            <div className={`submenuWrapper ${activeTab === 1 && isToggleSubmenu ===true ? 'colapse': 'colapsed'} `}>
                                <ul className="submenu">
                                    <li><Link to="/admin/products">Danh sách sản phẩm</Link></li>
                                    <li><Link to="/admin/product-details">Chi tiết sản phẩm</Link></li>
                                    <li><Link to="/admin/product-upload">Tải lên sản phẩm</Link></li>
                                </ul>
                            </div>
                                  
                    </li>
                    <li>
                    <Button className={`w-100 ${activeTab === 2 && isToggleSubmenu === true ? 'active' : ''}`} onClick={() => isOpenSubmenu(2)}>
                            <span className="icon"><HiUsers /></span>
                            Giao dịch
                            <span className="arrow"><FaAngleRight /></span>
                        </Button>

                        <div className={`submenuWrapper ${activeTab === 2 && isToggleSubmenu === true ? 'colapse' : 'colapsed'} `}>
                            <ul className="submenu">
                                <li><Link to="/admin">Đặt hàng</Link></li>
                                <li><Link to="/admin/supplier">Nhập hàng</Link></li>
                            </ul>
                        </div>
                    </li>
                    <li>
                        <Button className={`w-100 ${activeTab === 3 && isToggleSubmenu === true ? 'active' : ''}`} onClick={() => isOpenSubmenu(3)}>
                            <span className="icon"><HiUsers /></span>
                            Nhân viên
                            <span className="arrow"><FaAngleRight /></span>
                        </Button>

                        <div className={`submenuWrapper ${activeTab === 3 && isToggleSubmenu === true ? 'colapse' : 'colapsed'} `}>
                            <ul className="submenu">
                                <li><Link to="/admin/employee">Danh sách nhân viên</Link></li>
                                <li><Link to="/">Lịch làm việc</Link></li>
                                <li><Link to="/">Thiết lập nhân viên</Link></li>
                            </ul>
                        </div>
                    </li>
                    <li>
                        <Button className={`w-100 ${activeTab === 4 && isToggleSubmenu === true ? 'active' : ''}`} onClick={() => isOpenSubmenu(4)}>
                            <span className="icon"><FaUserTie /></span>
                            Đối tác
                            <span className="arrow"><FaAngleRight /></span>
                        </Button>

                        <div className={`submenuWrapper ${activeTab === 4 && isToggleSubmenu === true ? 'colapse' : 'colapsed'} `}>
                            <ul className="submenu">
                                <li><Link to="/admin/customer">Khách hàng</Link></li>
                                <li><Link to="/admin/supplier">Nhà cung cấp</Link></li>
                            </ul>
                        </div>
                    </li>

                    <li>
                        <Link to="/">
                            <Button className={`w-100 ${activeTab === 5 ? 'active': ''}`}>
                                <span className="icon"><MdMessage /></span>
                                Tin nhắn
                                <span className="arrow"><FaAngleRight /></span>
                            </Button>
                        </Link>
                    </li>
                    <li>
                        <Link to="/">
                            <Button className={`w-100 ${activeTab === 6 ? 'active': ''}`}>
                                <span className="icon"><FaBell /></span>
                                Thông báo
                                <span className="arrow"><FaAngleRight /></span>
                            </Button>
                        </Link>
                    </li>       
                    <li>
                        <Button className={`w-100 ${activeTab === 7 && isToggleSubmenu === true ? 'active' : ''}`} onClick={() => isOpenSubmenu(7)}>
                        <span className="icon"><IoIosSettings /></span>
                            Cài đặt
                            <span className="arrow"><FaAngleRight /></span>
                        </Button>

                        <div className={`submenuWrapper ${activeTab === 7 && isToggleSubmenu === true ? 'colapse' : 'colapsed'} `}>
                            <ul className="submenu">
                                <li><Link to="/admin/users">Quản lý người dùng</Link></li>
                                <li><Link to="/admin/history">Lịch sử thao tác</Link></li>
                            </ul>
                        </div>
                    </li>

                </ul>

                <br/>

                <div className="logoutWrapper">
                    <div className="logoutBox">
                        <Button variant="contained" onClick={handleLogout}><IoMdLogOut/> Đăng xuất</Button>
                    </div>
                </div>

            </div>
        </>
    )
}

export default Sidebar;