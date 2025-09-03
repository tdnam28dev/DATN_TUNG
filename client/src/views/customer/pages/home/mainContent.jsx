import React, { useRef, useEffect } from "react";
import SloganType1 from "../../../../components/SloganType1";
import SloganType2 from "../../../../components/SloganType2";
import "./mainContent.css";

function MainContent() {
    const layer4Ref = useRef(null);
    const layer5Ref = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { innerWidth, innerHeight } = window;
            // Tính vị trí chuột so với giữa màn hình
            const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
            const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);

            const layer5X = x * 32;
            const layer5Y = y * 10;
            const layer4X = -x * 32;
            const layer4Y = -y * 10;

            if (layer5Ref.current) {
                layer5Ref.current.style.transform = `translate3d(${layer5X}px, ${layer5Y}px, 0px) rotate(0.0001deg)`;
                layer5Ref.current.style.transformStyle = "preserve-3d";
                layer5Ref.current.style.backfaceVisibility = "hidden";
               
            }
            if (layer4Ref.current) {
                layer4Ref.current.style.transform = `translate3d(${layer4X}px, ${layer4Y}px, 0px) rotate(0.0001deg)`;
                layer4Ref.current.style.transformStyle = "preserve-3d";
                layer4Ref.current.style.backfaceVisibility = "hidden";
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    return (
        <div className="td-homePage__Content">
            <div className="td-home__coverWeb">
                <div className="td-home__coverWeb__box">
                    {/* Layer 2 - z-index: 5 */}
                    <div className="td-home__layer td-home__layer--2">
                        <img src={process.env.PUBLIC_URL + "/home-layer-2_v2.webp"} alt="" className="td-home__layer__img" />
                    </div>
                    {/* Layer 1 - z-index: 6 */}
                    <div className="td-home__layer td-home__layer--1">
                        <img src={process.env.PUBLIC_URL + "/home-layer-1_v2.webp"} alt="" className="td-home__layer__img" />
                    </div>
                    {/* Layer 3 - z-index: 7 */}
                    <div className="td-home__layer td-home__layer--3">
                        <img src={process.env.PUBLIC_URL + "/home-layer-3_v2.webp"} alt="" className="td-home__layer__img td-home__layer__i" />
                    </div>
                    {/* Layer 4 - z-index: 8 */}
                    <div className="td-home__layer td-home__layer--4" ref={layer4Ref}>
                        <img src={process.env.PUBLIC_URL + "/home-layer-4_v2.webp"} alt="" className="td-home__layer__img td-home__layer__i" />
                    </div>
                    {/* Layer 5 - z-index: 9 */}
                    <div className="td-home__layer td-home__layer--5" ref={layer5Ref}>
                        <img src={process.env.PUBLIC_URL + "/home-layer-5_v2.webp"} alt="" className="td-home__layer__img td-home__layer__i" />
                    </div>
                    {/* TV Box */}
                    <div className="td-home__tvBox">
                        <div className="td-home__tvBox__bg"></div>
                        <video
                            className="td-home__tvBox__video"
                            src={process.env.PUBLIC_URL + "/web-tv.mp4"}
                            poster={process.env.PUBLIC_URL + "/rectv.jpg"}
                            playsInline
                            preload="auto"
                            autoPlay
                            muted
                            loop
                        ></video>
                    </div>
                </div>
                <div className="td-home__brich td-home__brich--left td-home__anirotate">
                    <img src={process.env.PUBLIC_URL + "/Gach-1.png"} alt="" className="td-home__brich__img" />
                </div>
                <div className="td-home__brich td-home__brich--right td-home__anirotate2">
                    <img src={process.env.PUBLIC_URL + "/Gach-2.png"} alt="" className="td-home__brich__img" />
                </div>
                <SloganType1 className="slogan1"/>
                <SloganType2 className="slogan2"/>
            </div>
            <div className="td-home__bigText-middle"></div>
            <div className="td-home__menu"></div>
            <div className="td-home__branch"></div>
            <div className="td-home__marquee"></div>
            <div className="td-home__promotion"></div>
            <div className="td-home__pin-spacer"></div>
            <div className="td-home__tdclub"></div>
        </div>
    );
}

export default MainContent;