import React, { useEffect, useState, useRef } from 'react';
import LogoTudo from '../../components/Logo_td';
import Icon from '../../components/Icon';
import './AdminDashboard.css';
import { getUserById } from '../../api/user';
// Import các giao diện sidebar
import Overview from './sidebar/Overview';
import Report from './sidebar/Report';
import Bill from './sidebar/Bill';
import Product from './sidebar/Product';
import Schedule from './sidebar/Schedule';
import Staff from './sidebar/Staff';
import Customer from './sidebar/Customer';
import StaffChain from './sidebar/StaffChain';
import Promotion from './sidebar/Promotion';
import Warehouse from './sidebar/Warehouse';
import RevenueExpense from './sidebar/RevenueExpense';
import Timekeeping from './sidebar/Timekeeping';
import Settings from './sidebar/Setting';


// Dữ liệu sidebar mẫu
const sidebarItems = [
  'Tổng quan', 'Báo cáo', 'Hóa đơn', 'Mặt hàng', 'Đặt lịch', 'Nhân viên', 'Khách hàng', 'Nhân viên chuỗi', 'Khuyến mại', 'Kho hàng', 'Thu chi', 'Chấm công', 'Cấu hình'
];

function AdminDashboard({ token, userId }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMini, setIsMini] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false); // Toggle menu user
  const userMenuRef = useRef(null);
  const realUserId = userId || localStorage.getItem('userId');
  useEffect(() => {
    const fetchUserInfo = async () => {
      const data = await getUserById(realUserId, token);
      setUserInfo(data);
    };
    fetchUserInfo();
  }, [realUserId, token]);
  // Đóng menu khi click ra ngoài
  useEffect(() => {
    if (!showUserMenu) return;
    const handleClickOutside = (event) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target)
      ) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);
  // State lưu item đang chọn
  const [activeItem, setActiveItem] = useState('Tổng quan');
  const sidebarWidth = collapsed ? 80 : 250;

  // Hàm đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  };

  return (
    <div className="admin-dashboard-root">
      {/* Sidebar */}
      <aside className={"admin-dashboard-sidebar" + (collapsed ? " collapsed" : "")} style={{ width: sidebarWidth }}>
        <div className="td-logo-admin" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
          <a href="/admin-dashboard">
            <LogoTudo height={50} isMini={isMini} />
          </a>
          <button
            className="sidebar-toggle-btn"
            onClick={() => { setCollapsed(v => !v); setIsMini(!isMini); }}
            title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            {collapsed ? '»' : '«'}
          </button>
        </div>
        <div className="sidebar-menu-scroll">
          {/* Các item sidebar trừ Cấu hình */}
          {sidebarItems.filter(item => item !== 'Cấu hình').map(item => {
            const iconMap = {
              'Tổng quan': 'dashboard',
              'Báo cáo': 'report',
              'Hóa đơn': 'bill',
              'Mặt hàng': 'product',
              'Đặt lịch': 'calendar',
              'Nhân viên': 'user',
              'Khách hàng': 'customer',
              'Nhân viên chuỗi': 'user-group',
              'Khuyến mại': 'discount',
              'Kho hàng': 'warehouse',
              'Thu chi': 'money',
              'Chấm công': 'check',
            };
            const iconName = iconMap[item] || 'dashboard';
            return (
              <div
                key={item}
                className={
                  'admin-dashboard-sidebar-item' + (item === activeItem ? ' active' : '') + (collapsed ? ' collapsed' : '')
                }
                onClick={() => setActiveItem(item)}
              >
                <Icon name={iconName} className="sidebar-item-icon" />
                {!collapsed && (
                  <span className="sidebar-item-label">{item}</span>
                )}
              </div>
            );
          })}
        </div>
        {/* Item cuối sidebar: Cấu hình */}
        <div className="sidebar-bottom-item">
          {(() => {
            const iconName = 'setting';
            return (
              <div
                className={
                  'admin-dashboard-sidebar-item' + ('Cấu hình' === activeItem ? ' active' : '') + (collapsed ? ' collapsed' : '')
                }
                onClick={() => setActiveItem('Cấu hình')}
              >
                <Icon name={iconName} className="sidebar-item-icon" />
                {!collapsed && (
                  <span className="sidebar-item-label">Cấu hình</span>
                )}
              </div>
            );
          })()}
        </div>
      </aside>
      {/* Main content */}
      <div className="admin-dashboard-main">
        {/* Header */}
        <header className={"admin-dashboard-header" + (collapsed ? " collapsed" : "")}>
          <div style={{ fontWeight: 'bold', fontSize: 18, color: '#ffffffff' }}>{userInfo
            ? `Xin chào, ${userInfo.name || userInfo.username}`
            : 'Xin chào'}</div>
          <div className="admin-dashboard-user" ref={userMenuRef}>
            <div
              className="admin-dashboard-user-badge"
              style={{ cursor: 'pointer' }}
              onClick={() => setShowUserMenu(v => !v)}
              title="Tài khoản"
            >
              {userInfo
                ? (userInfo.name || userInfo.username || '')
                    .split(' ')
                    .map(word => word[0])
                    .join('')
                    .toUpperCase()
                : 'TDN'}
            </div>
            {/* Toggle menu user */}
            {showUserMenu && (
              <div className="admin-dashboard-user-menu">
                <div className="user-menu-info">
                  <div><b>{userInfo?.name || userInfo?.username}</b></div>
                  <div style={{ fontSize: 13, color: '#888' }}>{userInfo?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</div>
                  {userInfo?.phone && <div style={{ fontSize: 13, color: '#888' }}>SĐT: {userInfo.phone}</div>}
                </div>
                <button className="user-menu-logout" onClick={handleLogout}>Đăng xuất</button>
              </div>
            )}
          </div>
        </header>
        <div className="admin-dashboard-content">
          {activeItem === 'Tổng quan' && <Overview />}
          {activeItem === 'Báo cáo' && <Report />}
          {activeItem === 'Hóa đơn' && <Bill token={token} />}
          {activeItem === 'Mặt hàng' && <Product />}
          {activeItem === 'Đặt lịch' && <Schedule />}
          {activeItem === 'Nhân viên' && <Staff />}
          {activeItem === 'Khách hàng' && <Customer />}
          {activeItem === 'Nhân viên chuỗi' && <StaffChain />}
          {activeItem === 'Khuyến mại' && <Promotion />}
          {activeItem === 'Kho hàng' && <Warehouse />}
          {activeItem === 'Thu chi' && <RevenueExpense />}
          {activeItem === 'Chấm công' && <Timekeeping />}
          {activeItem === 'Cấu hình' && <Settings token={token} />}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
