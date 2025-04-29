import React, { useEffect, useState, useContext } from "react";
import { MyContext } from "../../../App";
import { AuthContext } from "../../../context/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { Menu, MenuItem, ListItemIcon, Button } from "@mui/material";
import Logout from "@mui/icons-material/Logout";
import { FaUser } from "react-icons/fa";


const Sell = () => {
  const navigate = useNavigate(); // khởi tạo điều hướng
  const context = useContext(MyContext); // cần lấy context
  const { user } = useContext(AuthContext); // Lấy thông tin người dùng từ contex
  const { logout } = useContext(AuthContext);
  const [themeMode, setThemeMode] = useState(true);

  // ========================= State =========================
  const [searchCustomer, setSearchCustomer] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState([]); // Danh sách khách hàng
  const [staffName, setStaffName] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [anchorEl, setAnchorEl] = useState(null);
  const [cart, setCart] = useState([
    { id: "SP000011", name: "Sữa tắm Palmolive xanh lá", price: 39000, quantity: 1 },
    { id: "SP000012", name: "Sữa tắm Palmolive xanh lá", price: 14000, quantity: 3 },
  ]);

  const cashSuggestions = [10000, 20000, 50000, 100000, 200000, 500000];

  // ===================== Sự kiện ===================== 
  const open = Boolean(anchorEl);

  const handleAddCustomer = () => {
    // Hiện modal hoặc mở form thêm khách hàng
    alert("Thêm khách hàng mới");
  };

  const handleIncrease = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrease = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleRemove = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmitOrder = () => {
    const orderData = {
      customerId: selectedCustomer ? selectedCustomer.id : null, // nếu không chọn KH thì null
      amount: totalAmount,
      paymentMethod: paymentMethod,
      // các dữ liệu khác
    };

    console.log("Gửi dữ liệu đơn hàng:", orderData);

    // gửi dữ liệu lên server hoặc lưu vào CSDL ở đây
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setSearchCustomer(''); // clear input nếu muốn
  };

  const handlePaymentChange = (value) => {
    setPaymentMethod(value);
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout(); // Gọi hàm logout
    navigate("/admin/login"); // Điều hướng về trang login
  };

  const handleGoToAdmin = () => {
    navigate("/admin/dashboard"); // thay bằng đường dẫn mong muốn, ví dụ: /admin, /dashboard
  };

  // ===================== Tính toán =====================
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const filteredCustomers = customers.filter((c) => {
    const keyword = searchCustomer.toLowerCase();
    return (
      c.name.toLowerCase().includes(keyword) ||
      c.phone.toLowerCase().includes(keyword)
    );
  });


  // ===================== useEffect =====================
  useEffect(() => {
    // remove dark mode 
    if (themeMode === true) {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
      localStorage.setItem("themeMode", "light");
    }

    // Cập nhật danh sách khách hàng mẫu (nếu sau này dùng API thì bỏ phần này)
    setCustomers([
      { id: 1, name: "Nguyễn Văn A", phone: "0901234567" },
      { id: 2, name: "Trần Thị B", phone: "0912345678" },
      { id: 3, name: "Lê Văn C", phone: "0987654321" },
    ]);

    // Cập nhật tên nhân viên từ user
    if (user?.name) {
      setStaffName(user.name);
    } else {
      setStaffName("Tên không xác định");
    }

    // Cập nhật thời gian hiện tại liên tục
    const updateDateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      setCurrentDateTime(formatted);
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000); // cập nhật mỗi giây

    // Ẩn sidebar/header khi mở trang
    context.setisHideSidebarAndHeader(true);
    window.scrollTo(0, 0);

    // Cleanup khi rời khỏi trang
    return () => {
      clearInterval(timer);
      context.setisHideSidebarAndHeader(false);
    };
  }, [context, user, themeMode]); // thêm 'user' vào dependency để cập nhật khi user thay đổi


  return (
    <div className="vh-100 d-flex flex-column">
      {/* Header */}
      <nav className="navbar navbar-dark bg-primary px-3">
        <div className="d-flex align-items-center">
          {/* Tìm sản phẩm */}
          <input
            className="form-control mr-2"
            style={{ width: "350px" }}
            placeholder="Tìm sản phẩm..."
          />

          {/* Nút Hóa đơn với nút xóa nhỏ */}
          <div className="position-relative mr-2">
            <button
              className="btn btn-light"
              style={{ width: '130px', textAlign: 'left', paddingLeft: '1rem' }}>
              Hóa đơn 20
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation(); // Ngăn sự kiện lan ra nút "Hóa đơn"
                console.log("Click Xóa hóa đơn");
              }}
              className="btn btn-sm btn-danger position-absolute"
              style={{
                top: '9px',
                right: '5px',
                width: '20px',
                height: '20px',
                padding: 0,
                fontSize: '12px',
                lineHeight: '1',
                borderRadius: '50%',
              }}
              title="Xóa hóa đơn"
            >
              ×
            </button>
          </div>

          {/* Nút tạo đơn mới */}
          <button className="btn btn-light btn-sm">
            +
          </button>
        </div>

        {/* Nhân viên và menu tài khoản */}
        <div className="d-flex align-items-center text-white">
          <span className="mr-3 cursor-pointer" onClick={handleOpenMenu}>
            {staffName}
          </span>

          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleCloseMenu}
            onClick={handleCloseMenu}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                mt: 1.5,
                "&::before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <MenuItem onClick={handleGoToAdmin}>
              <ListItemIcon>
                <FaUser fontSize="small" />
              </ListItemIcon>
              Quản lý
            </MenuItem>

            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Đăng xuất
            </MenuItem>
          </Menu>
        </div>
      </nav>



      {/* Main */}
      <div className="flex-grow-1 d-flex flex-column overflow-hidden" style={{ height: '100vh' }}>
        <div className="row flex-grow-1 overflow-auto m-0">
          {/* Left: Cart Items */}
          <div className="col-12 col-sm-8 d-flex flex-column p-0">
            <div className="p-3 bg-white overflow-auto" style={{ maxHeight: '450px' }}>
              {cart.map((item) => (
                <div key={item.id} className="d-flex align-items-center border-bottom py-2">
                  <button onClick={() => handleRemove(item.id)} className="btn btn-link text-danger p-0 mr-3">🗑</button>
                  <span className="mr-3">{item.id}</span>
                  <span className="flex-grow-1">{item.name}</span>
                  <div className="d-flex align-items-center">
                    <button onClick={() => handleDecrease(item.id)} className="btn btn-sm btn-outline-secondary mr-2">-</button>
                    <span className="mx-1">{item.quantity}</span>
                    <button onClick={() => handleIncrease(item.id)} className="btn btn-sm btn-outline-secondary mr-3">+</button>
                    <span className="mr-3">{item.price.toLocaleString()}</span>
                    <strong className="mr-3">{(item.price * item.quantity).toLocaleString()}</strong>
                  </div>
                </div>
              ))}
              {cart.length === 0 && <p className="text-muted">Không có sản phẩm trong giỏ.</p>}
            </div>
            {/* Ghi chú đơn hàng */}
            <div className="p-2 bg-light border-top mt-auto">
              <input
                className="form-control p-4"
                placeholder="Ghi chú cho đơn hàng..."
              />
            </div>
          </div>

          {/* Right: Summary */}
          <div className="col-12 col-sm-4 d-flex flex-column p-0 border-left bg-light">
            <div className="flex-grow-1 p-3 d-flex flex-column overflow-auto">

              <div className="d-flex justify-content-between align-items-center mb-2">
                <span><strong>{staffName}</strong></span>
                <span>{currentDateTime}</span>
              </div>

              <div className="position-relative w-100 mb-2">
                <div className="d-flex align-items-center">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Tìm khách (F4)"
                    value={searchCustomer}
                    onChange={(e) => setSearchCustomer(e.target.value)}
                  />
                  <button
                    className="btn btn-sm btn-outline-primary ml-2"
                    onClick={handleAddCustomer}
                  >
                    +
                  </button>
                </div>

                {/* Gợi ý khách hàng */}
                {searchCustomer && filteredCustomers.length > 0 && (
                  <div
                    className="border bg-white position-absolute mt-1 shadow-sm zindex-dropdown rounded"
                    style={{ maxHeight: '200px', overflowY: 'auto', width: '80%' }}
                  >
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="px-2 py-1 customer-suggestion hover-bg border-bottom"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        <div><strong>{customer.name}</strong> - {customer.phone}</div>
                        <div className="text-muted small">Mã KH: {customer.id}</div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Khách hàng đã chọn */}
                {selectedCustomer && (
                  <div className="mt-2 p-2 bg-white rounded border d-flex justify-content-between align-items-center">
                    <div>
                      <div>
                        <strong>Khách đã chọn:</strong> {selectedCustomer.name} ({selectedCustomer.phone})
                      </div>
                      <div className="text-muted small">Mã KH: {selectedCustomer.id}</div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger ml-3"
                      onClick={() => setSelectedCustomer(null)}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>



              <div className="mb-2 d-flex justify-content-between">
                <span>Tổng tiền hàng:</span>
                <span>{totalAmount.toLocaleString()}</span>
              </div>
              <div className="mb-2 d-flex justify-content-between">
                <span>Giảm giá:</span>
                <span>0</span>
              </div>
              <div className="mb-2 d-flex justify-content-between font-weight-bold text-primary">
                <span>Khách cần trả:</span>
                <span>{totalAmount.toLocaleString()}</span>
              </div>
              <div className="mb-3 d-flex justify-content-between font-weight-bold">
                <span>Khách thanh toán:</span>
                <input
                  className="form-control w-auto"
                  value={totalAmount.toLocaleString()}
                />

              </div>

              <div className="mb-3">
                <div className="mb-2">Phương thức thanh toán:</div>
                <div className="d-flex flex-wrap">
                  <label className="form-check mr-3 d-flex align-items-center">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                    />
                    <span className="ml-2">Tiền mặt</span>
                  </label>

                  <label className="form-check mr-3 d-flex align-items-center">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="payment"
                      value="bank"
                      checked={paymentMethod === "bank"}
                      onChange={() => setPaymentMethod("bank")}
                    />
                    <span className="ml-2">Chuyển khoản</span>
                  </label>

                </div>


                {/* Gợi ý tiền mặt */}
                {paymentMethod === "cash" && (
                  <div className="bg-white border rounded mt-3 p-2 d-flex flex-wrap">
                    {cashSuggestions.map((amount) => (
                      <button
                        key={amount}
                        className="btn btn-outline-secondary btn-sm m-1"
                      >
                        {amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {paymentMethod === "bank" && (
                <div className="text-muted small text-center">
                  Bạn chưa có tài khoản ngân hàng
                  <div className="text-primary cursor-pointer">+ Thêm tài khoản</div>
                </div>
              )}


              <button className="btn btn-primary btn-block mt-3" onClick={handleSubmitOrder}>THANH TOÁN</button>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <div className="d-flex justify-content-around bg-white py-2 border-top">
        <Button className="text-primary font-weight-bold">⚡ Bán nhanh</Button>
        <Button className="text-primary font-weight-bold">🚚 Bán giao hàng</Button>
      </div>
    </div>
  );
}

export default Sell;
