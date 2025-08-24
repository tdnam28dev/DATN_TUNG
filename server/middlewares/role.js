
// Middleware phân quyền nâng cao: role, action, resource, lấy quyền động
// options: { roles: [], actions: [], resource: '', getPermissions: async function(user) }
module.exports = (options = {}) => {
  // roles: mảng role cho phép
  // actions: mảng action cho phép (vd: ['read', 'write'])
  // resource: tên tài nguyên (vd: 'user', 'order')
  // getPermissions: hàm async lấy quyền động từ DB hoặc config ngoài
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ error: 'Chưa đăng nhập' });
      }

      // 1. Multi-role: user.roles là mảng hoặc 1 role
      const userRoles = Array.isArray(user.roles) ? user.roles : [user.role];
      const allowRoles = options.roles || [];
      const allowActions = options.actions || [];
      const resource = options.resource;

      // 2. Lấy quyền động từ DB hoặc config ngoài nếu có
      let dynamicPermissions = null;
      if (typeof options.getPermissions === 'function') {
        dynamicPermissions = await options.getPermissions(user, req);
        // dynamicPermissions: { roles: [], actions: [], resources: [] }
      }

      // 3. Kiểm tra role
      let hasRole = false;
      if (dynamicPermissions && dynamicPermissions.roles) {
        hasRole = dynamicPermissions.roles.some(r => userRoles.includes(r));
      } else if (allowRoles.length > 0) {
        hasRole = allowRoles.some(r => userRoles.includes(r));
      } else {
        hasRole = true; // Không truyền roles thì bỏ qua
      }

      if (!hasRole) {
        return res.status(403).json({ error: 'Bạn không có quyền truy cập' });
      }

      // 4. Kiểm tra action
      if (allowActions.length > 0) {
        let userActions = user.actions || [];
        if (dynamicPermissions && dynamicPermissions.actions) {
          userActions = dynamicPermissions.actions;
        }
        const hasAction = allowActions.some(a => userActions.includes(a));
        if (!hasAction) {
          return res.status(403).json({ error: 'Bạn không có quyền thực hiện thao tác này' });
        }
      }

      // 5. Kiểm tra resource (chỉ cho thao tác trên tài nguyên của mình)
      if (resource) {
        const doc = req[resource];
        if (!doc || !doc._id) {
          return res.status(404).json({ error: 'Không tìm thấy tài nguyên hoặc tài nguyên không hợp lệ', detail: { resource, doc } });
        }
        // Nếu là admin thì cho phép thao tác trên mọi tài nguyên
        if (userRoles.includes('admin')) {
          // admin luôn được phép
        } else if (resource === 'userDoc') {
          // Nếu là staff, chỉ cho thao tác trên tài nguyên của chính mình
          if (userRoles.includes('staff') && doc._id && user.id && doc._id.toString() === user.id.toString()) {
            // staff thao tác trên chính mình
          } else if (userRoles.includes('manager')) {
            // manager có thể thao tác trên mọi user (nếu muốn mở rộng)
          } else {
            return res.status(403).json({ error: 'Bạn chỉ được thao tác trên tài nguyên của mình' });
          }
        }
        // Có thể mở rộng cho các resource khác
      }

      next();
    } catch (err) {
      res.status(500).json({ error: 'Lỗi phân quyền', detail: err.message });
    }
  };
};
