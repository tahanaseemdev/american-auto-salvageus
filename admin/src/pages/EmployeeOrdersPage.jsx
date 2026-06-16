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

export default function EmployeeOrdersPage() {
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [globalFilter, setGlobalFilter] = useState("");
	const [statusFilter, setStatusFilter] = useState("");
	const [showDetails, setShowDetails] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [notes, setNotes] = useState("");
	const [updatingId, setUpdatingId] = useState(null);

	useEffect(() => { fetchOrders(); }, [statusFilter]);

	const fetchOrders = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams({ limit: "100" });
			if (statusFilter) params.set("assignmentStatus", statusFilter);
			const { data } = await api.get(`/admin/orders/mine?${params}`);
			setOrders(data.data?.orders || []);
		} catch {
			toast.error("Failed to load your orders.");
		} finally {
			setLoading(false);
		}
	};

	const updateAssignmentStatus = async (orderId, assignmentStatus, employeeNotes) => {
		setUpdatingId(orderId);
		try {
			const { data } = await api.patch(`/admin/orders/${orderId}/assignment-status`, {
				assignmentStatus,
				employeeNotes: employeeNotes ?? undefined,
			});
			setOrders((prev) => prev.map((o) => (o._id === orderId ? data.data : o)));
			if (selectedOrder?._id === orderId) {
				setSelectedOrder(data.data);
			}
			toast.success("Order status updated.");
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to update status.");
		} finally {
			setUpdatingId(null);
		}
	};

	const openDetails = (order) => {
		setSelectedOrder(order);
		setNotes(order.employeeNotes || "");
		setShowDetails(true);
	};

	const customerName = (order) => {
		if (order.shippingDetails?.firstName) {
			return `${order.shippingDetails.firstName} ${order.shippingDetails.lastName || ""}`.trim();
		}
		return "Guest";
	};

	const filteredOrders = useMemo(() => {
		if (!globalFilter.trim()) return orders;
		const q = globalFilter.toLowerCase();
		return orders.filter(
			(o) =>
				o.orderNumber?.toLowerCase().includes(q) ||
				customerName(o).toLowerCase().includes(q)
		);
	}, [orders, globalFilter]);

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

	const contactBody = (row) => {
		const phone = row.shippingDetails?.phone;
		const email = row.shippingDetails?.email;
		return (
			<div className="d-flex gap-2">
				{phone && (
					<a href={`tel:${phone}`} className="btn btn-sm btn-outline-success" title="Call customer">
						<BiPhone size={16} />
					</a>
				)}
				{email && (
					<a
						href={`mailto:${email}?subject=${encodeURIComponent(`Order ${row.orderNumber}`)}`}
						className="btn btn-sm btn-outline-primary"
						title="Email customer"
					>
						<BiEnvelope size={16} />
					</a>
				)}
			</div>
		);
	};

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
					<InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Search orders…" />
				</div>
				<Button variant="outline-secondary" size="sm" onClick={fetchOrders}>Refresh</Button>
			</div>
		</div>
	);

	return (
		<section>
			<div className="mb-3">
				<h2 className="h3 fw-bold mb-1">My Orders</h2>
				<p className="admin-subtle-text mb-0">
					Orders assigned to you. Update status as you work and contact customers directly.
				</p>
			</div>

			<div className="admin-table-wrap">
				<DataTable
					value={filteredOrders}
					header={header}
					className="admin-data-table"
					loading={loading}
					paginator
					rows={10}
					emptyMessage="No orders assigned to you yet."
					sortField="assignedAt"
					sortOrder={-1}
				>
					<Column field="orderNumber" header="Order #" sortable />
					<Column header="Customer" body={(row) => customerName(row)} />
					<Column header="Total" body={(row) => `$${Number(row.totalAmount || 0).toFixed(2)}`} sortable field="totalAmount" />
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
							<button type="button" className="admin-row-action" onClick={() => openDetails(row)} aria-label="View order">
								<BiShow size={17} />
							</button>
						)}
						style={{ width: "70px" }}
					/>
				</DataTable>
			</div>

			<Modal show={showDetails} onHide={() => setShowDetails(false)} centered size="lg">
				<Modal.Header closeButton>
					<Modal.Title>Order {selectedOrder?.orderNumber}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{selectedOrder && (
						<div className="d-flex flex-column gap-3">
							<div className="d-flex flex-wrap gap-2">
								{selectedOrder.shippingDetails?.phone && (
									<a href={`tel:${selectedOrder.shippingDetails.phone}`} className="btn btn-success btn-sm d-inline-flex align-items-center gap-2">
										<BiPhone /> Call {selectedOrder.shippingDetails.phone}
									</a>
								)}
								{selectedOrder.shippingDetails?.email && (
									<a
										href={`mailto:${selectedOrder.shippingDetails.email}?subject=${encodeURIComponent(`Order ${selectedOrder.orderNumber}`)}`}
										className="btn btn-primary btn-sm d-inline-flex align-items-center gap-2"
									>
										<BiEnvelope /> Email customer
									</a>
								)}
							</div>

							<div><strong>Customer:</strong> {customerName(selectedOrder)}</div>
							<div><strong>Total:</strong> ${Number(selectedOrder.totalAmount || 0).toFixed(2)}</div>
							<div>
								<strong>Address:</strong>{" "}
								{[
									selectedOrder.shippingDetails?.address || selectedOrder.shippingDetails?.street,
									selectedOrder.shippingDetails?.city,
									selectedOrder.shippingDetails?.state,
									selectedOrder.shippingDetails?.zip,
								].filter(Boolean).join(", ") || "—"}
							</div>
							{selectedOrder.shippingDetails?.notes && (
								<div><strong>Customer notes:</strong> {selectedOrder.shippingDetails.notes}</div>
							)}

							<Form.Group>
								<Form.Label>Your notes</Form.Label>
								<Form.Control
									as="textarea"
									rows={3}
									value={notes}
									onChange={(e) => setNotes(e.target.value)}
									placeholder="Add notes about this order…"
								/>
							</Form.Group>

							<Form.Group>
								<Form.Label>Assignment status</Form.Label>
								<Form.Select
									value={selectedOrder.assignmentStatus || "Assigned"}
									onChange={(e) => updateAssignmentStatus(selectedOrder._id, e.target.value, notes)}
									disabled={updatingId === selectedOrder._id}
								>
									{ASSIGNMENT_STATUSES.map((s) => (
										<option key={s} value={s}>{STATUS_LABELS[s]}</option>
									))}
								</Form.Select>
							</Form.Group>

							<div>
								<strong>Items</strong>
								<div className="mt-2 d-flex flex-column gap-2">
									{(selectedOrder.products || []).map((item, idx) => (
										<div key={idx} className="border rounded p-2">
											<div><strong>{item.name}</strong></div>
											<div className="small text-muted">Qty: {item.quantity} · ${Number(item.price || 0).toFixed(2)} each</div>
										</div>
									))}
								</div>
							</div>
						</div>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant="primary"
						className="admin-cta-btn"
						disabled={updatingId === selectedOrder?._id}
						onClick={() => updateAssignmentStatus(selectedOrder._id, selectedOrder.assignmentStatus, notes)}
					>
						Save notes
					</Button>
					<Button variant="secondary" onClick={() => setShowDetails(false)}>Close</Button>
				</Modal.Footer>
			</Modal>
		</section>
	);
}
