// Bố cục giao diện có thể tái sử dụng cho nhiều loại màn hình
import React from 'react';

/**
 * Component ResponsiveLayout
 * Tái sử dụng cho mọi loại màn hình: mobile, tablet, desktop
 * Truyền children vào để hiển thị nội dung bên trong
 */
function ResponsiveLayout({ children }) {
  return (
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: 16,
        minHeight: '100vh',
        boxSizing: 'border-box',
        background: '#f8f9fa',
        // Responsive
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </div>
  );
}

export default ResponsiveLayout;
