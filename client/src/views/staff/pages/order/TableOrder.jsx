import { exportInvoicePDF } from '../../../../utils/createInvoice';
import { createCustomer, getCustomers } from '../../../../api/customer';
import React, { useEffect, useState } from 'react';
import { createOrder, updateOrder, payOrder, cancelOrder } from '../../../../api/order';

// Giao diện order cho một bàn cụ thể
function TableOrder({ token, userId, selectedTable, setShowOrderPage, setSelectedTable, menus, menuItems, orders, payments, reloadData }) {
    // State cho popup thanh toán
    const [showPayPopup, setShowPayPopup] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerGender, setCustomerGender] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');
    const [customerId, setCustomerId] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('cash');
    const [paymentId, setPaymentId] = useState('');
    // Nhận dữ liệu từ props
    const [cart, setCart] = useState([]);
    const [filterType, setFilterType] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [menuTypeList, setMenuTypeList] = useState([]);

    // Khi nhập xong số điện thoại thì kiểm tra khách hàng
    useEffect(() => {
        if (!customerPhone || customerPhone.length < 10) return;
        // Gọi API kiểm tra khách hàng theo số điện thoại
        const fetchCustomer = async () => {
            const res = await getCustomers(token, { phone: customerPhone });
            if (Array.isArray(res) && res.length > 0) {
                const c = res[0];
                setCustomerId(c._id);
                setCustomerName(c.name || '');
                setCustomerGender(c.gender || '');
                setCustomerAddress(c.address || '');
            } else {
                setCustomerId(null);
                setCustomerName('');
                setCustomerGender('');
                setCustomerAddress('');
            }
        };
        fetchCustomer();
    }, [customerPhone, token]);

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

    // So sánh giỏ hàng hiện tại với hóa đơn pending ban đầu
    const existOrder = orders.find(o => o.table === selectedTable?._id && o.status === 'pending');
    const isCartChanged = (() => {
        if (!existOrder) return cart.length > 0;
        // So sánh số lượng món và từng món
        if (cart.length !== existOrder.items.length) return true;
        for (let i = 0; i < cart.length; i++) {
            const c = cart[i];
            const e = existOrder.items.find(it => it.menuItem === c.menuItem._id);
            if (!e || e.quantity !== c.quantity) return true;
        }
        return false;
    })();

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
    // xác nhận thanh toán từ popup
    // Hàm thanh toán: thêm khách hàng, lấy id từ backend, lưu vào hóa đơn và xác nhận khi thành công
    // Hàm xác nhận thanh toán, truyền paymentId nếu là chuyển khoản
    const handlePayOrder = async () => {
        if (!selectedTable) return;
        const existOrder = orders.find(o => o.table === selectedTable._id && o.status === 'pending');
        if (!existOrder) {
            setMessage('Không có hóa đơn chờ thanh toán!');
            return;
        }
        const phoneRegex = /^\d{10}$/;
        if (!customerPhone.trim()) {
            setMessage('Vui lòng nhập số điện thoại khách hàng!');
            return;
        }
        if (!phoneRegex.test(customerPhone.trim())) {
            setMessage('Số điện thoại không hợp lệ!');
            return;
        }
        if (!customerName.trim()) {
            setMessage('Vui lòng nhập tên khách hàng!');
            return;
        }
        // Nếu chọn chuyển khoản mà chưa chọn tài khoản thì báo lỗi
        if (paymentMethod === 'bank' && !paymentId) {
            setMessage('Vui lòng chọn tài khoản ngân hàng!');
            return;
        }
        setLoading(true);
        let finalCustomerId = customerId;
        // Nếu chưa có khách hàng thì tạo mới
        if (!finalCustomerId) {
            try {
                const customerData = await createCustomer({
                    name: customerName,
                    phone: customerPhone,
                    gender: customerGender,
                    address: customerAddress
                }, token);
                if (customerData && customerData._id) {
                    finalCustomerId = customerData._id;
                } else {
                    setMessage(customerData.error || 'Không thể tạo khách hàng!');
                    setLoading(false);
                    return;
                }
            } catch (err) {
                setMessage('Lỗi tạo khách hàng!');
                setLoading(false);
                return;
            }
        }
        // Gọi API thanh toán, truyền id khách hàng và paymentId nếu là chuyển khoản
        const res = await payOrder(existOrder._id, token, {
            paymentMethod,
            customerId: finalCustomerId,
            paymentId: paymentMethod === 'bank' ? paymentId : undefined
        });
        if (res && res._id) {
            setMessage('Đã thanh toán!');
            if (typeof reloadData === 'function') reloadData();
            setCart([]);
            setSelectedTable(null);
            setShowOrderPage(false);
            setShowPayPopup(false);
        } else {
            setMessage(res.error || 'Lỗi xác nhận thanh toán!');
        }
        setLoading(false);
    };
    // Hàm thanh toán và xuất hóa đơn PDF
    const handlePayAndPrint = async () => {
        // await handlePayOrder();
        // Nếu thanh toán thành công thì xuất PDF hóa đơn
        setTimeout(() => {
            exportInvoicePDF({
                customer: {
                    name: customerName,
                    phone: customerPhone,
                    gender: customerGender,
                    address: customerAddress
                },
                cart,
                total,
                paymentMethod
            });
        }, 500);
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
            <div className='orderStaff__orderCartActions'>
                <div className="orderStaff__orderCartTotal">Tổng cộng: {total.toLocaleString()} đ</div>
                <div >
                    {isCartChanged ? (
                        <button className="orderStaff__orderSubmitBtn" type="button" onClick={handleSaveOrder} disabled={loading}>
                            {loading ? 'Đang lưu...' : 'Lưu hóa đơn'}
                        </button>
                    ) : (
                        <>
                            <button
                                className="orderStaff__orderPayBtn"
                                type="button"
                                disabled={loading}
                                onClick={() => setShowPayPopup(true)}
                            >
                                Thanh toán
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
                        </>
                    )}
                </div>
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
            {/* Popup thanh toán */}
            {showPayPopup && (
                <div className="orderStaff__payPopupOverlay">
                    <div className="orderStaff__payPopup">
                        <h3 className="orderStaff__payPopupTitle">Thanh toán hóa đơn</h3>
                        <div className='orderStaff__payPopupInfoCustomer'>
                            <div className="orderStaff__payPopupRow">
                                <label>Tên khách hàng:</label>
                                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Nhập tên khách hàng" />
                            </div>
                            <div className="orderStaff__payPopupRow">
                                <label>Số điện thoại:</label>
                                <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Nhập số điện thoại" />
                                {customerId && customerPhone.length === 10 && customerPhone === String(customerPhone) && customerPhone === String(customerPhone) && (
                                    <span style={{ color: '#059669', marginLeft: 12, fontSize: 18, display: 'inline-flex', alignItems: 'center' }}>
                                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="10" cy="10" r="10" fill="#059669"/>
                                            <path d="M6 10.5L9 13.5L14 8.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </span>
                                )}
                            </div>
                            <div className="orderStaff__payPopupRow">
                                <label>Giới tính:</label>
                                <select value={customerGender} onChange={e => setCustomerGender(e.target.value)}>
                                    <option value="">Chọn giới tính</option>
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                            <div className="orderStaff__payPopupRow">
                                <label>Địa chỉ:</label>
                                <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="Nhập địa chỉ" />
                            </div>
                        </div>
                        {/* Bảng chi tiết hóa đơn */}
                        <div className="orderStaff__payPopupOrderDetail">
                            <table className="orderStaff__payPopupOrderTable">
                                <thead>
                                    <tr>
                                        <th>Tên món</th>
                                        <th>Đơn giá</th>
                                        <th>Số lượng</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.map(i => (
                                        <tr key={i.menuItem?._id || Math.random()}>
                                            <td>{i.menuItem?.name || 'Không xác định'}</td>
                                            <td>{typeof i.menuItem?.price === 'number' ? i.menuItem.price.toLocaleString() + ' đ' : 'Không xác định'}</td>
                                            <td>{i.quantity}</td>
                                            <td>{typeof i.menuItem?.price === 'number' ? (i.menuItem.price * i.quantity).toLocaleString() + ' đ' : 'Không xác định'}</td>
                                        </tr>
                                    ))}
                                    {/* Dòng tổng tiền */}
                                    <tr>
                                        <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold' }}>Tổng tiền thanh toán:</td>
                                        <td style={{ fontWeight: 'bold', color: '#2563eb' }}>{total.toLocaleString()} đ</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="orderStaff__payPopupRow">
                            <label>Hình thức thanh toán:</label>
                            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
                                <option value="cash">Tiền mặt</option>
                                <option value="card">Thẻ</option>
                                <option value="bank">Chuyển khoản</option>
                                <option value="momo">Momo</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                        {/* Nếu chọn chuyển khoản thì hiển thị danh sách tài khoản ngân hàng */}
                        {paymentMethod === 'bank' && (
                            <div className="orderStaff__payPopupRow">
                                <label>Chọn tài khoản ngân hàng:</label>
                                <select value={paymentId} onChange={e => setPaymentId(e.target.value)}>
                                    <option value="">-- Chọn tài khoản --</option>
                                    {Array.isArray(payments) && payments.filter(p => p.name === 'bank').map(p => (
                                        <option key={p._id} value={p._id}>{p.bankName} - {p.accountNumber} ({p.accountHolder})</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="orderStaff__payPopupActions">
                            <button className="orderStaff__payPopupBtn" type="button" onClick={handlePayOrder} disabled={loading}>
                                {loading ? 'Đang thanh toán...' : 'Xác nhận thanh toán'}
                            </button>
                            <button className="orderStaff__payPopupBtn" type="button" onClick={handlePayAndPrint} disabled={loading} style={{ marginLeft: 8, background: '#059669', color: '#fff' }}>
                                {loading ? 'Đang xử lý...' : 'Thanh toán & In hóa đơn'}
                            </button>
                            <button className="orderStaff__payPopupBtn orderStaff__payPopupBtn--cancel" type="button" onClick={() => setShowPayPopup(false)} disabled={loading}>
                                Hủy
                            </button>
                        </div>
                        {message && <div className="orderStaff__payPopupMsg">{message}</div>}
                    </div>
                </div>
            )}
            <div className="orderStaff__orderMsg">{message}</div>
        </div>
    );
}

export default TableOrder;
