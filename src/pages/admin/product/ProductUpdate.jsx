import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, FormControl, MenuItem, Select, FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { FaArrowLeft, FaCloudUploadAlt, FaPencilAlt, FaPlus } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import Swal from "sweetalert2";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../services/firebase";
import { productService } from "../../../services/productService";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";

const ProductUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]); // State để lưu danh sách danh mục
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]); // State để lưu danh mục được chọn
  const fileInputRef = useRef(null);

  const [productData, setProductData] = useState({
    name: "",
    description: "",
    weight: "",
    quantity: 0,
    productDetails: [
      {
        id: null,
        code: "",
        unitId: "",
        conversionRate: 1,
        price: "",
      },
    ],
    mainImage: false,
    imageUrl: "",
    notMainImages: [],
  });

  const [imagePreviews, setImagePreviews] = useState({
    main: null,
    additional: [],
  });

  const [uploadFiles, setUploadFiles] = useState({
    main: null,
    additional: [],
  });

  const [previewUrls, setPreviewUrls] = useState([]);

  // Lấy danh sách Unit và Categories từ backend
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await axios.get('/admin/units');
        setUnits(response.data);
      } catch (error) {
        console.error("Error fetching units:", error);
        Swal.fire('Lỗi', 'Không thể tải danh sách đơn vị', 'error');
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get('/admin/categories');
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        Swal.fire('Lỗi', 'Không thể tải danh sách danh mục', 'error');
      }
    };

    fetchUnits();
    fetchCategories();
  }, []);

  // Tải dữ liệu sản phẩm
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await productService.getProductById(id);
        const product = response.data;

        setProductData({
          name: product.name || "",
          description: product.description || "",
          weight: product.weight || "",
          quantity: product.quantity || 0,
          productDetails: product.productDetails?.length
            ? product.productDetails.map((detail) => ({
                id: detail.id,
                code: detail.code || "",
                unitId: detail.unitId || (units.length > 0 ? units[0].id : ""),
                conversionRate: detail.conversionRate || 1,
                price: detail.price ? detail.price.toString() : "",
              }))
            : [
                {
                  id: null,
                  code: "",
                  unitId: units.length > 0 ? units[0].id : "",
                  conversionRate: 1,
                  price: "",
                },
              ],
          mainImage: !!product.imageUrl,
          imageUrl: product.imageUrl || "",
          notMainImages: product.notMainImages || [],
        });

        setImagePreviews({
          main: product.imageUrl || null,
          additional: product.notMainImages || [],
        });

        // Lấy danh sách categoryIds từ product
        setSelectedCategoryIds(product.categoryIds || []);
      } catch (error) {
        Swal.fire({
          title: "Lỗi",
          text: "Không thể tải sản phẩm.",
          icon: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }

    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [id, units]);

  // Xử lý chọn/hủy chọn danh mục
  const handleCategoryChange = (categoryId) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
    setErrors((prev) => ({ ...prev, categories: "" }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "weight" && !/^\d*\.?\d*$/.test(value) && value !== "") return;
    if (name === "quantity" && !/^\d*$/.test(value) && value !== "") return;
    setProductData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDetailChange = (index, e) => {
    const { name, value } = e.target;
    if (name === "conversionRate" && !/^\d*$/.test(value) && value !== "") return;
    if (name === "price" && !/^\d*\.?\d*$/.test(value) && value !== "") return;
    setProductData((prev) => {
      const newDetails = [...prev.productDetails];
      newDetails[index] = {
        ...newDetails[index],
        [name]: value,
      };
      return { ...prev, productDetails: newDetails };
    });
    setErrors((prev) => ({
      ...prev,
      productDetails:
        prev.productDetails?.map((err, i) =>
          i === index ? { ...err, [name]: "" } : err
        ) || [],
    }));
  };

  const addProductDetail = () => {
    const lastDetail = productData.productDetails[productData.productDetails.length - 1];
    if (
      !lastDetail.code.trim() ||
      !lastDetail.unitId ||
      !lastDetail.price ||
      parseFloat(lastDetail.price) <= 0 ||
      parseInt(lastDetail.conversionRate) < 1
    ) {
      Swal.fire("Lỗi", "Vui lòng hoàn thành đơn vị bán trước khi thêm mới", "warning");
      return;
    }
    setProductData((prev) => ({
      ...prev,
      productDetails: [
        ...prev.productDetails,
        {
          id: null,
          code: "",
          unitId: units.length > 0 ? units[0].id : "",
          conversionRate: 1,
          price: "",
        },
      ],
    }));
    setErrors((prev) => ({
      ...prev,
      productDetails: [...(prev.productDetails || []), {}],
    }));
  };

  const removeProductDetail = (index) => {
    if (productData.productDetails.length === 1) {
      Swal.fire("Lỗi", "Phải có ít nhất một đơn vị bán", "warning");
      return;
    }
    setProductData((prev) => ({
      ...prev,
      productDetails: prev.productDetails.filter((_, i) => i !== index),
    }));
    setErrors((prev) => ({
      ...prev,
      productDetails: prev.productDetails?.filter((_, i) => i !== index) || [],
    }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPreviewUrls((prev) => [...prev, previewUrl]);
    setImagePreviews((prev) => ({ ...prev, main: previewUrl }));
    setUploadFiles((prev) => ({ ...prev, main: file }));
    setProductData((prev) => ({ ...prev, mainImage: true }));
    setErrors((prev) => ({ ...prev, mainImage: "" }));
  };

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length || imagePreviews.additional.length + files.length > 5) {
      if (imagePreviews.additional.length + files.length > 5) {
        Swal.fire("Lỗi", "Tối đa 5 ảnh phụ.", "error");
      }
      return;
    }
    const newPreviews = files.map((file) => {
      const url = URL.createObjectURL(file);
      setPreviewUrls((prev) => [...prev, url]);
      return url;
    });
    setImagePreviews((prev) => ({
      ...prev,
      additional: [...prev.additional, ...newPreviews],
    }));
    setUploadFiles((prev) => ({
      ...prev,
      additional: [...prev.additional, ...files],
    }));
  };

  const removeImage = (type, index) => {
    if (type === "main") {
      setImagePreviews((prev) => ({ ...prev, main: null }));
      setUploadFiles((prev) => ({ ...prev, main: null }));
      setProductData((prev) => ({ ...prev, mainImage: false, imageUrl: "" }));
      setErrors((prev) => ({ ...prev, mainImage: "Ảnh chính là bắt buộc" }));
    } else {
      setImagePreviews((prev) => ({
        ...prev,
        additional: prev.additional.filter((_, i) => i !== index),
      }));
      setUploadFiles((prev) => ({
        ...prev,
        additional: prev.additional.filter((_, i) => i !== index),
      }));
      setProductData((prev) => ({
        ...prev,
        notMainImages: prev.notMainImages.filter((_, i) => i !== index),
      }));
    }
  };

  const uploadImage = async (file) => {
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!productData.name.trim()) {
      newErrors.name = "Tên sản phẩm là bắt buộc";
      isValid = false;
    }

    if (!imagePreviews.main && !productData.imageUrl) {
      newErrors.mainImage = "Ảnh chính là bắt buộc";
      isValid = false;
    }

    if (selectedCategoryIds.length === 0) {
      newErrors.categories = "Phải chọn ít nhất một danh mục";
      isValid = false;
    }

    const detailErrors = productData.productDetails?.map((detail, index) => {
      const errors = {};
      if (!detail.code.trim()) {
        errors.code = "Mã code là bắt buộc";
        isValid = false;
      } else if (detail.code.length > 50) {
        errors.code = "Mã code không được vượt quá 50 ký tự";
        isValid = false;
      }
      if (!detail.unitId) {
        errors.unitId = "Đơn vị là bắt buộc";
        isValid = false;
      }
      if (!detail.price || isNaN(parseFloat(detail.price)) || parseFloat(detail.price) <= 0) {
        errors.price = "Giá bán phải lớn hơn 0";
        isValid = false;
      }
      if (
        !detail.conversionRate ||
        isNaN(parseInt(detail.conversionRate)) ||
        parseInt(detail.conversionRate) < 1
      ) {
        errors.conversionRate = "Tỷ lệ quy đổi phải lớn hơn hoặc bằng 1";
        isValid = false;
      }
      return errors;
    });

    const codes = productData.productDetails.map((d) => d.code.trim()).filter((c) => c);
    if (new Set(codes).size !== codes.length) {
      Swal.fire("Lỗi", "Mã code không được trùng lặp", "warning");
      isValid = false;
    }

    if (productData.productDetails.length === 0) {
      Swal.fire("Lỗi", "Phải có ít nhất một đơn vị bán", "warning");
      isValid = false;
    }

    setErrors({ ...newErrors, productDetails: detailErrors });
    if (!isValid) {
      Swal.fire("Lỗi", "Vui lòng kiểm tra và điền đầy đủ các trường bắt buộc", "error");
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting || !validateForm()) return;

    const result = await Swal.fire({
      title: "Xác nhận",
      text: "Bạn có chắc chắn muốn cập nhật sản phẩm này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có",
      cancelButtonText: "Không",
    });

    if (!result.isConfirmed) return;

    setIsSubmitting(true);

    try {
      let mainImageUrl = productData.imageUrl;
      if (uploadFiles.main) {
        mainImageUrl = await uploadImage(uploadFiles.main);
      }

      const additionalImageUrls = [...productData.notMainImages];
      if (uploadFiles.additional.length > 0) {
        const newAdditionalUrls = await Promise.all(
          uploadFiles.additional.map((file) => uploadImage(file))
        );
        const existingFirebaseUrls = additionalImageUrls.filter(
          (url) => !previewUrls.includes(url)
        );
        additionalImageUrls.splice(
          0,
          additionalImageUrls.length,
          ...existingFirebaseUrls,
          ...newAdditionalUrls
        );
      }

      const updateData = {
        name: productData.name.trim(),
        description: productData.description.trim() || null,
        weight: productData.weight ? parseFloat(productData.weight) : null,
        quantity: productData.quantity ? parseInt(productData.quantity) : 0,
        status: "ACTIVE",
        productDetails: productData.productDetails.map((detail) => ({
          id: detail.id,
          code: detail.code.trim() || null,
          unitId: parseInt(detail.unitId),
          conversionRate: parseInt(detail.conversionRate) || 1,
          price: parseFloat(detail.price).toFixed(2),
        })),
        mainImage: !!mainImageUrl,
        imageUrl: mainImageUrl || null,
        notMainImages: additionalImageUrls,
        categoryIds: selectedCategoryIds, // Thêm danh sách categoryIds
      };

      await productService.updateProduct(id, updateData);

      Swal.fire({
        title: "Thành công",
        text: "Cập nhật sản phẩm thành công.",
        icon: "success",
      }).then(() => navigate("/admin/products"));
    } catch (error) {
      Swal.fire({
        title: "Lỗi",
        text: error.response?.data?.message || "Đã có lỗi xảy ra.",
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="right-content w-100">
      <form className="form" onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-12">
            <div className="card p-3 mt-0">
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-outline-secondary btn-sm rounded-circle me-2 d-flex align-items-center justify-content-center"
                  style={{ width: "32px", height: "32px" }}
                  onClick={() => navigate("/admin/products")}
                  type="button"
                >
                  <FaArrowLeft size={16} />
                </button>
                <h4 className="mb-0">Cập nhật sản phẩm</h4>
              </div>
            </div>
          </div>

          <div className="col-md-12">
            <div className="card p-3 mt-0">
              <h5 className="mb-4">Thông tin cơ bản</h5>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <h6>
                      Tên sản phẩm <span className="text-danger">*</span>
                    </h6>
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
                      type="text"
                      name="weight"
                      value={productData.weight}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*\.?\d*$/.test(value) || value === "") {
                          handleInputChange(e);
                        }
                      }}
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder="Nhập trọng lượng"
                    />
                  </div>
                  <div className="form-group">
                    <h6>Số lượng</h6>
                    <input
                      type="text"
                      name="quantity"
                      value={productData.quantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value) || value === "") {
                          handleInputChange(e);
                        }
                      }}
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder="Nhập số lượng"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Thêm phần chọn danh mục */}
          <div className="col-md-12">
            <div className="card p-4 mt-0">
              <h5 className="mb-4">Danh mục <span className="text-danger">*</span></h5>
              <FormGroup>
                <div className="row">
                  {categories.map((category) => (
                    <div key={category.id} className="col-md-4">
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedCategoryIds.includes(category.id)}
                            onChange={() => handleCategoryChange(category.id)}
                            name={category.name}
                          />
                        }
                        label={category.name}
                      />
                    </div>
                  ))}
                </div>
              </FormGroup>
              {errors.categories && <p className="text-danger small">{errors.categories}</p>}
            </div>
          </div>

          <div className="col-md-12">
            <div className="card p-4 mt-0">
              <h5 className="mb-4">
                Đơn vị bán <span className="text-danger">*</span>
              </h5>
              {productData.productDetails.map((detail, index) => (
                <div key={index} className="row mb-3 align-items-center">
                  <div className="col-md-3">
                    <div className="form-group">
                      <h6>
                        Mã code <span className="text-danger">*</span>
                      </h6>
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
                      <h6>
                        Đơn vị <span className="text-danger">*</span>
                      </h6>
                      <FormControl fullWidth>
                        <Select
                          name="unitId"
                          value={detail.unitId}
                          onChange={(e) => handleDetailChange(index, e)}
                          required
                        >
                          {units.map((unit) => (
                            <MenuItem key={unit.id} value={unit.id}>
                              {unit.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {errors.productDetails?.[index]?.unitId && (
                        <p className="text-danger small">{errors.productDetails[index].unitId}</p>
                      )}
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="form-group">
                      <h6>
                        Tỷ lệ quy đổi <span className="text-danger">*</span>
                      </h6>
                      <input
                        type="text"
                        name="conversionRate"
                        value={detail.conversionRate}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*$/.test(value) || value === "") {
                            handleDetailChange(index, e);
                          }
                        }}
                        onWheel={(e) => e.currentTarget.blur()}
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
                      <h6>
                        Giá bán <span className="text-danger">*</span>
                      </h6>
                      <input
                        type="text"
                        name="price"
                        value={detail.price}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (/^\d*\.?\d*$/.test(value) || value === "") {
                            handleDetailChange(index, e);
                          }
                        }}
                        onWheel={(e) => e.currentTarget.blur()}
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
                    style={{ maxWidth: "200px" }}
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
                      <h6 className="m-0">
                        Ảnh chính <span className="text-danger">*</span>
                      </h6>
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
                                ref={fileInputRef}
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
                    {errors.mainImage && (
                      <p className="text-danger small">{errors.mainImage}</p>
                    )}
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
                                  aspectRatio: "1/1",
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
                                backgroundColor: "rgba(108, 117, 125, 0.05)",
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
                    disabled={isSubmitting || units.length === 0 || categories.length === 0}
                    startIcon={<FaCloudUploadAlt />}
                    style={{ padding: "8px 24px" }}
                  >
                    {isSubmitting ? "Đang xử lý..." : "Cập nhật sản phẩm"}
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

export default ProductUpdate;