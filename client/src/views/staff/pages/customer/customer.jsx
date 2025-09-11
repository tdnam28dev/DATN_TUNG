import React, { useEffect, useState } from 'react';
import { getCustomers } from '../../../../api/customer';
import './customer.css';

// Component hiển thị danh sách khách hàng cho nhân viên
const StaffCustomerList = ({ token }) => {
	const [customers, setCustomers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		async function fetchData() {
			try {
				setLoading(true);
				const data = await getCustomers(token);
				setCustomers(Array.isArray(data) ? data : []);
			} catch (err) {
				setError('Lỗi khi lấy danh sách khách hàng');
			} finally {
				setLoading(false);
			}
		}
		fetchData();
	}, [token]);

	if (loading) return <div className="customer__loading">Đang tải...</div>;
	if (error) return <div className="customer__error">{error}</div>;

	return (
		<div className="customer">
			<h2 className="customer__title">Danh sách khách hàng</h2>
					<table className="customer__table">
						<thead>
							<tr>
								<th className="customer__table-header">Tên</th>
								<th className="customer__table-header">Giới tính</th>
								<th className="customer__table-header">Số điện thoại</th>
								<th className="customer__table-header">Email</th>
								<th className="customer__table-header">Địa chỉ</th>
								<th className="customer__table-header">Điểm</th>
								<th className="customer__table-header">Ngày tạo</th>
							</tr>
						</thead>
						<tbody>
							{customers.map(c => (
								<tr key={c._id} className="customer__table-row">
									<td className="customer__table-cell">{c.name}</td>
									<td className="customer__table-cell">{c.gender === 'male' ? 'Nam' : c.gender === 'female' ? 'Nữ' : 'Khác'}</td>
									<td className="customer__table-cell">{c.phone}</td>
									<td className="customer__table-cell">{c.email}</td>
									<td className="customer__table-cell">{c.address || ''}</td>
									<td className="customer__table-cell">{c.point ?? 0}</td>
									<td className="customer__table-cell">{new Date(c.createdAt).toLocaleDateString()}</td>
								</tr>
							))}
						</tbody>
					</table>
			{customers.length === 0 && <div className="customer__empty">Không có khách hàng nào.</div>}
		</div>
	);
};

export default StaffCustomerList;
