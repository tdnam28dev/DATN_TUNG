import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useNavigate, useLocation } from 'react-router-dom';
import LogoTudo from '../../../../components/Logo_td';
import Icon from '../../../../components/Icon';
import './StaffDashboard.css';
import OrderStaff from '../order/order';
import StaffReport from '../report/report';
import StaffCustomerList from '../customer/customer';
import StaffPromotionList from '../promotion/promotion';
import { getUserById } from '../../../../api/user';
import { getRestaurantById } from '../../../../api/restaurant';
import { getTables } from '../../../../api/table';
import { getMenuItems } from '../../../../api/menuitem';


function StaffDashboard({ token, userId }) {
  // State cho sidebar
  const [collapsed, setCollapsed] = useState(true);
  const [isMini, setIsMini] = useState(false);
  // State cho sidebar item
  const [activeItem, setActiveItem] = useState('Order');
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
  // State cho thông báo
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [newOrder, setNewOrder] = useState(null);
  const socketRef = useRef(null);
  // State lưu danh sách món từ component con
  const [menuItems, setMenuItems] = useState([]);
  // State lưu danh sách bàn từ component con
  const [tables, setTables] = useState([]);

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

  // Lấy ds bàn và món khi mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resTables = await getTables(token);
        setTables(Array.isArray(resTables) ? resTables : []);
      } catch (e) { setTables([]); }
      try {
        const resMenuItems = await getMenuItems(token);
        setMenuItems(Array.isArray(resMenuItems) ? resMenuItems : []);
      } catch (e) { setMenuItems([]); }
    };
    fetchData();
  }, [token]);

  // Khởi tạo và lắng nghe socket khi userInfo thay đổi
  useEffect(() => {
    if (!userInfo || !userInfo._id) return;
    if (socketRef.current) return; // Đảm bảo chỉ khởi tạo 1 lần
    socketRef.current = io(process.env.REACT_APP_WS_URL, {
      query: { userId: userInfo._id },
      transports: ['websocket'],
    });
    // Tham gia phòng theo nhà hàng
    if (userInfo.restaurant && typeof userInfo.restaurant === 'string') {
      socketRef.current.emit('joinRoom', userInfo.restaurant);
    } else if (userInfo.restaurant && typeof userInfo.restaurant === 'object' && userInfo.restaurant._id) {
      socketRef.current.emit('joinRoom', userInfo.restaurant._id);
    }
    // Lắng nghe sự kiện thông báo chung
    socketRef.current.on('notification', (msg) => {
      setNotifications(prev => [msg, ...prev]);
      setUnreadCount(prev => prev + 1);
      console.log(msg);
    });
    // Lắng nghe sự kiện order từ khách hàng
    socketRef.current.on('customer_order', async (data) => {
      // Lấy thông tin món từ API nếu cần (hoặc truyền kèm tên món từ backend)
      let message = '';
      let detail = '';
      // Lấy số bàn từ tables
      let tableDisplay = data.table;
      if (tables && tables.length > 0) {
        const tbObj = tables.find(tb => tb._id === data.table || tb.number === data.table);
        if (tbObj) tableDisplay = tbObj.name || tbObj.number;
      }
      if (data.type === 'create') {
        message = `Khách bàn số ${tableDisplay} vừa tạo order mới.`;
        if (Array.isArray(data.items) && data.items.length > 0) {
          detail = data.items.map(i => {
            const menuItemObj = menuItems.find(m => m._id === i.menuItem);
            const itemName = menuItemObj ? menuItemObj.name : i.menuItem;
            return `• Món: ${itemName} x${i.quantity}`;
          }).join('\n');
        }
      } else if (data.type === 'update') {
        message = `Khách bàn số ${tableDisplay} vừa gọi thêm món.`;
        if (Array.isArray(data.items) && data.items.length > 0) {
          detail = data.items.map(i => {
            const menuItemObj = menuItems.find(m => m._id === i.menuItem);
            const itemName = menuItemObj ? menuItemObj.name : i.menuItem;
            return `• Món: ${itemName} ${i.type === 'new' ? '(mới)' : '(gọi thêm)'} x${i.quantity}`;
          }).join('\n');
        }
      }
      setNotifications(prev => [{
        type: data.type,
        message: message,
        detail: detail,
        time: data.time,
        items: data.items || [],
        table: data.table
      }, ...prev]);
      setUnreadCount(prev => prev + 1);
      setNewOrder(data);
      setShowNotifications(true);
    });
    // Cleanup socket khi unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [userInfo, menuItems, tables]);

  // Đóng menu user khi click ngoài
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
    'Order','Báo cáo', 'Đặt lịch', 'Khách hàng', 'Khuyến mại'
  ];

  const itemToPath = {
    'Order': '/staff-dashboard',
    'Báo cáo': '/staff-dashboard/report',
    'Đặt lịch': '/staff-dashboard/schedule',
    'Khách hàng': '/staff-dashboard/customer',
    'Khuyến mại': '/staff-dashboard/promotion',
  };

  const sidebarWidth = collapsed ? 80 : 250;

  return (
    <div className="staff-dashboard-layout">
      {/* Sidebar */}
      <aside className={"staff-dashboard__sidebar" + (collapsed ? " staff-dashboard__sidebar--collapsed" : "")} style={{ width: sidebarWidth }}>
        <div className="staff-dashboard__logo" style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
          {!collapsed && <a href="/staff-dashboard">
            <LogoTudo height={50} />
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
          {sidebarItems.filter(item => item !== 'Cấu hình').map(item => {
            const iconMap = {
              'Order': 'dashboard',
              'Báo cáo': 'report',
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
                <span style={{ marginLeft: 16, fontSize: 14, color: '#FFA827' }}>
                  ({userInfo.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'})
                </span>
                {restaurantName && (
                  <span style={{ marginLeft: 16, fontSize: 14, color: '#FFA827' }}>
                    Nhà hàng: <b>{restaurantName}</b>
                  </span>
                )}

              </>
            ) : 'Xin chào'}
          </div>
          <div className="staff-dashboard__user" ref={userMenuRef}>
            <div className="staff-dashboard__notice" style={{ position: 'relative' }}>
              <div
                className="staff-dashboard__notice-icon-wrapper"
                style={{ cursor: 'pointer', position: 'relative' }}
                onClick={() => setShowNotifications(v => !v)}
                title="Thông báo"
              >
                <Icon name="notification" className="staff-dashboard__notice-icon" />
                {unreadCount > 0 && (
                  <span className="staff-dashboard__notice-badge">{unreadCount}</span>
                )}
              </div>
              {/* Popup danh sách thông báo */}
              {showNotifications && (
                <div className="staff-dashboard__notice-popup">
                  <div className="staff-dashboard__notice-popup-title">Thông báo</div>
                  {notifications.length === 0 ? (
                    <div className="staff-dashboard__notice-empty">Không có thông báo nào.</div>
                  ) : (
                    <ul className="staff-dashboard__notice-list">
                      {notifications.map((noti, idx) => (
                        <li key={idx} className={`staff-dashboard__notice-item staff-dashboard__notice-item--${noti.type || 'info'}`}>
                          <div className="staff-dashboard__notice-message">{noti.message}</div>
                          {noti.detail && (
                            <div className="staff-dashboard__notice-detail" style={{ whiteSpace: 'pre-line', fontSize: 13, color: '#888' }}>{noti.detail}</div>
                          )}
                          <div className="staff-dashboard__notice-time">{new Date(noti.time).toLocaleString()}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            <div className="staff-dashboard__user-badge" style={{ cursor: 'pointer' }} onClick={() => setShowUserMenu(v => !v)} title="Tài khoản" >
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
          {location.pathname === '/staff-dashboard' && <OrderStaff token={token} userId={userInfo?._id} newOrder={newOrder} />}
          {location.pathname === '/staff-dashboard/report' && <StaffReport token={token} userId={userInfo?._id} />}
          {/* {location.pathname === '/staff-dashboard/schedule' && <Schedule />} */}
          {location.pathname === '/staff-dashboard/customer' && <StaffCustomerList token={token} />}
          {location.pathname === '/staff-dashboard/promotion' && <StaffPromotionList token={token} />}
        </div>
      </div>
    </div>
  );
}

export default StaffDashboard;
