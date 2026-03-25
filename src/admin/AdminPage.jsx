import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import "../styles/style_admin_control.css";
import { KEYS, getJson } from "../lib/storage";
import AdminDashboard from "./AdminDashboard";
import AdminProducts from "./AdminProducts";
import AdminUsers from "./AdminUsers";
import AdminFlashSale from "./AdminFlashSale";
import AdminOrders from "./AdminOrders";
import AdminStatistics from "./AdminStatistics";

export default function AdminPage() {
  const user = getJson(KEYS.currentUser, null);
  const [section, setSection] = useState("dashboard");
  const [clock, setClock] = useState(() =>
    new Date().toLocaleString("vi-VN")
  );

  useEffect(() => {
    const id = setInterval(
      () => setClock(new Date().toLocaleString("vi-VN")),
      1000
    );
    return () => clearInterval(id);
  }, []);

  if (!user || user.role !== "admin") {
    return <Navigate to="/Login.html" replace />;
  }

  return (
    <div className="admin-container" style={{ margin: 0, fontFamily: "Arial" }}>
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>
            <i className="fas fa-cogs" /> Quản Trị
          </h2>
          <p>Life & Cooking</p>
        </div>
        <nav className="sidebar-menu">
          {[
            ["dashboard", "fa-home", "Tổng Quan"],
            ["products", "fa-box", "Quản lý Sản phẩm"],
            ["users", "fa-users", "Quản lý Người dùng"],
            ["flashsale", "fa-bolt", "Flash Sale"],
            ["orders", "fa-receipt", "Đơn Hàng Đặt"],
            ["statistics", "fa-chart-bar", "Thống kê"],
          ].map(([id, icon, label]) => (
            <button
              key={id}
              type="button"
              className={`menu-item${section === id ? " active" : ""}`}
              data-section={id}
              onClick={() => setSection(id)}
            >
              <i className={`fas ${icon}`} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <Link to="/Login.html" className="logout-btn">
            <i className="fas fa-sign-out-alt" />
            <span>Đăng xuất</span>
          </Link>
        </div>
      </aside>
      <main className="admin-main">
        <div className="admin-header">
          <h1>Chào mừng, Quản trị viên!</h1>
          <div className="header-info">
            <span id="current-time">{clock}</span>
          </div>
        </div>
        <div id="content-area" className="admin-content">
          {section === "dashboard" ? <AdminDashboard /> : null}
          {section === "products" ? <AdminProducts /> : null}
          {section === "users" ? <AdminUsers /> : null}
          {section === "flashsale" ? <AdminFlashSale /> : null}
          {section === "orders" ? <AdminOrders /> : null}
          {section === "statistics" ? <AdminStatistics /> : null}
        </div>
      </main>
    </div>
  );
}
