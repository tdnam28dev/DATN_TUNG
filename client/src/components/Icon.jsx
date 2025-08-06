// Component Icon tổng hợp, nhận props name để hiển thị icon SVG tương ứng
// Sử dụng cho sidebar, button, v.v.
// Thêm icon mới vào object ICONS bên dưới
import React from 'react';

// Định nghĩa các icon SVG (có thể mở rộng thêm)
const ICONS = {
  dashboard: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="3" width="7" height="7" rx="2" fill="#FFA827"/>
      <rect x="14" y="3" width="7" height="7" rx="2" fill="#FFA827"/>
      <rect x="14" y="14" width="7" height="7" rx="2" fill="#FFA827"/>
      <rect x="3" y="14" width="7" height="7" rx="2" fill="#FFA827"/>
    </svg>
  ),
  report: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="16" height="16" rx="2" fill="#FFA827"/>
      <rect x="7" y="8" width="10" height="2" fill="white"/>
      <rect x="7" y="12" width="7" height="2" fill="white"/>
      <circle cx="18" cy="18" r="3" fill="#FF7043"/>
    </svg>
  ),
  bill: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="16" height="16" rx="2" fill="#FFA827"/>
      <rect x="7" y="8" width="10" height="2" fill="white"/>
      <rect x="7" y="12" width="7" height="2" fill="white"/>
      <circle cx="18" cy="18" r="2" fill="#FF7043"/>
    </svg>
  ),
  product: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="7" width="18" height="10" rx="2" fill="#FFA827"/>
      <rect x="7" y="3" width="10" height="4" rx="2" fill="#FF7043"/>
    </svg>
  ),
  calendar: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="5" width="18" height="16" rx="2" fill="#FFA827"/>
      <rect x="7" y="2" width="2" height="4" rx="1" fill="#FF7043"/>
      <rect x="15" y="2" width="2" height="4" rx="1" fill="#FF7043"/>
    </svg>
  ),
  user: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" fill="#FFA827"/>
      <rect x="4" y="16" width="16" height="4" rx="2" fill="#FFA827"/>
    </svg>
  ),
  customer: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="8" r="4" fill="#FFA827"/>
      <rect x="4" y="16" width="16" height="4" rx="2" fill="#FF7043"/>
    </svg>
  ),
  'user-group': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="10" r="3" fill="#FFA827"/>
      <circle cx="16" cy="10" r="3" fill="#FFA827"/>
      <rect x="4" y="16" width="16" height="4" rx="2" fill="#FF7043"/>
    </svg>
  ),
  discount: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="16" height="16" rx="2" fill="#FFA827"/>
      <path d="M7 17L17 7" stroke="#FF7043" strokeWidth="2"/>
      <circle cx="8.5" cy="8.5" r="1.5" fill="#FF7043"/>
      <circle cx="15.5" cy="15.5" r="1.5" fill="#FF7043"/>
    </svg>
  ),
  warehouse: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="10" width="18" height="10" rx="2" fill="#FFA827"/>
      <polygon points="12,4 3,10 21,10" fill="#FF7043"/>
    </svg>
  ),
  money: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="7" width="16" height="10" rx="2" fill="#FFA827"/>
      <circle cx="12" cy="12" r="3" fill="#FF7043"/>
    </svg>
  ),
  check: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="16" height="16" rx="2" fill="#FFA827"/>
      <path d="M8 12l3 3 5-5" stroke="#FF7043" strokeWidth="2" fill="none"/>
    </svg>
  ),
  setting: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="3" fill="#FFA827"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.65 1.65 0 0 0 15 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 8.6 15a1.65 1.65 0 0 0-1.82-.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 15 8.6a1.65 1.65 0 0 0 1.82.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 15z" stroke="#FF7043" strokeWidth="2" fill="none"/>
    </svg>
  ),
};

// Component Icon nhận prop name, trả về SVG tương ứng
const Icon = ({ name, ...props }) => {
  // Nếu không tìm thấy icon thì trả về null
  const iconSvg = ICONS[name] || null;
  // Trả về icon SVG, truyền props xuống SVG
  return iconSvg ? React.cloneElement(iconSvg, props) : null;
};

export default Icon;
