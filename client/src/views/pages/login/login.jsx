import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { login as loginApi } from "../../../api/auth";
import LogoTudo from '../../../components/Logo_td';
// import SloganType1 from '../../../components/SloganType1';
// import SloganType2 from '../../../components/SloganType2';

const Login = ({ setToken }) => {
  // State lưu thông tin đăng nhập
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // Thông báo lỗi
  const [message, setMessage] = useState(""); // Thông báo thành công
  const [role, setRole] = useState("staff"); // Trạng thái checkbox admin
  const navigate = useNavigate(); // Dùng để chuyển trang


  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    const res = await loginApi(username, password, role);
    if (res.token) {
      setMessage("Đăng nhập thành công!");
      setToken(res.token); // Lưu access token vào App
      localStorage.setItem("accessToken", res.token); // Lưu vào localStorage
      localStorage.setItem("userId", res.id);
      // Nếu chọn quyền admin thì chuyển đến trang admin, không thì về home
      if (role === 'admin') {
        navigate("/admin-dashboard");
      } else {
        navigate("/");
      }
    } else {
      setError(res.error || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="login-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
      <div className="login-container" style={{ zIndex: 2, position: 'relative' }}>
        <div className="td-logo-login">
          <LogoTudo width={350} height={70} />
        </div>
        <form className="login-form" onSubmit={handleLogin}>
          <h2 className="login-title">Đăng nhập hệ thống</h2>
          <div className="login-field">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              autoFocus
            />
          </div>
          <div className="login-field">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
            />
          </div>
          <div className="login-checkbox-admin">
            <input
              type="checkbox"
              id="admin-checkbox"
              className="custom-checkbox"
              checked={role === 'admin'}
              onChange={e => setRole(e.target.checked ? 'admin' : 'staff')}
            />
            <label htmlFor="admin-checkbox" className="checkbox-label">Quản trị viên</label>
          </div>
          {error && <div className="login-error">{error}</div>}
          {message && <div className="login-success">{message}</div>}
          <button className="login-btn" type="submit">Đăng nhập</button>
        </form>
      </div>
      {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', maxWidth: 900, margin: '32px auto 0 auto', position: 'absolute', bottom: 32, left: 0, right: 0, zIndex: 1 }}>
        <SloganType1 style={{ flex: 1, textAlign: 'left', fontSize: 22, fontWeight: 600 }} />
        <div style={{ flex: 1 }} />
        <SloganType2 style={{ flex: 1, textAlign: 'right', fontSize: 22, fontWeight: 600 }} />
      </div> */}
    </div>
  );
};

export default Login;
