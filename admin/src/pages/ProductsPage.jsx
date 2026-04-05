import { useEffect, useState } from "react";
import { BiEdit, BiTrash } from "react-icons/bi";
import { Button, Form, Modal } from "react-bootstrap";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import api from "../utils/api";
import { resolveImageUrl } from "../utils/image";
import { useAdminAuth } from "../context/AuthContext";

export default function ProductsPage() {
	const { hasPermission } = useAdminAuth();
	const canEditProducts = hasPermission("edit_products");
	const [products, setProducts] = useState([]);
	const [categories, setCategories] = useState([]);
	const [subCategories, setSubCategories] = useState([]);
	const [models, setModels] = useState([]);
	const [years, setYears] = useState([]);
	const [trims, setTrims] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [editingId, setEditingId] = useState("");
	const [existingImage, setExistingImage] = useState("");
	const [globalFilter, setGlobalFilter] = useState("");
	const [form, setForm] = useState({ name: "", model: "", year: "", trim: "", featured: false, category: "", subCategory: "", price: "" });
	const [imageFile, setImageFile] = useState(null);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		fetchProducts();
		fetchCategories();
	}, []);

	useEffect(() => {
		fetchSubCategories();
	}, []);

	useEffect(() => {
		if (form.subCategory) {
			fetchModels(form.subCategory);
		} else {
			setModels([]);
		}
	}, [form.subCategory]);

	useEffect(() => {
		if (form.model) {
			fetchYears(form.model);
		} else {
			setYears([]);
		}
	}, [form.model]);

	useEffect(() => {
		if (form.year) {
			fetchTrims(form.year);
		} else {
			setTrims([]);
		}
	}, [form.year]);

	const fetchProducts = async () => {
		setLoading(true);
		try {
			const { data } = await api.get("/products/admin/all?limit=100");
			setProducts(data.data?.products || []);
		} catch { /* ignore */ } finally {
			setLoading(false);
		}
	};

	const fetchCategories = async () => {
		try {
			const { data } = await api.get("/categories");
			setCategories(data.data || []);
		} catch { /* ignore */ }
	};

	const fetchSubCategories = async () => {
		try {
			const { data } = await api.get("/categories/sub/list");
			setSubCategories(data.data || []);
		} catch {
			setSubCategories([]);
		}
	};

	const fetchModels = async (makeId) => {
		try {
			const { data } = await api.get(`/catalog/models?make=${makeId}`);
			setModels(data.data || []);
		} catch {
			setModels([]);
		}
	};

	const fetchYears = async (modelId) => {
		try {
			const { data } = await api.get(`/catalog/years?model=${modelId}`);
			setYears(data.data || []);
		} catch {
			setYears([]);
		}
	};

	const fetchTrims = async (yearId) => {
		try {
			const { data } = await api.get(`/catalog/trims?year=${yearId}`);
			setTrims(data.data || []);
		} catch {
			setTrims([]);
		}
	};

	const onChange = (event) => {
		const { name, value } = event.target;
		setForm((prev) => {
			const next = { ...prev, [name]: value };
			if (name === "category") {
				next.model = "";
				next.year = "";
				next.trim = "";
			}
			if (name === "subCategory") {
				next.model = "";
				next.year = "";
				next.trim = "";
			}
			if (name === "model") {
				next.year = "";
				next.trim = "";
			}
			if (name === "year") {
				next.trim = "";
			}
			return next;
		});
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

	const saveProduct = async (event) => {
		event.preventDefault();
		if (!form.name.trim() || !form.category || form.price === "") return;
		setSaving(true);
		try {
			const uploadedImageUrl = await uploadImageAndGetUrl();
			const payload = {
				name: form.name.trim(),
				model: form.model || null,
				year: form.year || null,
				trim: form.trim || null,
				featured: Boolean(form.featured),
				price: Number(form.price) || 0,
				image: uploadedImageUrl || existingImage || "",
				category: form.category,
				subCategory: form.subCategory || null,
			};

			if (editingId) {
				await api.put(`/products/${editingId}`, payload);
			} else {
				await api.post("/products", payload);
			}

			setForm({ name: "", model: "", year: "", trim: "", featured: false, category: "", subCategory: "", price: "" });
			setEditingId("");
			setExistingImage("");
			setImageFile(null);
			setShowModal(false);
			fetchProducts();
		} catch { /* ignore */ } finally {
			setSaving(false);
		}
	};

	const openAddModal = () => {
		setEditingId("");
		setExistingImage("");
		setForm({ name: "", model: "", year: "", trim: "", featured: false, category: "", subCategory: "", price: "" });
		setImageFile(null);
		setShowModal(true);
	};

	const openEditModal = (row) => {
		setEditingId(row._id);
		setExistingImage(row.image || "");
		setForm({
			name: row.name || "",
			model: row.model?._id || row.model || "",
			year: row.year?._id || row.year || "",
			trim: row.trim?._id || row.trim || "",
			featured: Boolean(row.featured),
			category: row.category?._id || row.category || "",
			subCategory: row.subCategory?._id || row.subCategory || "",
			price: row.price ?? "",
		});
		setImageFile(null);
		setShowModal(true);
	};

	const deleteProduct = async (row) => {
		if (!window.confirm(`Delete product "${row.name}"?`)) return;
		try {
			await api.delete(`/products/${row._id}`);
			setProducts((prev) => prev.filter((p) => p._id !== row._id));
		} catch { /* ignore */ }
	};

	const priceBody = (row) => `$${Number(row.price).toFixed(2)}`;
	const numberBody = (_row, options) => options.rowIndex + 1;
	const categoryBody = (row) => row.category?.title || "—";
	const subCategoryBody = (row) => row.subCategory?.name || "—";
	const modelBody = (row) => row.model?.title || "—";
	const yearBody = (row) => row.year?.title || "—";
	const trimBody = (row) => row.trim?.title || "—";
	const featuredBody = (row) => (
		<span className={`badge ${row.featured ? "text-bg-success" : "text-bg-secondary"}`}>{row.featured ? "Yes" : "No"}</span>
	);
	const imageBody = (row) => {
		if (!row.image) return "-";
		return <img src={resolveImageUrl(row.image)} alt={row.name} style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "8px" }} />;
	};

	const actionsBody = (row) => (
		<div className="d-flex align-items-center gap-2">
			<button type="button" className="admin-row-action" aria-label="Edit product" onClick={() => openEditModal(row)}>
				<BiEdit size={17} />
			</button>
			<button type="button" className="admin-row-action" aria-label="Delete product" onClick={() => deleteProduct(row)}>
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
					<h2 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">Products <span className="admin-count-badge">{products.length}</span></h2>
					<p className="admin-subtle-text mb-0">Add and monitor products with Part, Make, Model, Year, and Trim mapping.</p>
				</div>
				{canEditProducts && <Button className="admin-cta-btn" onClick={openAddModal}>Add Product</Button>}
			</div>

			<div className="admin-table-wrap">
				<DataTable
					value={products}
					header={header}
					className="admin-data-table"
					loading={loading}
					paginator
					rows={7}
					globalFilter={globalFilter}
					globalFilterFields={["name", "model.title", "trim.title", "year.title", "category.title", "subCategory.name"]}
					paginatorTemplate="PrevPageLink NextPageLink"
					emptyMessage="No products found."
				>
					<Column header="No" body={numberBody} style={{ width: "80px" }} />
					<Column field="name" header="Product" sortable />
					<Column header="Model" body={modelBody} sortable field="model" />
					<Column header="Year" body={yearBody} sortable field="year" />
					<Column header="Trim" body={trimBody} sortable field="trim" />
					<Column header="Featured" body={featuredBody} sortable field="featured" />
					<Column header="Part" body={categoryBody} sortable />
					<Column header="Make" body={subCategoryBody} sortable />
					<Column header="Price" body={priceBody} sortable field="price" />
					<Column header="Image" body={imageBody} style={{ width: "110px" }} />
					{canEditProducts && <Column header="Actions" body={actionsBody} style={{ width: "100px" }} />}
				</DataTable>
			</div>

			{canEditProducts && <Modal show={showModal} onHide={() => setShowModal(false)} centered>
				<Modal.Header closeButton>
					<Modal.Title>{editingId ? "Edit Product" : "Add Product"}</Modal.Title>
				</Modal.Header>
				<Form onSubmit={saveProduct}>
					<Modal.Body>
						<Form.Group className="mb-3">
							<Form.Label>Product Name</Form.Label>
							<Form.Control name="name" value={form.name} onChange={onChange} required />
						</Form.Group>
						<div className="row g-3 mb-3">
							<div className="col-md-4">
								<Form.Label>Model</Form.Label>
								<Form.Select name="model" value={form.model} onChange={onChange} disabled={!form.subCategory}>
									<option value="">— Select model —</option>
									{models.map((item) => <option key={item._id} value={item._id}>{item.title}</option>)}
								</Form.Select>
							</div>
							<div className="col-md-4">
								<Form.Label>Year</Form.Label>
								<Form.Select name="year" value={form.year} onChange={onChange} disabled={!form.model}>
									<option value="">— Select year —</option>
									{years.map((item) => <option key={item._id} value={item._id}>{item.title}</option>)}
								</Form.Select>
							</div>
							<div className="col-md-4">
								<Form.Label>Trim</Form.Label>
								<Form.Select name="trim" value={form.trim} onChange={onChange} disabled={!form.year}>
									<option value="">— Select trim —</option>
									{trims.map((item) => <option key={item._id} value={item._id}>{item.title}</option>)}
								</Form.Select>
							</div>
						</div>
						<Form.Check
							type="switch"
							id="product-featured"
							name="featured"
							label="Featured Product"
							checked={Boolean(form.featured)}
							onChange={(event) => setForm((prev) => ({ ...prev, featured: event.target.checked }))}
							className="mb-3"
						/>
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
						<div className="row g-3">
							<div className="col-md-6">
								<Form.Label>Part</Form.Label>
								<Form.Select name="category" value={form.category} onChange={onChange} required>
									<option value="">— Select part —</option>
									{categories.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}
								</Form.Select>
							</div>
							<div className="col-md-6">
								<Form.Label>Make</Form.Label>
								<Form.Select name="subCategory" value={form.subCategory} onChange={onChange} disabled={!form.category}>
									<option value="">— None —</option>
									{subCategories.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
								</Form.Select>
							</div>
							<div className="col-12">
								<Form.Label>Price ($)</Form.Label>
								<Form.Control type="number" min="0" step="0.01" name="price" value={form.price} onChange={onChange} required />
							</div>
						</div>
					</Modal.Body>
					<Modal.Footer>
						<Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
						<Button type="submit" className="admin-cta-btn" disabled={saving}>{saving ? "Saving…" : editingId ? "Update Product" : "Save Product"}</Button>
					</Modal.Footer>
				</Form>
			</Modal>}
		</section>
	);
}


