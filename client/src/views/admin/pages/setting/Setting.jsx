import React, { useState } from 'react';
import { FaStore, FaUtensils, FaListAlt, FaChair, FaThLarge, FaUser } from 'react-icons/fa';
import './Setting.css';

// Import các component động
import CrudRestaurants from '../../test_api/CrudRestaurants';
import CrudUsers from '../../test_api/CrudUsers';
import CrudMenus from '../../test_api/CrudMenus';
import CrudMenuItems from '../../test_api/CrudMenuItems';
import CrudTables from '../../test_api/CrudTables';

// Danh sách các mục thiết lập dạng lưới, mỗi mục có icon, tiêu đề, mô tả
const SETTING_SECTIONS = [
  {
    title: 'Thiết lập thông tin',
    items: [
      {
        icon: <FaStore size={28} color="#FFA827" />,
        title: 'Quản lý nhà hàng',
        desc: 'Xem và điều chỉnh thông tin nhà hàng của bạn',
      },
      {
        icon: <FaUser size={28} color="#FFA827" />,
        title: 'Quản lý người dùng',
        desc: 'Xem và điều chỉnh thông tin tài khoản của người dùng',
      },
    ],
  },
  {
    title: 'Thiết lập chức năng',
    items: [
      {
        icon: <FaListAlt size={28} color="#FFA827" />,
        title: 'Thiết lập menu',
        desc: 'Xem và thiết lập các menu thực đơn',
      },
      {
        icon: <FaUtensils size={28} color="#FFA827" />,
        title: 'Thiết lập món ăn',
        desc: 'Xem và thiết lập các món ăn trong cửa hàng',
      },
      {
        icon: <FaChair size={28} color="#FFA827" />,
        title: 'Thiết lập bàn',
        desc: 'Xem và thiết lập các bàn ăn',
      },
      {
        icon: <FaThLarge size={28} color="#FFA827" />,
        title: 'Thiết lập khu vực',
        desc: 'Xem và thiết lập các khu vực bàn',
      },
    ],
  },
  {
    title: 'Thiết lập tích hợp',
    items: [
      {
        icon: <FaListAlt size={28} color="#FFA827" />,
        title: 'Thiết lập đối tác',
        desc: 'Xem và thiết lập các đối tác tích hợp',
      },
    ],
  },
];

function Settings({ token }) {
  // State lưu item đang chọn
  const [selected, setSelected] = useState(null);

  // Map tiêu đề sang component động
  const componentMap = {
    'Quản lý nhà hàng': <CrudRestaurants token={token} />,
    'Quản lý người dùng': <CrudUsers token={token} />,
    'Thiết lập menu': <CrudMenus token={token} />,
    'Thiết lập món ăn': <CrudMenuItems token={token} />,
    'Thiết lập bàn': <CrudTables token={token} />,
    // ...bổ sung các component khác nếu có
  };

  // Nếu đã chọn item thì hiển thị component động
  if (selected && componentMap[selected]) {
    return (
      <div className="setting-root">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <span
            style={{ color: '#888', fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={() => setSelected(null)}
          >
            <span style={{ fontSize: 20, marginRight: 6 }}>←</span> Quay lại cấu hình
          </span>
        </div>
        <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 18, color: '#222' }}>{selected}</h2>
        <div style={{ borderTop: '1px solid #eee', marginBottom: 24 }} />
        {componentMap[selected]}
      </div>
    );
  }

  // Giao diện danh sách các mục thiết lập
  return (
    <div className='setting-root'>
      <h2 className='setting-main-title'>CẤU HÌNH</h2>
      {SETTING_SECTIONS.map(section => (
        <div key={section.title} className='setting-section'>
          <div className='setting-section-title'>{section.title}</div>
          <div className='setting-grid'>
            {section.items.map(item => (
              <div
                key={item.title}
                className='setting-item'
                onClick={() => setSelected(item.title)}
              >
                <div className='setting-item-icon'>{item.icon}</div>
                <div className='setting-item-title'>{item.title}</div>
                <div className='setting-item-desc'>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Settings;
