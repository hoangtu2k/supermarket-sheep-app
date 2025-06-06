import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, Box, Typography, FormControl, MenuItem, Pagination, Select, CircularProgress } from '@mui/material';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { FaEye, FaPencilAlt } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { RxReset } from 'react-icons/rx';
import { MyContext } from '../../../App';
import { AuthContext } from '../../../context/AuthProvider';
import { customerService } from '../../../services/customerService';
import axios from '../../../services/axiosConfig';

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

const Customers = () => {
  const navigate = useNavigate();
  const { setisHideSidebarAndHeader } = useContext(MyContext);
  const { isAuthenticated, token } = useContext(AuthContext);

  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openModelImport, setModelImport] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [customers, setCustomers] = useState([]);
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

  const filteredCustomers = customers.filter((customer) => {
    return statusFilter === '' || customer.status === statusFilter;
  });

  const totalResults = filteredCustomers.length;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const currentCustomers = filteredCustomers.slice(
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
      await axios.post('/admin/customers/importExcel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Nhập khách hàng thành công');
      setModelImport(false);
      fetchCustomers();
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
      await customerService.deleteCustomer(id);
      Swal.fire("Thành công", "Khách hàng đã được xóa", "success");
      fetchCustomers();
    } catch (error) {
      console.error("Delete Error:", error.response);
      Swal.fire("Lỗi", error.response?.data?.message || "Xóa khách hàng thất bại", "error");
    }
  };

  const handleReset = async (id) => {
    try {
      await customerService.resetCustomer(id);
      Swal.fire("Thành công", "Khách hàng đã được kích hoạt lại", "success");
      fetchCustomers();
    } catch (error) {
      console.error("Reset Error:", error.response);
      Swal.fire("Lỗi", error.response?.data?.message || "Kích hoạt khách hàng thất bại", "error");
    }
  };

  const handleOpenModelUpdateCustomer = (customer) => {
    navigate(`/admin/customer-update/${customer.id}`);
  };

  const handleViewCustomer = (customer) => {
    navigate(`/admin/customer-details/${customer.id}`);
  };

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      console.log('Fetching customers with token:', token ? 'Token present' : 'No token');
      const response = await customerService.getCustomersByStatus(statusFilter);
      console.log('Fetch customers response:', response);
      if (!Array.isArray(response.data)) {
        throw new Error('Dữ liệu khách hàng không phải là mảng');
      }
      setCustomers(response.data);
    } catch (error) {
      console.error('Fetch customers error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      toast.error(`Lỗi khi tải khách hàng: ${error.response?.data?.message || error.message}`);
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
      return;
    }
    console.log('useEffect triggered, isAuthenticated:', isAuthenticated);
    fetchCustomers();
    setisHideSidebarAndHeader(false);
    window.scrollTo(0, 0);
  }, [isAuthenticated, navigate, setisHideSidebarAndHeader, statusFilter]);

  return (
    <div className="right-content w-100">
      <div className="card shadow border-0 p-3 mt-4">
        <div className="row">
          <div className="col-md-3">
            <h3 className="hd">Danh sách khách hàng</h3>
          </div>
          <div className="col-md-3">
            <Button className="btn-blue btn-lg btn-big" onClick={() => setModelImport(true)}>
              Nhập Excel
            </Button>
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
                <MenuItem value=""><em>Tất cả</em></MenuItem>
              </Select>
            </FormControl>
          </div>
        </div>

        <div className="table-responsive mt-3">
          {loading ? (
            <Box display="flex" justifyContent="center" my={4}>
              <CircularProgress />
            </Box>
          ) : currentCustomers.length === 0 ? (
            <Box textAlign="center" my={4}>
              <Typography variant="h6">Không tìm thấy khách hàng</Typography>
            </Box>
          ) : (
            <>
              <table className="table table-bordered v-align">
                <thead className="thead-dark">
                  <tr>
                    <th>Mã khách hàng</th>
                    <th>Tên khách hàng</th>
                    <th>Số điện thoại</th>
                    <th>Email</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {currentCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.id}</td>
                      <td>{customer.name}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.email || 'N/A'}</td>
                      <td>{customer.status || 'N/A'}</td>
                      <td>
                        <div className="actions d-flex align-items-center">
                          <Button
                            className="secondary"
                            color="secondary"
                            onClick={() => handleViewCustomer(customer)}
                          >
                            <FaEye />
                          </Button>
                          <Button
                            className="success"
                            color="success"
                            onClick={() => handleOpenModelUpdateCustomer(customer)}
                          >
                            <FaPencilAlt />
                          </Button>
                          {customer.status === 'ACTIVE' ? (
                            <Button
                              className="error"
                              color="error"
                              onClick={() => customer.id ? handleDelete(customer.id) : Swal.fire("Lỗi", "ID khách hàng không hợp lệ", "error")}
                            >
                              <MdDelete />
                            </Button>
                          ) : (
                            <Button
                              className="reset-button"
                              onClick={() => customer.id ? handleReset(customer.id) : Swal.fire("Lỗi", "ID khách hàng không hợp lệ", "error")}
                            >
                              <RxReset />
                            </Button>
                          )}
                        </div>
                      </td>
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
            Nhập khách hàng từ Excel (Tải mẫu: <a href="/sample-customer.xlsx">File Excel</a>)
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

export default Customers;