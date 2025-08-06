// Component hiệu ứng typewriter cho slogan 1
import React, { useState, useEffect } from 'react';

const text = [
  "Không có gì <br>quý hơn độc lập <br>và tự do"
];

const SloganType1 = ({ className = "typetext", style = {}, ...props }) => {
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
      id="type-text-1"
      style={style}
      dangerouslySetInnerHTML={{ __html: display }}
      {...props}
    />
  );
};

export default SloganType1;
