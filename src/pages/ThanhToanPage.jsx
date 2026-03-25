import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/style_thanh-toan.css";
import ShopFooter from "../components/ShopFooter";
import { KEYS, getJson, setJson } from "../lib/storage";

const locationData = {
  "Hà Nội": {
    "Quận Ba Đình": ["Phường Cống Vị", "Phường Điện Biên"],
    "Quận Hoàn Kiếm": ["Phường Hàng Bạc", "Phường Hàng Bồ"],
  },
  "Hưng Yên": {
    "Huyện Yên Mỹ": ["Yên Phú", "Yên Hòa"],
    "Huyện Khoái Châu": ["Dạ Trạch", "Đại Hưng"],
  },
};

export default function ThanhToanPage() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => getJson(KEYS.currentUser, null), []);
  const selectedProducts = useMemo(
    () => getJson(KEYS.selectedProducts, []),
    []
  );

  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");

  const districts = province ? Object.keys(locationData[province] || {}) : [];
  const wards =
    province && district
      ? locationData[province]?.[district] || []
      : [];

  useEffect(() => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để tiếp tục!");
      navigate("/Login.html");
    }
  }, [currentUser, navigate]);

  const logout = () => {
    localStorage.removeItem(KEYS.currentUser);
    navigate("/Login.html");
  };

  const placeOrder = () => {
    const u = getJson(KEYS.currentUser, null);
    const items = getJson(KEYS.selectedProducts, []);
    if (!u) {
      alert("Vui lòng đăng nhập để đặt hàng!");
      return;
    }
    if (!province || !district || !ward) {
      alert("Vui lòng chọn đầy đủ địa chỉ giao hàng!");
      return;
    }
    const address = `${ward}, ${district}, ${province}`;
    const orders = getJson(KEYS.orders, []);
    orders.push({
      user: u,
      products: items,
      address,
      timestamp: Date.now(),
    });
    setJson(KEYS.orders, orders);
    alert("Đặt hàng thành công!");
    localStorage.removeItem(KEYS.selectedProducts);
    navigate("/Shopping.html");
  };

  if (!currentUser) return null;

  return (
    <div style={{ margin: 0, fontFamily: "arial" }}>
      <div className="header-shopping">
        <div className="logo-container">
          <Link to="/">
            <img src="/Logo.jpg" alt="Logo" />
          </Link>
          <span className="header-title">THANH TOÁN</span>
        </div>
        <div id="user-info-container">
          <span id="user-info">{currentUser.fullname}</span>
          <button
            type="button"
            id="logout-btn"
            className="logout-btn"
            style={{ display: "inline-block" }}
            onClick={logout}
          >
            Đăng xuất
          </button>
        </div>
      </div>

      <div className="buy-container">
        {selectedProducts.length === 0 ? (
          <p>Không có sản phẩm nào trong đơn hàng.</p>
        ) : (
          <>
            {selectedProducts.map((product) => {
              const price = parseFloat(product.price) || 0;
              return (
                <div key={product.name} className="product-item">
                  <div className="product-image">
                    <img src={product.image} alt={product.name} />
                  </div>
                  <div className="product-details">
                    <h4>{product.name}</h4>
                    <p>Số lượng: {product.quantity}</p>
                    <p>
                      Giá: ₫
                      {(price * product.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
            <div className="address-form">
              <h3>Địa chỉ giao hàng</h3>
              <select
                id="province"
                required
                value={province}
                onChange={(e) => {
                  setProvince(e.target.value);
                  setDistrict("");
                  setWard("");
                }}
              >
                <option value="">Chọn Tỉnh/Thành phố</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Hưng Yên">Hưng Yên</option>
              </select>
              <select
                id="district"
                required
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setWard("");
                }}
              >
                <option value="">Chọn Quận/Huyện</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <select
                id="ward"
                required
                value={ward}
                onChange={(e) => setWard(e.target.value)}
              >
                <option value="">Chọn Phường/Xã</option>
                {wards.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              <button type="button" id="place-order-btn" onClick={placeOrder}>
                Đặt hàng
              </button>
            </div>
          </>
        )}
      </div>

      <ShopFooter withMap={false} />
    </div>
  );
}
