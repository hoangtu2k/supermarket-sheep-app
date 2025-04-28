import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { MyContext } from "../App";
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

import { supplierService } from "../services/supplierService";



const Supplier = () => {
    const context = useContext(MyContext);
    //const navigate = useNavigate(); // Khởi tạo useNavigate

    const [id, setId] = useState(null);
    const [code, setCode] = useState("");

    const [status, setStatus] = useState(1);

    const [showByStatus, setShowByStatus] = useState("");

    const [suppliers, setSuppliers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 5;

    // Lọc danh sách sản phẩm theo trạng thái, thương hiệu và danh mục
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


    return (
        <>
            <div className="right-content w-100">


                <div className="card shadow border-0 p-3 mt-4">

                    <div className="row">

                        <div className="col-md-3">
                            <h3 className="hd">Nhà cung cấp</h3>
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
                                                >
                                                    <FaPencilAlt />
                                                </Button>

                                                {supplier.status === 1 ? (
                                                    <Button
                                                        className="error"
                                                        color="error"
                                                    >
                                                        <MdDelete />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="reset-button"
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

        </>
    );
};

export default Supplier;