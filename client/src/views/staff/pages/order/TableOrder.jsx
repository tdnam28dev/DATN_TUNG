import { exportInvoicePDF } from '../../../../utils/createInvoice';
import { createCustomer, getCustomers } from '../../../../api/customer';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createOrder, updateOrder, payOrder, cancelOrder } from '../../../../api/order';

// Giao diện order cho một bàn cụ thể
function TableOrder({ token, userId, selectedTable, setShowOrderPage, setSelectedTable, menus, menuItems, orders, payments, reloadData }) {
    // Gom các state liên quan vào một object
    const [popup, setPopup] = useState({
        showPay: false,
        showQr: false,
        qrCountdown: 180,
        qrPaid: false,
        qrPaidCountdown: 10
    });
    const [customer, setCustomer] = useState({
        name: '',
        phone: '',
        gender: '',
        address: '',
        id: null
    });
    const [payment, setPayment] = useState({
        method: 'cash',
        id: ''
    });
    const [cart, setCart] = useState([]);
    const [filterType, setFilterType] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [menuTypeList, setMenuTypeList] = useState([]);

    // Khi nhập xong số điện thoại thì kiểm tra khách hàng
    // Khi nhập xong số điện thoại thì kiểm tra khách hàng
    useEffect(() => {
        if (!customer.phone || customer.phone.length < 10) return;
        // Gọi API kiểm tra khách hàng theo số điện thoại
        const fetchCustomer = async () => {
            const res = await getCustomers(token, { phone: customer.phone });
            if (Array.isArray(res) && res.length > 0) {
                const c = res[0];
                setCustomer(prev => ({
                    ...prev,
                    id: c._id,
                    name: c.name || '',
                    gender: c.gender || '',
                    address: c.address || ''
                }));
            } else {
                setCustomer(prev => ({ ...prev, id: null, name: '', gender: '', address: '' }));
            }
        };
        fetchCustomer();
    }, [customer.phone, token]);

    // Khi chọn bàn, nếu có hóa đơn pending thì lấy giỏ hàng từ hóa đơn đó
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
    // Tạo danh sách món đã merge thông tin menu
    const mergedMenuItems = useMemo(() => {
        let menuMap = {};
        menus.forEach(menu => {
            if (Array.isArray(menu.items)) {
                menu.items.forEach(itemId => {
                    menuMap[itemId] = { menuId: menu._id, menuName: menu.name, type: menu.type };
                });
            }
        });
        return menuItems.map(item => ({
            ...item,
            menuId: menuMap[item._id]?.menuId || '',
            menuName: menuMap[item._id]?.menuName || '',
            type: menuMap[item._id]?.type || ''
        }));
    }, [menus, menuItems]);

    // Tạo danh sách loại món
    useEffect(() => {
        let menuTypeListTmp = [];
        mergedMenuItems.forEach(item => {
            if (item.menuId && item.menuName && item.type) {
                if (!menuTypeListTmp.find(t => t.menuId === item.menuId)) {
                    menuTypeListTmp.push({ type: item.type, menuId: item.menuId, menuName: item.menuName });
                }
            }
        });
        setMenuTypeList(menuTypeListTmp);
    }, [mergedMenuItems]);

    // Thêm món vào giỏ
    const addToCart = useCallback((item) => {
        setCart(prev => {
            const found = prev.find(i => i.menuItem._id === item._id);
            if (found) {
                return prev.map(i => i.menuItem._id === item._id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { menuItem: item, quantity: 1 }];
        });
    }, []);
    // Xóa món khỏi giỏ
    const removeFromCart = useCallback((id) => {
        setCart(prev => prev.filter(i => i.menuItem._id !== id));
    }, []);
    // Thay đổi số lượng
    const changeQuantity = useCallback((id, qty) => {
        setCart(prev => prev.map(i => i.menuItem._id === id ? { ...i, quantity: Math.max(1, qty) } : i));
    }, []);
    // Tổng tiền, kiểm tra menuItem tồn tại
    // Tính tổng tiền
    const total = useMemo(() => cart.reduce((sum, i) => {
        if (!i.menuItem || typeof i.menuItem.price !== 'number') return sum;
        return sum + (i.menuItem.price * i.quantity);
    }, 0), [cart]);

    // So sánh giỏ hàng hiện tại với hóa đơn pending ban đầu
    // Kiểm tra giỏ hàng có thay đổi so với hóa đơn pending
    const existOrder = useMemo(() => orders.find(o => o.table === selectedTable?._id && o.status === 'pending'), [orders, selectedTable]);
    const isCartChanged = useMemo(() => {
        if (!existOrder) return cart.length > 0;
        if (cart.length !== existOrder.items.length) return true;
        for (let i = 0; i < cart.length; i++) {
            const c = cart[i];
            const e = existOrder.items.find(it => it.menuItem === c.menuItem._id);
            if (!e || e.quantity !== c.quantity) return true;
        }
        return false;
    }, [cart, existOrder]);

    // Lưu/tạo hóa đơn (pending)
    const handleSaveOrder = useCallback(async () => {
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
    }, [selectedTable, cart, total, existOrder, token, reloadData]);

    // Hàm kiểm tra trạng thái thanh toán chuyển khoản qua API Google Script
    const checkBankTransfer = useCallback(async ({ accountNumber, amount, orderId }) => {
        try {
            const url = 'https://script.google.com/macros/s/AKfycbyeZBJC4NH5tZ4RbfjQaz_n7uGcKkG0lVUwzYTkT2pQR78PWVdslN3an7xHioqrN3YN/exec';
            const res = await fetch(url);
            const data = await res.json();
            if (data && Array.isArray(data.data)) {
                const found = data.data.find(tx =>
                    Number(tx["Tiền nhận"]) === Number(amount) &&
                    String(tx["Số tài khoản"]) === String(accountNumber) &&
                    tx["Mô tả"] && tx["Mô tả"].includes(orderId)
                );
                return !!found;
            }
            return false;
        } catch (err) {
            return false;
        }
    }, []);

    // Hàm tạo link QR code
    const getQrUrl = useCallback(() => {
        const paymentObj = payments.find(p => p._id === payment.id);
        if (!paymentObj) return '';
        const bankId = paymentObj.bankCode || '970422';
        const accountNo = paymentObj.accountNumber || '';
        const template = paymentObj.template || 'compact';
        const amount = total || '';
        const orderId = existOrder?._id || '';
        const addInfo = encodeURIComponent(`Hoa don ${orderId}`);
        const accountName = encodeURIComponent(paymentObj.accountHolder || '');
        return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${addInfo}&accountName=${accountName}`;
    }, [payments, payment.id, total, existOrder]);


    // Đếm ngược thời gian khi mở popup QR
    useEffect(() => {
        if (!popup.showQr) return;
        if (popup.qrCountdown <= 0) return;
        const timer = setTimeout(() => {
            setPopup(prev => ({ ...prev, qrCountdown: prev.qrCountdown - 1 }));
        }, 1000);
        return () => clearTimeout(timer);
    }, [popup.showQr, popup.qrCountdown]);

    // Kiểm tra trạng thái chuyển khoản liên tục khi mở popup QR
    useEffect(() => {
        let interval;
        if (popup.showQr && payment.method === 'bank' && payment.id && existOrder && !popup.qrPaid) {
            let elapsed = 0;
            let handled = false;
            interval = setInterval(async () => {
                const paymentObj = payments.find(p => p._id === payment.id);
                if (!paymentObj) return;
                const isPaid = await checkBankTransfer({
                    accountNumber: paymentObj.accountNumber,
                    amount: total,
                    orderId: existOrder._id
                });
                elapsed += 3;
                // Chỉ xử lý xác nhận thanh toán duy nhất một lần
                if (isPaid && !handled && !popup.qrPaid) {
                    handled = true;
                    setPopup(prev => prev.qrPaid ? prev : { ...prev, qrPaid: true, qrPaidCountdown: 10 });
                    setMessage('Đã nhận được chuyển khoản!');
                    let finalCustomerId = customer.id;
                    if (!finalCustomerId) {
                        const customerData = await createCustomer({
                            name: customer.name,
                            phone: customer.phone,
                            gender: customer.gender,
                            address: customer.address
                        }, token);
                        finalCustomerId = customerData._id;
                    }
                    const res = await payOrder(existOrder._id, token, {
                        paymentMethod: payment.method,
                        customerId: finalCustomerId,
                        paymentId: payment.id
                    });
                    if (res && res._id) {
                        setMessage('Đã thanh toán!');
                        if (typeof reloadData === 'function') reloadData();
                        setCart([]);
                    } else {
                        setMessage(res.error || 'Lỗi xác nhận thanh toán!');
                    }
                    clearInterval(interval);
                } else if (elapsed >= 180) {
                    setPopup(prev => ({ ...prev, showQr: false }));
                    setMessage('Hết thời gian chuyển khoản, vui lòng thử lại!');
                    clearInterval(interval);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
    }, [popup.showQr, payment.method, payment.id, existOrder, payments, total, customer, token, reloadData, popup.qrPaid, setSelectedTable, setShowOrderPage, checkBankTransfer]);
    // Đếm ngược đóng popup QR sau khi đã thanh toán
    useEffect(() => {
        let timer;
        if (popup.showQr && popup.qrPaid) {
            if (popup.qrPaidCountdown > 0) {
                timer = setTimeout(() => {
                    setPopup(prev => ({ ...prev, qrPaidCountdown: prev.qrPaidCountdown - 1 }));
                }, 1000);
            } else {
                setPopup(prev => ({ ...prev, showQr: false, qrPaid: false, showPay: false, qrPaidCountdown: 10 }));
                setSelectedTable(null);
                setShowOrderPage(false);
            }
        }
        return () => clearTimeout(timer);
    }, [popup.showQr, popup.qrPaid, popup.qrPaidCountdown, setShowOrderPage, setSelectedTable]);

    // xác nhận thanh toán từ popup
    // Hàm thanh toán: thêm khách hàng, lấy id từ backend, lưu vào hóa đơn và xác nhận khi thành công
    // Hàm xác nhận thanh toán, truyền paymentId nếu là chuyển khoản
    // Xác nhận thanh toán từ popup
    const handlePayOrder = useCallback(async () => {
        if (!selectedTable) return;
        if (!existOrder) {
            setMessage('Không có hóa đơn chờ thanh toán!');
            return;
        }
        const phoneRegex = /^\d{10}$/;
        if (!customer.phone.trim()) {
            setMessage('Vui lòng nhập số điện thoại khách hàng!');
            return;
        }
        if (!phoneRegex.test(customer.phone.trim())) {
            setMessage('Số điện thoại không hợp lệ!');
            return;
        }
        if (!customer.name.trim()) {
            setMessage('Vui lòng nhập tên khách hàng!');
            return;
        }
        if (payment.method === 'bank' && !payment.id) {
            setMessage('Vui lòng chọn tài khoản ngân hàng!');
            return;
        }
        // Nếu là chuyển khoản thì chỉ mở popup QR, không gọi API thanh toán
        if (payment.method === 'bank') {
            setPopup(prev => ({ ...prev, qrCountdown: 180, showQr: true }));
            return;
        }
        setLoading(true);
        let finalCustomerId = customer.id;
        if (!finalCustomerId) {
            try {
                const customerData = await createCustomer({
                    name: customer.name,
                    phone: customer.phone,
                    gender: customer.gender,
                    address: customer.address
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
        const res = await payOrder(existOrder._id, token, {
            paymentMethod: payment.method,
            customerId: finalCustomerId,
            paymentId: payment.method === 'bank' ? payment.id : undefined
        });
        if (res && res._id) {
            setMessage('Đã thanh toán!');
            if (typeof reloadData === 'function') reloadData();
            setCart([]);
            setSelectedTable(null);
            setShowOrderPage(false);
            setPopup(prev => ({ ...prev, showPay: false }));
        } else {
            setMessage(res.error || 'Lỗi xác nhận thanh toán!');
        }
        setLoading(false);
    }, [selectedTable, existOrder, customer, payment, token, reloadData, setSelectedTable, setShowOrderPage]);

    // Hàm thanh toán và xuất hóa đơn PDF
    const handlePayAndPrint = useCallback(() => {
        setTimeout(() => {
            exportInvoicePDF({
                customer: {
                    name: customer.name,
                    phone: customer.phone,
                    gender: customer.gender,
                    address: customer.address
                },
                cart,
                total,
                paymentMethod: payment.method
            });
        }, 500);
    }, [customer, cart, total, payment.method]);
    // Hủy hóa đơn
    // Hủy hóa đơn
    const handleCancelOrder = useCallback(async () => {
        if (!selectedTable) return;
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
    }, [selectedTable, existOrder, token, reloadData, setSelectedTable, setShowOrderPage]);

    return (
        <div className="orderStaff__orderBox">
            {/* Quay lại chọn bàn */}
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
            {existOrder && (
                <div style={{ marginBottom: 8, color: '#2563eb' }}>
                    Trạng thái hóa đơn: <b>Chờ thanh toán</b>
                </div>
            )}
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
                                onClick={() => setPopup(prev => ({ ...prev, showPay: true }))}
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
            {popup.showPay && (
                <div className="orderStaff__payPopupOverlay">
                    <div className="orderStaff__payPopup">
                        <h3 className="orderStaff__payPopupTitle">Thanh toán hóa đơn</h3>
                        <div className='orderStaff__payPopupInfoCustomer'>
                            <div className="orderStaff__payPopupRow">
                                <label>Tên khách hàng:</label>
                                <input type="text" value={customer.name} onChange={e => setCustomer(prev => ({ ...prev, name: e.target.value }))} placeholder="Nhập tên khách hàng" />
                            </div>
                            <div className="orderStaff__payPopupRow">
                                <label>Số điện thoại:</label>
                                <input type="text" value={customer.phone} onChange={e => setCustomer(prev => ({ ...prev, phone: e.target.value }))} placeholder="Nhập số điện thoại" />
                                {customer.id && customer.phone.length === 10 && (
                                    <span style={{ color: '#059669', marginLeft: 12, fontSize: 18, display: 'inline-flex', alignItems: 'center' }}>
                                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="10" cy="10" r="10" fill="#059669" />
                                            <path d="M6 10.5L9 13.5L14 8.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                )}
                            </div>
                            <div className="orderStaff__payPopupRow">
                                <label>Giới tính:</label>
                                <select value={customer.gender} onChange={e => setCustomer(prev => ({ ...prev, gender: e.target.value }))}>
                                    <option value="">Chọn giới tính</option>
                                    <option value="male">Nam</option>
                                    <option value="female">Nữ</option>
                                    <option value="other">Khác</option>
                                </select>
                            </div>
                            <div className="orderStaff__payPopupRow">
                                <label>Địa chỉ:</label>
                                <input type="text" value={customer.address} onChange={e => setCustomer(prev => ({ ...prev, address: e.target.value }))} placeholder="Nhập địa chỉ" />
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
                            <select value={payment.method} onChange={e => setPayment(prev => ({ ...prev, method: e.target.value }))}>
                                <option value="cash">Tiền mặt</option>
                                <option value="card">Thẻ</option>
                                <option value="bank">Chuyển khoản</option>
                                <option value="momo">Momo</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                        {/* Nếu chọn chuyển khoản thì hiển thị danh sách tài khoản ngân hàng */}
                        {payment.method === 'bank' && (
                            <div className="orderStaff__payPopupRow">
                                <label>Chọn tài khoản ngân hàng:</label>
                                <select value={payment.id} onChange={e => setPayment(prev => ({ ...prev, id: e.target.value }))}>
                                    <option value="">-- Chọn tài khoản --</option>
                                    {Array.isArray(payments) && payments.filter(p => p.name === 'bank').map(p => (
                                        <option key={p._id} value={p._id}>{p.bankName} - {p.accountNumber} ({p.accountHolder})</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="orderStaff__payPopupActions">
                            <button className="orderStaff__payPopupBtn" type="button" onClick={handlePayOrder} disabled={loading}>
                                {loading ? 'Đang thanh toán...' : 'Thanh toán'}
                            </button>
                            <button className="orderStaff__payPopupBtn" type="button" onClick={handlePayAndPrint} disabled={loading} style={{ marginLeft: 8, background: '#059669', color: '#fff' }}>
                                {loading ? 'Đang xử lý...' : 'Thanh toán & In hóa đơn'}
                            </button>
                            <button className="orderStaff__payPopupBtn orderStaff__payPopupBtn--cancel" type="button" onClick={() => setPopup(prev => ({ ...prev, showPay: false }))} disabled={loading}>
                                Hủy
                            </button>
                        </div>
                        {message && <div className="orderStaff__payPopupMsg">{message}</div>}
                    </div>
                </div>
            )}
            {/* Popup QR chuyển khoản */}
            {popup.showQr && (
                <div className="orderStaff__qrPopupOverlay">
                    <div className="orderStaff__qrPopupContent">
                        {!popup.qrPaid ? (
                            <>
                                <h3 style={{ marginBottom: 12 }}>Quét mã QR để thanh toán chuyển khoản</h3>
                                <div className="orderStaff__qrPopupImg">
                                    <img className='orderStaff__qrImg' alt="QR Code" src={getQrUrl()} />
                                </div>
                                <div style={{ fontSize: 16, color: '#2563eb', margin: '12px 0' }}>
                                    Thời gian còn lại: <b>{popup.qrCountdown}s</b>
                                </div>
                                <button type="button" className="orderStaff__payPopupBtn orderStaff__payPopupBtn--cancel" onClick={() => setPopup(prev => ({ ...prev, showQr: false }))}>
                                    Đóng
                                </button>
                                {popup.qrCountdown <= 0 && <div style={{ color: 'red', marginTop: 8 }}>Hết thời gian chuyển khoản, vui lòng thử lại!</div>}
                            </>
                        ) : (
                            <>
                                <h3 style={{ marginBottom: 12, color: '#059669' }}>Đã thanh toán thành công!</h3>
                                <div style={{ fontSize: 16, color: '#2563eb', margin: '12px 0' }}>
                                    Popup sẽ tự đóng sau <b>{popup.qrPaidCountdown}s</b>
                                </div>
                                <button type="button" className="orderStaff__payPopupBtn orderStaff__payPopupBtn--cancel"
                                    onClick={() => {
                                        setPopup(prev => ({ ...prev, showQr: false, qrPaid: false, showPay: false, qrPaidCountdown: 10 }));
                                        setSelectedTable(null);
                                        setShowOrderPage(false);
                                    }}>
                                    Đóng ngay
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
            <div className="orderStaff__orderMsg">{message}</div>
        </div>
    );
}

export default TableOrder;
