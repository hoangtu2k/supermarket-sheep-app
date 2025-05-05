import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Button from "@mui/material/Button";
import { MenuItem, Select } from "@mui/material";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { FaCloudUploadAlt, FaRegImages } from "react-icons/fa";
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
                  <div className="col-md-2" style={{marginTop:'40px'}}>
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
              <div className="imagesUploadSec mt-2 pl-3">
                <div className="row">
                  <div className="col-md-6 pt-3">
                    <h6>Ảnh chính</h6>
                    {imagePreviews.main ? (
                      <div className="uploadBox">
                        <span className="remove" onClick={() => removeImage("main")}>
                          <IoCloseSharp />
                        </span>
                        <LazyLoadImage
                          src={imagePreviews.main}
                          alt="Main preview"
                          className="w-100"
                          effect="blur"
                        />
                      </div>
                    ) : (
                      <div className="uploadBox">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMainImageChange}
                        />
                        <div className="info">
                          <FaRegImages />
                          <h5>Ảnh chính</h5>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="col-md-6 pt-3">
                    <h6>Ảnh phụ</h6>
                    <div className="additional-images">
                      {imagePreviews.additional.map((preview, index) => (
                        <div key={index} className="uploadBox">
                          <span className="remove" onClick={() => removeImage("additional", index)}>
                            <IoCloseSharp />
                          </span>
                          <LazyLoadImage
                            src={preview}
                            alt={`Additional ${index}`}
                            className="w-100"
                            effect="blur"
                          />
                        </div>
                      ))}
                      <div className="uploadBox">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleAdditionalImagesChange}
                        />
                        <div className="info">
                          <FaRegImages />
                          <h5>Ảnh phụ</h5>
                        </div>
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