import React, { useState, useEffect } from 'react';
import { getMenus, createMenu, updateMenu, deleteMenu} from '../../../api/menu';
import { getRestaurants } from '../../../api/restaurant';

function CrudMenus({ token }) {
  const [menus, setMenus] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState({ name: '', restaurant: '' });
  const [editId, setEditId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchRestaurants = async () => {
      const res = await getRestaurants(token);
      setRestaurants(res);
    };
    fetchRestaurants();
  }, [token]);

  const fetchData = async () => {
    const res = await getMenus(token);
    setMenus(res);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await createMenu(form, token);
    setMessage(res._id ? 'Thêm thành công!' : res.error || 'Lỗi');
    fetchData();
  };

  const handleEdit = (m) => {
    setEditId(m._id);
    setForm({ name: m.name, restaurant: m.restaurant._id });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await updateMenu(editId, form, token);
    setMessage(res._id ? 'Cập nhật thành công!' : res.error || 'Lỗi');
    setEditId('');
    setForm({ name: '', restaurant: '' });
    fetchData();
  };

  const handleDelete = async (id) => {
    const res = await deleteMenu(id, token);
    setMessage(res.message || res.error || 'Lỗi');
    fetchData();
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>CRUD Thực đơn</h3>
      <button onClick={fetchData}>Lấy danh sách thực đơn</button>
      <ul>
        {Array.isArray(menus) && menus.map(m => (
          <li key={m._id}>
            {m.name}
            <button onClick={() => handleEdit(m)} style={{ marginLeft: 10 }}>Sửa</button>
            <button onClick={() => handleDelete(m._id)} style={{ marginLeft: 5 }}>Xóa</button>
          </li>
        ))}
      </ul>
      <form onSubmit={editId ? handleUpdate : handleCreate} style={{ marginTop: 20 }}>
        <input
          type="text"
          placeholder="Tên thực đơn"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <select
          value={form.restaurant}
          onChange={e => setForm({ ...form, restaurant: e.target.value })}
        >
          <option value="">Chọn nhà hàng</option>
          {restaurants.map(r => (
            <option key={r._id} value={r._id}>{r.name}</option>
          ))}
        </select>
        <button type="submit">{editId ? 'Cập nhật' : 'Thêm mới'}</button>
      </form>
      <div>{message}</div>
    </div>
  );
}

export default CrudMenus;
