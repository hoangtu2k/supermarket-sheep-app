import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { MyContext } from "../../App";
import { MdDelete } from "react-icons/md";
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { RxReset } from "react-icons/rx";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Pagination from "@mui/material/Pagination";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import Swal from "sweetalert2";

import { supplierService } from "../../services/supplierService";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%", // Chiều rộng phản hồi
    maxWidth: 1000,
    maxHeight: "80vh", // Chiều cao tối đa
    overflowY: "auto", // Cho phép cuộn
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    borderRadius: "8px",
};

const Supplier = () => {
    const context = useContext(MyContext);

    const [id, setId] = useState(null);
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showByStatus, setShowByStatus] = useState(1);

    const [suppliers, setSuppliers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 5;

    // Lọc danh sách nhà cung cấp theo trạng thái, thương hiệu và danh mục
    const filteredSuppliers = suppliers.filter((supplier) => {
        const matchesStatus =
            showByStatus === "" || supplier.status === Number(showByStatus);

        return matchesStatus;
    });

    // Phân trang
    const totalResults = filteredSuppliers.length;
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    const indexOfLastSupplier = currentPage * resultsPerPage;
    const indexOfFirstSupplier = indexOfLastSupplier - resultsPerPage;
    const currentSuppliers = filteredSuppliers.slice(
        indexOfFirstSupplier,
        indexOfLastSupplier
    );

    // Hàm xử lý thay đổi trang
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    // load data
    const fetchSupplier = async () => {
        try {
            const response = await supplierService.getAllSupplier();
            setSuppliers(response.data);
        } catch (error) {
            toast.error(
                "Error fetching fetchSuppliers: " + (error.response?.data?.message || error.message)
            );
        }
    };

    useEffect(() => {
        fetchSupplier();
        context.setisHideSidebarAndHeader(false);
        window.scrollTo(0, 0);
    }, []);

    const resetFormFields = () => {
        setCode("");
        setName("");
        setPhone("");
        setEmail("");
    };

    const handleSubmitAddSupplier = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            // Gửi yêu cầu thêm nhà cung cấp
            const supplierData = {
                code,
                name,
                phone,
                email,
            };
            await supplierService.createSupplier(supplierData);

            handleCloseModelAddAndUpdateSupplier();

            // Xác nhận trước khi thêm nhà cung cấp
            const result = await Swal.fire({
                title: 'Xác nhận',
                text: "Bạn có chắc chắn muốn thêm nhà cung cấp này không?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Có',
                cancelButtonText: 'Không'
            });

            // Nếu người dùng không xác nhận, dừng lại
            if (!result.isConfirmed) {
                return;
            }

            // Show success message
            Swal.fire({
                title: 'Thành công',
                text: "Thêm thành công!",
                icon: 'success',
                confirmButtonText: 'OK'
            });
            // Cập nhật danh sách nhà cung cấp và đặt lại form
            fetchSupplier();
            resetFormFields();
        } catch (error) {
            if (error.response) {
                console.error("Server error:", error.response.data);
                Swal.fire({
                    title: 'Lỗi',
                    text: error.response.data.message || "Đã có lỗi xảy ra.",
                    icon: 'error'
                });
            } else if (error.request) {
                console.error("No response received:", error.request);
                Swal.fire({
                    title: 'Lỗi',
                    text: "Không nhận được phản hồi từ máy chủ. Vui lòng thử lại.",
                    icon: 'error'
                });
            } else {
                console.error("Error:", error.message);
                Swal.fire({
                    title: 'Lỗi',
                    text: error.message,
                    icon: 'error'
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitUpdateSupplier = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            // Gửi yêu cầu sửa nhà cung cấp
            const supplierData = {
                code,
                name,
                phone,
                email,
            };
            await supplierService.updateSupplier(id, supplierData);

            handleCloseModelAddAndUpdateSupplier();

            // Xác nhận trước khi sửa nhà cung cấp
            const result = await Swal.fire({
                title: 'Xác nhận',
                text: "Bạn có chắc chắn muốn sửa nhà cung cấp này không?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Có',
                cancelButtonText: 'Không'
            });

            // Nếu người dùng không xác nhận, dừng lại
            if (!result.isConfirmed) {
                return;
            }

            // Show success message
            Swal.fire({
                title: 'Thành công',
                text: "Sửa thành công!",
                icon: 'success',
                confirmButtonText: 'OK'
            });
            // Cập nhật danh sách nhà cung cấp và đặt lại form
            fetchSupplier();
            resetFormFields();
        } catch (error) {
            if (error.response) {
                console.error("Server error:", error.response.data);
                Swal.fire({
                    title: 'Lỗi',
                    text: error.response.data.message || "Đã có lỗi xảy ra.",
                    icon: 'error'
                });
            } else if (error.request) {
                console.error("No response received:", error.request);
                Swal.fire({
                    title: 'Lỗi',
                    text: "Không nhận được phản hồi từ máy chủ. Vui lòng thử lại.",
                    icon: 'error'
                });
            } else {
                console.error("Error:", error.message);
                Swal.fire({
                    title: 'Lỗi',
                    text: error.message,
                    icon: 'error'
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hàm xóa nhà cung cấp
    const handleDeleteSupplier = async (supplierId) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa nhà cung cấp này?',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await supplierService.deleteSupplier(supplierId);
                toast.success('Xóa nhà cung cấp thành công');
                fetchSupplier(); // Cập nhật lại danh sách nhà cung cấp
            } catch (error) {
                toast.error(`Lỗi khi xóa nhà cung cấp: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    // Hàm khôi phục nhà cung cấp
    const handleResetSupplier = async (supplierId) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn muốn khôi phục nhà cung cấp này?',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await supplierService.resetSupplier(supplierId);
                toast.success('Khôi phục nhà cung cấp thành công');
                fetchSupplier(); // Cập nhật lại danh sách nhà cung cấp
            } catch (error) {
                toast.error(`Lỗi khi khôi phục nhà cung cấp: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    // Hàm update theo id
    const handleOpenModelUpdateSupplier = (supplier) => {
        setId(supplier.id);
        setCode(supplier.code);
        setName(supplier.name);
        setPhone(supplier.phone);
        setEmail(supplier.email);
        setOpenModelUpdateSupplier(true);
    };

    // model add and update
    const [openModelAddSupplier, setModelAddSupplier] = useState(false);
    const [openModelUpdateSupplier, setOpenModelUpdateSupplier] = useState(false);
    const handleOpenModelAddSupplier = () => setModelAddSupplier(true);
    const handleCloseModelAddAndUpdateSupplier = () => {
        setModelAddSupplier(false);
        setOpenModelUpdateSupplier(false);
        setId(null); // Reset ID nhà cung cấp
        resetFormFields(); // Reset form fields when closing
    };

    return (
        <>
            <div className="right-content w-100">


                <div className="card shadow border-0 p-3 mt-4">

                    <div className="row">

                        <div className="col-md-3">
                            <h3 className="hd">Nhà cung cấp</h3>
                        </div>

                        <div className="col-md-3">
                            <Button
                                className="btn-blue btn-lg btn-big"
                                onClick={handleOpenModelAddSupplier} >Thêm nhà cung cấp</Button>
                        </div>

                    </div>

                    <div className="row cardFilters mt-3">
                        <div className="col-md-3">
                            <h4>Trạng thái</h4>
                            <FormControl size="small" className="w-100">
                                <Select
                                    value={showByStatus}
                                    onChange={(e) => {
                                        setShowByStatus(e.target.value);
                                        setCurrentPage(1); // Reset về trang đầu khi thay đổi trạng thái
                                    }}
                                    displayEmpty
                                    inputProps={{ "aria-label": "Without label" }}
                                    className="w-100"
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                    <MenuItem value={1}>Đang hoạt động</MenuItem>
                                    <MenuItem value={0}>Ngừng hoạt động</MenuItem>
                                </Select>
                            </FormControl>
                        </div>

                    </div>

                    <div className="table-responsive mt-3">
                        <table className="table table-bordered v-align">
                            <thead className="thead-dark">
                                <tr>
                                    <th>Mã nhà cung cấp</th>
                                    <th>Tên nhà cung cấp</th>
                                    <th>Điện thoại</th>
                                    <th>Email</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentSuppliers.map((supplier) => (
                                    <tr key={supplier.id}>
                                        <td>{supplier.code}</td>
                                        <td>{supplier.name}</td>
                                        <td>{supplier.phone}</td>
                                        <td>{supplier.email}</td>
                                        <td>
                                            {supplier.status === 1
                                                ? "Đang hoạt động"
                                                : "Ngừng hoạt động"}
                                        </td>
                                        <td>
                                            <div className="actions d-flex align-items-center">
                                                <Button
                                                    className="secondary"
                                                    color="secondary"
                                                >
                                                    <FaEye />
                                                </Button>
                                                <Button
                                                    className="success"
                                                    color="success"
                                                    onClick={() => handleOpenModelUpdateSupplier(supplier)}
                                                >
                                                    <FaPencilAlt />
                                                </Button>

                                                {supplier.status === 1 ? (
                                                    <Button
                                                        className="error"
                                                        color="error"
                                                        onClick={() => handleDeleteSupplier(supplier.id)}
                                                    >
                                                        <MdDelete />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="reset-button"
                                                        onClick={() => handleResetSupplier(supplier.id)}
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
                    </div>
                </div>
            </div>

            {/* Thêm nhà cung cấp */}
            <Modal
                keepMounted
                open={openModelAddSupplier}
                aria-labelledby="keep-mounted-modal-title"
                aria-describedby="keep-mounted-modal-description"
            >
                <Box sx={style}>
                    <Typography
                        id="keep-mounted-modal-title"
                        variant="h6"
                        component="span"
                    >
                        Thêm nhà cung cấp
                    </Typography>
                    <Typography
                        id="keep-mounted-modal-description"
                        component="span"
                        sx={{ mt: 2 }}
                    >
                        <form className="form" onSubmit={handleSubmitAddSupplier}>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="card p-2 mt-0">
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="row ">
                                                    <div className="col">
                                                        <div className="form-group">
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <h6 className="mt-2">Mã nhà cung cấp</h6>
                                                                </div>
                                                                <div className="col-md-9">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Mã nhà cung cấp"
                                                                        value={code || ""}
                                                                        onChange={(e) => setCode(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <h6 className="mt-2">Tên nhà cung cấp</h6>
                                                                </div>
                                                                <div className="col-md-9">
                                                                    <input
                                                                        type="text"
                                                                        value={name || ""}
                                                                        onChange={(e) => setName(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <h6 className="mt-2">Số điện thoại</h6>
                                                                </div>
                                                                <div className="col-md-9">
                                                                    <input
                                                                        type="text"
                                                                        value={phone || ""}
                                                                        onChange={(e) => setPhone(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <h6 className="mt-2">Email</h6>
                                                                </div>
                                                                <div className="col-md-9">
                                                                    <input
                                                                        type="text"
                                                                        value={email || ""}
                                                                        onChange={(e) => setEmail(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
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
                                            {isSubmitting ? "Đang lưu..." : "Thêm nhà cung cấp mới"}
                                        </Button>
                                    </div>
                                    <div className="col mt-2">
                                        <Button
                                            className="btn-big btn-close"
                                            onClick={handleCloseModelAddAndUpdateSupplier}
                                        >
                                            Bỏ qua
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Typography>
                </Box>
            </Modal>

            {/* Sửa nhà cung cấp */}
            <Modal
                keepMounted
                open={openModelUpdateSupplier}
                aria-labelledby="keep-mounted-modal-title"
                aria-describedby="keep-mounted-modal-description"
            >
                <Box sx={style}>
                    <Typography
                        id="keep-mounted-modal-title"
                        variant="h6"
                        component="span"
                    >
                        Sửa nhà cung cấp
                    </Typography>
                    <Typography
                        id="keep-mounted-modal-description"
                        component="span"
                        sx={{ mt: 2 }}
                    >
                        <form className="form" onSubmit={handleSubmitUpdateSupplier}>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="card p-2 mt-0">
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="row ">
                                                    <div className="col">
                                                        <div className="form-group">
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <h6 className="mt-2">Mã nhà cung cấp</h6>
                                                                </div>
                                                                <div className="col-md-9">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Mã nhà cung cấp"
                                                                        value={code || ""}
                                                                        onChange={(e) => setCode(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <h6 className="mt-2">Tên nhà cung cấp</h6>
                                                                </div>
                                                                <div className="col-md-9">
                                                                    <input
                                                                        type="text"
                                                                        value={name || ""}
                                                                        onChange={(e) => setName(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <h6 className="mt-2">Số điện thoại</h6>
                                                                </div>
                                                                <div className="col-md-9">
                                                                    <input
                                                                        type="text"
                                                                        value={phone || ""}
                                                                        onChange={(e) => setPhone(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <h6 className="mt-2">Email</h6>
                                                                </div>
                                                                <div className="col-md-9">
                                                                    <input
                                                                        type="text"
                                                                        value={email || ""}
                                                                        onChange={(e) => setEmail(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>
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
                                            {isSubmitting ? "Đang lưu..." : "Sửa nhà cung cấp"}
                                        </Button>
                                    </div>
                                    <div className="col mt-2">
                                        <Button
                                            className="btn-big btn-close"
                                            onClick={handleCloseModelAddAndUpdateSupplier}
                                        >
                                            Bỏ qua
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </Typography>
                </Box>
            </Modal>

        </>
    );
};

export default Supplier;