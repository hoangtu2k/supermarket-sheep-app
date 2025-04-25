import { useState } from "react";
import { addProductToEntry, confirmEntry } from "../utils/importedGoodsService";

function AddProductToEntry({ entryFormId }) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [importPrice, setImportPrice] = useState("");

  const handleAdd = async () => {
    try {
      await addProductToEntry(entryFormId, productId, quantity, importPrice);
      alert("Đã thêm sản phẩm vào phiếu nhập");
    } catch (error) {
      alert("Lỗi khi thêm sản phẩm");
    }
  };

  const handleConfirm = async () => {
    try {
      await confirmEntry(entryFormId);
      alert("Đã xác nhận nhập kho");
    } catch (error) {
      alert("Lỗi khi xác nhận nhập hàng");
    }
  };

  return (
    <div>
      <input type="text" value={productId} onChange={(e) => setProductId(e.target.value)} placeholder="Product ID" required />
      <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Số lượng" required />
      <input type="number" value={importPrice} onChange={(e) => setImportPrice(e.target.value)} placeholder="Giá nhập" required />
      <button onClick={handleAdd}>Thêm sản phẩm</button>
      <button onClick={handleConfirm}>Xác nhận nhập kho</button>
    </div>
  );
}

export default AddProductToEntry;
