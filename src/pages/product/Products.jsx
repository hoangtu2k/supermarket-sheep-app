
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
import { useNavigate } from 'react-router-dom'; // Import useNavigate

import { productService } from "../../services/productService";


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

const styleImport = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "40%", // Chiều rộng phản hồi
    maxWidth: 1000,
    maxHeight: "80vh", // Chiều cao tối đa
    overflowY: "auto", // Cho phép cuộn
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    borderRadius: "8px",
};

const Products = () => {
    const [id, setId] = useState(null);
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [weight, setWeight] = useState("");
    const [description, setDescription] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [status, setStatus] = useState(1);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const navigate = useNavigate(); // Khởi tạo useNavigate

    const handleChangeCategory = (event) => {
        setCategory(event.target.value);
    };
    const handleChangeBrand = (event) => {
        setBrand(event.target.value);
    };

    const context = useContext(MyContext);

    const [showByStatus, setShowByStatus] = useState("");
    const [showBysetCatBy, setCatBy] = useState("");
    const [showByBrandBy, setBrandBy] = useState("");

    const [products, setProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 5;

    // Lọc danh sách sản phẩm theo trạng thái, thương hiệu và danh mục
    const filteredProducts = products.filter((product) => {
        const matchesStatus =
            showByStatus === "" || product.status === Number(showByStatus);
        const matchesBrand =
            showByBrandBy === "" || product.brandId === Number(showByBrandBy);
        const matchesCategory =
            showBysetCatBy === "" || product.categoryId === Number(showBysetCatBy); // Giả sử product.categoryId chứa ID danh mục

        return matchesStatus && matchesBrand && matchesCategory; // Phải thỏa mãn cả ba điều kiện
    });

    // Phân trang
    const totalResults = filteredProducts.length;
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    const indexOfLastUser = currentPage * resultsPerPage;
    const indexOfFirstUser = indexOfLastUser - resultsPerPage;
    const currentUsers = filteredProducts.slice(
        indexOfFirstUser,
        indexOfLastUser
    );

    // Hàm xử lý thay đổi trang
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    // Hàm định dạng giá
    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN").format(price) + " VND";
    };

    // Hàm xóa sản phẩm
    const handleDeleteProduct = async (productId) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa sản phẩm này?',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await productService.deleteProduct(productId);
                toast.success('Xóa sản phẩm thành công');
                fetchProducts(); // Cập nhật lại danh sách sản phẩm
            } catch (error) {
                toast.error(`Lỗi khi xóa sản phẩm: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    // Hàm khôi phục sản phẩm
    const handleResetProduct = async (productId) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn muốn khôi phục sản phẩm này?',
            showCancelButton: true,
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy',
        });

        if (result.isConfirmed) {
            try {
                await productService.resetProduct(productId);
                toast.success('Khôi phục sản phẩm thành công');
                fetchProducts(); // Cập nhật lại danh sách sản phẩm
            } catch (error) {
                toast.error(`Lỗi khi khôi phục sản phẩm: ${error.response?.data?.message || error.message}`);
            }
        }
    };

    // Hàm chuyển đến trang update
    const handleOpenModelUpdateProduct = (product) => {
        navigate(`/admin/product-update/${product.id}`); // Chuyển hướng đến trang cập nhật
    };


    // load data
    const fetchProducts = async () => {
        try {
            const response = await productService.getAllProducts();
            setProducts(response.data);
        } catch (error) {
            toast.error(
                "Error fetching products: " + (error.response?.data?.message || error.message)
            );
        }
    };

    useEffect(() => {
        fetchProducts();
        context.setisHideSidebarAndHeader(false);
        window.scrollTo(0, 0);
    }, []);

    const [openModelImport, setModelImport] = useState(false);
    const handleOpenModelImport = () => setModelImport(true);


    return (
        <>
            <div className="right-content w-100">


                <div className="card shadow border-0 p-3 mt-4">

                    <div className="row">

                        <div className="col-md-3">
                            <h3 className="hd">Danh sách sản phẩm</h3>
                        </div>
                
                        <div className="col-md-3">
                            <Button
                                className="btn-blue btn-lg btn-big"
                                onClick={handleOpenModelImport} > Import</Button>
                        </div>

                    </div>

                    <div className="row cardFilters mt-3">
                        <div className="col-md-3">
                            <h4>Hiển thị sản phẩm theo trạng thái</h4>
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
                                    <MenuItem value={1}>Đang kinh doanh</MenuItem>
                                    <MenuItem value={0}>Ngừng kinh doanh</MenuItem>
                                </Select>
                            </FormControl>
                        </div>

                        <div className="col-md-3">
                            <h4>Hiển thị theo danh mục</h4>
                            <FormControl size="small" className="w-100">
                                <Select
                                    displayEmpty
                                    inputProps={{ "aria-label": "Without label" }}
                                    className="w-100"
                                >
                                    <MenuItem value="">
                                        <em>None</em>
                                    </MenuItem>
                                </Select>
                            </FormControl>
                        </div>

                        <div className="col-md-3">
                            <h4>Hiển thị theo Thương hiệu</h4>

                        </div>
                    </div>

                    <div className="table-responsive mt-3">
                        <table className="table table-bordered v-align">
                            <thead className="thead-dark">
                                <tr>
                                    <th>Mã sản phẩm</th>
                                    <th style={{ width: "300px" }}>Sản phẩm</th>
                                    <th>Giá bán</th>
                                    <th>Số lượng</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentUsers.map((product) => (
                                    <tr key={product.id}>
                                        <td>{product.code}</td>
                                        <td>
                                            <div className="d-flex align-items-center productBox">
                                                <div className="imgWrapper">
                                                    <div className="img card shadow m-0">
                                                        <img
                                                            src={product.imageUrl}
                                                            className="w-100"
                                                            alt={product.name}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="info pl-3">
                                                    <h6>{product.name}</h6>
                                                    <p>{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{formatPrice(product.price)}</td>
                                        <td>{product.quantity}</td>
                                        <td>
                                            {product.status === 1
                                                ? "Cho phép kinh doanh"
                                                : "Ngừng kinh doanh"}
                                        </td>
                                        <td>
                                            <div className="actions d-flex align-items-center">
                                                <Button className="secondary" color="secondary">
                                                    <FaEye />
                                                </Button>
                                                <Button
                                                    className="success"
                                                    color="success"
                                                    onClick={() => handleOpenModelUpdateProduct(product)}
                                                >
                                                    <FaPencilAlt />
                                                </Button>

                                                {product.status === 1 ? (
                                                    <Button className="error" color="error"
                                                        onClick={() => handleDeleteProduct(product.id)}>
                                                        <MdDelete />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="reset-button"
                                                        onClick={() => handleResetProduct(product.id)}
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

            {/* Import sản phẩm */}
            <Modal
                keepMounted
                open={openModelImport}
                aria-labelledby="keep-mounted-modal-title"
                aria-describedby="keep-mounted-modal-description"
            >
                <Box sx={styleImport}>
                    <Typography
                        id="keep-mounted-modal-title"
                        variant="h6"
                        component="span"
                    >
                        Nhập hàng hóa từ file dữ liệu (Tải về file mẫu: Excel file )
                    </Typography>
                    <Typography
                        id="keep-mounted-modal-description"
                        component="span"
                        sx={{ mt: 2 }}
                    >
                        <form className="form  mt-3">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="card p-2 mt-0">
                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="row">
                                                    <div className="col">


                                                        <div className="form-group">
                                                            <div className="row">
                                                                <div className="col-md-6">

                                                                </div>
                                                                <div className="col-md-6">
                                                                    <Button className="btn-blue mt-2">Chọn file dữ liệu</Button>
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
                                            {isSubmitting ? "Đang thực hiện..." : "Thực hiện"}
                                        </Button>
                                    </div>
                                    <div className="col mt-2">
                                        <Button
                                            className="btn-big btn-close"
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

export default Products;