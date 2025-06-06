import React, { useEffect, useState, useContext, useRef } from "react";
import { MyContext } from "../../../App";
import { AuthContext } from "../../../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import { Menu, MenuItem, ListItemIcon, Button } from "@mui/material";
import Logout from "@mui/icons-material/Logout";
import { FaUser } from "react-icons/fa";
import { productService } from "../../../services/productService";
import { customerService } from "../../../services/customerService";
import { sellService } from "../../../services/sellService";
import { unitService } from "../../../services/unitService";
import "../../../styles/sell.css";

const Sell = () => {
  const navigate = useNavigate();
  const context = useContext(MyContext);
  const { user, logout } = useContext(AuthContext);
  const [themeMode] = useState(true);

  // State
  const [searchProduct, setSearchProduct] = useState("");
  const [products, setProducts] = useState([]);
  const [searchCustomer, setSearchCustomer] = useState("");
  const [customers, setCustomers] = useState([]);
  const [units, setUnits] = useState([]);
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
    return savedId ? Number(savedId) : 1;
  });
  const [carts, setCarts] = useState(() => {
    const storedCarts = localStorage.getItem("carts");
    const parsedCarts = storedCarts ? JSON.parse(storedCarts) : { 1: [] };
    Object.keys(parsedCarts).forEach((key) => {
      parsedCarts[key] = parsedCarts[key].map((item) => ({
        ...item,
        productDetails: Array.isArray(item.productDetails)
          ? item.productDetails
          : [{ id: `default-${item.id}`, code: `PD-${item.id}`, unitId: null, price: 0, conversionRate: 1 }],
        selectedUnitId: item.selectedUnitId || (Array.isArray(item.productDetails) && item.productDetails[0]?.unitId) || null,
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

  // Sự kiện
  const open = Boolean(anchorEl);

  // Tải danh sách Unit từ backend
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await unitService.getAllUnit();
        setUnits(response.data);
      } catch (error) {
        console.error("Error fetching units:", error);
        alert("Không thể tải danh sách đơn vị");
      }
    };
    fetchUnits();
  }, []);

  const handleAddCustomer = () => {
    alert("Thêm khách hàng mới");
  };

  const handleIncrease = (id) => {
    setCarts((prevCarts) => {
      const currentCart = prevCarts[currentInvoiceId] || [];
      const updatedCart = currentCart.map((item) => {
        if (item.id === id) {
          const product = products.find((p) => p.id === item.id);
          if (!product) {
            alert(`Không tìm thấy sản phẩm ${item.name}`);
            return item;
          }
          const selectedDetail = (item.productDetails || []).find((detail) => detail.unitId === item.selectedUnitId) || { conversionRate: 1 };
          const requiredQuantity = (item.quantity + 1) * (selectedDetail.conversionRate || 1);
          if (product.quantity < requiredQuantity) {
            alert(`Sản phẩm ${item.name} không đủ tồn kho. Còn lại: ${product.quantity}`);
            return item;
          }
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      });
      return { ...prevCarts, [currentInvoiceId]: updatedCart };
    });
  };

  const handleDecrease = (id) => {
    setCarts((prevCarts) => {
      const currentCart = prevCarts[currentInvoiceId] || [];
      const updatedCart = currentCart.map((item) =>
        item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      );
      return { ...prevCarts, [currentInvoiceId]: updatedCart };
    });
  };

  const handleRemove = (id) => {
    setCarts((prevCarts) => {
      const currentCart = prevCarts[currentInvoiceId] || [];
      const updatedCart = currentCart.filter((item) => item.id !== id);
      return { ...prevCarts, [currentInvoiceId]: updatedCart };
    });
  };

  const handleUnitChange = (id, newUnitId) => {
    setCarts((prevCarts) => {
      const currentCart = prevCarts[currentInvoiceId] || [];
      const updatedCart = currentCart.map((item) => {
        if (item.id === id) {
          const selectedDetail = (item.productDetails || []).find((detail) => detail.unitId === parseInt(newUnitId)) || { price: 0 };
          return {
            ...item,
            selectedUnitId: parseInt(newUnitId),
            price: Number(selectedDetail.price) || 0,
          };
        }
        return item;
      });
      return { ...prevCarts, [currentInvoiceId]: updatedCart };
    });
  };

  const handleSubmitOrder = async () => {
    const currentCart = carts[currentInvoiceId] || [];
    if (currentCart.length === 0) {
      alert("Giỏ hàng không được để trống. Vui lòng thêm sản phẩm trước khi thanh toán.");
      return;
    }

    // Kiểm tra tính hợp lệ của các mục trong giỏ
    for (const item of currentCart) {
      if (!item.selectedUnitId) {
        alert(`Vui lòng chọn đơn vị cho sản phẩm ${item.name}`);
        return;
      }
      const selectedDetail = (item.productDetails || []).find((detail) => detail.unitId === item.selectedUnitId);
      if (!selectedDetail || !selectedDetail.id) {
        alert(`Không tìm thấy chi tiết sản phẩm cho đơn vị đã chọn của ${item.name}`);
        return;
      }
    }

    const orderData = {
      billCode: `INV-${currentInvoiceId}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: paymentMethods[currentInvoiceId] === "cash" ? "PAID" : "PENDING",
      totalAmount: Number(totalAmount.toFixed(2)),
      customerId: selectedCustomers[currentInvoiceId]?.id || null,
      items: currentCart.map((item) => {
        const selectedDetail = (item.productDetails || []).find((detail) => detail.unitId === item.selectedUnitId);
        return {
          productDetailsId: selectedDetail.id, // Gửi productDetailsId thay vì productId
          quantity: item.quantity,
          unitPrice: Number(item.price.toFixed(2)),
          subtotal: Number((item.price * item.quantity).toFixed(2)),
          unitId: item.selectedUnitId,
        };
      }),
    };

    try {
      const response = await sellService.submitOrder(orderData);
      console.log("Đơn hàng đã được gửi:", response.data);

      // Xóa hóa đơn hiện tại sau khi gửi thành công
      setInvoices((prev) => {
        const newInvoices = prev.filter((inv) => inv.id !== currentInvoiceId);
        if (newInvoices.length === 0) {
          const newId = 1;
          setCarts({ [newId]: [] });
          setSelectedCustomers({ [newId]: null });
          setPaymentMethods({ [newId]: "cash" });
          setCustomerPay(0);
          setCurrentInvoiceId(newId);
          return [{ id: newId, name: "Hóa đơn 1" }];
        } else {
          setCurrentInvoiceId(newInvoices[0].id);
          setCarts((prevCarts) => {
            const newCarts = { ...prevCarts };
            delete newCarts[currentInvoiceId];
            return newCarts;
          });
          setSelectedCustomers((prev) => {
            const newSelected = { ...prev };
            delete newSelected[currentInvoiceId];
            return newSelected;
          });
          setPaymentMethods((prev) => {
            const newPayments = { ...prev };
            delete newPayments[currentInvoiceId];
            return newPayments;
          });
          setCustomerPay(0);
          return newInvoices;
        }
      });

      alert("Thanh toán thành công!");
    } catch (error) {
      console.error("Lỗi khi gửi đơn hàng:", error);
      const errorMessage =
        error.response?.status === 400 && error.response?.data?.message
          ? error.response.data.message
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
      const defaultDetail = product.productDetails[0] || { id: null, unitId: null, price: 0, conversionRate: 1 };
      const selectedDetail = product.productDetails.find((d) => d.unitId === (existingItem?.selectedUnitId || defaultDetail.unitId)) || defaultDetail;
      const requiredQuantity = (existingItem ? existingItem.quantity + 1 : 1) * (selectedDetail.conversionRate || 1);
      if (product.quantity < requiredQuantity) {
        alert(`Sản phẩm ${product.name} không đủ tồn kho. Còn lại: ${product.quantity}`);
        return prevCarts;
      }
      let updatedCart;
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
            selectedUnitId: defaultDetail.unitId,
            price: Number(defaultDetail.price),
            productDetails: product.productDetails,
          },
        ];
      }
      return { ...prevCarts, [currentInvoiceId]: updatedCart };
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
    setCarts((prevCarts) => ({ ...prevCarts, [newId]: [] }));
    setSelectedCustomers((prev) => ({ ...prev, [newId]: null }));
    setPaymentMethods((prev) => ({ ...prev, [newId]: "cash" }));
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

  // Tính toán
  const totalAmount = (carts[currentInvoiceId] || []).reduce(
    (sum, item) => sum + (item.price || 0) * item.quantity,
    0
  );

  const filteredCustomers = customers.filter((c) => {
    const keyword = searchCustomer?.toLowerCase() || "";
    return c.name.toLowerCase().includes(keyword) || c.phone?.toLowerCase().includes(keyword);
  });

  const filteredProducts = products.filter((product) =>
    (product.name || "").toLowerCase().includes((searchProduct || "").toLowerCase())
  );

  // useEffect
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
    return () => window.removeEventListener("keydown", handleKeyDown);
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
        const transformedProducts = response.data.map((product) => ({
          id: (product.id || "").toString(),
          name: product.name || "Unknown Product",
          quantity: product.quantity || 0,
          productDetails: Array.isArray(product.productDetails)
            ? product.productDetails.map((detail) => ({
                id: detail.id || `default-${product.id}`,
                code: detail.code || `PD-${product.id}`,
                unitId: detail.unitId || null,
                price: Number(detail.price) || 0,
                conversionRate: detail.conversionRate || 1,
              }))
            : [{ id: `default-${product.id}`, code: `PD-${product.id}`, unitId: null, price: 0, conversionRate: 1 }],
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

    if (themeMode) {
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
    localStorage.setItem("currentInvoiceId", String(currentInvoiceId));
    localStorage.setItem("invoices", JSON.stringify(invoices));
    localStorage.setItem("paymentMethods", JSON.stringify(paymentMethods));
    localStorage.setItem("customerPay", String(customerPay));
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
              <ul className="list-group position-absolute w-100" style={{ zIndex: 1000, top: "100%", left: 0 }}>
                {filteredProducts.map((product) => (
                  <li
                    key={product.id}
                    className="list-group-item list-group-item-action"
                    onClick={() => addToCart(product)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="d-flex justify-content-between">
                      <div>
                        <span>{product.name}</span>
                        <div className="text-muted small">
                          Mã SP: {product.productDetails[0]?.code || "N/A"}
                        </div>
                      </div>
                      <strong>
                        {product.productDetails[0]?.price
                          ? product.productDetails[0].price.toLocaleString()
                          : 0}
                        đ ({units.find((u) => u.id === product.productDetails[0]?.unitId)?.name || "N/A"})
                      </strong>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="d-flex align-items-center">
            {invoices.map((inv) => (
              <div key={inv.id} className="position-relative mr-2" style={{ display: "inline-block" }}>
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
      <div className="flex-grow-1 d-flex flex-column overflow-hidden">
        <div className="row flex-grow-1 overflow-auto m-0">
          <div className="col-12 col-sm-8 d-flex flex-column p-0">
            <div className="p-3 bg-white overflow-auto" style={{ maxHeight: "450px" }}>
              {/* Cart Header */}
              <div className="cart-header">
                <div className="col-stt">STT</div>
                <div className="col-remove"></div>
                <div className="col-code">Mã SP</div>
                <div className="col-name">Tên sản phẩm</div>
                <div className="col-unit">Đơn vị</div>
                <div className="col-quantity">Số lượng</div>
                <div className="col-price">Đơn giá</div>
                <div className="col-total">Thành tiền</div>
              </div>

              {/* Cart Items */}
              {(carts[currentInvoiceId] || []).map((item, index) => (
                <div key={item.id} className="cart-item">
                  <span className="col-stt">{index + 1}</span>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="btn btn-link text-danger p-0 col-remove"
                  >
                    🗑
                  </button>
                  <span className="col-code" title={(item.productDetails || []).find((d) => d.unitId === item.selectedUnitId)?.code || "N/A"}>
                    {(item.productDetails || []).find((d) => d.unitId === item.selectedUnitId)?.code || "N/A"}
                  </span>
                  <span className="col-name" title={item.name}>
                    {item.name}
                  </span>
                  <select
                    className="form-control form-control-sm col-unit"
                    value={item.selectedUnitId || ""}
                    onChange={(e) => handleUnitChange(item.id, e.target.value)}
                  >
                    {(item.productDetails || []).map((detail) => (
                      <option key={detail.unitId} value={detail.unitId}>
                        {units.find((u) => u.id === detail.unitId)?.name || "N/A"}
                      </option>
                    ))}
                  </select>
                  <div className="col-quantity d-flex align-items-center">
                    <button
                      onClick={() => handleDecrease(item.id)}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      -
                    </button>
                    <span className="mx-2">{item.quantity}</span>
                    <button
                      onClick={() => handleIncrease(item.id)}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      +
                    </button>
                  </div>
                  <span className="col-price">{(item.price || 0).toLocaleString()}</span>
                  <strong className="col-total">{((item.price || 0) * item.quantity).toLocaleString()}</strong>
                </div>
              ))}
              {(!carts[currentInvoiceId] || carts[currentInvoiceId].length === 0) && (
                <p className="text-muted text-center">Không có sản phẩm trong giỏ hàng.</p>
              )}
            </div>
            <div className="p-2 bg-light border-top mt-auto">
              <input className="form-control p-2" placeholder="Ghi chú cho đơn hàng..." />
            </div>
          </div>
          <div className="col-12 col-sm-4 d-flex flex-column p-0 border-left bg-light">
            <div className="flex-grow-1 p-3 d-flex flex-column overflow-auto">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span></span>
                <span>{currentDateTime}</span>
              </div>
              <div className="position-relative w-100 mb-2">
                <div className="d-flex align-items-center">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Tìm khách hàng... (F4)"
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
                        <div>
                          <strong>{customer.name}</strong> - {customer.phone}
                        </div>
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
                      <div className="text-muted small">Mã KH: {selectedCustomers[currentInvoiceId].id}</div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger ml-3"
                      onClick={() =>
                        setSelectedCustomers((prev) => ({
                          ...prev,
                          [currentInvoiceId]: null,
                        }))
                      }
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
        <div className="d-flex justify-content-around bg-white py-2 border-top">
          <Button className="text-primary">⚡ Bán nhanh</Button>
          <Button className="text-secondary">🚚 Bán giao</Button>
        </div>
      </div>
    </div>
  );
};

export default Sell;