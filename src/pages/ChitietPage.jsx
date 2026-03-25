import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/style_chitiet.css";
import ShopHeader from "../components/ShopHeader";
import ShopFooter from "../components/ShopFooter";
import { KEYS, getJson, setJson } from "../lib/storage";

function shuffle(arr) {
  return [...arr].sort(() => 0.5 - Math.random());
}

export default function ChitietPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const product = useMemo(
    () => getJson(KEYS.selectedProduct, null),
    [location.key]
  );
  const [qty, setQty] = useState(1);
  const [kw, setKw] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const allProducts = useMemo(() => getJson(KEYS.products, []), []);

  const reviewsMap = getJson(KEYS.reviews, {});
  const productReviews = product ? reviewsMap[product.name] || [] : [];

  const others = useMemo(() => {
    if (!allProducts.length) return [];
    return shuffle([...allProducts]).slice(0, 5);
  }, [allProducts]);

  useEffect(() => {
    setQty(1);
  }, [location.key, product?.name]);

  useEffect(() => {
    if (!product) {
      alert("Không tìm thấy thông tin sản phẩm!");
      navigate("/all-product.html");
    }
  }, [product, navigate]);

  if (!product) return null;

  const price =
    product.discountedPrice || product.originalPrice || product.price;

  const addToCart = () => {
    const currentUser = getJson(KEYS.currentUser, null);
    if (!currentUser) {
      alert("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      return;
    }
    const carts = getJson(KEYS.carts, {});
    const userCart = carts[currentUser.email] || [];
    const existing = userCart.find((item) => item.name === product.name);
    if (existing) existing.quantity += qty;
    else userCart.push({ ...product, quantity: qty });
    carts[currentUser.email] = userCart;
    setJson(KEYS.carts, carts);
    alert("Sản phẩm đã được thêm vào giỏ hàng!");
  };

  const buyNow = () => {
    const currentUser = getJson(KEYS.currentUser, null);
    if (!currentUser) {
      alert("Vui lòng đăng nhập để mua sản phẩm!");
      return;
    }
    setJson(KEYS.selectedProducts, [
      { ...product, quantity: qty, price },
    ]);
    navigate("/Thanh-toan.html");
  };

  const onReview = () => {
    const currentUser = getJson(KEYS.currentUser, null);
    if (!currentUser) {
      alert("Vui lòng đăng nhập để đánh giá sản phẩm!");
      return;
    }
    setJson(KEYS.productToReview, product);
    navigate("/DanhGia.html");
  };

  const onSearchInput = (v) => {
    setKw(v);
    if (!v.trim()) {
      setSuggestions([]);
      return;
    }
    setSuggestions(
      allProducts
        .filter((p) => p.name.toLowerCase().includes(v.toLowerCase()))
        .map((p) => p.name)
    );
  };

  return (
    <div>
      <ShopHeader
        variant="chitiet"
        searchKeyword={kw}
        onSearchInput={onSearchInput}
        onSearchSubmit={() => {
          const t = kw.trim();
          if (t)
            navigate(`/all-product.html?search=${encodeURIComponent(t)}`);
        }}
        suggestions={suggestions}
        onPickSuggestion={(name) => {
          setKw(name);
          setSuggestions([]);
          navigate(`/all-product.html?search=${encodeURIComponent(name)}`);
        }}
      />

      <div className="product-detail-container">
        <div className="product-detail">
          <div className="product-image">
            <img
              id="product-image"
              src={product.image}
              alt={product.name}
            />
          </div>
          <div className="product-info">
            <h1 id="product-name">{product.name}</h1>
            <p id="product-price">
              Giá: ₫{Number(price).toLocaleString()}
            </p>
            <p>
              <strong>Mô tả:</strong>{" "}
              <span id="product-description">
                {product.description || "Không có mô tả cho sản phẩm này."}
              </span>
            </p>
            <div className="quantity">
              <label htmlFor="quantity-input">Số lượng:</label>
              <div className="quantity-controls">
                <button
                  type="button"
                  id="decrease-btn"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                >
                  -
                </button>
                <input
                  type="text"
                  id="quantity-input"
                  value={qty}
                  readOnly
                />
                <button
                  type="button"
                  id="increase-btn"
                  onClick={() => setQty((q) => q + 1)}
                >
                  +
                </button>
              </div>
            </div>
            <div className="buttons">
              <button type="button" id="buy-now-btn" onClick={buyNow}>
                Mua ngay
              </button>
              <button
                type="button"
                id="add-to-cart-btn"
                onClick={addToCart}
              >
                Thêm vào giỏ hàng
              </button>
            </div>
          </div>
        </div>

        <div className="product-reviews">
          <h2>Đánh Giá Sản Phẩm</h2>
          <div id="reviews-container">
            {productReviews.length === 0 ? (
              <p>Chưa có đánh giá nào.</p>
            ) : (
              productReviews.map((review, i) => (
                <div key={i} className="review">
                  <p>
                    <strong>Người dùng:</strong> {review.user}
                  </p>
                  <p>
                    <strong>Đánh giá:</strong>{" "}
                    {"⭐".repeat(review.rating)} ({review.rating} sao)
                  </p>
                  <p>{review.comment}</p>
                </div>
              ))
            )}
          </div>
          <button
            type="button"
            id="add-review-btn"
            className="review-btn"
            onClick={onReview}
          >
            Đánh giá
          </button>
        </div>
      </div>

      <div className="other-products-container">
        <div className="other-products-header">
          <h2>Sản phẩm khác</h2>
          <Link to="/all-product.html" className="view-more-link">
            Xem thêm &gt;&gt;
          </Link>
        </div>
        <div className="other-products" id="other-products">
          {others.map((p) => (
            <div
              key={p.name}
              className="product"
              role="presentation"
              onClick={() => {
                setJson(KEYS.selectedProduct, p);
                navigate("/chitiet.html", { replace: true });
              }}
            >
              <img src={p.image} alt={p.name} />
              <p className="product-name">{p.name}</p>
              <p className="product-price">
                ₫{Number(p.price).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      <ShopFooter withMap />
    </div>
  );
}
