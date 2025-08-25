import React, { useEffect, useState, useCallback } from 'react';
import { getUsers, createUser, updateUser, deleteUser, restoreUser } from '../../../../api/user';
import { getRestaurants } from '../../../../api/restaurant';
import './css/User.css';

function User({ token }) {
    // State lưu danh sách người dùng
    const [users, setUsers] = useState([]);
    // State loading
    const [loading, setLoading] = useState(false);
    // State lưu danh sách nhà hàng
    const [restaurants, setRestaurants] = useState([]);
    // State cho popup chi tiết người dùng
    const [showUserDetail, setShowUserDetail] = useState(false);
    const [userDetail, setUserDetail] = useState(null);
    // State cho popup thêm người dùng
    const [showAddUser, setShowAddUser] = useState(false);
    // State cho trạng thái sửa hóa đơn
    const [isEditUser, setIsEditUser] = useState(false);
    // State lưu thông tin người dùng đang chỉnh sửa
    const [editUserDetail, setEditUserDetail] = useState(null);
    // Bộ lọc
    const [filterRole, setFilterRole] = useState('');
    const [filterRestaurant, setFilterRestaurant] = useState('');

    // lấy danh sách người dùng và nhà hàng
    const fetchData = useCallback(async () => {
        const userData = await getUsers(token);
        const restaurantData = await getRestaurants(token);
        const users = Array.isArray(userData) ? userData.map(user => {
            let restaurantName = '-';
            if (user.restaurant) {
                if (typeof user.restaurant === 'object' && user.restaurant.name) {
                    restaurantName = user.restaurant.name;
                } else {
                    const found = Array.isArray(restaurantData) ? restaurantData.find(r => r._id === user.restaurant) : null;
                    restaurantName = found ? found.name : user.restaurant;
                }
            }
            return { ...user, restaurantName };
        }) : [];
        setUsers(users);
        setRestaurants(restaurantData);
    }, [token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Lọc user chỉ theo trường role (string)
    const filteredUsers = users.filter(u => {
        let matchRole = true;
        let matchRes = true;
        // role có thể là undefined/null, chuẩn hóa về string thường
        const userRole = (u.role || '').toLowerCase();
        if (filterRole) matchRole = userRole === filterRole.toLowerCase();
        if (filterRestaurant) {
            const rid = typeof u.restaurant === 'object' ? u.restaurant._id : u.restaurant;
            matchRes = rid === filterRestaurant;
        }
        return matchRole && matchRes;
    });

    // Hàm thêm user mới
    const handleCreateUser = async (user) => {
        // Nếu là admin thì xóa trường restaurant khỏi payload
        let submitUser = { ...user };
        if (user.role === 'admin') {
            delete submitUser.restaurant;
        } else {
            // Nếu chưa chọn nhà hàng thì không gửi trường restaurant
            if (!user.restaurant) delete submitUser.restaurant;
        }
        // Luôn tự động thêm trường roles là mảng chứa role
        submitUser.roles = Array.isArray(user.roles) && user.roles.length > 0 ? user.roles : [user.role];
        // Lọc bỏ các trường có giá trị rỗng, null, undefined
        Object.keys(submitUser).forEach(key => {
            if (submitUser[key] === '' || submitUser[key] === null || submitUser[key] === undefined) {
                delete submitUser[key];
            }
        });
        // Validate cơ bản
        if (!submitUser.username || !submitUser.password || !submitUser.name || !submitUser.role || !Array.isArray(submitUser.actions) || submitUser.actions.length === 0 || (submitUser.role !== 'admin' && !submitUser.restaurant)) {
            alert('Vui lòng nhập đầy đủ thông tin!');
            return;
        }
        setLoading(true);
        const res = await createUser(submitUser, token);
        setLoading(false);
        if (res && res._id) {
            fetchData();
            alert('Đã thêm người dùng!');
        } else {
            alert(res && res.error ? res.error : 'Lỗi khi thêm người dùng!');
        }
    };

    // Hàm cập nhật user
    const handleUpdateUser = async () => {
        if (!editUserDetail) return;
        // Validate chức vụ
        if (!editUserDetail.role) {
            setEditUserDetail(prev => ({ ...prev, roleError: true }));
            return;
        }
        // Validate quyền thao tác
        if (!Array.isArray(editUserDetail.actions) || editUserDetail.actions.length === 0) {
            setEditUserDetail(prev => ({ ...prev, actionsError: true }));
            return;
        }
        // Validate họ tên
        if (!editUserDetail.name || editUserDetail.name.trim() === '') {
            alert('Vui lòng nhập họ tên!');
            return;
        }
        // Nếu không phải admin thì phải chọn nhà hàng
        if (editUserDetail.role !== 'admin' && (!editUserDetail.restaurant || editUserDetail.restaurant === '')) {
            alert('Vui lòng chọn nhà hàng!');
            return;
        }
        setLoading(true);
        // Chuẩn bị dữ liệu gửi đi, không gửi password
        const updateData = {
            name: editUserDetail.name,
            role: editUserDetail.role,
            roles: [editUserDetail.role],
            actions: editUserDetail.actions,
            restaurant: editUserDetail.role === 'admin' ? null : editUserDetail.restaurant,
            isActive: editUserDetail.isActive
        };
        let res = await updateUser(editUserDetail._id, updateData, token);
        setLoading(false);
        if (res && res._id) {
            setIsEditUser(false);
            setEditUserDetail(null);
            setShowUserDetail(false);
            fetchData();
            alert('Đã lưu người dùng!');
        } else {
            alert(res && res.error ? res.error : 'Lỗi khi cập nhật!');
        }
    };

    // Hàm xóa user (đóng tài khoản)
    const handleDeleteUser = async (userId) => {
        setLoading(true);
        const res = await deleteUser(userId, token);
        setLoading(false);
        // Kiểm tra message hoặc trạng thái user.isActive
        if ((res && res.message && res.message.includes('đóng')) || (res && res.user && res.user.isActive === false)) {
            setShowUserDetail(false);
            fetchData();
            alert('Đã đóng tài khoản!');
        } else {
            alert(res && res.error ? res.error : 'Lỗi khi đóng tài khoản!');
        }
    };

    // Hàm khôi phục user
    const handleRestoreUser = async (userId) => {
        setLoading(true);
        const res = await restoreUser(userId, token);
        setLoading(false);
        if ((res && res.message && res.message.includes('khôi phục')) || (res && res.user && res.user.isActive === true)) {
            setShowUserDetail(false);
            fetchData();
            alert('Đã khôi phục tài khoản!');
        } else {
            alert(res && res.error ? res.error : 'Lỗi khi khôi phục tài khoản!');
        }
    };

    // State cho form thêm user
    const [form, setForm] = useState({
        username: '',
        password: '',
        name: '',
        role: '',
        roles: [],
        actions: [],
        restaurant: '',
        isActive: true
    });
    const [err, setErr] = useState({});

    const handleChange = (field, value) => {
        setForm(f => ({ ...f, [field]: value }));
        setErr(e => ({ ...e, [field]: false }));
    };
    const handleCheckRole = (role) => {
        setForm(f => ({ ...f, role }));
        setErr(e => ({ ...e, role: false }));
    };
    const handleCheckAction = (action, checked) => {
        setForm(f => {
            let actions = Array.isArray(f.actions) ? [...f.actions] : [];
            if (checked) {
                if (!actions.includes(action)) actions.push(action);
            } else {
                actions = actions.filter(a => a !== action);
            }
            return { ...f, actions };
        });
        setErr(e => ({ ...e, actions: false }));
    };
    const handleSubmitAddUser = async () => {
        let hasErr = false;
        let newErr = {};
        if (!form.username) { newErr.username = true; hasErr = true; }
        if (!form.password) { newErr.password = true; hasErr = true; }
        if (!form.name) { newErr.name = true; hasErr = true; }
        if (!form.role) { newErr.role = true; hasErr = true; }
        if (!Array.isArray(form.actions) || form.actions.length === 0) { newErr.actions = true; hasErr = true; }
        if (form.role !== 'admin' && (!form.restaurant || form.restaurant === '' || form.restaurant === null)) { newErr.restaurant = true; hasErr = true; }
        setErr(newErr);
        if (hasErr) return;
        await handleCreateUser(form);
        setShowAddUser(false);
        setForm({ username: '', password: '', name: '', role: '', roles: [], actions: [], restaurant: '', isActive: true });
        setErr({});
    };

    return (
        <div className="user-setting">
            {/* Nút thêm người dùng và bộ lọc role, nhà hàng */}
            <div className="user-setting__header">
                <div className="user-setting__add-btn">
                    <button className="user-setting__button" onClick={() => setShowAddUser(true)}>Thêm người dùng</button>
                </div>
                <div className="user-setting__filters">
                    <select className="user-setting__filter user-setting__filter--role" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                        <option value="">Tất cả quyền</option>
                        <option value="admin">admin</option>
                        <option value="manager">manager</option>
                        <option value="staff">staff</option>
                    </select>
                    <select className="user-setting__filter user-setting__filter--restaurant" value={filterRestaurant} onChange={e => setFilterRestaurant(e.target.value)}>
                        <option value="">Tất cả nhà hàng</option>
                        {restaurants.map(r => (
                            <option key={r._id} value={r._id}>{r.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <table className="user-setting__table">
                <thead className="user-setting__table-head">
                    <tr>
                        <th className="user-setting__table-th">Tên đăng nhập</th>
                        <th className="user-setting__table-th">Họ tên</th>
                        <th className="user-setting__table-th">Chức vụ</th>
                        <th className="user-setting__table-th">Nhà hàng</th>
                        <th className="user-setting__table-th">Trạng thái</th>
                        <th className="user-setting__table-th">Hành động</th>
                    </tr>
                </thead>
                <tbody className="user-setting__table-body">
                    {filteredUsers.map(user => (
                        <tr className="user-setting__table-row" key={user._id}>
                            <td className="user-setting__table-td">{user.username}</td>
                            <td className="user-setting__table-td">{user.name || '-'}</td>
                            <td className="user-setting__table-td">{user.role || '-'}</td>
                            <td className="user-setting__table-td">{user.restaurantName}</td>
                            <td className="user-setting__table-td">
                                <div className={user.isActive ? 'user-status user-status--active' : 'user-status user-status--locked'}>
                                    <span >
                                        {user.isActive ? 'Active' : 'Locked'}
                                    </span>
                                </div>
                            </td>
                            <td className="user-setting__table-td">
                                <button className="user-setting__button user-setting__button--detail" onClick={() => { setUserDetail(user); setShowUserDetail(true); }}>Chi tiết</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Popup chi tiết/sửa user */}
            {showUserDetail && userDetail && (
                <div className="user-setting__popup-bg">
                    <div className="user-setting__popup">
                        <h3 className="user-setting__popup-title">Chi tiết người dùng</h3>
                        <div className="user-setting__popup-row"><b>Tên đăng nhập:</b> {userDetail.username}</div>
                        <div className="user-setting__popup-row"><b>Họ tên:</b> {isEditUser ? (
                            <input className="user-setting__popup-input" value={editUserDetail?.name || ''} onChange={e => setEditUserDetail({ ...editUserDetail, name: e.target.value })} placeholder="Nhập họ tên" />
                        ) : (userDetail.name || '-')}
                        </div>
                        <div className="user-setting__popup-row"><b>Chức vụ:</b> {isEditUser ? (
                            <div className="user-setting__popup-group">
                                {['admin', 'manager', 'staff'].map(role => (
                                    <label className="user-setting__popup-label" key={role}>
                                        <input type="checkbox" checked={editUserDetail?.role === role} onChange={() => setEditUserDetail({ ...editUserDetail, role })} /> {role}
                                    </label>
                                ))}
                                {editUserDetail?.roleError && <span className="user-popup__error">Chọn 1 chức vụ!</span>}
                            </div>
                        ) : (userDetail.role || '-')}
                        </div>
                        <div className="user-setting__popup-row"><b>Quyền thao tác:</b> {isEditUser ? (
                            <div className="user-setting__popup-group">
                                {['read', 'create', 'update', 'delete', 'restore'].map(action => (
                                    <label className="user-setting__popup-label" key={action}>
                                        <input type="checkbox" checked={Array.isArray(editUserDetail?.actions) && editUserDetail.actions.includes(action)} onChange={e => {
                                            let newActions = Array.isArray(editUserDetail?.actions) ? [...editUserDetail.actions] : [];
                                            if (e.target.checked) {
                                                if (!newActions.includes(action)) newActions.push(action);
                                            } else {
                                                newActions = newActions.filter(a => a !== action);
                                            }
                                            setEditUserDetail({ ...editUserDetail, actions: newActions });
                                        }} /> {
                                            action === 'read' ? 'Xem' :
                                                action === 'create' ? 'Thêm' :
                                                    action === 'update' ? 'Sửa' :
                                                        action === 'delete' ? 'Xóa' :
                                                            action === 'restore' ? 'Khôi phục' : action
                                        }
                                    </label>
                                ))}
                                {editUserDetail?.actionsError && <span className="user-popup__error">Chọn ít nhất 1 quyền!</span>}
                            </div>
                        ) : (
                            Array.isArray(userDetail.actions) && userDetail.actions.length > 0
                                ? userDetail.actions.map(a => {
                                    switch (a) {
                                        case 'read': return 'Xem';
                                        case 'create': return 'Thêm';
                                        case 'update': return 'Sửa';
                                        case 'delete': return 'Xóa';
                                        case 'restore': return 'Khôi phục';
                                        default: return a;
                                    }
                                }).join(', ')
                                : '-'
                        )}
                        </div>
                        <div className="user-setting__popup-row"><b>Nhà hàng:</b> {isEditUser ? (
                            editUserDetail?.role === 'admin' ? (
                                <span>-</span>
                            ) : (
                                <select className="user-setting__popup-select" value={editUserDetail?.restaurant || ''} onChange={e => setEditUserDetail({ ...editUserDetail, restaurant: e.target.value })}>
                                    <option value="">Chọn nhà hàng</option>
                                    {restaurants.map(r => (
                                        <option key={r._id} value={r._id}>{r.name}</option>
                                    ))}
                                </select>
                            )
                        ) : userDetail.restaurantName}
                        </div>
                        <div className="user-setting__popup-row"><b>Trạng thái:</b> {userDetail.isActive ? 'Đang hoạt động' : 'Đã khóa'}</div>
                        <div className="user-setting__popup-row"><b>Ngày tạo:</b> {userDetail.createdAt ? new Date(userDetail.createdAt).toLocaleString('vi-VN') : '-'}</div>
                        <div className="user-setting__popup-row"><b>Ngày cập nhật:</b> {userDetail.updatedAt ? new Date(userDetail.updatedAt).toLocaleString('vi-VN') : '-'}</div>
                        <div className="user-setting__popup-actions">
                            {!isEditUser && (
                                <button className="user-setting__button" onClick={() => {
                                    setIsEditUser(true);
                                    setEditUserDetail({ ...userDetail });
                                }}>Sửa</button>
                            )}
                            {isEditUser && (
                                <button className="user-setting__button" onClick={handleUpdateUser}>Lưu</button>
                            )}
                            {isEditUser && (
                                <button className="user-setting__button" onClick={() => {
                                    setIsEditUser(false);
                                    setEditUserDetail(null);
                                }}>Hủy</button>
                            )}
                            {!isEditUser && (
                                userDetail.isActive ? (
                                    <button className="user-setting__button" onClick={() => handleDeleteUser(userDetail._id)}>Đóng tài khoản</button>
                                ) : (
                                    <button className="user-setting__button" onClick={() => handleRestoreUser(userDetail._id)}>Mở tài khoản</button>
                                )
                            )}
                            {!isEditUser && (
                                <button className="user-setting__button" onClick={() => setShowUserDetail(false)}>Đóng</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Popup thêm user */}
            {showAddUser && (
                <div className="user-setting__popup-bg">
                    <div className="user-setting__popup">
                        <h3 className="user-setting__popup-title">Thêm người dùng</h3>
                        <div className="user-setting__popup-row">
                            <b>Tên đăng nhập:</b><br />
                            <input className="user-setting__popup-input" value={form.username} onChange={e => handleChange('username', e.target.value)} placeholder="Nhập tên đăng nhập" />
                            {err.username && <span className="user-popup__error">Bắt buộc!</span>}
                        </div>
                        <div className="user-setting__popup-row">
                            <b>Mật khẩu:</b><br />
                            <input className="user-setting__popup-input" type="password" value={form.password} onChange={e => handleChange('password', e.target.value)} placeholder="Nhập mật khẩu" />
                            {err.password && <span className="user-popup__error">Bắt buộc!</span>}
                        </div>
                        <div className="user-setting__popup-row">
                            <b>Họ tên:</b><br />
                            <input className="user-setting__popup-input" value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Nhập họ tên" />
                            {err.name && <span className="user-popup__error">Bắt buộc!</span>}
                        </div>
                        <div className="user-setting__popup-row">
                            <b>Chức vụ:</b><br />
                            <div className="user-setting__popup-group">
                                {['admin', 'manager', 'staff'].map(role => (
                                    <label className="user-setting__popup-label" key={role}>
                                        <input type="checkbox" checked={form.role === role} onChange={() => handleCheckRole(role)} /> {role}
                                    </label>
                                ))}
                                {err.role && <span className="user-popup__error">Chọn 1 chức vụ!</span>}
                            </div>
                        </div>
                        <div className="user-setting__popup-row">
                            <b>Quyền thao tác:</b><br />
                            <div className="user-setting__popup-group">
                                {['read', 'create', 'update', 'delete', 'restore'].map(action => (
                                    <label className="user-setting__popup-label" key={action}>
                                        <input type="checkbox" checked={form.actions.includes(action)} onChange={e => handleCheckAction(action, e.target.checked)} /> {
                                            action === 'read' ? 'Xem' :
                                                action === 'create' ? 'Thêm' :
                                                    action === 'update' ? 'Sửa' :
                                                        action === 'delete' ? 'Xóa' :
                                                            action === 'restore' ? 'Khôi phục' : action
                                        }
                                    </label>
                                ))}
                                {err.actions && <span className="user-popup__error">Chọn ít nhất 1 quyền!</span>}
                            </div>
                        </div>
                        <div className="user-setting__popup-row">
                            <b>Nhà hàng:</b><br />
                            {form.role === 'admin' ? (
                                <span>-</span>
                            ) : (
                                <select className="user-setting__popup-select" value={form.restaurant} onChange={e => handleChange('restaurant', e.target.value)}>
                                    <option value="">Chọn nhà hàng</option>
                                    {restaurants.map(r => (
                                        <option key={r._id} value={r._id}>{r.name}</option>
                                    ))}
                                </select>
                            )}
                            {err.restaurant && <span className="user-popup__error">Bắt buộc!</span>}
                        </div>
                        <div className="user-setting__popup-row">
                            <b>Trạng thái:</b>
                            <label className="user-setting__popup-label" style={{ marginLeft: 8 }}>
                                <input type="checkbox" checked={form.isActive} onChange={e => handleChange('isActive', e.target.checked)} /> Đang hoạt động
                            </label>
                        </div>
                        <div className="user-setting__popup-actions">
                            <button className="user-setting__button" onClick={handleSubmitAddUser}>Lưu</button>
                            <button className="user-setting__button" style={{ marginLeft: 8 }} onClick={() => { setShowAddUser(false); setForm({ username: '', password: '', name: '', role: '', actions: [], restaurant: '', isActive: true }); setErr({}); }}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default User;
