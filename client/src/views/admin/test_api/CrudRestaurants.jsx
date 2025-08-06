

// Import các thư viện cần thiết
import React, { useState, useEffect } from 'react';
import { getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant } from '../../../api/restaurant';
import styles from './CrudRestaurants.module.css';


function CrudRestaurants({ token }) {
  // Khai báo các state
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState({ name: '', address: '', ward: '', district: '', description: '', phone: '' });
  const [editId, setEditId] = useState('');
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false); // Hiện popup thêm/sửa

  // Dữ liệu phường cho từng quận tại Hà Nội
  const wardsByDistrict = {
    'Ba Đình': ['Phúc Xá', 'Trúc Bạch', 'Vĩnh Phúc', 'Cống Vị', 'Liễu Giai', 'Ngọc Hà', 'Nguyễn Trung Trực', 'Quán Thánh', 'Quảng An', 'Thành Công'],
    'Hoàn Kiếm': ['Chương Dương', 'Cửa Đông', 'Cửa Nam', 'Đồng Xuân', 'Hàng Bạc', 'Hàng Bồ', 'Hàng Buồm', 'Hàng Đào', 'Hàng Gai', 'Hàng Mã', 'Hàng Trống', 'Lý Thái Tổ', 'Phan Chu Trinh', 'Tràng Tiền'],
    'Đống Đa': ['Cát Linh', 'Hàng Bột', 'Khâm Thiên', 'Kim Liên', 'Láng Hạ', 'Nam Đồng', 'Ngã Tư Sở', 'Phương Liên', 'Phương Mai', 'Quang Trung', 'Quốc Tử Giám', 'Thịnh Quang', 'Trung Liệt', 'Trung Phụng', 'Trung Tự', 'Văn Chương', 'Văn Miếu'],
    'Hai Bà Trưng': ['Bạch Mai', 'Bách Khoa', 'Cầu Dền', 'Đồng Tâm', 'Lê Đại Hành', 'Minh Khai', 'Ngô Thì Nhậm', 'Phố Huế', 'Quỳnh Lôi', 'Quỳnh Mai', 'Thanh Lương', 'Thanh Nhàn', 'Trương Định', 'Vĩnh Tuy'],
    'Cầu Giấy': ['Dịch Vọng', 'Dịch Vọng Hậu', 'Mai Dịch', 'Nghĩa Đô', 'Nghĩa Tân', 'Quan Hoa', 'Trung Hoà', 'Yên Hoà'],
    'Thanh Xuân': ['Hạ Đình', 'Khương Đình', 'Khương Mai', 'Khương Trung', 'Kim Giang', 'Nhân Chính', 'Phương Liệt', 'Thanh Xuân Bắc', 'Thanh Xuân Nam', 'Thanh Xuân Trung', 'Thượng Đình'],
    'Hoàng Mai': ['Đại Kim', 'Định Công', 'Giáp Bát', 'Hoàng Liệt', 'Hoàng Văn Thụ', 'Lĩnh Nam', 'Mai Động', 'Tân Mai', 'Thanh Trì', 'Thịnh Liệt', 'Trần Phú', 'Vĩnh Hưng', 'Yên Sở'],
    'Long Biên': ['Bồ Đề', 'Cự Khối', 'Đức Giang', 'Gia Thụy', 'Giang Biên', 'Long Biên', 'Ngọc Lâm', 'Phúc Đồng', 'Phúc Lợi', 'Sài Đồng', 'Thạch Bàn', 'Thượng Thanh', 'Việt Hưng'],
    'Tây Hồ': ['Bưởi', 'Nhật Tân', 'Phú Thượng', 'Quảng An', 'Thụy Khuê', 'Tứ Liên', 'Xuân La', 'Yên Phụ'],
    'Hà Đông': ['Biên Giang', 'Đồng Mai', 'Dương Nội', 'Hà Cầu', 'Kiến Hưng', 'La Khê', 'Mộ Lao', 'Nguyễn Trãi', 'Phú Lãm', 'Phú La', 'Phú Lương', 'Phúc La', 'Quang Trung', 'Văn Quán', 'Vạn Phúc', 'Yên Nghĩa'],
    'Bắc Từ Liêm': ['Cổ Nhuế 1', 'Cổ Nhuế 2', 'Đông Ngạc', 'Đức Thắng', 'Liên Mạc', 'Minh Khai', 'Phú Diễn', 'Phúc Diễn', 'Tây Tựu', 'Thụy Phương', 'Trung Tựu', 'Xuân Đỉnh', 'Xuân Tảo'],
    'Nam Từ Liêm': ['Cầu Diễn', 'Đại Mỗ', 'Mễ Trì', 'Mỹ Đình 1', 'Mỹ Đình 2', 'Phú Đô', 'Phương Canh', 'Tây Mỗ', 'Trung Văn', 'Xuân Phương'],
    'Sóc Sơn': ['Bắc Phú', 'Bắc Sơn', 'Đông Xuân', 'Hiền Ninh', 'Hồng Kỳ', 'Kim Lũ', 'Mai Đình', 'Minh Phú', 'Minh Trí', 'Nam Sơn', 'Phù Linh', 'Phù Lỗ', 'Phú Cường', 'Phú Minh', 'Quang Tiến', 'Tân Dân', 'Tân Hưng', 'Tân Minh', 'Tân Xuân', 'Thanh Xuân', 'Tiên Dược', 'Trung Giã', 'Việt Long', 'Xuân Giang', 'Xuân Thu'],
    'Đông Anh': ['Bắc Hồng', 'Cổ Loa', 'Đại Mạch', 'Đông Hội', 'Dục Tú', 'Hải Bối', 'Kim Chung', 'Kim Nỗ', 'Liên Hà', 'Mai Lâm', 'Nguyên Khê', 'Tàm Xá', 'Thụy Lâm', 'Tiên Dương', 'Uy Nỗ', 'Vân Hà', 'Vân Nội', 'Vĩnh Ngọc', 'Võng La', 'Xuân Canh', 'Xuân Nộn'],
    'Gia Lâm': ['Bát Tràng', 'Cổ Bi', 'Đa Tốn', 'Đặng Xá', 'Dương Hà', 'Dương Quang', 'Dương Xá', 'Kiêu Kỵ', 'Kim Sơn', 'Lệ Chi', 'Ninh Hiệp', 'Phú Thị', 'Trâu Quỳ', 'Yên Thường', 'Yên Viên'],
    'Thanh Trì': ['Cầu Bươu', 'Đại Áng', 'Đông Mỹ', 'Duyên Hà', 'Hữu Hoà', 'Liên Ninh', 'Ngọc Hồi', 'Tả Thanh Oai', 'Tam Hiệp', 'Tân Triều', 'Thanh Liệt', 'Thanh Trì', 'Thị trấn Văn Điển', 'Vạn Phúc', 'Vĩnh Quỳnh', 'Yên Mỹ'],
    'Mê Linh': ['Chu Phan', 'Đại Thịnh', 'Hoàng Kim', 'Kim Hoa', 'Liên Mạc', 'Mê Linh', 'Tam Đồng', 'Thạch Đà', 'Thanh Lâm', 'Tiền Phong', 'Tráng Việt', 'Tự Lập', 'Văn Khê', 'Vạn Yên'],
  };

  // Lấy danh sách nhà hàng tự động khi load
  const fetchData = async () => {
    const res = await getRestaurants(token);
    setRestaurants(res);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, []);

  // Tạo mới nhà hàng
  const handleCreate = async (e) => {
    e.preventDefault();
    let fullAddress = form.address;
    if (form.ward && form.district) {
      fullAddress = `${form.address}, ${form.ward}, ${form.district}, Hà Nội`;
    } else if (form.district) {
      fullAddress = `${form.address}, ${form.district}, Hà Nội`;
    }
    const data = { ...form, address: fullAddress };
    const res = await createRestaurant(data, token);
    setMessage(res._id ? 'Thêm thành công!' : res.error || 'Lỗi');
    fetchData();
    setForm({ name: '', address: '', ward: '', district: '', description: '', phone: '' });
    setShowPopup(false); // Đóng popup sau khi thêm
  };

  // Chọn nhà hàng để sửa
  const handleEdit = (r) => {
    let address = r.address;
    let ward = '';
    let district = '';
    if (r.address && r.address.includes(', Hà Nội')) {
      const parts = r.address.split(',');
      if (parts.length >= 4) {
        address = parts[0].trim();
        ward = parts[1].trim();
        district = parts[2].trim();
      } else if (parts.length >= 3) {
        address = parts[0].trim();
        ward = '';
        district = parts[1].trim();
      }
    }
    setEditId(r._id);
    setForm({ name: r.name, address, ward, district, description: r.description || '', phone: r.phone });
    setShowPopup(true); // Mở popup khi sửa
  };

  // Cập nhật nhà hàng
  const handleUpdate = async (e) => {
    e.preventDefault();
    let fullAddress = form.address;
    if (form.ward && form.district) {
      fullAddress = `${form.address}, ${form.ward}, ${form.district}, Hà Nội`;
    } else if (form.district) {
      fullAddress = `${form.address}, ${form.district}, Hà Nội`;
    }
    const data = { ...form, address: fullAddress };
    const res = await updateRestaurant(editId, data, token);
    setMessage(res._id ? 'Cập nhật thành công!' : res.error || 'Lỗi');
    setEditId('');
    setForm({ name: '', address: '', ward: '', district: '', description: '', phone: '' });
    fetchData();
    setShowPopup(false); // Đóng popup sau khi lưu
  };

  // Xóa
  const handleDelete = async (id) => {
    const res = await deleteRestaurant(id, token);
    setMessage(res.message || res.error || 'Lỗi');
    fetchData();
  };

  return (
    <div className={styles.containerCrud}>
      {/* Danh sách nhà hàng */}
      <ul className={styles.listCrud}>
        {Array.isArray(restaurants) && restaurants.map(r => (
          <li className={styles.itemCrud} key={r._id}>
            <div className={styles.itemInfo}>
              <b>{r.name}</b> <span style={{ color: '#888' }}>|</span> {r.address} <span style={{ color: '#888' }}>|</span> {r.description} <span style={{ color: '#888' }}>|</span> {r.phone}
            </div>
            <div className={styles.btnGroup}>
              <button className={styles.btnEdit} onClick={() => handleEdit(r)}>Sửa</button>
              <button className={styles.btnDelete} onClick={() => handleDelete(r._id)}>Xóa</button>
            </div>
          </li>
        ))}
      </ul>
      {/* Nút Thêm mới */}
      <div style={{ textAlign: 'right', marginBottom: 12 }}>
        <button className={styles.btnSubmit} onClick={() => { setEditId(''); setForm({ name: '', address: '', ward: '', district: '', description: '', phone: '' }); setShowPopup(true); }}>Thêm mới</button>
      </div>
      {/* Popup nhập thông tin */}
      {showPopup && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.18)', zIndex: 1000,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
          overflowY: 'auto',
        }}>
          <div style={{
            background: '#fff', borderRadius: 10, padding: 32, minWidth: 400, boxShadow: '0 2px 16px rgba(0,0,0,0.15)', position: 'relative',
            marginTop: '8vh', marginBottom: '8vh',
            maxWidth: '90vw',
          }}>
            <div style={{ fontWeight: 600, fontSize: 20, marginBottom: 18 }}>{editId ? 'Cập nhật nhà hàng' : 'Thêm mới nhà hàng'}</div>
            <form className={styles.formCrud} style={{ flexDirection: 'column', gap: 16 }} onSubmit={editId ? handleUpdate : handleCreate}>
              {/* Tên cơ sở */}
              <input
                className={styles.inputCrud}
                type="text"
                placeholder="Tên cơ sở"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                style={{ width: '100%' }}
              />
              {/* Địa chỉ cụ thể */}
              <input
                className={styles.inputCrud}
                type="text"
                placeholder="Địa chỉ cụ thể (số nhà, đường, ... )"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                required
                style={{ width: '100%' }}
              />
              {/* Chọn quận */}
              <select
                className={styles.selectCrud}
                value={form.district || ''}
                onChange={e => {
                  setForm({ ...form, district: e.target.value, ward: '' });
                }}
                required
                style={{ width: '100%' }}
              >
                <option value="">Chọn quận</option>
                {Object.keys(wardsByDistrict).map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              {/* Chọn phường */}
              {form.district && (
                <select
                  className={styles.selectCrud}
                  value={form.ward || ''}
                  onChange={e => setForm({ ...form, ward: e.target.value })}
                  required
                  style={{ width: '100%' }}
                >
                  <option value="">Chọn phường/xã/thị trấn</option>
                  {wardsByDistrict[form.district].map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              )}
              {/* Mô tả */}
              <input
                className={styles.inputCrud}
                type="text"
                placeholder="Mô tả"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                style={{ width: '100%' }}
              />
              {/* Số điện thoại */}
              <input
                className={styles.inputCrud}
                type="text"
                placeholder="Số điện thoại"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                required
                style={{ width: '100%' }}
              />
              {/* Nút lưu/hủy */}
              <div style={{ display: 'flex', gap: 10, marginTop: 10, justifyContent: 'flex-end' }}>
                <button className={styles.btnSubmit} type="submit">{editId ? 'Lưu' : 'Lưu'}</button>
                <button type="button" className={styles.btnDelete} onClick={() => { setShowPopup(false); setEditId(''); }}>Hủy</button>
              </div>
            </form>
            <div className={styles.messageCrud}>{message}</div>
          </div>
        </div>
      )}
      {/* Thông báo kết quả */}
      {!showPopup && <div className={styles.messageCrud}>{message}</div>}
    </div>
  );
}

export default CrudRestaurants;
