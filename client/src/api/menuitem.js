const API_URL = 'http://localhost:8080/api';

export async function createMenuItem(data, token) {
  const res = await fetch(`${API_URL}/menu-items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateMenuItem(id, data, token) {
  const res = await fetch(`${API_URL}/menu-items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteMenuItem(id, token) {
  const res = await fetch(`${API_URL}/menu-items/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function getMenuItems(token) {
  const res = await fetch(`${API_URL}/menu-items`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}