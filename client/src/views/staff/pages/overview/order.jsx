import React, { useEffect, useState } from 'react';
import './order_header.css';
import './order_staff_content.css';
import { getTables } from '../../../../api/table';
import { getMenus } from '../../../../api/menu';
import { getMenuItems } from '../../../../api/menuitem';
import { createOrder, getOrders, updateOrder, payOrder, cancelOrder } from '../../../../api/order';


// Giao diện order cho nhân viên quầy
function OrderStaff({ token, userId }) {
    // Đã bỏ lấy thông tin người dùng, chỉ giữ các state liên quan đến order
    // bộ lọc
    const [filterStatus, setFilterStatus] = useState('');
    const [filterSeats, setFilterSeats] = useState('');
    const [filterTypeTable, setFilterTypeTable] = useState('');
    // Đã bỏ useEffect lấy thông tin người dùng
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
        let t = await getTables(token);
        t = Array.isArray(t) ? t : [];
        setTables(t);
        let allItems = [];
        try {
            const menuItems = await getMenuItems(token);
            allItems = Array.isArray(menuItems) ? menuItems : [];
        } catch (e) { }
        let m = await getMenus(token);
        m = Array.isArray(m) ? m : [];
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
                restaurant: selectedTable.restaurant || ''
            }, token);
        } else {
            res = await createOrder({
                table: selectedTable._id,
                items: cart.map(i => ({ menuItem: i.menuItem._id, quantity: i.quantity })),
                total,
                status: 'pending',
                restaurant: selectedTable.restaurant || ''
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

    return (
        <div className="orderStaff">
            {/* Header riêng cho order staff */}
            

            <div className="orderStaff_content">
                {/* Bộ lọc bàn */}
                <div className="orderStaff__tableFilter" style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: 6, borderRadius: 6 }}>
                        <option value="">Tất cả trạng thái</option>
                        <option value="available">Trống</option>
                        <option value="reserved">Đã đặt</option>
                        <option value="occupied">Đang sử dụng</option>
                    </select>
                    <select value={filterSeats} onChange={e => setFilterSeats(e.target.value)} style={{ padding: 6, borderRadius: 6 }}>
                        <option value="">Tất cả số ghế</option>
                        {[...new Set(tables.map(tb => tb.seats))].sort((a, b) => a - b).map(seat => (
                            <option key={seat} value={seat}>{seat} ghế</option>
                        ))}
                    </select>
                    <select value={filterTypeTable} onChange={e => setFilterTypeTable(e.target.value)} style={{ padding: 6, borderRadius: 6 }}>
                        <option value="">Tất cả kiểu bàn</option>
                        <option value="round">Tròn</option>
                        <option value="square">Vuông</option>
                        <option value="family">Gia đình</option>
                    </select>
                </div>
                {/* Danh sách bàn dạng thẻ */}
                <div className="orderStaff__tableList">
                    {(() => {
                        // Lọc bàn theo trạng thái, số ghế, kiểu bàn
                        let filtered = tables;
                        if (filterStatus) {
                            filtered = filtered.filter(item => item.status === filterStatus);
                        }
                        if (filterSeats) {
                            filtered = filtered.filter(item => String(item.seats) === String(filterSeats));
                        }
                        if (filterTypeTable) {
                            filtered = filtered.filter(item => item.type === filterTypeTable);
                        }
                        if (filtered.length === 0) {
                            return <div style={{ color: '#888', padding: '16px 0' }}>Không có bàn nào phù hợp bộ lọc.</div>;
                        }
                        // Trả về kết quả map
                        return filtered.map(tb => {
                            // const order = orders.find(o => o.table === tb._id && o.status === 'pending');
                            // const isPending = !!order;
                            return (
                                <div
                                    key={tb._id}
                                    className={`orderStaff__tableCard${selectedTable && selectedTable._id === tb._id ? ' orderStaff__tableCard--active' : ''}`}
                                    onClick={() => handleSelectTable(tb)}
                                >
                                    <div className={`orderStaff__tableStatus ${tb.status}`}>{tb.status === 'available' ? 'Trống' : tb.status === 'reserved' ? 'Đã đặt' : 'Đang sử dụng'}</div>
                                    <div className="orderStaff__tableInfo">Bàn {tb.number} - {tb.seats} ghế</div>
                                    <div className="orderStaff__tableType">{tb.type === 'round' ? 'Tròn' : tb.type === 'square' ? 'Vuông' : 'Gia đình'}</div>
                                    
                                </div>
                            );
                        });
                    })()}
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
                                    return <div style={{ color: '#888', padding: '16px 0' }}>Không có món nào thuộc loại này.</div>;
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
        </div>
    );
}

export default OrderStaff;
