import React, { useState, useEffect } from 'react';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem} from '../../../api/menuitem';
import { getMenus } from '../../../api/menu';
import { getMenuTypes } from '../../../api/menutype';
import './CrudMenuItems.css';

function CrudMenuItems({ token }) {
  const [items, setItems] = useState([]);
  const [menus, setMenus] = useState([]);
  const [message, setMessage] = useState('');
  const [filterMenu, setFilterMenu] = useState('');
  const [filterType, setFilterType] = useState('');
  const [menuTypes, setMenuTypes] = useState([]);
  // Popup
  const [showPopup, setShowPopup] = useState(false);
  const [popupItem, setPopupItem] = useState(null);

  // Ẩn thông báo sau 5s
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Tải danh sách menu, loại menu và món ăn
  useEffect(() => {
    const fetchAll = async () => {
      const [resItems, resMenus, resTypes] = await Promise.all([
        getMenuItems(token),
        getMenus(token),
        getMenuTypes(token)
      ]);
      setItems(resItems);
      setMenus(resMenus);
      setMenuTypes(Array.isArray(resTypes) ? resTypes : []);
    };
    fetchAll();
  }, [token]);

  // Lọc món ăn theo menu và loại menu
  const filteredItems = items.filter(i => {
    // Lọc theo menu
    const matchMenu = !filterMenu || (i.menu === filterMenu || (typeof i.menu === 'object' && i.menu?._id === filterMenu));
    // Lọc theo loại menu
    if (!filterType) return matchMenu;
    // Tìm menu tương ứng
    const foundMenu = menus.find(m => m._id === (typeof i.menu === 'object' ? i.menu._id : i.menu));
    return matchMenu && foundMenu && foundMenu.type === filterType;
  });

  // Mở popup thêm/sửa
  const openPopup = (item) => {
    setPopupItem(item ? { ...item } : { name: '', price: '', description: '', menu: '' });
    setShowPopup(true);
  };
  const closePopup = () => {
    setShowPopup(false);
    setPopupItem(null);
  };

  // Xử lý submit
  const handlePopupSubmit = async (e) => {
    e.preventDefault();
    if (popupItem._id) {
      const res = await updateMenuItem(popupItem._id, popupItem, token);
      setMessage(res._id ? 'Cập nhật thành công!' : res.error || 'Lỗi');
    } else {
      const res = await createMenuItem(popupItem, token);
      setMessage(res._id ? 'Thêm thành công!' : res.error || 'Lỗi');
    }
    setShowPopup(false);
    setPopupItem(null);
    // Reload
    const resItems = await getMenuItems(token);
    setItems(resItems);
  };

  // Xóa
  const handleDelete = async (id) => {
    const res = await deleteMenuItem(id, token);
    setMessage(res.message || res.error || 'Lỗi');
    const resItems = await getMenuItems(token);
    setItems(resItems);
  };

  return (
    <div className="menuItemCrud">
      <div className="menuItemCrud__header">
        <h3 className="menuItemCrud__title">Danh sách món ăn</h3>
        <button className="btnSubmit menuItemCrud__add" onClick={() => openPopup(null)}>
          <span className="menuItemCrud__addIcon">＋</span> Thêm mới
        </button>
      </div>
      {/* Bộ lọc menu và loại menu */}
      <div className="menuItemCrud__filterRow">
        <select
          className="menuItemCrud__filterSelect"
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
        >
          <option value="">Tất cả món</option>
          {menuTypes.map(type => (
            <option key={type._id} value={type.name}>{type.name}</option>
          ))}
        </select>
        <select
          className="menuItemCrud__filterSelect"
          value={filterMenu}
          onChange={e => setFilterMenu(e.target.value)}
        >
          <option value="">Tất cả menu</option>
          {menus.map(m => (
            <option key={m._id} value={m._id}>{m.name}</option>
          ))}
        </select>
      </div>
      <div className="menuItemCrud__tableWrap">
        <table className="menuItemCrud__table">
          <thead>
            <tr>
              <th className="menuItemCrud__th">Tên món</th>
              <th className="menuItemCrud__th">Giá</th>
              <th className="menuItemCrud__th">Mô tả</th>
              <th className="menuItemCrud__th">Loại món</th>
              <th className="menuItemCrud__th">Menu</th>
              <th className="menuItemCrud__th">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(i => (
              <tr key={i._id} className="menuItemCrud__tr">
                <td className="menuItemCrud__td">{i.name}</td>
                <td className="menuItemCrud__td">{i.price}</td>
                <td className="menuItemCrud__td">{i.description}</td>
                <td className="menuItemCrud__td">{(() => {
                  const foundMenu = menus.find(m => m._id === (typeof i.menu === 'object' ? i.menu._id : i.menu));
                  return foundMenu ? foundMenu.type : '-';
                })()}</td>
                <td className="menuItemCrud__td">{(() => {
                  if (typeof i.menu === 'object' && i.menu?.name) return i.menu.name;
                  const found = menus.find(m => m._id === (typeof i.menu === 'object' ? i.menu._id : i.menu));
                  return found ? found.name : '-';
                })()}</td>
                <td className="menuItemCrud__td menuItemCrud__td--action">
                  <button className="btnEdit menuItemCrud__edit" onClick={() => openPopup(i)} title="Sửa món">
                    <span className="menuItemCrud__editIcon">✎</span> Sửa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Popup thêm/sửa món */}
      {showPopup && (
        <div className="popup-restaurant-overlay">
          <div className="popup-restaurant-box menuItemCrud__popupBox">
            <div className="popup-restaurant-title menuItemCrud__popupTitle">{popupItem._id ? 'Cập nhật món ăn' : 'Thêm mới món ăn'}</div>
            <div className="popup-restaurant-sub menuItemCrud__popupSub">Vui lòng nhập đầy đủ thông tin bên dưới</div>
            <form className="formCrud popup-restaurant-form menuItemCrud__popupForm" onSubmit={handlePopupSubmit}>
              <input
                className="inputCrud popup-restaurant-input menuItemCrud__input"
                type="text"
                placeholder="Tên món ăn"
                value={popupItem.name}
                onChange={e => setPopupItem({ ...popupItem, name: e.target.value })}
                required
              />
              <input
                className="inputCrud popup-restaurant-input menuItemCrud__input"
                type="number"
                placeholder="Giá"
                value={popupItem.price}
                onChange={e => setPopupItem({ ...popupItem, price: e.target.value })}
                required
              />
              <input
                className="inputCrud popup-restaurant-input menuItemCrud__input"
                type="text"
                placeholder="Mô tả"
                value={popupItem.description}
                onChange={e => setPopupItem({ ...popupItem, description: e.target.value })}
              />

              <select
                className="selectCrud popup-restaurant-input menuItemCrud__input"
                value={popupItem.menu}
                onChange={e => setPopupItem({ ...popupItem, menu: e.target.value })}
                required
              >
                <option value="">Chọn menu</option>
                {menus.map(m => (
                  <option key={m._id} value={m._id}>{m.name}</option>
                ))}
              </select>
              <div className="popup-restaurant-actions menuItemCrud__popupActions">
                <button className="btnSubmit menuItemCrud__popupBtn" type="submit">{popupItem._id ? 'Cập nhật' : 'Lưu'}</button>
                <button className="btnDelete menuItemCrud__popupBtn" type="button" onClick={closePopup}>Hủy</button>
                {/* Nút xóa chỉ hiện khi đang sửa */}
                {popupItem._id && (
                  <button
                    className="btnDelete menuItemCrud__popupBtn"
                    type="button"
                    onClick={() => {
                      if (window.confirm('Bạn có chắc chắn muốn xóa món ăn này?')) {
                        handleDelete(popupItem._id);
                        closePopup();
                      }
                    }}
                  >Xóa</button>
                )}
              </div>
            </form>
            <div className="messageCrud menuItemCrud__popupMsg">{message}</div>
          </div>
        </div>
      )}
      <div className="messageCrud menuItemCrud__msg">{message}</div>
    </div>
  );
}

export default CrudMenuItems;
