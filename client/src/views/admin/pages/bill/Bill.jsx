import React, { useEffect, useState } from 'react';
import { getOrders, updateOrder, deleteOrder } from '../../../../api/order';
import { getUserById } from '../../../../api/user';
import { getTables } from '../../../../api/table';
import { getRestaurants } from '../../../../api/restaurant';
import './Bill.css';

function Bill({ token }) {
  // State cho popup chi tiết hóa đơn
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);
  const [paidUser, setPaidUser] = useState(null); // Lưu thông tin người thanh toán
  const [createdUser, setCreatedUser] = useState(null); // Lưu thông tin người tạo hóa đơn
  // State cho hóa đơn
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  // Bộ lọc loại: all, today, week, month
  const [filterType, setFilterType] = useState('all');
  // Bộ lọc giá trị: ngày, tháng
  const [filterDate, setFilterDate] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  // State cho trạng thái sửa hóa đơn
  const [isEditOrder, setIsEditOrder] = useState(false);
  // State lưu thông tin hóa đơn đang chỉnh sửa
  const [editOrderDetail, setEditOrderDetail] = useState(null);
  // State cho bộ lọc nhà hàng
  const [restaurantList, setRestaurantList] = useState([]);
  const [filterRestaurant, setFilterRestaurant] = useState('');
  // Lấy toàn bộ danh sách nhà hàng
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const res = await getRestaurants(token);
        if (Array.isArray(res)) setRestaurantList(res);
      } catch { }
    };
    fetchRestaurants();
  }, [token]);

  // Lấy toàn bộ danh sách bàn
  const [tableList, setTableList] = useState([]);
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await getTables(token);
        if (Array.isArray(res)) setTableList(res);
      } catch { }
    };
    fetchTables();
  }, [token]);

  // State lưu danh sách món ăn
  const [menuItems, setMenuItems] = useState([]);
  // Lấy toàn bộ danh sách món ăn
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const { getMenuItems } = await import('../../../../api/menuitem');
        const res = await getMenuItems(token);
        if (Array.isArray(res)) setMenuItems(res);
      } catch { }
    };
    fetchMenuItems();
  }, [token]);

  // Lấy danh sách hóa đơn và gán tên bàn, tên nhà hàng từ danh sách đã lấy
  const fetchOrders = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getOrders(token);
      if (Array.isArray(res)) {
        const ordersWithNames = res.map(order => {
          let tableName = order.table;
          let restaurantName = order.restaurant;
          // Tìm tên bàn từ danh sách bàn
          const tb = tableList.find(t => t._id === order.table);
          if (tb) tableName = tb.number ? `Bàn ${tb.number}` : tableName;
          // Tìm tên nhà hàng từ danh sách nhà hàng
          const rs = restaurantList.find(r => r._id === order.restaurant);
          if (rs) restaurantName = rs.name || restaurantName;
          return { ...order, tableName, restaurantName };
        });
        setOrders(ordersWithNames);
      } else {
        setOrders([]);
      }
    } catch { }
    setLoading(false);
  }, [token, tableList, restaurantList]);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Hàm lưu hóa đơn khi chỉnh sửa trong popup chi tiết
  const handleUpdateOrderDetail = async () => {
    if (!editOrderDetail) return;
    if (!editOrderDetail.table) {
      alert('Vui lòng chọn bàn!');
      return;
    }
    if (!editOrderDetail.items || editOrderDetail.items.length === 0) {
      alert('Vui lòng chọn ít nhất 1 món!');
      return;
    }
    setLoading(true);
    // Gọi API cập nhật hóa đơn
    let res = await updateOrder(editOrderDetail._id, {
      table: editOrderDetail.table || orderDetail.table,
      items: editOrderDetail.items.map(i => ({ menuItem: i.menuItem._id || i.menuItem, quantity: i.quantity })),
      total: editOrderDetail.total,
      status: editOrderDetail.status || orderDetail.status,
      restaurant: orderDetail.restaurant
    }, token);
    setLoading(false);
    setIsEditOrder(false);
    setEditOrderDetail(null);
    setShowOrderDetail(false);
    fetchOrders();
    alert(res._id ? 'Đã lưu hóa đơn!' : res.error || 'Lỗi');
  };

  // Hàm xóa hóa đơn
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Xác nhận xóa hóa đơn?')) {
      setLoading(true);
      await deleteOrder(orderId, token);
      setLoading(false);
      fetchOrders();
      setShowOrderDetail(false);
    }
  };

  // Lọc hóa đơn
  const filteredOrders = orders.filter(order => {
    // Lọc theo nhà hàng
    if (filterRestaurant && order.restaurant !== filterRestaurant && order.restaurantName !== filterRestaurant) return false;
    if (filterType === 'all') return true;
    if (filterType === 'today') {
      // Nếu có filterDate thì lọc đúng ngày, nếu không thì lấy hóa đơn trong hôm nay
      const today = new Date();
      const orderDate = new Date(order.createdAt);
      if (filterDate) {
        return order.createdAt.slice(0, 10) === filterDate;
      }
      return orderDate.getDate() === today.getDate() && orderDate.getMonth() === today.getMonth() && orderDate.getFullYear() === today.getFullYear();
    }
    if (filterType === 'week') {
      // Lấy hóa đơn trong tuần này
      const now = new Date();
      const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const lastDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      const orderDate = new Date(order.createdAt);
      return orderDate >= firstDayOfWeek && orderDate <= lastDayOfWeek;
    }
    if (filterType === 'month') {
      // Nếu có filterMonth thì lọc đúng tháng, nếu không thì lấy hóa đơn trong tháng này
      const now = new Date();
      const orderDate = new Date(order.createdAt);
      if (filterMonth) {
        return order.createdAt.slice(0, 7) === filterMonth;
      }
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  return (
    <div className="billManager">
      <h2 className="billManager__title">Quản lý hóa đơn</h2>
      {/* Bộ lọc hóa đơn */}
      <div className="billManager__filter">
        {/* Bộ lọc nhà hàng */}
        <select className="billManager__filterSelect" value={filterRestaurant} onChange={e => setFilterRestaurant(e.target.value)}>
          <option value="">Tất cả nhà hàng</option>
          {restaurantList.map(r => (
            <option key={r._id || r.name} value={r._id || r.name}>{r.name}</option>
          ))}
        </select>
        {/* Bộ lọc loại hóa đơn */}
        <select className="billManager__filterSelect" value={filterType} onChange={e => { setFilterType(e.target.value); setFilterDate(''); setFilterMonth(''); }}>
          <option value="all">Tất cả hóa đơn</option>
          <option value="today">Theo ngày</option>
          <option value="week">Trong tuần này</option>
          <option value="month">Theo tháng</option>
        </select>
        {/* Bộ lọc giá trị */}
        {filterType === 'today' && (
          <input className="billManager__filterInput" type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
        )}
        {filterType === 'month' && (
          <input className="billManager__filterInput" type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} />
        )}
      </div>
      {/* Danh sách hóa đơn */}
      <div className="billManager__list">
        {loading ? <div className="billManager__loading">Đang tải...</div> : filteredOrders.length === 0 ? <div className="billManager__empty">Không có hóa đơn phù hợp.</div> : (
          <table className="billManager__table" style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr>
                <th className="billManager__th">Mã hóa đơn</th>
                <th className="billManager__th">Nhà hàng</th>
                <th className="billManager__th">Bàn</th>
                <th className="billManager__th">Số lượng</th>
                <th className="billManager__th">Tổng tiền</th>
                <th className="billManager__th">Trạng thái</th>
                <th className="billManager__th">Ngày tạo</th>
                <th className="billManager__th">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order._id} className="billManager__tr">
                  <td className="billManager__td">{order._id}</td>
                  <td className="billManager__td">{order.restaurantName || order.restaurant}</td>
                  <td className="billManager__td">{order.tableName || order.table}</td>
                  <td className="billManager__td">{order.items ? order.items.reduce((sum, i) => sum + (i.quantity || 0), 0) : 0}</td>
                  <td className="billManager__td">{order.total?.toLocaleString()} đ</td>
                  <td className={`billManager__td billManager__td--status billManager__td--status-${order.status}`}>{order.status}</td>
                  <td className="billManager__td">{new Date(order.createdAt).toLocaleString()}</td>
                  <td className="billManager__td">
                    <button className="billManager__cardBtn" style={{ background: '#e0e7ff', color: '#2563eb' }} onClick={async () => {
                      setOrderDetail(order);
                      setShowOrderDetail(true);
                      // Lấy thông tin người thanh toán
                      if (order.paidBy) {
                        try {
                          const user = await getUserById(order.paidBy, token);
                          setPaidUser(user);
                        } catch {
                          setPaidUser(null);
                        }
                      } else {
                        setPaidUser(null);
                      }
                      // Lấy thông tin người tạo hóa đơn
                      if (order.createdBy) {
                        try {
                          const user = await getUserById(order.createdBy, token);
                          setCreatedUser(user);
                        } catch {
                          setCreatedUser(null);
                        }
                      } else {
                        setCreatedUser(null);
                      }
                    }}>Chi tiết</button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showOrderDetail && orderDetail && (
        <div className="billManager__popupOverlay">
          <div className="billManager__popup billManager__popup--detail">
            <h3 className="billManager__popupTitle__detail">Chi tiết hóa đơn</h3>
            <div className="billManager__popupInfo">
              <div className="billManager__popupInfoRow"><span>Mã hóa đơn:</span> <b>{orderDetail._id}</b></div>
              <div className="billManager__popupInfoRow"><span>Nhà hàng:</span><b>{orderDetail.restaurantName || orderDetail.restaurant}</b></div>
              <div className="billManager__popupInfoRow">
                <span>Bàn:</span>
                {isEditOrder ? (
                  <select
                    className="billManager__popupSelect"
                    value={editOrderDetail?.table || orderDetail.table}
                    onChange={e => setEditOrderDetail({ ...editOrderDetail, table: e.target.value })}
                  >
                    {tableList
                      .filter(tb => tb.restaurant === orderDetail.restaurant)
                      .map(tb => (
                        <option key={tb._id} value={tb._id}>{tb.number ? `Bàn ${tb.number}` : tb._id}</option>
                      ))}
                  </select>
                ) : (
                  <b>{orderDetail.tableName || orderDetail.table}</b>
                )}
              </div>
              {/* Thông tin người tạo hóa đơn */}
              <div className="billManager__popupInfoRow"><span>Người tạo hóa đơn:</span> <b>{createdUser ? (createdUser.name || createdUser.username || createdUser._id) : '-'}</b></div>
              {/* Thông tin người thanh toán */}
              <div className="billManager__popupInfoRow"><span>Người thanh toán:</span> <b>{paidUser ? (paidUser.name || paidUser.username || paidUser._id) : '-'}</b></div>
              <div className="billManager__popupInfoRow">
                <span>Trạng thái:</span>
                {isEditOrder ? (
                  <select
                    className="billManager__popupSelect"
                    value={editOrderDetail?.status || orderDetail.status}
                    onChange={e => setEditOrderDetail({ ...editOrderDetail, status: e.target.value })}
                  >
                    <option value="pending">Chờ thanh toán</option>
                    <option value="completed">Đã thanh toán</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                ) : (
                  <b className={`billManager__popupStatus billManager__td--status billManager__td--status-${orderDetail.status}`}>{orderDetail.status}</b>
                )}
              </div>
              <div className="billManager__popupInfoRow"><span>Tổng tiền:</span> <b style={{ color: '#2563eb' }}>{isEditOrder ? (editOrderDetail?.total?.toLocaleString() || '0') : (orderDetail.total?.toLocaleString() || '0')} đ</b></div>
              <div className="billManager__popupInfoRow"><span>Ngày tạo:</span> <b>{new Date(orderDetail.createdAt).toLocaleString()}</b></div>
              <div className="billManager__popupInfoRow"><span>Cập nhật gần nhất:</span> <b>{orderDetail.updatedAt ? new Date(orderDetail.updatedAt).toLocaleString() : '--'}</b></div>
            </div>
            <div className="billManager__popupListTitle">Danh sách món ăn</div>
            <table className="billManager__popupTableFood">
              <thead>
                <tr>
                  <th>Tên món</th>
                  <th>Đơn giá</th>
                  <th>Số lượng</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {(isEditOrder ? editOrderDetail?.items : orderDetail.items)?.map((i, idx) => {
                  const item = menuItems.find(m => m._id === (i.menuItem._id || i.menuItem));
                  return (
                    <tr key={idx}>
                      <td>{item?.name || '---'}</td>
                      <td style={{ textAlign: 'right' }}>{item?.price?.toLocaleString() || '---'} đ</td>
                      <td style={{ textAlign: 'center' }}>
                        {!isEditOrder && <span>{i.quantity}</span>}
                        {isEditOrder && (
                          <input type="number" min={1} value={i.quantity}
                            onChange={e => {
                              const newItems = [...editOrderDetail.items];
                              newItems[idx].quantity = Math.max(1, Number(e.target.value));
                              // Tính lại tổng tiền
                              let newTotal = 0;
                              newItems.forEach((itm) => {
                                const mItem = menuItems.find(m => m._id === (itm.menuItem._id || itm.menuItem));
                                if (mItem) newTotal += mItem.price * itm.quantity;
                              });
                              setEditOrderDetail({ ...editOrderDetail, items: newItems, total: newTotal });
                            }}
                          />
                        )}
                      </td>
                      <td style={{ textAlign: 'right', color: '#2563eb', fontWeight: 600 }}>
                        {item ? ((item.price * i.quantity).toLocaleString()) : '---'} đ
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className='billManager__popupFooter'>
              {!isEditOrder && (
                <button className="billManager__popupBtn" onClick={() => {
                  setIsEditOrder(true);
                  // Khởi tạo dữ liệu chỉnh sửa
                  setEditOrderDetail({ ...orderDetail });
                }}>Sửa</button>
              )}
              {isEditOrder && (
                <button className="billManager__popupBtn" onClick={handleUpdateOrderDetail}>Lưu</button>
              )}
              {isEditOrder && (
                <button className="billManager__popupBtn billManager__cardBtn--danger" onClick={() => {
                  setIsEditOrder(false);
                  setEditOrderDetail(null);
                }}>Hủy</button>
              )}
              {!isEditOrder && (
                <button className="billManager__popupBtn billManager__cardBtn--danger" onClick={() => handleDeleteOrder(orderDetail._id)}>Xóa</button>
              )}
              {!isEditOrder && (
                <button className="billManager__popupBtn__detail__close" onClick={() => setShowOrderDetail(false)}>Đóng</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bill;
