import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Button, FormControl, MenuItem, Select, InputLabel } from "@mui/material";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { FaArrowLeft, FaCloudUploadAlt, FaPencilAlt, FaPlus } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import Swal from "sweetalert2";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../services/firebase";
import { productService } from "../../../services/productService";

const ProductUpload = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [productData, setProductData] = useState({
    name: "",
    description: "",
    weight: "",
    quantity: 0,
    productDetails: [{
      code: "",
      unit: "CAN",
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
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleDetailChange = (index, e) => {
    const { name, value } = e.target;
    setProductData(prev => {
      const newDetails = [...prev.productDetails];
      newDetails[index] = { ...newDetails[index], [name]: value };
      return { ...prev, productDetails: newDetails };
    });
    setErrors(prev => ({
      ...prev,
      productDetails: prev.productDetails?.map((err, i) => i === index ? { ...err, [name]: "" } : err) || []
    }));
  };

  const addProductDetail = () => {
    const lastDetail = productData.productDetails[productData.productDetails.length - 1];
    if (!lastDetail.code.trim() || !lastDetail.price || parseFloat(lastDetail.price) <= 0 || parseInt(lastDetail.conversionRate) < 1) {
      Swal.fire('Lỗi', 'Vui lòng hoàn thành đơn vị bán trước khi thêm mới', 'warning');
      return;
    }
    setProductData(prev => ({
      ...prev,
      productDetails: [
        ...prev.productDetails,
        { code: "", unit: "CAN", conversionRate: 1, price: "" }
      ]
    }));
    setErrors(prev => ({ ...prev, productDetails: [...(prev.productDetails || []), {}] }));
  };

  const removeProductDetail = (index) => {
    if (productData.productDetails.length === 1) {
      Swal.fire('Lỗi', 'Phải có ít nhất một đơn vị bán', 'warning');
      return;
    }
    setProductData(prev => ({
      ...prev,
      productDetails: prev.productDetails.filter((_, i) => i !== index)
    }));
    setErrors(prev => ({
      ...prev,
      productDetails: prev.productDetails?.filter((_, i) => i !== index) || []
    }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setImagePreviews(prev => ({ ...prev, main: previewUrl }));
    setUploadFiles(prev => ({ ...prev, main: file }));
    setProductData(prev => ({ ...prev, mainImage: true }));
    setErrors(prev => ({ ...prev, mainImage: "" }));
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || files.length + uploadFiles.additional.length > 5) {
      Swal.fire('Lỗi', 'Tối đa 5 ảnh phụ', 'warning');
      return;
    }
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
      setErrors(prev => ({ ...prev, mainImage: "Ảnh chính là bắt buộc" }));
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
    if (isSubmitting || !validateForm()) return;

    setIsSubmitting(true);
    try {
      const mainImageUrl = await uploadImage(uploadFiles.main);
      const additionalUrls = await Promise.all(uploadFiles.additional.map(file => uploadImage(file)));

      const payload = {
        name: productData.name.trim(),
        description: productData.description.trim() || null,
        weight: productData.weight ? parseFloat(productData.weight) : null,
        quantity: productData.quantity ? parseInt(productData.quantity) : 0,
        status: "ACTIVE",
        productDetails: productData.productDetails.map(detail => ({
          code: detail.code.trim(),
          unit: detail.unit,
          conversionRate: parseInt(detail.conversionRate) || 1,
          price: parseFloat(detail.price).toFixed(2)
        })),
        mainImage: true,
        imageUrl: mainImageUrl,
        notMainImages: additionalUrls
      };

      await productService.createProduct(payload);
      Swal.fire({
        title: 'Thành công',
        text: 'Sản phẩm đã được thêm thành công',
        icon: 'success'
      }).then(() => navigate('/admin/products'));
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
    const newErrors = {};
    let isValid = true;

    if (!productData.name.trim()) {
      newErrors.name = "Tên sản phẩm là bắt buộc";
      isValid = false;
    }

    if (!uploadFiles.main) {
      newErrors.mainImage = "Ảnh chính là bắt buộc";
      isValid = false;
    }

    const detailErrors = productData.productDetails.map((detail, index) => {
      const errors = {};
      if (!detail.code.trim()) {
        errors.code = "Mã code là bắt buộc";
        isValid = false;
      } else if (detail.code.length > 50) {
        errors.code = "Mã code không được vượt quá 50 ký tự";
        isValid = false;
      }
      if (!detail.price || isNaN(parseFloat(detail.price)) || parseFloat(detail.price) <= 0) {
        errors.price = "Giá bán phải lớn hơn 0";
        isValid = false;
      }
      if (!detail.conversionRate || isNaN(parseInt(detail.conversionRate)) || parseInt(detail.conversionRate) < 1) {
        errors.conversionRate = "Tỷ lệ quy đổi phải lớn hơn hoặc bằng 1";
        isValid = false;
      }
      return errors;
    });

    const codes = productData.productDetails.map(d => d.code.trim()).filter(c => c);
    if (new Set(codes).size !== codes.length) {
      Swal.fire('Lỗi', 'Mã code không được trùng lặp', 'warning');
      isValid = false;
    }

    if (productData.productDetails.length === 0) {
      Swal.fire('Lỗi', 'Phải có ít nhất một đơn vị bán', 'warning');
      isValid = false;
    }

    setErrors({ ...newErrors, productDetails: detailErrors });
    if (!isValid) {
      Swal.fire('Lỗi', 'Vui lòng kiểm Check và điền đầy đủ các trường bắt buộc', 'error');
    }
    return isValid;
  };

  return (
    <div className="right-content w-100">
      <form className="form" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-12">
            <div className="card p-3 mt-0">
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-outline-secondary btn-sm rounded-circle me-2 d-flex align-items-center justify-content-center"
                  style={{ width: '32px', height: '32px' }}
                  onClick={() => navigate('/admin/products')}
                >
                  <FaArrowLeft size={16} />
                </button>
                <h4 className="mb-0">Thêm sản phẩm mới</h4>
              </div>
            </div>
          </div>

          <div className="col-md-12">
            <div className="card p-3 mt-0">
              <h5 className="mb-4">Thông tin cơ bản</h5>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <h6>Tên sản phẩm <span className="text-danger">*</span></h6>
                    <input
                      type="text"
                      name="name"
                      value={productData.name}
                      onChange={handleInputChange}
                      placeholder="Nhập tên sản phẩm"
                      required
                    />
                    {errors.name && <p className="text-danger small">{errors.name}</p>}
                  </div>
                  <div className="form-group">
                    <h6>Mô tả</h6>
                    <textarea
                      name="description"
                      value={productData.description}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Nhập mô tả sản phẩm"
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <h6>Trọng lượng (kg)</h6>
                    <input
                      type="text" // Đổi sang text
                      name="weight"
                      value={productData.weight}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Chỉ cho phép số và dấu chấm (cho số thập phân)
                        if (/^\d*\.?\d*$/.test(value) || value === "") {
                          handleInputChange(e);
                        }
                      }}
                      onWheel={(e) => e.currentTarget.blur()} // Thoát focus khi lăn chuột
                      placeholder="Nhập trọng lượng"
                    />
                  </div>
                  <div className="form-group">
                    <h6>Số lượng</h6>
                    <input
                      type="text" // Đổi sang text
                      name="quantity"
                      value={productData.quantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Chỉ cho phép số nguyên
                        if (/^\d*$/.test(value) || value === "") {
                          handleInputChange(e);
                        }
                      }}
                      onWheel={(e) => e.currentTarget.blur()} // Thoát focus khi lăn chuột
                      placeholder="Nhập số lượng"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-12">
            <div className="card p-4 mt-0">
              <h5 className="mb-4">Đơn vị bán <span className="text-danger">*</span></h5>
              {productData.productDetails.map((detail, index) => (
                <div key={index} className="row mb-3 align-items-center">
                  <div className="col-md-3">
                    <div className="form-group">
                      <h6>Mã code <span className="text-danger">*</span></h6>
                      <input
                        type="text"
                        name="code"
                        value={detail.code}
                        onChange={(e) => handleDetailChange(index, e)}
                        placeholder="Nhập mã code"
                        required
                      />
                      {errors.productDetails?.[index]?.code && (
                        <p className="text-danger small">{errors.productDetails[index].code}</p>
                      )}
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="form-group">
                      <h6>Đơn vị <span className="text-danger">*</span></h6>
                      <FormControl fullWidth>
                        <Select
                          name="unit"
                          value={detail.unit}
                          onChange={(e) => handleDetailChange(index, e)}
                          required
                        >
                          <MenuItem value="CAN">Hộp/Lon</MenuItem>
                          <MenuItem value="PACK">Lốc</MenuItem>
                          <MenuItem value="CASE">Thùng</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="form-group">
                      <h6>Tỷ lệ quy đổi <span className="text-danger">*</span></h6>
                      <input
                        type="text" // Đổi sang text
                        name="conversionRate"
                        value={detail.conversionRate}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Chỉ cho phép số nguyên
                          if (/^\d*$/.test(value) || value === "") {
                            handleDetailChange(index, e);
                          }
                        }}
                        onWheel={(e) => e.currentTarget.blur()} // Thoát focus khi lăn chuột
                        placeholder="Nhập tỷ lệ"
                        required
                      />
                      {errors.productDetails?.[index]?.conversionRate && (
                        <p className="text-danger small">{errors.productDetails[index].conversionRate}</p>
                      )}
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="form-group">
                      <h6>Giá bán <span className="text-danger">*</span></h6>
                      <input
                        type="text" // Đổi sang text
                        name="price"
                        value={detail.price}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Chỉ cho phép số và dấu chấm (cho số thập phân)
                          if (/^\d*\.?\d*$/.test(value) || value === "") {
                            handleDetailChange(index, e);
                          }
                        }}
                        onWheel={(e) => e.currentTarget.blur()} // Thoát focus khi lăn chuột
                        placeholder="Nhập giá bán"
                        required
                      />
                      {errors.productDetails?.[index]?.price && (
                        <p className="text-danger small">{errors.productDetails[index].price}</p>
                      )}
                    </div>
                  </div>
                  <div className="col-md-3">
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => removeProductDetail(index)}
                      fullWidth
                      disabled={productData.productDetails.length === 1}
                    >
                      Xóa
                    </Button>
                  </div>
                </div>
              ))}
              <div className="row mt-3">
                <div className="col-md-12 text-center">
                  <Button
                    type="button"
                    variant="contained"
                    color="success"
                    onClick={addProductDetail}
                    startIcon={<FaPlus />}
                    style={{ maxWidth: '200px' }}
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
                  <div className="col-md-6 mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <h6 className="m-0">Ảnh chính <span className="text-danger">*</span></h6>
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
                      <label className="upload-box-main">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageChange}
                          className="d-none"
                        />
                        <div className="text-center">
                          <FaCloudUploadAlt size={24} color="#007bff" />
                          <h5>Tải ảnh chính lên</h5>
                        </div>
                      </label>
                    )}
                    {errors.mainImage && <p className="text-danger small">{errors.mainImage}</p>}
                  </div>
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
                                    justifyContent: "center"
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
                                border: "2px dashed #ddd",
                                borderRadius: "8px",
                                cursor: "pointer",
                                aspectRatio: "1/1",
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
                                <FaPlus size={20} color="#6c757d" />
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
                <div className="col-md-12 text-center">
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting}
                    startIcon={<FaCloudUploadAlt />}
                    style={{ padding: '8px 24px' }}
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