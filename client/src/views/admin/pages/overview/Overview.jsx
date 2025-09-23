import React, { useState, useEffect } from 'react';
import { getRestaurants } from '../../../../api/restaurant';
import { getCustomers } from '../../../../api/customer';
import { getOrders } from '../../../../api/order';
// Thêm thư viện Victory để vẽ biểu đồ cột
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme, VictoryLabel } from 'victory';
import './Overview.css';

// Component tổng quan kinh doanh cho admin
function Overview( { token } ) {
  // State lưu dữ liệu từ API
  const [restaurants, setRestaurants] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today');
  const [compare, setCompare] = useState('none');

  // Lấy dữ liệu từ API khi vào trang
  useEffect(() => {
    // Hàm lấy dữ liệu từ API, truyền token để xác thực
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [resRestaurants, resCustomers, resOrders] = await Promise.all([
          getRestaurants(token),
          getCustomers(token),
          getOrders(token)
        ]);
        setRestaurants(Array.isArray(resRestaurants) ? resRestaurants : []);
        setCustomers(Array.isArray(resCustomers) ? resCustomers : []);
        setOrders(Array.isArray(resOrders) ? resOrders : []);
      } catch {
        setRestaurants([]);
        setCustomers([]);
        setOrders([]);
      }
      setLoading(false);
    };
    fetchAll();
  }, [token]);

  // Tính toán các thông số tổng quan
  // Tổng tiền hàng (tất cả hóa đơn completed)
  const totalOrderValue = orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.total || 0), 0);
  // Tổng tiền hoàn huỷ (hóa đơn cancelled)
  const totalCancelValue = orders.filter(o => o.status === 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0);
  // Tổng giảm giá (từ trường discount trong hóa đơn)
  const totalDiscountValue = orders.filter(o => o.status === 'completed').reduce((sum, o) => {
    if (Array.isArray(o.discount)) {
      return sum + o.discount.reduce((dsum, d) => dsum + (d.value || 0), 0);
    }
    return sum;
  }, 0);
  // Tổng doanh thu gồm thuế (giả sử bằng tổng tiền hàng, có thể cộng thêm thuế nếu có)
  const totalRevenue = totalOrderValue;

  // Thống kê phụ
  const subStats = [
    { label: 'Số khách hàng', value: customers.length, color: '#f59e42' },
    { label: 'Số hoá đơn', value: orders.length, color: '#0ea5e9' },
    { label: 'TB mặt hàng/hoá đơn', value: orders.length > 0 ? (orders.reduce((sum, o) => sum + (o.items?.length || 0), 0) / orders.length).toFixed(1) : '--', color: '#7c3aed' },
    { label: 'TB doanh thu/hoá đơn', value: orders.length > 0 ? Math.round(totalOrderValue / orders.length).toLocaleString() + ' đ' : '--', color: '#f43f5e' },
  ];

  // Dữ liệu cho biểu đồ cột doanh thu từng nhà hàng
  const revenueByRestaurant = restaurants.map((r, idx) => {
    // Tính tổng doanh thu của từng nhà hàng
    const value = orders.filter(o => o.restaurant === r._id && o.status === 'completed').reduce((sum, o) => sum + (o.total || 0), 0);
    // Chọn màu cho từng nhà hàng
    const colors = ['#2563eb', '#059669', '#f59e42', '#ef4444', '#0ea5e9', '#7c3aed'];
    return { name: r.name, value, color: colors[idx % colors.length] };
  });
  // Chuyển dữ liệu sang dạng Victory
  const chartData = revenueByRestaurant.map(r => ({
    x: r.name,
    y: r.value,
    fill: r.color
  }));

  // Các thông số hiển thị chính
  const stats = [
    { label: 'Tiền hàng', value: totalOrderValue, icon: '🧾', color: '#2563eb' },
    { label: 'Hoàn huỷ', value: totalCancelValue, icon: '🗑️', color: '#6b7280' },
    { label: 'Giảm giá', value: totalDiscountValue, icon: '🎁', color: '#059669' },
    { label: 'Doanh thu gồm thuế', value: totalRevenue, icon: '💰', color: '#2563eb' },
  ];

  return (
    <div className="overview">
      <div className="overview__header">
        <h2 className="overview__title">Tổng quan kinh doanh</h2>
        <div className="overview__filter-group">
          <select className="overview__filter" value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="today">Hôm nay</option>
            <option value="week">Tuần này</option>
            <option value="month">Tháng này</option>
            <option value="year">Năm nay</option>
          </select>
          <select className="overview__compare" value={compare} onChange={e => setCompare(e.target.value)}>
            <option value="none">Không so sánh</option>
            <option value="yesterday">So với hôm qua</option>
            <option value="lastweek">So với tuần trước</option>
            <option value="lastmonth">So với tháng trước</option>
            <option value="lastyear">So với năm trước</option>
          </select>
        </div>
      </div>
      {loading ? (
        <div className="overview__loading">Đang tải dữ liệu...</div>
      ) : (
        <>
          <div className="overview__stats">
            {stats.map((s, i) => (
              <div key={i} className="overview__stat" style={{ borderColor: s.color }}>
                <span className="overview__stat-icon" style={{ color: s.color }}>{s.icon}</span>
                <span className="overview__stat-label" style={{ color: s.color }}>{s.label}</span>
                <span className="overview__stat-value">{s.value.toLocaleString()}₫</span>
              </div>
            ))}
          </div>
          <div className="overview__substats">
            {subStats.map((s, i) => (
              <div key={i} className="overview__substat" style={{ borderLeft: `4px solid ${s.color}` }}>
                <span className="overview__substat-label" style={{ color: s.color }}>{s.label}</span>
                <span className="overview__substat-value">{s.value}</span>
              </div>
            ))}
          </div>
          <div className="overview__chart-block overview__chart-block--horizontal">
            <div className="overview__chart-title">Doanh thu từng nhà hàng <span className="overview__chart-arrow">&gt;</span></div>
            <div className="overview__chart overview__chart--horizontal">
              {/* Biểu đồ cột ngang doanh thu từng nhà hàng sử dụng Victory */}
              <VictoryChart
                theme={VictoryTheme.material}
                domainPadding={{ x: 12, y: 18 }}
                height={Math.max(80 + chartData.length * 32, 180)}
                width={420}
                padding={{ top: 18, bottom: 24, left: 90, right: 18 }}
                horizontal
              >
                <VictoryAxis
                  style={{
                    axis: { stroke: '#e5e7eb' },
                    tickLabels: {
                      fontSize: 13,
                      padding: 6,
                      fill: '#374151',
                      fontWeight: 500,
                      maxWidth: 80,
                      wordBreak: 'break-word',
                    }
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  tickFormat={t => `${t / 1000000}tr`}
                  style={{
                    axis: { stroke: '#e5e7eb' },
                    grid: { stroke: '#e5e7eb', strokeDasharray: '4,4' },
                    tickLabels: { fontSize: 12, padding: 2, fill: '#2563eb', fontWeight: 500 }
                  }}
                />
                <VictoryBar
                  data={chartData}
                  x="x"
                  y="y"
                  barWidth={14}
                  style={{
                    data: {
                      fill: ({ datum }) => datum.fill,
                      stroke: '#fff',
                      strokeWidth: 1,
                      borderRadius: 4
                    }
                  }}
                  labels={({ datum }) => datum.y > 0 ? `${datum.y.toLocaleString()} đ` : ''}
                  labelComponent={<VictoryLabel dx={6} style={{ fontSize: 12, fill: '#374151', fontWeight: 500 }} />}
                />
              </VictoryChart>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Overview;