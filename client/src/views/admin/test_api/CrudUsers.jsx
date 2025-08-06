import React, { useState } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../../api/user';

function CrudUsers({ token }) {
  const [users, setUsers] = useState([]);
  // Thêm name và phone vào state form
  const [form, setForm] = useState({ username: '', password: '', role: 'staff', name: '', phone: '' });
  const [editId, setEditId] = useState('');
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    const res = await getUsers(token);
    setUsers(res);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await createUser(form, token);
    setMessage(res._id ? 'Thêm thành công!' : res.error || 'Lỗi');
    fetchData();
  };

  const handleEdit = (u) => {
    setEditId(u._id);
    setForm({
      username: u.username,
      password: '',
      role: u.role,
      name: u.name || '',
      phone: u.phone || ''
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await updateUser(editId, form, token);
    setMessage(res._id ? 'Cập nhật thành công!' : res.error || 'Lỗi');
    setEditId('');
    setForm({ username: '', password: '', role: 'staff' });
    fetchData();
  };

  const handleDelete = async (id) => {
    const res = await deleteUser(id, token);
    setMessage(res.message || res.error || 'Lỗi');
    fetchData();
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>CRUD Người dùng</h3>
      <button onClick={fetchData}>Lấy danh sách người dùng</button>
      <ul>
        {Array.isArray(users) && users.map(u => (
          <li key={u._id}>
            {u.username} - {u.role}
            <button onClick={() => handleEdit(u)} style={{ marginLeft: 10 }}>Sửa</button>
            <button onClick={() => handleDelete(u._id)} style={{ marginLeft: 5 }}>Xóa</button>
          </li>
        ))}
      </ul>
      <form onSubmit={editId ? handleUpdate : handleCreate} style={{ marginTop: 20 }}>
        <input
          type="text"
          placeholder="Tên đăng nhập"
          value={form.username}
          onChange={e => setForm({ ...form, username: e.target.value })}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
        />
        <input
          type="text"
          placeholder="Họ tên người dùng"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="text"
          placeholder="Số điện thoại"
          value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
        />
        <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
          <option value="staff">Nhân viên</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit">{editId ? 'Cập nhật' : 'Thêm mới'}</button>
      </form>
      <div>{message}</div>
    </div>
  );
}

export default CrudUsers;
