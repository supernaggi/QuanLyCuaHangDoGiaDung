import { useMemo, useState } from "react";
import { KEYS, getJson, setJson } from "../lib/storage";

const CATEGORIES = [
  "Bếp gas",
  "Bếp từ",
  "Bếp công nghiệp",
  "Máy hút mùi",
  "Nồi cơm điện",
  "Ấm siêu tốc",
  "Xoong chảo",
  "Phụ tùng",
  "Gas",
];

export default function AdminProducts() {
  const [version, setVersion] = useState(0);
  const products = useMemo(() => getJson(KEYS.products, []), [version]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [editIndex, setEditIndex] = useState("");
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "Bếp gas",
    description: "",
  });
  const [file, setFile] = useState(null);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (catFilter === "all" || p.category === catFilter)
  );

  const persist = (next) => {
    setJson(KEYS.products, next);
    setVersion((v) => v + 1);
  };

  const resetForm = () => {
    setEditIndex("");
    setForm({
      name: "",
      price: "",
      category: "Bếp gas",
      description: "",
    });
    setFile(null);
  };

  const saveProduct = () => {
    const name = form.name.trim();
    const price = parseInt(form.price, 10);
    const category = form.category;
    const description = form.description.trim();
    if (!name || Number.isNaN(price) || price <= 0) {
      alert("Vui lòng nhập đầy đủ thông tin hợp lệ!");
      return;
    }

    const applyImage = (imageDataUrl, list) => {
      if (editIndex !== "") {
        const idx = parseInt(editIndex, 10);
        const copy = [...list];
        const product = { ...copy[idx] };
        product.name = name;
        product.price = price;
        product.category = category;
        product.description = description;
        if (imageDataUrl) product.image = imageDataUrl;
        copy[idx] = product;
        persist(copy);
      } else {
        if (!imageDataUrl) {
          alert("Vui lòng tải lên ảnh!");
          return;
        }
        persist([
          ...list,
          { name, price, category, description, image: imageDataUrl },
        ]);
      }
      resetForm();
    };

    const list = getJson(KEYS.products, []);
    if (editIndex !== "") {
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => applyImage(e.target.result, list);
        reader.readAsDataURL(file);
      } else {
        applyImage(null, list);
      }
    } else {
      if (!file) {
        alert("Vui lòng tải lên ảnh!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => applyImage(e.target.result, list);
      reader.readAsDataURL(file);
    }
  };

  const editRow = (index) => {
    const p = products[index];
    setEditIndex(String(index));
    setForm({
      name: p.name,
      price: String(p.price),
      category: p.category,
      description: p.description || "",
    });
    setFile(null);
  };

  const deleteRow = (index) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    const copy = products.filter((_, i) => i !== index);
    persist(copy);
  };

  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ color: "#0a8dd9", marginBottom: "20px" }}>
        Quản lý Sản phẩm
      </h2>
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          style={{
            flex: 1,
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "6px",
          }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          style={{
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "6px",
          }}
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
        >
          <option value="all">Tất cả danh mục</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div
        style={{
          overflowX: "auto",
          maxHeight: "400px",
          border: "1px solid #ddd",
          borderRadius: "6px",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "#f5f7fa",
                borderBottom: "2px solid #ddd",
              }}
            >
              <th style={{ padding: "12px", textAlign: "left" }}>Ảnh</th>
              <th style={{ padding: "12px", textAlign: "left" }}>
                Tên sản phẩm
              </th>
              <th style={{ padding: "12px", textAlign: "left" }}>Giá</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Loại</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => {
              const realIndex = products.indexOf(product);
              return (
                <tr
                  key={product.name + realIndex}
                  style={{ borderBottom: "1px solid #eee" }}
                >
                  <td style={{ padding: "12px" }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "6px",
                        objectFit: "cover",
                      }}
                    />
                  </td>
                  <td style={{ padding: "12px" }}>{product.name}</td>
                  <td style={{ padding: "12px" }}>
                    ₫{parseInt(product.price, 10).toLocaleString()}
                  </td>
                  <td style={{ padding: "12px" }}>{product.category}</td>
                  <td style={{ padding: "12px" }}>
                    <button
                      type="button"
                      style={{
                        background: "#2196F3",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginRight: "5px",
                      }}
                      onClick={() => editRow(realIndex)}
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      style={{
                        background: "#f44336",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => deleteRow(realIndex)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div
        style={{
          marginTop: "30px",
          background: "#f9f9f9",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ color: "#0a8dd9", marginBottom: "15px" }}>
          Thêm/Sửa sản phẩm
        </h3>
        <input type="hidden" value={editIndex} readOnly />
        <div style={{ display: "grid", gap: "10px" }}>
          <input
            placeholder="Tên sản phẩm"
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            type="number"
            placeholder="Giá tiền"
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
            value={form.price}
            onChange={(e) =>
              setForm((f) => ({ ...f, price: e.target.value }))
            }
          />
          <select
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
            value={form.category}
            onChange={(e) =>
              setForm((f) => ({ ...f, category: e.target.value }))
            }
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <textarea
            placeholder="Mô tả sản phẩm"
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              minHeight: "100px",
            }}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
          <input
            type="file"
            accept="image/*"
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <button
            type="button"
            style={{
              padding: "12px",
              background: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
            }}
            onClick={saveProduct}
          >
            Lưu sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
}
