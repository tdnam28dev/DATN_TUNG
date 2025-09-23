import React, { useEffect, useState } from 'react';
import './Customer.css';
import Icon from '../../../../components/Icon';
import { getCustomers, updateCustomer, deleteCustomer } from '../../../../api/customer';

function Customer({ token }) {
  // State cho popup chi tiết khách hàng
  const [showDetail, setShowDetail] = useState(false);
  const [customerDetail, setCustomerDetail] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editDetail, setEditDetail] = useState(null);
  // State cho danh sách khách hàng
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  // State cho tìm kiếm theo số điện thoại
  const [searchPhone, setSearchPhone] = useState('');

  // Lấy danh sách khách hàng
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await getCustomers(token);
      setCustomers(Array.isArray(res) ? res : []);
    } catch {
      setCustomers([]);
    }
    setLoading(false);
  };
  useEffect(() => { fetchCustomers(); }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Hàm lưu khách hàng khi chỉnh sửa
  const handleUpdateCustomer = async () => {
    if (!editDetail) return;
    if (!editDetail.phone || editDetail.phone.length < 10) {
      alert('Số điện thoại không hợp lệ!');
      return;
    }
    setLoading(true);
    let res = await updateCustomer(editDetail._id, editDetail, token);
    setLoading(false);
    setIsEdit(false);
    setEditDetail(null);
    setShowDetail(false);
    fetchCustomers();
    alert(res._id ? 'Đã lưu khách hàng!' : res.error || 'Lỗi');
  };

  // Hàm xóa khách hàng
  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Xác nhận xóa khách hàng?')) {
      setLoading(true);
      await deleteCustomer(id, token);
      setLoading(false);
      fetchCustomers();
      setShowDetail(false);
    }
  };

  // Lọc khách hàng theo số điện thoại
  const filteredCustomers = customers.filter(cus => {
    if (!searchPhone) return true;
    return cus.phone && cus.phone.includes(searchPhone.trim());
  });

  return (
    <div className="customerManager">
      <h2 className="customerManager__title">Quản lý khách hàng</h2>
      {/* Thanh tìm kiếm số điện thoại */}
      <div className="customerManager__filter">
        <div className="customerManager__filterSearch">
          <span className="customerManager__filterSearchIcon">
            <Icon name="search" width={20} height={20} />
          </span>
          <input
            className="customerManager__filterInput"
            type="text"
            placeholder="Tìm theo số điện thoại..."
            value={searchPhone}
            onChange={e => setSearchPhone(e.target.value)}
          />
        </div>
      </div>
      {/* Danh sách khách hàng */}
      <div className="customerManager__list">
        {loading ? <div className="customerManager__loading">Đang tải...</div> : filteredCustomers.length === 0 ? <div className="customerManager__empty">Không có khách hàng phù hợp.</div> : (
          <table className="customerManager__table">
            <thead>
              <tr>
                <th className="customerManager__th">Tên</th>
                <th className="customerManager__th">Số điện thoại</th>
                <th className="customerManager__th">Giới tính</th>
                <th className="customerManager__th">Địa chỉ</th>
                <th className="customerManager__th">Điểm</th>
                <th className="customerManager__th">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map(cus => (
                <tr key={cus._id} className="customerManager__tr">
                  <td className="customerManager__td">{cus.name}</td>
                  <td className="customerManager__td">{cus.phone}</td>
                  <td className="customerManager__td">{cus.gender === 'male' ? 'Nam' : cus.gender === 'female' ? 'Nữ' : 'Khác'}</td>
                  <td className="customerManager__td">{cus.address}</td>
                  <td className="customerManager__td">{cus.point || 0}</td>
                  <td className="customerManager__td">
                    <button className="customerManager__cardBtn" onClick={() => { setCustomerDetail(cus); setShowDetail(true); }}>Chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Popup chi tiết khách hàng */}
      {showDetail && customerDetail && (
        <div className="customerManager__popupOverlay">
          <div className="customerManager__popup customerManager__popup--detail">
            <h3 className="customerManager__popupTitle__detail">Chi tiết khách hàng</h3>
            <div className="customerManager__popupInfo">
              <div className="customerManager__popupInfoRow"><span>Tên khách hàng:</span> <b>{isEdit ? (
                <input type="text" value={editDetail?.name || ''} onChange={e => setEditDetail({ ...editDetail, name: e.target.value })} />
              ) : customerDetail.name}</b></div>
              <div className="customerManager__popupInfoRow"><span>Số điện thoại:</span> <b>{isEdit ? (
                <input type="text" value={editDetail?.phone || ''} onChange={e => setEditDetail({ ...editDetail, phone: e.target.value })} />
              ) : customerDetail.phone}</b></div>
              <div className="customerManager__popupInfoRow"><span>Giới tính:</span> <b>{isEdit ? (
                <select value={editDetail?.gender || ''} onChange={e => setEditDetail({ ...editDetail, gender: e.target.value })}>
                  <option value="">Chọn</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              ) : customerDetail.gender === 'male' ? 'Nam' : customerDetail.gender === 'female' ? 'Nữ' : 'Khác'}</b></div>
              <div className="customerManager__popupInfoRow"><span>Địa chỉ:</span> <b>{isEdit ? (
                <input type="text" value={editDetail?.address || ''} onChange={e => setEditDetail({ ...editDetail, address: e.target.value })} />
              ) : customerDetail.address}</b></div>
              <div className="customerManager__popupInfoRow"><span>Điểm tích lũy:</span> <b style={{ color: '#2563eb' }}>{customerDetail.point || 0}</b></div>
            </div>
            <div className='customerManager__popupFooter'>
              {!isEdit && (
                <button className="customerManager__popupBtn" onClick={() => { setIsEdit(true); setEditDetail({ ...customerDetail }); }}>Sửa</button>
              )}
              {isEdit && (
                <button className="customerManager__popupBtn" onClick={handleUpdateCustomer}>Lưu</button>
              )}
              {isEdit && (
                <button className="customerManager__popupBtn customerManager__cardBtn--danger" onClick={() => { setIsEdit(false); setEditDetail(null); }}>Hủy</button>
              )}
              {!isEdit && (
                <button className="customerManager__popupBtn customerManager__cardBtn--danger" onClick={() => handleDeleteCustomer(customerDetail._id)}>Xóa</button>
              )}
              {!isEdit && (
                <button className="customerManager__popupBtn__detail__close" onClick={() => setShowDetail(false)}>Đóng</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customer;
