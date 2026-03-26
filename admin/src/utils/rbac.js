export const PAGE_RULES = [
	{ path: '/dashboard', requiredPermission: null, superOnly: true },
	{ path: '/users', requiredPermission: 'manage_users' },
	{ path: '/categories', requiredPermission: 'view_categories' },
	{ path: '/sub-categories', requiredPermission: 'view_sub_categories' },
	{ path: '/models', requiredPermission: 'view_models' },
	{ path: '/years', requiredPermission: 'view_years' },
	{ path: '/trims', requiredPermission: 'view_trims' },
	{ path: '/products', requiredPermission: 'view_products' },
	{ path: '/orders', requiredPermission: 'view_orders' },
	{ path: '/contact-queries', requiredPermission: 'view_contact_queries' },
	{ path: '/permissions', requiredAnyPermissions: ['manage_roles', 'manage_users'] },
	{ path: '/my-account', requiredPermission: null, superOnly: true },
];

export function isSuperAdmin(admin) {
	return admin?.role?.title === 'Super Admin';
}

export function hasPermission(admin, permission) {
	if (isSuperAdmin(admin)) return true;
	if (!permission) return false;
	return Boolean(admin?.role?.permissions?.includes(permission));
}

export function canAccessPath(admin, path) {
	const rule = PAGE_RULES.find((item) => item.path === path);
	if (!rule) return false;

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
	const paths = getAccessiblePaths(admin);
	return paths[0] || '/login';
}
