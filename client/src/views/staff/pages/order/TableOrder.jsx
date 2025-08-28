import React, { useEffect, useState } from 'react';
import { createOrder, updateOrder, payOrder, cancelOrder } from '../../../../api/order';

// Giao diện order cho một bàn cụ thể
function TableOrder({ token, userId, selectedTable, setShowOrderPage, setSelectedTable, menus, menuItems, orders, reloadData }) {
    // Nhận dữ liệu từ props
    const [cart, setCart] = useState([]);
    const [filterType, setFilterType] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [menuTypeList, setMenuTypeList] = useState([]);

    // Khi chọn bàn, nếu có hóa đơn pending thì lấy giỏ hàng từ hóa đơn đó
    useEffect(() => {
        if (!selectedTable) return;
        const existOrder = orders.find(o => o.table === selectedTable._id && o.status === 'pending');
        if (existOrder) {
            setCart(existOrder.items.map(i => ({ menuItem: menuItems.find(m => m._id === i.menuItem), quantity: i.quantity })));
        } else {
            setCart([]);
        }
        setMessage('');
    }, [selectedTable, orders, menuItems]);

    // Merge thông tin menuId/menuName vào menuItems để hiển thị đúng danh sách món
    const [mergedMenuItems, setMergedMenuItems] = useState([]);
    useEffect(() => {
        // Tạo map từ menu
        let menuMap = {};
        menus.forEach(menu => {
            if (Array.isArray(menu.items)) {
                menu.items.forEach(itemId => {
                    menuMap[itemId] = { menuId: menu._id, menuName: menu.name, type: menu.type };
                });
            }
        });
        // Merge vào menuItems
        const merged = menuItems.map(item => ({
            ...item,
            menuId: menuMap[item._id]?.menuId || '',
            menuName: menuMap[item._id]?.menuName || '',
            type: menuMap[item._id]?.type || ''
        }));
        setMergedMenuItems(merged);
        // Tạo danh sách loại món
        let menuTypeListTmp = [];
        merged.forEach(item => {
            if (item.menuId && item.menuName && item.type) {
                if (!menuTypeListTmp.find(t => t.menuId === item.menuId)) {
                    menuTypeListTmp.push({ type: item.type, menuId: item.menuId, menuName: item.menuName });
                }
            }
        });
        setMenuTypeList(menuTypeListTmp);
    }, [menus, menuItems]);

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
    // Tổng tiền, kiểm tra menuItem tồn tại
    const total = cart.reduce((sum, i) => {
        if (!i.menuItem || typeof i.menuItem.price !== 'number') return sum;
        return sum + (i.menuItem.price * i.quantity);
    }, 0);

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
        const existOrder = orders.find(o => o.table === selectedTable._id && o.status === 'pending');
        let res;
        const orderData = {
            table: selectedTable._id,
            items: cart.map(i => ({ menuItem: i.menuItem._id, quantity: i.quantity })),
            total,
            status: 'pending',
            restaurant: selectedTable.restaurant || ''
        };
        if (existOrder) {
            res = await updateOrder(existOrder._id, orderData, token);
        } else {
            res = await createOrder(orderData, token);
        }
        setMessage(res._id ? 'Đã lưu hóa đơn!' : res.error || 'Lỗi');
        if (typeof reloadData === 'function') reloadData();
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
        // Truyền paidBy khi thanh toán
        const res = await payOrder(existOrder._id, token);
        setMessage(res._id ? 'Đã thanh toán!' : res.error || 'Lỗi');
        if (typeof reloadData === 'function') reloadData();
        setCart([]);
        setSelectedTable(null);
        setShowOrderPage(false);
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
        if (typeof reloadData === 'function') reloadData();
        setCart([]);
        setSelectedTable(null);
        setShowOrderPage(false);
        setLoading(false);
    };

    return (
        <div className="orderStaff__orderBox">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <span
                    style={{ color: '#888', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    onClick={() => { setShowOrderPage(false); setSelectedTable(null); setCart([]); setMessage(''); }}
                >
                    <span style={{ fontSize: 20, marginRight: 6 }}>←</span> Quay lại chọn bàn
                </span>
            </div>
            <div className="orderStaff__orderTitle">Order cho bàn {selectedTable.number}</div>
            {/* Thông tin hóa đơn hiện tại nếu có */}
            {(() => {
                const order = orders.find(o => o.table === selectedTable._id && o.status === 'pending');
                if (!order) return null;
                return (
                    <div style={{ marginBottom: 8, color: '#2563eb' }}>
                        Trạng thái hóa đơn: <b>Chờ thanh toán</b>
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
                    let filtered = mergedMenuItems;
                    if (filterType) {
                        filtered = mergedMenuItems.filter(item => item.menuId === filterType);
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
                        <tr key={i.menuItem?._id || Math.random()} className="orderStaff__orderCartTr">
                            <td className="orderStaff__orderCartTd">{i.menuItem?.name || 'Không xác định'}</td>
                            <td className="orderStaff__orderCartTd">{typeof i.menuItem?.price === 'number' ? i.menuItem.price.toLocaleString() + ' đ' : 'Không xác định'}</td>
                            <td className="orderStaff__orderCartTd">
                                <input
                                    type="number"
                                    min={1}
                                    value={i.quantity}
                                    style={{ width: 50, textAlign: 'center' }}
                                    onChange={e => changeQuantity(i.menuItem?._id, Number(e.target.value))}
                                    disabled={loading || !i.menuItem}
                                />
                            </td>
                            <td className="orderStaff__orderCartTd">{typeof i.menuItem?.price === 'number' ? (i.menuItem.price * i.quantity).toLocaleString() + ' đ' : 'Không xác định'}</td>
                            <td className="orderStaff__orderCartTd">
                                <button className="orderStaff__orderCartActionBtn" type="button" onClick={() => removeFromCart(i.menuItem?._id)} disabled={loading || !i.menuItem}>Xóa</button>
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
    );
}

export default TableOrder;
