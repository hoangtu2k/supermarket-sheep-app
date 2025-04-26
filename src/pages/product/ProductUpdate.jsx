import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import Button from "@mui/material/Button";
import { MenuItem, Select } from "@mui/material";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { FaCloudUploadAlt, FaRegImages } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import Swal from "sweetalert2";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../services/firebase";
import { productService } from "../../services/productService";


const ProductUpdate = () => {

  const { id } = useParams(); // Lấy id từ URL
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImage(file);
      setImagePreview(previewUrl);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  // Tải dữ liệu sản phẩm khi component mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productService.getProductById(id);
        const product = response.data;
        setCode(product.code);
        setName(product.name);
        setPrice(product.price);
        setWeight(product.weight);
        setDescription(product.description);
        setQuantity(product.quantity);
        setImagePreview(product.imageUrl); // Hiển thị ảnh đã lưu
      } catch (error) {
        Swal.fire({
          title: 'Lỗi',
          text: "Không thể tải sản phẩm.",
          icon: 'error'
        });
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);


  const handleSubmitProductUpdate = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Hiển thị hộp thoại xác nhận
    const result = await Swal.fire({
      title: 'Xác nhận',
      text: "Bạn có chắc chắn muốn cập nhật sản phẩm này không?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Có',
      cancelButtonText: 'Không'
    });

    if (!result.isConfirmed) {
      return; // Nếu người dùng không xác nhận, dừng lại
    }

    setIsSubmitting(true);

    try {
      let imageUrl = null;

      // Upload ảnh nếu có
      if (image) {
        const storageRef = ref(storage, `images/sheepshop/${image.name}`);
        await uploadBytes(storageRef, image);
        imageUrl = await getDownloadURL(storageRef);
      }

      // Gửi yêu cầu cập nhật sản phẩm
      const productData = {
        code,
        name,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        weight: parseFloat(weight),
        imageUrl: imageUrl || imagePreview // Sử dụng ảnh đã có nếu không có ảnh mới
      };

      await productService.updateProduct(id, productData);

      Swal.fire({
        title: 'Thành công',
        text: "Cập nhật sản phẩm thành công.",
        icon: 'success'
      });

      navigate('/admin/products'); // Chuyển trang sau khi thành công
    } catch (error) {
      Swal.fire({
        title: 'Lỗi',
        text: error.response?.data?.message || "Đã có lỗi xảy ra.",
        icon: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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



        <form className="form" onSubmit={handleSubmitProductUpdate}>

          <div className="row">
            <div className="col-md-6">
              <div className="card p-4 mt-0">
                <h5 className="mb-4">Thông tin cơ bản</h5>

                <div className="row">
                  <div className="col">

                    <div className="form-group">
                      <h6>Mã sản phẩm</h6>
                      <input
                        type="text"
                        placeholder="Mã sản phẩm"
                        value={code || ""}
                        onChange={(e) => setCode(e.target.value)}
                      />
                    </div>

                  </div>
                  <div className="col">

                    <div className="form-group">
                      <h6>Tên sản phẩm</h6>
                      <input
                        type="text"
                        placeholder="Nhập tên"
                        value={name || ""}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>

                  </div>

                </div>

                <div className="form-group">
                  <h6>Trọng lượng</h6>
                  <input
                    type="text"
                    placeholder="Nhập trọng lượng"
                    value={weight || ""}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>

                <div className="row">
                  <div className="col">

                    <div className="form-group">
                      <h6>Số lượng</h6>
                      <input
                        type="text"
                        placeholder="Nhập số lượng"
                        value={quantity || ""}
                        onChange={(e) => setQuantity(e.target.value)}
                      />
                    </div>

                  </div>
                  <div className="col">

                    <div className="form-group">
                      <h6>Giá bán</h6>
                      <input
                        type="text"
                        placeholder="Nhập giá bán"
                        value={price || ""}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </div>

                  </div>

                </div>

                <div className="form-group">
                  <h6>Mô tả</h6>
                  <textarea
                    rows={5}
                    cols={10}
                    placeholder="Mô tả sản phẩm"
                    value={description || ""}
                    onChange={(e) => setDescription(e.target.value)}
                  />

                </div>

              </div>
            </div>

            <div className="col-md-6">
              <div className="card p-4 mt-0">

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

                <div className="imagesUploadSec mt-3">
                  <div className="imgUploadBox">
                    {imagePreview ? (
                      <div className="uploadBox">
                        <span className="remove" onClick={removeImage}>
                          <IoCloseSharp />
                        </span>
                        <div className="box">
                          <LazyLoadImage
                            alt="Product image"
                            effect="blur"
                            className="w-100"
                            src={imagePreview}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="uploadBox">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        <div className="info">
                          <FaRegImages />
                          <h5>Ảnh sản phẩm</h5>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <br />

                <div className="row">
                  <div className="col-md-5">
                    <Button type="reset" className="btn-blue btn-lg btn-big"><FaCloudUploadAlt />&nbsp; Làm mới</Button>
                  </div>
                  <div className="col-md-7">
                    <Button type="submit" className="btn-blue btn-lg btn-big"><FaCloudUploadAlt />&nbsp; CẬP NHẬT VÀ XEM</Button>
                  </div>
                </div>

              </div>
            </div>

          </div>

        </form>

      </div>
    </>
  );
};

export default ProductUpdate;
