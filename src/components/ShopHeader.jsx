import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { KEYS, getJson } from "../lib/storage";
import { TOP_MENU_ITEMS } from "../constants/menuCategories";

/**
 * @param {'default' | 'chitiet'} variant — chitiet: icon sign-out trên nút profile (theo chitiet.html)
 */
export default function ShopHeader({
  variant = "default",
  searchKeyword = "",
  onSearchInput,
  onSearchSubmit,
  suggestions = [],
  onPickSuggestion,
  showMenu = true,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(() =>
    getJson(KEYS.currentUser, null)
  );

  useEffect(() => {
    setCurrentUser(getJson(KEYS.currentUser, null));
  }, [location.pathname]);

  const goCategory = useCallback(
    (label) => {
      navigate(
        `/all-product.html?category=${encodeURIComponent(label)}`
      );
    },
    [navigate]
  );

  const profileIcon =
    variant === "chitiet" ? "fa-solid fa-sign-out-alt" : "fa-solid fa-user";

  return (
    <div
      className="header"
      style={{
        width: "100%",
        height: "140px",
        backgroundColor: "rgba(0, 162, 231, 255)",
      }}
    >
      <div className="top-header" style={{ width: "80%", height: "70px", margin: "auto" }}>
        <div id="b1">
          <Link to="/">
            <img src="/Logo.jpg" alt="Logo" />
          </Link>
        </div>
        <div id="b2">
          <div className="search-box">
            <input
              className="search-box_input"
              type="text"
              id="search-input"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchKeyword}
              onChange={(e) => onSearchInput?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onSearchSubmit?.();
                }
              }}
            />
            <button
              type="button"
              className="search-box_btn"
              onClick={() => onSearchSubmit?.()}
            >
              <i className="fa-solid fa-magnifying-glass" />
            </button>
            <ul id="suggestions" className="suggestions">
              {suggestions.map((name, i) => (
                <li
                  key={`${name}-${i}`}
                  role="presentation"
                  onClick={() => onPickSuggestion?.(name)}
                >
                  {name}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div id="b3">
          <div className="login-box">
            <div className="user-container">
              <span id="user-info">
                {currentUser ? currentUser.fullname : ""}
              </span>
              {currentUser ? (
                <button
                  type="button"
                  id="logout-btn"
                  className="logout_btn"
                  style={{ display: "block" }}
                  onClick={() => navigate("/thong-tin-ca-nhan.html")}
                >
                  <span>
                    <i className={profileIcon} /> Thông tin cá nhân
                  </span>
                </button>
              ) : null}
            </div>
            {!currentUser ? (
              <Link to="/Login.html" id="login-link">
                <button type="button" className="login_btn">
                  <span>
                    {" "}
                    <i className="fa-solid fa-user" /> Đăng nhập{" "}
                  </span>
                </button>
              </Link>
            ) : null}
          </div>
        </div>
        <div id="b4">
          <div className="Shopping-box">
            <Link to="/Shopping.html">
              <button type="button" className="shopping_btn">
                <span>
                  <i className="fa-solid fa-cart-shopping" /> Giỏ hàng
                </span>
              </button>
            </Link>
          </div>
        </div>
      </div>

      {showMenu ? (
        <div
          className="bot-header"
          style={{ width: "80%", height: "70px", margin: "auto" }}
        >
          <ul className="menu">
            {TOP_MENU_ITEMS.map((item) => (
              <li key={item.className} className={item.className}>
                <button
                  type="button"
                  onClick={() => goCategory(item.label)}
                  style={{
                    color: "white",
                    textDecoration: "none",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    font: "inherit",
                  }}
                >
                  <i style={{ display: "block", textAlign: "center" }}>
                    <img src={item.img} alt="" />
                  </i>
                  <span
                    style={{
                      display: "block",
                      textAlign: "center",
                      marginTop: "-35px",
                    }}
                  >
                    {item.label}
                  </span>
                </button>
                {item.submenu ? (
                  <ul className="submenu">
                    {item.submenu.map((sub) => (
                      <li key={sub}>
                        <a href="#">{sub}</a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
