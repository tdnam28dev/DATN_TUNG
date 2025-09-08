// Lấy apiUrl từ biến môi trường
const apiUrl = process.env.REACT_APP_API_URL || process.env.API_URL || 'http://localhost:8080/api';
export default apiUrl;