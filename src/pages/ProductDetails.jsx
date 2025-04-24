import React from 'react';

import ExpandMore from "@mui/icons-material/ExpandMore";
import Breadcrumb  from "@mui/material/Breadcrumbs";
import { emphasize, styled } from "@mui/material/styles";
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import Slider from 'react-slick';
import { MdBrandingWatermark } from 'react-icons/md';
import { BiSolidCategoryAlt } from 'react-icons/bi';
import  Rating  from '@mui/material/Rating';

import  Button  from '@mui/material/Button';
import { FaReply } from 'react-icons/fa';



const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    const backgroundColor = theme.palette.mode === 'light'
        ? theme.palette.grey[100]
        : theme.palette.grey[800];
    return {
        backgroundColor,
        height: theme.spacing(3),
        color: theme.palette.text.primary,
        fontWeight: theme.typography.fontWeightRegular,
        '&:hover, &focus': {
            backgroundColor: emphasize(backgroundColor, 0.06),
        },
        '&:active': {
            boxShadow: theme.shadows[1],
            backgroundColor: emphasize(backgroundColor, 0.12),
        },
    };
} );

const ProductDetails = () => {

    var productSliderOptions = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false
    };

    var productSliderSmlOptions = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: false
    };

    return(
        <>
                <div className="right-content w-100">
                    <div className="card shadow border-0 w-100 flex-row p-4 res-col">
                        <h5 className="mb-0">Chi tiết sản phẩm</h5>
                        <Breadcrumb aria-label="breadcrumb" className="ml-auto breadcrumbs_">

                            <StyledBreadcrumb component = "a"
                                href="/"
                                label="Tổng quan"
                                icon={<HomeIcon fontSize ="small" />}
                             />

                            <StyledBreadcrumb component="a"
                            href="/products"
                            label="Danh sách sản phẩm"
                            deleteIcon={<ExpandMore />}
                            />

                            <StyledBreadcrumb
                                label="Chi tiết sản phẩm"
                                deleteIcon={<ExpandMore />}
                             />

                        </Breadcrumb>

                    </div>


                    <div className="card productDetailsSEction">
                            <div className="row">

                                <div className="col-md-5">

                                <div className='sliderWrapper  pt-3 pb-3 pl-4 pr-4'>

                                <h6 className='mb-4'>Product Gllery</h6>

                                <Slider {...productSliderOptions} className='sliderBig mb-2'>
                                        <div className='item'>
                                            <img src="https://acc957.com/Img/TaiKhoan.png" className='w-100' alt=''/>
                                        </div>
                                    </Slider>
                                    <Slider {...productSliderSmlOptions} className='sliderSml'>
                                        <div className='item'>
                                            <img src="https://acc957.com/Img/TaiKhoan.png" className='w-100' alt=''/>
                                        </div>
                                        <div className='item'>
                                            <img src="https://acc957.com/Img/TaiKhoan.png" className='w-100' alt=''/>
                                        </div>
                                        <div className='item'>
                                            <img src="https://mironcoder-hotash.netlify.app/images/product/01.webp" className='w-100' alt=''/>
                                        </div>
                                        <div className='item'>
                                            <img src="https://acc957.com/Img/TaiKhoan.png" className='w-100' alt=''/>
                                        </div>
                                        <div className='item'>
                                            <img src="https://mironcoder-hotash.netlify.app/images/product/01.webp" className='w-100' alt=''/>
                                        </div>
                                        <div className='item'>
                                            <img src="https://acc957.com/Img/TaiKhoan.png" className='w-100' alt=''/>
                                        </div>
                                    </Slider>
                                </div>
                            
                                </div>

                                <div className="col-md-7">

                                        <div className='sliderWrapper  pt-3 pb-3 pl-4 pr-4'>
                                                <h6 className='mb-4'>Product Details</h6>

                                                <h4>Formal suits for men wedding slim fit 3 piece dress business party jacket</h4>

                                                <div className='productInfo mt-4'>
                                                        <div className='row mb-2'>
                                                            <div className="col-sm-3 d-flex align-items-center">
                                                                        <span className='icon'><MdBrandingWatermark/></span>
                                                                        <span className='name'>Brand</span>
                                                            </div>
                                                            <div className="col-sm-9">
                                                                     <span>Ecstasy</span>
                                                            </div>
                                                        </div>
                                                        <div className='row'>
                                                            <div className="col-sm-3 d-flex align-items-center">
                                                                        <span className='icon'><BiSolidCategoryAlt/></span>
                                                                        <span className='name'>Category</span>
                                                            </div>
                                                            <div className="col-sm-9">
                                                                    <span>Man's</span>
                                                            </div>
                                                        </div>
                                                        <div className='row'>
                                                            <div className="col-sm-3 d-flex align-items-center">
                                                                        <span className='icon'><MdBrandingWatermark/></span>
                                                                        <span className='name'>Tags</span>
                                                            </div>
                                                            <div className="col-sm-9">
                                                                     <span>
                                                                        <div className='row'>
                                                                            <ul className='list list-inline tags sml'>
                                                                                <li className='list-inline-item'><span>SUITE</span></li>
                                                                                <li className='list-inline-item'><span>PARTY</span></li>
                                                                                <li className='list-inline-item'><span>DRESS</span></li>
                                                                                <li className='list-inline-item'><span>SMART</span></li>
                                                                                <li className='list-inline-item'><span>MAN</span></li>
                                                                                <li className='list-inline-item'><span>STYLES</span></li>
                                                                            </ul>
                                                                        </div>
                                                                    </span>
                                                            </div>
                                                        </div>
                                                        <div className='row'>
                                                            <div className="col-sm-3 d-flex align-items-center">
                                                                        <span className='icon'><MdBrandingWatermark/></span>
                                                                        <span className='name'>Color</span>
                                                            </div>
                                                            <div className="col-sm-9">
                                                                     <span>
                                                                        <div className='row'>
                                                                            <ul className='list list-inline tags sml'>
                                                                                <li className='list-inline-item'><span>RED</span></li>
                                                                                <li className='list-inline-item'><span>BLUE</span></li>
                                                                                <li className='list-inline-item'><span>GREEN</span></li>
                                                                                <li className='list-inline-item'><span>YELLOW</span></li>
                                                                                <li className='list-inline-item'><span>PURPLE</span></li>
                                                                            </ul>
                                                                        </div>
                                                                    </span>
                                                            </div>
                                                        </div>
                                                        <div className='row'>
                                                            <div className="col-sm-3 d-flex align-items-center">
                                                                        <span className='icon'><MdBrandingWatermark/></span>
                                                                        <span className='name'>Size</span>
                                                            </div>
                                                            <div className="col-sm-9">
                                                                     <span>
                                                                        <div className='row'>
                                                                            <ul className='list list-inline tags sml'>
                                                                                <li className='list-inline-item'><span>S</span></li>
                                                                                <li className='list-inline-item'><span>M</span></li>
                                                                                <li className='list-inline-item'><span>L</span></li>
                                                                                <li className='list-inline-item'><span>XL</span></li>
                                                                                <li className='list-inline-item'><span>XXL</span></li>
                                                                            </ul>
                                                                        </div>
                                                                    </span>
                                                            </div>
                                                        </div>
                                                        <div className='row'>
                                                            <div className="col-sm-3 d-flex align-items-center">
                                                                        <span className='icon'><MdBrandingWatermark/></span>
                                                                        <span className='name'>Price</span>
                                                            </div>
                                                            <div className="col-sm-9">
                                                                     <span>(68) Piece</span>
                                                            </div>
                                                        </div>
                                                        <div className='row'>
                                                            <div className="col-sm-3 d-flex align-items-center">
                                                                        <span className='icon'><MdBrandingWatermark/></span>
                                                                        <span className='name'>Review</span>
                                                            </div>
                                                            <div className="col-sm-9">
                                                                     <span>(03) Review</span>
                                                            </div>
                                                        </div>
                                                        <div className='row'>
                                                            <div className="col-sm-3 d-flex align-items-center">
                                                                        <span className='icon'><MdBrandingWatermark/></span>
                                                                        <span className='name'>Published</span>
                                                            </div>
                                                            <div className="col-sm-9">
                                                                     <span>02 Feb 2020</span>
                                                            </div>
                                                        </div> 
                                                </div>

                                        </div>
                                
                                </div>

                            </div>

                            <div className='p-4'>
                                    <h6 className="mt-4 mb-3">Mô tả sản phẩm</h6>
                                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae reprehenderit repellendus 
                                    expedita esse cupiditate quos doloremque rerum, corrupti ab illum est nihil, voluptate ex dignissimos! 
                                    Sit voluptatem delectus nam, molestiae, repellendus ab sint quo aliquam debitis amet natus doloremque laudantium? 
                                    Repudiandae, consequuntur, officiis quidem quo deleniti, autem non laudantium sequi error molestiae ducimus 
                                    accusamus facere velit consectetur vero dolore natus nihil temporibus aspernatur quia consequatur? 
                                    Consequuntur voluptate deserunt repellat tenetur debitis molestiae doloribus dicta. In rem illum dolorem atque ratione 
                                    voluptates asperiores maxime doloremque laudantium magni neque ad quae quos quidem, quaerat rerum ducimus blanditiis reiciendis
                                    </p>     

                                    <br/>    

                                    <h6 className="mt-4 mb-3">Phân tích xếp hạng</h6>

                                    <div className='ratingSection'>
                                        <div className='ratingrow d-flex align-items-center'>
                                            <span className='col1'>
                                                 5 Star 
                                            </span>
                                            <span className='col2'>
                                                    <div className='progress'>
                                                        <div className='progress-bar' style={{width: '80%'}}></div>
                                                    </div>
                                            </span>
                                            <span className='col3'>
                                                (22)
                                            </span>
                                        </div>
                                        <div className='ratingrow d-flex align-items-center'>
                                            <span className='col1'>
                                                 4 Star 
                                            </span>
                                            <span className='col2'>
                                                    <div className='progress'>
                                                        <div className='progress-bar' style={{width: '70%'}}></div>
                                                    </div>
                                            </span>
                                            <span className='col3'>
                                                (22)
                                            </span>
                                        </div>
                                        <div className='ratingrow d-flex align-items-center'>
                                            <span className='col1'>
                                                 3 Star 
                                            </span>
                                            <span className='col2'>
                                                    <div className='progress'>
                                                        <div className='progress-bar' style={{width: '60%'}}></div>
                                                    </div>
                                            </span>
                                            <span className='col3'>
                                                (2)
                                            </span>
                                        </div>
                                        <div className='ratingrow d-flex align-items-center'>
                                            <span className='col1'>
                                                 2 Star 
                                            </span>
                                            <span className='col2'>
                                                    <div className='progress'>
                                                        <div className='progress-bar' style={{width: '50%'}}></div>
                                                    </div>
                                            </span>
                                            <span className='col3'>
                                                (2)
                                            </span>
                                        </div>
                                        <div className='ratingrow d-flex align-items-center'>
                                            <span className='col1'>
                                                 1 Star 
                                            </span>
                                            <span className='col2'>
                                                    <div className='progress'>
                                                        <div className='progress-bar' style={{width: '40%'}}></div>
                                                    </div>
                                            </span>
                                            <span className='col3'>
                                                (2)
                                            </span>
                                        </div>
                                    </div>

                                    <br/> 

                                    <h6 className="mt-4 mb-4">Đánh giá của khách hàng</h6>

                                    <div className='reviewsSecrion'>
                                          <div className='reviewsSecrion'>
                                            <div className='reviewsRow'>
                                                    <div className='row'>
                                                        <div className='col-sm-7 d-flex'>
                                                            <div className='d-flex flex-column'>
                                                                <div className='userInfo d-flex align-items-center mb-3'>
                                                                    <div className="userImg lg">
                                                                        <span className="rounded-circle">
                                                                        <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" alt=''/>
                                                                        </span>
                                                                    </div>
                                                                    <div className="info pl-3">
                                                                        <h6>Miron Mahmud</h6>
                                                                        <span>25 minutes ago!</span>
                                                                    </div>
                                                                </div>

                                                            <Rating name="read-only" value={3} precision={2} readOnly />


                                                            </div>
                                                        </div>
                                                        <div className="col-md-5 d-flex align-items-center">                         
                                                            <div className='ml-auto'>
                                                                <Button className="btn-blue btn-big btn-lg ml-auto"><FaReply/> &nbsp; Reply</Button>         
                                                            </div>
                                                        </div>
                                                        <p className="mt-3">
                                                                Lorem ipsum dolor sit amet consectetur adipisicing elit. 
                                                                Omnis quo nostrum dolore fugiat ducimus labore debitis unde autem recusandae? 
                                                                Eius harum tempora quis minima, adipisci natus quod magni omnis quas.
                                                        </p>
                                                    </div>
                                            </div>
                                            <div className='reviewsRow reply'>
                                                    <div className='row'>
                                                        <div className='col-sm-7 d-flex'>
                                                             <div className='d-flex flex-column'>
                                                                <div className="userInfo d-flex align-items-center mb-3">
                                                                    <div className="userImg lg">
                                                                        <span className="rounded-circle">
                                                                            <img src="https://mironcoder-hotash.netlify.app/images/avatar/01.webp" alt=''/>
                                                                        </span>
                                                                    </div>
                                                                    <div className="info pl-3">
                                                                        <h6>Miron Mahmud</h6>
                                                                        <span>25 minutes ago!</span>
                                                                    </div>
                                                                </div>

                                                                <Rating name="read-only" value={3} precision={2} readOnly />

                                                             </div>
                                                        </div>
                                                        <div className='col-md-5 d-flex align-items-center'>
                                                            <div className='ml-auto'>
                                                                <Button className="btn-blue btn-big btn-lg ml-auto"><FaReply/> &nbsp; Reply</Button>         
                                                            </div>
                                                        </div>
                                                        <p className="mt-3">Lorem ipsum dolor sit amet consectetur adipisicing elit.
                                                         Omnis quo nostrum dolore fugiat ducimus labore debitis unde autem recusandae? 
                                                         Eius harum tempora quis minima, adipisci natus quod magni omnis quas.
                                                         </p>
                                                    </div>
                                             </div>
                                         </div>
                                    </div>

                                    <h6 className="mt-4 mb-4">Xem lại mẫu trả lời</h6>

                                    <form class="reviewForm">
                                        <textarea placeholder="Viết ở đây "></textarea>
                                        <Button className='btn-blue btn-big btn-lg w-100 mt-4'>Câu trả lời của bạn</Button>
                                    </form>

                            </div>

                    </div>

                </div>
        </>
    )
}

export default ProductDetails;