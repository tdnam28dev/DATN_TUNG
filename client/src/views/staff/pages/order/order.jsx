import React, { useEffect, useState } from 'react';
import TableOrder from './TableOrder';
import './order_header.css';
import './order_staff_content.css';
import { getTables } from '../../../../api/table';
import { getMenus } from '../../../../api/menu';
import { getMenuItems } from '../../../../api/menuitem';
import { getOrders } from '../../../../api/order';
import { getPaymentMethods } from '../../../../api/payment';



// Giao diện order cho nhân viên quầy
function OrderStaff({ token, userId }) {
    // State bộ lọc bàn
    const [filterStatus, setFilterStatus] = useState('');
    const [filterSeats, setFilterSeats] = useState('');
    const [filterTypeTable, setFilterTypeTable] = useState('');
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [showOrderPage, setShowOrderPage] = useState(false);
    // State lưu dữ liệu menu, món ăn, hóa đơn
    const [menus, setMenus] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [orders, setOrders] = useState([]);
    const [payments, setPayments] = useState([]);


    // Lấy tất cả dữ liệu khi vào giao diện
    const fetchAllData = async () => {
        try {
            const resTables = await getTables(token);
            setTables(Array.isArray(resTables) ? resTables : []);
        } catch (e) { setTables([]); }
        try {
            const resMenus = await getMenus(token);
            setMenus(Array.isArray(resMenus) ? resMenus : []);
        } catch (e) { setMenus([]); }
        try {
            const resMenuItems = await getMenuItems(token);
            setMenuItems(Array.isArray(resMenuItems) ? resMenuItems : []);
        } catch (e) { setMenuItems([]); }
        try {
            const resOrders = await getOrders(token);
            setOrders(Array.isArray(resOrders) ? resOrders : []);
        } catch (e) { setOrders([]); }
        try {
            const resPayments = await getPaymentMethods(token);
            setPayments(Array.isArray(resPayments) ? resPayments : []);
        } catch (e) { setPayments([]); }
    };
    useEffect(() => {
        fetchAllData();
        // eslint-disable-next-line
    }, [token]);

    // Hàm reload lại dữ liệu sau khi thao tác
    const reloadData = () => {
        fetchAllData();
    };

    // Chọn bàn để order
    const handleSelectTable = (tb) => {
        setSelectedTable(tb);
        setShowOrderPage(true);
    };

    return (
        <div className="orderStaff">
            {showOrderPage && selectedTable ? (
                <TableOrder
                    token={token}
                    userId={userId}
                    selectedTable={selectedTable}
                    setShowOrderPage={setShowOrderPage}
                    setSelectedTable={setSelectedTable}
                    menus={menus}
                    menuItems={menuItems}
                    orders={orders}
                    payments={payments}
                    reloadData={reloadData}
                />
            ) : (
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
                </div>
            )}
        </div>
    );
}

export default OrderStaff;
