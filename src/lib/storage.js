const KEYS = {
  products: "products",
  accounts: "accounts",
  currentUser: "currentUser",
  carts: "carts",
  orders: "orders",
  flashSaleProducts: "flashSaleProducts",
  reviews: "reviews",
  selectedProduct: "selectedProduct",
  selectedProducts: "selectedProducts",
  productToReview: "productToReview",
};

export function getJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null || raw === "") return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export { KEYS };
