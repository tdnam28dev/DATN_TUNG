
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import LogoTudo from '../../../../components/Logo_td';
import Menu from '../menu/menu';
import Branch from '../branch/branch';
import Promotion from '../promotion/promotion';
import MainContent from './mainContent';
import './home.css';


function Home() {
    const location = useLocation();
    const path = location.pathname || '/';

    // Hàm render nội dung trang
    const renderContent = () => {
        switch (path) {
            case '/menu':
                return <Menu />;
            case '/branch':
                return <Branch />;
            case '/promotion':
                return <Promotion />;
            default:
                return <MainContent />;
        }
    };


    return (
        <div className="homePage">
            {/* Header */}
            <header className="homePage__header">
                <div className="homePage__headerContent">
                    <div className="homePage__headerLeft">
                        <div className="homePage__logo">
                            <a className='homePage__logoLink' href='/' onClick={e => { e.preventDefault(); window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }}>
                                <LogoTudo width={300} height={58} />
                            </a>
                        </div>
                        <div className="homePage__hotline">
                            <a href="tel:*1986" className="homePage__hotlineLink">
                                <span className="homePage__hotlineLabel">HOTLINE</span>
                                <span className="homePage__hotlineNumber">*1986</span>
                            </a>
                        </div>
                    </div>
                    <nav className="homePage__nav">
                        <NavLink to="/menu" className={({ isActive }) => `homePage__navItem${isActive ? ' homePage__navItem--active' : ''}`}>THỰC ĐƠN</NavLink>
                        <NavLink to="/branch" className={({ isActive }) => `homePage__navItem${isActive ? ' homePage__navItem--active' : ''}`}>CƠ SỞ</NavLink>
                        <NavLink to="/promotion" className={({ isActive }) => `homePage__navItem${isActive ? ' homePage__navItem--active' : ''}`}>ƯU ĐÃI</NavLink>
                        <a className="homePage__navItem homePage__navItem--primary" href="#booking">ĐẶT BÀN</a>
                    </nav>
                </div>
            </header>

            {/* Content */}
            <main className="td-main">
                {renderContent()}
            </main>

            {/* Footer theo mẫu */}
            <footer className="td-footer">
                <div className="td-footer__content">
                    <div className="td-footer__left">
                        <div className="td-footer__left-first">
                            <a href="https://quannhautudo.com/" className="td-footer__logo" title="Quán Nhậu Tự Do">
                                <LogoTudo width={250} height={48} />
                            </a>
                            <a href="#booking" className="td-footer__bookingPopup" title="Đặt bàn">ĐẶT BÀN</a>
                        </div>
                        <ul className="td-footer__list-nav">
                            <li><a href="/" className="td-footer__link-nav">Thực đơn</a></li>
                            <li><a href="/" className="td-footer__link-nav">Hệ thống cơ sở</a></li>
                            <li><a href="/" className="td-footer__link-nav">Ưu đãi</a></li>
                        </ul>
                    </div>

                    <div className="td-footer__right">
                        <div className="td-footer__infoBox">
                            <div className="td-footer__info-type">
                                <div className="td-footer__type">Hotline</div>
                                <a href="tel:*1986" className="td-footer__type-text">*1986</a>
                            </div>
                            <div className="td-footer__info-type">
                                <div className="td-footer__type">Email</div>
                                <a href="mailto:quannhautudo@gmail.com" className="td-footer__type-text">quannhautudo@gmail.com</a>
                            </div>
                        </div>
                        <div className="td-footer__creBox">
                            <div className="td-footer__list-social">
                                <a href="/" className="td-footer__social-link td-footer__social-link--fb" ><span className="icn"></span></a>
                                <a href="/" className="td-footer__social-link td-footer__social-link--tiktok" ><span className="icn"></span></a>
                                <a href="/" className="td-footer__social-link td-footer__social-link--ig" ><span className="icn"></span></a>
                                <a href="/" className="td-footer__social-link td-footer__social-link--yt" ><span className="icn"></span></a>
                            </div>
                            <div className="td-footer__credit">© 2023 Quán Nhậu Tự Do</div>
                        </div>
                    </div>
                    <div className="td-footer__scrollTop" title="Lên đầu trang" onClick={() => {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}>
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="24" cy="24" r="24" fill="#FFA827"></circle>
                            <path d="M24 36V20" stroke="#333333" strokeWidth="2" strokeMiterlimit="10"></path>
                            <path d="M18 26L24 20L30 26" stroke="#333333" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="square"></path>
                            <path d="M14 15H34" stroke="#333333" strokeWidth="2" strokeMiterlimit="10" strokeLinecap="square"></path>
                        </svg>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Home;