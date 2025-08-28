import React, { useEffect, useState, useCallback } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../../../api/user';
import { getRestaurants } from '../../../api/restaurant';
import './CrudUsers.css';

function CrudUsers({ token }) {
	// State popup chi tiết/sửa user
	const [showUserDetail, setShowUserDetail] = useState(false);
	const [selectedUser, setSelectedUser] = useState(null);
	const [isEditUser, setIsEditUser] = useState(false);
	const [editUserForm, setEditUserForm] = useState({ username: '', password: '', roles: ['staff'], actions: [], name: '', phone: '', restaurant: '', isActive: true });
	// State danh sách user
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);
	// Bộ lọc
	const [filterRole, setFilterRole] = useState('');
	const [filterRestaurant, setFilterRestaurant] = useState('');
	// Danh sách nhà hàng
	const [restaurantList, setRestaurantList] = useState([]);
	// Thông báo
	const [message, setMessage] = useState('');
	// Popup thêm mới
	const [showAddPopup, setShowAddPopup] = useState(false);
	const [addForm, setAddForm] = useState({ username: '', password: '', roles: ['staff'], actions: [], name: '', phone: '', restaurant: '', isActive: true });

	// Lấy danh sách nhà hàng
	useEffect(() => {
		const fetchRestaurants = async () => {
			try {
				const res = await getRestaurants(token);
				if (Array.isArray(res)) setRestaurantList(res);
			} catch {}
		};
		fetchRestaurants();
	}, [token]);

	// Lấy danh sách user
	const fetchUsers = useCallback(async () => {
		setLoading(true);
		try {
			const res = await getUsers(token);
			setUsers(Array.isArray(res) ? res : []);
		} catch {}
		setLoading(false);
	}, [token]);
	useEffect(() => { fetchUsers(); }, [fetchUsers]);

	// Lọc user
	const filteredUsers = users.filter(u => {
		let matchRole = true;
		let matchRes = true;
		// roles có thể là undefined/null/string nên ép về mảng
		const userRoles = Array.isArray(u.roles) ? u.roles : (u.role ? [u.role] : []);
		if (filterRole) matchRole = userRoles.includes(filterRole);
		if (filterRestaurant) {
			const rid = typeof u.restaurant === 'object' ? u.restaurant._id : u.restaurant;
			matchRes = rid === filterRestaurant;
		}
		return matchRole && matchRes;
	});

	// Mở popup chi tiết user
	const openUserDetail = (user) => {
		setSelectedUser(user);
		setShowUserDetail(true);
		setIsEditUser(false);
		setEditUserForm({
			username: user.username,
			password: '',
			roles: Array.isArray(user.roles) ? user.roles : (user.role ? [user.role] : ['staff']),
			actions: Array.isArray(user.actions) ? user.actions : [],
			name: user.name || '',
			phone: user.phone || '',
			restaurant: user.restaurant || '',
			isActive: typeof user.isActive === 'boolean' ? user.isActive : true
		});
		setMessage('');
	};

	// Lưu user khi chỉnh sửa
		const handleUpdateUser = async () => {
			if (!editUserForm.username) return setMessage('Tên đăng nhập không được để trống!');
			setLoading(true);
			const submitForm = { ...editUserForm };
			if (!submitForm.password) delete submitForm.password;
			if (submitForm.roles.includes('admin')) delete submitForm.restaurant;
			const res = await updateUser(selectedUser._id, submitForm, token);
			setLoading(false);
			setMessage(res._id ? 'Cập nhật thành công!' : res.error || 'Lỗi');
			if (res._id) {
				setIsEditUser(false);
				fetchUsers();
				setSelectedUser({ ...selectedUser, ...submitForm });
			}
		};

	// Xóa user
	const handleDeleteUser = async (id) => {
		if (!window.confirm('Bạn có chắc muốn xóa người dùng này?')) return;
		setLoading(true);
		await deleteUser(id, token);
		setLoading(false);
		setShowUserDetail(false);
		setMessage('');
		fetchUsers();
	};

	// Mở popup thêm mới
	const openAddUser = () => {
		setShowAddPopup(true);
		setAddForm({ username: '', password: '', role: 'staff', name: '', phone: '', restaurant: '', isActive: true });
		setMessage('');
	};
	// Lưu user mới
		const handleAddUser = async (e) => {
			e.preventDefault();
			if (!addForm.username || !addForm.password) return setMessage('Vui lòng nhập tên đăng nhập và mật khẩu!');
			setLoading(true);
			const submitForm = { ...addForm };
			if (submitForm.roles.includes('admin')) delete submitForm.restaurant;
			const res = await createUser(submitForm, token);
			setLoading(false);
			setMessage(res._id ? 'Thêm thành công!' : res.error || 'Lỗi');
			if (res._id) {
				setShowAddPopup(false);
				fetchUsers();
			}
		};

	return (
		<div className="userCrud">
			<h2 className="userCrud__title">Quản lý người dùng</h2>
			<div className="userCrud__filterRow">
				<select className="userCrud__filterSelect" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
					<option value="">Tất cả quyền</option>
					<option value="admin">Admin</option>
					<option value="manager">Quản lý</option>
					<option value="staff">Nhân viên</option>
				</select>
				<select className="userCrud__filterSelect" value={filterRestaurant} onChange={e => setFilterRestaurant(e.target.value)}>
					<option value="">Tất cả nhà hàng</option>
					{restaurantList.map(r => (
						<option key={r._id} value={r._id}>{r.name}</option>
					))}
				</select>
				<button className="userCrud__addBtn" onClick={openAddUser}>Thêm người dùng</button>
			</div>
			<div className="userCrud__tableWrap">
				<table className="userCrud__table">
					<thead>
						<tr>
							<th className="userCrud__th">Tên đăng nhập</th>
							<th className="userCrud__th">Họ tên</th>
							<th className="userCrud__th">Số điện thoại</th>
							<th className="userCrud__th">Vai trò</th>
							<th className="userCrud__th">Nhà hàng</th>
							<th className="userCrud__th">Trạng thái</th>
							<th className="userCrud__th">Ngày tạo</th>
							<th className="userCrud__th">Hành động</th>
						</tr>
					</thead>
					<tbody>
						{loading ? <tr><td colSpan={8}>Đang tải...</td></tr> : filteredUsers.length === 0 ? <tr><td colSpan={8}>Không có người dùng phù hợp.</td></tr> : filteredUsers.map(u => (
							<tr key={u._id} className="userCrud__tr">
								<td className="userCrud__td">{u.username}</td>
								<td className="userCrud__td">{u.name || '-'}</td>
								<td className="userCrud__td">{u.phone || '-'}</td>
								<td className="userCrud__td">{u.role === 'admin' ? 'Admin' : u.role === 'manager' ? 'Quản lý' : 'Nhân viên'}</td>
								<td className="userCrud__td">{
									(() => {
										if (!u.restaurant) return '-';
										if (typeof u.restaurant === 'object' && u.restaurant.name) return u.restaurant.name;
										const found = restaurantList.find(r => r._id === u.restaurant);
										return found ? found.name : u.restaurant;
									})()
								}</td>
								<td className={"userCrud__td userCrud__td--status " + (u.isActive ? 'userCrud__td--active' : 'userCrud__td--inactive')}>
									{u.isActive ? 'Đang hoạt động' : 'Đã khóa'}
								</td>
								<td className="userCrud__td">{u.createdAt ? new Date(u.createdAt).toLocaleString('vi-VN') : '-'}</td>
								<td className="userCrud__td userCrud__td--action">
									<button className="userCrud__detailBtn" onClick={() => openUserDetail(u)} title="Chi tiết">Chi tiết</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Popup chi tiết/sửa user */}
			{showUserDetail && selectedUser && (
				<div className="userCrud__popupOverlay">
					<div className="userCrud__popupBox">
						<div className="userCrud__popupTitle">{isEditUser ? 'Cập nhật người dùng' : 'Chi tiết người dùng'}</div>
						{!isEditUser ? (
							<>
								   <div className="userCrud__popupDetail">
									   <div><b>Tên đăng nhập:</b> {selectedUser.username}</div>
									   <div><b>Họ tên:</b> {selectedUser.name || '-'}</div>
									   <div><b>Số điện thoại:</b> {selectedUser.phone || '-'}</div>
									   <div><b>Vai trò:</b> {
										   Array.isArray(selectedUser.roles) && selectedUser.roles.length > 0
											   ? selectedUser.roles.map(r => r === 'admin' ? 'Admin' : r === 'manager' ? 'Quản lý' : 'Nhân viên').join(', ')
											   : (selectedUser.role === 'admin' ? 'Admin' : selectedUser.role === 'manager' ? 'Quản lý' : 'Nhân viên')
									   }</div>
									   <div><b>Quyền thao tác:</b> {
										   Array.isArray(selectedUser.actions) && selectedUser.actions.length > 0
											   ? selectedUser.actions.map(a => {
												   switch(a) {
													   case 'read': return 'Xem';
													   case 'create': return 'Thêm';
													   case 'update': return 'Sửa';
													   case 'delete': return 'Xóa';
													   case 'restore': return 'Khôi phục';
													   default: return a;
												   }
											   }).join(', ')
											   : '-'
									   }</div>
									   <div><b>Nhà hàng:</b> {
										   (Array.isArray(selectedUser.roles) && selectedUser.roles.includes('admin')) || selectedUser.role === 'admin'
											   ? '-'
											   : (() => {
												   if (!selectedUser.restaurant) return '-';
												   const found = restaurantList.find(r => r._id === selectedUser.restaurant || (typeof selectedUser.restaurant === 'object' && r._id === selectedUser.restaurant._id));
												   return found ? found.name : (typeof selectedUser.restaurant === 'object' && selectedUser.restaurant.name ? selectedUser.restaurant.name : selectedUser.restaurant);
											   })()
									   }</div>
									   <div><b>Trạng thái:</b> {selectedUser.isActive ? 'Đang hoạt động' : 'Đã khóa'}</div>
									   <div><b>Ngày tạo:</b> {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString('vi-VN') : '-'}</div>
									   <div><b>Ngày cập nhật:</b> {selectedUser.updatedAt ? new Date(selectedUser.updatedAt).toLocaleString('vi-VN') : '-'}</div>
								   </div>
								<div className="userCrud__popupActions">
									<button className="userCrud__popupBtn userCrud__popupBtn--edit" type="button" onClick={() => setIsEditUser(true)}>Sửa</button>
									<button className="userCrud__popupBtn userCrud__popupBtn--delete" type="button" onClick={() => handleDeleteUser(selectedUser._id)}>Xóa</button>
									<button className="userCrud__popupBtn userCrud__popupBtn--cancel" type="button" onClick={() => setShowUserDetail(false)}>Đóng</button>
								</div>
								<div className="userCrud__msgPopup">{message}</div>
							</>
						) : (
							<form className="userCrud__popupForm" onSubmit={e => { e.preventDefault(); handleUpdateUser(); }}>
								<input
									className="userCrud__input"
									type="text"
									placeholder="Tên đăng nhập"
									value={editUserForm.username}
									onChange={e => setEditUserForm({ ...editUserForm, username: e.target.value })}
									required
									disabled
								/>
								<input
									className="userCrud__input"
									type="password"
									placeholder="Mật khẩu mới (bỏ trống nếu không đổi)"
									value={editUserForm.password}
									onChange={e => setEditUserForm({ ...editUserForm, password: e.target.value })}
								/>
								<input
									className="userCrud__input"
									type="text"
									placeholder="Họ tên người dùng"
									value={editUserForm.name}
									onChange={e => setEditUserForm({ ...editUserForm, name: e.target.value })}
								/>
								<input
									className="userCrud__input"
									type="text"
									placeholder="Số điện thoại"
									value={editUserForm.phone}
									onChange={e => setEditUserForm({ ...editUserForm, phone: e.target.value })}
								/>
												{/* Chọn roles (đa lựa chọn) */}
												<div style={{ marginBottom: 8 }}>
													<label><b>Vai trò:</b></label><br />
													<label><input type="checkbox" checked={Array.isArray(editUserForm.roles) && editUserForm.roles.includes('staff')} onChange={e => {
														const checked = e.target.checked;
														setEditUserForm(f => ({ ...f, roles: checked ? Array.from(new Set([...f.roles, 'staff'])) : f.roles.filter(r => r !== 'staff') }));
													}} /> Nhân viên</label>
													<label style={{ marginLeft: 12 }}><input type="checkbox" checked={Array.isArray(editUserForm.roles) && editUserForm.roles.includes('manager')} onChange={e => {
														const checked = e.target.checked;
														setEditUserForm(f => ({ ...f, roles: checked ? Array.from(new Set([...f.roles, 'manager'])) : f.roles.filter(r => r !== 'manager') }));
													}} /> Quản lý</label>
													<label style={{ marginLeft: 12 }}><input type="checkbox" checked={Array.isArray(editUserForm.roles) && editUserForm.roles.includes('admin')} onChange={e => {
														const checked = e.target.checked;
														setEditUserForm(f => ({ ...f, roles: checked ? Array.from(new Set([...f.roles, 'admin'])) : f.roles.filter(r => r !== 'admin') }));
													}} /> Admin</label>
												</div>
												{/* Chọn actions (đa lựa chọn) */}
												<div style={{ marginBottom: 8 }}>
													<label><b>Quyền thao tác:</b></label><br />
													<label><input type="checkbox" checked={Array.isArray(editUserForm.actions) && editUserForm.actions.includes('view')} onChange={e => {
														const checked = e.target.checked;
														setEditUserForm(f => ({ ...f, actions: checked ? Array.from(new Set([...f.actions, 'view'])) : f.actions.filter(a => a !== 'view') }));
													}} /> Xem</label>
													<label style={{ marginLeft: 12 }}><input type="checkbox" checked={Array.isArray(editUserForm.actions) && editUserForm.actions.includes('edit')} onChange={e => {
														const checked = e.target.checked;
														setEditUserForm(f => ({ ...f, actions: checked ? Array.from(new Set([...f.actions, 'edit'])) : f.actions.filter(a => a !== 'edit') }));
													}} /> Sửa</label>
													<label style={{ marginLeft: 12 }}><input type="checkbox" checked={Array.isArray(editUserForm.actions) && editUserForm.actions.includes('delete')} onChange={e => {
														const checked = e.target.checked;
														setEditUserForm(f => ({ ...f, actions: checked ? Array.from(new Set([...f.actions, 'delete'])) : f.actions.filter(a => a !== 'delete') }));
													}} /> Xóa</label>
												</div>
												{/* Chọn nhà hàng nếu không phải admin */}
												{Array.isArray(editUserForm.roles) && !editUserForm.roles.includes('admin') && (
													<select
														className="userCrud__input"
														value={editUserForm.restaurant}
														onChange={e => setEditUserForm({ ...editUserForm, restaurant: e.target.value })}
														required
													>
														<option value="">-- Chọn nhà hàng --</option>
														{restaurantList.map(r => (
															<option key={r._id} value={r._id}>{r.name}</option>
														))}
													</select>
												)}
								<div className="userCrud__popupActions">
									<button className="userCrud__popupBtn userCrud__popupBtn--edit" type="submit">Lưu</button>
									<button className="userCrud__popupBtn userCrud__popupBtn--cancel" type="button" onClick={() => setIsEditUser(false)}>Hủy</button>
								</div>
								<div className="userCrud__msgPopup">{message}</div>
							</form>
						)}
					</div>
				</div>
			)}

			{/* Popup thêm mới user */}
			{showAddPopup && (
				<div className="userCrud__popupOverlay">
					<div className="userCrud__popupBox">
						<div className="userCrud__popupTitle">Thêm mới người dùng</div>
						<form className="userCrud__popupForm" onSubmit={handleAddUser}>
							<input
								className="userCrud__input"
								type="text"
								placeholder="Tên đăng nhập"
								value={addForm.username}
								onChange={e => setAddForm({ ...addForm, username: e.target.value })}
								required
							/>
							<input
								className="userCrud__input"
								type="password"
								placeholder="Mật khẩu"
								value={addForm.password}
								onChange={e => setAddForm({ ...addForm, password: e.target.value })}
								required
							/>
							<input
								className="userCrud__input"
								type="text"
								placeholder="Họ tên người dùng"
								value={addForm.name}
								onChange={e => setAddForm({ ...addForm, name: e.target.value })}
							/>
							<input
								className="userCrud__input"
								type="text"
								placeholder="Số điện thoại"
								value={addForm.phone}
								onChange={e => setAddForm({ ...addForm, phone: e.target.value })}
							/>
											{/* Chọn roles (đa lựa chọn) */}
											<div style={{ marginBottom: 8 }}>
												<label><b>Vai trò:</b></label><br />
												<label><input type="checkbox" checked={Array.isArray(addForm.roles) && addForm.roles.includes('staff')} onChange={e => {
													const checked = e.target.checked;
													setAddForm(f => ({ ...f, roles: checked ? Array.from(new Set([...f.roles, 'staff'])) : f.roles.filter(r => r !== 'staff') }));
												}} /> Nhân viên</label>
												<label style={{ marginLeft: 12 }}><input type="checkbox" checked={Array.isArray(addForm.roles) && addForm.roles.includes('manager')} onChange={e => {
													const checked = e.target.checked;
													setAddForm(f => ({ ...f, roles: checked ? Array.from(new Set([...f.roles, 'manager'])) : f.roles.filter(r => r !== 'manager') }));
												}} /> Quản lý</label>
												<label style={{ marginLeft: 12 }}><input type="checkbox" checked={Array.isArray(addForm.roles) && addForm.roles.includes('admin')} onChange={e => {
													const checked = e.target.checked;
													setAddForm(f => ({ ...f, roles: checked ? Array.from(new Set([...f.roles, 'admin'])) : f.roles.filter(r => r !== 'admin') }));
												}} /> Admin</label>
											</div>
											{/* Chọn actions (đa lựa chọn) */}
											<div style={{ marginBottom: 8 }}>
												<label><b>Quyền thao tác:</b></label><br />
												<label><input type="checkbox" checked={Array.isArray(addForm.actions) && addForm.actions.includes('view')} onChange={e => {
													const checked = e.target.checked;
													setAddForm(f => ({ ...f, actions: checked ? Array.from(new Set([...f.actions, 'view'])) : f.actions.filter(a => a !== 'view') }));
												}} /> Xem</label>
												<label style={{ marginLeft: 12 }}><input type="checkbox" checked={Array.isArray(addForm.actions) && addForm.actions.includes('edit')} onChange={e => {
													const checked = e.target.checked;
													setAddForm(f => ({ ...f, actions: checked ? Array.from(new Set([...f.actions, 'edit'])) : f.actions.filter(a => a !== 'edit') }));
												}} /> Sửa</label>
												<label style={{ marginLeft: 12 }}><input type="checkbox" checked={Array.isArray(addForm.actions) && addForm.actions.includes('delete')} onChange={e => {
													const checked = e.target.checked;
													setAddForm(f => ({ ...f, actions: checked ? Array.from(new Set([...f.actions, 'delete'])) : f.actions.filter(a => a !== 'delete') }));
												}} /> Xóa</label>
											</div>
											{/* Chọn nhà hàng nếu không phải admin */}
											{Array.isArray(addForm.roles) && !addForm.roles.includes('admin') && (
												<select
													className="userCrud__input"
													value={addForm.restaurant}
													onChange={e => setAddForm({ ...addForm, restaurant: e.target.value })}
													required
												>
													<option value="">-- Chọn nhà hàng --</option>
													{restaurantList.map(r => (
														<option key={r._id} value={r._id}>{r.name}</option>
													))}
												</select>
											)}
							<div className="userCrud__popupActions">
								<button className="userCrud__popupBtn userCrud__popupBtn--edit" type="submit">Lưu</button>
								<button className="userCrud__popupBtn userCrud__popupBtn--cancel" type="button" onClick={() => setShowAddPopup(false)}>Hủy</button>
							</div>
							<div className="userCrud__msgPopup">{message}</div>
						</form>
					</div>
				</div>
			)}

			<div className="userCrud__msgMain">{message}</div>
		</div>
	);
}

export default CrudUsers;
