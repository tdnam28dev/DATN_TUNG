const API_URL = 'http://localhost:8080/api';

export async function createTable(data, token) {
  const res = await fetch(`${API_URL}/tables`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateTable(id, data, token) {
  const res = await fetch(`${API_URL}/tables/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteTable(id, token) {
  const res = await fetch(`${API_URL}/tables/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function getTables(token) {
  const res = await fetch(`${API_URL}/tables`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}