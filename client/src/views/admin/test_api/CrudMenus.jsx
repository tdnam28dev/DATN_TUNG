import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import { getMenus, createMenu, updateMenu, deleteMenu } from '../../../api/menu';
import { getRestaurants } from '../../../api/restaurant';
import { getMenuTypes } from '../../../api/menutype';
import './CurdMenus.css';
import MenuTypePopup from './MenuTypePopup';

function CrudMenus({ token }) {
  // const navigate = useNavigate(); // hook chuyển trang
  const [menus, setMenus] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [message, setMessage] = useState('');
  // State cho filter
  const [filterType, setFilterType] = useState('');
  const [filterRestaurant, setFilterRestaurant] = useState('');
  // State cho loại menu
  const [menuTypes, setMenuTypes] = useState([]);
  const [showTypePopup, setShowTypePopup] = useState(false);


  // Ẩn thông báo sau 5s
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);


  // Tải danh sách menu, nhà hàng, loại menu tự động khi load
  useEffect(() => {
    const fetchAll = async () => {
      const [resMenus, resRestaurants, resTypes] = await Promise.all([
        getMenus(token),
        getRestaurants(token),
        getMenuTypes(token)
      ]);
      setMenus(resMenus);
      setRestaurants(resRestaurants);
      setMenuTypes(Array.isArray(resTypes) ? resTypes : []);
    };
    fetchAll();
  }, [token]);

  // Hàm tải lại danh sách menu
  const fetchData = async () => {
    const res = await getMenus(token);
    setMenus(res);
  };


  // KHÔNG còn form thêm/sửa trực tiếp, chỉ thao tác qua popup

  const handleDelete = async (id) => {
    const res = await deleteMenu(id, token);
    setMessage(res.message || res.error || 'Lỗi');
    fetchData();
  };

  // Popup chi tiết/sửa/thêm menu
  const [showPopup, setShowPopup] = useState(false);
  const [popupMenu, setPopupMenu] = useState(null);

  // Hiển thị popup khi click Sửa hoặc Thêm mới
  const openPopup = (menu) => {
    if (menu) {
      setPopupMenu({
        ...menu,
        restaurant: typeof menu.restaurant === 'object' && menu.restaurant?._id ? menu.restaurant._id : (menu.restaurant || '')
      });
    } else {
      setPopupMenu({ name: '', type: '', description: '', restaurant: '' });
    }
    setShowPopup(true);
  };
  const closePopup = () => {
    setShowPopup(false);
    setPopupMenu(null);
  };

  // Xử lý submit trong popup
  const handlePopupSubmit = async (e) => {
    e.preventDefault();
    if (popupMenu._id) {
      // Cập nhật
      const res = await updateMenu(popupMenu._id, popupMenu, token);
      setMessage(res._id ? 'Cập nhật thành công!' : res.error || 'Lỗi');
    } else {
      // Thêm mới
      const res = await createMenu(popupMenu, token);
      setMessage(res._id ? 'Thêm thành công!' : res.error || 'Lỗi');
    }
    setShowPopup(false);
    setPopupMenu(null);
    fetchData();
  };

  // Lọc menu theo loại và nhà hàng
  const filteredMenus = menus.filter(m => {
    let matchType = true;
    let matchRes = true;
    if (filterType) matchType = m.type === filterType;
    if (filterRestaurant) {
      const rid = typeof m.restaurant === 'object' ? m.restaurant._id : m.restaurant;
      matchRes = rid === filterRestaurant;
    }
    return matchType && matchRes;
  });

  // Giao diện đẹp, tối ưu, tuân thủ BEM
  return (
    <div className="menuCrud">
      <div className="menuCrud__header">
        <h3 className="menuCrud__title">Danh Sách Thực Đơn</h3>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btnSubmit menuCrud__add" onClick={() => openPopup(null)}>
            <span className="menuCrud__addIcon">＋</span> Thêm menu
          </button>
          {/* Nút quản lý loại menu */}
          <button
            className="btnSubmit menuCrud__manageType"
            type="button"
            onClick={() => setShowTypePopup(true)}
            title="Quản lý loại menu"
          >
            <span className="menuCrud__addIcon">🗂️</span> Quản lý loại menu
          </button>
          {/* Popup quản lý loại menu */}
          {showTypePopup && (
            <MenuTypePopup token={token} onClose={() => setShowTypePopup(false)} />
          )}
        </div>
      </div>
      {/* Bộ lọc menu */}
      <div className="menuCrud__filterRow">
        {/* Lọc theo loại */}
        <select
          className="menuCrud__filterSelect"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="">Tất cả loại</option>
          {menuTypes.map(type => (
            <option key={type._id} value={type.name}>{type.name}</option>
          ))}
        </select>
        {/* Lọc theo nhà hàng */}
        <select
          className="menuCrud__filterSelect"
          value={filterRestaurant}
          onChange={e => setFilterRestaurant(e.target.value)}
        >
          <option value="">Tất cả nhà hàng</option>
          {restaurants.map(r => (
            <option key={r._id} value={r._id}>{r.name}</option>
          ))}
        </select>
      </div>
      <div className="menuCrud__tableWrap">
        <table className="menuCrud__table">
          <thead>
            <tr>
              <th className="menuCrud__th">Tên thực đơn</th>
              <th className="menuCrud__th">Loại</th>
              <th className="menuCrud__th">Mô tả</th>
              <th className="menuCrud__th">Nhà hàng</th>
              <th className="menuCrud__th">Số lượng món</th>
              <th className="menuCrud__th">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(filteredMenus) && filteredMenus.map(m => (
              <tr key={m._id} className="menuCrud__tr">
                <td className="menuCrud__td">{m.name}</td>
                <td className="menuCrud__td">{m.type || '-'}</td>
                <td className="menuCrud__td">{m.description || '-'}</td>
                {/* Hiển thị tên nhà hàng dựa vào id nếu không có object name */}
                <td className="menuCrud__td">{(() => {
                  if (m.restaurant && typeof m.restaurant === 'object' && m.restaurant.name) return m.restaurant.name;
                  const found = restaurants.find(r => r._id === (typeof m.restaurant === 'object' ? m.restaurant._id : m.restaurant));
                  return found ? found.name : '-';
                })()}</td>
                {/* Tổng số lượng món trong menu */}
                <td className="menuCrud__td">{Array.isArray(m.items) ? m.items.length : 0}</td>
                <td className="menuCrud__td menuCrud__td--action">
                  <button className="btnEdit menuCrud__edit" onClick={() => openPopup(m)} title="Sửa thực đơn">
                    <span className="menuCrud__editIcon">✎</span> Sửa
                  </button>
                  {/* Nút thêm món */}
                  {/* <button
                    className="btnSubmit menuCrud__add"
                    style={{ marginLeft: 6, padding: '6px 12px', fontSize: 14 }}
                    onClick={() => {
                      // Chuyển sang trang thêm món, truyền id menu
                      navigate(`/admin/menu/${m._id}/add-item`);
                    }}
                    title="Thêm món vào menu"
                  >+ Thêm món</button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Popup thêm/sửa menu */}
      {showPopup && (
        <div className="popup-restaurant-overlay">
          <div className="popup-restaurant-box menuCrud__popupBox">
            <div className="popup-restaurant-title menuCrud__popupTitle">{popupMenu._id ? 'Cập nhật thực đơn' : 'Thêm mới thực đơn'}</div>
            <div className="popup-restaurant-sub menuCrud__popupSub">Vui lòng nhập đầy đủ thông tin bên dưới</div>
            <form className="formCrud popup-restaurant-form menuCrud__popupForm" onSubmit={handlePopupSubmit}>
              <div className="popup-restaurant-row menuCrud__popupRow">
                {/* Tên thực đơn */}
                <input
                  className="inputCrud popup-restaurant-input popup-restaurant-input--60 menuCrud__input"
                  type="text"
                  placeholder="Tên thực đơn"
                  value={popupMenu.name}
                  onChange={e => setPopupMenu({ ...popupMenu, name: e.target.value })}
                  required
                />
                {/* Loại menu */}
                <select
                  className="selectCrud popup-restaurant-input popup-restaurant-input--40 menuCrud__input"
                  value={popupMenu.type}
                  onChange={e => setPopupMenu({ ...popupMenu, type: e.target.value })}
                  required
                >
                  <option value="">Chọn loại menu</option>
                  {menuTypes.map(type => (
                    <option key={type._id} value={type.name}>{type.name}</option>
                  ))}
                </select>
              </div>
              {/* Mô tả */}
              <input
                className="inputCrud popup-restaurant-input menuCrud__input"
                type="text"
                placeholder="Mô tả thực đơn"
                value={popupMenu.description}
                onChange={e => setPopupMenu({ ...popupMenu, description: e.target.value })}
              />
              {/* Chọn nhà hàng */}
              <select
                className="selectCrud popup-restaurant-input menuCrud__input"
                value={popupMenu.restaurant}
                onChange={e => setPopupMenu({ ...popupMenu, restaurant: e.target.value })}
                required
              >
                <option value="">Chọn nhà hàng</option>
                {restaurants.map(r => (
                  <option key={r._id} value={r._id}>{r.name}</option>
                ))}
              </select>
              {/* Hành động trong popup */}
              <div className="popup-restaurant-actions menuCrud__popupActions">
                <button className="btnSubmit menuCrud__popupBtn" type="submit">{popupMenu._id ? 'Cập nhật' : 'Lưu'}</button>
                <button className="btnDelete menuCrud__popupBtn" type="button" onClick={closePopup}>Hủy</button>
                {/* Nút Xóa chỉ hiện khi đang sửa (có _id) */}
                {popupMenu._id && (
                  <button
                    className="btnDelete menuCrud__popupBtn"
                    type="button"
                    onClick={() => {
                      if (window.confirm('Bạn có chắc chắn muốn xóa thực đơn này?')) {
                        handleDelete(popupMenu._id);
                        closePopup();
                      }
                    }}
                  >Xóa</button>
                )}
              </div>
            </form>
            <div className="messageCrud menuCrud__popupMsg">{message}</div>
          </div>
        </div>
      )}
      <div className="messageCrud menuCrud__msg">{message}</div>
    </div>
  );
}

export default CrudMenus;
