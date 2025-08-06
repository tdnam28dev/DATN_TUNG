// Component hiệu ứng typewriter cho slogan 2
import React, { useState, useEffect } from 'react';

const text = [
  "Tự do là<br>hạnh phúc"
];

const SloganType2 = ({ className = "typetext", style = {}, ...props }) => {
  const [display, setDisplay] = useState("");
  const speed = 100;
  const interval = 700;
  const [pos, setPos] = useState(0);

  useEffect(() => {
    let timeout;
    if (pos < text[0].length) {
      timeout = setTimeout(() => {
        setDisplay(text[0].substring(0, pos + 1));
        setPos(pos + 1);
      }, speed);
    } else {
      timeout = setTimeout(() => {
        setDisplay("");
        setPos(0);
      }, interval);
    }
    return () => clearTimeout(timeout);
  }, [pos]);

  return (
    <div
      className={className}
      id="type-text-2"
      style={style}
      dangerouslySetInnerHTML={{ __html: display }}
      {...props}
    />
  );
};

export default SloganType2;
