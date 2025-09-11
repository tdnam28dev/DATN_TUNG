import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './order.css';
import { getMenus } from '../../../../api/menu';
import { getMenuItems } from '../../../../api/menuitem';
import { loginByTable } from '../../../../api/auth';
import { createOrder, updateOrder, getOrders } from '../../../../api/order';
import LogoTudo from '../../../../components/Logo_td';
import Icon from '../../../../components/Icon';

// Trang order món cho khách hàng trên điện thoại
const OrderCustomer = () => {
    // Lấy restaurantId và tableId từ URL
    const { restaurantId, tableId } = useParams();
    // State lưu danh sách menu và món ăn
    const [menus, setMenus] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    // Danh sách món đã chọn (giỏ hàng)
    const [cartItems, setCartItems] = useState([]);
    // Popup giỏ hàng
    const [cartPopupOpen, setCartPopupOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false); // Quản lý trạng thái sidebar
    const [selectedMenuId, setSelectedMenuId] = useState(null); // Menu đang chọn trong sidebar
    // State cho token, restaurant, table
    const [token, setToken] = useState(localStorage.getItem('token_customer') || '');
    const [restaurant, setRestaurant] = useState('');
    const [table, setTable] = useState('');
    const [pendingOrder, setPendingOrder] = useState(null);

    // Lấy danh sách menu và món ăn
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let currentToken = token;
                if (!currentToken) {
                    const loginRes = await loginByTable(restaurantId, tableId);
                    if (loginRes.token) {
                        currentToken = loginRes.token;
                        setRestaurant(loginRes.restaurantName);
                        setTable(loginRes.tableNumber);
                        localStorage.setItem('token_customer', currentToken);
                        setToken(currentToken);
                    }
                }
                const menuRes = await getMenus(currentToken, restaurantId);
                setMenus(menuRes);
                const itemRes = await getMenuItems(currentToken, restaurantId);
                setMenuItems(itemRes);
                const orders = await getOrders(currentToken);
                const existOrder = Array.isArray(orders)
                    ? orders.find(o => o.table === tableId && o.status === 'pending' && o.restaurant === restaurantId)
                    : null;
                setPendingOrder(existOrder);
                if (existOrder && Array.isArray(existOrder.items)) {
                    const cart = existOrder.items.map(i => {
                        const item = itemRes.find(m => m._id === i.menuItem);
                        return item ? { ...item, qty: i.quantity } : null;
                    }).filter(Boolean);
                    setCartItems(cart);
                }
            } catch (err) {
                setMenus([]);
                setMenuItems([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [restaurantId, tableId, restaurant, token]);

    // Hàm gửi order (tạo mới hoặc cập nhật)
    // Hàm gửi order: chỉ gửi khi có thay đổi so với hóa đơn pending
    // Lưu lại order dựa trên trạng thái pending đã lấy từ lần fetch đầu

    const handleSubmitOrder = async () => {
        if (cartItems.length === 0) return;
        setLoading(true);
        setSuccess(false);
        try {
            const orderData = {
                table: tableId,
                items: cartItems.map(i => ({ menuItem: i._id, quantity: i.qty })),
                total: cartItems.reduce((sum, i) => sum + (i.price * i.qty), 0),
                status: 'pending',
                restaurant: restaurantId
            };
            let needUpdate = true;
            if (pendingOrder && Array.isArray(pendingOrder.items)) {
                if (pendingOrder.items.length === cartItems.length) {
                    needUpdate = pendingOrder.items.some((item, idx) => {
                        const cartItem = cartItems[idx];
                        return item.menuItem !== cartItem._id || item.quantity !== cartItem.qty;
                    });
                } else {
                    needUpdate = true;
                }
            }
            let data;
            if (pendingOrder && pendingOrder._id) {
                if (needUpdate) {
                    data = await updateOrder(pendingOrder._id, orderData, token);
                } else {
                    setSuccess(true);
                    setLoading(false);
                    return;
                }
            } else {
                data = await createOrder(orderData, token);
            }
            if (data && data._id && Array.isArray(data.items)) {
                const cart = data.items.map(i => {
                    const item = menuItems.find(m => m._id === i.menuItem);
                    return item ? { ...item, qty: i.quantity } : null;
                }).filter(Boolean);
                setCartItems(cart);
                setSuccess(true);
                setPendingOrder(data);
            } else {
                setSuccess(false);
            }
        } catch (err) {
            setSuccess(false);
        }
        setLoading(false);
    };

    // Xử lý chọn/bỏ chọn món
    // Thêm món vào giỏ hàng
    const handleAddToCart = (item) => {
        setCartItems(prev => {
            const exist = prev.find(i => i._id === item._id);
            if (exist) {
                // Nếu đã có thì tăng số lượng
                return prev.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1 }];
        });
    };
    // Xóa món khỏi giỏ hàng
    const handleRemoveFromCart = (itemId) => {
        setCartItems(prev => prev.filter(i => i._id !== itemId));
    };
    // Đổi số lượng món
    // const handleChangeQty = (itemId, qty) => {
    //     setCartItems(prev => prev.map(i => i._id === itemId ? { ...i, qty: qty > 0 ? qty : 1 } : i));
    // };
    // Tính tổng tiền
    const cartTotal = cartItems.reduce((sum, i) => sum + (i.price * i.qty), 0);

    // Xử lý mở/đóng sidebar
    const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    };
    // Mở popup giỏ hàng
    const openCartPopup = () => setCartPopupOpen(true);
    // Đóng popup giỏ hàng
    const closeCartPopup = () => setCartPopupOpen(false);

    return (
        <div className="order-page">
            {/* Thanh header giống giao diện mẫu */}
            <div className="order-header">
                <div className="order-header__left">
                    <button className="order-header__sidebar-btn" onClick={toggleSidebar} aria-label="Mở menu">
                        <Icon name="menu" className="order-header__sidebar-icon" />
                    </button>
                    <div className="order-header__logo">
                        <a href={`/order/${restaurantId}/${tableId}`}>
                            <LogoTudo width={164} height={36} isMini={false} />
                        </a>
                    </div>
                </div>
                <div className="order-header__right">
                    <button className="order-header__cart" aria-label="Giỏ hàng" onClick={openCartPopup}>
                        <Icon name="cart" className="order-header__cart-icon" />
                        {cartItems.length > 0 && (
                            <span className='order-header__cart-count'>{cartItems.length}</span>
                        )}
                    </button>
                </div>
            </div>
            {/* Sidebar đơn giản */}
            {sidebarOpen && (
                <div className="order-sidebar">
                    <button className="order-sidebar__close" onClick={toggleSidebar} aria-label="Đóng menu">×</button>
                    <div className="order-sidebar__content">
                        <h3 className="order-sidebar__title">Danh sách menu</h3>
                        <ul className="order-sidebar__menu-list">
                            <li
                                className={`order-sidebar__menu-item${selectedMenuId === null ? ' order-sidebar__menu-item--selected' : ''}`}
                                onClick={() => setSelectedMenuId(null)}
                            >
                                Tất cả món
                            </li>
                            {(Array.isArray(menus) ? menus : []).map(menu => (
                                <li
                                    key={menu._id}
                                    className={`order-sidebar__menu-item${selectedMenuId === menu._id ? ' order-sidebar__menu-item--selected' : ''}`}
                                    onClick={() => setSelectedMenuId(menu._id)}
                                >
                                    {menu.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
            {loading ? (
                <div className="order-page__loading">Đang tải dữ liệu...</div>
            ) : (
                <>
                    <div className="order-page__content">
                        <div className="order-page__info">
                            <h2 className="order-page__title">Gọi món bàn số {table}</h2>
                            <span className="order-page__subtitle">Nhà hàng: {restaurant}</span>
                        </div>
                        <div className="order-page__menu">
                            <h3 className="order-page__menu-title">Chọn món</h3>
                            <ul className="order-page__menu-list">
                                {(
                                  Array.isArray(menuItems)
                                    ? (selectedMenuId
                                        ? menuItems.filter(item => item.menu === selectedMenuId)
                                        : menuItems)
                                    : []
                                ).map(item => {
                                    // Lấy đường dẫn ảnh từ imagePath, fallback về ảnh mặc định nếu không có
                                    let imgSrc = '/images/default-food.png';
                                    if (item.imagePath) {
                                        imgSrc = item.imagePath.startsWith('/') ? item.imagePath : `/${item.imagePath}`;
                                    }
                                    return (
                                        <li key={item._id} className={`order-page__menu-item${cartItems.find(i => i._id === item._id) ? ' order-page__menu-item--selected' : ''}`}>
                                            <div className="order-page__item-container-img">
                                                <img src={imgSrc} alt={item.name} className="order-page__item-img" />
                                            </div>
                                            <div className="order-page__item-info">
                                                <span className="order-page__item-name">{item.name}</span>
                                                <span className="order-page__item-price">{item.price}đ</span>
                                            </div>
                                            <button className="order-page__item-add" onClick={() => handleAddToCart(item)}>
                                                Thêm vào giỏ
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                    {/* Popup giỏ hàng */}
                    {cartPopupOpen && (
                        <div className="order-page__cart-popup">
                            <div className="order-page__cart-popup-content">
                                <button className="order-page__cart-popup-close" onClick={closeCartPopup}>×</button>
                                <div className="order-page__cart-popup-title">Giỏ hàng của bạn</div>
                                <ul className="order-page__cart-list">
                                    {cartItems.length === 0 ? (
                                        <li style={{textAlign:'center',color:'#888'}}>Chưa có món nào trong giỏ hàng</li>
                                    ) : cartItems.map(item => (
                                        <li key={item._id} className="order-page__cart-item">
                                            <div className="order-page__cart-item-info">
                                                <span className="order-page__cart-item-name">{item.name}</span>
                                                <span className="order-page__cart-item-price">{item.price}đ</span>
                                            </div>
                                            <div className="order-page__cart-item-qty-group">
                                                <button
                                                    type="button"
                                                    className="order-page__cart-item-qty-btn"
                                                    onClick={() => setCartItems(prev => prev.map(i => i._id === item._id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))}
                                                >-</button>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    className="order-page__cart-item-qty-input"
                                                    value={item.qty}
                                                    onChange={e => {
                                                        const qty = Math.max(1, Number(e.target.value));
                                                        setCartItems(prev => prev.map(i => i._id === item._id ? { ...i, qty } : i));
                                                    }}
                                                    style={{ width: 40, textAlign: 'center' }}
                                                />
                                                <button
                                                    type="button"
                                                    className="order-page__cart-item-qty-btn"
                                                    onClick={() => setCartItems(prev => prev.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i))}
                                                >+</button>
                                            </div>
                                            <button className="order-page__cart-item-remove" onClick={() => handleRemoveFromCart(item._id)}>Xóa</button>
                                        </li>
                                    ))}
                                </ul>
                                <div className="order-page__cart-total">Tổng cộng: {cartTotal}đ</div>
                                <div className="order-page__cart-popup-actions">
                                    <button className="order-page__cart-popup-btn" onClick={closeCartPopup}>Đóng</button>
                                    <button className="order-page__cart-popup-btn" onClick={handleSubmitOrder} disabled={cartItems.length === 0 || loading} style={{background:'#2563eb'}}>
                                        {loading ? 'Đang gửi...' : 'Gửi order'}
                                    </button>
                                </div>
                                {success && <div className="order-page__success">Đã gửi order thành công!</div>}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default OrderCustomer;
