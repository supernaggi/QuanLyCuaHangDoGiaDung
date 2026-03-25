import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/style_shopping.css";
import ShopFooter from "../components/ShopFooter";
import { KEYS, getJson, setJson } from "../lib/storage";

function toNumber(v) {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

export default function ShoppingPage() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => getJson(KEYS.currentUser, null), []);
  const flashSaleProducts = useMemo(
    () => getJson(KEYS.flashSaleProducts, []),
    []
  );

  const [rows, setRows] = useState([]);

  const priceForItem = useCallback(
    (item) => {
      const flash = flashSaleProducts.find((p) => p.name === item.name);
      const raw = flash ? flash.discountedPrice : item.price;
      return toNumber(raw);
    },
    [flashSaleProducts]
  );

  const loadCart = useCallback(() => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để xem giỏ hàng!");
      return;
    }
    const carts = getJson(KEYS.carts, {});
    const cart = carts[currentUser.email] || [];
    setRows(
      cart.map((item) => ({
        ...item,
        price: priceForItem(item),
        checked: false,
      }))
    );
  }, [currentUser, priceForItem]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const saveCart = useCallback(
    (nextRows) => {
      if (!currentUser?.email) {
        alert("Vui lòng đăng nhập để lưu giỏ hàng!");
        return;
      }
      const carts = getJson(KEYS.carts, {});
      carts[currentUser.email] = nextRows.map((r) => ({
        name: r.name,
        quantity: toNumber(r.quantity),
        price: r.price,
        image: r.image,
      }));
      setJson(KEYS.carts, carts);
    },
    [currentUser]
  );

  const updateRow = (index, patch) => {
    setRows((prev) => {
      const next = prev.map((r, i) =>
        i === index ? { ...r, ...patch } : r
      );
      saveCart(next);
      return next;
    });
  };

  const removeRow = (index) => {
    setRows((prev) => {
      const next = prev.filter((_, i) => i !== index);
      saveCart(next);
      return next;
    });
  };

  const allChecked = rows.length > 0 && rows.every((r) => r.checked);
  const setAllChecked = (checked) => {
    setRows((prev) => {
      const next = prev.map((r) => ({ ...r, checked }));
      saveCart(next);
      return next;
    });
  };

  const { totalCheckedProducts, totalProducts, totalPrice } = useMemo(() => {
    let tcp = 0;
    let tp = 0;
    let tprice = 0;
    rows.forEach((r) => {
      const q = toNumber(r.quantity);
      if (r.checked) {
        tcp += 1;
        tp += q;
        tprice += q * toNumber(r.price);
      }
    });
    return {
      totalCheckedProducts: tcp,
      totalProducts: tp,
      totalPrice: tprice,
    };
  }, [rows]);

  const logout = () => {
    localStorage.removeItem(KEYS.currentUser);
    navigate("/Shopping.html");
    window.location.reload();
  };

  const buySelected = () => {
    const u = getJson(KEYS.currentUser, null);
    if (!u) {
      alert("Vui lòng đăng nhập trước khi mua hàng");
      navigate("/Login.html");
      return;
    }
    const selectedProducts = [];
    rows.forEach((r) => {
      if (r.checked) {
        const price = toNumber(r.price);
        const quantity = toNumber(r.quantity);
        selectedProducts.push({
          name: r.name,
          price,
          quantity,
          image: r.image,
          totalPrice: price * quantity,
        });
      }
    });
    if (selectedProducts.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm");
      return;
    }
    setJson(KEYS.selectedProducts, selectedProducts);
    navigate("/Thanh-toan.html");
  };

  return (
    <div style={{ margin: 0, fontFamily: "arial" }}>
      <div className="header-shopping">
        <div className="logo-container">
          <Link to="/">
            <img src="/Logo.jpg" alt="Logo" />
          </Link>
          <span className="header-title">GIỎ HÀNG</span>
        </div>
        <div id="user-info-container">
          <span id="user-info">
            {currentUser ? currentUser.fullname : ""}
          </span>
          {currentUser ? (
            <button
              type="button"
              id="logout-btn"
              className="logout-btn"
              style={{ display: "inline-block" }}
              onClick={logout}
            >
              Đăng xuất
            </button>
          ) : (
            <Link to="/Login.html" id="login-link">
              <button type="button" className="login-btn">
                Đăng nhập
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className="shopping-table-container">
        <table className="shopping-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  id="select-all"
                  checked={allChecked}
                  onChange={(e) => setAllChecked(e.target.checked)}
                />
              </th>
              <th>Ảnh</th>
              <th>Sản phẩm</th>
              <th>Đơn Giá</th>
              <th>Số Lượng</th>
              <th>Tổng Tiền</th>
              <th>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.name}-${index}`}>
                <td>
                  <input
                    type="checkbox"
                    className="product-checkbox"
                    checked={row.checked}
                    onChange={(e) =>
                      updateRow(index, { checked: e.target.checked })
                    }
                  />
                </td>
                <td>
                  <img
                    src={row.image || ""}
                    alt={row.name}
                    className="product-image"
                  />
                </td>
                <td>{row.name}</td>
                <td
                  className="price"
                  data-price={row.price}
                >
                  ₫{toNumber(row.price).toLocaleString()}
                </td>
                <td>
                  <button
                    type="button"
                    className="btn-decrease"
                    onClick={() => {
                      const q = Math.max(1, toNumber(row.quantity) - 1);
                      updateRow(index, { quantity: q });
                    }}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    className="quantity-input"
                    value={row.quantity}
                    readOnly
                  />
                  <button
                    type="button"
                    className="btn-increase"
                    onClick={() => {
                      const q = toNumber(row.quantity) + 1;
                      updateRow(index, { quantity: q });
                    }}
                  >
                    +
                  </button>
                </td>
                <td className="total-price">
                  ₫
                  {(toNumber(row.quantity) * toNumber(row.price)).toLocaleString()}
                </td>
                <td>
                  <a
                    href="#"
                    className="cart-delete"
                    style={{ color: "red" }}
                    onClick={(e) => {
                      e.preventDefault();
                      removeRow(index);
                    }}
                  >
                    Xóa
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="shopping-footer">
        <div className="footer-left">
          <input
            type="checkbox"
            id="select-all-footer"
            checked={allChecked}
            onChange={(e) => setAllChecked(e.target.checked)}
          />
          <label htmlFor="select-all-footer">
            Chọn Tất Cả ({totalCheckedProducts})
          </label>
          <span className="delete-all" style={{ color: "red" }}>
            Xóa
          </span>
        </div>
        <div className="footer-right">
          <span>
            Tổng cộng ({totalProducts} Sản phẩm):{" "}
            <strong style={{ color: "red" }}>
              ₫{totalPrice.toLocaleString()}
            </strong>
          </span>
          <button type="button" className="buy-button" onClick={buySelected}>
            Mua Hàng
          </button>
        </div>
      </div>

      <ShopFooter withMap={false} />
    </div>
  );
}
