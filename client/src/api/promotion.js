import API_URL from './config';

// Hàm gọi API lấy danh sách khuyến mại
export async function getPromotions(token) {
	const res = await fetch(`${API_URL}/discounts`, {
		headers: { 'Authorization': `Bearer ${token}` }
	});
	return await res.json();
}

// Hàm gọi API tạo mới khuyến mại
export async function createPromotion(data, token) {
	const res = await fetch(`${API_URL}/discounts`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});
	return await res.json();
}

// Hàm gọi API cập nhật khuyến mại
export async function updatePromotion(id, data, token) {
	const res = await fetch(`${API_URL}/discounts/${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		},
		body: JSON.stringify(data)
	});
	return await res.json();
}

// Hàm gọi API xóa khuyến mại
export async function deletePromotion(id, token) {
	const res = await fetch(`${API_URL}/discounts/${id}`, {
		method: 'DELETE',
		headers: { 'Authorization': `Bearer ${token}` }
	});
	return await res.json();
}

// Hàm gọi API lấy khuyến mại theo mã
export async function getPromotionByCode(code, token) {
	const res = await fetch(`${API_URL}/discounts/code/${code}`, {
		headers: { 'Authorization': `Bearer ${token}` }
	});
	return await res.json();
}
