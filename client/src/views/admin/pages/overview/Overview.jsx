import React, { useState } from 'react';
import './Overview.css';

// Component tổng quan kinh doanh cho admin
function Overview() {
  const [filter, setFilter] = useState('today');
  const [compare, setCompare] = useState('none');

  // Dữ liệu mẫu, có thể thay bằng API thực tế
  const stats = [
    { label: 'Tiền hàng', value: 0, icon: '🧾', color: '#2563eb' },
    { label: 'Hoàn huỷ', value: 0, icon: '🗑️', color: '#6b7280' },
    { label: 'Giảm giá', value: 0, icon: '🎁', color: '#059669' },
    { label: 'Thuế phí', value: 0, icon: '📄', color: '#f59e42' },
    { label: 'Doanh thu gồm thuế', value: 0, icon: '💰', color: '#2563eb' },
  ];
  const subStats = [
    { label: 'Số khách hàng', value: 0, color: '#f59e42' },
    { label: 'Số hoá đơn', value: 0, color: '#0ea5e9' },
    { label: 'TB mặt hàng/hoá đơn', value: '--', color: '#7c3aed' },
    { label: 'TB doanh thu/hoá đơn', value: '--', color: '#f43f5e' },
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
      <div className="overview__chart-block">
        <div className="overview__chart-title">Doanh thu tổng hợp <span className="overview__chart-arrow">&gt;</span></div>
        <div className="overview__chart">
          {/* Chart placeholder, có thể tích hợp thư viện chart sau */}
          <div className="overview__chart-placeholder">
            {/* Vẽ các dòng ngang như ảnh mẫu */}
            {[...Array(10)].map((_, i) => (
              <div key={i} className="overview__chart-line">
                <span className="overview__chart-label">{(1 - i * 0.1).toFixed(1)} đ</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Overview;
