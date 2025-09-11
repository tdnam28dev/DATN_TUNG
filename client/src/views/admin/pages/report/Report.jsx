import React, { useEffect, useState } from 'react';
import { getRestaurants } from '../../../../api/restaurant';
import { getOrders } from '../../../../api/order';
import './Report.css';

// Hàm lọc thời gian
function getTimeFilter(type) {
  const now = new Date();
  let start, end;
  if (type === 'day') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  } else if (type === 'week') {
    const day = now.getDay();
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - day));
  } else if (type === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  } else if (type === 'year') {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear() + 1, 0, 1);
  }
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function Report({ token }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState({ revenue: 0, cash: 0, bank: 0 });
  const [list, setList] = useState([]);
  const [timeType, setTimeType] = useState('day');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        // Lấy danh sách nhà hàng
        const restaurants = await getRestaurants(token);
        const timeFilter = getTimeFilter(timeType);
        let totalRevenue = 0, totalCash = 0, totalBank = 0;
        const detailList = [];
        for (const r of restaurants) {
          // Lấy hóa đơn của từng nhà hàng theo thời gian
          const orders = await getOrders(token, {
            restaurant: r._id,
            status: 'completed',
            startDate: timeFilter.start,
            endDate: timeFilter.end,
          });
          let revenue = 0, cash = 0, bank = 0;
          for (const o of orders) {
            revenue += o.total || 0;
            if (o.paymentMethod === 'cash') cash += o.total || 0;
            if (o.paymentMethod === 'bank') bank += o.total || 0;
          }
          totalRevenue += revenue;
          totalCash += cash;
          totalBank += bank;
          detailList.push({
            id: r._id,
            name: r.name,
            revenue,
            cash,
            bank,
          });
        }
        setSummary({ revenue: totalRevenue, cash: totalCash, bank: totalBank });
        setList(detailList);
      } catch (err) {
        setError('Lỗi khi lấy dữ liệu báo cáo');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [token, timeType]);

  if (loading) return <div className="adminReport__loading">Đang tải...</div>;
  if (error) return <div className="adminReport__error">{error}</div>;

  return (
    <div className="adminReport">
      <h2 className="adminReport__title">Báo cáo tổng hợp</h2>
      <div className="adminReport__filter">
        <label>Thời gian:</label>
        <select value={timeType} onChange={e => setTimeType(e.target.value)}>
          <option value="day">Ngày</option>
          <option value="week">Tuần</option>
          <option value="month">Tháng</option>
          <option value="year">Năm</option>
        </select>
      </div>
      <div className="adminReport__summary">
        <div className="adminReport__item adminReport__item--revenue">
          <div className="adminReport__label">Tổng doanh thu</div>
          <div className="adminReport__value adminReport__value--revenue">{summary.revenue.toLocaleString()}₫</div>
        </div>
        <div className="adminReport__item adminReport__item--cash">
          <div className="adminReport__label">Tiền mặt</div>
          <div className="adminReport__value adminReport__value--cash">{summary.cash.toLocaleString()}₫</div>
        </div>
        <div className="adminReport__item adminReport__item--bank">
          <div className="adminReport__label">Chuyển khoản</div>
          <div className="adminReport__value adminReport__value--bank">{summary.bank.toLocaleString()}₫</div>
        </div>
      </div>
      <div className="adminReport__list">
        <div className="adminReport__subtitle">Chi tiết từng nhà hàng</div>
        <table className="adminReport__table">
          <thead>
            <tr>
              <th className="adminReport__table-header">Nhà hàng</th>
              <th className="adminReport__table-header">Doanh thu</th>
              <th className="adminReport__table-header">Tiền mặt</th>
              <th className="adminReport__table-header">Chuyển khoản</th>
            </tr>
          </thead>
          <tbody>
            {list.map(item => (
              <tr key={item.id} className="adminReport__table-row">
                <td className="adminReport__table-cell">{item.name}</td>
                <td className="adminReport__table-cell">{item.revenue.toLocaleString()}₫</td>
                <td className="adminReport__table-cell">{item.cash.toLocaleString()}₫</td>
                <td className="adminReport__table-cell">{item.bank.toLocaleString()}₫</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <div className="adminReport__empty">Không có dữ liệu chi tiết.</div>}
      </div>
    </div>
  );
}

export default Report;
