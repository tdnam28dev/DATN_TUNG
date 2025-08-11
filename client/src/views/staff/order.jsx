import React, { useEffect, useState, useRef } from 'react';
import './order_header.css';
import './order_staff_card.css';
import { getTables } from '../../api/table';
import { getMenus } from '../../api/menu';
import { getMenuItems } from '../../api/menuitem';
import { getRestaurantById } from '../../api/restaurant';
import { createOrder, getOrders, updateOrder, payOrder, cancelOrder } from '../../api/order';
    

// Giao diện order cho nhân viên quầy
function OrderStaff({ token, userId }) {
    // State lưu tên nhà hàng
    const [restaurantName, setRestaurantName] = useState('');
    // Lấy thông tin user để hiển thị header
    const [userInfo, setUserInfo] = useState(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef(null);
    const realUserId = userId || localStorage.getItem('userId');
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const res = await import('../../api/user');
                const data = await res.getUserById(realUserId, token);
                setUserInfo(data);
                // Nếu user có trường restaurant là id, lấy thông tin nhà hàng
                if (data && data.restaurant && typeof data.restaurant === 'string') {
                    try {
                        const res = await getRestaurantById(data.restaurant, token);
                        if (res && res.name) setRestaurantName(res.name);
                    } catch {}
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
    const [tables, setTables] = useState([]);
    const [menus, setMenus] = useState([]);
    // State cho filter loại món (danh sách loại menu lấy từ menu)
    // Lưu danh sách loại món: [{type, menuId}]
    const [filterType, setFilterType] = useState('');
    const [menuTypeList, setMenuTypeList] = useState([]);
    const [orders, setOrders] = useState([]); // danh sách hóa đơn pending/completed
    const [selectedTable, setSelectedTable] = useState(null); // object table
    const [cart, setCart] = useState([]); // {menuItem, quantity}
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Hàm load lại toàn bộ dữ liệu
    const fetchAllData = async () => {
        setLoading(true);
        const t = await getTables(token);
        setTables(t);
        let allItems = [];
        try {
            const menuItems = await getMenuItems(token);
            allItems = Array.isArray(menuItems) ? menuItems : [];
        } catch (e) { }
        const m = await getMenus(token);
        let menuMap = {};
        let menuTypeListTmp = [];
        m.forEach(menu => {
            // Chỉ thêm vào filter nếu có type và name hợp lệ
            if (menu.type && menu._id && menu.name && menu.type.trim() && menu.name.trim()) {
                menuTypeListTmp.push({ type: menu.type, menuId: menu._id, menuName: menu.name });
            }
            if (Array.isArray(menu.items)) {
                menu.items.forEach(i => {
                    menuMap[i] = { menuName: menu.name, menuId: menu._id };
                });
            }
        });
        allItems = allItems.map(i => ({ ...i, menuName: menuMap[i._id]?.menuName || '', menuId: menuMap[i._id]?.menuId || '' }));
        setMenus(allItems);
        setMenuTypeList(menuTypeListTmp);
        // Lấy danh sách hóa đơn
        const od = await getOrders(token);
        setOrders(Array.isArray(od) ? od : []);
        setLoading(false);
    };

    useEffect(() => {
        fetchAllData();
        // eslint-disable-next-line
    }, [token]);

    // Chọn bàn để order
    const handleSelectTable = (tb) => {
        setSelectedTable(tb);
        // Nếu bàn đã có hóa đơn pending thì lấy giỏ hàng từ hóa đơn đó
        const existOrder = orders.find(o => o.table === tb._id && o.status === 'pending');
        if (existOrder) {
            setCart(existOrder.items.map(i => ({ menuItem: menus.find(m => m._id === i.menuItem), quantity: i.quantity })));
        } else {
            setCart([]);
        }
        setMessage('');
    };

    // Thêm món vào giỏ
    const addToCart = (item) => {
        setCart(prev => {
            const found = prev.find(i => i.menuItem._id === item._id);
            if (found) {
                return prev.map(i => i.menuItem._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { menuItem: item, quantity: 1 }];
        });
    };

    // Xóa món khỏi giỏ
    const removeFromCart = (id) => {
        setCart(prev => prev.filter(i => i.menuItem._id !== id));
    };

    // Thay đổi số lượng
    const changeQuantity = (id, qty) => {
        setCart(prev => prev.map(i => i.menuItem._id === id ? { ...i, quantity: Math.max(1, qty) } : i));
    };

    // Tổng tiền
    const total = cart.reduce((sum, i) => sum + (i.menuItem.price * i.quantity), 0);

    // Lưu/tạo hóa đơn (pending)
    const handleSaveOrder = async () => {
        if (!selectedTable) {
            setMessage('Vui lòng chọn bàn!');
            return;
        }
        if (cart.length === 0) {
            setMessage('Vui lòng chọn ít nhất 1 món!');
            return;
        }
        setLoading(true);
        // Kiểm tra đã có hóa đơn pending chưa
        const existOrder = orders.find(o => o.table === selectedTable._id && o.status === 'pending');
        let res;
        if (existOrder) {
            // Gọi API tạm lưu hóa đơn (cập nhật items, total)
            res = await updateOrder(existOrder._id, {
                table: selectedTable._id,
                items: cart.map(i => ({ menuItem: i.menuItem._id, quantity: i.quantity })),
                total,
                status: 'pending',
                // Thêm trường nhà hàng cho hóa đơn
                restaurant: (userInfo && userInfo.restaurant) ? (typeof userInfo.restaurant === 'object' ? userInfo.restaurant._id : userInfo.restaurant) : (selectedTable.restaurant || '')
            }, token);
        } else {
            res = await createOrder({
                table: selectedTable._id,
                items: cart.map(i => ({ menuItem: i.menuItem._id, quantity: i.quantity })),
                total,
                status: 'pending',
                // Thêm trường nhà hàng cho hóa đơn
                restaurant: (userInfo && userInfo.restaurant) ? (typeof userInfo.restaurant === 'object' ? userInfo.restaurant._id : userInfo.restaurant) : (selectedTable.restaurant || '')
            }, token);
        }
        setMessage(res._id ? 'Đã lưu hóa đơn!' : res.error || 'Lỗi');
        await fetchAllData();
        setLoading(false);
    };

    // Thanh toán hóa đơn
    const handlePayOrder = async () => {
        if (!selectedTable) return;
        const existOrder = orders.find(o => o.table === selectedTable._id && o.status === 'pending');
        if (!existOrder) {
            setMessage('Không có hóa đơn chờ thanh toán!');
            return;
        }
        setLoading(true);
        const res = await payOrder(existOrder._id, token);
        setMessage(res._id ? 'Đã thanh toán!' : res.error || 'Lỗi');
        // Sau khi thanh toán, reload lại dữ liệu và reset selectedTable để cho phép order mới
        await fetchAllData();
        setCart([]);
        setSelectedTable(null);
        setLoading(false);
    };

    // Hủy hóa đơn
    const handleCancelOrder = async () => {
        if (!selectedTable) return;
        const existOrder = orders.find(o => o.table === selectedTable._id && o.status === 'pending');
        if (!existOrder) {
            setMessage('Không có hóa đơn chờ hủy!');
            return;
        }
        setLoading(true);
        const res = await cancelOrder(existOrder._id, token);
        setMessage(res._id ? 'Đã hủy hóa đơn!' : res.error || 'Lỗi');
        await fetchAllData();
        setCart([]);
        setSelectedTable(null);
        setLoading(false);
    };

    // Hàm đăng xuất
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        window.location.href = '/login';
    };

    return (
        <div className="orderStaff">
            {/* Header riêng cho order staff */}
            <header className="orderStaff__headerBar">
                <div className="orderStaff__headerBarTitle">
                    {userInfo ? (
                        <>
                            <span>Xin chào, <b>{userInfo.name || userInfo.username}</b></span>
                            <span style={{ marginLeft: 16, fontSize: 14, color: '#2563eb' }}>
                                ({userInfo.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'})
                            </span>
                            {restaurantName && (
                                <span style={{ marginLeft: 16, fontSize: 14, color: '#16a34a' }}>
                                    Nhà hàng: <b>{restaurantName}</b>
                                </span>
                            )}
                            {userInfo.phone && (
                                <span style={{ marginLeft: 16, fontSize: 14, color: '#888' }}>
                                    SĐT: {userInfo.phone}
                                </span>
                            )}
                        </>
                    ) : 'Xin chào'}
                </div>
                <div className="orderStaff__user" ref={userMenuRef}>
                    <div
                        className="orderStaff__userBadge"
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
                    {showUserMenu && (
                        <div className="orderStaff__userMenu">
                            <div className="orderStaff__userMenuInfo">
                                <div><b>{userInfo?.name || userInfo?.username}</b></div>
                                <div style={{ fontSize: 13, color: '#888' }}>{userInfo?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</div>
                                {userInfo?.phone && <div style={{ fontSize: 13, color: '#888' }}>SĐT: {userInfo.phone}</div>}
                            </div>
                            <button className="orderStaff__userLogout" onClick={handleLogout}>Đăng xuất</button>
                        </div>
                    )}
                </div>
            </header>
            {/* Danh sách bàn dạng thẻ */}
            <div className="orderStaff__tableList">
                {tables.map(tb => {
                    // Chỉ lấy order trạng thái pending cho mỗi bàn
                    const order = orders.find(o => o.table === tb._id && o.status === 'pending');
                    const isPending = !!order;
                    return (
                        <div
                            key={tb._id}
                            className={`orderStaff__tableCard${selectedTable && selectedTable._id === tb._id ? ' orderStaff__tableCard--active' : ''}`}
                            onClick={() => handleSelectTable(tb)}
                        >
                            <div className={`orderStaff__tableStatus ${tb.status}`}>{tb.status === 'available' ? 'Trống' : tb.status === 'reserved' ? 'Đã đặt' : 'Đang sử dụng'}</div>
                            <div className="orderStaff__tableInfo">Bàn {tb.number} - {tb.seats} ghế</div>
                            <div className="orderStaff__tableType">{tb.type === 'round' ? 'Tròn' : tb.type === 'square' ? 'Vuông' : 'Gia đình'}</div>
                            {isPending && (
                                <button className="orderStaff__tableCard__payBtn" type="button" disabled={loading} onClick={e => { e.stopPropagation(); setSelectedTable(tb); if (window.confirm('Xác nhận thanh toán hóa đơn?')) handlePayOrder(); }}>Thanh toán</button>
                            )}
                        </div>
                    );
                })}
            </div>
            {/* Box order cho bàn đã chọn */}
            {selectedTable && (
                <div className="orderStaff__orderBox">
                    <div className="orderStaff__orderTitle">Order cho bàn {selectedTable.number}</div>
                    {/* Thông tin hóa đơn hiện tại nếu có */}
                    {(() => {
                        // Chỉ lấy order trạng thái pending cho box order
                        const order = orders.find(o => o.table === selectedTable._id && o.status === 'pending');
                        if (!order) return null;
                        return (
                            <div style={{ marginBottom: 8, color: '#2563eb' }}>
                                Trạng thái hóa đơn: <b>Chờ thanh toán</b>
                                {/* Nút thanh toán và hủy hóa đơn nếu hóa đơn đang pending */}
                                <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                                    <button
                                        className="orderStaff__orderPayBtn"
                                        type="button"
                                        disabled={loading}
                                        onClick={() => {
                                            if (window.confirm('Xác nhận thanh toán hóa đơn này?')) handlePayOrder();
                                        }}
                                    >
                                        {loading ? 'Đang thanh toán...' : 'Thanh toán'}
                                    </button>
                                    <button
                                        className="orderStaff__orderCancelBtn"
                                        type="button"
                                        disabled={loading}
                                        onClick={() => {
                                            if (window.confirm('Xác nhận hủy hóa đơn này?')) handleCancelOrder();
                                        }}
                                    >
                                        {loading ? 'Đang hủy...' : 'Hủy hóa đơn'}
                                    </button>
                                </div>
                            </div>
                        );
                    })()}
                    {/* Bộ lọc loại món ăn */}
                    <div style={{ marginBottom: 12 }}>
                        <select
                            style={{ padding: 7, borderRadius: 6, border: '1px solid #d1d5db', minWidth: 160 }}
                            value={filterType}
                            onChange={e => setFilterType(e.target.value)}
                        >
                            <option value="">Tất cả loại món</option>
                            {menuTypeList.map(type => (
                                <option key={type.menuId} value={type.menuId}>{type.type}</option>
                            ))}
                        </select>
                    </div>
                    <div className="orderStaff__orderMenuList">
                        {(() => {
                            let filtered = menus;
                            if (filterType) {
                                filtered = menus.filter(item => item.menuId === filterType);
                            }
                            if (filtered.length === 0) {
                                return <div style={{color:'#888',padding:'16px 0'}}>Không có món nào thuộc loại này.</div>;
                            }
                            return filtered.map(item => (
                                <div className="orderStaff__orderMenuItem" key={item._id} onClick={() => addToCart(item)}>
                                    <img className="orderStaff__orderMenuImg" src={item.image || '/images/default-food.png'} alt={item.name} />
                                    <div className="orderStaff__orderMenuName">{item.name}</div>
                                    <div className="orderStaff__orderMenuPrice">{item.price?.toLocaleString()} đ</div>
                                    <div style={{ fontSize: 13, color: '#888' }}>Menu: {item.menuName}</div>
                                    <button className="orderStaff__orderAddBtn" type="button" disabled={loading}>Thêm</button>
                                </div>
                            ));
                        })()}
                    </div>
                    {/* Giỏ hàng cho bàn này */}
                    <table className="orderStaff__orderCartTable">
                        <thead>
                            <tr>
                                <th className="orderStaff__orderCartTh">Tên món</th>
                                <th className="orderStaff__orderCartTh">Đơn giá</th>
                                <th className="orderStaff__orderCartTh">Số lượng</th>
                                <th className="orderStaff__orderCartTh">Thành tiền</th>
                                <th className="orderStaff__orderCartTh">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map(i => (
                                <tr key={i.menuItem._id} className="orderStaff__orderCartTr">
                                    <td className="orderStaff__orderCartTd">{i.menuItem.name}</td>
                                    <td className="orderStaff__orderCartTd">{i.menuItem.price?.toLocaleString()} đ</td>
                                    <td className="orderStaff__orderCartTd">
                                        <input
                                            type="number"
                                            min={1}
                                            value={i.quantity}
                                            style={{ width: 50, textAlign: 'center' }}
                                            onChange={e => changeQuantity(i.menuItem._id, Number(e.target.value))}
                                            disabled={loading}
                                        />
                                    </td>
                                    <td className="orderStaff__orderCartTd">{(i.menuItem.price * i.quantity).toLocaleString()} đ</td>
                                    <td className="orderStaff__orderCartTd">
                                        <button className="orderStaff__orderCartActionBtn" type="button" onClick={() => removeFromCart(i.menuItem._id)} disabled={loading}>Xóa</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="orderStaff__orderCartTotal">Tổng cộng: {total.toLocaleString()} đ</div>
                    <button className="orderStaff__orderSubmitBtn" type="button" onClick={handleSaveOrder} disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Lưu hóa đơn'}
                    </button>
                    <div className="orderStaff__orderMsg">{message}</div>
                </div>
            )}
        </div>
    );
}

export default OrderStaff;
