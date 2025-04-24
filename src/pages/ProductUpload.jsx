import React, { useState } from "react";

import ExpandMore from "@mui/icons-material/ExpandMore";
import Breadcrumb from "@mui/material/Breadcrumbs";
import { emphasize, styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";

import Button from "@mui/material/Button";
import { MenuItem, Select } from "@mui/material";

import { LazyLoadImage } from 'react-lazy-load-image-component';

import { FaCloudUploadAlt, FaRegImages } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &focus": {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
});

const ProductUpload = () => {


    const [categoryVal, setcategoryVal] = useState('');
    const [brandVal, setbrandVal] = useState('');

    const handleChangeCategory = (event) => {
            setcategoryVal(event.target.value);
    };
    const handleChangeBrand = (event) => {
        setbrandVal(event.target.value);
};

  return (
    <>
      <div className="right-content w-100">
      
        <div className="card shadow border-0 w-100 flex-row p-4 res-col">
          <h5 className="mb-0">Chi tiết sản phẩm</h5>
          <Breadcrumb aria-label="breadcrumb" className="ml-auto breadcrumbs_">
            <StyledBreadcrumb
              component="a"
              href="/"
              label="Tổng quan"
              icon={<HomeIcon fontSize="small" />}
            />

            <StyledBreadcrumb
              component="a"
              href="/products"
              label="Danh sách sản phẩm"
              deleteIcon={<ExpandMore />}
            />

            <StyledBreadcrumb
              label="Tải lên sản phẩm"
              deleteIcon={<ExpandMore />}
            />
          </Breadcrumb>
        </div>

        <form className="form">

                <div className="row">
                    <div className="col-md-7">
                        <div className="card p-4 mt-0">
                            <h5 class="mb-4">Thông tin cơ bản</h5>
                            
                            <div className="form-group">
                                    <h6>Tên</h6>
                                    <input type="text" />
                            </div>
                            <div className="form-group">
                                    <h6>Mô tả</h6>
                                    <textarea rows={5} cols={10} />
                            </div>

                            <div className="row">
                                    <div className="col">

                                            <div className="form-group">
                                                    <h6>Giá bán</h6>
                                                    <input type="text" />
                                            </div>
                                        
                                    </div>    
                                    <div className="col">

                                            <div className="form-group">
                                                    <h6>Giá bán</h6>
                                                    <input type="text" />
                                            </div>
                                        
                                    </div>                              
                            
                            </div>

                            <div className="row">
                                    <div className="col">
                                        <h6>Danh mục</h6>
                                        <Select
                                            value={categoryVal}
                                            onChange={handleChangeCategory}
                                            displayEmpty
                                            inputProps={{ 'aria-label': 'Without label' }}
                                            className="w-100"
                                        >
                                            <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem>
                                            <MenuItem value={'men'}>Man</MenuItem>
                                            <MenuItem value={'woman'}>Woman</MenuItem>

                                        </Select>
                                    </div>
                                    <div className="col">
                                        <h6>Thương hiệu</h6>
                                        <Select
                                            value={brandVal}
                                            onChange={handleChangeBrand}
                                            displayEmpty
                                            inputProps={{ 'aria-label': 'Without label' }}
                                            className="w-100"
                                        >
                                            <MenuItem value="">
                                                <em>None</em>
                                            </MenuItem>
                                            <MenuItem value={10}>Apple</MenuItem>
                                            <MenuItem value={20}>Samsung</MenuItem>

                                        </Select>
                                    </div>

                            </div>
                           
                        </div>
                    </div>
                    <div className="col-md-5">
                        <div className="card p-4 mt-0">
                            
                        </div>
                    </div>

                </div>

                <div className="card p-4 mt-0">
                    <div className="imagesUploadSec">
                            <h5 class="mb-4">Media And Published</h5>
                            <div className="imgUploadBox d-flex align-items-center">

                                    <div className="uploadBox">
                                        <span className="remove"><IoCloseSharp/> </span>
                                        <div className="box">
                                            <LazyLoadImage 
                                                    alt={'image'}
                                                    effect='blur'
                                                    className='w-100'
                                                    src={'https://acc957.com/Img/DichVu.png'}
                                            />
                                        </div>
                                    </div>

                                    <div className="uploadBox">
                                        <input type="file" multiple="" name="images" />
                                        <div className="info">
                                        <FaRegImages />
                                        <h5>image upload</h5>
                                        </div>
                                    </div>

                            </div>

                            
                    </div>

                    <br/>

                    <Button className="btn-blue btn-lg btn-big"><FaCloudUploadAlt/>&nbsp; PUBLISH AND VIEW</Button>
                   
                </div>

        </form>






      </div>
    </>
  );
};

export default ProductUpload;
