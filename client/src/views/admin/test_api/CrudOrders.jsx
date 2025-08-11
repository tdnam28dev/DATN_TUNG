import React, { useState, useEffect } from 'react';
import { getOrders, createOrder, updateOrder, deleteOrder } from '../../../api/order';
// Import hàm lấy danh sách bàn
import { getTables } from '../../../api/table';
import { getMenuItems } from '../../../api/menuitem';

function CrudOrders({ token }) {
  const [orders, setOrders] = useState([]);
  // Form gồm bàn, danh sách món (mỗi món gồm id và số lượng), trạng thái, tổng tiền
  const [form, setForm] = useState({ table: '', items: [{ menuItem: '', quantity: 1 }], status: 'pending', total: '' });
  const [editId, setEditId] = useState('');
  const [message, setMessage] = useState('');
  const [tables, setTables] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    const fetchTables = async () => {
      const res = await getTables(token);
      setTables(res);
    };
    fetchTables();
  }, [token]);

  // Luôn lấy thông tin món ăn mới nhất khi items thay đổi (gọi món/gọi thêm món)
  useEffect(() => {
    const fetchMenuItems = async () => {
      const res = await getMenuItems(token);
      setMenuItems(res);
    };
    fetchMenuItems();
  }, [form.items, token]);

  // Tự động tính tổng tiền khi danh sách món hoặc thông tin món thay đổi
  useEffect(() => {
    let total = 0;
    form.items.forEach(item => {
      const menuItem = menuItems.find(mi => mi._id === item.menuItem);
      if (menuItem) {
        total += (menuItem.price || 0) * item.quantity;
      }
    });
    setForm(prev => ({ ...prev, total: total }));
  }, [form.items, menuItems]);

  const fetchData = async () => {
    const res = await getOrders(token);
    setOrders(res);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await createOrder(form, token);
    setMessage(res._id ? 'Thêm thành công!' : res.error || 'Lỗi');
    fetchData();
  };

  const handleEdit = (o) => {
    setEditId(o._id);
    setForm({ table: o.table, items: o.items || [], status: o.status, total: o.total });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await updateOrder(editId, form, token);
    setMessage(res._id ? 'Cập nhật thành công!' : res.error || 'Lỗi');
    setEditId('');
    setForm({ table: '', items: [], total: '', status: 'pending' });
    fetchData();
  };

  const handleDelete = async (id) => {
    const res = await deleteOrder(id, token);
    setMessage(res.message || res.error || 'Lỗi');
    fetchData();
  };

  return (
    <div style={{ padding: 20 }}>
      <h3>CRUD Đơn hàng (Gọi món theo bàn)</h3>
      <button onClick={fetchData}>Lấy danh sách đơn hàng</button>
      <ul>
        {Array.isArray(orders) && orders.map(o => (
          <li key={o._id}>
            Bàn: {o.table?.number || o.table} - Tổng tiền: {o.total} - Trạng thái: {o.status}
            <ul>
              {o.items && o.items.map((item, idx) => (
                <li key={idx}>
                  {(Array.isArray(menuItems) && menuItems.find(mi => mi._id === item.menuItem)?.name) || item.menuItem} x {item.quantity}
                </li>
              ))}
            </ul>
            <button onClick={() => handleEdit(o)} style={{ marginLeft: 10 }}>Sửa/Oder thêm</button>
            <button onClick={() => handleDelete(o._id)} style={{ marginLeft: 5 }}>Xóa</button>
          </li>
        ))}
      </ul>
      <form onSubmit={editId ? handleUpdate : handleCreate} style={{ marginTop: 20 }}>
        <select
          value={form.table}
          onChange={e => setForm({ ...form, table: e.target.value })}
        >
          <option value="">Chọn bàn</option>
          {Array.isArray(tables) && tables.map(t => (
            <option key={t._id} value={t._id}>Bàn số {t.number}</option>
          ))}
        </select>
        <div style={{ marginTop: 10 }}>
          <b>Chọn món và số lượng:</b>
          {form.items.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: 5, gap: 8 }}>
              <select
                value={item.menuItem}
                onChange={e => {
                  const value = e.target.value;
                  setForm(prev => {
                    const items = [...prev.items];
                    items[idx].menuItem = value;
                    return { ...prev, items };
                  });
                }}
                style={{ minWidth: 120 }}
              >
                <option value="">Chọn món</option>
                {menuItems.map(mi => (
                  <option key={mi._id} value={mi._id}>{mi.name}</option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={item.quantity}
                style={{ width: 60 }}
                onChange={e => {
                  const qty = Number(e.target.value);
                  setForm(prev => {
                    const items = [...prev.items];
                    items[idx].quantity = qty;
                    return { ...prev, items };
                  });
                }}
              />
              {/* Nút xóa dòng món */}
              {form.items.length > 1 && (
                <button type="button" onClick={() => {
                  setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
                }} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Xóa</button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => setForm(prev => ({ ...prev, items: [...prev.items, { menuItem: '', quantity: 1 }] }))} style={{ marginTop: 5 }}>+ Thêm món</button>
        </div>
        <input
          type="number"
          placeholder="Tổng tiền"
          value={form.total}
          readOnly
          style={{ background: '#eee' }}
        />
        <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
          <option value="pending">Chờ xử lý</option>
          <option value="completed">Hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <button type="submit">{editId ? 'Cập nhật' : 'Thêm mới'}</button>
      </form>
      <div>{message}</div>
    </div>
  );
}

export default CrudOrders;
