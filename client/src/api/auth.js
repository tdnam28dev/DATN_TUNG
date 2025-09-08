import apiUrl from './config';

export async function login(username, password, role = 'staff') {
  const res = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role })
  });
  return res.json();
}

// Đăng nhập bằng id nhà hàng và id bàn (dùng cho khách hoặc nhân viên bàn)
export async function loginByTable(restaurantId, tableId) {
  const res = await fetch(`${apiUrl}/auth/login-by-table`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ restaurantId, tableId })
  });
  return res.json();
}

export async function register(username, password, role) {
  const res = await fetch(`${apiUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, role })
  });
  return res.json();
}