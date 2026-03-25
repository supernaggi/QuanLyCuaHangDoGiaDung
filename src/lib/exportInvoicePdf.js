export function loadHtml2Pdf(callback) {
  if (window.html2pdf) {
    callback();
    return;
  }
  const s = document.createElement("script");
  s.src =
    "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.3/html2pdf.bundle.min.js";
  s.onload = callback;
  document.head.appendChild(s);
}

export function exportOrderInvoice(order) {
  loadHtml2Pdf(() => {
    const fmt = (v) => "₫" + (Number(v) || 0).toLocaleString("vi-VN");
    const orderId = order.id || `o_${Date.now()}`;
    const orderDate = new Date(
      order.timestamp || order.createdAt || Date.now()
    ).toLocaleString("vi-VN");
    const user = order.user || {};
    const items = order.products || order.items || [];

    const wrapper = document.createElement("div");
    wrapper.className = "invoice-export";
    wrapper.style.width = "900px";
    wrapper.style.padding = "24px";
    wrapper.style.background = "#fff";
    wrapper.style.color = "#000";
    wrapper.style.fontFamily = "Arial, 'Helvetica Neue', Helvetica, sans-serif";
    wrapper.innerHTML = `
      <div style="width:100%; box-sizing:border-box;">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px;">
          <div>
            <h2 style="margin:0 0 6px 0;">Life & Cooking</h2>
            <div style="font-size:12px; color:#333;">Địa chỉ: Thôn Mễ Hạ - Xã Việt Yên - Tỉnh Hưng Yên </div>
            <div style="font-size:12px; color:#333;">Hotline: 0987437597</div>
          </div>
          <div style="text-align:right; padding-right:150px;">
            <div style="font-size:18px; font-weight:700;">HÓA ĐƠN BÁN HÀNG</div>
            <div style="font-size:12px; color:#555; margin-top:6px;">Mã: <strong>${orderId}</strong></div>
            <div style="font-size:12px; color:#555;">Ngày: ${orderDate}</div>
          </div>
        </div>

        <div style="margin:12px 0; font-size:13px;">
          <div><strong>Khách hàng:</strong> ${
            user.fullname || order.customerName || "-"
          }</div>
          <div><strong>SĐT:</strong> ${
            user.phone || order.customerPhone || "-"
          }</div>
          ${
            order.address || order.deliveryAddress
              ? `<div><strong>Địa chỉ:</strong> ${
                  order.address || order.deliveryAddress
                }</div>`
              : ""
          }
        </div>

        <table style="width:100%; border-collapse:collapse; font-size:13px;">
          <thead>
            <tr style="border-bottom:1px solid #ddd;">
              <th style="text-align:left; padding:8px 4px;">STT</th>
              <th style="text-align:left; padding:8px 4px;">Sản phẩm</th>
              <th style="text-align:center; padding:8px 4px; width:60px;">SL</th>
              <th style="text-align:right; padding:8px 4px; width:120px;">Đơn giá</th>
              <th style="text-align:right; padding:8px 4px; width:120px;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map((p, i) => {
                const name = p.name || p.title || "-";
                const qty = Number(p.quantity) || 1;
                const price = Number(
                  p.price || p.unitPrice || p.discountedPrice || 0
                );
                const lineTotal = qty * price;
                return `<tr>
                  <td style="padding:8px 4px; vertical-align:top;">${i + 1}</td>
                  <td style="padding:8px 4px; vertical-align:top;">${name}</td>
                  <td style="padding:8px 4px; text-align:center; vertical-align:top;">${qty}</td>
                  <td style="padding:8px 4px; text-align:right; vertical-align:top;">${fmt(
                    price
                  )}</td>
                  <td style="padding:8px 4px; text-align:right; vertical-align:top;">${fmt(
                    lineTotal
                  )}</td>
                </tr>`;
              })
              .join("")}
          </tbody>
        </table>

        <div style="margin-top:12px; border-top:1px solid #ddd; padding-top:12px; text-align:right; font-size:14px;">
          ${
            order.discount
              ? `<div>Giảm giá: <strong style="margin-left:8px;">${fmt(
                  order.discount
                )}</strong></div>`
              : ""
          }
          <div style="margin-top:8px; padding-right:120px; font-size:16px;">Tổng cộng: <strong style="margin-left:8px; font-size:16px;">${fmt(
            order.total ||
              items.reduce(
                (s, p) =>
                  s + (Number(p.price) || 0) * (Number(p.quantity) || 1),
                0
              ) +
                (Number(order.shipping) || 0) -
                (Number(order.discount) || 0)
          )}</strong></div>
        </div>

        <div style="margin-top:28px; font-size:12px; color:#555;">Cảm ơn quý khách. Mọi thắc mắc xin liên hệ hotline.</div>
      </div>
    `;
    document.body.appendChild(wrapper);

    const opt = {
      margin: 10,
      filename: `invoice_${orderId}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
    };

    try {
      window
        .html2pdf()
        .set(opt)
        .from(wrapper)
        .save()
        .then(() => wrapper.remove())
        .catch(() => wrapper.remove());
    } catch (err) {
      wrapper.remove();
      console.error("PDF export failed", err);
      alert("Không thể xuất file PDF. Vui lòng thử lại.");
    }
  });
}
