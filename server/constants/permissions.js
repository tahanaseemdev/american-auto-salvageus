const ALL_PERMISSIONS = [
	"view_categories",
	"edit_categories",
	"view_sub_categories",
	"edit_sub_categories",
	"view_models",
	"edit_models",
	"view_years",
	"edit_years",
	"view_trims",
	"edit_trims",
	"view_products",
	"edit_products",
	"view_orders",
	"edit_orders",
	"view_contact_queries",
	"manage_users",
	"manage_roles",
	"manage_employees",
	"view_assigned_orders",
	"edit_assigned_orders",
];

const EMPLOYEE_PERMISSIONS = ["view_assigned_orders", "edit_assigned_orders"];

const ASSIGNMENT_STATUSES = ["Assigned", "InProgress", "Completed", "Rejected", "Cancelled"];

module.exports = {
	ALL_PERMISSIONS,
	EMPLOYEE_PERMISSIONS,
	ASSIGNMENT_STATUSES,
};
