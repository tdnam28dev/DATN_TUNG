const API_URL = 'http://localhost:8080/api';

// Lấy danh sách phương thức thanh toán
export async function getPaymentMethods(token) {
	const res = await fetch(`${API_URL}/payments`, {
		headers: { 'Authorization': `Bearer ${token}` }
	});
	return await res.json();
}

// Lấy chi tiết phương thức thanh toán
export async function getPaymentMethodById(id, token) {
	const res = await fetch(`${API_URL}/payments/${id}`, {
		headers: { 'Authorization': `Bearer ${token}` }
	});
	return await res.json();
}

// Tạo mới phương thức thanh toán
export async function createPaymentMethod(data, token) {
	const res = await fetch(`${API_URL}/payments`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});
	return await res.json();
}

// Cập nhật phương thức thanh toán
export async function updatePaymentMethod(id, data, token) {
	const res = await fetch(`${API_URL}/payments/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});
	return await res.json();
}

// Xóa phương thức thanh toán
export async function deletePaymentMethod(id, token) {
	const res = await fetch(`${API_URL}/payments/${id}`, {
		method: 'DELETE',
		headers: { 'Authorization': `Bearer ${token}` }
	});
	return await res.json();
}
