import React, { useEffect, useState } from 'react';
import './Promotion.css';
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion
} from '../../../../api/promotion';

// Component quản lý khuyến mại
function Promotion({ token }) {
  // State danh sách khuyến mại
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  // Popup
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  // State form thêm/sửa
  const [form, setForm] = useState({
    code: '',
    type: 'amount',
    value: 0,
    minOrder: 0,
    maxDiscount: 0,
    startDate: '',
    endDate: '',
    active: true,
    description: ''
  });
  // State cho popup sửa
  const [isEdit, setIsEdit] = useState(false);
  // API lấy danh sách khuyến mại
  useEffect(() => {
    const fetchPromotions = async () => {
      setLoading(true);
      try {
        const data = await getPromotions(token);
        setPromotions(Array.isArray(data) ? data : []);
      } catch {
        setPromotions([]);
      }
      setLoading(false);
    };
    fetchPromotions();
  }, [token, showAddPopup, showDetailPopup]);

  // Xử lý mở popup thêm
  const handleOpenAdd = () => {
    setForm({ code: '', type: 'amount', value: 0, minOrder: 0, maxDiscount: 0, startDate: '', endDate: '', active: true, description: '' });
    setShowAddPopup(true);
    setIsEdit(false);
  };
  // Xử lý mở popup chi tiết/sửa
  const handleOpenDetail = (promotion) => {
    setSelectedPromotion(promotion);
    setForm({ ...promotion, startDate: promotion.startDate ? promotion.startDate.slice(0, 10) : '', endDate: promotion.endDate ? promotion.endDate.slice(0, 10) : '' });
    setShowDetailPopup(true);
    setIsEdit(false);
  };
  // Xử lý lưu khuyến mại mới
  const handleSavePromotion = async () => {
    setLoading(true);
    try {
      const data = await createPromotion(form, token);
      if (data._id) {
        setShowAddPopup(false);
      } else {
        alert(data.error || 'Lỗi tạo khuyến mại!');
      }
    } catch {
      alert('Lỗi server!');
    }
    setLoading(false);
  };
  // Xử lý cập nhật khuyến mại
  const handleUpdatePromotion = async () => {
    if (!selectedPromotion) return;
    setLoading(true);
    try {
      const data = await updatePromotion(selectedPromotion._id, form, token);
      if (data._id) {
        setShowDetailPopup(false);
      } else {
        alert(data.error || 'Lỗi cập nhật!');
      }
    } catch {
      alert('Lỗi server!');
    }
    setLoading(false);
  };
  // Xử lý xóa khuyến mại
  const handleDeletePromotion = async () => {
    if (!selectedPromotion) return;
    if (!window.confirm('Xác nhận xóa khuyến mại này?')) return;
    setLoading(true);
    try {
      await deletePromotion(selectedPromotion._id, token);
      setShowDetailPopup(false);
    } catch {
      alert('Lỗi server!');
    }
    setLoading(false);
  };

  return (
    <div className="promotionManager">
      <h2 className="promotionManager__title">Quản lý khuyến mại</h2>
      <div className="promotionManager__actions">
        <button className="promotionManager__addBtn" onClick={handleOpenAdd}>Thêm khuyến mại</button>
      </div>
      <div className="promotionManager__list">
        {loading ? <div className="promotionManager__loading">Đang tải...</div> : promotions.length === 0 ? <div className="promotionManager__empty">Không có khuyến mại nào.</div> : (
          <table className="promotionManager__table">
            <thead>
              <tr>
                <th className="promotionManager__th">Mã</th>
                <th className="promotionManager__th">Loại</th>
                <th className="promotionManager__th">Giá trị</th>
                <th className="promotionManager__th">Đơn tối thiểu</th>
                <th className="promotionManager__th">Giảm tối đa</th>
                <th className="promotionManager__th">Ngày bắt đầu</th>
                <th className="promotionManager__th">Ngày kết thúc</th>
                <th className="promotionManager__th">Trạng thái</th>
                <th className="promotionManager__th">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map(promo => (
                <tr key={promo._id} className="promotionManager__tr">
                  <td className="promotionManager__td">{promo.code}</td>
                  <td className="promotionManager__td">{promo.type === 'percent' ? 'Phần trăm' : promo.type === 'amount' ? 'Số tiền' : 'Điểm'}</td>
                  <td className="promotionManager__td">{promo.type === 'percent' ? `${promo.value}%` : promo.type === 'amount' ? `${promo.value.toLocaleString()} đ` : `${promo.value} điểm`}</td>
                  <td className="promotionManager__td">{promo.minOrder?.toLocaleString()} đ</td>
                  <td className="promotionManager__td">{promo.maxDiscount?.toLocaleString()} đ</td>
                  <td className="promotionManager__td">{promo.startDate ? new Date(promo.startDate).toLocaleDateString() : '-'}</td>
                  <td className="promotionManager__td">{promo.endDate ? new Date(promo.endDate).toLocaleDateString() : '-'}</td>
                  <td className={`promotionManager__td promotionManager__td--status promotionManager__td--status-${promo.active ? 'active' : 'inactive'}`}>{promo.active ? 'Đang hoạt động' : 'Ngừng'}</td>
                  <td className="promotionManager__td">
                    <button className="promotionManager__detailBtn" onClick={() => handleOpenDetail(promo)}>Chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Popup thêm khuyến mại */}
      {showAddPopup && (
        <div className="promotionManager__popupOverlay">
          <div className="promotionManager__popup">
            <h3 className="promotionManager__popupTitle">Thêm khuyến mại</h3>
            <div className="promotionManager__popupForm">
              <div className="promotionManager__popupRow">
                <label>Mã khuyến mại:</label>
                <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
              </div>
              <div className="promotionManager__popupRow">
                <label>Loại:</label>
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="amount">Số tiền</option>
                  <option value="percent">Phần trăm</option>
                </select>
              </div>
              <div className="promotionManager__popupRow">
                <label>Giá trị:</label>
                <input type="number" value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} min={0} />
              </div>
              <div className="promotionManager__popupRow">
                <label>Đơn tối thiểu:</label>
                <input type="number" value={form.minOrder} onChange={e => setForm({ ...form, minOrder: Number(e.target.value) })} min={0} />
              </div>
              <div className="promotionManager__popupRow">
                <label>Giảm tối đa:</label>
                <input type="number" value={form.maxDiscount} onChange={e => setForm({ ...form, maxDiscount: Number(e.target.value) })} min={0} />
              </div>
              <div className="promotionManager__popupRow">
                <label>Ngày bắt đầu:</label>
                <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
              </div>
              <div className="promotionManager__popupRow">
                <label>Ngày kết thúc:</label>
                <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
              </div>
              <div className="promotionManager__popupRow">
                <label>Trạng thái:</label>
                <select value={form.active} onChange={e => setForm({ ...form, active: e.target.value === 'true' })}>
                  <option value="true">Đang hoạt động</option>
                  <option value="false">Ngừng</option>
                </select>
              </div>
              <div className="promotionManager__popupRow">
                <label>Mô tả:</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
            </div>
            <div className="promotionManager__popupActions">
              <button className="promotionManager__popupBtn" onClick={handleSavePromotion} disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu'}</button>
              <button className="promotionManager__popupBtn promotionManager__popupBtn--cancel" onClick={() => setShowAddPopup(false)} disabled={loading}>Hủy</button>
            </div>
          </div>
        </div>
      )}
      {/* Popup chi tiết/sửa khuyến mại */}
      {showDetailPopup && selectedPromotion && (
        <div className="promotionManager__popupOverlay">
          <div className="promotionManager__popup promotionManager__popup--detail">
            <h3 className="promotionManager__popupTitle__detail">Chi tiết khuyến mại</h3>
            {/* Chế độ xem chi tiết */}
            {!isEdit && (
              <div className="promotionManager__popupInfo">
                <div className="promotionManager__popupInfoRow"><span>Mã khuyến mại:</span> <b>{form.code}</b></div>
                <div className="promotionManager__popupInfoRow"><span>Loại:</span> <b>{form.type === 'percent' ? 'Phần trăm' : form.type === 'amount' ? 'Số tiền' : 'Điểm'}</b></div>
                <div className="promotionManager__popupInfoRow"><span>Giá trị:</span> <b>{form.type === 'percent' ? `${form.value}%` : form.type === 'amount' ? `${form.value.toLocaleString()} đ` : `${form.value} điểm`}</b></div>
                <div className="promotionManager__popupInfoRow"><span>Đơn tối thiểu:</span> <b>{form.minOrder?.toLocaleString()} đ</b></div>
                <div className="promotionManager__popupInfoRow"><span>Giảm tối đa:</span> <b>{form.maxDiscount?.toLocaleString()} đ</b></div>
                <div className="promotionManager__popupInfoRow"><span>Ngày bắt đầu:</span> <b>{form.startDate}</b></div>
                <div className="promotionManager__popupInfoRow"><span>Ngày kết thúc:</span> <b>{form.endDate}</b></div>
                <div className="promotionManager__popupInfoRow"><span>Trạng thái:</span> <b>{form.active ? 'Đang hoạt động' : 'Ngừng'}</b></div>
                <div className="promotionManager__popupInfoRow"><span>Mô tả:</span> <b>{form.description}</b></div>
              </div>
            )}
            {/* Chế độ sửa */}
            {isEdit && (
              <div className="promotionManager__popupFormEdit">
                <div className="promotionManager__popupRow">
                  <label>Mã khuyến mại:</label>
                  <input type="text" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} />
                </div>
                <div className="promotionManager__popupRow">
                  <label>Loại:</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    <option value="amount">Số tiền</option>
                    <option value="percent">Phần trăm</option>
                  </select>
                </div>
                <div className="promotionManager__popupRow">
                  <label>Giá trị:</label>
                  <input type="number" value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })} min={0} />
                </div>
                <div className="promotionManager__popupRow">
                  <label>Đơn tối thiểu:</label>
                  <input type="number" value={form.minOrder} onChange={e => setForm({ ...form, minOrder: Number(e.target.value) })} min={0} />
                </div>
                <div className="promotionManager__popupRow">
                  <label>Giảm tối đa:</label>
                  <input type="number" value={form.maxDiscount} onChange={e => setForm({ ...form, maxDiscount: Number(e.target.value) })} min={0} />
                </div>
                <div className="promotionManager__popupRow">
                  <label>Ngày bắt đầu:</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="promotionManager__popupRow">
                  <label>Ngày kết thúc:</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
                </div>
                <div className="promotionManager__popupRow">
                  <label>Trạng thái:</label>
                  <select value={form.active} onChange={e => setForm({ ...form, active: e.target.value === 'true' })}>
                    <option value="true">Đang hoạt động</option>
                    <option value="false">Ngừng</option>
                  </select>
                </div>
                <div className="promotionManager__popupRow">
                  <label>Mô tả:</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
              </div>
            )}
            <div className="promotionManager__popupFooter">
              {!isEdit && (
                <button className="promotionManager__popupBtn" onClick={() => setIsEdit(true)}>Sửa</button>
              )}
              {isEdit && (
                <button className="promotionManager__popupBtn" onClick={handleUpdatePromotion} disabled={loading}>{loading ? 'Đang lưu...' : 'Lưu'}</button>
              )}
              {isEdit && (
                <button className="promotionManager__popupBtn promotionManager__popupBtn--cancel" onClick={() => setIsEdit(false)} disabled={loading}>Hủy</button>
              )}
              {!isEdit && (
                <button className="promotionManager__popupBtn promotionManager__popupBtn--danger" onClick={handleDeletePromotion} disabled={loading}>Xóa</button>
              )}
              <button className="promotionManager__popupBtn promotionManager__popupBtn--cancel" onClick={() => setShowDetailPopup(false)} disabled={loading}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Promotion;
