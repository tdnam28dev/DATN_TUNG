const API_URL = 'http://localhost:8080/api';

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
export async function payOrder(id, token) {
  const res = await fetch(`${API_URL}/orders/${id}/pay`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
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

export async function getOrders(token) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}