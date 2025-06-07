import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Modal, Box, Typography, FormControl, MenuItem, Pagination, Select, CircularProgress, Tooltip } from '@mui/material';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { FaEye } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { RxReset } from 'react-icons/rx';
import { MyContext } from '../../../App';
import { AuthContext } from '../../../context/AuthProvider';
import { productService } from '../../../services/productService';
import axios from '../../../services/axiosConfig';
import { Warning } from '@mui/icons-material';

const styleImport = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '40%',
  maxWidth: 1000,
  maxHeight: '80vh',
  overflowY: 'auto',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
};

const LOW_STOCK_THRESHOLD = 10; // Threshold for low stock warning
const OUT_OF_STOCK = 0; // Threshold for out of stock warning

const Products = () => {
  const navigate = useNavigate();
  const { setisHideSidebarAndHeader } = useContext(MyContext);
  const { isAuthenticated, token } = useContext(AuthContext);

  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openModelImport, setModelImport] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showByCategory, setShowByCategory] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1); // Reset to first page when status changes
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = showByCategory === '' || (product.productType?.category?.id === Number(showByCategory));
    return matchesCategory;
  });

  const totalResults = filteredProducts.length;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.type)) {
      setSelectedFile(file);
    } else {
      toast.error('Vui lòng chọn file Excel (.xls hoặc .xlsx)');
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Vui lòng chọn file Excel!');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setIsSubmitting(true);
      await axios.post('/admin/products/importExcel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Nhập sản phẩm thành công');
      setModelImport(false);
      fetchProducts();
    } catch (error) {
      console.error('Import error:', error);
      toast.error(`Nhập thất bại: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
      setSelectedFile(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      await productService.deleteProduct(id);
      Swal.fire("Thành công", "Sản phẩm đã được xóa", "success");
      fetchProducts();
    } catch (error) {
      console.error("Delete Error:", error.response);
      Swal.fire("Lỗi", error.response?.data?.message || "Xóa sản phẩm thất bại", "error");
    }
  };

  const handleReset = async (id) => {
    try {
      await productService.resetProduct(id);
      Swal.fire("Thành công", "Sản phẩm đã được kích hoạt lại", "success");
      fetchProducts();
    } catch (error) {
      console.error("Reset Error:", error.response);
      Swal.fire("Lỗi", error.response?.data?.message || "Kích hoạt sản phẩm thất bại", "error");
    }
  };

  const handleViewProduct = (product) => {
    navigate(`/admin/product-details/${product.id}`);
  };

  const handleRowClick = (product) => {
    navigate(`/admin/product-update/${product.id}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' VND';
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      console.log('Fetching products with token:', token ? 'Token present' : 'No token');
      const response = await productService.getProductsByStatus(statusFilter);
      console.log('Fetch products response:', response);
      if (!Array.isArray(response.data)) {
        throw new Error('Dữ liệu sản phẩm không phải là mảng');
      }
      setProducts(response.data);
    } catch (error) {
      console.error('Fetch products error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      toast.error(`Lỗi khi tải sản phẩm: ${error.response?.data?.message || error.message}`);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/admin/categories');
      setCategories(response.data.filter(category => category.status === 'ACTIVE'));
    } catch (error) {
      console.error('Fetch categories error:', error);
      toast.error(`Lỗi khi tải danh mục: ${error.response?.data?.message || error.message}`);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    console.log('useEffect triggered, isAuthenticated:', isAuthenticated);
    fetchProducts();
    fetchCategories();
    setisHideSidebarAndHeader(false);
    window.scrollTo(0, 0);
  }, [isAuthenticated, navigate, setisHideSidebarAndHeader, statusFilter]);

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-4">
        <div className="row">
          <div className="col-md-3">
            <h3 className="hd">Danh sách sản phẩm</h3>
          </div>
          <div className="col-md-3">
            <Button className="btn-blue btn-lg btn-big" onClick={() => setModelImport(true)}>
              Nhập Excel
            </Button>
          </div>
          <div className="col-md-3">
            <Link to="/admin/product-upload">
              <Button className="btn-blue btn-lg btn-big">Thêm sản phẩm</Button>
            </Link>
          </div>
        </div>

        <div className="row cardFilters mt-3">
          <div className="col-md-3">
            <h4>Lọc theo trạng thái</h4>
            <FormControl size="small" className="w-100">
              <Select
                value={statusFilter}
                onChange={handleStatusChange}
                displayEmpty
                inputProps={{ 'aria-label': 'Without label' }}
              >
                <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                <MenuItem value="INACTIVE">Không hoạt động</MenuItem>
                <MenuItem value="DISCONTINUED">Ngừng kinh doanh</MenuItem>
              </Select>
            </FormControl>
          </div>
          <div className="col-md-3">
            <h4>Lọc theo danh mục</h4>
            <FormControl size="small" className="w-100">
              <Select
                value={showByCategory}
                onChange={(e) => {
                  setShowByCategory(e.target.value);
                  setCurrentPage(1);
                }}
                displayEmpty
                inputProps={{ 'aria-label': 'Without label' }}
              >
                <MenuItem value=""><em>Tất cả</em></MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>

        <div className="table-responsive mt-3">
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : currentProducts.length === 0 ? (
            <Box textAlign="center" my={4}>
              <Typography variant="h6">Không tìm thấy sản phẩm</Typography>
            </Box>
          ) : (
            <>
              <table className="table table-bordered v-align">
                <thead className="thead-dark">
                  <tr>
                    <th style={{ width: '300px' }}>Sản phẩm</th>
                    <th>Có thể bán</th>
                    <th>Ngày khởi tạo</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map((product) => (
                    <tr
                      key={product.id}
                      onClick={() => handleRowClick(product)}
                      style={{ cursor: 'pointer' }}
                      className="hover-row"
                    >
                      <td style={{ verticalAlign: 'middle', padding: '8px' }}>
                        <div className="d-flex align-items-center productBox">
                          <div className="imgWrapper">
                            <div
                              className="img card shadow m-0"
                              style={{
                                maxWidth: '50px',
                                maxHeight: '50px',
                                width: '50px',
                                height: '50px',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <img
                                src={product.imageUrl || '/default-image.png'}
                                style={{
                                  objectFit: 'contain',
                                  objectPosition: 'center',
                                  maxWidth: '100%',
                                  maxHeight: '100%',
                                }}
                                alt={product.name}
                              />
                            </div>
                          </div>
                          <div className="info pl-3">
                           <h6> <Link>{product.name}</Link></h6>
                            <p>{product.description || 'Không có mô tả'}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'middle', padding: '8px' }}>
                        <div className="d-flex align-items-center">
                          <span>{product.quantity}</span>
                          {product.quantity === OUT_OF_STOCK ? (
                            <Tooltip title="Hết hàng" placement="right">
                              <Warning sx={{ ml: 2, color: 'red' }} />
                            </Tooltip>
                          ) : product.quantity <= LOW_STOCK_THRESHOLD ? (
                            <Tooltip title={`Sắp hết hàng: Còn ${product.quantity} (dưới ngưỡng ${LOW_STOCK_THRESHOLD})`} placement="right">
                              <Warning sx={{ ml: 2, color: '#ffca28' }} />
                            </Tooltip>
                          ) : null}
                        </div>
                      </td>
                      <td style={{ verticalAlign: 'middle', padding: '8px' }}>{product.createDate || 'Chưa có thông tin'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="d-flex tableFooter">
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  showFirstButton
                  showLastButton
                  color="primary"
                  className="pagination"
                />
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        keepMounted
        open={openModelImport}
        onClose={() => setModelImport(false)}
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
      >
        <Box sx={styleImport}>
          <Typography id="keep-mounted-modal-title" variant="h6" component="span">
            Nhập sản phẩm từ Excel (Tải mẫu: <a href="/sample.xlsx">File Excel</a>)
          </Typography>
          <Typography id="keep-mounted-modal-description" component="span" sx={{ mt: 2 }}>
            <form className="form mt-3" onSubmit={handleImportSubmit} encType="multipart/form-data">
              <div className="row">
                <div className="col-md-12">
                  <div className="card p-2 mt-0">
                    <div className="row">
                      <div className="col-md-12">
                        <div className="form-group">
                          <input
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            id="file-input"
                          />
                          <label htmlFor="file-input">
                            <Button className="btn-blue mt-2" component="span">Chọn file</Button>
                          </label>
                          {selectedFile && <Typography variant="body2" mt={1}>{selectedFile.name}</Typography>}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card p-4 mt-0">
                <div className="row">
                  <div className="col mt-2">
                    <Button
                      className="btn-blue btn-lg btn-big"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Đang nhập...' : 'Nhập'}
                    </Button>
                  </div>
                  <div className="col mt-2">
                    <Button
                      className="btn-big btn-close"
                      onClick={() => setModelImport(false)}
                      disabled={isSubmitting}
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Typography>
        </Box>
      </Modal>
    </div>
  );
};

export default Products;