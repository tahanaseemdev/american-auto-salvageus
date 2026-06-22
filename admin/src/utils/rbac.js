export const PAGE_RULES = [
	{ path: '/dashboard', requiredPermission: null, superOnly: true },
	{ path: '/users', requiredPermission: 'manage_users' },
	{ path: '/employees', requiredPermission: 'manage_employees' },
	{ path: '/categories', requiredPermission: 'view_categories' },
	{ path: '/sub-categories', requiredPermission: 'view_sub_categories' },
	{ path: '/models', requiredPermission: 'view_models' },
	{ path: '/years', requiredPermission: 'view_years' },
	{ path: '/trims', requiredPermission: 'view_trims' },
	{ path: '/products', requiredPermission: 'view_products' },
	{ path: '/orders', requiredPermission: 'view_orders' },
	{ path: '/my-orders', requiredPermission: 'view_assigned_orders' },
	{ path: '/my-leads', requiredPermission: 'view_assigned_contacts' },
	{ path: '/contact-queries', requiredPermission: 'view_contact_queries' },
	{ path: '/permissions', requiredAnyPermissions: ['manage_roles', 'manage_users'] },
	{ path: '/my-account', requiredPermission: null, superOnly: true },
	{ path: '/change-password', requiredPermission: null, allowAllAuthenticated: true },
];

export function isSuperAdmin(admin) {
	return admin?.role?.title === 'Super Admin';
}

export function hasPermission(admin, permission) {
	if (isSuperAdmin(admin)) return true;
	if (!permission) return false;
	return Boolean(admin?.role?.permissions?.includes(permission));
}

export function isEmployee(admin) {
	return admin?.role?.title === 'Employee';
}

export function canAccessPath(admin, path) {
	const rule = PAGE_RULES.find((item) => item.path === path);
	if (!rule) return false;

	if (rule.allowAllAuthenticated) return Boolean(admin);
	if (rule.superOnly) return isSuperAdmin(admin);
	if (rule.requiredAnyPermissions?.length) {
		return rule.requiredAnyPermissions.some((permission) => hasPermission(admin, permission));
	}
	if (!rule.requiredPermission) return true;
	return hasPermission(admin, rule.requiredPermission);
}

export function getAccessiblePaths(admin) {
	return PAGE_RULES.filter((rule) => canAccessPath(admin, rule.path)).map((rule) => rule.path);
}

export function getFirstAccessiblePath(admin) {
	if (admin?.mustChangePassword) return '/change-password';
	const paths = getAccessiblePaths(admin).filter((p) => p !== '/change-password');
	if (isEmployee(admin)) {
		const myOrders = paths.find((p) => p === '/my-orders');
		if (myOrders) return myOrders;
		const myLeads = paths.find((p) => p === '/my-leads');
		if (myLeads) return myLeads;
	}
	return paths[0] || '/login';
}
