
import React from 'react';
import './RestaurantFormPopup.css';
import { wardsByDistrict } from './address';

// Popup nhập/sửa thông tin nhà hàng
// Popup nhập/sửa thông tin nhà hàng
function RestaurantFormPopup({
  editId,
  form,
  setForm,
  setShowPopup,
  setEditId,
  handleCreate,
  handleUpdate,
  message
}) {
  // Khi popup mount, chặn cuộn body. Khi unmount, khôi phục lại.
  // useEffect(() => {
  //   const original = document.body.style.overflow;
  //   document.body.style.overflow = 'hidden';
  //   return () => {
  //     document.body.style.overflow = original;
  //   };
  // }, []);

  return (
    <div className="popup-restaurant-overlay">
      <div className="popup-restaurant-box">
        <div className="popup-restaurant-title">{editId ? 'Cập nhật nhà hàng' : 'Thêm mới nhà hàng'}</div>
        <div className="popup-restaurant-sub">Vui lòng nhập đầy đủ thông tin bên dưới</div>
        <form className="formCrud popup-restaurant-form" onSubmit={editId ? handleUpdate : handleCreate}>
          <div className="popup-restaurant-row">
            <input
              className="inputCrud popup-restaurant-input popup-restaurant-input--60"
              type="text"
              placeholder="Tên cơ sở"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              className="inputCrud popup-restaurant-input popup-restaurant-input--40"
              type="text"
              placeholder="Số điện thoại"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div className="popup-restaurant-row">
            <input
              className="inputCrud popup-restaurant-input popup-restaurant-input--60"
              type="text"
              placeholder="Địa chỉ cụ thể (số nhà, đường, ... )"
              value={form.address}
              onChange={e => setForm({ ...form, address: e.target.value })}
              required
            />
            <select
              className="selectCrud popup-restaurant-input popup-restaurant-input--40"
              value={form.district || ''}
              onChange={e => {
                setForm({ ...form, district: e.target.value, ward: '' });
              }}
              required
            >
              <option value="">Chọn quận</option>
              {Object.keys(wardsByDistrict).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          {form.district && Array.isArray(wardsByDistrict[form.district]) && (
            <select
              className="selectCrud"
              value={form.ward || ''}
              onChange={e => setForm({ ...form, ward: e.target.value })}
              required
              style={{ width: '100%' }}
            >
              <option value="">Chọn phường/xã/thị trấn</option>
              {wardsByDistrict[form.district].map(w => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          )}
          <input
            className="inputCrud popup-restaurant-input"
            type="text"
            placeholder="Mô tả (ví dụ: quán nhậu, nhà hàng gia đình...)"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <div className="popup-restaurant-row">
            <select
              className="selectCrud popup-restaurant-input popup-restaurant-input--40"
              value={form.status || 'inactive'}
              onChange={e => setForm({ ...form, status: e.target.value })}
            >
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đang nghỉ</option>
            </select>
            <input
              className="inputCrud popup-restaurant-input popup-restaurant-input--30"
              type="time"
              placeholder="Giờ mở cửa"
              value={form.openTime || ''}
              onChange={e => setForm({ ...form, openTime: e.target.value })}
            />
            <input
              className="inputCrud popup-restaurant-input popup-restaurant-input--30"
              type="time"
              placeholder="Giờ đóng cửa"
              value={form.closeTime || ''}
              onChange={e => setForm({ ...form, closeTime: e.target.value })}
            />
          </div>
          <div className="popup-restaurant-row">
            <input
              className="inputCrud popup-restaurant-input popup-restaurant-input--33"
              type="number"
              placeholder="Sức chứa (khách)"
              value={form.capacity || ''}
              onChange={e => setForm({ ...form, capacity: e.target.value })}
              min={1}
            />
            <input
              className="inputCrud popup-restaurant-input popup-restaurant-input--33"
              type="number"
              placeholder="Diện tích (m2)"
              value={form.area || ''}
              onChange={e => setForm({ ...form, area: e.target.value })}
              min={1}
            />
            <input
              className="inputCrud popup-restaurant-input popup-restaurant-input--34"
              type="number"
              placeholder="Số tầng"
              value={form.floors || ''}
              onChange={e => setForm({ ...form, floors: e.target.value })}
              min={1}
            />
          </div>
          {/* Nút lưu/hủy */}
          <div className="popup-restaurant-actions">
            <button className="btnSubmit" type="submit">Lưu</button>
            <button type="button" className="btnDelete" onClick={() => { setShowPopup(false); setEditId(''); }}>Hủy</button>
          </div>
        </form>
        <div className="messageCrud">{message}</div>
      </div>
    </div>
  );
}

export default RestaurantFormPopup;
