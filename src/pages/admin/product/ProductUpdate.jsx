import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  TextField,
  IconButton,
  FormGroup,
  FormControl,
  Select,
  FormControlLabel,
  Checkbox,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { FaArrowLeft, FaCloudUploadAlt, FaPencilAlt, FaPlus, FaTrash, FaSync } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import Swal from "sweetalert2";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../../services/firebase";
import { productService } from "../../../services/productService";
import axios from "axios";
import debounce from "lodash.debounce";

const ProductUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingSKU, setIsCheckingSKU] = useState(false);
  const [checkingBarcodes, setCheckingBarcodes] = useState({});
  const [errors, setErrors] = useState({});
  const [units, setUnits] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [newAttribute, setNewAttribute] = useState("");
  const [attributeTypeIndex, setAttributeTypeIndex] = useState(0);
  const fileInputRef = useRef(null);
  const initialProductDataRef = useRef(null);

  const [productData, setProductData] = useState({
    code: "",
    name: "",
    description: "",
    weight: "",
    quantity: 0,
    status: "ACTIVE",
    productDetails: [
      { id: null, barCode: "", unitId: "", conversionRate: 1, price: "" },
    ],
    mainImage: false,
    imageUrl: "",
    notMainImages: [],
    sizes: [],
    colors: [],
    materials: [],
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
          const response = await axios.get(`/admin/products/check-sku?code=${encodeURIComponent(code)}&excludeId=${id}`);
          setErrors((prev) => ({
            ...prev,
            code: response.data.exists ? "Mã SKU đã tồn tại" : "",
          }));
        } catch (error) {
          console.error("Error checking SKU:", error);
          Swal.fire("Lỗi", "Không thể kiểm tra mã SKU", "error");
        } finally {
          setIsCheckingSKU(false);
        }
      }, 500),
    [id]
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
          const response = await axios.get(
            `/admin/products/check-barcode?barCode=${encodeURIComponent(barCode)}&excludeProductId=${id}`
          );
          setErrors((prev) => ({
            ...prev,
            productDetails: prev.productDetails?.map((err, i) =>
              i === index ? { ...err, barCode: response.data.exists ? "Mã Barcode đã tồn tại" : "" } : err
            ) || [],
          }));
        } catch (error) {
          console.error("Error checking barcode:", error);
          Swal.fire("Lỗi", "Không thể kiểm tra mã Barcode", "error");
        } finally {
          setCheckingBarcodes((prev) => ({ ...prev, [index]: false }));
        }
      }, 500),
    [id]
  );

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const response = await axios.get("/admin/units");
        setUnits(response.data);
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

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await productService.getProductById(id);
        const product = response.data;

        const fetchedData = {
          code: product.code || "",
          name: product.name || "",
          description: product.description || "",
          weight: product.weight ? product.weight.toString() : "",
          quantity: product.quantity || 0,
          status: product.status || "ACTIVE",
          productDetails: product.productDetails?.length
            ? product.productDetails.map((detail) => ({
              id: detail.id,
              barCode: detail.barCode || "",
              unitId: detail.unitId || "",
              conversionRate: detail.conversionRate || 1,
              price: detail.price ? detail.price.toString() : "",
            }))
            : [{ id: null, barCode: "", unitId: "", conversionRate: 1, price: "" }],
          mainImage: !!product.imageUrl,
          imageUrl: product.imageUrl || "",
          notMainImages: product.notMainImages || [],
          sizes: product.sizes || [],
          colors: product.colors || [],
          materials: product.materials || [],
        };

        setProductData(fetchedData);
        initialProductDataRef.current = fetchedData;

        setImagePreviews({
          main: product.imageUrl || null,
          additional: product.notMainImages || [],
        });

        setAttributes([
          ...product.sizes.map((size) => ({ type: "Kích thước", value: size, key: "sizes" })),
          ...product.colors.map((color) => ({ type: "Màu sắc", value: color, key: "colors" })),
          ...product.materials.map((material) => ({ type: "Chất liệu", value: material, key: "materials" })),
        ]);

        setSelectedCategoryIds(product.categoryIds || []);
      } catch (error) {
        Swal.fire("Lỗi", "Không thể tải sản phẩm", "error");
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
      parseInt(lastDetail.conversionRate) < 1 ||
      errors.productDetails?.[productData.productDetails.length - 1]?.barCode
    ) {
      Swal.fire("Lỗi", "Vui lòng hoàn thành và kiểm tra đơn vị bán trước khi thêm mới", "warning");
      return;
    }
    setProductData((prev) => ({
      ...prev,
      productDetails: [
        ...prev.productDetails,
        { id: null, barCode: "", unitId: units.length > 0 ? units[0].id : "", conversionRate: 1, price: "" },
      ],
    }));
    setErrors((prev) => ({
      ...prev,
      productDetails: [...(prev.productDetails || []), {}],
    }));
  }, [productData.productDetails, units, errors.productDetails]);

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
    setPreviewUrls((prev) => [...prev, previewUrl]);
    setImagePreviews((prev) => ({ ...prev, main: previewUrl }));
    setUploadFiles((prev) => ({ ...prev, main: file }));
    setProductData((prev) => ({ ...prev, mainImage: true }));
    setErrors((prev) => ({ ...prev, mainImage: "" }));
  }, []);

  const handleAdditionalImagesChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    if (!files.length || imagePreviews.additional.length + files.length > 5) {
      if (imagePreviews.additional.length + files.length > 5) {
        Swal.fire("Lỗi", "Tối đa 5 ảnh phụ", "error");
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
  }, [imagePreviews.additional]);

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
    if (initialProductDataRef.current) {
      setProductData(initialProductDataRef.current);
      setImagePreviews({
        main: initialProductDataRef.current.imageUrl || null,
        additional: initialProductDataRef.current.notMainImages || [],
      });
      setUploadFiles({ main: null, additional: [] });
      setSelectedCategoryIds(initialProductDataRef.current.categoryIds || []);
      setAttributes([
        ...(initialProductDataRef.current.sizes || []).map((size) => ({ type: "Kích thước", value: size, key: "sizes" })),
        ...(initialProductDataRef.current.colors || []).map((color) => ({ type: "Màu sắc", value: color, key: "colors" })),
        ...(initialProductDataRef.current.materials || []).map((material) => ({
          type: "Chất liệu",
          value: material,
          key: "materials",
        })),
      ]);
      setNewAttribute("");
      setErrors({});
      setCheckingBarcodes({});
      Swal.fire("Thành công", "Đã đặt lại biểu mẫu", "success");
    }
  }, []);

  const validateForm = useCallback(() => {
    let isValid = true;
    const newErrors = {};

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

    if (!imagePreviews.main && !productData.imageUrl) {
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
        errors.barCode = "Mã Barcode là bắt buộc";
        isValid = false;
      } else if (detail.barCode.length > 50) {
        errors.barCode = "Mã Barcode không được vượt quá 50 ký tự";
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
      Swal.fire("Lỗi", "Mã Barcode không được trùng lặp trong sản phẩm", "warning");
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
  }, [productData, imagePreviews, selectedCategoryIds, errors]);

  const handleSubmit = useCallback(
    async (e) => {
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
          const newAdditionalUrls = await Promise.all(uploadFiles.additional.map((file) => uploadImage(file)));
          const existingFirebaseUrls = additionalImageUrls.filter((url) => !previewUrls.includes(url));
          additionalImageUrls.splice(0, additionalImageUrls.length, ...existingFirebaseUrls, ...newAdditionalUrls);
        }

        const updateData = {
          code: productData.code.trim(),
          name: productData.name.trim(),
          description: productData.description.trim() || null,
          weight: productData.weight ? parseFloat(productData.weight) : null,
          quantity: productData.quantity ? parseInt(productData.quantity) : 0,
          status: productData.status,
          productDetails: productData.productDetails.map((detail) => ({
            id: detail.id,
            barCode: detail.barCode.trim() || null,
            unitId: parseInt(detail.unitId),
            conversionRate: parseInt(detail.conversionRate) || 1,
            price: parseFloat(detail.price).toFixed(2),
          })),
          mainImage: !!mainImageUrl,
          imageUrl: mainImageUrl || null,
          notMainImages: additionalImageUrls,
          categoryIds: selectedCategoryIds,
          sizes: attributes.filter((a) => a.key === "sizes").map((a) => a.value),
          colors: attributes.filter((a) => a.key === "colors").map((a) => a.value),
          materials: attributes.filter((a) => a.key === "materials").map((a) => a.value),
        };

        await productService.updateProduct(id, updateData);
        Swal.fire("Thành công", "Cập nhật sản phẩm thành công", "success").then(() =>
          navigate("/admin/products")
        );
      } catch (error) {
        let errorMessage = error.response?.data?.message || "Cập nhật sản phẩm thất bại";
        if (errorMessage.includes("Mã Barcode")) {
          Swal.fire("Lỗi", errorMessage, "error");
        } else {
          Swal.fire("Lỗi", errorMessage, "error");
        }
        // Update errors state to reflect barcode issues
        if (errorMessage.includes("Mã Barcode")) {
          const barcodeError = errorMessage.match(/'([^']+)'/)?.[1];
          if (barcodeError) {
            setErrors((prev) => ({
              ...prev,
              productDetails: productData.productDetails.map((detail, i) => ({
                ...prev.productDetails?.[i],
                barCode: detail.barCode === barcodeError ? "Mã Barcode đã tồn tại" : prev.productDetails?.[i]?.barCode,
              })),
            }));
          }
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, validateForm, productData, uploadFiles, selectedCategoryIds, attributes, id, navigate, previewUrls]
  );

  const handleDeleteOrReset = useCallback(async () => {
    const action = productData.status === "ACTIVE" ? "xóa" : "kích hoạt lại";
    const confirmation = await Swal.fire({
      title: `Xác nhận ${action} sản phẩm`,
      text: `Bạn có chắc chắn muốn ${action} sản phẩm này không?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có",
      cancelButtonText: "Không",
    });

    if (!confirmation.isConfirmed) return;

    try {
      if (productData.status === "ACTIVE") {
        await productService.deleteProduct(id);
        Swal.fire("Thành công", "Sản phẩm đã được xóa", "success");
      } else {
        await productService.resetProduct(id);
        Swal.fire("Thành công", "Sản phẩm đã được kích hoạt lại", "success");
        setProductData((prev) => ({ ...prev, status: "ACTIVE" }));
      }
      navigate("/admin/products");
    } catch (error) {
      Swal.fire("Lỗi", error.response?.data?.message || `${action} sản phẩm thất bại`, "error");
    }
  }, [productData.status, id, navigate]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <CircularProgress />
        <span className="ms-2">Đang tải sản phẩm...</span>
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
            <div className="card p-3 mt-2">
              <h5 className="mb-4">Thông tin cơ bản</h5>
              <div className="row">
                <div className="col-md-6">
                  <div className="form-group">
                    <h6>
                      Mã SKU <span className="text-danger">*</span>
                    </h6>
                    <div className="position-relative">
                      <input
                        type="text"
                        name="code"
                        value={productData.code}
                        onChange={handleInputChange}
                        placeholder="Nhập mã sản phẩm"
                        required
                        aria-label="Mã SKU sản phẩm"
                      />
                      {isCheckingSKU && (
                        <CircularProgress
                          size={20}
                          style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)" }}
                        />
                      )}
                    </div>
                    {errors.code && <p className="text-danger small">{errors.code}</p>}
                  </div>
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
            <div className="card p-3 mt-2">
              <h5 className="mb-4">Vận chuyển</h5>
              <div className="row">
                <div className="col-md-12">
                  <div className="form-group">
                    <h6>Trọng lượng (kg)</h6>
                    <input
                      type="number"
                      name="weight"
                      value={productData.weight}
                      onChange={handleInputChange}
                      onWheel={(e) => e.currentTarget.blur()}
                      placeholder="Nhập trọng lượng"
                      min="0"
                      step="0.01"
                      aria-label="Trọng lượng sản phẩm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-12">
            <div className="card p-4 mt-2">
              <h5 className="mb-4">
                Danh mục <span className="text-danger">*</span>
              </h5>
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
            <div className="card p-4 mt-2">
              <h5 className="mb-4">
                Đơn vị bán <span className="text-danger">*</span>
              </h5>
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
                          placeholder="Nhập mã barcode"
                          required
                          aria-label={`Mã Barcode ${index + 1}`}
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
                      <h6>
                        Đơn vị <span className="text-danger">*</span>
                      </h6>
                      <FormControl fullWidth>
                        <Select
                          name="unitId"
                          value={detail.unitId}
                          onChange={(e) => handleDetailChange(index, e)}
                          required
                          aria-label={`Đơn vị ${index + 1}`}
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
                        type="number"
                        name="conversionRate"
                        value={detail.conversionRate}
                        onChange={(e) => handleDetailChange(index, e)}
                        onWheel={(e) => e.currentTarget.blur()}
                        placeholder="Nhập tỷ lệ"
                        min="1"
                        required
                        aria-label={`Tỷ lệ quy đổi ${index + 1}`}
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
                        type="number"
                        name="price"
                        value={detail.price}
                        onChange={(e) => handleDetailChange(index, e)}
                        onWheel={(e) => e.currentTarget.blur()}
                        placeholder="Nhập giá bán"
                        min="0"
                        step="0.01"
                        required
                        aria-label={`Giá bán ${index + 1}`}
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
                      aria-label={`Xóa đơn vị bán ${index + 1}`}
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
                    aria-label="Thêm đơn vị bán"
                  >
                    Thêm đơn vị bán
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-12">
            <div className="card p-4 mt-2">
              <h5 className="mb-4">Thuộc tính</h5>
              <p className="text-muted">Sản phẩm có thể có các thuộc tính như kích thước, màu sắc, chất liệu.</p>
              {attributes.map((attr, index) => (
                <div
                  key={index}
                  className="row mb-2 align-items-center border p-2 rounded"
                  style={{ backgroundColor: "#f8f9fa" }}
                >
                  <div className="col-md-10">
                    <TextField
                      fullWidth
                      label={attr.type}
                      value={attr.value}
                      disabled
                      variant="outlined"
                      InputProps={{ readOnly: true }}
                      aria-label={`${attr.type} ${attr.value}`}
                    />
                  </div>
                  <div className="col-md-2">
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveAttribute(index)}
                      style={{ padding: "8px" }}
                      aria-label={`Xóa thuộc tính ${attr.value}`}
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
                      const newIndex = attributeTypes.findIndex((type) => type.label === e.target.value);
                      setAttributeTypeIndex(newIndex);
                    }}
                    variant="outlined"
                    disabled={attributes.length >= attributeTypes.length * 5}
                    aria-label="Chọn loại thuộc tính"
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
                      if (e.key === "Enter") handleAddAttribute();
                    }}
                    variant="outlined"
                    placeholder={`Nhập ${attributeTypes[attributeTypeIndex].label.toLowerCase()} và nhấn Enter`}
                    disabled={attributes.length >= attributeTypes.length * 5}
                    style={{ marginTop: "10px" }}
                    aria-label={`Nhập ${attributeTypes[attributeTypeIndex].label.toLowerCase()}`}
                  />
                </div>
                <div className="col-md-2">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddAttribute}
                    style={{ padding: "8px 16px", marginTop: "10px" }}
                    disabled={attributes.length >= attributeTypes.length * 5 || !newAttribute.trim()}
                    aria-label="Thêm thuộc tính"
                  >
                    Thêm thuộc tính
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-12">
            <div className="card p-4 mt-2">
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
                            alt="Ảnh chính"
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
                                aria-label="Thay đổi ảnh chính"
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
                          aria-label="Tải ảnh chính"
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
                                  border: "2px dashed #ddd",
                                  overflow: "hidden",
                                  aspectRatio: "1/1",
                                }}
                              >
                                <LazyLoadImage
                                  src={preview}
                                  alt={`Ảnh phụ ${index + 1}`}
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
                                  aria-label={`Xóa ảnh phụ ${index + 1}`}
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
                                aria-label="Tải ảnh phụ"
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
                  <div className="d-flex justify-content-center gap-3">
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting || units.length === 0 || categories.length === 0 || !!errors.code ||
                        errors.productDetails?.some((err) => err.barCode === "Mã Barcode đã tồn tại")}
                      startIcon={isSubmitting ? <CircularProgress size={12} /> : <FaCloudUploadAlt />}
                    >
                      {isSubmitting ? "Đang xử lý..." : "Cập nhật sản phẩm"}
                    </Button>
                    <Button
                      type="button"
                      variant="outlined"
                      color="secondary"
                      onClick={resetForm}
                      startIcon={<FaSync />}
                      style={{ padding: "8px 16px" }}
                      aria-label="Đặt lại biểu mẫu"
                    >
                      Đặt lại
                    </Button>
                    <Button
                      variant="contained"
                      color={productData.status === "ACTIVE" ? "error" : "success"}
                      onClick={handleDeleteOrReset}
                      startIcon={productData.status === "ACTIVE" ? <FaTrash /> : <FaPlus />}
                      style={{ padding: "8px 24px" }}
                      disabled={isSubmitting}
                      aria-label={productData.status === "ACTIVE" ? "Xóa sản phẩm" : "Kích hoạt lại sản phẩm"}
                    >
                      {productData.status === "ACTIVE" ? "Xóa" : "Kích hoạt lại"}
                    </Button>
                  </div>
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