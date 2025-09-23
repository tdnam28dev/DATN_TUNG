import API_URL from './config';

// Tạm lưu hóa đơn (pending)
export async function savePendingOrder(id, token) {
  const res = await fetch(`${API_URL}/orders/${id}/save-pending`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// Hủy hóa đơn (cancelled)
export async function cancelOrder(id, token) {
  const res = await fetch(`${API_URL}/orders/${id}/cancel`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// Thanh toán hóa đơn (completed)
// Thanh toán hóa đơn (completed), truyền thêm tổng tiền và discount nếu có
export async function payOrder(id, token, { paymentMethod, customerId, paymentId, total, discount }) {
  const res = await fetch(`${API_URL}/orders/${id}/pay`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ paymentMethod, customerId, paymentId, total, discount })
  });
  return res.json();
}

export async function createOrder(data, token) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}
export async function updateOrder(id, data, token) {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}
export async function deleteOrder(id, token) {
  const res = await fetch(`${API_URL}/orders/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// Hàm lấy danh sách hóa đơn, có thể truyền params để lọc (ví dụ: { paidBy })
export async function getOrders(token, params = {}) {
  let url = `${API_URL}/orders`;
  const query = Object.entries(params)
    .filter(([_, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  if (query) url += `?${query}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}