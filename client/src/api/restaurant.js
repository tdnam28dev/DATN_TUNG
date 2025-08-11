const API_URL = 'http://localhost:8080/api';

export async function createRestaurant(data, token) {
  const res = await fetch(`${API_URL}/restaurants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}
export async function updateRestaurant(id, data, token) {
  const res = await fetch(`${API_URL}/restaurants/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}
export async function deleteRestaurant(id, token) {
  const res = await fetch(`${API_URL}/restaurants/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function getRestaurants(token) {
  const res = await fetch(`${API_URL}/restaurants`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}
// Lấy thông tin nhà hàng theo id
export async function getRestaurantById(id, token) {
  const res = await fetch(`${API_URL}/restaurants/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}