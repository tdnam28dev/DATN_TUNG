import React, { useState, useEffect } from 'react';
import RestaurantFormPopup from '../../../components/RestaurantFormPopup';
import { getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant } from '../../../api/restaurant';
import './CrudRestaurants.css';

function CrudRestaurants({ token }) {
  // Khai báo các state
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState({
    name: '', address: '', ward: '', district: '', description: '', phone: '',
    status: 'inactive', openTime: '', closeTime: '', capacity: '', area: '', floors: ''
  });
  const [editId, setEditId] = useState('');
  const [message, setMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false); // Hiện popup thêm/sửa

  // Dữ liệu phường cho từng quận tại Hà Nội


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
    setForm({
      name: '', address: '', ward: '', district: '', description: '', phone: '',
      status: 'inactive', openTime: '', closeTime: '', capacity: '', area: '', floors: ''
    });
    setShowPopup(false); // Đóng popup sau khi thêm
  };

  // Chọn nhà hàng để sửa
  const handleEdit = (r) => {
    let address = r.address;
    let ward = '';
    let district = '';
    if (r.address && r.address.includes(', Hà Nội')) {
      const parts = r.address.split(',').map(s => s.trim());
      if (parts.length >= 4) {
        // Luôn lấy phần tử áp chót là quận/huyện, trước đó là phường/xã
        address = parts.slice(0, parts.length - 3).join(', ');
        ward = parts[parts.length - 3];
        district = parts[parts.length - 2];
      } else if (parts.length === 3) {
        address = parts[0];
        ward = '';
        district = parts[1];
      }
    }
    setEditId(r._id);
    setForm({
      name: r.name,
      address,
      ward,
      district,
      description: r.description || '',
      phone: r.phone || '',
      status: r.status || 'inactive',
      openTime: r.openTime || '',
      closeTime: r.closeTime || '',
      capacity: r.capacity || '',
      area: r.area || '',
      floors: r.floors || ''
    });
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
    setForm({
      name: '', address: '', ward: '', district: '', description: '', phone: '',
      status: 'inactive', openTime: '', closeTime: '', capacity: '', area: '', floors: ''
    });
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
    <>
      <div className="containerCrud">
        {/* Nút Thêm mới */}
        <div style={{ textAlign: 'right', marginBottom: 12 }}>
          <button className="btnSubmit" onClick={() => { setEditId(''); setForm({ name: '', address: '', ward: '', district: '', description: '', phone: '' }); setShowPopup(true); }}>Thêm mới</button>
        </div>
        {/* Danh sách nhà hàng */}
        <ul className="listCrud">
          {/* Hiển thị mỗi nhà hàng là một thẻ bo góc, dạng lưới tối đa 4 thẻ mỗi hàng */}
          {Array.isArray(restaurants) && restaurants.map(r => (
            <li className="cardRestaurant" key={r._id}>
              {/* Tiêu đề tên nhà hàng */}
              <div className="cardHeader">
                <span className="cardTitle">{r.name}</span>
              </div>
              {/* Địa chỉ */}
              <div className="cardAddress">{r.address}</div>
              {/* Mô tả ngắn */}
              <div className="cardDesc">{r.description || 'Quán nhậu sáng nhất quận ' + (r.district || '')}</div>
              {/* Trạng thái và giờ hoạt động */}
              <div className="cardStatusRow">
                <span className={"cardStatus " + (r.status === 'active' ? 'statusActive' : 'statusInactive')}>
                  {r.status === 'active' ? 'MỞ CỬA' : 'ĐANG NGHỈ'}
                </span>
                <span className="cardTime">
                  HOẠT ĐỘNG TỪ {r.openTime || '09:00'} - {r.closeTime || '24:00'}
                </span>
              </div>
              {/* Thông tin chi tiết */}
              <div className="cardInfoRow">
                <div>
                  <div className="cardInfoLabel">Sức chứa</div>
                  <div className="cardInfoValue">{r.capacity || '500'} KHÁCH</div>
                </div>
                <div>
                  <div className="cardInfoLabel">Diện tích</div>
                  <div className="cardInfoValue">{r.area || '1100'} M2</div>
                </div>
                <div>
                  <div className="cardInfoLabel">Số tầng</div>
                  <div className="cardInfoValue">{r.floors || '2'} TẦNG</div>
                </div>
              </div>
              {/* Nhóm nút */}
              <div className="btnGroup">
                <button className="btnEdit" onClick={() => handleEdit(r)}>Sửa</button>
                <button className="btnDelete" onClick={() => handleDelete(r._id)}>Xóa</button>
              </div>
            </li>
          ))}
        </ul>
        {/* Thông báo kết quả */}
        {/* {!showPopup && <div className="messageCrud">{message}</div>} */}
      </div>
      {/* Popup nhập thông tin - Đặt ngoài containerCrud để overlay phủ toàn trang */}
      {showPopup && (
        <RestaurantFormPopup
          editId={editId}
          form={form}
          setForm={setForm}
          setShowPopup={setShowPopup}
          setEditId={setEditId}
          handleCreate={handleCreate}
          handleUpdate={handleUpdate}
          message={message}
        />
      )}
    </>
  );
}

export default CrudRestaurants;
