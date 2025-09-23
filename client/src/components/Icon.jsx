import React from 'react';

// Định nghĩa các icon SVG (có thể mở rộng thêm)
const ICONS = {
  // Icon tìm kiếm
  search: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="11" cy="11" r="7" stroke="#FFA827" strokeWidth="2" fill="none" />
      <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="#FFA827" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  // Icon bàn vuông 2 ghế
  table_square_2: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="20" height="20" rx="3" fill="#FFA827" />
      <circle cx="20" cy="5" r="3" fill="#FFA827" />
      <circle cx="20" cy="35" r="3" fill="#FFA827" />
    </svg>
  ),
  // Icon bàn vuông 6 ghế
  table_square_6: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="20" height="20" rx="3" fill="#FFA827" />
      <circle cx="24" cy="5" r="2.5" fill="#FFA827" />
      <circle cx="16" cy="35" r="2.5" fill="#FFA827" />
      <circle cx="5" cy="20" r="2.5" fill="#FFA827" />
      <circle cx="35" cy="20" r="2.5" fill="#FFA827" />
      <circle cx="15" cy="5" r="2.5" fill="#FFA827" />
      <circle cx="25" cy="35" r="2.5" fill="#FFA827" />
    </svg>
  ),
  // Icon bàn chữ nhật 2 ghế
  table_rect_2: (
    <svg width="48" height="32" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="32" height="16" rx="3" fill="#FFA827" />
      <circle cx="24" cy="4" r="3" fill="#FFA827" />
      <circle cx="24" cy="28" r="3" fill="#FFA827" />
    </svg>
  ),
  // Icon bàn chữ nhật 4 ghế
  table_rect_4: (
    <svg width="48" height="32" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="32" height="16" rx="3" fill="#FFA827" />
      {/* 2 ghế trên */}
      <circle cx="18" cy="4" r="2.5" fill="#FFA827" />
      <circle cx="30" cy="4" r="2.5" fill="#FFA827" />
      {/* 2 ghế dưới */}
      <circle cx="18" cy="28" r="2.5" fill="#FFA827" />
      <circle cx="30" cy="28" r="2.5" fill="#FFA827" />
    </svg>
  ),
  // Icon bàn tròn 2 ghế
  table_round_2: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="12" fill="#FFA827" />
      <circle cx="20" cy="4" r="2.5" fill="#FFA827" />
      <circle cx="20" cy="36" r="2.5" fill="#FFA827" />
    </svg>
  ),
  // Icon bàn tròn 4 ghế
  table_round_4: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="12" fill="#FFA827" />
      <circle cx="20" cy="5" r="3" fill="#FFA827" />
      <circle cx="20" cy="35" r="3" fill="#FFA827" />
      <circle cx="5" cy="20" r="3" fill="#FFA827" />
      <circle cx="35" cy="20" r="3" fill="#FFA827" />
    </svg>
  ),
  // Icon bàn tròn 6 ghế
  table_round_6: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="12" fill="#FFA827" />
      <circle cx="20" cy="4" r="2.5" fill="#FFA827" /> {/* Trên */}
      <circle cx="34" cy="12" r="2.5" fill="#FFA827" /> {/* Trên phải */}
      <circle cx="34" cy="28" r="2.5" fill="#FFA827" /> {/* Dưới phải */}
      <circle cx="20" cy="36" r="2.5" fill="#FFA827" /> {/* Dưới */}
      <circle cx="6" cy="28" r="2.5" fill="#FFA827" /> {/* Dưới trái */}
      <circle cx="6" cy="12" r="2.5" fill="#FFA827" /> {/* Trên trái */}
    </svg>
  ),
  // Icon bàn vuông 4 ghế
  table_square_4: (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="20" height="20" rx="3" fill="#FFA827" />
      <circle cx="20" cy="5" r="3" fill="#FFA827" />
      <circle cx="20" cy="35" r="3" fill="#FFA827" />
      <circle cx="5" cy="20" r="3" fill="#FFA827" />
      <circle cx="35" cy="20" r="3" fill="#FFA827" />
    </svg>
  ),
  // Icon bàn chữ nhật 6 ghế
  table_rect_6: (
    <svg width="48" height="32" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="38" height="16" rx="3" fill="#FFA827" />
      {/* 3 ghế trên */}
      <circle cx="15" cy="4" r="2.5" fill="#FFA827" />
      <circle cx="27" cy="4" r="2.5" fill="#FFA827" />
      <circle cx="39" cy="4" r="2.5" fill="#FFA827" />
      {/* 3 ghế dưới */}
      <circle cx="15" cy="28" r="2.5" fill="#FFA827" />
      <circle cx="27" cy="28" r="2.5" fill="#FFA827" />
      <circle cx="39" cy="28" r="2.5" fill="#FFA827" />
    </svg>
  ),
  cart: (
    <span >
      <img
        src={process.env.PUBLIC_URL + '/cart.gif'}
        alt="Giỏ hàng"
        width={24}
        height={24}
        style={{ objectFit: 'contain' }}
      />
    </span>
  ),
  order: (
    <span >
      <img
        src={process.env.PUBLIC_URL + '/To Do.gif'}
        alt="Order"
        width={24}
        height={24}
        style={{ objectFit: 'contain' }}
      />
    </span>
  ),
  menu: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="6" width="18" height="2" rx="1" fill="#FFA827"/>
      <rect x="3" y="11" width="18" height="2" rx="1" fill="#FFA827"/>
      <rect x="3" y="16" width="18" height="2" rx="1" fill="#FFA827"/>
    </svg>
  ),
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
  notification: (
    // Icon thông báo dạng chuông
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22c1.1 0 2-.9 2-2h-4a2 2 0 0 0 2 2zm6-6V11c0-3.07-1.63-5.64-4.5-6.32V4a1.5 1.5 0 0 0-3 0v.68C7.63 5.36 6 7.92 6 11v5l-1.29 1.29A1 1 0 0 0 6 19h12a1 1 0 0 0 .71-1.71L18 16z" fill="#ffffff02" stroke="#FFA827" strokeWidth="1.5"/>
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
