import { useEffect, useMemo, useState } from "react";
import { KEYS, getJson, setJson } from "../lib/storage";
import { exportOrderInvoice } from "../lib/exportInvoicePdf";

export default function AdminOrders() {
  const [version, setVersion] = useState(0);
  const orders = useMemo(() => {
    const o = getJson(KEYS.orders, []);
    return [...o].sort((a, b) => {
      const dateA = new Date(a.timestamp || a.createdAt || 0);
      const dateB = new Date(b.timestamp || b.createdAt || 0);
      return dateB - dateA;
    });
  }, [version]);

  const persistOrder = (updater) => {
    const all = getJson(KEYS.orders, []);
    updater(all);
    setJson(KEYS.orders, all);
    setVersion((v) => v + 1);
  };

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === KEYS.orders) setVersion((v) => v + 1);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return (
    <div
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <h2 style={{ color: "#0a8dd9", marginBottom: "20px" }}>
        Đơn Hàng Đặt
      </h2>
      <div
        style={{
          overflowX: "auto",
          maxHeight: "600px",
          border: "1px solid #ddd",
          borderRadius: "6px",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "#f5f7fa",
                borderBottom: "2px solid #ddd",
                position: "sticky",
                top: 0,
              }}
            >
              <th style={{ padding: "12px", textAlign: "left" }}>ID</th>
              <th style={{ padding: "12px", textAlign: "left" }}>
                Người đặt
              </th>
              <th style={{ padding: "12px", textAlign: "left" }}>SDT</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Ngày đặt</th>
              <th style={{ padding: "12px", textAlign: "left" }}>
                Sản phẩm
              </th>
              <th style={{ padding: "12px", textAlign: "left" }}>Tổng</th>
              <th style={{ padding: "12px", textAlign: "left" }}>
                Trạng thái
              </th>
              <th style={{ padding: "12px", textAlign: "left" }}>
                Thanh toán
              </th>
              <th style={{ padding: "12px", textAlign: "left" }}>
                Xuất hóa đơn
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => {
              const products = order.products || order.items || [];
              const total =
                order.total ||
                order.totalAmount ||
                products.reduce(
                  (s, p) => s + (Number(p.price) || 0) * (p.quantity || 1),
                  0
                );
              const user = order.user || {};
              const id = order.id ?? idx;
              const lookupId = order.id ?? order.timestamp ?? order.createdAt ?? idx;
              const orderDate = new Date(
                order.timestamp || order.createdAt || Date.now()
              ).toLocaleString("vi-VN");
              const currentStatus = order.status || "pending";
              const payVal = order.payment || (order.paid ? "paid" : "unpaid");

              return (
                <tr key={String(id) + idx} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "12px" }}>{id}</td>
                  <td style={{ padding: "12px" }}>
                    {user.fullname || order.customerName || ""}
                  </td>
                  <td style={{ padding: "12px" }}>
                    {user.phone || order.customerPhone || ""}
                  </td>
                  <td style={{ padding: "12px" }}>{orderDate}</td>
                  <td style={{ padding: "12px" }}>
                    {products
                      .map((p) => p.name)
                      .slice(0, 2)
                      .join(", ")}
                  </td>
                  <td style={{ padding: "12px" }}>
                    ₫{total ? Number(total).toLocaleString() : "-"}
                  </td>
                  <td style={{ padding: "12px" }}>
                    <select
                      style={{
                        padding: "6px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                      }}
                      value={currentStatus}
                      onChange={(e) => {
                        const v = e.target.value;
                        persistOrder((all) => {
                          let idxFind = all.findIndex(
                            (o) => String(o.id) === String(lookupId)
                          );
                          if (idxFind === -1) {
                            idxFind = all.findIndex(
                              (o) =>
                                String(
                                  o.timestamp || o.createdAt || o.id
                                ) === String(lookupId)
                            );
                          }
                          if (idxFind !== -1) all[idxFind].status = v;
                        });
                      }}
                    >
                      <option value="pending">Chờ xác nhận</option>
                      <option value="shipping">Chờ giao hàng</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                      <option value="refund">Trả hàng/Hoàn tiền</option>
                    </select>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <select
                      style={{
                        padding: "6px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                      }}
                      value={payVal}
                      onChange={(e) => {
                        const v = e.target.value;
                        persistOrder((all) => {
                          let idxFind = all.findIndex(
                            (o) => String(o.id) === String(lookupId)
                          );
                          if (idxFind === -1) {
                            idxFind = all.findIndex(
                              (o) =>
                                String(
                                  o.timestamp || o.createdAt || o.id
                                ) === String(lookupId)
                            );
                          }
                          if (idxFind !== -1) all[idxFind].payment = v;
                        });
                      }}
                    >
                      <option value="paid">Đã thanh toán</option>
                      <option value="unpaid">Chưa thanh toán</option>
                    </select>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <button
                      type="button"
                      className="btn-invoice"
                      onClick={() => exportOrderInvoice(order)}
                    >
                      Xuất hóa đơn
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
