import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/style_login.css";
import ShopFooter from "../components/ShopFooter";
import { KEYS, getJson, setJson } from "../lib/storage";

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function isValidPhoneNumber(phone) {
  return /^[0-9]{10,11}$/.test(phone);
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [showSignup, setShowSignup] = useState(false);
  const [pwVisible, setPwVisible] = useState(false);

  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [signup, setSignup] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [signupErrors, setSignupErrors] = useState({});

  const onLogin = (e) => {
    e.preventDefault();
    const accounts = getJson(KEYS.accounts, []);
    const account = accounts.find(
      (acc) =>
        (acc.email === emailOrPhone.trim() ||
          acc.phone === emailOrPhone.trim()) &&
        acc.password === password.trim()
    );
    if (account) {
      setJson(KEYS.currentUser, account);
      if (account.status === "denied") {
        setLoginError(
          "Tài khoản của bạn đã bị khóa vì vi phạm điều khoản!"
        );
      } else if (account.role === "admin") {
        navigate("/admin-control.html");
      } else {
        navigate("/");
      }
    } else {
      setLoginError("Email/Số điện thoại hoặc mật khẩu không đúng!");
    }
  };

  const onSignup = (e) => {
    e.preventDefault();
    const fullname = signup.fullname.trim();
    const email = signup.email.trim();
    const phone = signup.phone.trim();
    const pass = signup.password.trim();
    const confirmPassword = signup.confirm.trim();
    const accounts = getJson(KEYS.accounts, []);
    const err = {};
    let hasError = false;

    if (!fullname) {
      err.fullname = "Vui lòng nhập họ và tên!";
      hasError = true;
    }
    if (!email) {
      err.email = "Vui lòng nhập email!";
      hasError = true;
    } else if (!isValidEmail(email)) {
      err.email = "Email không hợp lệ!";
      hasError = true;
    } else if (accounts.some((acc) => acc.email === email)) {
      err.email = "Email đã được sử dụng!";
      hasError = true;
    }
    if (!phone) {
      err.phone = "Vui lòng nhập số điện thoại!";
      hasError = true;
    } else if (!isValidPhoneNumber(phone)) {
      err.phone = "Số điện thoại không hợp lệ!";
      hasError = true;
    } else if (accounts.some((acc) => acc.phone === phone)) {
      err.phone = "Số điện thoại đã được sử dụng!";
      hasError = true;
    }
    if (!pass) {
      err.password = "Vui lòng nhập mật khẩu!";
      hasError = true;
    }
    if (!confirmPassword) {
      err.confirm = "Vui lòng xác nhận mật khẩu!";
      hasError = true;
    } else if (pass !== confirmPassword) {
      err.confirm = "Mật khẩu và xác nhận mật khẩu không khớp!";
      hasError = true;
    }

    setSignupErrors(err);
    if (hasError) return;

    accounts.push({
      fullname,
      email,
      phone,
      password: pass,
      status: "active",
    });
    setJson(KEYS.accounts, accounts);
    alert("Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.");
    setShowSignup(false);
  };

  return (
    <div style={{ margin: 0, fontFamily: "arial" }}>
      <div
        className="header-login"
        style={{
          width: "100%",
          height: "60px",
          backgroundColor: "rgba(0, 162, 231, 255)",
        }}
      >
        <div
          className="top-header-login"
          style={{ width: "80%", height: "60px", margin: "auto" }}
        >
          <div id="b1">
            <Link to="/">
              <img src="/Logo.jpg" alt="Logo" />
            </Link>
          </div>
          <p style={{ paddingTop: "20px", fontSize: "20px", color: "white" }}>
            ĐĂNG NHẬP
          </p>
        </div>
      </div>

      <div className="midder-login">
        <div className="login-content">
          <div className="login-image">
            <img src="/Life&Cooking.jpg" alt="Life&Cooking" />
          </div>

          {!showSignup ? (
            <div className="login-container" id="login-form">
              <h2>Đăng nhập</h2>
              <form onSubmit={onLogin}>
                <div className="form-group">
                  <label htmlFor="email-or-phone">
                    Email hoặc Số điện thoại:
                  </label>
                  <input
                    type="text"
                    id="email-or-phone"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="Nhập email hoặc số điện thoại"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">Mật khẩu:</label>
                  <div className="password-container">
                    <input
                      type={pwVisible ? "text" : "password"}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      required
                    />
                    <i
                      className={`fas ${
                        pwVisible ? "fa-eye-slash" : "fa-eye"
                      } toggle-password`}
                      role="presentation"
                      onClick={() => setPwVisible((v) => !v)}
                    />
                  </div>
                </div>
                {loginError ? (
                  <span
                    className="error-message"
                    id="login-error"
                    style={{ color: "red", display: "block" }}
                  >
                    {loginError}
                  </span>
                ) : null}
                <button type="submit" className="btn-login">
                  Đăng Nhập
                </button>
              </form>
              <div className="extra-options">
                <a href="#">Quên mật khẩu?</a> &nbsp; &nbsp;&nbsp;&nbsp;
                <button
                  type="button"
                  id="switch-to-signup"
                  style={{
                    background: "none",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                    font: "inherit",
                  }}
                  onClick={() => {
                    setLoginError("");
                    setShowSignup(true);
                  }}
                >
                  Chưa có tài khoản? Đăng ký ngay
                </button>
              </div>
              <div className="extra-login-options">
                <p>Hoặc đăng nhập với:</p>
                <div className="social-login">
                  <button type="button" className="btn-google">
                    <i className="fab fa-google" /> Google
                  </button>
                  <button type="button" className="btn-facebook">
                    <i className="fab fa-facebook-f" /> Facebook
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="login-container" id="signup-form">
              <h2>Đăng ký</h2>
              <form onSubmit={onSignup}>
                <div className="form-group">
                  <label htmlFor="signup-fullname">Họ và tên:</label>
                  <input
                    id="signup-fullname"
                    value={signup.fullname}
                    onChange={(e) =>
                      setSignup((s) => ({ ...s, fullname: e.target.value }))
                    }
                    placeholder="Nhập họ và tên"
                    required
                  />
                  {signupErrors.fullname ? (
                    <span className="error-message" style={{ color: "red" }}>
                      {signupErrors.fullname}
                    </span>
                  ) : null}
                </div>
                <div className="form-group">
                  <label htmlFor="signup-email">Email:</label>
                  <input
                    id="signup-email"
                    type="email"
                    value={signup.email}
                    onChange={(e) =>
                      setSignup((s) => ({ ...s, email: e.target.value }))
                    }
                    placeholder="Nhập email"
                    required
                  />
                  {signupErrors.email ? (
                    <span className="error-message" style={{ color: "red" }}>
                      {signupErrors.email}
                    </span>
                  ) : null}
                </div>
                <div className="form-group">
                  <label htmlFor="signup-phone">Số điện thoại:</label>
                  <input
                    id="signup-phone"
                    value={signup.phone}
                    onChange={(e) =>
                      setSignup((s) => ({ ...s, phone: e.target.value }))
                    }
                    placeholder="Nhập số điện thoại"
                    required
                  />
                  {signupErrors.phone ? (
                    <span className="error-message" style={{ color: "red" }}>
                      {signupErrors.phone}
                    </span>
                  ) : null}
                </div>
                <div className="form-group">
                  <label htmlFor="signup-password">Mật khẩu:</label>
                  <input
                    id="signup-password"
                    type="password"
                    value={signup.password}
                    onChange={(e) =>
                      setSignup((s) => ({ ...s, password: e.target.value }))
                    }
                    placeholder="Nhập mật khẩu"
                    required
                  />
                  {signupErrors.password ? (
                    <span className="error-message" style={{ color: "red" }}>
                      {signupErrors.password}
                    </span>
                  ) : null}
                </div>
                <div className="form-group">
                  <label htmlFor="confirm-password">Xác nhận mật khẩu:</label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={signup.confirm}
                    onChange={(e) =>
                      setSignup((s) => ({ ...s, confirm: e.target.value }))
                    }
                    placeholder="Nhập lại mật khẩu"
                    required
                  />
                  {signupErrors.confirm ? (
                    <span className="error-message" style={{ color: "red" }}>
                      {signupErrors.confirm}
                    </span>
                  ) : null}
                </div>
                <button type="submit" className="btn-login">
                  Đăng Ký
                </button>
              </form>
              <div className="extra-options">
                <button
                  type="button"
                  id="switch-to-login"
                  style={{
                    background: "none",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                    font: "inherit",
                  }}
                  onClick={() => setShowSignup(false)}
                >
                  Đã có tài khoản? Đăng nhập ngay
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ShopFooter withMap={false} />
    </div>
  );
}
