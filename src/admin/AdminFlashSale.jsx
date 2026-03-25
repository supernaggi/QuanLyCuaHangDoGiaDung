import { useEffect, useMemo, useState } from "react";
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

function toLocalInputValue(isoOrStr) {
  if (!isoOrStr) return "";
  const d = new Date(isoOrStr);
  if (Number.isNaN(d.getTime())) return isoOrStr;
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function AdminFlashSale() {
  const [version, setVersion] = useState(0);
  const flashSaleProducts = useMemo(
    () => getJson(KEYS.flashSaleProducts, []),
    [version]
  );
  const [editIndex, setEditIndex] = useState("");
  const [form, setForm] = useState({
    name: "",
    originalPrice: "",
    discountPercent: "",
    discountedPrice: "",
    description: "",
    category: "Bếp gas",
    saleEndTime: "",
  });
  const [file, setFile] = useState(null);

  const persist = (next) => {
    setJson(KEYS.flashSaleProducts, next);
    setVersion((v) => v + 1);
  };

  const updateDiscounted = (priceStr, pctStr) => {
    const price = parseFloat(priceStr) || 0;
    const pct = parseFloat(pctStr) || 0;
    const discounted = price - (price * pct) / 100;
    setForm((f) => ({ ...f, discountedPrice: discounted.toFixed(2) }));
  };

  useEffect(() => {
    updateDiscounted(form.originalPrice, form.discountPercent);
  }, [form.originalPrice, form.discountPercent]);

  const resetForm = () => {
    setEditIndex("");
    setForm({
      name: "",
      originalPrice: "",
      discountPercent: "",
      discountedPrice: "",
      description: "",
      category: "Bếp gas",
      saleEndTime: "",
    });
    setFile(null);
  };

  const save = () => {
    const name = form.name.trim();
    const originalPrice = parseFloat(form.originalPrice);
    const discountPercent = parseFloat(form.discountPercent);
    const saleEndTime = form.saleEndTime;
    const description = form.description.trim();
    const category = form.category;
    if (
      !name ||
      Number.isNaN(originalPrice) ||
      Number.isNaN(discountPercent) ||
      !saleEndTime
    ) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    const discountedPrice =
      originalPrice - (originalPrice * discountPercent) / 100;
    const list = getJson(KEYS.flashSaleProducts, []);

    const finish = (image) => {
      if (editIndex !== "") {
        const idx = parseInt(editIndex, 10);
        const copy = [...list];
        const product = { ...copy[idx] };
        Object.assign(product, {
          name,
          originalPrice,
          discountPercent,
          discountedPrice,
          saleEndTime,
          description,
          category,
        });
        if (image) product.image = image;
        copy[idx] = product;
        persist(copy);
      } else {
        if (!image) {
          alert("Vui lòng tải lên ảnh!");
          return;
        }
        persist([
          ...list,
          {
            name,
            originalPrice,
            discountPercent,
            discountedPrice,
            saleEndTime,
            description,
            category,
            image,
          },
        ]);
      }
      resetForm();
    };

    if (editIndex !== "") {
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => finish(e.target.result);
        reader.readAsDataURL(file);
      } else {
        finish(null);
      }
    } else {
      if (!file) {
        alert("Vui lòng tải lên ảnh!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => finish(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const edit = (index) => {
    const p = flashSaleProducts[index];
    setEditIndex(String(index));
    setForm({
      name: p.name,
      originalPrice: String(p.originalPrice),
      discountPercent: String(p.discountPercent),
      discountedPrice: String(p.discountedPrice),
      description: p.description || "",
      category: p.category || "Bếp gas",
      saleEndTime: toLocalInputValue(p.saleEndTime),
    });
    setFile(null);
  };

  const del = (index) => {
    if (!confirm("Xóa sản phẩm này?")) return;
    persist(flashSaleProducts.filter((_, i) => i !== index));
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
      <h2 style={{ color: "#0a8dd9", marginBottom: "20px" }}>Flash Sale</h2>
      <div
        style={{
          overflowX: "auto",
          maxHeight: "400px",
          border: "1px solid #ddd",
          borderRadius: "6px",
          marginBottom: "30px",
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
              <th style={{ padding: "12px", textAlign: "left" }}>Giá gốc</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Giảm giá</th>
              <th style={{ padding: "12px", textAlign: "left" }}>
                Giá sau giảm
              </th>
              <th style={{ padding: "12px", textAlign: "left" }}>Kết thúc</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {flashSaleProducts.map((product, index) => (
              <tr
                key={product.name + index}
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
                  ₫{parseInt(product.originalPrice, 10).toLocaleString()}
                </td>
                <td style={{ padding: "12px" }}>{product.discountPercent}%</td>
                <td style={{ padding: "12px" }}>
                  ₫{parseInt(product.discountedPrice, 10).toLocaleString()}
                </td>
                <td style={{ padding: "12px", fontSize: "12px" }}>
                  {new Date(product.saleEndTime).toLocaleString("vi-VN")}
                </td>
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
                    onClick={() => edit(index)}
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
                    onClick={() => del(index)}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div
        style={{
          background: "#f9f9f9",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ color: "#0a8dd9", marginBottom: "15px" }}>
          Thêm/Sửa Flash Sale
        </h3>
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
            placeholder="Giá gốc"
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
            value={form.originalPrice}
            onChange={(e) =>
              setForm((f) => ({ ...f, originalPrice: e.target.value }))
            }
          />
          <input
            type="number"
            placeholder="Giảm giá (%)"
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
            value={form.discountPercent}
            onChange={(e) =>
              setForm((f) => ({ ...f, discountPercent: e.target.value }))
            }
          />
          <input
            type="number"
            placeholder="Giá sau giảm"
            readOnly
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              background: "#f5f5f5",
            }}
            value={form.discountedPrice}
          />
          <textarea
            placeholder="Mô tả sản phẩm"
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
              minHeight: "80px",
            }}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
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
          <input
            type="datetime-local"
            style={{
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px",
            }}
            value={form.saleEndTime}
            onChange={(e) =>
              setForm((f) => ({ ...f, saleEndTime: e.target.value }))
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
            onClick={save}
          >
            Lưu sản phẩm
          </button>
        </div>
      </div>
    </div>
  );
}
