import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/style_danhgia.css";
import ShopFooter from "../components/ShopFooter";
import { KEYS, getJson, setJson } from "../lib/storage";

export default function DanhGiaPage() {
  const navigate = useNavigate();
  const currentUser = useMemo(() => getJson(KEYS.currentUser, null), []);
  const [hover, setHover] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");

  const starSrc = (i) => {
    const val = i + 1;
    const active = hover || selectedRating;
    return val <= active ? "/star-yellow.png" : "/star-gray.png";
  };

  const submit = () => {
    if (selectedRating === 0) {
      alert("Vui lòng chọn số sao để đánh giá!");
      return;
    }
    if (!comment.trim()) {
      alert("Vui lòng nhập bình luận!");
      return;
    }
    const productToReview = getJson(KEYS.productToReview, null);
    if (!productToReview) {
      alert("Không tìm thấy sản phẩm để đánh giá!");
      return;
    }
    const u = getJson(KEYS.currentUser, null);
    if (!u) {
      alert("Vui lòng đăng nhập để gửi đánh giá!");
      return;
    }
    const reviews = getJson(KEYS.reviews, {});
    reviews[productToReview.name] = reviews[productToReview.name] || [];
    reviews[productToReview.name].push({
      user: u.fullname,
      rating: selectedRating,
      comment: comment.trim(),
    });
    setJson(KEYS.reviews, reviews);
    alert("Đánh giá của bạn đã được gửi!");
    localStorage.removeItem(KEYS.productToReview);
    navigate("/chitiet.html");
  };

  const logout = () => {
    localStorage.removeItem(KEYS.currentUser);
    navigate("/Login.html");
  };

  return (
    <div style={{ margin: 0, fontFamily: "arial" }}>
      <div className="header-shopping">
        <div className="logo-container">
          <Link to="/">
            <img src="/Logo.jpg" alt="Logo" />
          </Link>
          <span className="header-title">ĐÁNH GIÁ</span>
        </div>
        <div id="user-info-container">
          <span id="user-info">
            {currentUser ? currentUser.fullname : "Khách"}
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
          ) : null}
        </div>
      </div>

      <div className="content">
        <h1>Đánh giá chất lượng sản phẩm</h1>
        <div id="review-container">
          <div id="star-rating">
            {[0, 1, 2, 3, 4].map((i) => (
              <img
                key={i}
                className="star"
                data-value={i + 1}
                src={starSrc(i)}
                alt={`${i + 1} sao`}
                role="presentation"
                onMouseEnter={() => setHover(i + 1)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setSelectedRating(i + 1)}
              />
            ))}
          </div>
          <textarea
            id="comment"
            placeholder="Để lại cảm nhận của bạn tại đây..."
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button type="button" id="submit-review-btn" onClick={submit}>
            Bình luận
          </button>
        </div>
      </div>

      <ShopFooter withMap={false} />
    </div>
  );
}
