import { useMemo, useState } from "react";
import { KEYS, getJson, setJson } from "../lib/storage";

export default function AdminUsers() {
  const [version, setVersion] = useState(0);
  const users = useMemo(() => getJson(KEYS.accounts, []), [version]);

  const persist = (next) => {
    setJson(KEYS.accounts, next);
    setVersion((v) => v + 1);
  };

  const toggle = (index) => {
    const copy = [...users];
    copy[index].status = copy[index].status === "active" ? "denied" : "active";
    persist(copy);
  };

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
        Quản lý Người dùng
      </h2>
      <div
        style={{
          overflowX: "auto",
          maxHeight: "500px",
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
              }}
            >
              <th style={{ padding: "12px", textAlign: "left" }}>Họ tên</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
              <th style={{ padding: "12px", textAlign: "left" }}>
                Số điện thoại
              </th>
              <th style={{ padding: "12px", textAlign: "left" }}>
                Trạng thái
              </th>
              <th style={{ padding: "12px", textAlign: "left" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => {
              const status = user.status === "active" ? "Hoạt động" : "Bị khóa";
              const statusColor =
                user.status === "active" ? "#4caf50" : "#f44336";
              return (
                <tr
                  key={user.email + index}
                  style={{ borderBottom: "1px solid #eee" }}
                >
                  <td style={{ padding: "12px" }}>{user.fullname}</td>
                  <td style={{ padding: "12px" }}>{user.email}</td>
                  <td style={{ padding: "12px" }}>{user.phone}</td>
                  <td style={{ padding: "12px" }}>
                    <span
                      style={{
                        background: statusColor,
                        color: "white",
                        padding: "4px 10px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      {status}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <button
                      type="button"
                      style={{
                        background:
                          user.status === "active" ? "#f44336" : "#4caf50",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => toggle(index)}
                    >
                      {user.status === "active" ? "Khóa" : "Mở khóa"}
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
