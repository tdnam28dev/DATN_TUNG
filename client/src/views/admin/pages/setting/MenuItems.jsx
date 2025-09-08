import React, { useState, useEffect } from 'react';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem} from '../../../../api/menuitem';
import { getMenus } from '../../../../api/menu';
import { getMenuTypes } from '../../../../api/menutype';
import './css/MenuItems.css';


function MenuItems({ token }) {
  // State cho danh sách món ăn, menu, loại menu
  const [items, setItems] = useState([]);
  const [menus, setMenus] = useState([]);
  const [menuTypes, setMenuTypes] = useState([]);
  // State cho bộ lọc
  const [filterMenu, setFilterMenu] = useState('');
  const [filterType, setFilterType] = useState('');
  // State cho popup chi tiết món ăn
  const [showDetail, setShowDetail] = useState(false);
  const [detailItem, setDetailItem] = useState(null);
  // State cho trạng thái chỉnh sửa
  const [isEdit, setIsEdit] = useState(false);
  const [editItem, setEditItem] = useState(null);
  // State cho thông báo
  const [message, setMessage] = useState('');
  // Ẩn thông báo sau 5s
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  // Tải danh sách món ăn, menu, loại menu
  useEffect(() => {
    const fetchAll = async () => {
      const [resItems, resMenus, resTypes] = await Promise.all([
        getMenuItems(token),
        getMenus(token),
        getMenuTypes(token)
      ]);
      setItems(Array.isArray(resItems) ? resItems : []);
      setMenus(Array.isArray(resMenus) ? resMenus : []);
      setMenuTypes(Array.isArray(resTypes) ? resTypes : []);
    };
    fetchAll();
  }, [token]);

  // Lọc món ăn theo menu và loại menu
  const filteredItems = items.filter(i => {
    const matchMenu = !filterMenu || (i.menu === filterMenu || (typeof i.menu === 'object' && i.menu?._id === filterMenu));
    if (!filterType) return matchMenu;
    const foundMenu = menus.find(m => m._id === (typeof i.menu === 'object' ? i.menu._id : i.menu));
    return matchMenu && foundMenu && foundMenu.type === filterType;
  });

  // Mở popup chi tiết món ăn
  const openDetail = (item) => {
    setDetailItem(item ? { ...item } : null);
    setIsEdit(false);
    setEditItem(null);
    setShowDetail(true);
  };
  // Đóng popup chi tiết
  const closeDetail = () => {
    setShowDetail(false);
    setDetailItem(null);
    setIsEdit(false);
    setEditItem(null);
  };

  // Mở popup chỉnh sửa
  const startEdit = () => {
    setIsEdit(true);
    setEditItem({ ...detailItem });
  };
  // Đóng popup chỉnh sửa
  const cancelEdit = () => {
    setIsEdit(false);
    setEditItem(null);
  };

  // Lưu món ăn khi chỉnh sửa (hỗ trợ upload ảnh)
  const handleSaveEdit = async () => {
    if (!editItem.name || !editItem.price || !editItem.menu) {
      setMessage('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    let sendData = { ...editItem };
    if (editItem.imageFile) sendData.imageFile = editItem.imageFile;
    let res;
    if (editItem._id) {
      res = await updateMenuItem(editItem._id, sendData, token);
      setMessage(res._id ? 'Cập nhật thành công!' : res.error || 'Lỗi');
      // Cập nhật lại danh sách món ăn sau khi sửa
      if (res._id) {
        setItems(items.map(item => item._id === res._id ? res : item));
      }
    } else {
      res = await createMenuItem(sendData, token);
      setMessage(res._id ? 'Thêm thành công!' : res.error || 'Lỗi');
      // Thêm món mới vào danh sách mà không reload trang, dùng callback để tránh lỗi re-render
      if (res._id) {
        setItems(prev => [res, ...prev]);
      }
    }
    setIsEdit(false);
    setEditItem(null);
    setShowDetail(false);
  };

  // Xóa món ăn
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa món ăn này?')) {
      const res = await deleteMenuItem(id, token);
      setMessage(res.message || res.error || 'Lỗi');
      setShowDetail(false);
      // Reload
      const resItems = await getMenuItems(token);
      setItems(Array.isArray(resItems) ? resItems : []);
    }
  };

  // Mở popup thêm mới
  const openAdd = () => {
    setDetailItem(null);
    setIsEdit(true);
    setEditItem({ name: '', price: '', description: '', menu: '' });
    setShowDetail(true);
  };

  return (
    <div className="menuItemManager">
      {/* Bộ lọc menu và loại menu */}
      <div className="menuItemManager__filter">
        <select className="menuItemManager__filterSelect" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">Tất cả loại món</option>
          {menuTypes.map(type => (
            <option key={type._id} value={type.name}>{type.name}</option>
          ))}
        </select>
        <select className="menuItemManager__filterSelect" value={filterMenu} onChange={e => setFilterMenu(e.target.value)}>
          <option value="">Tất cả menu</option>
          {menus.map(m => (
            <option key={m._id} value={m._id}>{m.name}</option>
          ))}
        </select>
        <button className="menuItemManager__addBtn" onClick={openAdd}>＋ Thêm mới</button>
      </div>
      {/* Bảng danh sách món ăn */}
      <div className="menuItemManager__tableWrap">
        <table className="menuItemManager__table">
          <thead>
            <tr>
              <th className="menuItemManager__th">Tên món</th>
              <th className="menuItemManager__th">Giá</th>
              <th className="menuItemManager__th">Loại món</th>
              <th className="menuItemManager__th">Menu</th>
              <th className="menuItemManager__th">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(i => {
              const foundMenu = menus.find(m => m._id === (typeof i.menu === 'object' ? i.menu._id : i.menu));
              return (
                <tr key={i._id} className="menuItemManager__tr">
                  <td className="menuItemManager__td">{i.name}</td>
                  <td className="menuItemManager__td">{i.price?.toLocaleString()} đ</td>
                  <td className="menuItemManager__td">{foundMenu ? foundMenu.type : '-'}</td>
                  <td className="menuItemManager__td">{foundMenu ? foundMenu.name : '-'}</td>
                  <td className="menuItemManager__td menuItemManager__td--action">
                    <button className="menuItemManager__detailBtn" onClick={() => openDetail(i)}>Chi tiết</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Popup thêm mới món ăn */}
      {showDetail && isEdit && !editItem?._id && (
        <div className="menuItemManager__popupOverlay">
          <div className="menuItemManager__popupBox">
            <h3 className="menuItemManager__popupTitle">Thêm mới món ăn</h3>
            <div className="menuItemManager__popupInfo">
              <div className="menuItemManager__popupGrid">
                <div className="menuItemManager__popupCol">
                  <input
                    className="menuItemManager__popupInput"
                    type="text"
                    placeholder="Tên món ăn"
                    value={editItem.name}
                    onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                    required
                  />
                  <input
                    className="menuItemManager__popupInput"
                    type="number"
                    placeholder="Giá"
                    value={editItem.price}
                    onChange={e => setEditItem({ ...editItem, price: e.target.value })}
                    required
                  />
                  <select
                    className="menuItemManager__popupInput"
                    value={editItem.menu}
                    onChange={e => setEditItem({ ...editItem, menu: e.target.value })}
                    required
                  >
                    <option value="">Chọn menu</option>
                    {menus.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className="menuItemManager__popupCol">
                  <input
                    className="menuItemManager__popupInput"
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files[0];
                      setEditItem({ ...editItem, imageFile: file });
                    }}
                  />
                  {editItem.imageFile && (
                    <img
                      src={URL.createObjectURL(editItem.imageFile)}
                      alt="Ảnh món ăn"
                      style={{ maxWidth: 120, marginTop: 8, borderRadius: 8 }}
                    />
                  )}
                </div>
                <div className="menuItemManager__popupColFull">
                  <textarea
                    className="menuItemManager__popupTextarea"
                    placeholder="Mô tả món ăn"
                    value={editItem.description}
                    onChange={e => setEditItem({ ...editItem, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <div className="menuItemManager__popupFooter">
              <button className="menuItemManager__popupBtn" onClick={handleSaveEdit}>Lưu</button>
              <button className="menuItemManager__popupBtn menuItemManager__popupBtn--close" onClick={closeDetail}>Hủy</button>
            </div>
            <div className="menuItemManager__popupMsg">{message}</div>
          </div>
        </div>
      )}

      {/* Popup sửa/chi tiết món ăn */}
      {showDetail && (!isEdit || (isEdit && editItem?._id)) && detailItem && (
        <div className="menuItemManager__popupOverlay">
          <div className="menuItemManager__popupBox">
            <h3 className="menuItemManager__popupTitle">{isEdit ? 'Cập nhật món ăn' : 'Chi tiết món ăn'}</h3>
            <div className="menuItemManager__popupInfo">
              {isEdit ? (
                <div className="menuItemManager__popupGrid">
                  <div className="menuItemManager__popupCol">
                    <input
                      className="menuItemManager__popupInput"
                      type="text"
                      placeholder="Tên món ăn"
                      value={editItem.name}
                      onChange={e => setEditItem({ ...editItem, name: e.target.value })}
                      required
                    />
                    <input
                      className="menuItemManager__popupInput"
                      type="number"
                      placeholder="Giá"
                      value={editItem.price}
                      onChange={e => setEditItem({ ...editItem, price: e.target.value })}
                      required
                    />
                    <select
                      className="menuItemManager__popupInput"
                      value={editItem.menu}
                      onChange={e => setEditItem({ ...editItem, menu: e.target.value })}
                      required
                    >
                      <option value="">Chọn menu</option>
                      {menus.map(m => (
                        <option key={m._id} value={m._id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="menuItemManager__popupCol">
                    <input
                      className="menuItemManager__popupInput"
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files[0];
                        setEditItem({ ...editItem, imageFile: file });
                      }}
                    />
                    {editItem.imageFile && (
                      <img
                        src={URL.createObjectURL(editItem.imageFile)}
                        alt="Ảnh món ăn"
                        style={{ maxWidth: 120, marginTop: 8, borderRadius: 8 }}
                      />
                    )}
                    {!editItem.imageFile && editItem.imagePath && (
                      <img
                        src={editItem.imagePath}
                        alt="Ảnh món ăn"
                        style={{ maxWidth: 120, marginTop: 8, borderRadius: 8 }}
                      />
                    )}
                  </div>
                  <div className="menuItemManager__popupColFull">
                    <textarea
                      className="menuItemManager__popupTextarea"
                      placeholder="Mô tả món ăn"
                      value={editItem.description}
                      onChange={e => setEditItem({ ...editItem, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="menuItemManager__popupRow"><span>Tên món:</span> <b>{detailItem.name}</b></div>
                  <div className="menuItemManager__popupRow"><span>Giá:</span> <b>{detailItem.price?.toLocaleString()} đ</b></div>
                  <div className="menuItemManager__popupRow"><span>Mô tả:</span> <b>{detailItem.description}</b></div>
                  <div className="menuItemManager__popupRow"><span>Menu:</span> <b>{(() => {
                    const found = menus.find(m => m._id === (typeof detailItem.menu === 'object' ? detailItem.menu._id : detailItem.menu));
                    return found ? found.name : '-';
                  })()}</b></div>
                  <div className="menuItemManager__popupRow"><span>Loại món:</span> <b>{(() => {
                    const found = menus.find(m => m._id === (typeof detailItem.menu === 'object' ? detailItem.menu._id : detailItem.menu));
                    return found ? found.type : '-';
                  })()}</b></div>
                  {detailItem.imagePath && (
                    <div style={{ marginTop: 12 }}>
                      <img src={detailItem.imagePath} alt="Ảnh món ăn" style={{ maxWidth: 120, borderRadius: 8 }} />
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="menuItemManager__popupFooter">
              {isEdit ? (
                <>
                  <button className="menuItemManager__popupBtn" onClick={handleSaveEdit}>Lưu</button>
                  <button className="menuItemManager__popupBtn menuItemManager__popupBtn--danger" onClick={cancelEdit}>Hủy</button>
                </>
              ) : (
                <>
                  <button className="menuItemManager__popupBtn" onClick={startEdit}>Sửa</button>
                  <button className="menuItemManager__popupBtn menuItemManager__popupBtn--danger" onClick={() => handleDelete(detailItem._id)}>Xóa</button>
                  <button className="menuItemManager__popupBtn menuItemManager__popupBtn--close" onClick={closeDetail}>Đóng</button>
                </>
              )}
            </div>
            <div className="menuItemManager__popupMsg">{message}</div>
          </div>
        </div>
      )}
      <div className="menuItemManager__msg">{message}</div>
    </div>
  );
}

export default MenuItems;
