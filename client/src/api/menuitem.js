import API_URL from './config';

// Hàm gửi dữ liệu món ăn, hỗ trợ gửi file ảnh
export async function createMenuItem(data, token) {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (key === 'imageFile' && data.imageFile) {
      formData.append('image', data.imageFile);
    } else {
      formData.append(key, data[key]);
    }
  });
  console.log('item:', data);
  console.log('Creating menu item:', formData);
  const res = await fetch(`${API_URL}/menu-items`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
  return res.json();
}

export async function updateMenuItem(id, data, token) {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (key === 'imageFile' && data.imageFile) {
      formData.append('image', data.imageFile);
    } else {
      formData.append(key, data[key]);
    }
  });
  console.log('item:', data);
  console.log('Updating menu item:', formData);
  const res = await fetch(`${API_URL}/menu-items/${id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
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

export async function getMenuItems(token, restaurantId) {
  let url = `${API_URL}/menu-items`;
  if (restaurantId) {
    url += `?restaurantId=${restaurantId}`;
  }
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}