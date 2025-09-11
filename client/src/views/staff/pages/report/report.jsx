import React, { useEffect, useState, useMemo } from 'react';
import { getOrders } from '../../../../api/order';
import { getTables } from '../../../../api/table';
import { getMenuItems } from '../../../../api/menuitem';
import './report.css';

// Giao diện báo cáo doanh thu cho nhân viên
function StaffReport({ token, userId }) {
    // State lưu danh sách hóa đơn
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    // State bộ lọc ca làm việc (theo ngày, theo giờ)
    const [shiftStart, setShiftStart] = useState('');
    const [shiftEnd, setShiftEnd] = useState('');
    // State popup chi tiết hóa đơn
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [orderDetail, setOrderDetail] = useState(null);
    // State lưu danh sách bàn và món ăn
    const [tableList, setTableList] = useState([]);
    const [menuItems, setMenuItems] = useState([]);

    // Lấy danh sách hóa đơn, bàn, món ăn
    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [resOrders, resTables, resMenuItems] = await Promise.all([
                    getOrders(token, { paidBy: userId, status: 'completed' }),
                    getTables(token),
                    getMenuItems(token)
                ]);
                setOrders(Array.isArray(resOrders) ? resOrders : []);
                setTableList(Array.isArray(resTables) ? resTables : []);
                setMenuItems(Array.isArray(resMenuItems) ? resMenuItems : []);
            } catch {
                setOrders([]);
                setTableList([]);
                setMenuItems([]);
            }
            setLoading(false);
        };
        fetchAll();
    }, [token, userId]);

    // Lọc hóa đơn theo ca làm việc
    const filteredOrders = useMemo(() => {
        if (!shiftStart && !shiftEnd) return orders.filter(o => o.status === 'completed');
        return orders.filter(o => {
            if (o.status !== 'completed') return false;
            const created = new Date(o.createdAt);
            if (shiftStart && created < new Date(shiftStart)) return false;
            if (shiftEnd && created > new Date(shiftEnd)) return false;
            return true;
        });
    }, [orders, shiftStart, shiftEnd]);

    // Tính doanh thu tổng trong ca
    const totalRevenue = useMemo(() => filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0), [filteredOrders]);
    // Doanh thu hóa đơn tiền mặt
    const cashRevenue = useMemo(() => filteredOrders.filter(o => o.paymentMethod === 'cash').reduce((sum, o) => sum + (o.total || 0), 0), [filteredOrders]);
    // Doanh thu hóa đơn chuyển khoản
    const bankRevenue = useMemo(() => filteredOrders.filter(o => o.paymentMethod === 'bank').reduce((sum, o) => sum + (o.total || 0), 0), [filteredOrders]);

    return (
        <div className="staffReport">
            <h2 className="staffReport__title">Báo cáo doanh thu trong ca</h2>
            <div className="staffReport__filter">
                <label>Từ ngày/giờ:</label>
                <input type="datetime-local" value={shiftStart} onChange={e => setShiftStart(e.target.value)} />
                <label>Đến ngày/giờ:</label>
                <input type="datetime-local" value={shiftEnd} onChange={e => setShiftEnd(e.target.value)} />
            </div>
            <div className="staffReport__summary">
                <div className="staffReport__item">
                    <span className="staffReport__label">Doanh thu ca:</span>
                    <span className="staffReport__value">{totalRevenue.toLocaleString()} đ</span>
                </div>
                <div className="staffReport__item">
                    <span className="staffReport__label">Tiền mặt:</span>
                    <span className="staffReport__value staffReport__value--cash">{cashRevenue.toLocaleString()} đ</span>
                </div>
                <div className="staffReport__item">
                    <span className="staffReport__label">Chuyển khoản:</span>
                    <span className="staffReport__value staffReport__value--bank">{bankRevenue.toLocaleString()} đ</span>
                </div>
            </div>
            <div className="staffReport__list">
                <h3 className="staffReport__subtitle">Danh sách hóa đơn trong ca</h3>
                {loading ? <div className="staffReport__loading">Đang tải...</div> : filteredOrders.length === 0 ? <div className="staffReport__empty">Không có hóa đơn nào.</div> : (
                    <table className="staffReport__table">
                        <thead>
                            <tr>
                                <th>Mã hóa đơn</th>
                                <th>Thời gian</th>
                                <th>Bàn</th>
                                <th>Tổng tiền</th>
                                <th>Phương thức</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(o => {
                                // Tìm tên bàn
                                const tb = tableList.find(t => t._id === o.table);
                                return (
                                    <tr key={o._id}>
                                        <td>{o._id}</td>
                                        <td>{new Date(o.createdAt).toLocaleString()}</td>
                                        <td>{tb ? (tb.number ? `Bàn ${tb.number}` : tb._id) : o.table}</td>
                                        <td>{o.total?.toLocaleString()} đ</td>
                                        <td>{o.paymentMethod === 'cash' ? 'Tiền mặt' : o.paymentMethod === 'bank' ? 'Chuyển khoản' : o.paymentMethod}</td>
                                        <td>
                                            <button className="staffReport__detailBtn" onClick={() => { setOrderDetail(o); setShowOrderDetail(true); }}>Chi tiết</button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
            {/* Popup chi tiết hóa đơn */}
            {showOrderDetail && orderDetail && (
                <div className="staffReport__popupOverlay">
                    <div className="staffReport__popup staffReport__popup--detail">
                        <h3 className="staffReport__popupTitle__detail">Chi tiết hóa đơn</h3>
                        <div className="staffReport__popupInfo">
                            <div className="staffReport__popupInfoRow"><span>Mã hóa đơn:</span> <b>{orderDetail._id}</b></div>
                            <div className="staffReport__popupInfoRow"><span>Bàn:</span> <b>{(() => {
                                const tb = tableList.find(t => t._id === orderDetail.table);
                                return tb ? (tb.number ? `Bàn ${tb.number}` : tb._id) : orderDetail.table;
                            })()}</b></div>
                            <div className="staffReport__popupInfoRow"><span>Thời gian:</span> <b>{new Date(orderDetail.createdAt).toLocaleString()}</b></div>
                            <div className="staffReport__popupInfoRow"><span>Phương thức:</span> <b>{orderDetail.paymentMethod === 'cash' ? 'Tiền mặt' : orderDetail.paymentMethod === 'bank' ? 'Chuyển khoản' : orderDetail.paymentMethod}</b></div>
                            <div className="staffReport__popupInfoRow"><span>Tổng tiền:</span> <b style={{ color: '#2563eb' }}>{orderDetail.total?.toLocaleString()} đ</b></div>
                        </div>
                        <div className="staffReport__popupListTitle">Danh sách món ăn</div>
                        <table className="staffReport__popupTableFood">
                            <thead>
                                <tr>
                                    <th>Tên món</th>
                                    <th>Đơn giá</th>
                                    <th>Số lượng</th>
                                    <th>Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderDetail.items?.map((i, idx) => {
                                    // Tìm tên món ăn
                                    let item = i.menuItem;
                                    if (typeof item === 'string') {
                                        item = menuItems.find(m => m._id === item) || { name: i.menuItem, price: i.price };
                                    }
                                    return (
                                        <tr key={idx}>
                                            <td>{item?.name || '---'}</td>
                                            <td style={{ textAlign: 'right' }}>{typeof item?.price === 'number' ? item.price.toLocaleString() : (i.price?.toLocaleString() || '---')} đ</td>
                                            <td style={{ textAlign: 'center' }}>{i.quantity}</td>
                                            <td style={{ textAlign: 'right', color: '#2563eb', fontWeight: 600 }}>{((item?.price || i.price || 0) * i.quantity).toLocaleString()} đ</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className='staffReport__popupFooter'>
                            <button className="staffReport__popupBtn staffReport__popupBtn--cancel" onClick={() => setShowOrderDetail(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default StaffReport;
