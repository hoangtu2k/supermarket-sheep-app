import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, TextField, IconButton, FormGroup, FormControl, Select, FormControlLabel, Checkbox, MenuItem, CircularProgress } from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { FaArrowLeft, FaCloudUploadAlt, FaPencilAlt, FaPlus, FaSync } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import Swal from "sweetalert2";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../services/firebase";
import { productService } from "../../../services/productService";
import axios from "axios";
import debounce from "lodash.debounce";

const ProductUpload = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [newAttribute, setNewAttribute] = useState("");
  const [attributeTypeIndex, setAttributeTypeIndex] = useState(0);
  const [isCheckingSKU, setIsCheckingSKU] = useState(false);
  const [checkingBarcodes, setCheckingBarcodes] = useState({}); // Track barcode checks

  const [productData, setProductData] = useState({
    code: "",
    name: "",
    description: "",
    weight: "",
    quantity: 0,
    productDetails: [
      {
        barCode: "",
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

  const attributeTypes = [
    { label: "Kích thước", key: "sizes" },
    { label: "Màu sắc", key: "colors" },
    { label: "Chất liệu", key: "materials" },
  ];

  // Debounced SKU validation
  const debouncedCheckSKU = useMemo(
    () =>
      debounce(async (code) => {
        if (!code.trim()) return;
        setIsCheckingSKU(true);
        try {
          const response = await axios.get(`/admin/products/check-sku?code=${encodeURIComponent(code)}`);
          if (response.data.exists) {
            setErrors((prev) => ({ ...prev, code: "Mã SKU đã tồn tại" }));
          } else {
            setErrors((prev) => ({ ...prev, code: "" }));
          }
        } catch (error) {
          console.error("Error checking SKU:", error);
          Swal.fire("Lỗi", "Không thể kiểm tra mã SKU", "error");
        } finally {
          setIsCheckingSKU(false);
        }
      }, 500),
    []
  );

  // Debounced Barcode validation
  const debouncedCheckBarcode = useMemo(
    () =>
      debounce(async (barCode, index) => {
        if (!barCode.trim()) {
          setCheckingBarcodes((prev) => ({ ...prev, [index]: false }));
          return;
        }
        setCheckingBarcodes((prev) => ({ ...prev, [index]: true }));
        try {
          const response = await axios.get(`/admin/products/check-barcode?barCode=${encodeURIComponent(barCode)}`);
          if (response.data.exists) {
            setErrors((prev) => ({
              ...prev,
              productDetails: prev.productDetails?.map((err, i) =>
                i === index ? { ...err, barCode: "Mã Barcode đã tồn tại" } : err
              ) || [],
            }));
          } else {
            setErrors((prev) => ({
              ...prev,
              productDetails: prev.productDetails?.map((err, i) =>
                i === index ? { ...err, barCode: "" } : err
              ) || [],
            }));
          }
        } catch (error) {
          console.error("Error checking barcode:", error);
          Swal.fire("Lỗi", "Không thể kiểm tra mã Barcode", "error");
        } finally {
          setCheckingBarcodes((prev) => ({ ...prev, [index]: false }));
        }
      }, 500),
    []
  );

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await axios.get("/admin/units");
        setUnits(response.data);
        if (response.data.length > 0) {
          setProductData((prev) => ({
            ...prev,
            productDetails: [
              {
                ...prev.productDetails[0],
                unitId: response.data[0].id,
              },
            ],
          }));
        }
      } catch (error) {
        console.error("Error fetching units:", error);
        Swal.fire("Lỗi", "Không thể tải danh sách đơn vị", "error");
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await axios.get("/admin/categories");
        setCategories(response.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        Swal.fire("Lỗi", "Không thể tải danh sách danh mục", "error");
      }
    };

    fetchUnits();
    fetchCategories();

    return () => {
      debouncedCheckSKU.cancel();
      debouncedCheckBarcode.cancel();
    };
  }, [debouncedCheckSKU, debouncedCheckBarcode]);

  const handleCategoryChange = useCallback((categoryId) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
    setErrors((prev) => ({ ...prev, categories: "" }));
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      if (name === "weight" && !/^\d*\.?\d*$/.test(value) && value !== "") return;
      if (name === "quantity" && !/^\d*$/.test(value) && value !== "") return;
      setProductData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
      if (name === "code" && value.trim()) {
        debouncedCheckSKU(value);
      } else if (name === "code") {
        setErrors((prev) => ({ ...prev, code: "" }));
      }
    },
    [debouncedCheckSKU]
  );

  const handleDetailChange = useCallback(
    (index, e) => {
      const { name, value } = e.target;
      if (name === "conversionRate" && !/^\d*$/.test(value) && value !== "") return;
      if (name === "price" && !/^\d*\.?\d*$/.test(value) && value !== "") return;
      setProductData((prev) => {
        const newDetails = [...prev.productDetails];
        newDetails[index] = { ...newDetails[index], [name]: value };
        return { ...prev, productDetails: newDetails };
      });
      setErrors((prev) => ({
        ...prev,
        productDetails:
          prev.productDetails?.map((err, i) => (i === index ? { ...err, [name]: "" } : err)) || [],
      }));
      if (name === "barCode" && value.trim()) {
        debouncedCheckBarcode(value, index);
      } else if (name === "barCode") {
        setErrors((prev) => ({
          ...prev,
          productDetails:
            prev.productDetails?.map((err, i) => (i === index ? { ...err, barCode: "" } : err)) || [],
        }));
      }
    },
    [debouncedCheckBarcode]
  );

  const addProductDetail = useCallback(() => {
    const lastDetail = productData.productDetails[productData.productDetails.length - 1];
    if (
      !lastDetail.barCode.trim() ||
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
        { barCode: "", unitId: units.length > 0 ? units[0].id : "", conversionRate: 1, price: "" },
      ],
    }));
    setErrors((prev) => ({ ...prev, productDetails: [...(prev.productDetails || []), {}] }));
  }, [productData.productDetails, units]);

  const removeProductDetail = useCallback((index) => {
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
    setCheckingBarcodes((prev) => {
      const newChecking = { ...prev };
      delete newChecking[index];
      return newChecking;
    });
  }, [productData.productDetails]);

  const handleMainImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setImagePreviews((prev) => ({ ...prev, main: previewUrl }));
    setUploadFiles((prev) => ({ ...prev, main: file }));
    setProductData((prev) => ({ ...prev, mainImage: true }));
    setErrors((prev) => ({ ...prev, mainImage: "" }));
  }, []);

  const handleAdditionalImagesChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (!files.length || files.length + uploadFiles.additional.length > 5) {
      Swal.fire("Lỗi", "Tối đa 5 ảnh phụ", "warning");
      return;
    }
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => ({
      ...prev,
      additional: [...prev.additional, ...newPreviews],
    }));
    setUploadFiles((prev) => ({
      ...prev,
      additional: [...prev.additional, ...files],
    }));
  }, [uploadFiles.additional]);

  const removeImage = useCallback((type, index) => {
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
  }, []);

  const uploadImage = async (file) => {
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleAddAttribute = useCallback(() => {
    if (!newAttribute.trim()) {
      Swal.fire("Lỗi", "Vui lòng nhập giá trị thuộc tính", "warning");
      return;
    }
    if (
      attributes.some(
        (attr) => attr.value.toLowerCase() === newAttribute.trim().toLowerCase() && attr.key === attributeTypes[attributeTypeIndex].key
      )
    ) {
      Swal.fire("Lỗi", "Giá trị thuộc tính đã tồn tại", "warning");
      return;
    }
    if (attributes.length >= attributeTypes.length * 5) {
      Swal.fire("Lỗi", "Đã đạt số lượng thuộc tính tối đa", "warning");
      return;
    }
    const currentType = attributeTypes[attributeTypeIndex];
    setAttributes((prev) => [...prev, { type: currentType.label, value: newAttribute.trim(), key: currentType.key }]);
    setNewAttribute("");
  }, [newAttribute, attributes, attributeTypeIndex]);

  const handleRemoveAttribute = useCallback((index) => {
    setAttributes((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const resetForm = useCallback(() => {
    setProductData({
      code: "",
      name: "",
      description: "",
      weight: "",
      quantity: 0,
      productDetails: [
        {
          barCode: "",
          unitId: units.length > 0 ? units[0].id : "",
          conversionRate: 1,
          price: "",
        },
      ],
      mainImage: false,
      imageUrl: "",
      notMainImages: [],
    });
    setImagePreviews({ main: null, additional: [] });
    setUploadFiles({ main: null, additional: [] });
    setSelectedCategoryIds([]);
    setAttributes([]);
    setNewAttribute("");
    setErrors({});
    setCheckingBarcodes({});
    Swal.fire("Thành công", "Đã đặt lại biểu mẫu", "success");
  }, [units]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    let isValid = true;

    if (!productData.code.trim()) {
      newErrors.code = "Mã SKU là bắt buộc";
      isValid = false;
    } else if (productData.code.length > 50) {
      newErrors.code = "Mã SKU không được vượt quá 50 ký tự";
      isValid = false;
    }

    if (!productData.name.trim()) {
      newErrors.name = "Tên sản phẩm là bắt buộc";
      isValid = false;
    }

    if (!uploadFiles.main && !productData.imageUrl) {
      newErrors.mainImage = "Ảnh chính là bắt buộc";
      isValid = false;
    }

    if (selectedCategoryIds.length === 0) {
      newErrors.categories = "Phải chọn ít nhất một danh mục";
      isValid = false;
    }

    const detailErrors = productData.productDetails.map((detail, index) => {
      const errors = {};
      if (!detail.barCode.trim()) {
        errors.barCode = "Mã barCode là bắt buộc";
        isValid = false;
      } else if (detail.barCode.length > 50) {
        errors.barCode = "Mã barCode không được vượt quá 50 ký tự";
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
      if (!detail.conversionRate || isNaN(parseInt(detail.conversionRate)) || parseInt(detail.conversionRate) < 1) {
        errors.conversionRate = "Tỷ lệ quy đổi phải lớn hơn hoặc bằng 1";
        isValid = false;
      }
      return errors;
    });

    const barCodes = productData.productDetails.map((d) => d.barCode.trim()).filter((c) => c);
    if (new Set(barCodes).size !== barCodes.length) {
      Swal.fire("Lỗi", "Mã Barcode không được trùng lặp", "warning");
      isValid = false;
    }

    if (productData.productDetails.length === 0) {
      Swal.fire("Lỗi", "Phải có ít nhất một đơn vị bán", "warning");
      isValid = false;
    }

    if (errors.code === "Mã SKU đã tồn tại") {
      isValid = false;
    }

    if (errors.productDetails?.some((err) => err.barCode === "Mã Barcode đã tồn tại")) {
      isValid = false;
    }

    setErrors({ ...newErrors, productDetails: detailErrors });
    if (!isValid) {
      Swal.fire("Lỗi", "Vui lòng kiểm tra và điền đầy đủ các trường bắt buộc", "error");
    }
    return isValid;
  }, [productData, uploadFiles, selectedCategoryIds, errors]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (isSubmitting || !validateForm()) return;

      setIsSubmitting(true);
      try {
        const mainImageUrl = uploadFiles.main ? await uploadImage(uploadFiles.main) : productData.imageUrl;
        const additionalUrls = await Promise.all(uploadFiles.additional.map((file) => uploadImage(file)));

        const payload = {
          code: productData.code.trim(),
          name: productData.name.trim(),
          description: productData.description.trim() || null,
          weight: productData.weight ? parseFloat(productData.weight) : null,
          quantity: productData.quantity ? parseInt(productData.quantity) : 0,
          status: "ACTIVE",
          productDetails: productData.productDetails.map((detail) => ({
            barCode: detail.barCode.trim(),
            unitId: parseInt(detail.unitId),
            conversionRate: parseInt(detail.conversionRate) || 1,
            price: parseFloat(detail.price).toFixed(2),
          })),
          mainImage: !!mainImageUrl,
          imageUrl: mainImageUrl,
          notMainImages: additionalUrls,
          categoryIds: selectedCategoryIds,
          sizes: attributes.filter((a) => a.key === "sizes").map((a) => a.value),
          colors: attributes.filter((a) => a.key === "colors").map((a) => a.value),
          materials: attributes.filter((a) => a.key === "materials").map((a) => a.value),
        };

        await productService.createProduct(payload);
        Swal.fire({
          title: "Thành công",
          text: "Sản phẩm đã được thêm thành công",
          icon: "success",
        }).then(() => navigate("/admin/products"));
      } catch (error) {
        console.error("Error:", error);
        Swal.fire({
          title: "Lỗi",
          text: error.response?.data?.message || "Tạo sản phẩm thất bại",
          icon: "error",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, validateForm, productData, uploadFiles, selectedCategoryIds, attributes, navigate]
  );

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
                    <h6>Mã SKU <span className="text-danger">*</span></h6>
                    <input
                      type="text"
                      name="code"
                      value={productData.code}
                      onChange={handleInputChange}
                      placeholder="Nhập mã sản phẩm"
                      required
                      aria-label="Mã SKU sản phẩm"
                    />
                    {errors.code && <p className="text-danger small">{errors.code}</p>}
                  </div>
                  <div className="form-group">
                    <h6>Tên sản phẩm <span className="text-danger">*</span></h6>
                    <input
                      type="text"
                      name="name"
                      value={productData.name}
                      onChange={handleInputChange}
                      placeholder="Nhập tên sản phẩm"
                      required
                      aria-label="Tên sản phẩm"
                    />
                    {errors.name && <p className="text-danger small">{errors.name}</p>}
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="form-group">
                    <h6>Số lượng</h6>
                    <input
                      type="number"
                      name="quantity"
                      value={productData.quantity}
                      onChange={handleInputChange}
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder="Nhập số lượng"
                      min="0"
                      aria-label="Số lượng sản phẩm"
                    />
                  </div>
                  <div className="form-group">
                    <h6>Mô tả</h6>
                    <textarea
                      name="description"
                      value={productData.description}
                      onChange={handleInputChange}
                      rows={5}
                      placeholder="Nhập mô tả sản phẩm"
                      aria-label="Mô tả sản phẩm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-12">
            <div className="card p-3 mt-0">
              <h5 className="mb-4">Vận chuyển</h5>
              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <h6>Trọng lượng (g)</h6>
                    <input
                      type="text"
                      name="weight"
                      value={productData.weight}
                      onChange={handleInputChange}
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder="Nhập trọng lượng"
                      aria-label="Trọng lượng sản phẩm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

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
              <h5 className="mb-4">Đơn vị bán <span className="text-danger">*</span></h5>
              {productData.productDetails.map((detail, index) => (
                <div key={index} className="row mb-3 align-items-center">
                  <div className="col-md-3">
                    <div className="form-group">
                      <h6>
                        Mã Barcode <span className="text-danger">*</span>
                      </h6>
                      <div className="position-relative">
                        <input
                          type="text"
                          name="barCode"
                          value={detail.barCode}
                          onChange={(e) => handleDetailChange(index, e)}
                          placeholder="Nhập mã barCode"
                          required
                        />
                        {checkingBarcodes[index] && (
                          <CircularProgress
                            size={20}
                            style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)" }}
                          />
                        )}
                      </div>
                      {errors.productDetails?.[index]?.barCode && (
                        <p className="text-danger small">{errors.productDetails[index].barCode}</p>
                      )}
                    </div>
                  </div>
                  <div className="col-md-2">
                    <div className="form-group">
                      <h6>Đơn vị <span className="text-danger">*</span></h6>
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
                      <h6>Tỷ lệ quy đổi <span className="text-danger">*</span></h6>
                      <input
                        type="number"
                        name="conversionRate"
                        value={detail.conversionRate}
                        onChange={(e) => handleDetailChange(index, e)}
                        onWheel={(e) => e.currentTarget.blur()}
                        placeholder="Nhập tỷ lệ"
                        min="1"
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
                        type="number"
                        name="price"
                        value={detail.price}
                        onChange={(e) => handleDetailChange(index, e)}
                        onWheel={(e) => e.currentTarget.blur()}
                        placeholder="Nhập giá bán"
                        min="0"
                        step="0.01"
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
              <h5 className="mb-4">Thuộc tính</h5>
              <p className="text-muted">Sản phẩm có thể thuộc tính khác nhau. Ví dụ: kích thước, màu sắc.</p>
              {attributes.map((attr, index) => (
                <div key={index} className="row mb-2 align-items-center border p-2 rounded" style={{ backgroundColor: '#f8f9fa' }}>
                  <div className="col-md-10">
                    <TextField
                      fullWidth
                      label={attr.type}
                      value={attr.value}
                      disabled
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                    />
                  </div>
                  <div className="col-md-2">
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveAttribute(index)}
                      style={{ padding: '8px' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </div>
              ))}
              <div className="row mt-3">
                <div className="col-md-10">
                  <TextField
                    fullWidth
                    select
                    label="Loại thuộc tính"
                    value={attributeTypes[attributeTypeIndex].label}
                    onChange={(e) => {
                      const newIndex = attributeTypes.findIndex(type => type.label === e.target.value);
                      setAttributeTypeIndex(newIndex);
                    }}
                    variant="outlined"
                    disabled={attributes.length >= attributeTypes.length * 5}
                    InputProps={{
                      readOnly: attributes.length >= attributeTypes.length * 5,
                    }}
                  >
                    {attributeTypes.map((type) => (
                      <MenuItem key={type.label} value={type.label}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    label={`Nhập ${attributeTypes[attributeTypeIndex].label.toLowerCase()}`}
                    value={newAttribute}
                    onChange={(e) => setNewAttribute(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') handleAddAttribute();
                    }}
                    variant="outlined"
                    placeholder={`Nhập ${attributeTypes[attributeTypeIndex].label.toLowerCase()} và nhấn Enter`}
                    disabled={attributes.length >= attributeTypes.length * 5}
                    style={{ marginTop: '10px' }}
                  />
                </div>
                <div className="col-md-2">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddAttribute}
                    style={{ padding: '8px 16px', marginTop: '10px' }}
                    disabled={attributes.length >= attributeTypes.length * 5 || !newAttribute.trim()}
                  >
                    Thêm thuộc tính
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
                    disabled={isSubmitting || units.length === 0 || categories.length === 0 || !!errors.code}
                    startIcon={<FaCloudUploadAlt />}
                    style={{ padding: '8px 24px', marginRight: '10px' }}
                    aria-label="Thêm sản phẩm"
                  >
                    {isSubmitting ? 'Đang xử lý...' : 'Thêm sản phẩm'}
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    color="secondary"
                    onClick={resetForm}
                    startIcon={<FaSync />}
                    style={{ padding: '8px 24px' }}
                    aria-label="Đặt lại biểu mẫu"
                  >
                    Đặt lại
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