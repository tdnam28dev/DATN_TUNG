import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Import component LoadingBox
import LoadingBox from '../../../components/LoadingBox';

function Home() {
  const navigate = useNavigate();
  // State kiểm soát loading
  const [isloading, setLoading] = useState(true);
  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  return (
    <div id="loading-cover" style={{ position: 'relative', minHeight: 300 }}>
      {isloading && <LoadingBox idWrapt="loading-cover" onDone={() => setLoading(false)} />}
      {!isloading && (
        <div style={{ padding: 20 }}>
          <h2>API TEST</h2>
          <button onClick={() => navigate('/crud-restaurants')}>CRUD Nhà hàng(test)</button>
          <button onClick={() => navigate('/crud-tables')} style={{ marginLeft: 10 }}>CRUD Bàn(test)</button>
          <button onClick={() => navigate('/crud-menus')} style={{ marginLeft: 10 }}>CRUD Thực đơn(test)</button>
          <button onClick={() => navigate('/crud-menu-items')} style={{ marginLeft: 10 }}>CRUD Món ăn(test)</button>
          <button onClick={() => navigate('/crud-orders')} style={{ marginLeft: 10 }}>CRUD Gọi món(test)</button>
          <button onClick={() => navigate('/crud-users')} style={{ marginLeft: 10 }}>CRUD Người dùng(test)</button>
          <button onClick={() => navigate('/admin-dashboard')} style={{ marginLeft: 20, background: '#3ec2cf', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 6, fontWeight: 'bold' }}>Đến trang Admin</button>
          <button onClick={handleLogout} style={{ marginLeft: 20, color: 'red' }}>Đăng xuất</button>
        </div>
      )}
    </div>
  );
}

export default Home;
