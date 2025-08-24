// Khôi phục người dùng (restore)
export async function restoreUser(id, token) {
  const res = await fetch(`${API_URL}/users/${id}/restore`, {
    method: 'PATCH',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}
const API_URL = 'http://localhost:8080/api';

export async function createUser(data, token) {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}
export async function updateUser(id, data, token) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}
export async function deleteUser(id, token) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function getUsers(token) {
  const res = await fetch(`${API_URL}/users`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}
export async function getUserById(id, token) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}