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
import { roleService } from "../../services/roleService";

const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%", // Chiều rộng phản hồi
    maxWidth: 1100,
    maxHeight: "85vh", // Chiều cao tối đa
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
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [dateOfBirth, setDateOfBirth] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showByStatus, setShowByStatus] = useState(1);

    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 5;

    const [role, setRole] = useState("");
    const [roleList, setRoleList] = useState([]);

    const [errorMessage, setErrorMessage] = useState("");

    const validateUserForm = () => {
        if (!name.trim()) {
            setErrorMessage("Vui lòng nhập tên người dùng.");
            return false;
        }
        if (!username.trim()) {
            setErrorMessage("Vui lòng nhập tên đăng nhập.");
            return false;
        }
        if (password !== rePassword) {
            setErrorMessage("Mật khẩu nhập lại không khớp.");
            return false;
        }
        if (!role) {
            setErrorMessage("Vui lòng chọn vai trò.");
            return false;
        }
        setErrorMessage(""); // Không lỗi
        return true;
    };

    const handleChangeRole = (event) => {
        setRole(event.target.value);
    };

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

    // Load data role
    const fetchRole = async () => {
        try {
            const response = await roleService.getAllRole();
            const filteredRoles = response.data.filter(role => role.name?.toLowerCase() !== "admin"); // 👈 Lọc bỏ Admin
            setRoleList(filteredRoles);
        } catch (error) {
            toast.error(
                "Error fetching fetchRole: " + (error.response?.data?.message || error.message)
            );
        }
    };


    useEffect(() => {
        fetchRole();
        fetchUser();
        context.setisHideSidebarAndHeader(false);
        window.scrollTo(0, 0);
    }, []);

    const resetFormFields = () => {
        setName("");
        setUsername("");
        setPassword("");
        setRePassword("");
        setPhone("");
        setEmail("");
        setDateOfBirth("");
        setRole("");
    };

    // Hàm thêm người dùng
    const handleSubmitAddUser = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        // Reset lỗi trước
        setErrorMessage("");

        if (!validateUserForm()) {
            return; // Nếu validate fail thì dừng lại
        }

        // Nếu validate OK → tiếp tục submit
        setIsSubmitting(true);
        try {
            const userData = { name, username, password, rePassword, phone, email, dateOfBirth, roleId: role };
            await userService.createUser(userData);

            handleCloseModelAddAndUpdateUser();

            const result = await Swal.fire({
                title: 'Xác nhận',
                text: "Bạn có chắc chắn muốn thêm người dùng này không?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Có',
                cancelButtonText: 'Không'
            });

            if (!result.isConfirmed) {
                return;
            }

            Swal.fire({
                title: 'Thành công',
                text: "Thêm thành công!",
                icon: 'success',
                confirmButtonText: 'OK'
            });

            fetchUser();
            resetFormFields();
        } catch (error) {
            handleCloseModelAddAndUpdateUser();
            console.error(error);
            Swal.fire({
                title: 'Lỗi',
                text: error.response?.data?.message || "Đã có lỗi xảy ra.",
                icon: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Hàm sửa người dùng
    const handleSubmitUpdateUser = async (e) => {

        e.preventDefault();

        if (isSubmitting) return;

        // Reset lỗi trước
        setErrorMessage("");

        if (!validateUserForm()) {
            return; // Nếu validate fail thì dừng lại
        }

        setIsSubmitting(true);
        try {
            // Gửi yêu cầu sửa người dùng
            const userData = {
                name,
                username,
                password,
                rePassword,
                phone,
                email,
                dateOfBirth,
                roleId: role,
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
            handleCloseModelAddAndUpdateUser();
            console.error(error);
            Swal.fire({
                title: 'Lỗi',
                text: error.response?.data?.message || "Đã có lỗi xảy ra.",
                icon: 'error'
            });
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
        setName(user.name);
        setUsername(user.username);
        setPhone(user.phone);
        setEmail(user.email);
        if (user.dateOfBirth) {
            const dob = new Date(user.dateOfBirth);
            const formattedDate = dob.toISOString().split('T')[0]; // yyyy-MM-dd
            setDateOfBirth(formattedDate);
        } else {
            setDateOfBirth("");
        }

        setRole(user.role?.id || ""); // 👈 lấy role.id nếu có, còn không thì để rỗng
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
                                    <th>Vai trò</th>
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
                                        <td>
                                            {user.dateOfBirth
                                                ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN')
                                                : ""}
                                        </td>

                                        <td>{user.email}</td>
                                        <td>{user.role?.name || "Không có quyền"}</td>
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

                    <span className="error text-center">{errorMessage}</span>


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
                                                                    <h6 className="mt-2">Tên đăng nhập</h6>
                                                                </div>
                                                                <div className="col-md-9">
                                                                    <input
                                                                        type="text"
                                                                        value={username || ""}
                                                                        onChange={(e) => setUsername(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <h6 className="mt-2">Mật khẩu</h6>
                                                                </div>
                                                                <div className="col-md-9">
                                                                    <input
                                                                        type="password"
                                                                        value={password || ""}
                                                                        onChange={(e) => setPassword(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <h6 className="mt-2">Nhập lại mật khẩu</h6>
                                                                </div>
                                                                <div className="col-md-9">
                                                                    <input
                                                                        type="password"
                                                                        value={rePassword || ""}
                                                                        onChange={(e) => setRePassword(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>


                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-5">
                                                <div className="row">
                                                    <div className="col">

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

                                                        <div className="form-group">
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <h6 className="mt-2">Ngày sinh</h6>
                                                                </div>
                                                                <div className="col-md-9">
                                                                    <input
                                                                        type="date"
                                                                        value={dateOfBirth || ""}
                                                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>


                                                        <h6 className="form-select-title">Vai trò</h6>

                                                        <Select
                                                            value={role || ""}
                                                            onChange={handleChangeRole}
                                                            displayEmpty
                                                            inputProps={{ "aria-label": "Without label" }}
                                                            className="w-100"
                                                        >
                                                            <MenuItem value="">
                                                                <em>None</em>
                                                            </MenuItem>
                                                            {roleList.map((rol) => (
                                                                <MenuItem key={rol.id} value={rol.id}>
                                                                    {rol.name}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>

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

                    <span className="error text-center">{errorMessage}</span>

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
                                                                    <h6 className="mt-2">Tên đăng nhập</h6>
                                                                </div>
                                                                <div className="col-md-9">
                                                                    <input
                                                                        type="text"
                                                                        value={username || ""}
                                                                        onChange={(e) => setUsername(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <h6 className="mt-2">Mật khẩu</h6>
                                                                </div>
                                                                <div className="col-md-9">
                                                                    <input
                                                                        type="password"
                                                                        value={password || ""}
                                                                        onChange={(e) => setPassword(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="form-group">
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <h6 className="mt-2">Nhập lại mật khẩu</h6>
                                                                </div>
                                                                <div className="col-md-9">
                                                                    <input
                                                                        type="password"
                                                                        value={rePassword || ""}
                                                                        onChange={(e) => setRePassword(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>


                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-5">
                                                <div className="row">
                                                    <div className="col">

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

                                                        <div className="form-group">
                                                            <div className="row">
                                                                <div className="col-md-3">
                                                                    <h6 className="mt-2">Ngày sinh</h6>
                                                                </div>
                                                                <div className="col-md-9">
                                                                    <input
                                                                        type="date"
                                                                        value={dateOfBirth || ""}
                                                                        onChange={(e) => setDateOfBirth(e.target.value)}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>


                                                        <h6 className="form-select-title">Vai trò</h6>

                                                        <Select
                                                            value={role || ""}
                                                            onChange={handleChangeRole}
                                                            displayEmpty
                                                            inputProps={{ "aria-label": "Without label" }}
                                                            className="w-100"
                                                        >
                                                            <MenuItem value="">
                                                                <em>None</em>
                                                            </MenuItem>
                                                            {roleList.map((rol) => (
                                                                <MenuItem key={rol.id} value={rol.id}>
                                                                    {rol.name}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>

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