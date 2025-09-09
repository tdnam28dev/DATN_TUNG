import React, { useState, useEffect } from 'react';
import { getTables, createTable, updateTable, deleteTable } from '../../../api/table';
import { getRestaurants } from '../../../api/restaurant';
import './CrudTables.css';
import Icon from '../../../components/Icon';
import { QRCodeCanvas } from 'qrcode.react';

const seatOptions = [
  { value: 2, label: 'Bàn 2' },
  { value: 4, label: 'Bàn 4' },
  { value: 6, label: 'Bàn 6' },
];
const typeOptions = [
  { value: 'round', label: 'Tròn' },
  { value: 'square', label: 'Vuông' },
  { value: 'family', label: 'Gia đình' },
];

function CrudTables({ token }) {
  const [tables, setTables] = useState([]);
  const [form, setForm] = useState({ number: '', seats: '', type: '', status: 'available', restaurant: '' });
  const [message, setMessage] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false); // popup thêm bàn
  const [showDetailPopup, setShowDetailPopup] = useState(false); // popup chi tiết/sửa bàn
  const [detailTable, setDetailTable] = useState(null); // bàn đang xem
  const [isEditTable, setIsEditTable] = useState(false); // trạng thái sửa bàn
  const [editTable, setEditTable] = useState(null); // dữ liệu bàn đang sửa
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
    setShowAddPopup(false);
    setForm({ number: '', seats: '', type: '', status: 'available', restaurant: '' });
    fetchData();
  };

  // Mở popup chi tiết/sửa bàn
  // Mở popup chi tiết bàn
  const handleDetail = (t) => {
    setDetailTable(t);
    setEditTable(null);
    setIsEditTable(false);
    setShowDetailPopup(true);
  };

  // Lưu bàn khi sửa
  const handleUpdate = async () => {
    if (!editTable) return;
    if (!editTable.number || !editTable.seats || !editTable.type || !editTable.restaurant) {
      setMessage('Vui lòng nhập đầy đủ thông tin!');
      return;
    }
    const res = await updateTable(editTable._id, editTable, token);
    setMessage(res._id ? 'Cập nhật thành công!' : res.error || 'Lỗi');
    setIsEditTable(false);
    setEditTable(null);
    setDetailTable(res._id ? res : detailTable); // cập nhật lại chi tiết nếu thành công
    fetchData();
    if (res._id) setShowDetailPopup(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa bàn này?')) return;
    const res = await deleteTable(id, token);
    setMessage(res.message || res.error || 'Lỗi');
    setShowDetailPopup(false);
    setDetailTable(null);
    setEditTable(null);
    setIsEditTable(false);
    fetchData();
  };

  // Mở popup thêm bàn
  const openAddPopup = () => {
    setForm({ number: '', seats: '', type: '', status: 'available', restaurant: '' });
    setShowAddPopup(true);
  };
  const closeAddPopup = () => {
    setShowAddPopup(false);
    setForm({ number: '', seats: '', type: '', status: 'available', restaurant: '' });
  };
  // Đóng popup chi tiết/sửa
  const closeDetailPopup = () => {
    setShowDetailPopup(false);
    setDetailTable(null);
    setEditTable(null);
    setIsEditTable(false);
    setMessage('');
  };

  return (
    <div className="tableCrud">
      <div className="tableCrud__header">
        <h3 className="tableCrud__title">Danh sách bàn</h3>
        <button className="btnSubmit tableCrud__add" onClick={openAddPopup}>
          <span className="tableCrud__addIcon">＋</span> Thêm bàn
        </button>
      </div>
      {/* Bộ lọc */}
      <div className="tableCrud__filters">
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
                    // Hàm xác định tên icon dựa vào kiểu bàn và số ghế
                    const getTableIconName = (type, seats) => {
                      if (type === 'round') {
                        if (seats === 2) return 'table_round_2';
                        if (seats === 4) return 'table_round_4';
                        if (seats === 6) return 'table_round_6';
                      }
                      if (type === 'square') {
                        if (seats === 2) return 'table_square_2';
                        if (seats === 4) return 'table_square_4';
                        if (seats === 6) return 'table_square_6';
                      }
                      if (type === 'family') {
                        if (seats === 2) return 'table_rect_2';
                        if (seats === 4) return 'table_rect_4';
                        if (seats === 6) return 'table_rect_6';
                      }
                      return null;
                    };
                    const found = typeOptions.find(opt => opt.value === t.type);
                    const iconName = getTableIconName(t.type, Number(t.seats));
                    return found && iconName ? (
                      <span className="tableCrud__iconLabel">
                        <Icon name={iconName} width={24} height={24} />
                        {found.label}
                      </span>
                    ) : '-';
                  })()}</td>
                  <td className="tableCrud__td">{t.status === 'available' ? 'Trống' : t.status === 'reserved' ? 'Đã đặt' : 'Đang sử dụng'}</td>
                  <td className="tableCrud__td">{(() => {
                    const found = restaurants.find(r => r._id === (typeof t.restaurant === 'object' ? t.restaurant._id : t.restaurant));
                    return found ? found.name : '-';
                  })()}</td>
                  <td className="tableCrud__td tableCrud__td--action">
                    <button className="btnDetail tableCrud__detail" onClick={() => handleDetail(t)} title="Chi tiết">
                      <span className="tableCrud__detailIcon"></span> Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {/* Popup thêm bàn */}
      {showAddPopup && (
        <div className="popup-restaurant-overlay">
          <div className="popup-restaurant-box tableCrud__popupBox">
            <div className="popup-restaurant-title tableCrud__popupTitle">Thêm mới bàn</div>
            {/* Hiển thị icon bàn khi đã chọn đủ kiểu và số ghế */}
            {form.type && form.seats ? (
              <div className="tableCrud__iconPreview">
                {(() => {
                  const getTableIconName = (type, seats) => {
                    if (type === 'round') {
                      if (seats === 2) return 'table_round_2';
                      if (seats === 4) return 'table_round_4';
                      if (seats === 6) return 'table_round_6';
                    }
                    if (type === 'square') {
                      if (seats === 2) return 'table_square_2';
                      if (seats === 4) return 'table_square_4';
                      if (seats === 6) return 'table_square_6';
                    }
                    if (type === 'family') {
                      if (seats === 2) return 'table_rect_2';
                      if (seats === 4) return 'table_rect_4';
                      if (seats === 6) return 'table_rect_6';
                    }
                    return null;
                  };
                  const iconName = getTableIconName(form.type, Number(form.seats));
                  return iconName ? <Icon name={iconName} width={60} height={60} /> : null;
                })()}
              </div>
            ) : null}
            <form className="tableCrud__popupForm" onSubmit={handleCreate}>
              <input
                className="inputCrud popup-restaurant-input tableCrud__input"
                type="number"
                placeholder="Số bàn"
                value={form.number}
                onChange={e => setForm({ ...form, number: e.target.value })}
                required
              />
              {/* Chọn số ghế không có icon */}
              <div className="tableCrud__seatSelect">
                {seatOptions.map(opt => (
                  <div
                    key={opt.value}
                    className={`tableCrud__seatOption${form.seats === opt.value ? ' tableCrud__seatOption--active' : ''}`}
                    onClick={() => setForm({ ...form, seats: opt.value })}
                  >
                    <span>{opt.label}</span>
                  </div>
                ))}
              </div>
              {/* Chọn loại bàn không có icon */}
              <div className="tableCrud__typeSelect">
                {typeOptions.map(opt => (
                  <div
                    key={opt.value}
                    className={`tableCrud__typeOption${form.type === opt.value ? ' tableCrud__typeOption--active' : ''}`}
                    onClick={() => setForm({ ...form, type: opt.value })}
                  >
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
                <button className="tableCrud__popupBtn btnSubmit" type="submit">Lưu</button>
                <button className="tableCrud__popupBtn btnDelete" type="button" onClick={closeAddPopup}>Hủy</button>
              </div>
            </form>
            <div className="tableCrud__msg">{message}</div>
          </div>
        </div>
      )}
      {/* Popup chi tiết/sửa bàn */}
      {showDetailPopup && detailTable && (
        <div className="popup-restaurant-overlay">
          <div className="popup-restaurant-box tableCrud__popupBox">
            <div className="popup-restaurant-title tableCrud__popupTitle">Chi tiết bàn</div>
            {/* Hiển thị icon bàn */}
            {detailTable.type && detailTable.seats ? (
              <div className="tableCrud__iconPreview">
                {(() => {
                  const getTableIconName = (type, seats) => {
                    if (type === 'round') {
                      if (seats === 2) return 'table_round_2';
                      if (seats === 4) return 'table_round_4';
                      if (seats === 6) return 'table_round_6';
                    }
                    if (type === 'square') {
                      if (seats === 2) return 'table_square_2';
                      if (seats === 4) return 'table_square_4';
                      if (seats === 6) return 'table_square_6';
                    }
                    if (type === 'family') {
                      if (seats === 2) return 'table_rect_2';
                      if (seats === 4) return 'table_rect_4';
                      if (seats === 6) return 'table_rect_6';
                    }
                    return null;
                  };
                  const iconName = getTableIconName(detailTable.type, Number(detailTable.seats));
                  return iconName ? <Icon name={iconName} width={60} height={60} /> : null;
                })()}
              </div>
            ) : null}
            {/* Chế độ xem hoặc sửa */}
            {!isEditTable ? (
              <>
                <div className="tableCrud__popupInfo">
                  <div className="tableCrud__popupInfoRow"><span>Số bàn:</span> <b>{detailTable.number}</b></div>
                  <div className="tableCrud__popupInfoRow"><span>Số ghế:</span> <b>{detailTable.seats}</b></div>
                  <div className="tableCrud__popupInfoRow"><span>Loại bàn:</span> <b>{typeOptions.find(opt => opt.value === detailTable.type)?.label || detailTable.type}</b></div>
                  <div className="tableCrud__popupInfoRow"><span>Trạng thái:</span> <b>{detailTable.status === 'available' ? 'Trống' : detailTable.status === 'reserved' ? 'Đã đặt' : 'Đang sử dụng'}</b></div>
                  <div className="tableCrud__popupInfoRow"><span>Nhà hàng:</span> <b>{restaurants.find(r => r._id === (typeof detailTable.restaurant === 'object' ? detailTable.restaurant._id : detailTable.restaurant))?.name || '-'}</b></div>
                </div>
                {/* QR code cho bàn */}
                <div className="tableCrud__qrWrap">
                  <QRCodeCanvas
                    id="tableQrCode"
                    value={`${process.env.REACT_APP_URL || 'http://192.168.1.4:3000'}/order/${typeof detailTable.restaurant === 'object' ? detailTable.restaurant._id : detailTable.restaurant}/${detailTable._id}`}
                    size={240}
                    level="H"
                    includeMargin={true}
                  />
                  <button
                    className="tableCrud__popupBtn btnSubmit"
                    type="button"
                    onClick={() => {
                      const canvas = document.getElementById('tableQrCode');
                      if (!canvas) return;
                      const url = canvas.toDataURL('image/png');
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `table_${detailTable.number || detailTable._id}_qr.png`;
                      a.click();
                    }}
                  >Lưu QR</button>
                </div>
                <div className="tableCrud__popupActions">
                  <button className="tableCrud__popupBtn btnSubmit" type="button" onClick={() => { setIsEditTable(true); setEditTable({ ...detailTable }); }}>Sửa</button>
                  <button className="tableCrud__popupBtn btnDelete" type="button" onClick={() => handleDelete(detailTable._id)}>Xóa</button>
                  <button className="tableCrud__popupBtn btnDelete" type="button" onClick={closeDetailPopup}>Đóng</button>
                </div>
              </>
            ) : (
              <form className="tableCrud__popupForm" onSubmit={e => { e.preventDefault(); handleUpdate(); }}>
                <input
                  className="inputCrud popup-restaurant-input tableCrud__input"
                  type="number"
                  placeholder="Số bàn"
                  value={editTable?.number || ''}
                  onChange={e => setEditTable({ ...editTable, number: e.target.value })}
                  required
                />
                <div className="tableCrud__seatSelect">
                  {seatOptions.map(opt => (
                    <div
                      key={opt.value}
                      className={`tableCrud__seatOption${editTable?.seats === opt.value ? ' tableCrud__seatOption--active' : ''}`}
                      onClick={() => setEditTable({ ...editTable, seats: opt.value })}
                    >
                      <span>{opt.label}</span>
                    </div>
                  ))}
                </div>
                <div className="tableCrud__typeSelect">
                  {typeOptions.map(opt => (
                    <div
                      key={opt.value}
                      className={`tableCrud__typeOption${editTable?.type === opt.value ? ' tableCrud__typeOption--active' : ''}`}
                      onClick={() => setEditTable({ ...editTable, type: opt.value })}
                    >
                      <span>{opt.label}</span>
                    </div>
                  ))}
                </div>
                <select
                  className="selectCrud popup-restaurant-input tableCrud__input"
                  value={editTable?.status || ''}
                  onChange={e => setEditTable({ ...editTable, status: e.target.value })}
                  required
                >
                  <option value="available">Trống</option>
                  <option value="reserved">Đã đặt</option>
                  <option value="occupied">Đang sử dụng</option>
                </select>
                <select
                  className="selectCrud popup-restaurant-input tableCrud__input"
                  value={editTable?.restaurant || ''}
                  onChange={e => setEditTable({ ...editTable, restaurant: e.target.value })}
                  required
                >
                  <option value="">Chọn nhà hàng</option>
                  {restaurants.map(r => (
                    <option key={r._id} value={r._id}>{r.name}</option>
                  ))}
                </select>
                <div className="tableCrud__popupActions">
                  <button className="tableCrud__popupBtn btnSubmit" type="submit">Lưu</button>
                  <button className="tableCrud__popupBtn btnDelete" type="button" onClick={() => { setIsEditTable(false); setEditTable(null); }}>Hủy</button>
                </div>
              </form>
            )}
            <div className="tableCrud__msg">{message}</div>
          </div>
        </div>
      )}
      <div className="tableCrud__msg">{message}</div>
    </div>
  );
}

export default CrudTables;
