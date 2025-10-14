import React, { useState, useEffect } from 'react';
import { getRestaurants } from '../../../../api/restaurant';
import { getCustomers } from '../../../../api/customer';
import { getOrders } from '../../../../api/order';
// Thêm thư viện Victory để vẽ biểu đồ cột
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme, VictoryLabel, VictoryPie, VictoryTooltip } from 'victory';
import './Overview.css';

// Component tổng quan kinh doanh cho admin
function Overview({ token }) {
  // State lưu dữ liệu từ API
  const [restaurants, setRestaurants] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today');
  // const [compare, setCompare] = useState('none');

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

  // Hàm kiểm tra hóa đơn thuộc filter
  const isOrderInFilter = React.useCallback((order) => {
    // Ưu tiên lấy ngày hoàn thành, nếu không có thì lấy ngày tạo
    const date = order.completedAt ? new Date(order.completedAt) : (order.createdAt ? new Date(order.createdAt) : null);
    if (!date) return false;
    const now = new Date();
    switch (filter) {
      case 'today':
        return date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      case 'week': {
        // Tuần hiện tại
        const firstDayOfWeek = new Date(now);
        firstDayOfWeek.setDate(now.getDate() - now.getDay());
        const lastDayOfWeek = new Date(now);
        lastDayOfWeek.setDate(now.getDate() + (6 - now.getDay()));
        return date >= firstDayOfWeek && date <= lastDayOfWeek;
      }
      case 'month':
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      case 'year':
        return date.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  }, [filter]);

  // Dữ liệu cho biểu đồ cột doanh thu từng nhà hàng theo filter (dùng useMemo để cập nhật khi filter thay đổi)
  const revenueByRestaurant = React.useMemo(() => {
    const colors = ['#2563eb', '#059669', '#f59e42', '#ef4444', '#0ea5e9', '#7c3aed', '#3aeddeff', '#dbed3aff'];
    return restaurants.map((r, idx) => {
      // Tính tổng doanh thu của từng nhà hàng theo filter
      const value = orders.filter(o => o.restaurant === r._id && o.status === 'completed' && isOrderInFilter(o)).reduce((sum, o) => sum + (o.total || 0), 0);
      return { name: r.name, value, color: colors[idx % colors.length] };
    });
  }, [restaurants, orders, isOrderInFilter]);
  // Chuyển dữ liệu sang dạng Victory
  const chartData = revenueByRestaurant.map(r => ({
    x: r.name,
    y: r.value,
    fill: r.color
  }));

  // Tổng doanh thu theo filter (dùng cho Pie chart)
  const totalRevenueFilter = revenueByRestaurant.reduce((sum, r) => sum + r.value, 0);

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
          {/* <select className="overview__compare" value={compare} onChange={e => setCompare(e.target.value)}>
            <option value="none">Không so sánh</option>
            <option value="yesterday">So với hôm qua</option>
            <option value="lastweek">So với tuần trước</option>
            <option value="lastmonth">So với tháng trước</option>
            <option value="lastyear">So với năm trước</option>
          </select> */}
        </div>
      </div>
      {loading ? (
        <div className="overview__loading">Đang tải dữ liệu...</div>
      ) : (
        <>
          {/* Hiển thị thống kê chính theo filter */}
          <div className="overview__stats">
            {/* Tính toán lại số liệu theo filter */}
            {(() => {
              // Lọc hóa đơn theo filter
              const filteredOrders = orders.filter(isOrderInFilter);
              // Tổng tiền hàng (hóa đơn completed)
              const totalOrderValueF = filteredOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.total || 0), 0);
              // Tổng tiền hoàn huỷ (hóa đơn cancelled)
              const totalCancelValueF = filteredOrders.filter(o => o.status === 'cancelled').reduce((sum, o) => sum + (o.total || 0), 0);
              // Tổng giảm giá (từ trường discount trong hóa đơn completed)
              const totalDiscountValueF = filteredOrders.filter(o => o.status === 'completed').reduce((sum, o) => {
                if (Array.isArray(o.discount)) {
                  return sum + o.discount.reduce((dsum, d) => dsum + (d.value || 0), 0);
                }
                return sum;
              }, 0);
              // Tổng doanh thu gồm thuế
              const totalRevenueF = totalOrderValueF;
              // Danh sách thống kê chính
              const statsF = [
                { label: 'Doanh thu gồm thuế', value: totalRevenueF, icon: '💰', color: '#2563eb' },
                { label: 'Hoàn huỷ', value: totalCancelValueF, icon: '🗑️', color: '#6b7280' },
                { label: 'Giảm giá', value: totalDiscountValueF, icon: '🎁', color: '#059669' },
              ];
              return statsF.map((s, i) => (
                <div key={i} className="overview__stat" style={{ borderColor: s.color }}>
                  <span className="overview__stat-icon" style={{ color: s.color }}>{s.icon}</span>
                  <span className="overview__stat-label" style={{ color: s.color }}>{s.label}</span>
                  <span className="overview__stat-value">{s.value.toLocaleString()} ₫</span>
                </div>
              ));
            })()}
          </div>
          {/* Hiển thị thống kê phụ theo filter */}
          <div className="overview__substats">
            {(() => {
              // Lọc hóa đơn theo filter
              const filteredOrders = orders.filter(isOrderInFilter);
              // Số khách hàng (tất cả khách hàng, không lọc theo filter)
              const customerCount = customers.length;
              // Số hóa đơn theo filter
              const orderCount = filteredOrders.length;
              // TB mặt hàng/hoá đơn
              const avgItemsPerOrder = orderCount > 0 ? (filteredOrders.reduce((sum, o) => sum + (o.items?.length || 0), 0) / orderCount).toFixed(1) : '--';
              // TB doanh thu/hoá đơn
              const totalOrderValueF = filteredOrders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.total || 0), 0);
              const avgRevenuePerOrder = orderCount > 0 ? Math.round(totalOrderValueF / orderCount).toLocaleString() + ' ₫' : '--';
              // Danh sách thống kê phụ
              const subStatsF = [
                { label: 'Số khách hàng', value: customerCount, color: '#f59e42' },
                { label: 'Số hoá đơn', value: orderCount, color: '#0ea5e9' },
                { label: 'TB mặt hàng/hoá đơn', value: avgItemsPerOrder, color: '#7c3aed' },
                { label: 'TB doanh thu/hoá đơn', value: avgRevenuePerOrder, color: '#f43f5e' },
              ];
              return subStatsF.map((s, i) => (
                <div key={i} className="overview__substat" style={{ borderLeft: `4px solid ${s.color}` }}>
                  <span className="overview__substat-label" style={{ color: s.color }}>{s.label}</span>
                  <span className="overview__substat-value">{s.value}</span>
                </div>
              ));
            })()}
          </div>
          <div className="overview__chart-block overview__chart-block--horizontal" style={{ display: 'flex', gap: 14 }}>
            <div style={{ flex: 2 }}>
              <div className="overview__chart-title">Doanh thu từng nhà hàng <span className="overview__chart-arrow">&gt;</span></div>
              <div className="overview__chart overview__chart--horizontal">
                {/* Biểu đồ cột ngang doanh thu từng nhà hàng sử dụng Victory */}
                <VictoryChart
                  theme={VictoryTheme.material}
                  domainPadding={{ x: 12, y: 14 }}
                  height={Math.max(100 + chartData.length * 32, 180)}
                  width={Math.max(520, 60 + chartData.length * 80)}
                  padding={{ top: 18, bottom: 24, left: 240, right: 85 }}
                  horizontal
                >
                  <VictoryAxis
                    style={{
                      axis: { stroke: '#e5e7eb' },
                      tickLabels: {
                        fontSize: 15,
                        padding: 8,
                        fill: '#374151',
                        fontWeight: 600,
                        maxWidth: 180,
                        wordBreak: 'break-word',
                      }
                    }}
                  />
                  <VictoryAxis
                    dependentAxis
                    tickFormat={t => `${t.toLocaleString()} đ`}
                    style={{
                      axis: { stroke: '#e5e7eb' },
                      grid: { stroke: '#e5e7eb', strokeDasharray: '4,4' },
                      tickLabels: { fontSize: 13, padding: 2, fill: '#2563eb', fontWeight: 600 }
                    }}
                  />
                  <VictoryBar
                    data={chartData}
                    x="x"
                    y="y"
                    barWidth={22}
                    style={{
                      data: {
                        fill: ({ datum }) => datum.fill,
                        stroke: '#fff',
                        strokeWidth: 1,
                        borderRadius: 4
                      }
                    }}
                    labels={({ datum }) => datum.y > 0 ? `${datum.y.toLocaleString()} đ` : ''}
                    labelComponent={<VictoryLabel dx={10} style={{ fontSize: 14, fill: '#374151', fontWeight: 600 }} />}
                  />
                </VictoryChart>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="overview__chart-title" style={{ marginBottom: 12 }}>Tỷ lệ doanh thu từng nhà hàng <span className="overview__chart-arrow">&gt;</span></div>
              <VictoryPie
                data={revenueByRestaurant}
                x="name"
                y="value"
                colorScale={revenueByRestaurant.map(r => r.color)}
                labels={({ datum }) => {
                  if (datum.value > 0 && totalRevenueFilter > 0) {
                    const percent = (datum.value / totalRevenueFilter) * 100;
                    return percent > 0 ? `${percent.toFixed(1)}%` : '0%';
                  }
                  return '0%';
                }}
                labelRadius={85}
                style={{
                  labels: { fontSize: 13, fill: '#374151', fontWeight: 700, textAlign: 'center' }
                }}
                width={280}
                height={280}
                innerRadius={60}
                padAngle={2}
                // events={[{
                //   target: "data",
                //   eventHandlers: {
                //     onMouseOver: () => {
                //       return [{
                //         target: "labels",
                //         mutation: () => ({ active: true })
                //       }];
                //     },
                //     onMouseOut: () => {
                //       return [{
                //         target: "labels",
                //         mutation: () => ({ active: false })
                //       }];
                //     }
                //   }
                // }]}
                labelComponent={
                  <VictoryTooltip
                    flyoutStyle={{ fill: '#fff', stroke: '#2563eb', strokeWidth: 1 }}
                    style={{ fontSize: 10, fontWeight: 600, fill: '#2563eb' }}
                    pointerLength={8}
                    cornerRadius={6}
                    constrainToVisibleArea
                    renderInPortal={false}
                    // Hiển thị thông tin chi tiết
                    text={({ datum }) => `${datum.name}\nDoanh thu: ${datum.value.toLocaleString()} đ\nTỷ lệ: ${(datum.value / totalRevenueFilter * 100).toFixed(1)}%`}
                  />
                }
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Overview;