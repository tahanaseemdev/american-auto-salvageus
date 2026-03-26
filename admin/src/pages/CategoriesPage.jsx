import { useEffect, useState } from "react";
import { BiEdit, BiTrash } from "react-icons/bi";
import { Button, Form, Modal } from "react-bootstrap";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import api from "../utils/api";
import { resolveImageUrl } from "../utils/image";
import { useAdminAuth } from "../context/AuthContext";

export default function CategoriesPage() {
	const { hasPermission } = useAdminAuth();
	const canEditCategories = hasPermission("edit_categories");
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingId, setEditingId] = useState("");
	const [existingImage, setExistingImage] = useState("");
	const [globalFilter, setGlobalFilter] = useState("");
	const [form, setForm] = useState({ title: "", featured: false });
	const [imageFile, setImageFile] = useState(null);
	const [saving, setSaving] = useState(false);

	useEffect(() => { fetchCategories(); }, []);

	const fetchCategories = async () => {
		setLoading(true);
		try {
			const { data } = await api.get("/categories/admin/all");
			setCategories(data.data || []);
		} catch { /* ignore */ } finally {
			setLoading(false);
		}
	};

	const onChange = (event) => {
		const { name, value } = event.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const onSelectImage = (event) => {
		setImageFile(event.target.files?.[0] || null);
	};

	const uploadImageAndGetUrl = async () => {
		if (!imageFile) return "";
		const body = new FormData();
		body.append("image", imageFile);
		const { data } = await api.post("/admin/uploads/image", body, {
			headers: { "Content-Type": "multipart/form-data" },
		});
		return data.data?.imageUrl || "";
	};

	const saveCategory = async (event) => {
		event.preventDefault();
		if (!form.title.trim()) return;
		setSaving(true);
		try {
			const uploadedImageUrl = await uploadImageAndGetUrl();
			const payload = {
				title: form.title.trim(),
				featured: Boolean(form.featured),
				image: uploadedImageUrl || existingImage || "",
			};

			if (editingId) {
				await api.put(`/categories/${editingId}`, payload);
			} else {
				await api.post("/categories", payload);
			}

			setForm({ title: "", featured: false });
			setEditingId("");
			setExistingImage("");
			setImageFile(null);
			setShowModal(false);
			fetchCategories();
		} catch { /* ignore */ } finally {
			setSaving(false);
		}
	};

	const openAddModal = () => {
		setEditingId("");
		setExistingImage("");
		setForm({ title: "", featured: false });
		setImageFile(null);
		setShowModal(true);
	};

	const openEditModal = (row) => {
		setEditingId(row._id);
		setExistingImage(row.image || "");
		setForm({
			title: row.title || "",
			featured: Boolean(row.featured),
		});
		setImageFile(null);
		setShowModal(true);
	};

	const deleteCategory = async (row) => {
		if (!window.confirm(`Delete category "${row.title}"?`)) return;
		try {
			await api.delete(`/categories/${row._id}`);
			setCategories((prev) => prev.filter((c) => c._id !== row._id));
		} catch { /* ignore */ }
	};

	const imageBody = (row) => {
		if (!row.image) return "-";
		return <img src={resolveImageUrl(row.image)} alt={row.title} style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "8px" }} />;
	};

	const featuredBody = (row) => (
		<span className={`badge ${row.featured ? "text-bg-success" : "text-bg-secondary"}`}>{row.featured ? "Yes" : "No"}</span>
	);

	const numberBody = (_row, options) => options.rowIndex + 1;

	const actionsBody = (row) => (
		<div className="d-flex align-items-center gap-2">
			<button type="button" className="admin-row-action" aria-label="Edit part" onClick={() => openEditModal(row)}>
				<BiEdit size={17} />
			</button>
			<button type="button" className="admin-row-action" aria-label="Delete part" onClick={() => deleteCategory(row)}>
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
					<h2 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">Parts <span className="admin-count-badge">{categories.length}</span></h2>
					<p className="admin-subtle-text mb-0">Dashboard . Parts</p>
				</div>
				{canEditCategories && <Button className="admin-cta-btn" onClick={openAddModal}>Add Part</Button>}
			</div>

			<div className="admin-table-wrap">
				<DataTable
					value={categories}
					header={header}
					className="admin-data-table"
					loading={loading}
					paginator
					rows={7}
					globalFilter={globalFilter}
					globalFilterFields={["title", "image"]}
					paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink"
					emptyMessage="No categories found."
				>
					<Column header="No" body={numberBody} style={{ width: "80px" }} />
					<Column field="title" header="Title" sortable />
					<Column header="Featured" body={featuredBody} sortable field="featured" />
					<Column header="Image" body={imageBody} style={{ width: "120px" }} />
					<Column field="createdAt" header="Created" sortable body={(r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"} />
					{canEditCategories && <Column header="Actions" body={actionsBody} style={{ width: "120px" }} />}
				</DataTable>
			</div>

			{canEditCategories && <Modal show={showModal} onHide={() => setShowModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>{editingId ? "Edit Part" : "Add Part"}</Modal.Title>
				</Modal.Header>
				<Form onSubmit={saveCategory}>
					<Modal.Body>
						<Form.Group className="mb-3">
							<Form.Label>Part Title</Form.Label>
							<Form.Control name="title" value={form.title} onChange={onChange} required />
						</Form.Group>
						<Form.Group className="mb-3">
							<Form.Label>Image</Form.Label>
							<Form.Control type="file" accept="image/*" onChange={onSelectImage} />
							<Form.Text className="text-muted">Optional. Upload from your device.</Form.Text>
							{existingImage && !imageFile && (
								<div className="mt-2">
									<img src={resolveImageUrl(existingImage)} alt="Current" style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "8px" }} />
								</div>
							)}
						</Form.Group>
						<Form.Check
							type="switch"
							id="category-featured"
							name="featured"
							label="Featured Part"
							checked={Boolean(form.featured)}
							onChange={(event) => setForm((prev) => ({ ...prev, featured: event.target.checked }))}
						/>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
						<Button type="submit" className="admin-cta-btn" disabled={saving}>{saving ? "Saving…" : editingId ? "Update Part" : "Save Part"}</Button>
					</Modal.Footer>
				</Form>
			</Modal>}
		</section>
	);
}
