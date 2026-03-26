import { useEffect, useState } from "react";
import { BiEdit, BiTrash } from "react-icons/bi";
import { Button, Form, Modal } from "react-bootstrap";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import api from "../utils/api";
import { useAdminAuth } from "../context/AuthContext";

export default function YearsPage() {
	const { hasPermission } = useAdminAuth();
	const canEdit = hasPermission("edit_years");
	const [items, setItems] = useState([]);
	const [models, setModels] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingId, setEditingId] = useState("");
	const [form, setForm] = useState({ title: "", model: "" });
	const [saving, setSaving] = useState(false);
	const [globalFilter, setGlobalFilter] = useState("");

	useEffect(() => {
		fetchItems();
		fetchModels();
	}, []);

	const fetchItems = async () => {
		setLoading(true);
		try {
			const { data } = await api.get("/catalog/years/admin/all");
			setItems(data.data || []);
		} catch {
			// ignore
		} finally {
			setLoading(false);
		}
	};

	const fetchModels = async () => {
		try {
			const { data } = await api.get("/catalog/models");
			setModels(data.data || []);
		} catch {
			setModels([]);
		}
	};

	const openAddModal = () => {
		setEditingId("");
		setForm({ title: "", model: "" });
		setShowModal(true);
	};

	const openEditModal = (row) => {
		setEditingId(row._id);
		setForm({
			title: row.title || "",
			model: row.model?._id || row.model || "",
		});
		setShowModal(true);
	};

	const saveItem = async (event) => {
		event.preventDefault();
		if (!form.title.trim() || !form.model) return;
		setSaving(true);
		try {
			const payload = { title: form.title.trim(), model: form.model };
			if (editingId) {
				await api.put(`/catalog/years/${editingId}`, payload);
			} else {
				await api.post("/catalog/years", payload);
			}
			setShowModal(false);
			setEditingId("");
			setForm({ title: "", model: "" });
			fetchItems();
		} catch {
			// ignore
		} finally {
			setSaving(false);
		}
	};

	const deleteItem = async (row) => {
		if (!window.confirm(`Delete year "${row.title}"?`)) return;
		try {
			await api.delete(`/catalog/years/${row._id}`);
			setItems((prev) => prev.filter((item) => item._id !== row._id));
		} catch {
			// ignore
		}
	};

	const numberBody = (_row, options) => options.rowIndex + 1;
	const modelBody = (row) => row.model?.title || "-";
	const actionsBody = (row) => (
		<div className="d-flex align-items-center gap-2">
			<button type="button" className="admin-row-action" aria-label="Edit year" onClick={() => openEditModal(row)}>
				<BiEdit size={17} />
			</button>
			<button type="button" className="admin-row-action" aria-label="Delete year" onClick={() => deleteItem(row)}>
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
					<h2 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">Years <span className="admin-count-badge">{items.length}</span></h2>
					<p className="admin-subtle-text mb-0">Manage year titles used in product setup.</p>
				</div>
				{canEdit && <Button className="admin-cta-btn" onClick={openAddModal}>Add Year</Button>}
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
					globalFilterFields={["title", "model.title"]}
					paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
					emptyMessage="No years found."
				>
					<Column header="No" body={numberBody} style={{ width: "80px" }} />
					<Column field="title" header="Title" sortable />
					<Column header="Model" body={modelBody} sortable />
					<Column field="createdAt" header="Created" sortable body={(r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"} />
					{canEdit && <Column header="Actions" body={actionsBody} style={{ width: "120px" }} />}
				</DataTable>
			</div>

			{canEdit && <Modal show={showModal} onHide={() => setShowModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>{editingId ? "Edit Year" : "Add Year"}</Modal.Title>
				</Modal.Header>
				<Form onSubmit={saveItem}>
					<Modal.Body>
						<Form.Group className="mb-3">
							<Form.Label>Model</Form.Label>
							<Form.Select
								value={form.model}
								onChange={(event) => setForm((prev) => ({ ...prev, model: event.target.value }))}
								required
							>
								<option value="">- Select model -</option>
								{models.map((item) => (
									<option key={item._id} value={item._id}>{item.title}</option>
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
						<Button type="submit" className="admin-cta-btn" disabled={saving}>{saving ? "Saving..." : editingId ? "Update Year" : "Save Year"}</Button>
					</Modal.Footer>
				</Form>
			</Modal>}
		</section>
	);
}
