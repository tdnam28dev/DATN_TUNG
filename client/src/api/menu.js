import API_URL from './config';

export async function createMenu(data, token) {
  const res = await fetch(`${API_URL}/menus`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}
export async function updateMenu(id, data, token) {
  const res = await fetch(`${API_URL}/menus/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}
export async function deleteMenu(id, token) {
  const res = await fetch(`${API_URL}/menus/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

// Lấy danh sách menu, có thể truyền thêm restaurantId để lọc theo nhà hàng
export async function getMenus(token, restaurantId) {
  let url = `${API_URL}/menus`;
  if (restaurantId) {
    url += `?restaurantId=${restaurantId}`;
  }
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}