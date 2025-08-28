import React, { useEffect, useState, useCallback } from 'react';
import './MenuTypePopup.css';
import { getMenuTypes, createMenuType, updateMenuType, deleteMenuType } from '../../../api/menutype';

function MenuTypePopup({ token, onClose }) {
  const [types, setTypes] = useState([]);
  const [editing, setEditing] = useState(null); // { _id, name, description }
  const [form, setForm] = useState({ name: '', description: '' });
  const [msg, setMsg] = useState('');

  // Tải danh sách loại menu
  const fetchTypes = useCallback(async () => {
    try {
      const res = await getMenuTypes(token);
      setTypes(res);
    } catch (err) {
      setMsg('Lỗi tải loại menu!');
    }
  }, [token]);
  useEffect(() => { 
    fetchTypes(); 
  }, [token, fetchTypes]);

  // Ẩn thông báo sau 5s
  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => setMsg(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  // Xử lý submit thêm/sửa
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setMsg('Tên loại menu không được để trống!');
      return;
    }
    try {
      let res;
      if (editing) {
        res = await updateMenuType(editing._id, form, token);
        setMsg(res._id ? 'Cập nhật thành công!' : res.error || 'Lỗi');
      } else {
        res = await createMenuType(form, token);
        setMsg(res._id ? 'Thêm thành công!' : res.error || 'Lỗi');
      }
      setEditing(null);
      setForm({ name: '', description: '' });
      fetchTypes();
    } catch {
      setMsg('Lỗi thao tác!');
    }
  };

  // Xử lý xóa
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa loại menu này?')) return;
    try {
      const res = await deleteMenuType(id, token);
      setMsg(res._id ? 'Đã xóa!' : res.error || 'Lỗi');
      fetchTypes();
    } catch {
      setMsg('Lỗi thao tác!');
    }
  };

  // Bắt đầu sửa
  const startEdit = (type) => {
    setEditing(type);
    setForm({ name: type.name, description: type.description || '' });
  };

  // Hủy sửa
  const cancelEdit = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
  };

  return (
    <div className="menuTypePopup__overlay">
      <div className="menuTypePopup__box" style={{ position: 'relative' }}>
        <button className="menuTypePopup__close" onClick={onClose} title="Đóng">×</button>
        <div className="menuTypePopup__title">Quản lý loại menu</div>
        <form onSubmit={handleSubmit} style={{ marginBottom: 10 }}>
          <input
            className="menuTypePopup__input"
            placeholder="Tên loại menu"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="menuTypePopup__input"
            placeholder="Mô tả (không bắt buộc)"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="menuTypePopup__btn menuTypePopup__btn--save" type="submit">
              {editing ? 'Cập nhật' : 'Thêm mới'}
            </button>
            {editing && (
              <button className="menuTypePopup__btn" type="button" onClick={cancelEdit}>Hủy</button>
            )}
          </div>
        </form>
        <table className="menuTypePopup__table">
          <thead>
            <tr>
              <th className="menuTypePopup__th">Tên loại</th>
              <th className="menuTypePopup__th">Mô tả</th>
              <th className="menuTypePopup__th">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {types.map(type => (
              <tr key={type._id} className="menuTypePopup__tr">
                <td className="menuTypePopup__td">{type.name}</td>
                <td className="menuTypePopup__td">{type.description || '-'}</td>
                <td className="menuTypePopup__td">
                  <div className="menuTypePopup__actions">
                    <button
                      className="menuTypePopup__btn menuTypePopup__btn--edit"
                      type="button"
                      onClick={() => startEdit(type)}
                    >Sửa</button>
                    <button
                      className="menuTypePopup__btn menuTypePopup__btn--delete"
                      type="button"
                      onClick={() => handleDelete(type._id)}
                    >Xóa</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="menuTypePopup__msg">{msg}</div>
      </div>
    </div>
  );
}

export default MenuTypePopup;
