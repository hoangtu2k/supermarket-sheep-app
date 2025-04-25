import { useState } from "react";
import {
  createEntryForm,
  addProductToEntry,
  confirmEntry,
  fetchEntryFormDetails,
} from "../utils/importedGoodsService";

function EntryManager() {
  const [supplierId, setSupplierId] = useState("");
  const [userId, setUserId] = useState("");
  const [note, setNote] = useState("");
  const [entryForm, setEntryForm] = useState(null);

  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [importPrice, setImportPrice] = useState("");

  const handleCreateForm = async () => {
    try {
      const res = await createEntryForm(supplierId, userId, note);
      setEntryForm(res.data);
      alert("Đã tạo phiếu nhập");
    } catch (err) {
      alert("Lỗi tạo phiếu nhập");
    }
  };

  const handleAddProduct = async () => {
    try {
      await addProductToEntry(entryForm.id, productId, quantity, importPrice);
      alert("Đã thêm sản phẩm");
      setProductId("");
      setQuantity("");
      setImportPrice("");
    } catch (err) {
      alert("Lỗi khi thêm sản phẩm");
    }
  };

  const handleConfirm = async () => {
    try {
      await confirmEntry(entryForm.id);
      alert("Đã xác nhận nhập kho");
    } catch (err) {
      alert("Lỗi xác nhận nhập");
    }
  };

  const handleViewDetails = async () => {
    try {
      const res = await fetchEntryFormDetails(entryForm.id);
      console.log("Chi tiết phiếu:", res.data);
      alert("Xem console.log để xem chi tiết phiếu nhập");
    } catch (err) {
      alert("Không thể lấy thông tin chi tiết");
    }
  };

  return (
    <div className="mt-5">
      <h2>Quản lý nhập hàng</h2>

      {!entryForm && (
        <div>
          <input value={supplierId} onChange={(e) => setSupplierId(e.target.value)} placeholder="Supplier ID" />
          <input value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú" />
          <button onClick={handleCreateForm}>Tạo phiếu nhập</button>
        </div>
      )}

      {entryForm && (
        <>
          <h3>Mã phiếu: {entryForm.entry_form_code}</h3>
          <input value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="Product ID" />
          <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Số lượng" type="number" />
          <input value={importPrice} onChange={(e) => setImportPrice(e.target.value)} placeholder="Giá nhập" type="number" />
          <button onClick={handleAddProduct}>Thêm sản phẩm</button>
          <button onClick={handleConfirm}>Xác nhận nhập kho</button>
          <button onClick={handleViewDetails}>Xem chi tiết</button>
        </>
      )}
    </div>
  );
}

export default EntryManager;
