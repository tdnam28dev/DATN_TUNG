import React, { useEffect, useState } from 'react';
import { getPromotions } from '../../../../api/promotion';
import './promotion.css';

// Component hiển thị danh sách khuyến mại cho nhân viên
const StaffPromotionList = ({ token }) => {
	const [promotions, setPromotions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		async function fetchData() {
			try {
				setLoading(true);
				const data = await getPromotions(token);
				setPromotions(Array.isArray(data) ? data : []);
			} catch (err) {
				setError('Lỗi khi lấy danh sách khuyến mại');
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, [token]);

	if (loading) return <div className="promotion__loading">Đang tải...</div>;
	if (error) return <div className="promotion__error">{error}</div>;

	return (
		<div className="promotion">
			<h2 className="promotion__title">Danh sách khuyến mại</h2>
					<table className="promotion__table">
						<thead>
							<tr>
								<th className="promotion__table-header">Mã</th>
								<th className="promotion__table-header">Loại</th>
								<th className="promotion__table-header">Giá trị</th>
								<th className="promotion__table-header">Giảm tối đa</th>
								<th className="promotion__table-header">Đơn tối thiểu</th>
								<th className="promotion__table-header">Ngày bắt đầu</th>
								<th className="promotion__table-header">Ngày kết thúc</th>
								<th className="promotion__table-header">Trạng thái</th>
							</tr>
						</thead>
						<tbody>
							{promotions.map(p => (
								<tr key={p._id} className="promotion__table-row">
									<td className="promotion__table-cell">{p.code}</td>
									<td className="promotion__table-cell">{p.type === 'percent' ? 'Phần trăm' : 'Số tiền'}</td>
									<td className="promotion__table-cell">{p.type === 'percent' ? `${p.value}%` : `${p.value.toLocaleString()}₫`}</td>
									<td className="promotion__table-cell">{p.maxDiscount ? `${p.maxDiscount.toLocaleString()}₫` : '-'}</td>
									<td className="promotion__table-cell">{p.minOrder ? `${p.minOrder.toLocaleString()}₫` : '-'}</td>
									<td className="promotion__table-cell">{p.startDate ? new Date(p.startDate).toLocaleDateString() : ''}</td>
									<td className="promotion__table-cell">{p.endDate ? new Date(p.endDate).toLocaleDateString() : ''}</td>
									<td className="promotion__table-cell">{p.active ? 'Đang áp dụng' : 'Hết hạn'}</td>
								</tr>
							))}
						</tbody>
					</table>
			{promotions.length === 0 && <div className="promotion__empty">Không có khuyến mại nào.</div>}
		</div>
	);
};

export default StaffPromotionList;
