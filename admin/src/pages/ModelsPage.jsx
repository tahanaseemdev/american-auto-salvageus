import { useEffect, useState } from "react";
import { BiEdit, BiTrash } from "react-icons/bi";
import { Button, Form, Modal } from "react-bootstrap";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import api from "../utils/api";
import { useAdminAuth } from "../context/AuthContext";

export default function ModelsPage() {
	const { hasPermission } = useAdminAuth();
	const canEdit = hasPermission("edit_models");
	const [items, setItems] = useState([]);
	const [makes, setMakes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingId, setEditingId] = useState("");
	const [form, setForm] = useState({ title: "", make: "" });
	const [saving, setSaving] = useState(false);
	const [globalFilter, setGlobalFilter] = useState("");

	useEffect(() => {
		fetchItems();
		fetchMakes();
	}, []);

	const fetchItems = async () => {
		setLoading(true);
		try {
			const { data } = await api.get("/catalog/models/admin/all");
			setItems(data.data || []);
		} catch {
			// ignore
		} finally {
			setLoading(false);
		}
	};

	const fetchMakes = async () => {
		try {
			const { data } = await api.get("/categories/sub/list");
			setMakes(data.data || []);
		} catch {
			setMakes([]);
		}
	};

	const openAddModal = () => {
		setEditingId("");
		setForm({ title: "", make: "" });
		setShowModal(true);
	};

	const openEditModal = (row) => {
		setEditingId(row._id);
		setForm({
			title: row.title || "",
			make: row.make?._id || row.make || "",
		});
		setShowModal(true);
	};

	const saveItem = async (event) => {
		event.preventDefault();
		if (!form.title.trim() || !form.make) return;
		setSaving(true);
		try {
			const payload = { title: form.title.trim(), make: form.make };
			if (editingId) {
				await api.put(`/catalog/models/${editingId}`, payload);
			} else {
				await api.post("/catalog/models", payload);
			}
			setShowModal(false);
			setEditingId("");
			setForm({ title: "", make: "" });
			fetchItems();
		} catch {
			// ignore
		} finally {
			setSaving(false);
		}
	};

	const deleteItem = async (row) => {
		if (!window.confirm(`Delete model "${row.title}"?`)) return;
		try {
			await api.delete(`/catalog/models/${row._id}`);
			setItems((prev) => prev.filter((item) => item._id !== row._id));
		} catch {
			// ignore
		}
	};

	const numberBody = (_row, options) => options.rowIndex + 1;
	const makeBody = (row) => row.make?.name || "-";
	const actionsBody = (row) => (
		<div className="d-flex align-items-center gap-2">
			<button type="button" className="admin-row-action" aria-label="Edit model" onClick={() => openEditModal(row)}>
				<BiEdit size={17} />
			</button>
			<button type="button" className="admin-row-action" aria-label="Delete model" onClick={() => deleteItem(row)}>
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
					<h2 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">Models</h2>
					<p className="admin-subtle-text mb-0">Manage vehicle model titles used in product setup.</p>
				</div>
				{canEdit && <Button className="admin-cta-btn" onClick={openAddModal}>Add Model</Button>}
			</div>

			<div className="admin-table-wrap">
				<DataTable
					value={items}
					header={header}
					className="admin-data-table"
					loading={loading}
					paginator
					rows={7}
					globalFilter={globalFilter}
					globalFilterFields={["title", "make.name"]}
					paginatorTemplate="PrevPageLink NextPageLink"
					emptyMessage="No models found."
				>
					<Column header="No" body={numberBody} style={{ width: "80px" }} />
					<Column field="title" header="Title" sortable />
					<Column header="Make" body={makeBody} sortable />
					<Column field="createdAt" header="Created" sortable body={(r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"} />
					{canEdit && <Column header="Actions" body={actionsBody} style={{ width: "120px" }} />}
				</DataTable>
			</div>

			{canEdit && <Modal show={showModal} onHide={() => setShowModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>{editingId ? "Edit Model" : "Add Model"}</Modal.Title>
				</Modal.Header>
				<Form onSubmit={saveItem}>
					<Modal.Body>
						<Form.Group className="mb-3">
							<Form.Label>Make</Form.Label>
							<Form.Select
								value={form.make}
								onChange={(event) => setForm((prev) => ({ ...prev, make: event.target.value }))}
								required
							>
								<option value="">- Select make -</option>
								{makes.map((item) => (
									<option key={item._id} value={item._id}>{item.name}</option>
								))}
							</Form.Select>
						</Form.Group>
						<Form.Group>
							<Form.Label>Title</Form.Label>
							<Form.Control value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} required />
						</Form.Group>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
						<Button type="submit" className="admin-cta-btn" disabled={saving}>{saving ? "Saving..." : editingId ? "Update Model" : "Save Model"}</Button>
					</Modal.Footer>
				</Form>
			</Modal>}
		</section>
	);
}


