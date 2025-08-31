import React, { useEffect, useState, useCallback } from 'react';
import {
    getPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod
} from '../../../../api/payment';
import './css/payment.css';

function PaymentMethod({ token }) {
    const [methods, setMethods] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDetail, setShowDetail] = useState(false);
    const [detail, setDetail] = useState(null);
    const [isEdit, setIsEdit] = useState(false);
    const [editDetail, setEditDetail] = useState(null);
    const [showAdd, setShowAdd] = useState(false);

    const bankList = [
        { code: '970415', name: 'VietinBank' },
        { code: '970436', name: 'Vietcombank' },
        { code: '970418', name: 'BIDV' },
        { code: '970405', name: 'Agribank' },
        { code: '970448', name: 'OCB' },
        { code: '970422', name: 'MBBank' },
        { code: '970407', name: 'Techcombank' },
        { code: '970416', name: 'ACB' },
        { code: '970432', name: 'VPBank' },
        { code: '970423', name: 'TPBank' },
        { code: '970403', name: 'Sacombank' },
        { code: '970437', name: 'HDBank' },
        { code: '970454', name: 'VietCapitalBank' },
        { code: '970429', name: 'SCB' },
        { code: '970441', name: 'VIB' },
        { code: '970443', name: 'SHB' },
    ];

    const [addDetail, setAddDetail] = useState({
        name: 'bank',
        description: '',
        accountNumber: '',
        bankName: '',
        bankCode: '',
        accountHolder: '',
        template: 'compact',
        active: true
    });

    const fetchMethods = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getPaymentMethods(token);
            if (Array.isArray(res)) setMethods(res);
            else setMethods([]);
        } catch {
            setMethods([]);
        }
        setLoading(false);
    }, [token]);

    useEffect(() => { fetchMethods(); }, [token, fetchMethods]);

    // Khi xem/sửa chi tiết, lấy từ danh sách methods (không gọi API nữa)
    const handleShowDetail = (id) => {
        const found = methods.find(m => m._id === id);
        if (found) {
            setDetail(found);
            setShowDetail(true);
            setIsEdit(false);
            setEditDetail(null);
        } else {
            setDetail(null);
            setShowDetail(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Xác nhận xóa phương thức thanh toán này?')) {
            setLoading(true);
            await deletePaymentMethod(id, token);
            setLoading(false);
            setShowDetail(false);
            fetchMethods();
        }
    };

    const handleUpdate = async () => {
        if (!editDetail.name) {
            alert('Vui lòng nhập tên phương thức!');
            return;
        }
        setLoading(true);
        await updatePaymentMethod(editDetail._id, editDetail, token);
        setLoading(false);
        setIsEdit(false);
        setEditDetail(null);
        setShowDetail(false);
        fetchMethods();
    };

    const handleAdd = async () => {
        if (!addDetail.name) {
            alert('Vui lòng nhập tên phương thức!');
            return;
        }
        setLoading(true);
        await createPaymentMethod(addDetail, token);
        setLoading(false);
        setShowAdd(false);
        setAddDetail({
            name: '',
            description: '',
            accountNumber: '',
            bankName: '',
            bankCode: '',
            accountHolder: '',
            active: true
        });
        fetchMethods();
    };

    return (
        <div className="paymentManager">
            <h2 className="paymentManager__title">Quản lý phương thức thanh toán</h2>
            <div className="paymentManager__header">
                <button className="paymentManager__addBtn" onClick={() => setShowAdd(true)}>Thêm phương thức</button>
            </div>
            <div className="paymentManager__list">
                {loading ? <div className="paymentManager__loading">Đang tải...</div> : methods.length === 0 ? <div className="paymentManager__empty">Không có phương thức thanh toán nào.</div> : (
                    <table className="paymentManager__table">
                        <thead>
                            <tr>
                                <th className="paymentManager__th">Phương thức thanh toán</th>
                                <th className="paymentManager__th">Số tài khoản</th>
                                <th className="paymentManager__th">Tên ngân hàng</th>
                                <th className="paymentManager__th">Tên người thụ hưởng</th>
                                <th className="paymentManager__th">Trạng thái</th>
                                <th className="paymentManager__th">Ngày tạo</th>
                                <th className="paymentManager__th">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {methods.map(method => (
                                <tr key={method._id} className="paymentManager__tr">
                                    <td className="paymentManager__td">{method.name}</td>
                                    <td className="paymentManager__td">{method.accountNumber || '-'}</td>
                                    <td className="paymentManager__td">{method.bankName || '-'}</td>
                                    <td className="paymentManager__td">{method.accountHolder || '-'}</td>
                                    <td className={`paymentManager__td paymentManager__td--status-${method.active ? 'active' : 'inactive'}`}>{method.active ? 'Đang sử dụng' : 'Ngừng sử dụng'}</td>
                                    <td className="paymentManager__td">{method.createdAt ? new Date(method.createdAt).toLocaleString() : '-'}</td>
                                    <td className="paymentManager__td">
                                        <button className="paymentManager__detailBtn" onClick={() => handleShowDetail(method._id)}>Chi tiết</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {/* Popup chi tiết/sửa */}
            {showDetail && detail && (
                <div className="paymentManager__popupOverlay">
                    <div className="paymentManager__popup">
                        <h3 className="paymentManager__popupTitle">Chi tiết phương thức thanh toán</h3>
                        <div className="paymentManager__popupInfo">
                            {/* Chọn loại phương thức khi sửa */}
                            <div className="paymentManager__popupInfoRow"><span>Phương thức thanh toán:</span> <b>{isEdit ? (
                                <select
                                    className="paymentManager__popupSelect"
                                    value={editDetail?.name || 'bank'}
                                    onChange={e => {
                                        const type = e.target.value;
                                        let resetFields = {
                                            name: type,
                                            description: '',
                                            accountNumber: '',
                                            accountHolder: '',
                                            active: editDetail?.active ?? true
                                        };
                                        if (type === 'bank') {
                                            resetFields = {
                                                ...resetFields,
                                                bankName: '',
                                                bankCode: ''
                                            };
                                        }
                                        setEditDetail(resetFields);
                                    }}
                                >
                                    <option value="bank">Ngân hàng</option>
                                    <option value="momo">Momo</option>
                                    <option value="card">Thẻ</option>
                                </select>
                            ) : (detail.name === 'bank' ? 'Ngân hàng' : detail.name === 'momo' ? 'Momo' : 'Thẻ')}</b></div>
                            <div className="paymentManager__popupInfoRow"><span>Mô tả:</span> <b>{isEdit ? (
                                <input className="paymentManager__popupInput" value={editDetail?.description || ''} onChange={e => setEditDetail({ ...editDetail, description: e.target.value })} />
                            ) : (detail.description || '-')}</b></div>
                            {/* Hiển thị trường theo loại đang chọn khi sửa hoặc loại của detail khi xem */}
                            {(isEdit ? editDetail?.name === 'bank' : detail.name === 'bank') && (
                                <>
                                    <div className="paymentManager__popupInfoRow"><span>Số tài khoản:</span> <b>{isEdit ? (
                                        <input className="paymentManager__popupInput" value={editDetail?.accountNumber || ''} onChange={e => setEditDetail({ ...editDetail, accountNumber: e.target.value })} />
                                    ) : (detail.accountNumber || '-')}</b></div>
                                    <div className="paymentManager__popupInfoRow"><span>Tên ngân hàng:</span> <b>{isEdit ? (
                                        <select className="paymentManager__popupSelect" value={editDetail?.bankCode || ''} onChange={e => {
                                            const selected = bankList.find(b => b.code === e.target.value);
                                            setEditDetail({
                                                ...editDetail,
                                                bankCode: selected ? selected.code : '',
                                                bankName: selected ? selected.name : ''
                                            });
                                        }}>
                                            <option value="">--Chọn ngân hàng--</option>
                                            {bankList.map(b => (
                                                <option key={b.code} value={b.code}>{`${b.name}`}</option>
                                            ))}
                                        </select>
                                    ) : (detail.bankName || '-')}</b></div>
                                    <div className="paymentManager__popupInfoRow"><span>Mã ngân hàng:</span> <b>{isEdit ? (
                                        <input className="paymentManager__popupInput" value={editDetail?.bankCode || ''} disabled />
                                    ) : (detail.bankCode || '-')}</b></div>
                                    <div className="paymentManager__popupInfoRow"><span>Tên người thụ hưởng:</span> <b>{isEdit ? (
                                        <input className="paymentManager__popupInput" value={editDetail?.accountHolder || ''} onChange={e => setEditDetail({ ...editDetail, accountHolder: e.target.value })} />
                                    ) : (detail.accountHolder || '-')}</b></div>
                                    <div className="paymentManager__popupInfoRow"><span>Mẫu QR:</span> <b>{isEdit ? (
                                        <select className="paymentManager__popupSelect" value={editDetail?.template || ''} onChange={e => setEditDetail({ ...editDetail, template: e.target.value })}>
                                            <option value="compact">compact</option>
                                            <option value="compact2">compact2</option>
                                            <option value="qr_only">qr_only</option>
                                            <option value="print">print</option>
                                        </select>
                                    ) : (detail.template || '-')}</b></div>
                                    {/* Hiển thị ảnh QR mẫu cả khi xem và sửa */}
                                    <div className="paymentManager__qrSample">
                                        <img
                                            className='paymentManager__qrImage'
                                            alt="QR mẫu"
                                            src={(() => {
                                                const bankId = isEdit ? (editDetail?.bankCode || '970422') : (detail.bankCode || '970422');
                                                const accountNo = isEdit ? (editDetail?.accountNumber || '') : (detail.accountNumber || '');
                                                const template = isEdit ? (editDetail?.template || 'compact') : (detail.template || 'compact');
                                                const amount = isEdit ? (editDetail?.amount || '') : (detail.amount || '');
                                                const addInfo = encodeURIComponent(isEdit ? (editDetail?.description || '') : (detail.description || ''));
                                                const accountName = encodeURIComponent(isEdit ? (editDetail?.accountHolder || '') : (detail.accountHolder || ''));
                                                return `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png?amount=${amount}&addInfo=${addInfo}&accountName=${accountName}`;
                                            })()}
                                        />
                                    </div>
                                </>
                            )}
                            {(isEdit ? editDetail?.name === 'momo' : detail.name === 'momo') && (
                                <>
                                    <div className="paymentManager__popupInfoRow"><span>Số điện thoại Momo:</span> <b>{isEdit ? (
                                        <input className="paymentManager__popupInput" value={editDetail?.accountNumber || ''} onChange={e => setEditDetail({ ...editDetail, accountNumber: e.target.value })} />
                                    ) : (detail.accountNumber || '-')}</b></div>
                                    <div className="paymentManager__popupInfoRow"><span>Tên chủ ví:</span> <b>{isEdit ? (
                                        <input className="paymentManager__popupInput" value={editDetail?.accountHolder || ''} onChange={e => setEditDetail({ ...editDetail, accountHolder: e.target.value })} />
                                    ) : (detail.accountHolder || '-')}</b></div>
                                </>
                            )}
                            {(isEdit ? editDetail?.name === 'card' : detail.name === 'card') && (
                                <>
                                    <div className="paymentManager__popupInfoRow"><span>Số thẻ:</span> <b>{isEdit ? (
                                        <input className="paymentManager__popupInput" value={editDetail?.accountNumber || ''} onChange={e => setEditDetail({ ...editDetail, accountNumber: e.target.value })} />
                                    ) : (detail.accountNumber || '-')}</b></div>
                                    <div className="paymentManager__popupInfoRow"><span>Tên chủ thẻ:</span> <b>{isEdit ? (
                                        <input className="paymentManager__popupInput" value={editDetail?.accountHolder || ''} onChange={e => setEditDetail({ ...editDetail, accountHolder: e.target.value })} />
                                    ) : (detail.accountHolder || '-')}</b></div>
                                </>
                            )}
                            <div className="paymentManager__popupInfoRow"><span>Trạng thái:</span> <b>{isEdit ? (
                                <select className="paymentManager__popupSelect" value={editDetail?.active ? 'active' : 'inactive'} onChange={e => setEditDetail({ ...editDetail, active: e.target.value === 'active' })}>
                                    <option value="active">Đang sử dụng</option>
                                    <option value="inactive">Ngừng sử dụng</option>
                                </select>
                            ) : (detail.active ? 'Đang sử dụng' : 'Ngừng sử dụng')}</b>
                            </div>
                            <div className="paymentManager__popupInfoRow"><span>Ngày tạo:</span> <b>{detail.createdAt ? new Date(detail.createdAt).toLocaleString() : '-'}</b></div>
                            <div className="paymentManager__popupInfoRow"><span>Ngày cập nhật:</span> <b>{detail.updatedAt ? new Date(detail.updatedAt).toLocaleString() : '-'}</b></div>
                        </div>
                        <div className="paymentManager__popupActions">
                            {!isEdit && (
                                <button className="paymentManager__popupBtn" onClick={() => { setIsEdit(true); setEditDetail({ ...detail }); }}>Sửa</button>
                            )}
                            {isEdit && (
                                <button className="paymentManager__popupBtn" onClick={handleUpdate}>Lưu</button>
                            )}
                            {isEdit && (
                                <button className="paymentManager__popupBtn paymentManager__popupBtn--danger" onClick={() => { setIsEdit(false); setEditDetail(null); }}>Hủy</button>
                            )}
                            {!isEdit && (
                                <button className="paymentManager__popupBtn paymentManager__popupBtn--danger" onClick={() => handleDelete(detail._id)}>Xóa</button>
                            )}
                            {!isEdit && (
                                <button className="paymentManager__popupBtn paymentManager__popupBtn--close" onClick={() => setShowDetail(false)}>Đóng</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Popup thêm mới */}
            {showAdd && (
                <div className="paymentManager__popupOverlay">
                    <div className="paymentManager__popup">
                        <h3 className="paymentManager__popupTitle">Thêm phương thức thanh toán</h3>
                        <div className="paymentManager__popupInfo">
                            <div className="paymentManager__popupInfoRow"><span>Phương thức thanh toán:</span> <b>
                                <select className="paymentManager__popupSelect" value={addDetail.name} onChange={e => setAddDetail({ ...addDetail, name: e.target.value })}>
                                    <option value="bank">Ngân hàng</option>
                                    <option value="momo">Momo</option>
                                    <option value="card">Thẻ</option>
                                </select>
                            </b></div>
                            <div className="paymentManager__popupInfoRow"><span>Mô tả:</span> <b>
                                <input className="paymentManager__popupInput" value={addDetail.description} onChange={e => setAddDetail({ ...addDetail, description: e.target.value })} />
                            </b></div>
                            {/* Hiển thị trường theo loại */}
                            {addDetail.name === 'bank' && (
                                <>
                                    <div className="paymentManager__popupInfoRow"><span>Số tài khoản:</span> <b>
                                        <input className="paymentManager__popupInput" value={addDetail.accountNumber} onChange={e => setAddDetail({ ...addDetail, accountNumber: e.target.value })} />
                                    </b></div>
                                    <div className="paymentManager__popupInfoRow"><span>Tên ngân hàng:</span> <b>
                                        <select className="paymentManager__popupSelect" value={addDetail.bankCode} onChange={e => {
                                            const selected = bankList.find(b => b.code === e.target.value);
                                            setAddDetail({
                                                ...addDetail,
                                                bankCode: selected ? selected.code : '',
                                                bankName: selected ? selected.name : ''
                                            });
                                        }}>
                                            <option value="">--Chọn ngân hàng--</option>
                                            {bankList.map(b => (
                                                <option key={b.code} value={b.code}>{`${b.name}`}</option>
                                            ))}
                                        </select>
                                    </b></div>
                                    <div className="paymentManager__popupInfoRow"><span>Mã ngân hàng:</span> <b>
                                        <input className="paymentManager__popupInput" value={addDetail.bankCode} disabled />
                                    </b></div>
                                    <div className="paymentManager__popupInfoRow"><span>Tên người thụ hưởng:</span> <b>
                                        <input className="paymentManager__popupInput" value={addDetail.accountHolder} onChange={e => setAddDetail({ ...addDetail, accountHolder: e.target.value })} />
                                    </b></div>
                                    <div className="paymentManager__popupInfoRow">
                                        <span>Mẫu QR:</span>
                                        <b>
                                            <select className="paymentManager__popupSelect" value={addDetail.template} onChange={e => setAddDetail({ ...addDetail, template: e.target.value })}>
                                                <option value="compact">compact</option>
                                                <option value="compact2">compact2</option>
                                                <option value="qr_only">qr_only</option>
                                                <option value="print">print</option>
                                            </select>
                                        </b>
                                    </div>
                                </>
                            )}
                            {addDetail.name === 'momo' && (
                                <>
                                    <div className="paymentManager__popupInfoRow"><span>Số điện thoại Momo:</span> <b>
                                        <input className="paymentManager__popupInput" value={addDetail.accountNumber} onChange={e => setAddDetail({ ...addDetail, accountNumber: e.target.value })} />
                                    </b></div>
                                    <div className="paymentManager__popupInfoRow"><span>Tên chủ ví:</span> <b>
                                        <input className="paymentManager__popupInput" value={addDetail.accountHolder} onChange={e => setAddDetail({ ...addDetail, accountHolder: e.target.value })} />
                                    </b></div>
                                </>
                            )}
                            {addDetail.name === 'card' && (
                                <>
                                    <div className="paymentManager__popupInfoRow"><span>Số thẻ:</span> <b>
                                        <input className="paymentManager__popupInput" value={addDetail.accountNumber} onChange={e => setAddDetail({ ...addDetail, accountNumber: e.target.value })} />
                                    </b></div>
                                    <div className="paymentManager__popupInfoRow"><span>Tên chủ thẻ:</span> <b>
                                        <input className="paymentManager__popupInput" value={addDetail.accountHolder} onChange={e => setAddDetail({ ...addDetail, accountHolder: e.target.value })} />
                                    </b></div>
                                </>
                            )}
                            <div className="paymentManager__popupInfoRow"><span>Trạng thái:</span> <b>
                                <select className="paymentManager__popupSelect" value={addDetail.active ? 'active' : 'inactive'} onChange={e => setAddDetail({ ...addDetail, active: e.target.value === 'active' })}>
                                    <option value="active">Đang sử dụng</option>
                                    <option value="inactive">Ngừng sử dụng</option>
                                </select>
                            </b></div>
                        </div>
                        <div className="paymentManager__popupActions">
                            <button className="paymentManager__popupBtn" onClick={handleAdd}>Lưu</button>
                            <button className="paymentManager__popupBtn paymentManager__popupBtn--close" onClick={() => setShowAdd(false)}>Hủy</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PaymentMethod;
