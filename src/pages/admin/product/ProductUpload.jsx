import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Button from "@mui/material/Button";
import { MenuItem, Select } from "@mui/material";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { FaCloudUploadAlt, FaPencilAlt, FaPlus, FaRegImages } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import Swal from "sweetalert2";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../services/firebase";
import { productService } from "../../../services/productService";

const ProductUpload = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [productData, setProductData] = useState({
    name: "",
    description: "",
    weight: "",
    quantity: 0,
    productDetails: [{
      code: "",
      unit: "hộp",
      conversionRate: 1,
      price: ""
    }],
    mainImage: false,
    imageUrl: "",
    notMainImages: []
  });
  const [imagePreviews, setImagePreviews] = useState({
    main: null,
    additional: []
  });
  const [uploadFiles, setUploadFiles] = useState({
    main: null,
    additional: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData(prev => ({ ...prev, [name]: value }));
  };

  const handleDetailChange = (index, e) => {
    const { name, value } = e.target;
    setProductData(prev => {
      const newDetails = [...prev.productDetails];
      newDetails[index] = { ...newDetails[index], [name]: value };
      return { ...prev, productDetails: newDetails };
    });
  };

  const addProductDetail = () => {
    setProductData(prev => ({
      ...prev,
      productDetails: [
        ...prev.productDetails,
        { code: "", unit: "hộp", conversionRate: 1, price: "" }
      ]
    }));
  };

  const removeProductDetail = (index) => {
    setProductData(prev => ({
      ...prev,
      productDetails: prev.productDetails.filter((_, i) => i !== index)
    }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setImagePreviews(prev => ({ ...prev, main: previewUrl }));
    setUploadFiles(prev => ({ ...prev, main: file }));
    setProductData(prev => ({ ...prev, mainImage: true }));
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => ({
      ...prev,
      additional: [...prev.additional, ...newPreviews]
    }));
    setUploadFiles(prev => ({
      ...prev,
      additional: [...prev.additional, ...files]
    }));
  };

  const removeImage = (type, index) => {
    if (type === "main") {
      setImagePreviews(prev => ({ ...prev, main: null }));
      setUploadFiles(prev => ({ ...prev, main: null }));
      setProductData(prev => ({ ...prev, mainImage: false, imageUrl: "" }));
    } else {
      setImagePreviews(prev => ({
        ...prev,
        additional: prev.additional.filter((_, i) => i !== index)
      }));
      setUploadFiles(prev => ({
        ...prev,
        additional: prev.additional.filter((_, i) => i !== index)
      }));
      setProductData(prev => ({
        ...prev,
        notMainImages: prev.notMainImages.filter((_, i) => i !== index)
      }));
    }
  };

  const uploadImage = async (file) => {
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Upload main image
      const mainImageUrl = await uploadImage(uploadFiles.main);

      // Upload additional images if any
      const additionalUrls = [];
      for (const file of uploadFiles.additional) {
        const url = await uploadImage(file);
        additionalUrls.push(url);
      }

      // Prepare final payload
      const payload = {
        ...productData,
        imageUrl: mainImageUrl,
        notMainImages: additionalUrls,
        weight: productData.weight ? parseFloat(productData.weight) : 0,
        quantity: parseInt(productData.quantity) || 0,
        productDetails: productData.productDetails.map(detail => ({
          code: detail.code || undefined, // Gửi code hoặc undefined nếu trống
          unit: detail.unit || "unit",
          conversionRate: parseInt(detail.conversionRate) || 1,
          price: parseFloat(detail.price) || 0
        }))
      };

      // Create product
      await productService.createProduct(payload);

      Swal.fire({
        title: 'Thành công',
        text: 'Sản phẩm đã được thêm thành công',
        icon: 'success'
      }).then(() => {
        navigate('/admin/products');
      });
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        title: 'Lỗi',
        text: error.response?.data?.message || 'Tạo sản phẩm thất bại',
        icon: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateForm = () => {
    if (!productData.name.trim()) {
      Swal.fire('Lỗi', 'Vui lòng nhập tên sản phẩm', 'error');
      return false;
    }

    if (!uploadFiles.main) {
      Swal.fire('Lỗi', 'Vui lòng chọn ảnh chính', 'error');
      return false;
    }

    for (const detail of productData.productDetails) {
      if (!detail.price || isNaN(detail.price)) {
        Swal.fire('Lỗi', 'Vui lòng nhập giá bán hợp lệ cho tất cả đơn vị', 'error');
        return false;
      }

      // Thêm validate cho code nếu cần
      /*
      if (!detail.code || !detail.code.trim()) {
        Swal.fire('Lỗi', 'Vui lòng nhập mã code cho tất cả đơn vị', 'error');
        return false;
      }
      */
    }

    return true;
  };

  return (
    <div className="right-content w-100">
      <form className="form" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-12">
            <div className="card p-3 mt-0">
              <h5 className="mb-4">Thông tin cơ bản</h5>

              <div className="row">
                <div className="col-md-6">

                  <div className="form-group">
                    <h6>Tên sản phẩm *</h6>
                    <input
                      type="text"
                      name="name"
                      value={productData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <h6>Mô tả</h6>
                    <textarea
                      name="description"
                      value={productData.description}
                      onChange={handleInputChange}
                      rows={5}
                    />
                  </div>

                </div>

                <div className="col-md-6">

                  <div className="form-group">
                    <h6>Trọng lượng (kg)</h6>
                    <input
                      type="number"
                      step="0.01"
                      name="weight"
                      value={productData.weight}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="form-group">
                    <h6>Số lượng</h6>
                    <input
                      type="number"
                      name="quantity"
                      value={productData.quantity}
                      onChange={handleInputChange}
                    />
                  </div>

                </div>
              </div>

            </div>
          </div>

          <div className="col-md-12">
            <div className="card p-4 pb-4 mt-0">
              <h5 className="mb-4">Đơn vị bán</h5>

              {productData.productDetails.map((detail, index) => (
                <div key={index} className="row mb-3">
                  <div className="col-md-3">
                    <div className="form-group">
                      <h6>Mã code</h6>
                      <input
                        type="text"
                        name="code"
                        value={detail.code}
                        onChange={(e) => handleDetailChange(index, e)}
                        placeholder="Nhập mã code"
                      />
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="form-group">
                      <h6>Đơn vị</h6>
                      <input
                        type="text"
                        name="unit"
                        value={detail.unit}
                        onChange={(e) => handleDetailChange(index, e)}
                        placeholder="Nhập đơn vị"
                      />
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="form-group">
                      <h6>Tỷ lệ quy đổi</h6>
                      <input
                        type="number"
                        name="conversionRate"
                        value={detail.conversionRate}
                        onChange={(e) => handleDetailChange(index, e)}
                      />
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="form-group">
                      <h6>Giá bán</h6>
                      <input
                        type="number"
                        name="price"
                        value={detail.price}
                        onChange={(e) => handleDetailChange(index, e)}
                      />
                    </div>
                  </div>
                  <div className="col-md-2" style={{ marginTop: '40px' }}>
                    <Button
                      type="button"
                      variant="outlined"
                      color="error"
                      onClick={() => removeProductDetail(index)}
                      fullWidth
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}

              <div className="row">
                <div className="col-md-3"> {/* Đặt cùng độ rộng với cột mã code */}
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={addProductDetail}
                    fullWidth
                    style={{ marginTop: '16px' }}
                  >
                    Thêm đơn vị bán
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-12">
            <div className="card p-4 mt-0">
              <div className="imagesUploadSec">
                <div className="row">
                  {/* Ảnh chính */}
                  <div className="col-md-6 mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <h6 className="m-0">Ảnh chính</h6>
                      <span className="text-muted ms-2">(Bắt buộc)</span>
                    </div>

                    {imagePreviews.main ? (
                      <div className="position-relative">
                        <div className="uploaded-image-preview shadow-sm rounded">
                          <LazyLoadImage
                            src={imagePreviews.main}
                            alt="Main preview"
                            className="w-100 h-100 object-fit-cover"
                            effect="blur"
                            style={{ minHeight: "200px" }}
                          />
                          <div className="d-flex justify-content-center gap-2 mt-2">
                            {/* Nút Thay đổi ảnh */}
                            <label className="btn btn-sm btn-outline-primary">
                              <FaPencilAlt /> Thay đổi
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleMainImageChange}
                                className="d-none"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Phần upload ảnh ban đầu
                      <label className="upload-box-main">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageChange}
                          className="d-none"
                        />
                        <div className="text-center">
                          <FaCloudUploadAlt size={32} color="#007bff" />
                          <h5>Tải ảnh chính lên</h5>
                        </div>
                      </label>
                    )}
                  </div>

                  {/* Ảnh phụ */}
                  <div className="col-md-6">
                    <div className="d-flex align-items-center mb-3">
                      <h6 className="m-0">Ảnh phụ</h6>
                      <span className="text-muted ms-2">(Tối đa 5 ảnh)</span>
                    </div>

                    <div className="additional-images-container">
                      <div className="row g-2">
                        {imagePreviews.additional.map((preview, index) => (
                          <div key={index} className="col-4 mb-2">
                            <div className="position-relative">
                              <div
                                className="additional-image-preview shadow-sm rounded"
                                style={{
                                  border: "1px dashed #ddd",
                                  overflow: "hidden",
                                  aspectRatio: "1/1"
                                }}
                              >
                                <LazyLoadImage
                                  src={preview}
                                  alt={`Additional ${index}`}
                                  className="w-100 h-100 object-fit-cover"
                                  effect="blur"
                                />
                                <button
                                  className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                                  onClick={() => removeImage("additional", index)}
                                  style={{
                                    width: "24px",
                                    height: "24px",
                                    borderRadius: "50%",
                                    padding: "0",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    top: '0px',
                                    right: "0px"
                                  }}
                                >
                                  <IoCloseSharp size={12} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}

                        {imagePreviews.additional.length < 5 && (
                          <div className="col-4">
                            <label
                              className="upload-box-additional d-flex align-items-center justify-content-center"
                              style={{
                                border: "2px dashed #6c757d",
                                borderRadius: "8px",
                                cursor: "pointer",
                                aspectRatio: "1/1",
                                transition: "all 0.3s",
                                backgroundColor: "rgba(108, 117, 125, 0.05)"
                              }}
                            >
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleAdditionalImagesChange}
                                className="d-none"
                              />
                              <div className="text-center p-2">
                                <FaPlus size={20} color="#6c757d" /> {/* Đã được import */}
                                <p className="small m-0 mt-1">Thêm ảnh</p>
                              </div>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                </div>
              </div>

              <div className="row mt-4">
                <div className="col-md-12 text-end">
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    startIcon={<FaCloudUploadAlt />}
                    sx={{
                      padding: "8px 24px",
                      borderRadius: "8px",
                      textTransform: "none",
                      fontSize: "1rem",
                      fontWeight: "500"
                    }}
                  >
                    {isSubmitting ? 'Đang xử lý...' : 'Thêm sản phẩm'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
};

export default ProductUpload;