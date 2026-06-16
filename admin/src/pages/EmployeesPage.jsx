import { useEffect, useState } from "react";
import { BiEnvelope, BiRefresh, BiTrash, BiUndo, BiUserPlus } from "react-icons/bi";
import { Button, Form, Modal } from "react-bootstrap";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { InputSwitch } from "primereact/inputswitch";
import { toast } from "react-toastify";
import api from "../utils/api";

export default function EmployeesPage() {
	const [employees, setEmployees] = useState([]);
	const [loading, setLoading] = useState(true);
	const [globalFilter, setGlobalFilter] = useState("");
	const [showModal, setShowModal] = useState(false);
	const [showCredentialsModal, setShowCredentialsModal] = useState(false);
	const [credentialsInfo, setCredentialsInfo] = useState(null);
	const [form, setForm] = useState({ email: "", name: "" });
	const [saving, setSaving] = useState(false);

	useEffect(() => { fetchEmployees(); }, []);

	const fetchEmployees = async () => {
		setLoading(true);
		try {
			const { data } = await api.get("/admin/employees");
			setEmployees(data.data?.employees || []);
		} catch {
			toast.error("Failed to load employees.");
		} finally {
			setLoading(false);
		}
	};

	const onCreate = async (event) => {
		event.preventDefault();
		if (!form.email.trim()) return;
		setSaving(true);
		try {
			const { data } = await api.post("/admin/employees", {
				email: form.email.trim(),
				name: form.name.trim() || undefined,
			});
			const created = data.data || {};
			if (created.emailSent === false) {
				toast.warn(data.message || "Employee created but email was not sent.");
			} else {
				toast.success(data.message || "Employee created. Credentials sent by email.");
			}
			if (created.tempPassword) {
				setCredentialsInfo({
					email: created.email,
					tempPassword: created.tempPassword,
					title: created.emailSent === false ? "Share these credentials manually" : "Credentials sent (local copy for verification)",
				});
				setShowCredentialsModal(true);
			}
			setForm({ email: "", name: "" });
			setShowModal(false);
			fetchEmployees();
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to create employee.");
		} finally {
			setSaving(false);
		}
	};

	const toggleActive = async (employee, value) => {
		try {
			await api.patch(`/admin/employees/${employee._id}`, { isActiveForAssignment: value });
			setEmployees((prev) =>
				prev.map((e) => (e._id === employee._id ? { ...e, isActiveForAssignment: value } : e))
			);
			toast.success(value ? "Employee activated for assignments." : "Employee paused from assignments.");
		} catch {
			toast.error("Failed to update employee.");
		}
	};

	const resendCredentials = async (employee) => {
		try {
			const { data } = await api.post(`/admin/employees/${employee._id}/resend-credentials`);
			const result = data.data || {};
			if (result.emailSent === false) {
				toast.warn(data.message || "Email was not sent.");
			} else {
				toast.success(data.message || `Credentials resent to ${employee.email}. Use the latest email only.`);
			}
			if (result.tempPassword) {
				setCredentialsInfo({
					email: result.email || employee.email,
					tempPassword: result.tempPassword,
					title: result.emailSent === false ? "New temporary password (email not sent)" : "Latest credentials (local copy for verification)",
				});
				setShowCredentialsModal(true);
			}
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to resend credentials.");
		}
	};

	const deleteEmployee = async (employee) => {
		const openCount = employee.openOrders || 0;
		const openWarning = openCount > 0
			? `\n\nThis employee has ${openCount} open order(s). They will be unassigned automatically.`
			: "";
		if (!window.confirm(`Permanently delete ${employee.name} (${employee.email})? This cannot be undone.${openWarning}`)) return;
		try {
			const { data } = await api.delete(`/admin/employees/${employee._id}`);
			toast.success(data.message || "Employee deleted.");
			fetchEmployees();
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to delete employee.");
		}
	};

	const revokeEmployee = async (employee) => {
		if (!window.confirm(`Revoke access for ${employee.name}? They will not be able to log in or receive new assignments.`)) return;
		try {
			await api.patch(`/admin/employees/${employee._id}`, { isRevoked: true, isActiveForAssignment: false });
			fetchEmployees();
			toast.success("Employee access revoked.");
		} catch {
			toast.error("Failed to revoke employee.");
		}
	};

	const restoreEmployee = async (employee) => {
		if (!window.confirm(`Restore access for ${employee.name}? They can log in again and receive round-robin assignments.`)) return;
		try {
			await api.patch(`/admin/employees/${employee._id}`, { isRevoked: false, isActiveForAssignment: true });
			fetchEmployees();
			toast.success("Employee access restored.");
		} catch {
			toast.error("Failed to restore employee.");
		}
	};

	const activeBody = (row) => (
		<InputSwitch
			checked={Boolean(row.isActiveForAssignment) && !row.isRevoked}
			disabled={row.isRevoked}
			onChange={(e) => toggleActive(row, e.value)}
		/>
	);

	const statsBody = (row) => (
		<span className="small">
			{row.openOrders || 0} open / {row.ordersAssigned || 0} total
		</span>
	);

	const lastAssignedBody = (row) =>
		row.lastAssignedAt ? new Date(row.lastAssignedAt).toLocaleString() : "—";

	const actionsBody = (row) => (
		<div className="d-flex flex-wrap gap-2 align-items-center">
			{!row.isRevoked && (
				<Button variant="outline-secondary" size="sm" onClick={() => resendCredentials(row)} title="Resend credentials">
					<BiEnvelope size={16} />
				</Button>
			)}
			{!row.isRevoked ? (
				<Button variant="outline-warning" size="sm" onClick={() => revokeEmployee(row)} title="Revoke access">
					Revoke
				</Button>
			) : (
				<Button variant="outline-success" size="sm" onClick={() => restoreEmployee(row)} title="Restore access">
					<BiUndo size={16} className="me-1" /> Restore
				</Button>
			)}
			<Button
				variant="outline-danger"
				size="sm"
				onClick={() => deleteEmployee(row)}
				title="Delete employee permanently"
			>
				<BiTrash size={16} />
			</Button>
			{row.isRevoked && <span className="admin-tag danger">Revoked</span>}
		</div>
	);

	const header = (
		<div className="admin-table-toolbar d-flex flex-wrap align-items-center justify-content-between gap-3">
			<div className="admin-search">
				<i className="pi pi-search" />
				<InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Search employees…" />
			</div>
			<div className="d-flex gap-2">
				<Button variant="outline-secondary" size="sm" onClick={fetchEmployees}>
					<BiRefresh size={16} className="me-1" /> Refresh
				</Button>
				<Button className="admin-cta-btn" size="sm" onClick={() => setShowModal(true)}>
					<BiUserPlus size={16} className="me-1" /> Add employee
				</Button>
			</div>
		</div>
	);

	return (
		<section>
			<div className="mb-3">
				<h2 className="h3 fw-bold mb-1">Employees</h2>
				<p className="admin-subtle-text mb-0">
					Manage order-assignment staff. New orders are distributed round-robin among active employees.
				</p>
			</div>

			<div className="admin-table-wrap">
				<DataTable
					value={employees}
					header={header}
					className="admin-data-table"
					loading={loading}
					paginator
					rows={10}
					globalFilter={globalFilter}
					globalFilterFields={["name", "email"]}
					emptyMessage="No employees yet. Add one to start assigning orders."
				>
					<Column field="name" header="Name" sortable />
					<Column field="email" header="Email" sortable />
					<Column header="Active" body={activeBody} style={{ width: "100px" }} />
					<Column header="Workload" body={statsBody} />
					<Column header="Last assigned" body={lastAssignedBody} />
					<Column header="Actions" body={actionsBody} style={{ width: "220px" }} />
				</DataTable>
			</div>

			<Modal show={showModal} onHide={() => setShowModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>Add employee</Modal.Title>
				</Modal.Header>
				<Form onSubmit={onCreate}>
					<Modal.Body className="d-flex flex-column gap-3">
						<Form.Group>
							<Form.Label>Email *</Form.Label>
							<Form.Control
								type="email"
								value={form.email}
								onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
								placeholder="employee@company.com"
								required
							/>
						</Form.Group>
						<Form.Group>
							<Form.Label>Name (optional)</Form.Label>
							<Form.Control
								value={form.name}
								onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
								placeholder="Auto-derived from email if empty"
							/>
						</Form.Group>
						<p className="small text-muted mb-0">
							A temporary password will be emailed. The employee must change it on first login.
						</p>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
						<Button type="submit" className="admin-cta-btn" disabled={saving}>
							{saving ? "Creating…" : "Create & send credentials"}
						</Button>
					</Modal.Footer>
				</Form>
			</Modal>

			<Modal show={showCredentialsModal} onHide={() => setShowCredentialsModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>{credentialsInfo?.title || "Employee credentials"}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{credentialsInfo && (
						<div className="d-flex flex-column gap-2">
							<p className="mb-2 text-muted small">
								Copy exactly — no spaces. Use the <strong>admin panel login</strong> (not the customer website). If you resent credentials, older emails are invalid.
							</p>
							<p className="mb-1"><strong>Email:</strong> {credentialsInfo.email}</p>
							<p className="mb-0"><strong>Temporary password:</strong> <code>{credentialsInfo.tempPassword}</code></p>
						</div>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowCredentialsModal(false)}>Close</Button>
				</Modal.Footer>
			</Modal>
		</section>
	);
}
