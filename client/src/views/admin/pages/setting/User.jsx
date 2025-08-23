import React, { useEffect, useState, useCallback } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../../../api/user';
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
        // Bổ sung trường roles (mảng) cho backend
        submitUser.roles = [user.role];
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

    const handleDeleteUser = async (userId) => {
        await deleteUser(userId, token);
        fetchData();
    };

    // State cho form thêm user
    const [form, setForm] = useState({
        username: '',
        password: '',
        name: '',
        role: '',
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
        setForm({ username: '', password: '', name: '', role: '', actions: [], restaurant: '', isActive: true });
        setErr({});
    };

    return (
        <div>
            {/* Nút thêm người dùng và bộ lọc role, nhà hàng */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                <div>
                    <button onClick={() => setShowAddUser(true)} style={{ marginRight: 16 }}>Thêm người dùng</button>
                </div>
                <div>
                    <select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ marginRight: 8 }}>
                        <option value="">Tất cả quyền</option>
                        <option value="admin">admin</option>
                        <option value="manager">manager</option>
                        <option value="staff">staff</option>
                    </select>
                    <select value={filterRestaurant} onChange={e => setFilterRestaurant(e.target.value)}>
                        <option value="">Tất cả nhà hàng</option>
                        {restaurants.map(r => (
                            <option key={r._id} value={r._id}>{r.name}</option>
                        ))}
                    </select>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Tên đăng nhập</th>
                        <th>Họ tên</th>
                        <th>Chức vụ</th>
                        <th>Nhà hàng</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user._id}>
                            <td>{user.username}</td>
                            <td>{user.name || '-'}</td>
                            <td>{user.role || '-'}</td>
                            <td>{user.restaurantName}</td>
                            <td>{user.isActive ? 'Đang hoạt động' : 'Đã khóa'}</td>
                            <td>{user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : '-'}</td>
                            <td>
                                <button onClick={() => { setUserDetail(user); setShowUserDetail(true); }}>Chi tiết</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Popup chi tiết/sửa user */}
            {showUserDetail && userDetail && (
                <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.2)', zIndex: 1000 }}>
                    <div style={{ background: '#fff', maxWidth: 400, margin: '60px auto', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px #0002' }}>
                        <h3>Chi tiết người dùng</h3>
                        <div><b>Tên đăng nhập:</b> {userDetail.username}</div>
                        <div><b>Họ tên:</b> {isEditUser ? (
                            <input
                                value={editUserDetail?.name || ''}
                                onChange={e => setEditUserDetail({ ...editUserDetail, name: e.target.value })}
                                placeholder="Nhập họ tên"
                            />
                        ) : (userDetail.name || '-')}
                        </div>
                        <div><b>Chức vụ:</b> {isEditUser ? (
                            <div>
                                {['admin', 'manager', 'staff'].map(role => (
                                    <label key={role} style={{ marginRight: 12 }}>
                                        <input
                                            type="checkbox"
                                            checked={editUserDetail?.role === role}
                                            onChange={() => setEditUserDetail({ ...editUserDetail, role })}
                                        /> {role}
                                    </label>
                                ))}
                                {editUserDetail?.roleError && <span className="user-popup__error">Chọn 1 chức vụ!</span>}
                            </div>
                        ) : (userDetail.role || '-')}
                        </div>
                        <div><b>Quyền thao tác:</b> {isEditUser ? (
                            <div>
                                {['read', 'create', 'update', 'delete', 'restore'].map(action => (
                                    <label key={action} style={{ marginRight: 12 }}>
                                        <input
                                            type="checkbox"
                                            checked={Array.isArray(editUserDetail?.actions) && editUserDetail.actions.includes(action)}
                                            onChange={e => {
                                                let newActions = Array.isArray(editUserDetail?.actions) ? [...editUserDetail.actions] : [];
                                                if (e.target.checked) {
                                                    if (!newActions.includes(action)) newActions.push(action);
                                                } else {
                                                    newActions = newActions.filter(a => a !== action);
                                                }
                                                setEditUserDetail({ ...editUserDetail, actions: newActions });
                                            }}
                                        /> {
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
                        <div><b>Nhà hàng:</b> {isEditUser ? (
                            editUserDetail?.role === 'admin' ? (
                                <span>-</span>
                            ) : (
                                <select
                                    value={editUserDetail?.restaurant || ''}
                                    onChange={e => setEditUserDetail({ ...editUserDetail, restaurant: e.target.value })}
                                >
                                    <option value="">Chọn nhà hàng</option>
                                    {restaurants.map(r => (
                                        <option key={r._id} value={r._id}>{r.name}</option>
                                    ))}
                                </select>
                            )
                        ) : userDetail.restaurantName}
                        </div>
                        <div><b>Trạng thái:</b> {userDetail.isActive ? 'Đang hoạt động' : 'Đã khóa'}</div>
                        <div><b>Ngày tạo:</b> {userDetail.createdAt ? new Date(userDetail.createdAt).toLocaleString('vi-VN') : '-'}</div>
                        <div><b>Ngày cập nhật:</b> {userDetail.updatedAt ? new Date(userDetail.updatedAt).toLocaleString('vi-VN') : '-'}</div>
                        <div style={{ marginTop: 16, textAlign: 'right' }}>
                            {!isEditUser && (
                                <button onClick={() => {
                                    setIsEditUser(true);
                                    // Khởi tạo dữ liệu chỉnh sửa
                                    setEditUserDetail({ ...userDetail });
                                }}>Sửa</button>
                            )}
                            {isEditUser && (
                                <button onClick={handleUpdateUser}>Lưu</button>
                            )}
                            {isEditUser && (
                                <button onClick={() => {
                                    setIsEditUser(false);
                                    setEditUserDetail(null);
                                }}>Hủy</button>
                            )}
                            {!isEditUser && (
                                <button onClick={() => { }}>Xóa</button>
                            )}
                            {!isEditUser && (
                                <button onClick={() => setShowUserDetail(false)}>Đóng</button>
                            )}

                        </div>
                    </div>
                </div>
            )}
            {/* Popup thêm user */}
            {showAddUser && (
                <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.2)', zIndex: 1000 }}>
                    <div style={{ background: '#fff', maxWidth: 400, margin: '60px auto', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px #0002' }}>
                        <h3>Thêm người dùng</h3>
                        <div style={{ marginBottom: 8 }}>
                            <b>Tên đăng nhập:</b><br />
                            <input value={form.username} onChange={e => handleChange('username', e.target.value)} placeholder="Nhập tên đăng nhập" />
                            {err.username && <span>Bắt buộc!</span>}
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <b>Mật khẩu:</b><br />
                            <input type="password" value={form.password} onChange={e => handleChange('password', e.target.value)} placeholder="Nhập mật khẩu" />
                            {err.password && <span>Bắt buộc!</span>}
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <b>Họ tên:</b><br />
                            <input value={form.name} onChange={e => handleChange('name', e.target.value)} placeholder="Nhập họ tên" />
                            {err.name && <span>Bắt buộc!</span>}
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <b>Chức vụ:</b><br />
                            {['admin', 'manager', 'staff'].map(role => (
                                <label key={role} style={{ marginRight: 12 }}>
                                    <input type="checkbox" checked={form.role === role} onChange={() => handleCheckRole(role)} /> {role}
                                </label>
                            ))}
                            {err.role && <span>Chọn 1 chức vụ!</span>}
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <b>Quyền thao tác:</b><br />
                            {['read', 'create', 'update', 'delete', 'restore'].map(action => (
                                <label key={action} style={{ marginRight: 12 }}>
                                    <input type="checkbox" checked={form.actions.includes(action)} onChange={e => handleCheckAction(action, e.target.checked)} /> {
                                        action === 'read' ? 'Xem' :
                                            action === 'create' ? 'Thêm' :
                                                action === 'update' ? 'Sửa' :
                                                    action === 'delete' ? 'Xóa' :
                                                        action === 'restore' ? 'Khôi phục' : action
                                    }
                                </label>
                            ))}
                            {err.actions && <span>Chọn ít nhất 1 quyền!</span>}
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <b>Nhà hàng:</b><br />
                            {form.role === 'admin' ? (
                                <span>-</span>
                            ) : (
                                <select value={form.restaurant} onChange={e => handleChange('restaurant', e.target.value)}>
                                    <option value="">Chọn nhà hàng</option>
                                    {restaurants.map(r => (
                                        <option key={r._id} value={r._id}>{r.name}</option>
                                    ))}
                                </select>
                            )}
                            {err.restaurant && <span>Bắt buộc!</span>}
                        </div>
                        <div style={{ marginBottom: 8 }}>
                            <b>Trạng thái:</b>
                            <label style={{ marginLeft: 8 }}>
                                <input type="checkbox" checked={form.isActive} onChange={e => handleChange('isActive', e.target.checked)} /> Đang hoạt động
                            </label>
                        </div>
                        <div style={{ marginTop: 16, textAlign: 'right' }}>
                            <button onClick={handleSubmitAddUser}>Lưu</button>
                            <button style={{ marginLeft: 8 }} onClick={() => { setShowAddUser(false); setForm({ username: '', password: '', name: '', role: '', actions: [], restaurant: '', isActive: true }); setErr({}); }}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default User;
