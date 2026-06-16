import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { BiShow, BiUserPlus } from "react-icons/bi";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { toast } from "react-toastify";
import api from "../utils/api";
import { useAdminAuth } from "../context/AuthContext";

const ORDER_STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
const ASSIGNMENT_STATUSES = ["Assigned", "InProgress", "Completed", "Rejected", "Cancelled"];

const ASSIGNMENT_LABELS = {
	Assigned: "Assigned",
	InProgress: "In Progress",
	Completed: "Completed",
	Rejected: "Rejected",
	Cancelled: "Cancelled",
};

const STATUS_COLORS = {
	Pending: "warn",
	Confirmed: "success",
	Shipped: "success",
	Delivered: "success",
	Cancelled: "danger",
	Assigned: "warn",
	InProgress: "success",
	Completed: "success",
	Rejected: "danger",
};

export default function OrdersPage() {
	const { hasPermission } = useAdminAuth();
	const canEditOrders = hasPermission("edit_orders");
	const [orders, setOrders] = useState([]);
	const [employees, setEmployees] = useState([]);
	const [loading, setLoading] = useState(true);
	const [globalFilter, setGlobalFilter] = useState("");
	const [assignmentFilter, setAssignmentFilter] = useState("");
	const [unassignedOnly, setUnassignedOnly] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [showAssignModal, setShowAssignModal] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState(null);
	const [reassignEmployeeId, setReassignEmployeeId] = useState("");
	const [assignNote, setAssignNote] = useState("");
	const [reassigning, setReassigning] = useState(false);

	useEffect(() => {
		fetchOrders();
		if (canEditOrders) fetchEmployees();
	}, [assignmentFilter, unassignedOnly, canEditOrders]);

	const fetchOrders = async () => {
		setLoading(true);
		try {
			const params = new URLSearchParams({ limit: "100" });
			if (assignmentFilter) params.set("assignmentStatus", assignmentFilter);
			if (unassignedOnly) params.set("unassigned", "true");
			const { data } = await api.get(`/admin/orders?${params}`);
			setOrders(data.data?.orders || []);
		} catch {
			toast.error("Failed to load orders.");
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

	const updateStatus = async (orderId, newStatus) => {
		try {
			const { data } = await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
			setOrders((prev) => prev.map((o) => (o._id === orderId ? { ...o, status: data.data.status } : o)));
		} catch {
			toast.error("Failed to update status.");
		}
	};

	const assignOrder = async () => {
		if (!selectedOrder || !reassignEmployeeId) return;
		setReassigning(true);
		try {
			const { data } = await api.patch(`/admin/orders/${selectedOrder._id}/reassign`, {
				employeeId: reassignEmployeeId,
				note: assignNote.trim() || undefined,
			});
			setOrders((prev) => prev.map((o) => (o._id === selectedOrder._id ? data.data : o)));
			setSelectedOrder(data.data);
			setReassignEmployeeId(data.data.assignedTo?._id || "");
			setAssignNote(data.data.employeeNotes || "");
			toast.success(data.message || "Order assigned.");
			setShowAssignModal(false);
		} catch (err) {
			toast.error(err.response?.data?.message || "Failed to assign order.");
		} finally {
			setReassigning(false);
		}
	};

	const numberBody = (_row, options) => options.rowIndex + 1;

	const statusBody = (row) => (
		<span className={`admin-tag ${STATUS_COLORS[row.status] || "warn"}`}>{row.status}</span>
	);

	const assignmentBody = (row) => {
		if (!row.assignedTo) return <span className="admin-tag danger">Unassigned</span>;
		return (
			<div>
				<div className="small fw-semibold">{row.assignedTo.name}</div>
				{row.assignmentStatus && (
					<span className={`admin-tag ${STATUS_COLORS[row.assignmentStatus] || "warn"}`}>
						{ASSIGNMENT_LABELS[row.assignmentStatus] || row.assignmentStatus}
					</span>
				)}
			</div>
		);
	};

	const statusActionBody = (row) => (
		<Form.Select
			value={row.status}
			onChange={(e) => updateStatus(row._id, e.target.value)}
			size="sm"
			style={{ minWidth: "130px" }}
		>
			{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
		</Form.Select>
	);

	const customerBody = (row) => {
		if (row.user?.name) return row.user.name;
		if (row.shippingDetails?.firstName) return `${row.shippingDetails.firstName} ${row.shippingDetails.lastName}`;
		return "Guest";
	};

	const openAssignModal = (row) => {
		setSelectedOrder(row);
		setReassignEmployeeId(row.assignedTo?._id || "");
		setAssignNote(row.employeeNotes || "");
		setShowAssignModal(true);
	};

	const openDetailsModal = (row) => {
		setSelectedOrder(row);
		setReassignEmployeeId(row.assignedTo?._id || "");
		setAssignNote(row.employeeNotes || "");
		setShowDetails(true);
	};

	const assignActionBody = (row) => {
		if (!canEditOrders) return null;
		return (
			<Button
				variant={row.assignedTo ? "outline-secondary" : "outline-primary"}
				size="sm"
				className={!row.assignedTo ? "admin-cta-btn" : ""}
				onClick={() => openAssignModal(row)}
				title={row.assignedTo ? "Reassign order" : "Assign order to employee"}
			>
				<BiUserPlus size={16} className="me-1" />
				{row.assignedTo ? "Reassign" : "Assign"}
			</Button>
		);
	};

	const detailsButtonBody = (row) => (
		<button type="button" className="admin-row-action" aria-label="View order" onClick={() => openDetailsModal(row)}>
			<BiShow size={17} />
		</button>
	);

	const totalBody = (row) => `$${Number(row.totalAmount || 0).toFixed(2)}`;

	const getOrderCustomerName = (order) => {
		if (order.user?.name) return order.user.name;
		if (order.shippingDetails?.firstName) return `${order.shippingDetails.firstName} ${order.shippingDetails.lastName || ""}`.trim();
		return "Guest";
	};

	const dateBody = (row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "—";

	const header = (
		<div className="d-flex flex-column gap-3">
			<div className="d-flex flex-wrap gap-2 align-items-center">
				<Form.Select
					size="sm"
					style={{ maxWidth: "200px" }}
					value={assignmentFilter}
					onChange={(e) => setAssignmentFilter(e.target.value)}
				>
					<option value="">All assignment statuses</option>
					{ASSIGNMENT_STATUSES.map((s) => (
						<option key={s} value={s}>{ASSIGNMENT_LABELS[s]}</option>
					))}
				</Form.Select>
				<Form.Check
					type="checkbox"
					id="unassigned-only"
					label="Unassigned only"
					checked={unassignedOnly}
					onChange={(e) => setUnassignedOnly(e.target.checked)}
				/>
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
			<div className="d-flex justify-content-between align-items-center mb-3">
				<div>
					<h2 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">Orders</h2>
					<p className="admin-subtle-text mb-0">View and manage all customer orders and employee assignments.</p>
				</div>
			</div>

			<div className="admin-table-wrap">
				<DataTable
					value={orders}
					header={header}
					className="admin-data-table"
					loading={loading}
					paginator
					rows={10}
					globalFilter={globalFilter}
					globalFilterFields={["orderNumber", "status"]}
					paginatorTemplate="PrevPageLink NextPageLink"
					emptyMessage="No orders found."
					sortField="createdAt"
					sortOrder={-1}
				>
					<Column header="No" body={numberBody} style={{ width: "60px" }} />
					<Column field="orderNumber" header="Order #" sortable />
					<Column header="Customer" body={customerBody} />
					<Column header="Assigned To" body={assignmentBody} />
					<Column header="Total" body={totalBody} sortable field="totalAmount" />
					<Column header="Fulfillment" body={statusBody} sortable field="status" />
					{canEditOrders && <Column header="Assign" body={assignActionBody} style={{ width: "120px" }} />}
					<Column header="View" body={detailsButtonBody} style={{ width: "70px" }} />
					{canEditOrders && <Column header="Update Status" body={statusActionBody} style={{ width: "160px" }} />}
					<Column header="Date" body={dateBody} sortable field="createdAt" />
				</DataTable>
			</div>

			<Modal show={showDetails} onHide={() => setShowDetails(false)} centered size="lg">
				<Modal.Header closeButton>
					<Modal.Title>Order Details</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{selectedOrder && (
						<div className="d-flex flex-column gap-3">
							<div>
								<strong>Order Number:</strong> {selectedOrder.orderNumber || "-"}
							</div>
							<div>
								<strong>Customer:</strong> {getOrderCustomerName(selectedOrder)}
							</div>
							<div>
								<strong>Email:</strong> {selectedOrder.shippingDetails?.email || "-"}
							</div>
							<div>
								<strong>Phone:</strong> {selectedOrder.shippingDetails?.phone || "-"}
							</div>
							<div>
								<strong>Fulfillment status:</strong> {selectedOrder.status || "-"}
							</div>
							<div>
								<strong>Assigned to:</strong>{" "}
								{selectedOrder.assignedTo
									? `${selectedOrder.assignedTo.name} (${ASSIGNMENT_LABELS[selectedOrder.assignmentStatus] || selectedOrder.assignmentStatus || "—"})`
									: "Unassigned"}
							</div>
							{selectedOrder.employeeNotes && (
								<div><strong>Employee notes:</strong> {selectedOrder.employeeNotes}</div>
							)}
							<div>
								<strong>Total:</strong> ${Number(selectedOrder.totalAmount || 0).toFixed(2)}
							</div>
							<div>
								<strong>Placed On:</strong> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : "-"}
							</div>
							<div>
								<strong>Shipping Address:</strong>{" "}
								{selectedOrder.shippingDetails
									? `${selectedOrder.shippingDetails.address || selectedOrder.shippingDetails.street || ""}, ${selectedOrder.shippingDetails.city || ""}, ${selectedOrder.shippingDetails.state || ""}, ${selectedOrder.shippingDetails.zip || ""}`
									: "-"}
							</div>

							{canEditOrders && (
								<div className="border rounded p-3 bg-light">
									<div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
										<strong>
											{selectedOrder.assignedTo ? "Assigned to employee" : "Not assigned yet"}
										</strong>
										<Button size="sm" className="admin-cta-btn" onClick={() => { setShowDetails(false); openAssignModal(selectedOrder); }}>
											<BiUserPlus size={16} className="me-1" />
											{selectedOrder.assignedTo ? "Reassign" : "Assign"}
										</Button>
									</div>
									{selectedOrder.assignedTo && (
										<p className="small mb-0 text-muted">
											{selectedOrder.assignedTo.name} — {ASSIGNMENT_LABELS[selectedOrder.assignmentStatus] || selectedOrder.assignmentStatus || "—"}
										</p>
									)}
								</div>
							)}

							{Array.isArray(selectedOrder.assignmentHistory) && selectedOrder.assignmentHistory.length > 0 && (
								<div>
									<strong>Assignment history</strong>
									<div className="mt-2 d-flex flex-column gap-1 small">
										{selectedOrder.assignmentHistory.map((entry, idx) => (
											<div key={idx} className="text-muted">
												{entry.action} — {entry.at ? new Date(entry.at).toLocaleString() : ""}
												{entry.note ? ` (${entry.note})` : ""}
											</div>
										))}
									</div>
								</div>
							)}

							<div>
								<strong>Items</strong>
								<div className="mt-2 d-flex flex-column gap-2">
									{Array.isArray(selectedOrder.products) && selectedOrder.products.length > 0 ? (
										selectedOrder.products.map((item, idx) => (
											<div key={`${item.product?._id || item.product || "item"}-${idx}`} className="border rounded p-2">
												<div><strong>Product:</strong> {item.name || item.product?.name || "Item"}</div>
												<div><strong>Qty:</strong> {item.quantity || 0}</div>
												<div><strong>Price:</strong> ${Number(item.price || 0).toFixed(2)}</div>
											</div>
										))
									) : (
										<div className="text-muted">No items found.</div>
									)}
								</div>
							</div>
						</div>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowDetails(false)}>Close</Button>
				</Modal.Footer>
			</Modal>

			<Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>
						{selectedOrder?.assignedTo ? "Reassign order" : "Assign order to employee"}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{selectedOrder && (
						<div className="d-flex flex-column gap-3">
							<div className="border rounded p-3 bg-light small">
								<div><strong>Order:</strong> {selectedOrder.orderNumber}</div>
								<div><strong>Customer:</strong> {getOrderCustomerName(selectedOrder)}</div>
								<div><strong>Total:</strong> ${Number(selectedOrder.totalAmount || 0).toFixed(2)}</div>
								{selectedOrder.assignedTo && (
									<div className="mt-1 text-muted">
										Currently assigned to: <strong>{selectedOrder.assignedTo.name}</strong>
									</div>
								)}
							</div>

							<Form.Group>
								<Form.Label className="fw-semibold">Employee *</Form.Label>
								<Form.Select
									value={reassignEmployeeId}
									onChange={(e) => setReassignEmployeeId(e.target.value)}
									disabled={!employees.length}
								>
									<option value="">{employees.length ? "Select employee…" : "No active employees — add one on Employees page"}</option>
									{employees.map((emp) => (
										<option key={emp._id} value={emp._id}>{emp.name} ({emp.email})</option>
									))}
								</Form.Select>
							</Form.Group>

							<Form.Group>
								<Form.Label className="fw-semibold">Note for employee (optional)</Form.Label>
								<Form.Control
									as="textarea"
									rows={4}
									value={assignNote}
									onChange={(e) => setAssignNote(e.target.value)}
									placeholder="Instructions for the employee, e.g. priority callback, part check…"
								/>
							</Form.Group>

							<p className="small text-muted mb-0">
								The employee and admin inbox will both receive an email when you assign.
							</p>
						</div>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
					<Button
						className="admin-cta-btn"
						disabled={!reassignEmployeeId || reassigning || !employees.length}
						onClick={assignOrder}
					>
						{reassigning
							? "Saving…"
							: selectedOrder?.assignedTo
								? "Reassign & notify"
								: "Assign & notify"}
					</Button>
				</Modal.Footer>
			</Modal>
		</section>
	);
}
