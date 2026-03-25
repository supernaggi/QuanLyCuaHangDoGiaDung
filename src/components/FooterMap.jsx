const lat = 20.8864731;
const lng = 105.986956;
const mapsLink =
  "https://www.google.com/maps/place/C%E1%BB%ADa+h%C3%A0ng+Gas+Thu%E1%BA%ADt+H%C6%B0%C6%A1ng/@20.8864731,105.986956,784m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3135bbfdd68eff31:0xc4c57f4d1ed8e5a7!8m2!3d20.8864731!4d105.986956!16s%2Fg%2F11tp532ftv?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoKLDEwMDc5MjA2OUgBUAM%3D";

export default function FooterMap() {
  return (
    <div className="footer-map-wrapper">
      <div className="footer-map-frame">
        <iframe
          title="Bản đồ cửa hàng"
          src={`https://www.google.com/maps?q=${lat},${lng}&z=17&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          aria-label="Bản đồ - Địa chỉ cửa hàng"
        />
      </div>
      <div className="footer-map-info">
        <h4>Địa chỉ cửa hàng</h4>
        <p>
          Cửa hàng Gas Thuật Hương
          <br />
          Số điện thoại: 0975775597
          <br />
          Địa chỉ: Thôn Mễ Hạ - Xã Việt Yên - Tỉnh Hưng Yên
        </p>
        <a href={mapsLink} target="_blank" rel="noopener noreferrer">
          Mở Google Maps ⤴
        </a>
      </div>
    </div>
  );
}
