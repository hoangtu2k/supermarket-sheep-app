import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import Button from "@mui/material/Button";
import { MenuItem, Select } from "@mui/material";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { FaCloudUploadAlt, FaRegImages } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import Swal from "sweetalert2";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../services/firebase";
import { productService } from "../../../services/productService";

import axios from "../../../services/axiosConfig";


const ProductUpdate = () => {

  const { id } = useParams(); // Lấy id từ URL
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState(0);

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState({
    main: [],
    additional: [],
    featured: [],
    secondary: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleMainImageChange = (event) => {
    const file = event.target.files[0];
    const previewUrl = URL.createObjectURL(file);

    console.log("Main Image:", { file, url: previewUrl });

    setImages((prevImages) => [
      { file, main: true, featured: false, secondary: false },
      ...prevImages.filter((img) => !img.main),
    ]);

    setImagePreviews((prevPreviews) => ({
      main: [
        { url: previewUrl, main: true, featured: false, secondary: false },
      ],
      additional: prevPreviews.additional,
      featured: prevPreviews.featured,
      secondary: prevPreviews.secondary,
    }));
  };

  const handleAdditionalImagesChange = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => ({
      file,
      main: false,
      featured: false,
    }));
    const newImagePreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      main: false,
      featured: false,
    }));

    console.log("Additional Images:", newImages, newImagePreviews);

    setImages((prevImages) => [...prevImages, ...newImages]);
    setImagePreviews((prevPreviews) => ({
      ...prevPreviews,
      additional: [...prevPreviews.additional, ...newImagePreviews],
    }));
  };

  const handleFeaturedImagesChange = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => ({
      file,
      main: false,
      featured: true,
    }));
    const newImagePreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      main: false,
      featured: true,
    }));

    console.log("Featured Images:", newImages, newImagePreviews);

    setImages((prev) => [...prev, ...newImages]);
    setImagePreviews((prev) => ({
      ...prev,
      featured: [...prev.featured, ...newImagePreviews],
    }));
  };

  const handleSecondaryImagesChange = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => ({
      file,
      main: false,
      secondary: true,
    }));
    const newImagePreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      main: false,
      secondary: true,
    }));

    console.log("Secondary Images:", newImages, newImagePreviews);

    setImages((prev) => [...prev, ...newImages]);
    setImagePreviews((prev) => ({
      ...prev,
      secondary: [...prev.secondary, ...newImagePreviews],
    }));
  };

  const removeImage = (type, index) => {
    if (type === "main") {
      setImagePreviews((prev) => ({
        ...prev,
        main: prev.main.filter((_, i) => i !== index),
      }));
    } else if (type === "additional") {
      setImagePreviews((prev) => ({
        ...prev,
        additional: prev.additional.filter((_, i) => i !== index),
      }));
    } else if (type === "featured") {
      setImagePreviews((prev) => ({
        ...prev,
        featured: prev.featured.filter((_, i) => i !== index),
      }));
    } else if (type === "secondary") {
      setImagePreviews((prev) => ({
        ...prev,
        secondary: prev.secondary.filter((_, i) => i !== index),
      }));
    }
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

        // Xử lý ảnh
        const mainImage = product.imageUrl
          ? [{ url: product.imageUrl, main: true, file: null }]
          : [];

        const notMainImages = Array.isArray(product.notMainImages)
          ? product.notMainImages
          : [];

        // Cập nhật state hiển thị ảnh
        setImagePreviews({
          main: mainImage,
          additional: notMainImages.length > 0 ? [{ url: notMainImages[0], main: false, file: null }] : [],
          featured: notMainImages.length > 1 ? [{ url: notMainImages[1], main: false, file: null }] : [],
          secondary: notMainImages.length > 2 ? [{ url: notMainImages[2], main: false, file: null }] : [],
        });

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
      let imageUrls = [];

      // Kết hợp tất cả các loại ảnh từ images và imagePreviews
      const allImages = [
        ...images,
        ...imagePreviews.main,
        ...imagePreviews.additional,
        ...imagePreviews.featured,
        ...imagePreviews.secondary,
      ];

      if (allImages && allImages.length > 0) {
        imageUrls = await Promise.all(
          allImages.map(async (image) => {
            // Kiểm tra xem image có tồn tại và có thuộc tính file
            if (!image || !image.file) {
              console.warn(
                "Hình ảnh không được xác định hoặc không hợp lệ, bị bỏ qua..."
              );
              return null; // Bỏ qua ảnh không hợp lệ
            }

            const storageRef = ref(
              storage,
              `images/sheepshop/${image.file.name}`
            );
            let imageUrl;

            try {
              // Kiểm tra xem ảnh đã tồn tại chưa
              imageUrl = await getDownloadURL(storageRef);
              console.log("Hình ảnh đã tồn tại:", imageUrl);
              return {
                url: imageUrl,
                mainImage: image.main,
              };
            } catch (error) {
              // Nếu không tồn tại, tải lên ảnh mới
              await uploadBytes(storageRef, image.file);
              imageUrl = await getDownloadURL(storageRef);
              console.log("Hình ảnh đã được tải lên:", imageUrl);
              return {
                url: imageUrl,
                mainImage: image.main,
              };
            }
          })
        );

        // Lọc ra các giá trị null (các ảnh không hợp lệ)
        imageUrls = imageUrls.filter((url) => url !== null);
      }

      // Gửi yêu cầu cập nhật sản phẩm
      const productData = {
        code,
        name,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        weight: parseFloat(weight),
      };

      const productResponse = await productService.updateProduct(id, productData);
      const productId = productResponse.data.id;

      if (imageUrls === null) {
        // Delete existing images
        await axios.delete(`/admin/product/image/${productId}`);
      }

      // Add new images
      await Promise.all(
        imageUrls.map((image) =>
          axios.post(`/admin/product/image`, {
            productId,
            imageUrl: image.url,
            mainImage: image.mainImage ? 1 : 0, // Convert boolean to 1 or 0
          })
        )
      );

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

              </div>
            </div>

            <div className="col-md-12">
              <div className="card p-4 mt-0">

                <div className="imagesUploadSec mt-2 pl-3">
                  <div className="imgUploadBox d-flex align-items-center">
                    <div className="row">

                      {/* Main Image Box */}
                      <div className="col-md-3 pt-3">
                        {imagePreviews.main.length > 0 ? (
                          imagePreviews.main.map((preview, index) => (
                            <div key={`main-${index}`} className="uploadBox">
                              <span className="remove" onClick={() => removeImage("main", index)}>
                                <IoCloseSharp />
                              </span>
                              <div className="box">
                                <img
                                  src={preview.url}
                                  alt="Main product"
                                  className="w-100"
                                  onError={(e) => {
                                    e.target.src = 'path/to/default-image.jpg';
                                  }}
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="uploadBox">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleMainImageChange}
                              id="main-image-upload"
                            />
                            <label htmlFor="main-image-upload" className="info">
                              <FaRegImages />
                              <h5>Ảnh đại diện</h5>
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Additional Images Box */}
                      <div className="col-md-3 pt-3">
                        {imagePreviews.additional.length > 0 ? (
                          imagePreviews.additional.map((preview, index) => (
                            <div key={`additional-${index}`} className="uploadBox">
                              <span className="remove" onClick={() => removeImage("additional", index)}>
                                <IoCloseSharp />
                              </span>
                              <div className="box">
                                <img
                                  src={preview.url}
                                  alt="Additional product"
                                  className="w-100"
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="uploadBox">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleAdditionalImagesChange}
                              id="additional-image-upload"
                            />
                            <label htmlFor="additional-image-upload" className="info">
                              <FaRegImages />
                              <h5>Ảnh phụ 1</h5>
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Featured Images Box */}
                      <div className="col-md-3 pt-3">
                        {imagePreviews.featured.length > 0 ? (
                          imagePreviews.featured.map((preview, index) => (
                            <div key={`featured-${index}`} className="uploadBox">
                              <span className="remove" onClick={() => removeImage("featured", index)}>
                                <IoCloseSharp />
                              </span>
                              <div className="box">
                                <img
                                  src={preview.url}
                                  alt="Featured product"
                                  className="w-100"
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="uploadBox">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleFeaturedImagesChange}
                              id="featured-image-upload"
                            />
                            <label htmlFor="featured-image-upload" className="info">
                              <FaRegImages />
                              <h5>Ảnh phụ 2</h5>
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Secondary Images Box */}
                      <div className="col-md-3 pt-3">
                        {imagePreviews.secondary.length > 0 ? (
                          imagePreviews.secondary.map((preview, index) => (
                            <div key={`secondary-${index}`} className="uploadBox">
                              <span className="remove" onClick={() => removeImage("secondary", index)}>
                                <IoCloseSharp />
                              </span>
                              <div className="box">
                                <img
                                  src={preview.url}
                                  alt="Secondary product"
                                  className="w-100"
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="uploadBox">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleSecondaryImagesChange}
                              id="secondary-image-upload"
                            />
                            <label htmlFor="secondary-image-upload" className="info">
                              <FaRegImages />
                              <h5>Ảnh phụ 3</h5>
                            </label>
                          </div>
                        )}
                      </div>

                    </div>
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
