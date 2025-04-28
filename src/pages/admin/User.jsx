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

import { userService } from "../../services/userService";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%", // Chiều rộng phản hồi
    maxWidth: 800,
    maxHeight: "80vh", // Chiều cao tối đa
    overflowY: "auto", // Cho phép cuộn
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    borderRadius: "8px",
};

const User = () => {
    const context = useContext(MyContext);

    const [id, setId] = useState(null);
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showByStatus, setShowByStatus] = useState(1);

    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 5;

    // Lọc danh sách người dùng theo trạng thái, thương hiệu và danh mục
    const filteredUsers = users.filter((user) => {
        const matchesStatus =
            showByStatus === "" || user.status === Number(showByStatus);

        return matchesStatus;
    });

    // Phân trang
    const totalResults = filteredUsers.length;
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    const indexOfLastUser = currentPage * resultsPerPage;
    const indexOfFirstUser = indexOfLastUser - resultsPerPage;
    const currentUsers = filteredUsers.slice(
        indexOfFirstUser,
        indexOfLastUser
    );

    // Hàm xử lý thay đổi trang
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    // load data
    const fetchUser = async () => {
        try {
            const response = await userService.getAllUser();
            setUsers(response.data);
        } catch (error) {
            toast.error(
                "Error fetching fetchUsers: " + (error.response?.data?.message || error.message)
            );
        }
    };

    useEffect(() => {
        fetchUser();
        context.setisHideSidebarAndHeader(false);
        window.scrollTo(0, 0);
    }, []);

    const resetFormFields = () => {
        setCode("");
        setName("");
        setPhone("");
        setEmail("");
    };

    const handleSubmitAddUser = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            // Gửi yêu cầu thêm người dùng
            const userData = {
                code,
                name,
                phone,
                email,
            };
            await userService.createUser(userData);

            handleCloseModelAddAndUpdateUser();

            // Xác nhận trước khi thêm người dùng
            const result = await Swal.fire({
                title: 'Xác nhận',
                text: "Bạn có chắc chắn muốn thêm người dùng này không?",
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
            // Cập nhật danh sách người dùng và đặt lại form
            fetchUser();
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

    const handleSubmitUpdateUser = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        setIsSubmitting(true);
        try {
            // Gửi yêu cầu sửa người dùng
            const userData = {
                code,
                name,
                phone,
                email,
            };
            await userService.updateUser(id, userData);

            handleCloseModelAddAndUpdateUser();

            // Xác nhận trước khi sửa người dùng
            const result = await Swal.fire({
                title: 'Xác nhận',
                text: "Bạn có chắc chắn muốn sửa người dùng này không?",
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
            // Cập nhật danh sách người dùng và đặt lại form
            fetchUser();
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

    // Hàm xóa người dùng
    const handleDeleteUser = async (userId) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa người dùng này?',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await userService.deleteUser(userId);
                toast.success('Xóa người dùng thành công');
                fetchUser(); // Cập nhật lại danh sách người dùng
            } catch (error) {
                toast.error(`Lỗi khi xóa người dùng: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    // Hàm khôi phục người dùng
    const handleResetUser = async (userId) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn muốn khôi phục người dùng này?',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await userService.resetUser(userId);
                toast.success('Khôi phục người dùng thành công');
                fetchUser(); // Cập nhật lại danh sách người dùng
            } catch (error) {
                toast.error(`Lỗi khi khôi phục người dùng: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    // Hàm update theo id
    const handleOpenModelUpdateUser = (user) => {
        setId(user.id);
        setCode(user.code);
        setName(user.name);
        setPhone(user.phone);
        setEmail(user.email);
        setOpenModelUpdateUser(true);
    };

    // model add and update
    const [openModelAddUser, setModelAddUser] = useState(false);
    const [openModelUpdateUser, setOpenModelUpdateUser] = useState(false);
    const handleOpenModelAddUser = () => setModelAddUser(true);
    const handleCloseModelAddAndUpdateUser = () => {
        setModelAddUser(false);
        setOpenModelUpdateUser(false);
        setId(null); // Reset ID người dùng
        resetFormFields(); // Reset form fields when closing
    };

    return (
        <>
            <div className="right-content w-100">


                <div className="card shadow border-0 p-3 mt-4">

                    <div className="row">

                        <div className="col-md-3">
                            <h3 className="hd">Người dùng</h3>
                        </div>

                        <div className="col-md-3">
                            <Button
                                className="btn-blue btn-lg btn-big"
                                onClick={handleOpenModelAddUser} >Thêm người dùng</Button>
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
                                <th>Tên đăng nhập</th>
                                    <th>Tên người dùng</th>
                                    <th>Điện thoại</th>
                                    <th>Ngày sinh</th>
                                    <th>Email</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.username}</td>
                                        <td>{user.name}</td>
                                        <td>{user.phone}</td>
                                        <td>{user.dateOfBirth}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            {user.status === 1
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
                                                    onClick={() => handleOpenModelUpdateUser(user)}
                                                >
                                                    <FaPencilAlt />
                                                </Button>

                                                {user.status === 1 ? (
                                                    <Button
                                                        className="error"
                                                        color="error"
                                                        onClick={() => handleDeleteUser(user.id)}
                                                    >
                                                        <MdDelete />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="reset-button"
                                                        onClick={() => handleResetUser(user.id)}
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

            {/* Thêm người dùng */}
            <Modal
                keepMounted
                open={openModelAddUser}
                aria-labelledby="keep-mounted-modal-title"
                aria-describedby="keep-mounted-modal-description"
            >
                <Box sx={style}>
                    <Typography
                        id="keep-mounted-modal-title"
                        variant="h6"
                        component="span"
                    >
                        Thêm người dùng
                    </Typography>
                    <Typography
                        id="keep-mounted-modal-description"
                        component="span"
                        sx={{ mt: 2 }}
                    >
                        <form className="form" onSubmit={handleSubmitAddUser}>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="card p-2 mt-0">
                                        <div className="row">
                                            <div className="col-md-7">
                                                <div className="row ">
                                                    <div className="col">
                                                        <div className="form-group">
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <h6 className="mt-2">Mã người dùng</h6>
                                                                </div>
                                                                <div className="col-md-9">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Mã người dùng"
                                                                        value={code || ""}
                                                                        onChange={(e) => setCode(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <h6 className="mt-2">Tên người dùng</h6>
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
                                            {isSubmitting ? "Đang lưu..." : "Thêm người dùng mới"}
                                        </Button>
                                    </div>
                                    <div className="col mt-2">
                                        <Button
                                            className="btn-big btn-close"
                                            onClick={handleCloseModelAddAndUpdateUser}
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

            {/* Sửa người dùng */}
            <Modal
                keepMounted
                open={openModelUpdateUser}
                aria-labelledby="keep-mounted-modal-title"
                aria-describedby="keep-mounted-modal-description"
            >
                <Box sx={style}>
                    <Typography
                        id="keep-mounted-modal-title"
                        variant="h6"
                        component="span"
                    >
                        Sửa người dùng
                    </Typography>
                    <Typography
                        id="keep-mounted-modal-description"
                        component="span"
                        sx={{ mt: 2 }}
                    >
                        <form className="form" onSubmit={handleSubmitUpdateUser}>
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="card p-2 mt-0">
                                        <div className="row">
                                            <div className="col-md-7">
                                                <div className="row ">
                                                    <div className="col">
                                                        <div className="form-group">
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <h6 className="mt-2">Mã người dùng</h6>
                                                                </div>
                                                                <div className="col-md-9">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Mã người dùng"
                                                                        value={code || ""}
                                                                        onChange={(e) => setCode(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <h6 className="mt-2">Tên người dùng</h6>
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
                                            {isSubmitting ? "Đang lưu..." : "Sửa người dùng"}
                                        </Button>
                                    </div>
                                    <div className="col mt-2">
                                        <Button
                                            className="btn-big btn-close"
                                            onClick={handleCloseModelAddAndUpdateUser}
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

export default User;