import React, { useState, useEffect } from 'react';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem} from '../../../api/menuitem';
import { getMenus } from '../../../api/menu';

function CrudMenuItems({ token }) {
  const [items, setItems] = useState([]);
  const [menus, setMenus] = useState([]);
  const [form, setForm] = useState({ name: '', price: '', description: '', category: '', menu: '' });
  const [editId, setEditId] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchMenus = async () => {
      const res = await getMenus(token);
      setMenus(res);
    };
    fetchMenus();
  }, [token]);

  const fetchData = async () => {
    const res = await getMenuItems(token);
    setItems(res);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await createMenuItem(form, token);
    setMessage(res._id ? 'Thêm thành công!' : res.error || 'Lỗi');
    fetchData();
  };

  const handleEdit = (i) => {
    setEditId(i._id);
    setForm({ name: i.name, price: i.price, description: i.description, category: i.category, menu: i.menu });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await updateMenuItem(editId, form, token);
    setMessage(res._id ? 'Cập nhật thành công!' : res.error || 'Lỗi');
    setEditId('');
    setForm({ name: '', price: '', description: '', category: '', menu: '' });
    fetchData();
  };

  const handleDelete = async (id) => {
    const res = await deleteMenuItem(id, token);
    setMessage(res.message || res.error || 'Lỗi');
    fetchData();
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>CRUD Món ăn</h3>
      <button onClick={fetchData}>Lấy danh sách món ăn</button>
      <ul>
        {Array.isArray(items) && items.map(i => (
          <li key={i._id}>
            {i.name} - {i.price}đ - {i.category}
            <button onClick={() => handleEdit(i)} style={{ marginLeft: 10 }}>Sửa</button>
            <button onClick={() => handleDelete(i._id)} style={{ marginLeft: 5 }}>Xóa</button>
          </li>
        ))}
      </ul>
      <form onSubmit={editId ? handleUpdate : handleCreate} style={{ marginTop: 20 }}>
        <input
          type="text"
          placeholder="Tên món ăn"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Giá"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
        />
        <input
          type="text"
          placeholder="Mô tả"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="text"
          placeholder="Loại món"
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
        />
        <select
          value={form.menu}
          onChange={e => setForm({ ...form, menu: e.target.value })}
        >
          <option value="">Chọn menu</option>
          {menus.map(m => (
            <option key={m._id} value={m._id}>{m.name}</option>
          ))}
        </select>
        <button type="submit">{editId ? 'Cập nhật' : 'Thêm mới'}</button>
      </form>
      <div>{message}</div>
    </div>
  );
}

export default CrudMenuItems;
