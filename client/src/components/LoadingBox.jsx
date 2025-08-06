import React, { useEffect, useRef, useState } from 'react';
import LogoTudo from './Logo_td';

// Component LoadingBox
const LoadingBox = ({ idWrapt = 'loading-cover', onDone }) => {
  const boxRef = useRef(null);
  const [percent, setPercent] = useState(0);

  // Loading giả lập: tự động tăng tiến trình từ 0 lên 100% trong 1.8s
  useEffect(() => {
    const duration = 1800; // tổng thời gian loading (ms)
    const step = 25; // ms mỗi lần cập nhật
    const increment = 100 / (duration / step);
    let percentNow = 0;
    const timer = setInterval(() => {
      percentNow += increment;
      if (percentNow >= 100) {
        percentNow = 100;
        setPercent(100);
        clearInterval(timer);
        setTimeout(() => {
          if (onDone) onDone();
        }, 300); // delay nhỏ để nhìn thấy 100%
      } else {
        setPercent(Math.floor(percentNow));
      }
    }, step);
    return () => clearInterval(timer);
  }, [onDone]);


  // Style giống ảnh: nền xanh đậm, logo và text căn giữa, progress bar mảnh màu cam
  const loadingBoxStyle = {
    position: 'fixed',
    zIndex: 9999,
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#0d3321', // Nền xanh đậm
    transition: 'opacity 0.5s',
  };
  const loadingContentStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 340,
    maxWidth: 400,
    width: '90vw',
    padding: 0,
    background: 'transparent',
    boxShadow: 'none',
    border: 'none',
  };
  // Style progress bar: nền xám nhạt, phần đã chạy màu cam, bo góc nhẹ, sát mép trên
  const progressBarWidth = 400;
  const progressBgStyle = {
    width: progressBarWidth,
    maxWidth: '90vw',
    height: 4,
    background: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 18,
    marginTop: 0,
    position: 'relative',
  };
  const meterStyle = {
    width: `${percent}%`,
    height: '100%',
    background: '#FFA827',
    borderRadius: 2,
    transition: 'width 0.3s',
    position: 'absolute',
    left: 0,
    top: 0,
  };
  return (
    <div className={`loading-box${percent < 100 ? ' active' : ''}`} id="loading-box" ref={boxRef} style={loadingBoxStyle}>
      <div className="loading-content" style={loadingContentStyle}>
        <div className="logo" style={{ marginBottom: 24, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <LogoTudo width={230} height={44} />
        </div>
        <div className="progress" style={progressBgStyle}>
          <div className="meter" style={meterStyle} id="loading-proccess"></div>
        </div>
        <div className="count" id="loading-proccess-count" style={{ color: '#fff', fontWeight: 500, fontSize: 20, textAlign: 'center', marginTop: 8 }}>{percent}%</div>
      </div>
    </div>
  );
};

export default LoadingBox;
