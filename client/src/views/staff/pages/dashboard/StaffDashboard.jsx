import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LogoTudo from '../../../../components/Logo_td';
import Icon from '../../../../components/Icon';
import './StaffDashboard.css';
import OrderStaff from '../overview/order';
import { getUserById } from '../../../../api/user';
import { getRestaurantById } from '../../../../api/restaurant';

function StaffDashboard({ token, userId }) {
  // State cho sidebar
  const [collapsed, setCollapsed] = useState(true);
  const [isMini, setIsMini] = useState(false);
  // State cho sidebar item
  const [activeItem, setActiveItem] = useState('Tổng quan');
  // State cho menu user
  const [showUserMenu, setShowUserMenu] = useState(false);
  // Ref cho menu user
  const userMenuRef = useRef(null);
  // Lấy thông tin user từ localStorage (hoặc props)
  const [userInfo, setUserInfo] = useState(null);
  const realUserId = userId || localStorage.getItem('userId');
  // State lưu tên nhà hàng
  const [restaurantName, setRestaurantName] = useState('');
  // Hook điều hướng
  const navigate = useNavigate();
  // Hook lấy location
  const location = useLocation();

  // Lấy thông tin user khi mount
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await getUserById(realUserId, token);
        setUserInfo(data);
        if (data && data.restaurant && typeof data.restaurant === 'string') {
          try {
            const res = await getRestaurantById(data.restaurant, token);
            if (res && res.name) setRestaurantName(res.name);
          } catch { }
        } else if (data && data.restaurant && typeof data.restaurant === 'object' && data.restaurant.name) {
          setRestaurantName(data.restaurant.name);
        } else {
          setRestaurantName('');
        }
      } catch { }
    };
    fetchUserInfo();
  }, [realUserId, token]);
  useEffect(() => {
    if (!showUserMenu) return;
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Hàm đăng xuất
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  };

  const sidebarItems = [
    'Tổng quan', 'Hóa đơn', 'Đặt lịch', 'Khách hàng', 'Khuyến mại'
  ];

  const itemToPath = {
    'Tổng quan': '/staff-dashboard',
    'Hóa đơn': '/staff-dashboard/bill',
    'Đặt lịch': '/staff-dashboard/schedule',
    'Khách hàng': '/staff-dashboard/customer',
    'Khuyến mại': '/staff-dashboard/promotion',
  };

  const sidebarWidth = collapsed ? 80 : 250;

  return (
    <div>
      {/* Sidebar */}
      <aside className={"staff-dashboard__sidebar" + (collapsed ? " staff-dashboard__sidebar--collapsed" : "")} style={{ width: sidebarWidth }}>
        <div className="staff-dashboard__logo" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
          {!collapsed && <a href="/staff-dashboard">
            <LogoTudo height={50}/>
          </a>}
          {collapsed && <button
            className="staff-dashboard__sidebar-toggle-btn"
            onClick={() => { setCollapsed(v => !v); setIsMini(!isMini); }}
            title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
          >
            {collapsed ? '»' : '«'}
          </button>}
        </div>
        <div className="staff-dashboard__sidebar-menu-scroll">
          {/* Các item sidebar trừ Cấu hình */}
          {sidebarItems.filter(item => item !== 'Cấu hình').map(item => {
            const iconMap = {
              'Tổng quan': 'dashboard',
              'Hóa đơn': 'bill',
              'Đặt lịch': 'calendar',
              'Khách hàng': 'customer',
              'Khuyến mại': 'discount',
            };
            const iconName = iconMap[item] || 'dashboard';
            return (
              <div
                key={item}
                className={
                  'staff-dashboard__sidebar-item' + (item === activeItem ? ' staff-dashboard__sidebar-item--active' : '') + (collapsed ? ' staff-dashboard__sidebar-item--collapsed' : '')
                }
                onClick={() => {
                  setActiveItem(item);
                  navigate(itemToPath[item]);
                }}
              >
                <Icon name={iconName} className="staff-dashboard__sidebar-item-icon" />
                {!collapsed && (
                  <span className="staff-dashboard__sidebar-item-label">{item}</span>
                )}
              </div>
            );
          })}
        </div>
      </aside>
      {/* Main content */}
      <div className="staff-dashboard__main">
        {/* Header */}
        <header className={"staff-dashboard__header" + (collapsed ? " staff-dashboard__header--collapsed" : "")}>
          <div className="staff-dashboard__logo" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
            {collapsed && <a href="/staff-dashboard">
              <LogoTudo height={50} />
            </a>}
            {!collapsed && <button
              className="staff-dashboard__sidebar-toggle-btn"
              onClick={() => { setCollapsed(v => !v); setIsMini(!isMini); }}
              title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            >
              {collapsed ? '»' : '«'}
            </button>}
          </div>
          <div style={{ fontWeight: 'bold', fontSize: 18, color: '#ffffffff' }}>
            {userInfo ? (
              <>
                <span style={{ color: '#ffffffff' }}><b>{userInfo.name || userInfo.username}</b></span>
                <span style={{ marginLeft: 16, fontSize: 14, color: '#2563eb' }}>
                  ({userInfo.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'})
                </span>
                {restaurantName && (
                  <span style={{ marginLeft: 16, fontSize: 14, color: '#16a34a' }}>
                    Nhà hàng: <b>{restaurantName}</b>
                  </span>
                )}

              </>
            ) : 'Xin chào'}
          </div>
          <div className="staff-dashboard__user" ref={userMenuRef}>
            <div
              className="staff-dashboard__user-badge"
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
              <div className="staff-dashboard__user-menu">
                <div className="staff-dashboard__user-menu-info">
                  <div><b>{userInfo?.name || userInfo?.username}</b></div>
                  <div style={{ fontSize: 13, color: '#888' }}>{userInfo?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</div>
                  {userInfo?.phone && <div style={{ fontSize: 13, color: '#888' }}>SĐT: {userInfo.phone}</div>}
                </div>
                <button className="staff-dashboard__user-menu-logout" onClick={handleLogout}>Đăng xuất</button>
              </div>
            )}
          </div>
        </header>
        <div className="staff-dashboard__content">
          {location.pathname === '/staff-dashboard' && <OrderStaff token={token} />}
          {/* {location.pathname === '/staff-dashboard/bill' && <Bill token={token} />} */}
          {/* {location.pathname === '/staff-dashboard/schedule' && <Schedule />} */}
          {/* {location.pathname === '/staff-dashboard/customer' && <Customer />} */}
          {/* {location.pathname === '/staff-dashboard/promotion' && <Promotion />} */}
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;
