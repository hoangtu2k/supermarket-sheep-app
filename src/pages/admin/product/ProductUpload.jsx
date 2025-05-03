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
import axios from "../../../services/axiosConfig";

const ProductUpload = () => {

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

  const resetFormFields = () => {
    setCode("");
    setName("");
    setDescription("");
    setPrice("");
    setQuantity(0);
    setWeight("");
    setImages([]);
    setImagePreviews({
      main: [],
      additional: [],
      featured: [],
      secondary: [],
      banner: [],
    });
  };

  const handleSubmitProductAdd = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      let imageUrls = [];

      // Check if there are images to upload
      if (images && images.length > 0) {
        imageUrls = await Promise.all(
          images.map(async (image) => {
            const storageRef = ref(storage, `images/sheepshop/${image.file.name}`);
            let imageUrl;

            try {
              // Check if the image already exists
              imageUrl = await getDownloadURL(storageRef);
              return {
                url: imageUrl,
                mainImage: image.main,
              };
            } catch (error) {
              // If it doesn't exist, upload the image
              await uploadBytes(storageRef, image.file);
              imageUrl = await getDownloadURL(storageRef);
            }

            return {
              url: imageUrl,
              mainImage: image.main,
            };
          })
        );
      }

      // Prepare product data
      const productData = {
        code,
        name,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        weight: parseFloat(weight),
      };

      // Create product
      const response = await productService.createProduct(productData);
      const productId = response.data.id; // Ensure you're accessing the correct property

      // Add product images
      await Promise.all(
        imageUrls.map((image) =>
          axios.post(`/admin/product/image`, {
            productId,
            imageUrl: image.url,
            mainImage: image.mainImage ? 1 : 0, // Convert boolean to 1 or 0
          })
        )
      );

      // Confirmation before adding product
      const result = await Swal.fire({
        title: 'Xác nhận',
        text: "Bạn có chắc chắn muốn thêm sản phẩm này không?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Có',
        cancelButtonText: 'Không'
      });

      // If user doesn't confirm, stop the process
      if (!result.isConfirmed) {
        return;
      }

      resetFormFields();
      navigate('/admin/products'); // Redirect after success
    } catch (error) {
      // Improved error handling
      if (error.response) {
        console.error("Server error:", error.response.data);
        Swal.fire({
          title: 'Lỗi',
          text: error.response.data.message || "Đã có lỗi xảy ra.",
          icon: 'error'
        });
      } else if (error.request) {
        console.error("No response received:", error.request);
        Swal.fire({
          title: 'Lỗi',
          text: "Không nhận được phản hồi từ máy chủ. Vui lòng thử lại.",
          icon: 'error'
        });
      } else {
        console.error("Error:", error.message);
        Swal.fire({
          title: 'Lỗi',
          text: error.message,
          icon: 'error'
        });
      }
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



        <form className="form" onSubmit={handleSubmitProductAdd}>

          <div className="row">
            <div className="col-md-6">
              <div className="card p-3 mt-0">
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
                  <h6>Mô tả</h6>
                  <textarea
                    style={{ height: "105px" }}
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
              <div className="card p-4 pb-4 mt-0">


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
                      <div className="col-md-3 pt-3">
                        {/* Main Image Upload */}
                        {imagePreviews.main.length ? (
                          imagePreviews.main.map((preview, index) => (
                            <div key={index} className="uploadBox">
                              <span
                                className="remove"
                                onClick={() => removeImage("main", index)}
                              >
                                <IoCloseSharp />
                              </span>
                              <div className="box">
                                <LazyLoadImage
                                  alt="Main image"
                                  effect="blur"
                                  className="w-100"
                                  src={preview.url}
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
                            />
                            <div className="info">
                              <FaRegImages />
                              <h5>Main Image Upload</h5>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="col-md-3 pt-3">
                        {/* Additional Images Upload */}
                        {imagePreviews.additional.length ? (
                          imagePreviews.additional.map(
                            (preview, index) => (
                              <div key={index} className="uploadBox">
                                <span
                                  className="remove"
                                  onClick={() =>
                                    removeImage("additional", index)
                                  }
                                >
                                  <IoCloseSharp />
                                </span>
                                <div className="box">
                                  <LazyLoadImage
                                    alt="Additional image"
                                    effect="blur"
                                    className="w-100"
                                    src={preview.url}
                                  />
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <div className="uploadBox">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleAdditionalImagesChange}
                            />
                            <div className="info">
                              <FaRegImages />
                              <h5>Additional Images Upload</h5>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="col-md-3 pt-3">
                        {/* Featured Images Upload */}
                        {imagePreviews.featured.length ? (
                          imagePreviews.featured.map((preview, index) => (
                            <div key={index} className="uploadBox">
                              <span
                                className="remove"
                                onClick={() =>
                                  removeImage("featured", index)
                                }
                              >
                                <IoCloseSharp />
                              </span>
                              <div className="box">
                                <LazyLoadImage
                                  alt="Featured image"
                                  effect="blur"
                                  className="w-100"
                                  src={preview.url}
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
                            />
                            <div className="info">
                              <FaRegImages />
                              <h5>Featured Images Upload</h5>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="col-md-3 pt-3">
                        {/* Featured Images Upload */}
                        {imagePreviews.secondary.length ? (
                          imagePreviews.secondary.map(
                            (preview, index) => (
                              <div key={index} className="uploadBox">
                                <span
                                  className="remove"
                                  onClick={() =>
                                    removeImage("secondary", index)
                                  }
                                >
                                  <IoCloseSharp />
                                </span>
                                <div className="box">
                                  <LazyLoadImage
                                    alt="Secondary image"
                                    effect="blur"
                                    className="w-100"
                                    src={preview.url}
                                  />
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <div className="uploadBox">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={handleSecondaryImagesChange}
                            />
                            <div className="info">
                              <FaRegImages />
                              <h5>Secondary Images Upload</h5>
                            </div>
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
                    <Button type="submit" className="btn-blue btn-lg btn-big"><FaCloudUploadAlt />&nbsp; XUẤT BẢN VÀ XEM</Button>
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

export default ProductUpload;
