// Giao diện admin giống Sapo, có sidebar, header, nội dung tổng quan
import React, { useState } from 'react';
import ResponsiveLayout from '../../components/ResponsiveLayout';
import LogoTudo from '../../components/Logo_td';
import './AdminDashboard.css';

// Dữ liệu sidebar mẫu
const sidebarItems = [
  'Tổng quan', 'Báo cáo', 'Hóa đơn', 'Mặt hàng', 'Đặt lịch', 'Nhân viên', 'Khách hàng', 'Nhân viên chuỗi', 'Khuyến mại', 'Kho hàng', 'Thu chi', 'Chấm công', 'Thiết lập'
];
function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 64 : 220;
  return (
    <div className="admin-dashboard-root">
      {/* Sidebar */}
      <aside
        className={"admin-dashboard-sidebar" + (collapsed ? " collapsed" : "")}
        style={{ width: sidebarWidth }}
      >
        <a href="/" className="admin-dashboard-logo" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex', padding: collapsed ? '12px 0' : '24px 0 32px 0' }}>
          <div className="td-logo">
            <LogoTudo width={collapsed ? 44 : 200} height={collapsed ? 44 : 58} />
          </div>
        </a>
        <button
          className="sidebar-toggle-btn"
          style={{
            background: 'none', border: 'none', color: '#FFA827', cursor: 'pointer', margin: '0 auto 16px auto', fontSize: 22, display: 'block', transition: 'all 0.2s',
          }}
          onClick={() => setCollapsed(v => !v)}
          title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {collapsed ? '»' : '«'}
        </button>
        {sidebarItems.map(item => (
          <div
            key={item}
            className={
              'admin-dashboard-sidebar-item' + (item === 'Tổng quan' ? ' active' : '')
            }
            style={{ textAlign: collapsed ? 'center' : 'left', fontSize: collapsed ? 0 : 16, height: 40, lineHeight: '40px', overflow: 'hidden', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
          >
            <span style={{ opacity: collapsed ? 0 : 1, transition: 'opacity 0.2s' }}>{item}</span>
          </div>
        ))}
      </aside>
      {/* Main content */}
      <div className="admin-dashboard-main" style={{ marginLeft: sidebarWidth, transition: 'margin-left 0.2s' }}>
        {/* Header */}
        <header className="admin-dashboard-header">
          <div style={{ fontWeight: 'bold', fontSize: 18 }}>Xin chào, tran duy nam</div>
          <div className="admin-dashboard-user">
            <span style={{ color: '#64748b', fontSize: 14 }}>Gói Trial</span>
            <div className="admin-dashboard-user-badge">TDN</div>
          </div>
        </header>
        {/* Nội dung tổng quan */}
        <ResponsiveLayout>
          <div className="admin-dashboard-content">
            <div className="admin-dashboard-content-title">Tổng quan kinh doanh</div>
            <div className="admin-dashboard-content-row">
              <div className="admin-dashboard-content-box">
                <div className="admin-dashboard-content-box-title">Tiền hàng</div>
                <div className="admin-dashboard-content-box-value">180,000 đ</div>
              </div>
              <div className="admin-dashboard-content-box gray">
                <div className="admin-dashboard-content-box-title gray">Hoàn huỷ</div>
                <div className="admin-dashboard-content-box-value">0 đ</div>
              </div>
              <div className="admin-dashboard-content-box gray">
                <div className="admin-dashboard-content-box-title gray">Giảm giá</div>
                <div className="admin-dashboard-content-box-value">0 đ</div>
              </div>
              <div className="admin-dashboard-content-box gray">
                <div className="admin-dashboard-content-box-title gray">Thuế phí</div>
                <div className="admin-dashboard-content-box-value">0 đ</div>
              </div>
              <div className="admin-dashboard-content-box">
                <div className="admin-dashboard-content-box-title">Doanh thu gồm thuế</div>
                <div className="admin-dashboard-content-box-value">180,000 đ</div>
              </div>
            </div>
            <div className="admin-dashboard-content-row">
              <div className="admin-dashboard-content-box white">
                <div className="admin-dashboard-content-box-title">Số khách hàng</div>
                <div className="admin-dashboard-content-box-value small">2</div>
              </div>
              <div className="admin-dashboard-content-box white">
                <div className="admin-dashboard-content-box-title">Số hoá đơn</div>
                <div className="admin-dashboard-content-box-value small">1</div>
              </div>
              <div className="admin-dashboard-content-box white">
                <div className="admin-dashboard-content-box-title">TB mặt hàng/hoá đơn</div>
                <div className="admin-dashboard-content-box-value small">4</div>
              </div>
              <div className="admin-dashboard-content-box white">
                <div className="admin-dashboard-content-box-title">TB doanh thu/hoá đơn</div>
                <div className="admin-dashboard-content-box-value small">180,000 đ</div>
              </div>
            </div>
          </div>
        </ResponsiveLayout>
      </div>
    </div>
  );
}

export default AdminDashboard;
