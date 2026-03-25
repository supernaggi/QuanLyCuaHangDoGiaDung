import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "../styles/style-allprd.css";
import ShopHeader from "../components/ShopHeader";
import ShopFooter from "../components/ShopFooter";
import { KEYS, getJson, setJson } from "../lib/storage";

export default function AllProductsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchKeyword = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const subcategory = searchParams.get("subcategory") || "";

  const products = useMemo(() => getJson(KEYS.products, []), []);
  const [kw, setKw] = useState(searchKeyword);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    setKw(searchKeyword);
  }, [searchKeyword]);

  const { title, filtered } = useMemo(() => {
    let list = products;
    let pageTitle = "Tất cả sản phẩm";

    if (searchKeyword) {
      pageTitle = `Kết quả tìm kiếm cho: "${searchKeyword}"`;
      list = products.filter((p) =>
        p.name.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    } else if (category && subcategory) {
      pageTitle = `Tất cả sản phẩm > ${category} > ${subcategory}`;
      list = products.filter(
        (p) =>
          (p.category === category ||
            p.category === decodeURIComponent(category)) &&
          (p.subcategory === subcategory ||
            p.subcategory === decodeURIComponent(subcategory))
      );
      if (list.length === 0) {
        list = products.filter(
          (p) =>
            (p.category === category ||
              p.category === decodeURIComponent(category)) &&
            p.name.toLowerCase().includes(subcategory.toLowerCase())
        );
      }
    } else if (category) {
      pageTitle = `Tất cả sản phẩm > ${category}`;
      list = products.filter((p) => p.category === category);
    }

    return { title: pageTitle, filtered: list };
  }, [products, searchKeyword, category, subcategory]);

  const onInput = (v) => {
    setKw(v);
    if (!v.trim()) {
      setSuggestions([]);
      return;
    }
    setSuggestions(
      products
        .filter((p) => p.name.toLowerCase().includes(v.toLowerCase()))
        .map((p) => p.name)
    );
  };

  const applyLocalSearch = () => {
    const t = kw.trim();
    if (t) navigate(`/all-product.html?search=${encodeURIComponent(t)}`);
    else navigate("/all-product.html");
  };

  const pickSuggestion = (name) => {
    setKw(name);
    setSuggestions([]);
    navigate(`/all-product.html?search=${encodeURIComponent(name)}`);
  };

  const openDetail = (product) => {
    setJson(KEYS.selectedProduct, product);
    navigate("/chitiet.html");
  };

  return (
    <div>
      <ShopHeader
        searchKeyword={kw}
        onSearchInput={onInput}
        onSearchSubmit={applyLocalSearch}
        suggestions={suggestions}
        onPickSuggestion={pickSuggestion}
      />

      <div className="main-content">
        <h1 className="all-products-title">{title}</h1>
        <div className="product-grid">
          {filtered.length === 0 ? (
            <p>Không có sản phẩm nào phù hợp với tìm kiếm.</p>
          ) : (
            filtered.map((product) => (
              <div
                key={product.name}
                className="product"
                role="presentation"
                onClick={() => openDetail(product)}
              >
                <img src={product.image} alt={product.name} />
                <p className="product-name">{product.name}</p>
                <p className="product-price">
                  ₫{Number(product.price).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <ShopFooter withMap />
    </div>
  );
}
