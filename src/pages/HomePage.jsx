import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/style_trang_chu.css";
import ShopHeader from "../components/ShopHeader";
import ShopFooter from "../components/ShopFooter";
import FloatingChat from "../components/FloatingChat";
import { KEYS, getJson, setJson } from "../lib/storage";

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function startCountdown(targetDate, setText) {
  function tick() {
    const now = Date.now();
    const distance = targetDate - now;
    if (distance > 0) {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setText(
        `${days} ngày ${hours.toString().padStart(2, "0")} : ${minutes
          .toString()
          .padStart(2, "0")} : ${seconds.toString().padStart(2, "0")}`
      );
    } else {
      setText("Đã kết thúc!");
    }
  }
  tick();
  return setInterval(tick, 1000);
}

export default function HomePage() {
  const navigate = useNavigate();
  const [products] = useState(() => getJson(KEYS.products, []));
  const [searchKeyword, setSearchKeyword] = useState("");
  const [suggestionNames, setSuggestionNames] = useState([]);

  const [countdownText, setCountdownText] = useState("");
  const [flashList, setFlashList] = useState(() => {
    const raw = getJson(KEYS.flashSaleProducts, []);
    const now = Date.now();
    const filtered = raw.filter(
      (p) => new Date(p.saleEndTime).getTime() > now
    );
    if (filtered.length !== raw.length) {
      setJson(KEYS.flashSaleProducts, filtered);
    }
    return filtered;
  });

  const randomPool = useMemo(() => shuffle(products).slice(0, 40), [products]);
  const [limit, setLimit] = useState(10);
  const [showLoadMore, setShowLoadMore] = useState(true);
  const [showLoginMore, setShowLoginMore] = useState(false);

  useEffect(() => {
    const u = getJson(KEYS.currentUser, null);
    if (u) {
      setLimit(40);
      setShowLoadMore(false);
      setShowLoginMore(false);
    }
  }, []);

  const [slideIdx, setSlideIdx] = useState(0);
  const touchStartX = useRef(0);
  const autoRef = useRef(null);

  const resetAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(
      () => setSlideIdx((i) => (i + 1) % 3),
      5000
    );
  }, []);

  useEffect(() => {
    resetAuto();
    return () => clearInterval(autoRef.current);
  }, [resetAuto]);

  useEffect(() => {
    if (flashList.length === 0) return;
    const target = new Date(flashList[0].saleEndTime).getTime();
    const id = startCountdown(target, setCountdownText);
    return () => clearInterval(id);
  }, [flashList]);

  useEffect(() => {
    const id = setInterval(() => {
      const raw = getJson(KEYS.flashSaleProducts, []);
      const now = Date.now();
      const filtered = raw.filter(
        (p) => new Date(p.saleEndTime).getTime() > now
      );
      setJson(KEYS.flashSaleProducts, filtered);
      setFlashList(filtered);
    }, 60000);
    return () => clearInterval(id);
  }, []);

  const onSearchInput = (kw) => {
    setSearchKeyword(kw);
    const all = getJson(KEYS.products, []);
    if (!kw.trim()) {
      setSuggestionNames([]);
      return;
    }
    setSuggestionNames(
      all
        .filter((p) => p.name.toLowerCase().includes(kw.toLowerCase()))
        .map((p) => p.name)
    );
  };

  const submitSearch = () => {
    const kw = searchKeyword.trim();
    if (kw)
      navigate(`/all-product.html?search=${encodeURIComponent(kw)}`);
  };

  const pickSuggestion = (name) => {
    setSearchKeyword(name);
    setSuggestionNames([]);
    navigate(`/all-product.html?search=${encodeURIComponent(name)}`);
  };

  const changeSlide = (dir) => {
    setSlideIdx((i) => (i + dir + 3) % 3);
    resetAuto();
  };

  const visibleBest = randomPool.slice(0, limit);

  const loadMore = () => {
    const next = limit + 10;
    setLimit(next);
    if (next >= randomPool.length) {
      setShowLoadMore(false);
      setShowLoginMore(true);
    }
  };

  const goFlashDetail = (product) => {
    setJson(KEYS.selectedProduct, product);
    navigate("/chitiet.html");
  };

  const goProductDetail = (product) => {
    setJson(KEYS.selectedProduct, product);
    navigate("/chitiet.html");
  };

  return (
    <div style={{ margin: 0, fontFamily: "arial" }}>
      <ShopHeader
        searchKeyword={searchKeyword}
        onSearchInput={onSearchInput}
        onSearchSubmit={submitSearch}
        suggestions={suggestionNames}
        onPickSuggestion={pickSuggestion}
      />

      <div className="midder">
        <div className="content">
          <div
            className="slider"
            onTouchStart={(e) => {
              touchStartX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              const diff =
                touchStartX.current - e.changedTouches[0].clientX;
              if (Math.abs(diff) > 50) {
                changeSlide(diff > 0 ? 1 : -1);
              }
            }}
          >
            <div className="slides">
              <img
                src="/QC1.png"
                className={`slide${slideIdx === 0 ? " active" : ""}`}
                alt=""
              />
              <img
                src="/QC2.png"
                className={`slide${slideIdx === 1 ? " active" : ""}`}
                alt=""
              />
              <img
                src="/QC3.png"
                className={`slide${slideIdx === 2 ? " active" : ""}`}
                alt=""
              />
            </div>
            <div className="dots-container">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  role="button"
                  tabIndex={0}
                  className={`dot${slideIdx === i ? " active" : ""}`}
                  onClick={() => {
                    setSlideIdx(i);
                    resetAuto();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSlideIdx(i);
                      resetAuto();
                    }
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              className="prev"
              onClick={() => changeSlide(-1)}
            >
              &#10094;
            </button>
            <button
              type="button"
              className="next"
              onClick={() => changeSlide(1)}
            >
              &#10095;
            </button>
          </div>
        </div>

        <div className="flash-sale">
          <div className="flash-sale-header">
            <span className="flash-sale-title">Flash Sale</span>
            <div className="flash-sale-timer">
              <span>On Sale Now</span>
              <span>Ending in</span>
              <span className="timer" id="countdown">
                {countdownText}
              </span>
            </div>
            <button
              type="button"
              className="flash-sale-btn"
              onClick={() =>
                navigate(
                  `/all-product.html?search=${encodeURIComponent(
                    searchKeyword.trim()
                  )}`
                )
              }
            >
              SHOP ALL PRODUCTS
            </button>
          </div>
          <div className="flash-sale-products">
            {flashList.map((product) => (
              <div
                key={product.name + product.saleEndTime}
                className="product"
                role="presentation"
                onClick={() => goFlashDetail(product)}
              >
                <img src={product.image} alt={product.name} />
                <p className="product-name">{product.name}</p>
                <p className="product-price">
                  ₫{product.discountedPrice.toLocaleString()}{" "}
                  <span className="old-price">
                    ₫{product.originalPrice.toLocaleString()}
                  </span>
                </p>
                <p className="sale-end-time">
                  Kết thúc:{" "}
                  {new Date(product.saleEndTime).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="best-sellers">
          <div className="best-sellers-header">
            <span className="best-sellers-title">
              Có thể bạn đang tìm kiếm
            </span>
          </div>
          <div className="best-sellers-products">
            {visibleBest.map((product) => (
              <div
                key={product.name}
                className="product"
                role="presentation"
                onClick={() => goProductDetail(product)}
              >
                <img src={product.image} alt={product.name} />
                <p className="product-name">{product.name}</p>
                <p className="product-price">
                  ₫{Number(product.price).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          {showLoadMore ? (
            <button
              type="button"
              id="load-more-btn"
              className="load-more-btn"
              onClick={loadMore}
            >
              LOAD MORE
            </button>
          ) : null}
          {showLoginMore ? (
            <button
              type="button"
              id="login-to-see-more-btn"
              className="login-to-see-more-btn"
              style={{ display: "inline-block" }}
              onClick={() => navigate("/Login.html")}
            >
              ĐĂNG NHẬP ĐỂ XEM THÊM
            </button>
          ) : null}
        </div>
      </div>

      <div className="line" />

      <div className="description">
        <h2>Life & Cooking - Gì cũng có cho căn bếp của bạn</h2>
        <p>
          Life & Cooking là cửa hàng trực tuyến chuyên cung cấp các sản phẩm nhà
          bếp đa dạng, chất lượng và tiện dụng. Từ các loại bếp gas, bếp từ, nồi
          chảo, máy hút mùi đến dụng cụ nấu ăn và thiết bị gia dụng, bạn đều có
          thể dễ dàng tìm thấy tại đây. Chúng tôi không chỉ mang đến sản phẩm, mà
          còn truyền cảm hứng để bạn yêu căn bếp của mình nhiều hơn mỗi ngày.
        </p>
        <p>
          Với phương châm “Nấu ăn là niềm vui, căn bếp là trái tim của ngôi nhà”,
          Life & Cooking cam kết mang lại trải nghiệm mua sắm an toàn, tin cậy và
          thuận tiện. Bạn có thể thoải mái tìm kiếm sản phẩm phù hợp, đọc đánh
          giá, so sánh giá cả và lựa chọn theo nhu cầu. Tất cả đều được thiết kế
          để giúp bạn tiết kiệm thời gian mà vẫn chọn được sản phẩm ưng ý.
        </p>
        <p>
          Tại Life & Cooking, bạn cũng sẽ nhận được nhiều ưu đãi hấp dẫn, chương
          trình khuyến mãi thường xuyên, cùng với dịch vụ chăm sóc khách hàng
          nhiệt tình. Ngoài ra, chúng tôi luôn sẵn sàng hỗ trợ bạn trong việc lựa
          chọn thiết bị phù hợp với không gian bếp và nhu cầu sử dụng.
        </p>
        <h3>
          Dễ dàng mua sắm – thoải mái nấu nướng – yêu bếp mỗi ngày cùng Life &
          Cooking!
        </h3>
      </div>

      <div className="line" />

      <div className="categories">
        <h2>Danh Mục</h2>
        <div className="category-list">
          <div>
            <h3>
              <a href="#">Bếp gas</a>
            </h3>
            <p>
              <a href="#">Bếp gas dương</a> |<a href="#">Bếp gas âm</a> |
              <a href="#">Bếp gas đơn</a>
            </p>
          </div>
          <div>
            <h3>
              <a href="#">Bếp từ</a>
            </h3>
            <p>
              <a href="#">Bếp từ đơn</a> |<a href="#">Bếp từ đôi</a> |
              <a href="#">Bếp từ rẻ</a>
            </p>
          </div>
          <div>
            <h3>
              <a href="#">Bếp gas công nghiệp</a>
            </h3>
            <p>
              <a href="#">Bếp công nghiệp đơn chiếc</a> |
              <a href="#">Bếp công nghiệp 2 chiếc</a>
            </p>
          </div>
        </div>
      </div>

      <ShopFooter />
      <FloatingChat />
    </div>
  );
}
