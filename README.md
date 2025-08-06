# LoadingBox Component

## Mô tả
- Component loading hiệu ứng tiến trình tải ảnh, sử dụng thư viện `imagesloaded` và `gsap`.
- Khi tất cả ảnh trong vùng chỉ định đã load xong, sẽ gọi callback và thực hiện hiệu ứng chữ.

## Cài đặt thư viện

```bash
npm install imagesloaded gsap
```

## Sử dụng

```jsx
import LoadingBox from './components/LoadingBox';

// ...
<LoadingBox idWrapt="loading-cover" onDone={() => {/* callback khi xong */}} />
```

- `idWrapt`: id của vùng chứa cần theo dõi ảnh (mặc định: 'loading-cover')
- `onDone`: callback khi loading xong

## Ghi chú
- Đã thêm thư viện `imagesloaded` và `gsap` vào dự án.
- Nếu muốn hiển thị logo, import và truyền component logo vào phần `<div className="logo">` trong LoadingBox.
