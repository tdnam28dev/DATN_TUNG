const API_URL = 'http://localhost:8080/api';

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

export async function getMenus(token) {
  const res = await fetch(`${API_URL}/menus`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}