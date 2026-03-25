import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/style_thong-tin-ca-nhan.css";
import { KEYS, getJson, setJson } from "../lib/storage";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPhoneNumber(phone) {
  return /^[0-9]{10,11}$/.test(phone);
}

const STATUS_LABEL = {
  pending: "Chờ xác nhận",
  shipping: "Chờ giao hàng",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
  refund: "Trả hàng/Hoàn tiền",
};

function norm(str) {
  if (str === undefined || str === null) return "";
  return String(str)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getStatusKey(order) {
  const raw = (order && (order.status || "")).toString();
  const sNorm = norm(raw);
  if (STATUS_LABEL.hasOwnProperty(raw)) return raw;
  for (const k of Object.keys(STATUS_LABEL)) {
    if (norm(k) === sNorm) return k;
  }
  for (const [k, lbl] of Object.entries(STATUS_LABEL)) {
    if (norm(lbl) === sNorm) return k;
  }
  if (sNorm.includes("xac") || sNorm.includes("cho xac")) return "pending";
  if (sNorm.includes("giao")) return "shipping";
  if (sNorm.includes("hoan") || sNorm.includes("hoàn")) return "completed";
  if (sNorm.includes("huy")) return "cancelled";
  if (sNorm.includes("tra") || sNorm.includes("hoan tien")) return "refund";
  return raw || "pending";
}

function orderKey(o) {
  return String(o.id ?? o.timestamp ?? o.createdAt ?? "");
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() =>
    getJson(KEYS.currentUser, null)
  );
  const [tab, setTab] = useState("profile");
  const [orderFilter, setOrderFilter] = useState("all");
  const [ordersVersion, setOrdersVersion] = useState(0);

  useEffect(() => {
    if (!getJson(KEYS.currentUser, null)) {
      navigate("/Login.html");
    }
  }, [navigate]);

  const [profile, setProfile] = useState({
    fullname: "",
    email: "",
    phone: "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [pwForm, setPwForm] = useState({
    old: "",
    new: "",
    confirm: "",
  });
  const [pwErrors, setPwErrors] = useState({});

  useEffect(() => {
    const u = getJson(KEYS.currentUser, null);
    if (u) {
      setCurrentUser(u);
      setProfile({
        fullname: u.fullname || "",
        email: u.email || "",
        phone: u.phone || "",
      });
    }
  }, []);

  const userOrders = useMemo(() => {
    const u = getJson(KEYS.currentUser, null);
    if (!u) return [];
    const ordersAll = getJson(KEYS.orders, []);
    return ordersAll.filter((o) => {
      const email = o.customerEmail || (o.user && o.user.email) || "";
      const phone = o.customerPhone || (o.user && o.user.phone) || "";
      return email === u.email || phone === u.phone;
    });
  }, [currentUser, ordersVersion]);

  const filteredOrders = useMemo(() => {
    if (orderFilter === "all") return userOrders;
    return userOrders.filter((o) => getStatusKey(o) === orderFilter);
  }, [userOrders, orderFilter]);

  const updateOrderStatus = (order, newStatus) => {
    const id = orderKey(order);
    const all = getJson(KEYS.orders, []);
    let idx = all.findIndex((o) => String(o.id) === String(id));
    if (idx === -1) {
      idx = all.findIndex(
        (o) => String(o.timestamp || o.createdAt || o.id) === String(id)
      );
    }
    if (idx !== -1) {
      all[idx].status = newStatus;
      setJson(KEYS.orders, all);
      setOrdersVersion((v) => v + 1);
    }
  };

  const addToCartFromOrder = (items) => {
    const u = getJson(KEYS.currentUser, null);
    if (!u?.email) return;
    const carts = getJson(KEYS.carts, {});
    const userCart = carts[u.email] || [];
    items.forEach((p) => {
      const exist = userCart.find((it) => it.name === p.name);
      if (exist) exist.quantity += p.quantity || 1;
      else userCart.push({ ...p, quantity: p.quantity || 1 });
    });
    carts[u.email] = userCart;
    setJson(KEYS.carts, carts);
    alert("Sản phẩm đã được thêm vào giỏ hàng.");
    navigate("/Shopping.html");
  };

  const saveProfile = (e) => {
    e.preventDefault();
    const u = getJson(KEYS.currentUser, null);
    const accs = getJson(KEYS.accounts, []);
    const err = {};
    let has = false;
    if (!profile.fullname.trim()) {
      err.fullname = "Vui lòng nhập họ và tên!";
      has = true;
    }
    if (!profile.email.trim()) {
      err.email = "Vui lòng nhập email!";
      has = true;
    } else if (!isValidEmail(profile.email.trim())) {
      err.email = "Email không hợp lệ!";
      has = true;
    } else if (
      accs.some(
        (acc) =>
          acc.email === profile.email.trim() && acc.email !== u.email
      )
    ) {
      err.email = "Email đã được sử dụng!";
      has = true;
    }
    if (!profile.phone.trim()) {
      err.phone = "Vui lòng nhập số điện thoại!";
      has = true;
    } else if (!isValidPhoneNumber(profile.phone.trim())) {
      err.phone = "Số điện thoại không hợp lệ!";
      has = true;
    } else if (
      accs.some(
        (acc) =>
          acc.phone === profile.phone.trim() && acc.phone !== u.phone
      )
    ) {
      err.phone = "Số điện thoại đã được sử dụng!";
      has = true;
    }
    setProfileErrors(err);
    if (has) return;

    const fullname = profile.fullname.trim();
    const email = profile.email.trim();
    const phone = profile.phone.trim();
    const updatedAccounts = accs.map((acc) => {
      if (
        (acc.email === u.email && acc.phone === u.phone) ||
        acc.email === u.email ||
        acc.phone === u.phone
      ) {
        return { ...acc, fullname, email, phone };
      }
      return acc;
    });
    setJson(KEYS.accounts, updatedAccounts);
    const newCurrent = { ...u, fullname, email, phone };
    setJson(KEYS.currentUser, newCurrent);
    setCurrentUser(newCurrent);
    alert("Cập nhật thông tin cá nhân thành công.");
  };

  const changePassword = (e) => {
    e.preventDefault();
    const u = getJson(KEYS.currentUser, null);
    const accs = getJson(KEYS.accounts, []);
    const err = {};
    let has = false;
    if (!pwForm.old) {
      err.old = "Vui lòng nhập mật khẩu cũ!";
      has = true;
    } else if (pwForm.old !== u.password) {
      err.old = "Mật khẩu cũ không đúng!";
      has = true;
    }
    if (!pwForm.new) {
      err.newPass = "Vui lòng nhập mật khẩu mới!";
      has = true;
    } else if (pwForm.new === pwForm.old) {
      err.newPass = "Mật khẩu mới không được giống mật khẩu cũ!";
      has = true;
    }
    if (!pwForm.confirm) {
      err.confirm = "Vui lòng xác nhận mật khẩu mới!";
      has = true;
    } else if (pwForm.new !== pwForm.confirm) {
      err.confirm = "Xác nhận mật khẩu không khớp!";
      has = true;
    }
    setPwErrors(err);
    if (has) return;

    const updatedAccounts = accs.map((acc) => {
      if (
        (acc.email === u.email && acc.phone === u.phone) ||
        acc.email === u.email ||
        acc.phone === u.phone
      ) {
        return { ...acc, password: pwForm.new };
      }
      return acc;
    });
    setJson(KEYS.accounts, updatedAccounts);
    const newCurrent = { ...u, password: pwForm.new };
    setJson(KEYS.currentUser, newCurrent);
    setCurrentUser(newCurrent);
    setPwForm({ old: "", new: "", confirm: "" });
    alert("Đổi mật khẩu thành công.");
  };

  if (!currentUser) return null;

  return (
    <div className="profile-page">
      <aside className="sidebar">
        <div className="sidebar-user">
          <div className="avatar">
            <i className="fa-solid fa-user" />
          </div>
          <div id="sidebar-username" className="sidebar-username">
            {currentUser.fullname}
          </div>
        </div>
        <ul className="sidebar-menu">
          <li
            data-tab="profile"
            className={tab === "profile" ? "active" : ""}
            role="presentation"
            onClick={() => setTab("profile")}
          >
            Thông tin cá nhân
          </li>
          <li
            data-tab="change-password"
            className={tab === "change-password" ? "active" : ""}
            role="presentation"
            onClick={() => setTab("change-password")}
          >
            Đổi mật khẩu
          </li>
          <li
            data-tab="orders"
            className={tab === "orders" ? "active" : ""}
            role="presentation"
            onClick={() => setTab("orders")}
          >
            Đơn mua
          </li>
          <li>
            <Link to="/">Về trang chủ</Link>
          </li>
        </ul>
        <div className="sidebar-bottom">
          <button
            type="button"
            id="sidebar-logout"
            className="sidebar-logout"
            onClick={() => {
              localStorage.removeItem(KEYS.currentUser);
              navigate("/");
            }}
          >
            <i className="fa-solid fa-sign-out-alt" /> Đăng xuất
          </button>
        </div>
      </aside>

      <main className="main-content">
        <section
          id="tab-profile"
          className={`tab${tab === "profile" ? " active" : ""}`}
        >
          <h2>Thông tin cá nhân</h2>
          <form id="profile-form" onSubmit={saveProfile}>
            <label htmlFor="fullname">
              Họ và tên
              <input
                type="text"
                id="fullname"
                required
                value={profile.fullname}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, fullname: e.target.value }))
                }
              />
              <span className="error" id="fullname-error">
                {profileErrors.fullname}
              </span>
            </label>
            <label htmlFor="email">
              Email
              <input
                type="email"
                id="email"
                required
                value={profile.email}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, email: e.target.value }))
                }
              />
              <span className="error" id="email-error">
                {profileErrors.email}
              </span>
            </label>
            <label htmlFor="phone">
              Số điện thoại
              <input
                type="text"
                id="phone"
                required
                value={profile.phone}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, phone: e.target.value }))
                }
              />
              <span className="error" id="phone-error">
                {profileErrors.phone}
              </span>
            </label>
            <button type="submit" id="save-profile-btn">
              Cập nhật
            </button>
          </form>
        </section>

        <section
          id="tab-change-password"
          className={`tab${tab === "change-password" ? " active" : ""}`}
        >
          <h2>Đổi mật khẩu</h2>
          <form id="change-password-form" onSubmit={changePassword}>
            <label htmlFor="old-password">
              Mật khẩu cũ
              <input
                type="password"
                id="old-password"
                required
                value={pwForm.old}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, old: e.target.value }))
                }
              />
              <span className="error" id="old-password-error">
                {pwErrors.old}
              </span>
            </label>
            <label htmlFor="new-password">
              Mật khẩu mới
              <input
                type="password"
                id="new-password"
                required
                value={pwForm.new}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, new: e.target.value }))
                }
              />
              <span className="error" id="new-password-error">
                {pwErrors.newPass}
              </span>
            </label>
            <label htmlFor="confirm-new-password">
              Nhập lại mật khẩu mới
              <input
                type="password"
                id="confirm-new-password"
                required
                value={pwForm.confirm}
                onChange={(e) =>
                  setPwForm((p) => ({ ...p, confirm: e.target.value }))
                }
              />
              <span className="error" id="confirm-new-password-error">
                {pwErrors.confirm}
              </span>
            </label>
            <button type="submit" id="change-password-btn">
              Đổi mật khẩu
            </button>
          </form>
        </section>

        <section
          id="tab-orders"
          className={`tab${tab === "orders" ? " active" : ""}`}
        >
          <h2>Đơn mua</h2>
          <div className="orders-tabs">
            {[
              ["all", "Tất cả"],
              ["pending", "Chờ xác nhận"],
              ["shipping", "Chờ giao hàng"],
              ["completed", "Hoàn thành"],
              ["cancelled", "Đã hủy"],
              ["refund", "Trả hàng/Hoàn tiền"],
            ].map(([f, label]) => (
              <button
                key={f}
                type="button"
                className={`order-filter${orderFilter === f ? " active" : ""}`}
                data-filter={f}
                onClick={() => setOrderFilter(f)}
              >
                {label}
              </button>
            ))}
          </div>
          <div id="orders-list" className="orders-list">
            {filteredOrders.length === 0 ? (
              <p>Không có đơn hàng phù hợp.</p>
            ) : (
              filteredOrders.map((order) => {
                const items = order.products || order.items || [];
                const total =
                  order.total ||
                  order.totalAmount ||
                  items.reduce(
                    (s, p) =>
                      s + (Number(p.price) || 0) * (p.quantity || 1),
                    0
                  );
                const statusKey = getStatusKey(order);
                const statusLabel =
                  STATUS_LABEL[statusKey] || statusKey;
                const paidVal = (order.payment || (order.paid ? "paid" : ""))
                  .toString()
                  .toLowerCase();

                return (
                  <div key={orderKey(order)} className="order-item">
                    <div className="order-header">
                      <div className="order-id">Đơn hàng</div>
                      <div className="order-status">{statusLabel}</div>
                    </div>
                    <div className="order-body">
                      <div
                        className="order-items-list"
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                          flex: 1,
                        }}
                      >
                        {items.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              gap: "12px",
                              alignItems: "center",
                              paddingBottom: "12px",
                              borderBottom: "1px solid #eee",
                            }}
                          >
                            <img
                              className="order-thumb"
                              src={item.image || "/placeholder.png"}
                              alt=""
                              style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "cover",
                              }}
                            />
                            <div style={{ flex: 1 }}>
                              <div
                                style={{
                                  fontWeight: 600,
                                  marginBottom: "4px",
                                }}
                              >
                                {item.name || "Sản phẩm"}
                              </div>
                              <div
                                style={{ fontSize: "13px", color: "#666" }}
                              >
                                Số lượng: {item.quantity || 1}
                              </div>
                              <div
                                style={{ fontSize: "13px", color: "#666" }}
                              >
                                Giá:{" "}
                                {Number(item.price || 0).toLocaleString()}₫
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="order-footer">
                      <div className="order-time">
                        {new Date(
                          order.timestamp || order.createdAt || Date.now()
                        ).toLocaleString()}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          className="order-total"
                          style={{ fontWeight: 600, color: "red" }}
                        >
                          Thành tiền:{" "}
                          {total
                            ? Number(total).toLocaleString() + "₫"
                            : "-"}
                        </div>
                        <div className="order-actions">
                          {statusKey === "pending" ||
                          statusKey === "shipping" ? (
                            <button
                              type="button"
                              className="btn-cancel"
                              onClick={() => {
                                if (
                                  !confirm(
                                    "Bạn có chắc chắn muốn hủy đơn này?"
                                  )
                                )
                                  return;
                                updateOrderStatus(order, "cancelled");
                              }}
                            >
                              Hủy đơn
                            </button>
                          ) : null}
                          {statusKey === "completed" ? (
                            <>
                              <button
                                type="button"
                                className="btn-buy"
                                onClick={() => addToCartFromOrder(items)}
                              >
                                Mua lại
                              </button>
                              {paidVal === "paid" || paidVal === "true" ? (
                                <button
                                  type="button"
                                  className="btn-refund"
                                  style={{
                                    background: "#f97316",
                                    color: "#fff",
                                    border: "none",
                                    padding: "8px 12px",
                                    borderRadius: "10px",
                                  }}
                                  onClick={() => {
                                    if (
                                      !confirm(
                                        "Bạn có chắc chắn muốn gửi yêu cầu hoàn tiền cho đơn này?"
                                      )
                                    )
                                      return;
                                    updateOrderStatus(order, "refund");
                                    alert("Yêu cầu hoàn tiền đã được gửi.");
                                  }}
                                >
                                  Yêu cầu hoàn tiền
                                </button>
                              ) : null}
                            </>
                          ) : null}
                          {statusKey === "cancelled" ||
                          statusKey === "refund" ? (
                            <button
                              type="button"
                              className="btn-buy"
                              onClick={() => addToCartFromOrder(items)}
                            >
                              Mua lại
                            </button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
