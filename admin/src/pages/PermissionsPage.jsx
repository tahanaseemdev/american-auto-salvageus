import { useEffect, useState } from "react";
import { BiTrash } from "react-icons/bi";
import { Button, Form, Modal } from "react-bootstrap";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import api from "../utils/api";
import { useAdminAuth } from "../context/AuthContext";

// Declarative list of all available permissions
const ALL_PERMISSIONS = [
	"view_categories", "edit_categories",
	"view_sub_categories", "edit_sub_categories",
	"view_models", "edit_models",
	"view_years", "edit_years",
	"view_trims", "edit_trims",
	"view_products", "edit_products",
	"view_orders", "edit_orders",
	"view_contact_queries",
	"manage_users", "manage_roles",
];

export default function PermissionsPage() {
	const { hasPermission } = useAdminAuth();
	const canManageRoles = hasPermission("manage_roles");
	const canManageUsers = hasPermission("manage_users");
	const [roles, setRoles] = useState([]);
	const [subAdmins, setSubAdmins] = useState([]);
	const [loading, setLoading] = useState(true);
	const [subAdminsLoading, setSubAdminsLoading] = useState(true);
	const [showRoleModal, setShowRoleModal] = useState(false);
	const [showSubAdminModal, setShowSubAdminModal] = useState(false);
	const [globalFilter, setGlobalFilter] = useState("");
	const [subAdminsFilter, setSubAdminsFilter] = useState("");
	const [form, setForm] = useState({ title: "", permissions: [] });
	const [savingRole, setSavingRole] = useState(false);
	const [subAdminForm, setSubAdminForm] = useState({ name: "", email: "", password: "", roleId: "" });
	const [savingSubAdmin, setSavingSubAdmin] = useState(false);

	useEffect(() => {
		fetchRoles();
		fetchSubAdmins();
	}, [canManageRoles, canManageUsers]);

	const fetchRoles = async () => {
		if (!canManageRoles && !canManageUsers) {
			setRoles([]);
			setLoading(false);
			return;
		}
		setLoading(true);
		try {
			const { data } = await api.get("/admin/roles");
			setRoles(data.data || []);
		} catch { /* ignore */ } finally {
			setLoading(false);
		}
	};

	const fetchSubAdmins = async () => {
		if (!canManageUsers) {
			setSubAdmins([]);
			setSubAdminsLoading(false);
			return;
		}
		setSubAdminsLoading(true);
		try {
			const { data } = await api.get("/admin/users?limit=1000");
			const allUsers = data.data?.users || [];
			setSubAdmins(
				allUsers.filter((user) => {
					if (!user.role) return false;
					if (typeof user.role === "string") return true;
					return user.role.title !== "Super Admin";
				})
			);
		} catch {
			// ignore
		} finally {
			setSubAdminsLoading(false);
		}
	};

	const onTogglePermission = (perm) => {
		setForm((prev) => {
			const exists = prev.permissions.includes(perm);
			return {
				...prev,
				permissions: exists ? prev.permissions.filter((p) => p !== perm) : [...prev.permissions, perm],
			};
		});
	};

	const onSubmit = async (event) => {
		event.preventDefault();
		if (!form.title.trim()) return;
		setSavingRole(true);
		try {
			await api.post("/admin/roles", { title: form.title.trim(), permissions: form.permissions });
			setForm({ title: "", permissions: [] });
			setShowRoleModal(false);
			fetchRoles();
		} catch {
			/* ignore */
		} finally {
			setSavingRole(false);
		}
	};

	const onSubAdminChange = (event) => {
		const { name, value } = event.target;
		setSubAdminForm((prev) => ({ ...prev, [name]: value }));
	};

	const createSubAdmin = async (event) => {
		event.preventDefault();
		if (!subAdminForm.name.trim() || !subAdminForm.email.trim() || !subAdminForm.password.trim()) return;

		setSavingSubAdmin(true);
		try {
			await api.post("/admin/users", {
				name: subAdminForm.name.trim(),
				email: subAdminForm.email.trim(),
				password: subAdminForm.password,
				roleId: subAdminForm.roleId || null,
			});

			setSubAdminForm({ name: "", email: "", password: "", roleId: "" });
			setShowSubAdminModal(false);
			fetchSubAdmins();
		} catch {
			/* ignore */
		} finally {
			setSavingSubAdmin(false);
		}
	};

	const updateSubAdminRole = async (userId, roleId) => {
		try {
			const { data } = await api.put(`/admin/users/${userId}`, { roleId: roleId || null });
			setSubAdmins((prev) => prev.map((user) => (user._id === userId ? data.data : user)));
		} catch {
			// ignore
		}
	};

	const subAdminsNumberBody = (_row, options) => options.rowIndex + 1;

	const subAdminRoleBody = (row) => (
		<Form.Select
			size="sm"
			value={row.role?._id || ""}
			onChange={(e) => updateSubAdminRole(row._id, e.target.value)}
		>
			<option value="">Customer</option>
			{roles.map((r) => <option key={r._id} value={r._id}>{r.title}</option>)}
		</Form.Select>
	);

	const subAdminsHeader = (
		<div className="admin-table-toolbar d-flex flex-wrap align-items-center justify-content-between gap-3">
			<div className="admin-search">
				<i className="pi pi-search" />
				<InputText value={subAdminsFilter} onChange={(event) => setSubAdminsFilter(event.target.value)} placeholder="Search sub admins" />
			</div>
		</div>
	);

	const deleteRole = async (row) => {
		if (!window.confirm(`Delete role "${row.title}"?`)) return;
		try {
			await api.delete(`/admin/roles/${row._id}`);
			setRoles((prev) => prev.filter((r) => r._id !== row._id));
		} catch { /* ignore */ }
	};

	const permissionsBody = (row) => (
		<div className="d-flex flex-wrap gap-1">
			{(row.permissions || []).map((p) => (
				<span key={p} className="badge bg-secondary small">{p}</span>
			))}
		</div>
	);

	const numberBody = (_row, options) => options.rowIndex + 1;

	const actionsBody = (row) => (
		<div className="d-flex align-items-center gap-2">
			<button type="button" className="admin-row-action" aria-label="Delete role" onClick={() => deleteRole(row)}>
				<BiTrash size={17} />
			</button>
		</div>
	);

	const header = (
		<div className="admin-table-toolbar d-flex flex-wrap align-items-center justify-content-between gap-3">
			<div className="admin-search">
				<i className="pi pi-search" />
				<InputText value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} placeholder="Keyword Search" />
			</div>
		</div>
	);

	return (
		<section>
			<div className="d-flex justify-content-between align-items-center mb-3">
				<div>
					<h2 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">Roles & Permissions</h2>
					<p className="admin-subtle-text mb-0">Create roles and assign granular permissions to control admin access.</p>
				</div>
				<div className="d-flex align-items-center gap-2">
					{canManageUsers && <Button variant="outline-secondary" onClick={() => setShowSubAdminModal(true)}>Add Sub Admin</Button>}
					{canManageRoles && <Button className="admin-cta-btn" onClick={() => setShowRoleModal(true)}>Add Role</Button>}
				</div>
			</div>

			{canManageRoles && <div className="admin-table-wrap">
				<DataTable
					value={roles}
					header={header}
					className="admin-data-table"
					loading={loading}
					paginator
					rows={7}
					globalFilter={globalFilter}
					globalFilterFields={["title"]}
					paginatorTemplate="PrevPageLink NextPageLink"
					emptyMessage="No roles found."
				>
					<Column header="No" body={numberBody} style={{ width: "80px" }} />
					<Column field="title" header="Role Title" sortable />
					<Column header="Permissions" body={permissionsBody} />
					<Column header="Actions" body={actionsBody} style={{ width: "100px" }} />
				</DataTable>
			</div>}

			{canManageUsers && <>
				<div className="d-flex align-items-center mb-3 mt-4">
					<div>
						<h3 className="h4 fw-bold mb-1 d-flex align-items-center gap-2">Sub Admins</h3>
						<p className="admin-subtle-text mb-0">Sub-admin accounts with assigned roles are shown here.</p>
					</div>
				</div>

				<div className="admin-table-wrap">
					<DataTable
						value={subAdmins}
						header={subAdminsHeader}
						className="admin-data-table"
						loading={subAdminsLoading}
						paginator
						rows={7}
						globalFilter={subAdminsFilter}
						globalFilterFields={["name", "email", "role.title"]}
						paginatorTemplate="PrevPageLink NextPageLink"
						emptyMessage="No sub admins found."
					>
						<Column header="No" body={subAdminsNumberBody} style={{ width: "80px" }} />
						<Column field="name" header="Name" sortable />
						<Column field="email" header="Email" sortable />
						<Column field="role.title" header="Current Role" sortable />
						<Column header="Set Role" body={subAdminRoleBody} style={{ width: "220px" }} />
						<Column field="createdAt" header="Joined" sortable body={(r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"} />
					</DataTable>
				</div>
			</>}

			{canManageRoles && <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>Create New Role</Modal.Title>
				</Modal.Header>
				<Form onSubmit={onSubmit}>
					<Modal.Body>
						<Form.Group className="mb-3">
							<Form.Label>Role Title</Form.Label>
							<Form.Control
								name="title"
								value={form.title}
								onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
								placeholder="e.g. Catalog Manager"
								required
							/>
						</Form.Group>

						<Form.Label className="mb-2 fw-semibold">Permissions</Form.Label>
						<div className="row g-2">
							{ALL_PERMISSIONS.map((perm) => (
								<div className="col-6" key={perm}>
									<Form.Check
										type="checkbox"
										id={`perm-${perm}`}
										label={perm.replace(/_/g, ' ')}
										checked={form.permissions.includes(perm)}
										onChange={() => onTogglePermission(perm)}
									/>
								</div>
							))}
						</div>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={() => setShowRoleModal(false)}>Cancel</Button>
						<Button type="submit" className="admin-cta-btn" disabled={savingRole}>{savingRole ? "Saving…" : "Save Role"}</Button>
					</Modal.Footer>
				</Form>
			</Modal>}

			{canManageUsers && <Modal show={showSubAdminModal} onHide={() => setShowSubAdminModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>Create Sub Admin</Modal.Title>
				</Modal.Header>
				<Form onSubmit={createSubAdmin}>
					<Modal.Body>
						<Form.Group className="mb-3">
							<Form.Label>Full Name</Form.Label>
							<Form.Control name="name" value={subAdminForm.name} onChange={onSubAdminChange} required />
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>Email</Form.Label>
							<Form.Control type="email" name="email" value={subAdminForm.email} onChange={onSubAdminChange} required />
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>Password</Form.Label>
							<Form.Control type="password" name="password" value={subAdminForm.password} onChange={onSubAdminChange} minLength={8} required />
						</Form.Group>
						<Form.Group>
							<Form.Label>Role</Form.Label>
							<Form.Select name="roleId" value={subAdminForm.roleId} onChange={onSubAdminChange}>
								<option value="">Customer</option>
								{roles.map((r) => <option key={r._id} value={r._id}>{r.title}</option>)}
							</Form.Select>
						</Form.Group>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={() => setShowSubAdminModal(false)}>Cancel</Button>
						<Button type="submit" className="admin-cta-btn" disabled={savingSubAdmin}>{savingSubAdmin ? "Saving…" : "Create Sub Admin"}</Button>
					</Modal.Footer>
				</Form>
			</Modal>}
		</section>
	);
}


