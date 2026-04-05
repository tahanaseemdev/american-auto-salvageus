import { useEffect, useState } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { BiShow } from "react-icons/bi";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import api from "../utils/api";
import { useAdminAuth } from "../context/AuthContext";

const ORDER_STATUSES = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];

const STATUS_COLORS = {
	Pending: "warn",
	Confirmed: "success",
	Shipped: "success",
	Delivered: "success",
	Cancelled: "danger",
};

export default function OrdersPage() {
	const { hasPermission } = useAdminAuth();
	const canEditOrders = hasPermission("edit_orders");
	const [orders, setOrders] = useState([]);
	const [loading, setLoading] = useState(true);
	const [globalFilter, setGlobalFilter] = useState("");
	const [showDetails, setShowDetails] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState(null);

	useEffect(() => { fetchOrders(); }, []);

	const fetchOrders = async () => {
		setLoading(true);
		try {
			const { data } = await api.get("/admin/orders?limit=100");
			setOrders(data.data?.orders || []);
		} catch { /* ignore */ } finally {
			setLoading(false);
		}
	};

	const updateStatus = async (orderId, newStatus) => {
		try {
			const { data } = await api.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
			setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, status: data.data.status } : o));
		} catch { /* ignore */ }
	};

	const numberBody = (_row, options) => options.rowIndex + 1;

	const statusBody = (row) => (
		<span className={`admin-tag ${STATUS_COLORS[row.status] || "warn"}`}>{row.status}</span>
	);

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

	const openDetailsModal = (row) => {
		setSelectedOrder(row);
		setShowDetails(true);
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
		<div className="admin-table-toolbar d-flex flex-wrap align-items-center justify-content-between gap-3">
			<div className="admin-search">
				<i className="pi pi-search" />
				<InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Search orders…" />
			</div>
			<Button variant="outline-secondary" size="sm" onClick={fetchOrders}>Refresh</Button>
		</div>
	);

	return (
		<section>
			<div className="d-flex justify-content-between align-items-center mb-3">
				<div>
					<h2 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">Orders</h2>
					<p className="admin-subtle-text mb-0">View and manage all customer orders.</p>
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
					<Column header="Total" body={totalBody} sortable field="totalAmount" />
					<Column header="Status" body={statusBody} sortable field="status" />
					<Column header="View" body={detailsButtonBody} style={{ width: "90px" }} />
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
								<strong>Status:</strong> {selectedOrder.status || "-"}
							</div>
							<div>
								<strong>Total:</strong> ${Number(selectedOrder.totalAmount || 0).toFixed(2)}
							</div>
							<div>
								<strong>Placed On:</strong> {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : "-"}
							</div>
							<div>
								<strong>Shipping Address:</strong>{" "}
								{selectedOrder.shippingDetails
									? `${selectedOrder.shippingDetails.address || ""}, ${selectedOrder.shippingDetails.city || ""}, ${selectedOrder.shippingDetails.state || ""}, ${selectedOrder.shippingDetails.zip || ""}`
									: "-"}
							</div>

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
		</section>
	);
}


