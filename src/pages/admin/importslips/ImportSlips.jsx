
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { MdDelete } from "react-icons/md";
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { RxReset } from "react-icons/rx";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Pagination from "@mui/material/Pagination";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { MyContext } from "../../../App";

import { importSlipsService } from "../../../services/importedGoodsService";


const ImportSlips = () => {
   
    const navigate = useNavigate(); // Khởi tạo useNavigate
    const context = useContext(MyContext);

    const [showByStatus, setShowByStatus] = useState(1);

    const [importSlips, setImportSlips] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 5;

    // Lọc danh sách sản phẩm theo trạng thái, thương hiệu và danh mục
    const filteredImportSlips = importSlips.filter((importSlips) => {
        const matchesStatus =
            showByStatus === "" || importSlips.status === Number(showByStatus);      
        return matchesStatus; // Phải thỏa mãn cả ba điều kiện
    });

    // Phân trang
    const totalResults = filteredImportSlips.length;
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    const indexOfLastImportSlips = currentPage * resultsPerPage;
    const indexOfFirstImportSlips = indexOfLastImportSlips - resultsPerPage;
    const currentImportSlips = filteredImportSlips.slice(
        indexOfFirstImportSlips,
        indexOfLastImportSlips
    );

    // Hàm xử lý thay đổi trang
    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    // Hàm định dạng giá
    const formatPrice = (price) => {
        return new Intl.NumberFormat("vi-VN").format(price) + " VND";
    };

    // Hàm chuyển đến trang update
    const handleOpenModelUpdateProduct = (importslips) => {
        navigate(`/admin/importslips-update/${importslips.id}`); // Chuyển hướng đến trang cập nhật
    };


    // load data
    const fetchImportslips = async () => {
        try {
            const response = await importSlipsService.getAllImportSlips();
            setImportSlips(response.data);
        } catch (error) {
            toast.error(
                "Error fetching fetchImportslips: " + (error.response?.data?.message || error.message)
            );
        }
    };

    useEffect(() => {
        fetchImportslips();
        context.setisHideSidebarAndHeader(false);
        window.scrollTo(0, 0);
    }, []);


    return (
        <>
            <div className="right-content w-100">


                <div className="card shadow border-0 p-3 mt-4">

                    <div className="row">

                        <div className="col-md-3">
                            <h3 className="hd">Phiếu nhập hàng</h3>
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
                      
                    </div>

                    <div className="table-responsive mt-3">
                        <table className="table table-bordered v-align">
                            <thead className="thead-dark">
                                <tr>
                                    <th>Mã nhập hàng</th>
                                    <th>Thời gian</th>
                                    <th>Nhà cung cấp</th>
                                    <th>Người nhập</th>
                                    <th>Trạng thái</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentImportSlips.map((importSlips) => (
                                    <tr key={importSlips.id}>                                                               
                                        <td>{importSlips.entry_form_code}</td> 
                                        <td>
                                            {importSlips.entry_date
                                                ? new Date(importSlips.entry_date).toLocaleDateString('vi-VN')
                                                : ""}
                                        </td>                                  
                                        <td>{importSlips.supplier.name}</td>
                                        <td>{importSlips.importer}</td>

                                        <td>
                                            {importSlips.status === 1
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
                                                    onClick={() => handleOpenModelUpdateProduct(importSlips)}
                                                >
                                                    <FaPencilAlt />
                                                </Button>

                                                {importSlips.status === 1 ? (
                                                    <Button className="error" color="error"
                                                        onClick={() => handleDeleteProduct(importSlips.id)}>
                                                        <MdDelete />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="reset-button"
                                                        onClick={() => handleResetProduct(importSlips.id)}
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

export default ImportSlips;