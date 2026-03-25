import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import AllProductsPage from "./pages/AllProductsPage";
import ChitietPage from "./pages/ChitietPage";
import ShoppingPage from "./pages/ShoppingPage";
import ThanhToanPage from "./pages/ThanhToanPage";
import ProfilePage from "./pages/ProfilePage";
import DanhGiaPage from "./pages/DanhGiaPage";
import AdminPage from "./admin/AdminPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/Index.html" element={<Navigate to="/" replace />} />

      <Route path="/Login.html" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/all-product.html" element={<AllProductsPage />} />
      <Route path="/all-product" element={<AllProductsPage />} />

      <Route path="/chitiet.html" element={<ChitietPage />} />
      <Route path="/chitiet" element={<ChitietPage />} />

      <Route path="/Shopping.html" element={<ShoppingPage />} />
      <Route path="/gio-hang" element={<ShoppingPage />} />

      <Route path="/Thanh-toan.html" element={<ThanhToanPage />} />
      <Route path="/thanh-toan" element={<ThanhToanPage />} />

      <Route path="/thong-tin-ca-nhan.html" element={<ProfilePage />} />
      <Route path="/thong-tin-ca-nhan" element={<ProfilePage />} />

      <Route path="/DanhGia.html" element={<DanhGiaPage />} />
      <Route path="/danh-gia" element={<DanhGiaPage />} />

      <Route path="/admin-control.html" element={<AdminPage />} />
      <Route path="/admin" element={<AdminPage />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
