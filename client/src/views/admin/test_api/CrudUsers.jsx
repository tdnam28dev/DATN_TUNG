
import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../../api/user';
import { getRestaurants } from '../../../api/restaurant';
import './CrudUsers.css'; // Style riêng cho quản lý người dùng


function CrudUsers({ token }) {
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  // Tách filter thành 2 state riêng như CrudMenus
  const [filterRole, setFilterRole] = useState('');
  const [filterRestaurant, setFilterRestaurant] = useState('');
  const [form, setForm] = useState({ username: '', password: '', role: 'staff', name: '', phone: '', restaurant: '' });
  const [editId, setEditId] = useState('');
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchRestaurants();
    fetchData();
    // eslint-disable-next-line
  }, [token]);

  // Lấy toàn bộ users, filter trên client như CrudMenus
  const fetchData = async () => {
    const res = await getUsers(token);
    setUsers(Array.isArray(res) ? res : []);
  };
  const fetchRestaurants = async () => {
    const res = await getRestaurants(token);
    setRestaurants(Array.isArray(res) ? res : []);
  };

  const openPopup = () => {
    setEditId('');
    setForm({ username: '', password: '', role: 'staff', name: '', phone: '', restaurant: '' });
    setShowPopup(true);
  };
  const closePopup = () => {
    setEditId('');
    setForm({ username: '', password: '', role: 'staff', name: '', phone: '', restaurant: '' });
    setShowPopup(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const submitForm = { ...form };
    if (submitForm.role === 'admin') delete submitForm.restaurant;
    const res = await createUser(submitForm, token);
    setMessage(res._id ? 'Thêm thành công!' : res.error || 'Lỗi');
    setShowPopup(false);
    fetchData();
  };

  const handleEdit = (u) => {
    setEditId(u._id);
    setForm({
      username: u.username,
      password: '',
      role: u.role,
      name: u.name || '',
      phone: u.phone || '',
      restaurant: u.restaurant || ''
    });
    setShowPopup(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const submitForm = { ...form };
    if (!submitForm.password) delete submitForm.password;
    if (submitForm.role === 'admin') delete submitForm.restaurant;
    const res = await updateUser(editId, submitForm, token);
    setMessage(res._id ? 'Cập nhật thành công!' : res.error || 'Lỗi');
    setEditId('');
    setForm({ username: '', password: '', role: 'staff', name: '', phone: '', restaurant: '' });
    setShowPopup(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    const res = await deleteUser(id, token);
    setMessage(res.message || res.error || 'Lỗi');
    fetchData();
  };

  // Lọc users trên client như CrudMenus
  const filteredUsers = users.filter(u => {
    let matchRole = true;
    let matchRes = true;
    if (filterRole) matchRole = u.role === filterRole;
    if (filterRestaurant) {
      const rid = typeof u.restaurant === 'object' ? u.restaurant._id : u.restaurant;
      matchRes = rid === filterRestaurant;
    }
    return matchRole && matchRes;
  });

  return (
    <div className="userCrud">
      <div className="userCrud__header">
        <h3 className="userCrud__title">Quản lý người dùng</h3>
        <button className="userCrud__add btnSubmit" onClick={openPopup}>
          <span className="userCrud__addIcon">＋</span> Thêm người dùng
        </button>
      </div>
      {/* Bộ lọc giống CrudMenus */}
      <div className="userCrud__filterRow">
        <select
          className="userCrud__filterSelect"
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
        >
          <option value="">Tất cả quyền</option>
          <option value="admin">Admin</option>
          <option value="manager">Quản lý</option>
          <option value="staff">Nhân viên</option>
        </select>
        <select
          className="userCrud__filterSelect"
          value={filterRestaurant}
          onChange={e => setFilterRestaurant(e.target.value)}
        >
          <option value="">Tất cả nhà hàng</option>
          {restaurants.map(r => (
            <option key={r._id} value={r._id}>{r.name}</option>
          ))}
        </select>
      </div>
      <div className="userCrud__tableWrap">
        <table className="userCrud__table">
          <thead>
            <tr>
              <th className="userCrud__th">Tên đăng nhập</th>
              <th className="userCrud__th">Họ tên</th>
              <th className="userCrud__th">Số điện thoại</th>
              <th className="userCrud__th">Vai trò</th>
              <th className="userCrud__th">Nhà hàng</th>
              <th className="userCrud__th">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(filteredUsers) && filteredUsers.map(u => (
              <tr key={u._id} className="userCrud__tr">
                <td className="userCrud__td">{u.username}</td>
                <td className="userCrud__td">{u.name || '-'}</td>
                <td className="userCrud__td">{u.phone || '-'}</td>
                <td className="userCrud__td">{u.role === 'admin' ? 'Admin' : u.role === 'manager' ? 'Quản lý' : 'Nhân viên'}</td>
                <td className="userCrud__td">{
                  (() => {
                    if (!u.restaurant) return '-';
                    // Nếu đã populate thì lấy tên, nếu chỉ là id thì tra trong danh sách restaurants
                    if (typeof u.restaurant === 'object' && u.restaurant.name) return u.restaurant.name;
                    const found = restaurants.find(r => r._id === u.restaurant);
                    return found ? found.name : u.restaurant;
                  })()
                }</td>
                <td className="userCrud__td userCrud__td--action">
                  <button className="userCrud__edit btnEdit" onClick={() => handleEdit(u)} title="Sửa">
                    <span className="userCrud__editIcon">✎</span> Sửa
                  </button>
                  <button className="userCrud__popupBtn btnDelete" style={{ marginLeft: 6 }} onClick={() => handleDelete(u._id)}>Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Popup thêm/sửa người dùng */}
      {showPopup && (
        <div className="popup-restaurant-overlay">
          <div className="popup-restaurant-box userCrud__popupBox">
            <div className="userCrud__popupTitle">{editId ? 'Cập nhật người dùng' : 'Thêm mới người dùng'}</div>
            <form className="userCrud__popupForm" onSubmit={editId ? handleUpdate : handleCreate}>
              <input
                className="inputCrud userCrud__input"
                type="text"
                placeholder="Tên đăng nhập"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
              />
              <input
                className="inputCrud userCrud__input"
                type="password"
                placeholder="Mật khẩu"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required={!editId}
              />
              <input
                className="inputCrud userCrud__input"
                type="text"
                placeholder="Họ tên người dùng"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
              <input
                className="inputCrud userCrud__input"
                type="text"
                placeholder="Số điện thoại"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
              <select
                className="selectCrud userCrud__input"
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                required
              >
                <option value="staff">Nhân viên</option>
                <option value="manager">Quản lý</option>
                <option value="admin">Admin</option>
              </select>
              {/* Chọn nhà hàng nếu không phải admin */}
              {form.role !== 'admin' && (
                <select
                  className="selectCrud userCrud__input"
                  value={form.restaurant}
                  onChange={e => setForm({ ...form, restaurant: e.target.value })}
                  required
                >
                  <option value="">-- Chọn nhà hàng --</option>
                  {restaurants.map(r => (
                    <option key={r._id} value={r._id}>{r.name}</option>
                  ))}
                </select>
              )}
              <div className="userCrud__popupActions">
                <button className="userCrud__popupBtn btnSubmit" type="submit">{editId ? 'Cập nhật' : 'Lưu'}</button>
                <button className="userCrud__popupBtn btnDelete" type="button" onClick={closePopup}>Hủy</button>
              </div>
            </form>
            <div className="userCrud__msg">{message}</div>
          </div>
        </div>
      )}
      <div className="userCrud__msg">{message}</div>
    </div>
  );
}

export default CrudUsers;
