

import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../../api/user';
import { getRestaurants } from '../../../api/restaurant';
import './CrudUsers.css';

function CrudUsers({ token }) {
  const [users, setUsers] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [filterRole, setFilterRole] = useState('');
  const [filterRestaurant, setFilterRestaurant] = useState('');
  const [form, setForm] = useState({ username: '', password: '', role: 'staff', name: '', phone: '', restaurant: '', isActive: true });
  const [editId, setEditId] = useState('');
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    fetchRestaurants();
    fetchData();
    // eslint-disable-next-line
  }, [token]);

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
    setForm({ username: '', password: '', role: 'staff', name: '', phone: '', restaurant: '', isActive: true });
    setShowPopup(true);
  };
  const closePopup = () => {
    setEditId('');
    setForm({ username: '', password: '', role: 'staff', name: '', phone: '', restaurant: '', isActive: true });
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
      restaurant: u.restaurant || '',
      isActive: typeof u.isActive === 'boolean' ? u.isActive : true
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
    setForm({ username: '', password: '', role: 'staff', name: '', phone: '', restaurant: '', isActive: true });
    setShowPopup(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
    const res = await deleteUser(id, token);
    setMessage(res.message || res.error || 'Lỗi');
    fetchData();
  };

  // Lọc users trên client
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
      <h2 className="userCrud__title">Quản lý người dùng</h2>
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
        <button className="userCrud__addBtn" onClick={openPopup}>Thêm người dùng</button>
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
              <th className="userCrud__th">Trạng thái</th>
              <th className="userCrud__th">Ngày tạo</th>
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
                    if (typeof u.restaurant === 'object' && u.restaurant.name) return u.restaurant.name;
                    const found = restaurants.find(r => r._id === u.restaurant);
                    return found ? found.name : u.restaurant;
                  })()
                }</td>
                <td className={"userCrud__td userCrud__td--status " + (u.isActive ? 'userCrud__td--active' : 'userCrud__td--inactive')}>
                  {u.isActive ? 'Đang hoạt động' : 'Đã khóa'}
                </td>
                <td className="userCrud__td">{u.createdAt ? new Date(u.createdAt).toLocaleString('vi-VN') : '-'}</td>
                <td className="userCrud__td userCrud__td--action">
                  <button className="userCrud__detailBtn" onClick={() => handleEdit(u)} title="Chi tiết">Chi tiết</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Popup chi tiết/sửa/xóa người dùng */}
      {showPopup && (
        <div className="userCrud__popupOverlay">
          <div className="userCrud__popupBox">
            <div className="userCrud__popupTitle">Chi tiết người dùng</div>
            <div className="userCrud__popupDetail">
              <div><b>Tên đăng nhập:</b> {form.username}</div>
              <div><b>Họ tên:</b> {form.name || '-'}</div>
              <div><b>Số điện thoại:</b> {form.phone || '-'}</div>
              <div><b>Vai trò:</b> {form.role === 'admin' ? 'Admin' : form.role === 'manager' ? 'Quản lý' : 'Nhân viên'}</div>
              <div><b>Nhà hàng:</b> {
                form.role === 'admin' ? '-' : (() => {
                  if (!form.restaurant) return '-';
                  const found = restaurants.find(r => r._id === form.restaurant || (typeof form.restaurant === 'object' && r._id === form.restaurant._id));
                  return found ? found.name : form.restaurant;
                })()
              }</div>
              <div><b>Trạng thái:</b> {form.isActive ? 'Đang hoạt động' : 'Đã khóa'}</div>
            </div>
            <div className="userCrud__popupActions">
              <button className="userCrud__popupBtn userCrud__popupBtn--edit" type="button" onClick={() => setShowPopup('edit')}>Sửa</button>
              <button className="userCrud__popupBtn userCrud__popupBtn--delete" type="button" onClick={() => handleDelete(editId)}>Xóa</button>
              <button className="userCrud__popupBtn userCrud__popupBtn--cancel" type="button" onClick={closePopup}>Đóng</button>
            </div>
            <div className="userCrud__msgPopup">{message}</div>
          </div>
        </div>
      )}
      <div className="userCrud__msgMain">{message}</div>
    </div>
  );
}

export default CrudUsers;
