import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi, register as registerApi } from '../../../api/auth';

function AuthPage({ setToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('staff');
  const [regMessage, setRegMessage] = useState('');
  const navigate = useNavigate();

  // Xử lý đăng nhập
  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await loginApi(username, password);
    if (res.token) {
      setMessage('Đăng nhập thành công!');
      setToken(res.token); // Lưu access token vào state cha
      localStorage.setItem('accessToken', res.token); // Lưu vào localStorage
      navigate('/'); // Điều hướng về trang chủ
    } else {
      setMessage(res.error || 'Đăng nhập thất bại');
    }
  };

  // Xử lý đăng ký
  const handleRegister = async (e) => {
    e.preventDefault();
    const res = await registerApi(regUsername, regPassword, regRole);
    if (res._id) {
      setRegMessage('Đăng ký thành công!');
    } else {
      setRegMessage(res.error || 'Đăng ký thất bại');
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Đăng nhập / Đăng ký</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit">Đăng nhập</button>
      </form>
      <div>{message}</div>

      <form onSubmit={handleRegister} style={{ marginTop: 20 }}>
        <input
          type="text"
          placeholder="Tên đăng ký"
          value={regUsername}
          onChange={e => setRegUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu đăng ký"
          value={regPassword}
          onChange={e => setRegPassword(e.target.value)}
        />
        <select value={regRole} onChange={e => setRegRole(e.target.value)}>
          <option value="staff">Nhân viên</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">Đăng ký</button>
      </form>
      <div>{regMessage}</div>
    </div>
  );
}

export default AuthPage;
