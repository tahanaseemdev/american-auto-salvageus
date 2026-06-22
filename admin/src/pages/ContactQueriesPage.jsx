import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { BiShow, BiUserPlus } from "react-icons/bi";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { toast } from "react-toastify";
import api from "../utils/api";
import { useAdminAuth } from "../context/AuthContext";

const ASSIGNMENT_LABELS = {
	Assigned: "Assigned",
	InProgress: "In Progress",
	Completed: "Completed",
	Rejected: "Rejected",
	Cancelled: "Cancelled",
};

const STATUS_COLORS = {
	Assigned: "warn",
	InProgress: "success",
	Completed: "success",
	Rejected: "danger",
	Cancelled: "danger",
};

export default function ContactQueriesPage() {
	const { hasPermission } = useAdminAuth();
	const canEdit = hasPermission("edit_orders");
	const [queries, setQueries] = useState([]);
	const [employees, setEmployees] = useState([]);
	const [loading, setLoading] = useState(true);
	const [globalFilter, setGlobalFilter] = useState("");
	const [assignmentFilter, setAssignmentFilter] = useState("");
	const [unassignedOnly, setUnassignedOnly] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [showAssignModal, setShowAssignModal] = useState(false);
	const [selectedQuery, setSelectedQuery] = useState(null);
	const [reassignEmployeeId, setReassignEmployeeId] = useState("");
	const [assignNote, setAssignNote] = useState("");
	const [reassigning, setReassigning] = useState(false);

	useEffect(() => {
		fetchQueries();
		if (canEdit) fetchEmployees();
	}, [assignmentFilter, unassignedOnly, canEdit]);

	const fetchQueries = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams({ limit: "200" });
			if (assignmentFilter) params.set("assignmentStatus", assignmentFilter);
			if (unassignedOnly) params.set("unassigned", "true");
			const { data } = await api.get(`/admin/contact-queries?${params}`);
			setQueries(data.data?.queries || []);
		} catch {
			toast.error("Failed to load contact queries.");
		} finally {
			setLoading(false);
		}
	};

	const fetchEmployees = async () => {
		try {
			const { data } = await api.get("/admin/employees/assignable");
			setEmployees(data.data?.employees || []);
		} catch {
			// ignore
		}
	};

	const markAsRead = async (row) => {
		if (row.isRead) return;
		try {
			const { data } = await api.patch(`/admin/contact-queries/${row._id}/read`);
			setQueries((prev) => prev.map((item) => (item._id === row._id ? data.data : item)));
		} catch {
			toast.error("Failed to mark as read.");
		}
	};

	const openAssignModal = (row) => {
		setSelectedQuery(row);
		setReassignEmployeeId(row.assignedTo?._id || "");
		setAssignNote(row.employeeNotes || "");
		setShowAssignModal(true);
	};

	const assignLead = async () => {
		if (!selectedQuery || !reassignEmployeeId) return;
		setReassigning(true);
		try {
			const { data } = await api.patch(`/admin/contact-queries/${selectedQuery._id}/reassign`, {
				employeeId: reassignEmployeeId,
				note: assignNote.trim() || undefined,
			});
			setQueries((prev) => prev.map((item) => (item._id === selectedQuery._id ? data.data : item)));
			toast.success(data.message || "Lead assigned.");
			setShowAssignModal(false);
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to assign lead.");
		} finally {
			setReassigning(false);
		}
	};

	const numberBody = (_row, options) => options.rowIndex + 1;
	const dateBody = (row) => (row.createdAt ? new Date(row.createdAt).toLocaleString() : "-");
	const messageBody = (row) => (
		<div style={{ maxWidth: 320 }} className="small text-wrap">
			{row.message}
		</div>
	);

	const readBody = (row) => (
		<span className={`admin-tag ${row.isRead ? "success" : "warn"}`}>
			{row.isRead ? "Read" : "Unread"}
		</span>
	);

	const assignmentBody = (row) => {
		if (!row.assignedTo) return <span className="admin-tag danger">Unassigned</span>;
		return (
			<div>
				<div className="small fw-semibold">{row.assignedTo.name}</div>
				{row.assignmentStatus && (
					<span className={`admin-tag ${STATUS_COLORS[row.assignmentStatus] || "warn"} mt-1`}>
						{ASSIGNMENT_LABELS[row.assignmentStatus] || row.assignmentStatus}
					</span>
				)}
			</div>
		);
	};

	const assignActionBody = (row) => {
		if (!canEdit) return "—";
		return (
			<Button variant="outline-primary" size="sm" onClick={() => openAssignModal(row)}>
				<BiUserPlus className="me-1" />
				{row.assignedTo ? "Reassign" : "Assign"}
			</Button>
		);
	};

	const header = (
		<div className="d-flex flex-column gap-3">
			<div className="d-flex flex-wrap align-items-center gap-3">
				<Form.Select
					value={assignmentFilter}
					onChange={(e) => setAssignmentFilter(e.target.value)}
					size="sm"
					style={{ maxWidth: "180px" }}
				>
					<option value="">All statuses</option>
					{Object.entries(ASSIGNMENT_LABELS).map(([value, label]) => (
						<option key={value} value={value}>{label}</option>
					))}
				</Form.Select>
				<Form.Check
					type="checkbox"
					id="unassigned-leads"
					label="Unassigned only"
					checked={unassignedOnly}
					onChange={(e) => setUnassignedOnly(e.target.checked)}
				/>
			</div>
			<div className="admin-table-toolbar d-flex flex-wrap align-items-center justify-content-between gap-3">
				<div className="admin-search">
					<i className="pi pi-search" />
					<InputText value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} placeholder="Search queries..." />
				</div>
				<Button variant="outline-secondary" size="sm" onClick={fetchQueries}>Refresh</Button>
			</div>
		</div>
	);

	return (
		<section>
			<div className="d-flex justify-content-between align-items-center mb-3">
				<div>
					<h2 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">Contact Queries</h2>
					<p className="admin-subtle-text mb-0">
						Website contact form and Facebook leads. New leads are auto-assigned to employees round-robin.
					</p>
				</div>
			</div>

			<div className="admin-table-wrap">
				<DataTable
					value={queries}
					header={header}
					className="admin-data-table"
					loading={loading}
					paginator
					rows={10}
					globalFilter={globalFilter}
					globalFilterFields={["name", "email", "phone", "subject", "message", "source"]}
					paginatorTemplate="PrevPageLink NextPageLink"
					emptyMessage="No contact queries found."
					sortField="createdAt"
					sortOrder={-1}
				>
					<Column header="No" body={numberBody} style={{ width: "70px" }} />
					<Column field="name" header="Name" sortable />
					<Column field="email" header="Email" sortable />
					<Column field="phone" header="Phone" />
					<Column field="subject" header="Subject" sortable />
					<Column field="source" header="Source" sortable style={{ width: "120px" }} />
					<Column header="Assigned To" body={assignmentBody} style={{ width: "150px" }} />
					<Column header="Message" body={messageBody} />
					<Column header="Read" body={readBody} sortable field="isRead" style={{ width: "100px" }} />
					<Column header="Submitted" body={dateBody} sortable field="createdAt" style={{ width: "180px" }} />
					{canEdit && <Column header="Assign" body={assignActionBody} style={{ width: "120px" }} />}
					<Column
						header="View"
						body={(row) => (
							<div className="d-flex gap-1">
								<button type="button" className="admin-row-action" onClick={() => { setSelectedQuery(row); setShowDetails(true); }} aria-label="View">
									<BiShow size={17} />
								</button>
								{!row.isRead && (
									<Button variant="outline-success" size="sm" onClick={() => markAsRead(row)}>Read</Button>
								)}
							</div>
						)}
						style={{ width: "120px" }}
					/>
				</DataTable>
			</div>

			<Modal show={showDetails} onHide={() => setShowDetails(false)} centered size="lg">
				<Modal.Header closeButton>
					<Modal.Title>{selectedQuery?.subject}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{selectedQuery && (
						<div className="d-flex flex-column gap-2 small">
							<div><strong>Name:</strong> {selectedQuery.name}</div>
							<div><strong>Email:</strong> {selectedQuery.email}</div>
							<div><strong>Phone:</strong> {selectedQuery.phone || "—"}</div>
							<div><strong>Source:</strong> {selectedQuery.source || "website"}</div>
							<div><strong>Assigned:</strong> {selectedQuery.assignedTo?.name || "Unassigned"}</div>
							<div><strong>Message:</strong></div>
							<div className="border rounded p-3" style={{ whiteSpace: "pre-wrap" }}>{selectedQuery.message}</div>
						</div>
					)}
				</Modal.Body>
			</Modal>

			<Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>{selectedQuery?.assignedTo ? "Reassign lead" : "Assign lead"}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form.Group className="mb-3">
						<Form.Label>Employee</Form.Label>
						<Form.Select value={reassignEmployeeId} onChange={(e) => setReassignEmployeeId(e.target.value)}>
							<option value="">Select employee…</option>
							{employees.map((emp) => (
								<option key={emp._id} value={emp._id}>{emp.name} ({emp.email})</option>
							))}
						</Form.Select>
					</Form.Group>
					<Form.Group>
						<Form.Label>Note (optional)</Form.Label>
						<Form.Control
							as="textarea"
							rows={2}
							value={assignNote}
							onChange={(e) => setAssignNote(e.target.value)}
							placeholder="Note for employee…"
						/>
					</Form.Group>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
					<Button className="admin-cta-btn" disabled={!reassignEmployeeId || reassigning} onClick={assignLead}>
						{reassigning ? "Saving…" : "Save assignment"}
					</Button>
				</Modal.Footer>
			</Modal>
		</section>
	);
}
