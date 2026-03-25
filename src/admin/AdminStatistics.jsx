import { useCallback, useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import { KEYS, getJson } from "../lib/storage";

function onlyCompletedPaid(list) {
  return (list || []).filter((o) => {
    const status = (o.status || "").toString().toLowerCase();
    const payment = (o.payment || (o.paid ? "paid" : ""))
      .toString()
      .toLowerCase();
    return (
      status === "completed" && (payment === "paid" || payment === "true")
    );
  });
}

export default function AdminStatistics() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [chartType, setChartType] = useState("bar");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setDateFrom(thirtyDaysAgo.toISOString().slice(0, 10));
    setDateTo(today.toISOString().slice(0, 10));
  }, []);

  const getFilteredOrders = useCallback(() => {
    const orders = getJson(KEYS.orders, []);
    if (!dateFrom || !dateTo) return orders;
    const df = new Date(dateFrom);
    const dt = new Date(dateTo);
    dt.setHours(23, 59, 59);
    return orders.filter((order) => {
      const orderDate = new Date(
        order.timestamp || order.createdAt || Date.now()
      );
      return orderDate >= df && orderDate <= dt;
    });
  }, [dateFrom, dateTo]);

  const buildRevenueByDate = useCallback(() => {
    const orders = onlyCompletedPaid(getFilteredOrders());
    const revenueByDate = {};
    orders.forEach((order) => {
      const date = new Date(order.timestamp || order.createdAt || Date.now());
      const dateStr = date.toLocaleDateString("vi-VN");
      if (!revenueByDate[dateStr]) {
        revenueByDate[dateStr] = { revenue: 0, items: 0, orders: 0 };
      }
      let orderTotal = Number(order.total);
      if (!orderTotal || orderTotal === 0) {
        const products = order.products || order.items || [];
        orderTotal = products.reduce(
          (sum, p) =>
            sum + (Number(p.price) || 0) * (Number(p.quantity) || 1),
          0
        );
      }
      const itemCount = (order.products || order.items || []).reduce(
        (s, p) => s + (Number(p.quantity) || 1),
        0
      );
      revenueByDate[dateStr].revenue += orderTotal;
      revenueByDate[dateStr].items += itemCount;
      revenueByDate[dateStr].orders += 1;
    });
    return revenueByDate;
  }, [getFilteredOrders]);

  const topProducts = useCallback(() => {
    const orders = onlyCompletedPaid(getFilteredOrders());
    const productStats = {};
    orders.forEach((order) => {
      const products = order.products || order.items || [];
      products.forEach((product) => {
        const name = product.name || "Chưa rõ";
        if (!productStats[name]) {
          productStats[name] = { quantity: 0, revenue: 0 };
        }
        const qty = Number(product.quantity) || 1;
        const price = Number(product.price ?? product.unitPrice) || 0;
        productStats[name].quantity += qty;
        productStats[name].revenue += price * qty;
      });
    });
    return Object.entries(productStats)
      .sort((a, b) => b[1].quantity - a[1].quantity)
      .slice(0, 10);
  }, [getFilteredOrders]);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
      chartInstance.current = null;
    }

    if (chartType === "table") {
      el.innerHTML = "";
      return;
    }

    const revenueByDate = buildRevenueByDate();
    const dates = Object.keys(revenueByDate).sort(
      (a, b) => new Date(a) - new Date(b)
    );
    const revenues = dates.map((d) => revenueByDate[d].revenue);
    const itemCounts = dates.map((d) => revenueByDate[d].items);

    if (dates.length === 0) {
      el.innerHTML =
        '<div style="text-align: center; padding: 40px; color: #999;">Không có dữ liệu trong khoảng thời gian này</div>';
      return;
    }

    el.innerHTML = "<canvas></canvas>";
    const ctx = el.querySelector("canvas");
    const type = chartType === "bar" ? "bar" : "line";
    chartInstance.current = new Chart(ctx, {
      type,
      data: {
        labels: dates,
        datasets: [
          {
            label: "Doanh Thu (₫)",
            data: revenues,
            backgroundColor: type === "bar" ? "#0a8dd9" : "rgba(10, 141, 217, 0.1)",
            borderColor: "#0a8dd9",
            borderWidth: 2,
            fill: type === "line",
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: "#0a8dd9",
          },
          {
            label: "Số Sản Phẩm",
            data: itemCounts,
            type: "line",
            yAxisID: "y_items",
            borderColor: "#ff9800",
            backgroundColor: "rgba(255,152,0,0.06)",
            tension: 0.4,
            pointRadius: 3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true } },
        scales: {
          y: {
            beginAtZero: true,
            position: "left",
            ticks: {
              callback: (value) => "₫" + Math.round(value).toLocaleString(),
            },
            title: { display: true, text: "Doanh Thu (₫)" },
          },
          y_items: {
            beginAtZero: true,
            position: "right",
            grid: { display: false },
            title: { display: true, text: "Số Sản Phẩm" },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [buildRevenueByDate, chartType, dateFrom, dateTo, tick]);

  const revenueByDate = buildRevenueByDate();
  const dates = Object.keys(revenueByDate).sort(
    (a, b) => new Date(a) - new Date(b)
  );
  const top = topProducts();

  return (
    <div className="stats-container">
      <h2 style={{ color: "#0a8dd9", marginBottom: "20px" }}>
        Thống Kê & Báo Cáo
      </h2>
      <div className="stats-header">
        <div className="stats-filters">
          <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            Từ ngày:
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            Đến ngày:
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </label>
          <button type="button" onClick={() => setTick((t) => t + 1)}>
            Lọc
          </button>
          <button
            type="button"
            onClick={() => {
              const today = new Date();
              const ago = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
              setDateFrom(ago.toISOString().slice(0, 10));
              setDateTo(today.toISOString().slice(0, 10));
              setTick((t) => t + 1);
            }}
            style={{ background: "#999" }}
          >
            Đặt lại
          </button>
        </div>
      </div>
      <div className="stats-content">
        <div className="chart-wrapper">
          <h3>📊 Doanh Thu</h3>
          <div className="chart-type-selector">
            {["bar", "line", "table"].map((t) => (
              <button
                key={t}
                type="button"
                className={`chart-type-btn${chartType === t ? " active" : ""}`}
                onClick={() => {
                  setChartType(t);
                  setTick((x) => x + 1);
                }}
              >
                {t === "bar" ? "Cột" : t === "line" ? "Miền" : "Bảng"}
              </button>
            ))}
          </div>
          <div
            id="revenueChart"
            className="chart-container"
            ref={chartRef}
            style={{
              display: chartType === "table" ? "none" : "block",
              minHeight: "320px",
            }}
          />
          <table
            id="revenueTable"
            className="chart-table"
            style={{ display: chartType === "table" ? "table" : "none" }}
          >
            <thead>
              <tr>
                <th>Ngày</th>
                <th>Doanh Thu</th>
                <th>Số Sản Phẩm</th>
              </tr>
            </thead>
            <tbody>
              {dates.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: "center", padding: 20 }}>
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                dates.map((date) => (
                  <tr key={date}>
                    <td style={{ padding: "12px" }}>{date}</td>
                    <td
                      style={{
                        padding: "12px",
                        fontWeight: 600,
                        color: "#4caf50",
                      }}
                    >
                      ₫
                      {Math.round(revenueByDate[date].revenue).toLocaleString()}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {revenueByDate[date].items}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="chart-wrapper">
          <h3>🏆 Top Sản Phẩm Bán Chạy Nhất</h3>
          <table id="topProductsTable" className="chart-table">
            <thead>
              <tr>
                <th>Hạng</th>
                <th>Sản phẩm</th>
                <th>Số lượng bán</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {top.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: 20 }}>
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                top.map(([name, stats], index) => (
                  <tr key={name}>
                    <td style={{ padding: "12px", fontWeight: 600 }}>
                      #{index + 1}
                    </td>
                    <td style={{ padding: "12px" }}>{name}</td>
                    <td
                      style={{
                        padding: "12px",
                        fontWeight: 600,
                        color: "#0a8dd9",
                      }}
                    >
                      {stats.quantity}
                    </td>
                    <td
                      style={{
                        padding: "12px",
                        color: "#4caf50",
                        fontWeight: 600,
                      }}
                    >
                      ₫{Math.round(stats.revenue).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
