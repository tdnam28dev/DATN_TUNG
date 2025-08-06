import React, { useState, useEffect } from 'react';
import { getTables, createTable, updateTable, deleteTable} from '../../../api/table';
import { getRestaurants } from '../../../api/restaurant';

function CrudTables({ token }) {
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState({ number: '', seats: '', status: 'available', restaurant: '' });
  const [editId, setEditId] = useState('');
  const [message, setMessage] = useState('');
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      const res = await getRestaurants(token);
      setRestaurants(res);
    };
    fetchRestaurants();
  }, [token]);

  const fetchData = async () => {
    const res = await getTables(token);
    setTables(res);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await createTable(form, token);
    setMessage(res._id ? 'Thêm thành công!' : res.error || 'Lỗi');
    fetchData();
  };

  const handleEdit = (t) => {
    setEditId(t._id);
    setForm({ number: t.number, seats: t.seats, status: t.status, restaurant: t.restaurant });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await updateTable(editId, form, token);
    setMessage(res._id ? 'Cập nhật thành công!' : res.error || 'Lỗi');
    setEditId('');
    setForm({ number: '', seats: '', status: 'available', restaurant: '' });
    fetchData();
  };

  const handleDelete = async (id) => {
    const res = await deleteTable(id, token);
    setMessage(res.message || res.error || 'Lỗi');
    fetchData();
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>CRUD Bàn</h3>
      <button onClick={fetchData}>Lấy danh sách bàn</button>
      <ul>
        {Array.isArray(tables) && tables.map(t => (
          <li key={t._id}>
            Bàn số {t.number} - Số ghế: {t.seats} - Trạng thái: {t.status}
            <button onClick={() => handleEdit(t)} style={{ marginLeft: 10 }}>Sửa</button>
            <button onClick={() => handleDelete(t._id)} style={{ marginLeft: 5 }}>Xóa</button>
          </li>
        ))}
      </ul>
      <form onSubmit={editId ? handleUpdate : handleCreate} style={{ marginTop: 20 }}>
        <input
          type="number"
          placeholder="Số bàn"
          value={form.number}
          onChange={e => setForm({ ...form, number: e.target.value })}
        />
        <input
          type="number"
          placeholder="Số ghế"
          value={form.seats}
          onChange={e => setForm({ ...form, seats: e.target.value })}
        />
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
          <option value="available">Trống</option>
          <option value="reserved">Đã đặt</option>
          <option value="occupied">Đang sử dụng</option>
        </select>
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

export default CrudTables;
