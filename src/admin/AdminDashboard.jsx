import { useMemo } from "react";
import { KEYS, getJson } from "../lib/storage";

export default function AdminDashboard() {
  const { orders, products, users, flash } = useMemo(
    () => ({
      orders: getJson(KEYS.orders, []),
      products: getJson(KEYS.products, []),
      users: getJson(KEYS.accounts, []),
      flash: getJson(KEYS.flashSaleProducts, []),
    }),
    []
  );

  return (
    <>
      <div className="welcome-box">
        <h2>Chào mừng trở lại! 👋</h2>
        <p>
          Đây là bảng điều khiển quản trị. Sử dụng menu bên trái để quản lý các
          chức năng khác nhau của trang web.
        </p>
      </div>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-icon blue">
            <i className="fas fa-receipt" />
          </div>
          <div className="dashboard-card-content">
            <h3>Tổng Đơn Hàng</h3>
            <div className="value">{orders.length}</div>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-icon green">
            <i className="fas fa-box" />
          </div>
          <div className="dashboard-card-content">
            <h3>Tổng Sản Phẩm</h3>
            <div className="value">{products.length}</div>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-icon orange">
            <i className="fas fa-users" />
          </div>
          <div className="dashboard-card-content">
            <h3>Tổng Người Dùng</h3>
            <div className="value">{users.length}</div>
          </div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-icon red">
            <i className="fas fa-bolt" />
          </div>
          <div className="dashboard-card-content">
            <h3>Flash Sale</h3>
            <div className="value">{flash.length}</div>
          </div>
        </div>
      </div>
    </>
  );
}
