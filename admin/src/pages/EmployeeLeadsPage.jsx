import { useEffect, useMemo, useState } from "react";
import { BiEnvelope, BiPhone, BiShow } from "react-icons/bi";
import { Button, Form, Modal } from "react-bootstrap";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { toast } from "react-toastify";
import api from "../utils/api";

const ASSIGNMENT_STATUSES = ["Assigned", "InProgress", "Completed", "Rejected", "Cancelled"];

const STATUS_LABELS = {
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

const FILTER_TABS = [
	{ key: "", label: "All" },
	{ key: "Assigned", label: "Assigned" },
	{ key: "InProgress", label: "In Progress" },
	{ key: "Completed", label: "Completed" },
];

export default function EmployeeLeadsPage() {
	const [leads, setLeads] = useState([]);
	const [loading, setLoading] = useState(true);
	const [globalFilter, setGlobalFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [showDetails, setShowDetails] = useState(false);
	const [selectedLead, setSelectedLead] = useState(null);
	const [notes, setNotes] = useState("");
	const [updatingId, setUpdatingId] = useState(null);

	useEffect(() => {
		fetchLeads();
	}, [statusFilter]);

	const fetchLeads = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams({ limit: "100" });
			if (statusFilter) params.set("assignmentStatus", statusFilter);
			const { data } = await api.get(`/admin/contact-queries/mine?${params}`);
			setLeads(data.data?.queries || []);
		} catch {
			toast.error("Failed to load your leads.");
		} finally {
			setLoading(false);
		}
	};

	const updateAssignmentStatus = async (leadId, assignmentStatus, employeeNotes) => {
		setUpdatingId(leadId);
		try {
			const { data } = await api.patch(`/admin/contact-queries/${leadId}/assignment-status`, {
				assignmentStatus,
				employeeNotes: employeeNotes ?? undefined,
			});
			setLeads((prev) => prev.map((item) => (item._id === leadId ? data.data : item)));
			if (selectedLead?._id === leadId) setSelectedLead(data.data);
			toast.success("Lead status updated.");
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to update status.");
		} finally {
			setUpdatingId(null);
		}
	};

	const openDetails = (lead) => {
		setSelectedLead(lead);
		setNotes(lead.employeeNotes || "");
		setShowDetails(true);
	};

	const filteredLeads = useMemo(() => {
		if (!globalFilter.trim()) return leads;
		const q = globalFilter.toLowerCase();
		return leads.filter(
			(item) =>
				item.name?.toLowerCase().includes(q) ||
				item.email?.toLowerCase().includes(q) ||
				item.subject?.toLowerCase().includes(q) ||
				item.message?.toLowerCase().includes(q)
		);
	}, [leads, globalFilter]);

	const statusBody = (row) => (
		<span className={`admin-tag ${STATUS_COLORS[row.assignmentStatus] || "warn"}`}>
			{STATUS_LABELS[row.assignmentStatus] || row.assignmentStatus || "—"}
		</span>
	);

	const statusActionBody = (row) => (
		<Form.Select
			value={row.assignmentStatus || "Assigned"}
			onChange={(e) => updateAssignmentStatus(row._id, e.target.value, row.employeeNotes)}
			size="sm"
			style={{ minWidth: "140px" }}
			disabled={updatingId === row._id}
		>
			{ASSIGNMENT_STATUSES.map((s) => (
				<option key={s} value={s}>{STATUS_LABELS[s]}</option>
			))}
		</Form.Select>
	);

	const contactBody = (row) => (
		<div className="d-flex gap-2">
			{row.phone && (
				<a href={`tel:${row.phone}`} className="btn btn-sm btn-outline-success" title="Call customer">
					<BiPhone size={16} />
				</a>
			)}
			{row.email && (
				<a
					href={`mailto:${row.email}?subject=${encodeURIComponent(row.subject || "Your inquiry")}`}
					className="btn btn-sm btn-outline-primary"
					title="Email customer"
				>
					<BiEnvelope size={16} />
				</a>
			)}
		</div>
	);

	const header = (
		<div className="d-flex flex-column gap-3">
			<div className="d-flex flex-wrap gap-2">
				{FILTER_TABS.map((tab) => (
					<button
						key={tab.key}
						type="button"
						className={`btn btn-sm ${statusFilter === tab.key ? "admin-cta-btn" : "btn-outline-secondary"}`}
						onClick={() => setStatusFilter(tab.key)}
					>
						{tab.label}
					</button>
				))}
			</div>
			<div className="admin-table-toolbar d-flex flex-wrap align-items-center justify-content-between gap-3">
				<div className="admin-search">
					<i className="pi pi-search" />
					<InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Search leads…" />
				</div>
				<Button variant="outline-secondary" size="sm" onClick={fetchLeads}>Refresh</Button>
			</div>
		</div>
	);

	return (
		<section>
			<div className="mb-3">
				<h2 className="h3 fw-bold mb-1">My Leads</h2>
				<p className="admin-subtle-text mb-0">
					Contact and Facebook leads assigned to you. Update status and follow up with customers.
				</p>
			</div>

			<div className="admin-table-wrap">
				<DataTable
					value={filteredLeads}
					header={header}
					className="admin-data-table"
					loading={loading}
					paginator
					rows={10}
					emptyMessage="No leads assigned to you yet."
					sortField="assignedAt"
					sortOrder={-1}
				>
					<Column field="name" header="Name" sortable />
					<Column field="subject" header="Subject" sortable />
					<Column field="source" header="Source" sortable />
					<Column header="Status" body={statusBody} />
					<Column header="Update" body={statusActionBody} style={{ width: "160px" }} />
					<Column header="Contact" body={contactBody} style={{ width: "100px" }} />
					<Column
						header="Assigned"
						body={(row) => (row.assignedAt ? new Date(row.assignedAt).toLocaleString() : "—")}
						sortable
						field="assignedAt"
					/>
					<Column
						header="View"
						body={(row) => (
							<button type="button" className="admin-row-action" onClick={() => openDetails(row)} aria-label="View lead">
								<BiShow size={17} />
							</button>
						)}
						style={{ width: "70px" }}
					/>
				</DataTable>
			</div>

			<Modal show={showDetails} onHide={() => setShowDetails(false)} centered size="lg">
				<Modal.Header closeButton>
					<Modal.Title>{selectedLead?.subject}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{selectedLead && (
						<div className="d-flex flex-column gap-3">
							<div className="d-flex flex-wrap gap-2">
								{selectedLead.phone && (
									<a href={`tel:${selectedLead.phone}`} className="btn btn-success btn-sm d-inline-flex align-items-center gap-2">
										<BiPhone /> Call {selectedLead.phone}
									</a>
								)}
								{selectedLead.email && (
									<a
										href={`mailto:${selectedLead.email}?subject=${encodeURIComponent(selectedLead.subject || "")}`}
										className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2"
									>
										<BiEnvelope /> Email customer
									</a>
								)}
							</div>
							<div><strong>Customer:</strong> {selectedLead.name}</div>
							<div><strong>Source:</strong> {selectedLead.source || "website"}</div>
							<div><strong>Message:</strong></div>
							<div className="border rounded p-3 small text-wrap" style={{ whiteSpace: "pre-wrap" }}>{selectedLead.message}</div>
							<Form.Group>
								<Form.Label>Your notes</Form.Label>
								<Form.Control
									as="textarea"
									rows={3}
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									placeholder="Add notes about this lead…"
								/>
							</Form.Group>
							<Form.Group>
								<Form.Label>Status</Form.Label>
								<Form.Select
									value={selectedLead.assignmentStatus || "Assigned"}
									onChange={(e) => updateAssignmentStatus(selectedLead._id, e.target.value, notes)}
									disabled={updatingId === selectedLead._id}
								>
									{ASSIGNMENT_STATUSES.map((s) => (
										<option key={s} value={s}>{STATUS_LABELS[s]}</option>
									))}
								</Form.Select>
							</Form.Group>
						</div>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant="primary"
						className="admin-cta-btn"
						disabled={updatingId === selectedLead?._id}
						onClick={() => updateAssignmentStatus(selectedLead._id, selectedLead.assignmentStatus, notes)}
					>
						Save notes
					</Button>
					<Button variant="secondary" onClick={() => setShowDetails(false)}>Close</Button>
				</Modal.Footer>
			</Modal>
		</section>
	);
}
