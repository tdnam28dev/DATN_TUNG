const API_URL = 'http://localhost:8080/api';

export async function getMenuTypes(token) {
  const res = await fetch(`${API_URL}/menutype`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function createMenuType(data, token) {
  const res = await fetch(`${API_URL}/menutype`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateMenuType(id, data, token) {
  const res = await fetch(`${API_URL}/menutype/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteMenuType(id, token) {
  const res = await fetch(`${API_URL}/menutype/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}
