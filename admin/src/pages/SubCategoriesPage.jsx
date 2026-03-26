import { useEffect, useState } from "react";
import { BiEdit, BiTrash } from "react-icons/bi";
import { Button, Form, Modal } from "react-bootstrap";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import api from "../utils/api";
import { useAdminAuth } from "../context/AuthContext";

export default function SubCategoriesPage() {
	const { hasPermission } = useAdminAuth();
	const canEditSubCategories = hasPermission("edit_sub_categories");
	const [subCategories, setSubCategories] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingId, setEditingId] = useState("");
	const [globalFilter, setGlobalFilter] = useState("");
	const [form, setForm] = useState({ name: "", category: "" });
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		fetchSubCategories();
		fetchCategories();
	}, []);

	const fetchSubCategories = async () => {
		setLoading(true);
		try {
			const { data } = await api.get("/categories/sub/admin/list");
			setSubCategories(data.data || []);
		} catch {
			// ignore
		} finally {
			setLoading(false);
		}
	};

	const fetchCategories = async () => {
		try {
			const { data } = await api.get("/categories");
			setCategories(data.data || []);
		} catch {
			// ignore
		}
	};

	const onChange = (event) => {
		const { name, value } = event.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const saveSubCategory = async (event) => {
		event.preventDefault();
		if (!form.name.trim() || !form.category) return;
		setSaving(true);
		try {
			const payload = {
				name: form.name.trim(),
				category: form.category,
			};

			if (editingId) {
				await api.put(`/categories/sub/${editingId}`, payload);
			} else {
				await api.post("/categories/sub", payload);
			}

			setForm({ name: "", category: "" });
			setEditingId("");
			setShowModal(false);
			fetchSubCategories();
		} catch {
			// ignore
		} finally {
			setSaving(false);
		}
	};

	const openAddModal = () => {
		setEditingId("");
		setForm({ name: "", category: "" });
		setShowModal(true);
	};

	const openEditModal = (row) => {
		setEditingId(row._id);
		setForm({ name: row.name || "", category: row.category?._id || row.category || "" });
		setShowModal(true);
	};

	const deleteSubCategory = async (row) => {
		if (!window.confirm(`Delete sub category "${row.name}"?`)) return;
		try {
			await api.delete(`/categories/sub/${row._id}`);
			setSubCategories((prev) => prev.filter((item) => item._id !== row._id));
		} catch {
			// ignore
		}
	};

	const numberBody = (_row, options) => options.rowIndex + 1;
	const categoryBody = (row) => row.category?.title || "-";

	const actionsBody = (row) => (
		<div className="d-flex align-items-center gap-2">
			<button type="button" className="admin-row-action" aria-label="Edit make" onClick={() => openEditModal(row)}>
				<BiEdit size={17} />
			</button>
			<button type="button" className="admin-row-action" aria-label="Delete make" onClick={() => deleteSubCategory(row)}>
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
					<h2 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">Makes <span className="admin-count-badge">{subCategories.length}</span></h2>
					<p className="admin-subtle-text mb-0">Manage makes by parent part.</p>
				</div>
				{canEditSubCategories && <Button className="admin-cta-btn" onClick={openAddModal}>Add Make</Button>}
			</div>

			<div className="admin-table-wrap">
				<DataTable
					value={subCategories}
					header={header}
					className="admin-data-table"
					loading={loading}
					paginator
					rows={7}
					globalFilter={globalFilter}
					globalFilterFields={["name", "category.title"]}
					paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
					emptyMessage="No sub categories found."
				>
					<Column header="No" body={numberBody} style={{ width: "80px" }} />
					<Column field="name" header="Make Title" sortable />
					<Column header="Part" body={categoryBody} sortable />
					<Column field="createdAt" header="Created" sortable body={(r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"} />
					{canEditSubCategories && <Column header="Actions" body={actionsBody} style={{ width: "120px" }} />}
				</DataTable>
			</div>

			{canEditSubCategories && <Modal show={showModal} onHide={() => setShowModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>{editingId ? "Edit Make" : "Add Make"}</Modal.Title>
				</Modal.Header>
				<Form onSubmit={saveSubCategory}>
					<Modal.Body>
						<Form.Group className="mb-3">
							<Form.Label>Make Title</Form.Label>
							<Form.Control name="name" value={form.name} onChange={onChange} required />
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>Part</Form.Label>
							<Form.Select name="category" value={form.category} onChange={onChange} required>
								<option value="">- Select part -</option>
								{categories.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
							</Form.Select>
						</Form.Group>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
						<Button type="submit" className="admin-cta-btn" disabled={saving}>{saving ? "Saving..." : editingId ? "Update Make" : "Save Make"}</Button>
					</Modal.Footer>
				</Form>
			</Modal>}
		</section>
	);
}
