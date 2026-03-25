import { useEffect, useRef, useState } from "react";

const services = [
  {
    id: "zalo",
    label: "Zalo",
    className: "zalo",
    iconClass: "fa-solid fa-comment-dots",
    urlBase: "https://zalo.me/0865415911",
  },
  {
    id: "mess",
    label: "Messenger",
    className: "mess",
    iconClass: "fa-brands fa-facebook-messenger",
    urlBase: "https://m.me/100094266397508",
  },
];

export default function FloatingChat() {
  const [openIdx, setOpenIdx] = useState(null);
  const inputsRef = useRef([]);

  useEffect(() => {
    const close = () => setOpenIdx(null);
    document.addEventListener("click", close);
    const esc = (e) => {
      if (e.key === "Escape") setOpenIdx(null);
    };
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  return (
    <>
      <div className="floating-chat-container">
        {services.map((svc, idx) => (
          <button
            key={svc.id}
            type="button"
            className={`chat-button ${svc.className}`}
            aria-label={`${svc.label} chat`}
            onClick={(e) => {
              e.stopPropagation();
              setOpenIdx((i) => (i === idx ? null : idx));
            }}
          >
            <i className={svc.iconClass} aria-hidden="true" />
          </button>
        ))}
      </div>
      {services.map((svc, idx) => (
          <div
            key={`win-${svc.id}`}
            className={`chat-window${openIdx === idx ? " open" : ""}`}
            data-index={idx}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="chat-header">
              <div className="title">{svc.label} - Hỗ trợ</div>
              <div>
                <button
                  type="button"
                  className="close-btn"
                  aria-label="Đóng"
                  onClick={() => setOpenIdx(null)}
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="chat-body">
              <div className="placeholder">
                Nhập tin nhắn và nhấn Gửi để mở ứng dụng {svc.label} (mở tab
                mới).
              </div>
            </div>
            <div className="chat-footer">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
                ref={(el) => {
                  inputsRef.current[idx] = el;
                }}
              />
              <button
                type="button"
                className="send"
                onClick={() => {
                  const input = inputsRef.current[idx];
                  const text = (input?.value || "").trim();
                  let targetUrl = svc.urlBase;
                  if (svc.id === "zalo") {
                    if (text)
                      targetUrl = `${svc.urlBase}?text=${encodeURIComponent(text)}`;
                  } else if (svc.id === "mess") {
                    if (text)
                      targetUrl = `${svc.urlBase}?ref=${encodeURIComponent(text)}`;
                  }
                  window.open(targetUrl, "_blank", "noopener");
                  setOpenIdx(null);
                  if (input) input.value = "";
                }}
              >
                Gửi
              </button>
            </div>
          </div>
      ))}
    </>
  );
}
