import React, { useEffect, useState, useContext, useRef } from "react";
import { MyContext } from "../../../App";
import { AuthContext } from "../../../context/AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import { Menu, MenuItem, ListItemIcon, Button } from "@mui/material";
import Logout from "@mui/icons-material/Logout";
import { FaUser } from "react-icons/fa";
import { productService } from "../../../services/productService";
import { customerService } from "../../../services/customerService";
import { sellService } from "../../../services/sellService";
import "../../../styles/sell.css";

const Sell = () => {
  const navigate = useNavigate();
  const context = useContext(MyContext);
  const { user, logout } = useContext(AuthContext);
  const [themeMode, setThemeMode] = useState(true);

  // ========================= State =========================
  const [searchProduct, setSearchProduct] = useState("");
  const [products, setProducts] = useState([]);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [customers, setCustomers] = useState([]);
  const [staffName, setStaffName] = useState("");
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState(() => {
    const saved = localStorage.getItem("paymentMethods");
    return saved ? JSON.parse(saved) : { 1: "cash" };
  });
  const [customerPay, setCustomerPay] = useState(() => {
    const saved = localStorage.getItem("customerPay");
    return saved ? Number(saved) : 0;
  });
  const [change, setChange] = useState(0);
  const [invoices, setInvoices] = useState(() => {
    const saved = localStorage.getItem("invoices");
    return saved ? JSON.parse(saved) : [{ id: 1, name: "Hóa đơn 1" }];
  });
  const [currentInvoiceId, setCurrentInvoiceId] = useState(() => {
    const savedId = localStorage.getItem("currentInvoiceId");
    return savedId ? savedId : 1;
  });
  const [carts, setCarts] = useState(() => {
    const storedCarts = localStorage.getItem("carts");
    const parsedCarts = storedCarts ? JSON.parse(storedCarts) : { [currentInvoiceId || 1]: [] };
    Object.keys(parsedCarts).forEach((key) => {
      parsedCarts[key] = parsedCarts[key].map((item) => ({
        ...item,
        productDetails: Array.isArray(item.productDetails)
          ? item.productDetails
          : [{ id: `default-${item.id}`, code: `PD-${item.id}`, unit: "CAN", price: 0, conversionRate: 1 }],
        selectedUnit: item.selectedUnit || (Array.isArray(item.productDetails) && item.productDetails[0]?.unit) || "CAN",
        price: Number(item.price) || 0,
      }));
    });
    return parsedCarts;
  });
  const [selectedCustomers, setSelectedCustomers] = useState(() => {
    const stored = localStorage.getItem("selectedCustomers");
    return stored ? JSON.parse(stored) : {};
  });

  const productSearchRef = useRef(null);
  const customerSearchRef = useRef(null);

  const cashSuggestions = [10000, 20000, 50000, 100000, 200000, 500000];

  // Unit display mapping
  const unitDisplayMap = {
    CAN: "Hộp/Lon",
    PACK: "Bịch/Lốc",
    CASE: "Thùng",
  };

  // ===================== Sự kiện ===================== 
  const open = Boolean(anchorEl);

  const handleAddCustomer = () => {
    alert("Thêm khách hàng mới");
  };

  const handleIncrease = (id) => {
    setCarts((prevCarts) => {
      const currentCart = prevCarts[currentInvoiceId] || [];
      const updatedCart = currentCart.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      );
      return {
        ...prevCarts,
        [currentInvoiceId]: updatedCart,
      };
    });
  };

  const handleDecrease = (id) => {
    setCarts((prevCarts) => {
      const currentCart = prevCarts[currentInvoiceId] || [];
      const updatedCart = currentCart.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
      return {
        ...prevCarts,
        [currentInvoiceId]: updatedCart,
      };
    });
  };

  const handleRemove = (id) => {
    setCarts((prevCarts) => {
      const currentCart = prevCarts[currentInvoiceId] || [];
      const updatedCart = currentCart.filter((item) => item.id !== id);
      return {
        ...prevCarts,
        [currentInvoiceId]: updatedCart,
      };
    });
  };

  const handleUnitChange = (id, newUnit) => {
    setCarts((prevCarts) => {
      const currentCart = prevCarts[currentInvoiceId] || [];
      const updatedCart = currentCart.map((item) => {
        if (item.id === id) {
          const selectedDetail = (item.productDetails || []).find((detail) => detail.unit === newUnit) || { price: 0 };
          return {
            ...item,
            selectedUnit: newUnit,
            price: Number(selectedDetail.price) || 0,
          };
        }
        return item;
      });
      return {
        ...prevCarts,
        [currentInvoiceId]: updatedCart,
      };
    });
  };

  const handleSubmitOrder = async () => {
    const currentCart = carts[currentInvoiceId] || [];
    if (currentCart.length === 0) {
      alert("Giỏ hàng không được để trống. Vui lòng thêm sản phẩm trước khi thanh toán.");
      return;
    }

    const orderData = {
      billCode: `INV-${currentInvoiceId}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: paymentMethods[currentInvoiceId] === "cash" ? "PAID" : "PENDING",
      totalAmount: Number(totalAmount.toFixed(2)),
      customerName: selectedCustomers[currentInvoiceId]?.name || null,
      customerEmail: selectedCustomers[currentInvoiceId]?.email || null,
      customerId: selectedCustomers[currentInvoiceId]?.id || null,
      items: currentCart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: Number(item.price.toFixed(2)),
        subtotal: Number((item.price * item.quantity).toFixed(2)),
        unit: item.selectedUnit, // Include unit for conversionRate
      })),
    };

    try {
      const response = await sellService.submitOrder(orderData);
      console.log("Đơn hàng đã được gửi:", response.data);

      // Reset state after successful submission
      setCarts((prev) => ({
        ...prev,
        [currentInvoiceId]: [],
      }));
      setSelectedCustomers((prev) => ({
        ...prev,
        [currentInvoiceId]: null,
      }));
      setCustomerPay(0);
      setPaymentMethods((prev) => ({
        ...prev,
        [currentInvoiceId]: "cash",
      }));
      alert("Thanh toán thành công!");
    } catch (error) {
      console.error("Lỗi khi gửi đơn hàng:", error);
      const errorMessage =
        error.response?.status === 400 && error.response?.data?.message
          ? error.response.data.message // e.g., "Insufficient stock for product X"
          : "Có lỗi xảy ra khi thanh toán. Vui lòng thử lại.";
      alert(errorMessage);
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomers((prev) => ({
      ...prev,
      [currentInvoiceId]: customer,
    }));
    setSearchCustomer("");
  };

  const handlePaymentChange = (value) => {
    setPaymentMethods((prev) => ({
      ...prev,
      [currentInvoiceId]: value,
    }));
  };

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const handleGoToAdmin = () => {
    navigate("/admin/dashboard");
  };

  const addToCart = (product) => {
    if (!currentInvoiceId) return;
    setCarts((prevCarts) => {
      const currentCart = prevCarts[currentInvoiceId] || [];
      const existingItem = currentCart.find((item) => item.id === product.id);
      const selectedDetail = product.productDetails.find((d) => d.unit === (existingItem?.selectedUnit || product.productDetails[0].unit));
      const requiredQuantity = (existingItem ? existingItem.quantity + 1 : 1) * selectedDetail.conversionRate;
      if (product.quantity < requiredQuantity) {
        alert(`Sản phẩm ${product.name} không đủ tồn kho. Còn lại: ${product.quantity}`);
        return;
      }
      let updatedCart;
      const defaultDetails = product.productDetails.length > 0
        ? product.productDetails
        : [{ id: `default-${product.id}`, code: `PD-${product.id}`, unit: "CAN", price: 0, conversionRate: 1 }];
      const defaultDetail = defaultDetails[0];
      if (existingItem) {
        updatedCart = currentCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updatedCart = [
          ...currentCart,
          {
            ...product,
            quantity: 1,
            selectedUnit: defaultDetail.unit,
            price: Number(defaultDetail.price),
            productDetails: defaultDetails,
          },
        ];
      }
      return {
        ...prevCarts,
        [currentInvoiceId]: updatedCart,
      };
    });
    setSearchProduct("");
  };

  const handleCreateNewInvoice = () => {
    if (invoices.length >= 10) {
      alert("Đã đạt tối đa 10 hóa đơn!");
      return;
    }
    const newId = invoices.length ? Math.max(...invoices.map((i) => i.id)) + 1 : 1;
    setInvoices([...invoices, { id: newId, name: `Hóa đơn ${newId}` }]);
    setCurrentInvoiceId(newId);
    setCarts((prevCarts) => ({
      ...prevCarts,
      [newId]: [],
    }));
    setSelectedCustomers((prev) => ({
      ...prev,
      [newId]: null,
    }));
    setPaymentMethods((prev) => ({
      ...prev,
      [newId]: "cash",
    }));
  };

  const handleDeleteInvoice = (id) => {
    if (invoices.length === 1) {
      const newId = 1;
      setInvoices([{ id: newId, name: "Hóa đơn 1" }]);
      setCurrentInvoiceId(newId);
      setCarts({ [newId]: [] });
      setSelectedCustomers({ [newId]: null });
      setPaymentMethods({ [newId]: "cash" });
      setCustomerPay(0);
      return;
    }
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
    setCarts((prevCarts) => {
      const newCarts = { ...prevCarts };
      delete newCarts[id];
      return newCarts;
    });
    setSelectedCustomers((prev) => {
      const newSelected = { ...prev };
      delete newSelected[id];
      return newSelected;
    });
    setPaymentMethods((prev) => {
      const newPayments = { ...prev };
      delete newPayments[id];
      return newPayments;
    });
    if (currentInvoiceId === id) {
      const newInvoice = invoices.find((inv) => inv.id !== id);
      setCurrentInvoiceId(newInvoice ? newInvoice.id : null);
    }
  };

  const handleSelectInvoice = (id) => {
    setCurrentInvoiceId(id);
  };

  // ===================== Tính toán =====================
  const totalAmount = (carts[currentInvoiceId] || []).reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );

  const filteredCustomers = customers.filter((c) => {
    const keyword = searchCustomer?.toLowerCase() || "";
    return (
      c.name.toLowerCase().includes(keyword) ||
      c.phone?.toLowerCase().includes(keyword)
    );
  });

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchProduct?.toLowerCase() || "")
  );

  // ===================== useEffect =====================
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "F1") {
        event.preventDefault();
        handleSubmitOrder();
      }
      if (event.key === "F3") {
        event.preventDefault();
        productSearchRef.current?.focus();
      }
      if (event.key === "F4") {
        event.preventDefault();
        customerSearchRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSubmitOrder]);

  useEffect(() => {
    if (invoices.length === 0) {
      const newId = 1;
      setInvoices([{ id: newId, name: `Hóa đơn ${newId}` }]);
      setCurrentInvoiceId(newId);
      setCarts((prev) => ({ ...prev, [newId]: [] }));
      setSelectedCustomers((prev) => ({ ...prev, [newId]: null }));
      setPaymentMethods((prev) => ({ ...prev, [newId]: "cash" }));
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getAllProducts();
        console.log("API Response (Products):", JSON.stringify(response.data, null, 2));
        const transformedProducts = response.data.map((product) => ({
          id: product.id.toString(),
          name: product.name || "Unknown Product",
          productDetails: Array.isArray(product.productDetails)
            ? product.productDetails.map((detail) => ({
              id: detail.id,
              code: detail.code,
              unit: detail.unit,
              price: Number(detail.price) || 0,
              conversionRate: detail.conversionRate || 1,
            }))
            : [{ id: `default-${product.id}`, code: `PD-${product.id}`, unit: "CAN", price: 0, conversionRate: 1 }],
        }));
        setProducts(transformedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      }
    };

    const fetchCustomers = async () => {
      try {
        const response = await customerService.getAllCustomers();
        console.log("API Response (Customers):", JSON.stringify(response.data, null, 2));
        const transformedCustomers = response.data.map((customer) => ({
          id: customer.id.toString(),
          name: customer.name || "Unknown Customer",
          phone: customer.phone || "N/A",
          email: customer.email || "N/A",
        }));
        setCustomers(transformedCustomers);
      } catch (error) {
        console.error("Error fetching customers:", error);
        if (error.response?.status === 401) {
          alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
          logout();
          navigate("/admin/login");
        } else {
          setCustomers([]);
        }
      }
    };

    fetchProducts();
    fetchCustomers();

    if (themeMode === true) {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
      localStorage.setItem("themeMode", "light");
    }

    if (user?.name) {
      setStaffName(user.name);
    } else {
      setStaffName("Tên không xác định");
    }

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
    const timer = setInterval(updateDateTime, 1000);

    context.setisHideSidebarAndHeader(true);
    window.scrollTo(0, 0);

    return () => {
      clearInterval(timer);
      context.setisHideSidebarAndHeader(false);
    };
  }, [context, user, themeMode, logout, navigate]);

  useEffect(() => {
    setChange(customerPay - totalAmount);
  }, [customerPay, totalAmount]);

  useEffect(() => {
    localStorage.setItem("carts", JSON.stringify(carts));
    localStorage.setItem("selectedCustomers", JSON.stringify(selectedCustomers));
    localStorage.setItem("currentInvoiceId", currentInvoiceId);
    localStorage.setItem("invoices", JSON.stringify(invoices));
    localStorage.setItem("paymentMethods", JSON.stringify(paymentMethods));
    localStorage.setItem("customerPay", customerPay);
  }, [carts, selectedCustomers, currentInvoiceId, invoices, paymentMethods, customerPay]);

  return (
    <div className="vh-100 d-flex flex-column" style={{ fontSize: "0.8rem" }}>
      {/* Header */}
      <nav className="navbar navbar-dark bg-primary px-3">
        <div className="d-flex align-items-center">
          <div className="position-relative mr-2" style={{ width: "350px" }}>
            <input
              className="form-control"
              placeholder="Tìm sản phẩm... (F3)"
              value={searchProduct}
              onChange={(e) => setSearchProduct(e.target.value)}
              ref={productSearchRef}
            />
            {searchProduct && filteredProducts.length > 0 && (
              <ul
                className="list-group position-absolute w-100"
                style={{ zIndex: 1000, top: "100%", left: 0 }}
              >
                {filteredProducts.map((product) => (
                  <li
                    key={product.id}
                    className="list-group-item list-group-item-action"
                    onClick={() => addToCart(product)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex justify-content-between">
                      <span>{product.name}</span>
                      <strong>
                        {product.productDetails[0]?.price
                          ? product.productDetails[0].price.toLocaleString()
                          : 0}
                        đ ({unitDisplayMap[product.productDetails[0]?.unit] || product.productDetails[0]?.unit || "N/A"})
                      </strong>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="d-flex align-items-center">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="position-relative mr-2"
                style={{ display: "inline-block" }}
              >
                <button
                  className={`btn ${currentInvoiceId === inv.id ? "btn-primary" : "btn-light"}`}
                  style={{
                    width: "130px",
                    textAlign: "left",
                    paddingLeft: "1rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  onClick={() => handleSelectInvoice(inv.id)}
                >
                  {inv.name}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteInvoice(inv.id);
                  }}
                  className="btn btn-sm btn-danger position-absolute"
                  style={{
                    top: "9px",
                    right: "5px",
                    width: "20px",
                    height: "20px",
                    padding: 0,
                    fontSize: "12px",
                    lineHeight: "1",
                    borderRadius: "50%",
                  }}
                  title="Xóa hóa đơn"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              className="btn btn-light btn-sm"
              onClick={handleCreateNewInvoice}
              style={{ height: "36px", minWidth: "36px", padding: "0 10px" }}
              title="Tạo hóa đơn mới"
            >
              +
            </button>
          </div>
        </div>
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
      <div className="flex-grow-1 d-flex flex-column overflow-hidden" style={{ height: "100vh" }}>
        <div className="row flex-grow-1 overflow-auto m-0">
          <div className="col-12 col-sm-8 d-flex flex-column p-0">
            <div className="p-3 bg-white overflow-auto" style={{ maxHeight: "450px" }}>
              {(carts[currentInvoiceId] || []).map((item) => (
                <div key={item.id} className="d-flex align-items-center border-bottom py-2">
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="btn btn-link text-danger p-0 mr-3"
                  >
                    🗑
                  </button>
                  <span className="mr-3" style={{ minWidth: "100px" }}>{item.id}</span>
                  <span className="flex-grow-1">{item.name}</span>
                  <div className="d-flex align-items-center">
                    <select
                      className="form-control form-control-sm mr-3"
                      style={{ width: "100px" }}
                      value={item.selectedUnit}
                      onChange={(e) => handleUnitChange(item.id, e.target.value)}
                    >
                      {(() => {
                        const availableUnits = (item.productDetails || []).map((detail) => ({
                          id: detail.id,
                          unit: detail.unit,
                          price: detail.price,
                        }));
                        const allUnits = [
                          { id: `default-can-${item.id}`, unit: "CAN", price: 0 },
                          { id: `default-pack-${item.id}`, unit: "PACK", price: 0 },
                          { id: `default-case-${item.id}`, unit: "CASE", price: 0 },
                        ];
                        const unitMap = new Map();
                        availableUnits.forEach((u) => unitMap.set(u.unit, u));
                        allUnits.forEach((u) => {
                          if (!unitMap.has(u.unit)) unitMap.set(u.unit, u);
                        });
                        return Array.from(unitMap.values()).map((detail) => (
                          <option key={detail.id} value={detail.unit}>
                            {unitDisplayMap[detail.unit] || detail.unit}
                          </option>
                        ));
                      })()}
                    </select>
                    <button
                      onClick={() => handleDecrease(item.id)}
                      className="btn btn-sm btn-outline-secondary mr-2"
                    >
                      -
                    </button>
                    <span className="mx-1" style={{ minWidth: "25px", textAlign: "center" }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleIncrease(item.id)}
                      className="btn btn-sm btn-outline-secondary mr-3"
                    >
                      +
                    </button>
                    <span className="mr-3" style={{ minWidth: "80px", textAlign: "right" }}>
                      {(item.price || 0).toLocaleString()}
                    </span>
                    <strong className="mr-3" style={{ minWidth: "100px", textAlign: "right" }}>
                      {((item.price || 0) * item.quantity).toLocaleString()}
                    </strong>
                  </div>
                </div>
              ))}
              {(!carts[currentInvoiceId] || carts[currentInvoiceId].length === 0) && (
                <p className="text-muted text-center">Không có sản phẩm trong giỏ.</p>
              )}
            </div>
            <div className="p-2 bg-light border-top mt-auto">
              <input
                className="form-control p-4"
                placeholder="Ghi chú cho đơn hàng..."
              />
            </div>
          </div>
          <div className="col-12 col-sm-4 d-flex flex-column p-0 border-left bg-light">
            <div className="flex-grow-1 p-3 d-flex flex-column overflow-auto">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span><strong></strong></span>
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
                    ref={customerSearchRef}
                  />
                  <button
                    className="btn btn-sm btn-outline-primary ml-2"
                    onClick={handleAddCustomer}
                  >
                    +
                  </button>
                </div>
                {searchCustomer && filteredCustomers.length > 0 && (
                  <div
                    className="border bg-white position-absolute mt-1 shadow-sm zindex-dropdown rounded"
                    style={{ maxHeight: "200px", overflowY: "auto", width: "80%" }}
                  >
                    {filteredCustomers.map((customer) => (
                      <div
                        key={customer.id}
                        className="px-2 py-1 customer-suggestion hover-bg border-bottom"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        <div><strong>{customer.name}</strong> - {customer.phone}</div>
                        <div className="text-muted small">Mã KH: {customer.id}</div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedCustomers[currentInvoiceId] && (
                  <div className="mt-2 p-2 bg-white rounded border d-flex justify-content-between align-items-center">
                    <div>
                      <div>
                        <strong>Khách đã chọn:</strong> {selectedCustomers[currentInvoiceId].name} (
                        {selectedCustomers[currentInvoiceId].phone})
                      </div>
                      <div className="text-muted small">
                        Mã KH: {selectedCustomers[currentInvoiceId].id}
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger ml-3"
                      onClick={() => {
                        setSelectedCustomers((prev) => ({
                          ...prev,
                          [currentInvoiceId]: null,
                        }));
                      }}
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
                  type="number"
                  value={customerPay === 0 ? "" : customerPay}
                  onChange={(e) => setCustomerPay(Number(e.target.value))}
                />
              </div>
              <div className="mb-2 d-flex justify-content-between font-weight-bold text-success">
                <span>Tiền trả lại khách:</span>
                <span>{change > 0 ? change.toLocaleString() : 0}</span>
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
                      checked={paymentMethods[currentInvoiceId] === "cash"}
                      onChange={() => handlePaymentChange("cash")}
                    />
                    <span className="ml-2">Tiền mặt</span>
                  </label>
                  <label className="form-check mr-3 d-flex align-items-center">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="payment"
                      value="bank"
                      checked={paymentMethods[currentInvoiceId] === "bank"}
                      onChange={() => handlePaymentChange("bank")}
                    />
                    <span className="ml-2">Chuyển khoản</span>
                  </label>
                </div>
                {paymentMethods[currentInvoiceId] === "cash" && (
                  <div className="bg-white border rounded mt-3 p-2 d-flex flex-wrap">
                    {cashSuggestions.map((amount) => (
                      <button
                        key={amount}
                        className="btn btn-outline-secondary btn-sm m-1"
                        onClick={() => setCustomerPay(amount)}
                      >
                        {amount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {paymentMethods[currentInvoiceId] === "bank" && (
                <div className="text-muted small text-center">
                  Bạn chưa có tài khoản ngân hàng
                  <div className="text-primary cursor-pointer">+ Thêm tài khoản</div>
                </div>
              )}
              <button className="btn btn-primary btn-block mt-3" onClick={handleSubmitOrder}>
                THANH TOÁN (F1)
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-around bg-white py-2 border-top">
        <Button className="text-primary font-weight-bold">⚡ Bán nhanh</Button>
        <Button className="text-primary font-weight-bold">🚚 Bán giao hàng</Button>
      </div>
    </div>
  );
};

export default Sell;