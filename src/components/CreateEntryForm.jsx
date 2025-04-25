import { useState } from "react";
import { addProductToEntry, confirmEntry } from "../utils/importedGoodsService";

function CreateEntryForm({ onCreated }) {
  const [supplierId, setSupplierId] = useState("");
  const [userId, setUserId] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await createEntryForm(supplierId, userId, note);
      onCreated(data); // callback để truyền lên cha
      alert("Tạo phiếu nhập thành công!");
    } catch (error) {
      alert("Lỗi khi tạo phiếu nhập");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} placeholder="Supplier ID" required />
      <input type="text" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="User ID" required />
      <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ghi chú (tuỳ chọn)" />
      <button type="submit">Tạo Phiếu Nhập</button>
    </form>
  );
}

export default CreateEntryForm;
