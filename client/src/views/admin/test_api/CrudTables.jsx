import React, { useState, useEffect } from 'react';
import { getTables, createTable, updateTable, deleteTable } from '../../../api/table';
import { getRestaurants } from '../../../api/restaurant';
import './CrudTables.css';

const seatOptions = [
  { value: 2, label: 'Bàn 2', img: '/images/table2.png' },
  { value: 4, label: 'Bàn 4', img: '/images/table4.png' },
  { value: 6, label: 'Bàn 6', img: '/images/table6.png' },
];
const typeOptions = [
  { value: 'round', label: 'Tròn', img: '/images/round.png' },
  { value: 'square', label: 'Vuông', img: '/images/square.png' },
  { value: 'family', label: 'Gia đình', img: '/images/family.png' },
];

function CrudTables({ token }) {
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState({ number: '', seats: '', type: '', status: 'available', restaurant: '' });
  const [editId, setEditId] = useState('');
  const [message, setMessage] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  // Thêm state cho bộ lọc
  const [filter, setFilter] = useState({ restaurant: '', type: '', seats: '' });

  useEffect(() => {
    const fetchAll = async () => {
      const res = await getRestaurants(token);
      setRestaurants(res);
      await fetchData();
    };
    fetchAll();
    // eslint-disable-next-line
  }, [token]);

  const fetchData = async () => {
    const res = await getTables(token);
    setTables(res);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const res = await createTable(form, token);
    setMessage(res._id ? 'Thêm thành công!' : res.error || 'Lỗi');
    setShowPopup(false);
    fetchData();
  };

  const handleEdit = (t) => {
    setEditId(t._id);
    setForm({ number: t.number, seats: t.seats, type: t.type || '', status: t.status, restaurant: t.restaurant });
    setShowPopup(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const res = await updateTable(editId, form, token);
    setMessage(res._id ? 'Cập nhật thành công!' : res.error || 'Lỗi');
    setEditId('');
    setForm({ number: '', seats: '', type: '', status: 'available', restaurant: '' });
    setShowPopup(false);
    fetchData();
  };

  const handleDelete = async (id) => {
    const res = await deleteTable(id, token);
    setMessage(res.message || res.error || 'Lỗi');
    fetchData();
  };

  const openPopup = () => {
    setEditId('');
    setForm({ number: '', seats: '', type: '', status: 'available', restaurant: '' });
    setShowPopup(true);
  };
  const closePopup = () => {
    setShowPopup(false);
    setEditId('');
    setForm({ number: '', seats: '', type: '', status: 'available', restaurant: '' });
  };

  return (
    <div className="tableCrud">
      <div className="tableCrud__header">
        <h3 className="tableCrud__title">Quản lý bàn</h3>
        <button className="btnSubmit tableCrud__add" onClick={openPopup}>
          <span className="tableCrud__addIcon">＋</span> Thêm bàn
        </button>
      </div>
      {/* Bộ lọc */}
      <div className="tableCrud__filters" style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <select
          className="selectCrud tableCrud__filterSelect"
          value={filter.restaurant}
          onChange={e => setFilter(f => ({ ...f, restaurant: e.target.value }))}
        >
          <option value="">Tất cả nhà hàng</option>
          {restaurants.map(r => (
            <option key={r._id} value={r._id}>{r.name}</option>
          ))}
        </select>
        <select
          className="selectCrud tableCrud__filterSelect"
          value={filter.type}
          onChange={e => setFilter(f => ({ ...f, type: e.target.value }))}
        >
          <option value="">Tất cả loại bàn</option>
          {typeOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          className="selectCrud tableCrud__filterSelect"
          value={filter.seats}
          onChange={e => setFilter(f => ({ ...f, seats: e.target.value }))}
        >
          <option value="">Tất cả bàn</option>
          {seatOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <div className="tableCrud__tableWrap">
        <table className="tableCrud__table">
          <thead>
            <tr>
              <th className="tableCrud__th">Số bàn</th>
              <th className="tableCrud__th">Số ghế</th>
              <th className="tableCrud__th">Loại bàn</th>
              <th className="tableCrud__th">Trạng thái</th>
              <th className="tableCrud__th">Nhà hàng</th>
              <th className="tableCrud__th">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(tables) && tables
              .filter(t =>
                (!filter.restaurant || (typeof t.restaurant === 'object' ? t.restaurant._id : t.restaurant) === filter.restaurant)
                && (!filter.type || t.type === filter.type)
                && (!filter.seats || String(t.seats) === String(filter.seats))
              )
              .map(t => (
                <tr key={t._id} className="tableCrud__tr">
                  <td className="tableCrud__td">{t.number}</td>
                  <td className="tableCrud__td">{t.seats}</td>
                  <td className="tableCrud__td">{(() => {
                    const found = typeOptions.find(opt => opt.value === t.type);
                    return found ? (
                      <span><img src={found.img} alt={found.label} style={{ width: 24, height: 24, verticalAlign: 'middle', marginRight: 4 }} />{found.label}</span>
                    ) : '-';
                  })()}</td>
                  <td className="tableCrud__td">{t.status === 'available' ? 'Trống' : t.status === 'reserved' ? 'Đã đặt' : 'Đang sử dụng'}</td>
                  <td className="tableCrud__td">{(() => {
                    const found = restaurants.find(r => r._id === (typeof t.restaurant === 'object' ? t.restaurant._id : t.restaurant));
                    return found ? found.name : '-';
                  })()}</td>
                  <td className="tableCrud__td tableCrud__td--action">
                    <button className="btnEdit tableCrud__edit" onClick={() => handleEdit(t)} title="Sửa bàn">
                      <span className="tableCrud__editIcon">✎</span> Sửa
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {/* Popup thêm/sửa bàn */}
      {showPopup && (
        <div className="popup-restaurant-overlay">
          <div className="popup-restaurant-box tableCrud__popupBox">
            <div className="popup-restaurant-title tableCrud__popupTitle">{editId ? 'Cập nhật bàn' : 'Thêm mới bàn'}</div>
            <form className="tableCrud__popupForm" onSubmit={editId ? handleUpdate : handleCreate}>
              <input
                className="inputCrud popup-restaurant-input tableCrud__input"
                type="number"
                placeholder="Số bàn"
                value={form.number}
                onChange={e => setForm({ ...form, number: e.target.value })}
                required
              />
              {/* Chọn số ghế bằng icon */}
              <div className="tableCrud__seatSelect">
                {seatOptions.map(opt => (
                  <div
                    key={opt.value}
                    className={`tableCrud__seatOption${form.seats === opt.value ? ' tableCrud__seatOption--active' : ''}`}
                    onClick={() => setForm({ ...form, seats: opt.value })}
                  >
                    <img src={opt.img} alt={opt.label} />
                    <span>{opt.label}</span>
                  </div>
                ))}
              </div>
              {/* Chọn loại bàn bằng icon */}
              <div className="tableCrud__typeSelect">
                {typeOptions.map(opt => (
                  <div
                    key={opt.value}
                    className={`tableCrud__typeOption${form.type === opt.value ? ' tableCrud__typeOption--active' : ''}`}
                    onClick={() => setForm({ ...form, type: opt.value })}
                  >
                    <img src={opt.img} alt={opt.label} />
                    <span>{opt.label}</span>
                  </div>
                ))}
              </div>
              <select
                className="selectCrud popup-restaurant-input tableCrud__input"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                required
              >
                <option value="available">Trống</option>
                <option value="reserved">Đã đặt</option>
                <option value="occupied">Đang sử dụng</option>
              </select>
              <select
                className="selectCrud popup-restaurant-input tableCrud__input"
                value={form.restaurant}
                onChange={e => setForm({ ...form, restaurant: e.target.value })}
                required
              >
                <option value="">Chọn nhà hàng</option>
                {restaurants.map(r => (
                  <option key={r._id} value={r._id}>{r.name}</option>
                ))}
              </select>
              <div className="tableCrud__popupActions">
                <button className="tableCrud__popupBtn btnSubmit" type="submit">{editId ? 'Cập nhật' : 'Lưu'}</button>
                <button className="tableCrud__popupBtn btnDelete" type="button" onClick={closePopup}>Hủy</button>
                {/* Chỉ hiển thị nút Xóa khi đang sửa */}
                {editId && (
                  <button className="tableCrud__popupBtn btnDelete" type="button" onClick={() => { if(window.confirm('Bạn có chắc muốn xóa bàn này?')) { handleDelete(editId); setShowPopup(false); } }}>Xóa</button>
                )}
              </div>
            </form>
            <div className="tableCrud__msg">{message}</div>
          </div>
        </div>
      )}
      <div className="tableCrud__msg">{message}</div>
    </div>
  );
}

export default CrudTables;
