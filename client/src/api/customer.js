const API_URL = 'http://localhost:8080/api';

// Hàm gọi API lấy danh sách khách hàng
// Hàm gọi API lấy danh sách khách hàng, có thể truyền phone hoặc id để tìm kiếm
export async function getCustomers(token, { phone, id } = {}) {
	let url = `${API_URL}/customers`;
	const params = [];
	if (phone) params.push(`phone=${encodeURIComponent(phone)}`);
	if (id) params.push(`id=${encodeURIComponent(id)}`);
	if (params.length > 0) url += `?${params.join('&')}`;
	const res = await fetch(url, {
		headers: { 'Authorization': `Bearer ${token}` }
	});
	return await res.json();
}

// Hàm gọi API lấy chi tiết khách hàng theo id
export async function getCustomerById(id, token) {
	const res = await fetch(`${API_URL}/customers/${id}`, {
		headers: { 'Authorization': `Bearer ${token}` }
	});
	return await res.json();
}

// Hàm gọi API tạo mới khách hàng
export async function createCustomer(data, token) {
	const res = await fetch(`${API_URL}/customers`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});
	return await res.json();
}

// Hàm gọi API cập nhật khách hàng
export async function updateCustomer(id, data, token) {
	const res = await fetch(`${API_URL}/customers/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});
	return await res.json();
}

// Hàm gọi API xóa khách hàng
export async function deleteCustomer(id, token) {
	const res = await fetch(`${API_URL}/customers/${id}`, {
		method: 'DELETE',
		headers: { 'Authorization': `Bearer ${token}` }
	});
	return await res.json();
}
