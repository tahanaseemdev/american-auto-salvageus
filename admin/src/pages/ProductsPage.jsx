import { useCallback, useEffect, useState } from "react";
import { BiEdit, BiTrash } from "react-icons/bi";
import { Button, Form, Modal, Nav, Tab } from "react-bootstrap";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import api from "../utils/api";
import { sortPartsWithPriority } from "../utils/partSort";
import { useAdminAuth } from "../context/AuthContext";

const EMPTY_FORM = {
	title: "",
	part: "",
	make: "",
	model: "",
	year: "",
	price: "",
	productUrl: "",
	productId: "",
	priceSource: "",
	mileageBandsJson: "[]",
};

const MILEAGE_PART_PATTERN = /\b(engine|transmission)s?\b/i;

function isMileagePricedPart(partTitle) {
	return MILEAGE_PART_PATTERN.test(String(partTitle || "").trim());
}

function formatPrice(value) {
	if (value === null || value === undefined || value === "") return "—";
	const raw = String(value).trim();
	const n = Number(raw.replace(/[^0-9.-]/g, ""));
	if (Number.isFinite(n) && n > 0) return `$${n.toLocaleString()}`;
	if (raw) return raw;
	return "—";
}

export default function ProductsPage() {
	const { hasPermission } = useAdminAuth();
	const canEdit = hasPermission("edit_products") || hasPermission("edit_trims");

	const [activeTab, setActiveTab] = useState("catalog");
	const [parts, setParts] = useState([]);
	const [filterMakes, setFilterMakes] = useState([]);
	const [filterModels, setFilterModels] = useState([]);
	const [filterYears, setFilterYears] = useState([]);
	const [modalMakes, setModalMakes] = useState([]);
	const [modalModels, setModalModels] = useState([]);
	const [modalYears, setModalYears] = useState([]);

	const [filters, setFilters] = useState({ part: "", make: "", model: "", year: "", q: "" });
	const [items, setItems] = useState([]);
	const [totalRecords, setTotalRecords] = useState(0);
	const [loading, setLoading] = useState(false);
	const [filterHint, setFilterHint] = useState("Select Part, Make, Model, or Year to load catalog products.");
	const [lazyParams, setLazyParams] = useState({ first: 0, rows: 25, page: 1 });

	const [manualProducts, setManualProducts] = useState([]);
	const [manualLoading, setManualLoading] = useState(false);

	const [showModal, setShowModal] = useState(false);
	const [editingId, setEditingId] = useState("");
	const [form, setForm] = useState(EMPTY_FORM);
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		api.get("/categories")
			.then(({ data }) => setParts(sortPartsWithPriority(data.data || [])))
			.catch(() => {});
	}, []);

	useEffect(() => {
		if (!filters.part) {
			setFilterMakes([]);
			return;
		}
		api.get(`/categories/sub/list?part=${filters.part}`)
			.then(({ data }) => setFilterMakes(data.data || []))
			.catch(() => setFilterMakes([]));
	}, [filters.part]);

	useEffect(() => {
		if (!filters.make) {
			setFilterModels([]);
			return;
		}
		api.get(`/catalog/models?make=${filters.make}`)
			.then(({ data }) => setFilterModels(data.data || []))
			.catch(() => setFilterModels([]));
	}, [filters.make]);

	useEffect(() => {
		if (!filters.model) {
			setFilterYears([]);
			return;
		}
		api.get(`/catalog/years?model=${filters.model}`)
			.then(({ data }) => setFilterYears(data.data || []))
			.catch(() => setFilterYears([]));
	}, [filters.model]);

	const hasCatalogFilter =
		Boolean(filters.part || filters.make || filters.model || filters.year) ||
		String(filters.q || "").trim().length >= 2;

	const fetchCatalog = useCallback(async () => {
		if (!hasCatalogFilter) {
			setItems([]);
			setTotalRecords(0);
			setFilterHint("Select Part, Make, Model, or Year — or search with at least 2 characters.");
			return;
		}

		setLoading(true);
		setFilterHint("");
		try {
			const params = new URLSearchParams();
			if (filters.part) params.set("part", filters.part);
			if (filters.make) params.set("make", filters.make);
			if (filters.model) params.set("model", filters.model);
			if (filters.year) params.set("year", filters.year);
			if (filters.q.trim()) params.set("q", filters.q.trim());
			params.set("page", String(lazyParams.page));
			params.set("limit", String(lazyParams.rows));

			const { data } = await api.get(`/catalog/trims/admin/list?${params.toString()}`);
			setItems(data.data?.items || []);
			setTotalRecords(data.data?.pagination?.total || 0);
		} catch (err) {
			setItems([]);
			setTotalRecords(0);
			setFilterHint(err?.response?.data?.message || "Unable to load catalog products.");
		} finally {
			setLoading(false);
		}
	}, [filters, hasCatalogFilter, lazyParams.page, lazyParams.rows]);

	useEffect(() => {
		if (activeTab === "catalog") fetchCatalog();
	}, [activeTab, fetchCatalog]);

	const fetchManualProducts = async () => {
		setManualLoading(true);
		try {
			const { data } = await api.get("/products/admin/all?limit=100");
			setManualProducts(data.data?.products || []);
		} catch {
			setManualProducts([]);
		} finally {
			setManualLoading(false);
		}
	};

	useEffect(() => {
		if (activeTab === "manual") fetchManualProducts();
	}, [activeTab]);

	const onFilterChange = (name, value) => {
		setFilters((prev) => {
			const next = { ...prev, [name]: value };
			if (name === "part") {
				next.make = "";
				next.model = "";
				next.year = "";
			}
			if (name === "make") {
				next.model = "";
				next.year = "";
			}
			if (name === "model") next.year = "";
			return next;
		});
		setLazyParams((prev) => ({ ...prev, first: 0, page: 1 }));
	};

	const onPage = (event) => {
		setLazyParams({
			first: event.first,
			rows: event.rows,
			page: Math.floor(event.first / event.rows) + 1,
		});
	};

	const openAddModal = () => {
		setEditingId("");
		setForm({
			...EMPTY_FORM,
			part: filters.part || "",
			make: filters.make || "",
			model: filters.model || "",
			year: filters.year || "",
		});
		setShowModal(true);
	};

	const openEditModal = async (row) => {
		setEditingId(row._id);
		try {
			const { data } = await api.get(`/catalog/trims/admin/${row._id}`);
			const item = data.data || row;
			setForm({
				title: item.title || "",
				part: item.part?._id || item.part || "",
				make: item.make?._id || item.make || "",
				model: item.model?._id || item.model || "",
				year: item.year?._id || item.year || "",
				price: item.price ?? "",
				productUrl: item.productUrl || "",
				productId: item.productId ?? "",
				priceSource: item.priceSource || "",
				mileageBandsJson: JSON.stringify(item.mileageBands || [], null, 2),
			});
			setShowModal(true);
		} catch {
			setForm({
				title: row.title || "",
				part: row.part?._id || row.part || "",
				make: row.make?._id || row.make || "",
				model: row.model?._id || row.model || "",
				year: row.year?._id || row.year || "",
				price: row.price ?? "",
				productUrl: row.productUrl || "",
				productId: row.productId ?? "",
				priceSource: row.priceSource || "",
				mileageBandsJson: JSON.stringify(row.mileageBands || [], null, 2),
			});
			setShowModal(true);
		}
	};

	const onFormChange = (event) => {
		const { name, value } = event.target;
		setForm((prev) => {
			const next = { ...prev, [name]: value };
			if (name === "part") {
				next.make = "";
				next.model = "";
				next.year = "";
			}
			if (name === "make") {
				next.model = "";
				next.year = "";
			}
			if (name === "model") next.year = "";
			return next;
		});
	};

	useEffect(() => {
		if (!showModal || !form.part) {
			setModalMakes([]);
			return;
		}
		api.get(`/categories/sub/list?part=${form.part}`).then(({ data }) => setModalMakes(data.data || [])).catch(() => setModalMakes([]));
	}, [form.part, showModal]);

	useEffect(() => {
		if (!showModal || !form.make) {
			setModalModels([]);
			return;
		}
		api.get(`/catalog/models?make=${form.make}`).then(({ data }) => setModalModels(data.data || [])).catch(() => setModalModels([]));
	}, [form.make, showModal]);

	useEffect(() => {
		if (!showModal || !form.model) {
			setModalYears([]);
			return;
		}
		api.get(`/catalog/years?model=${form.model}`).then(({ data }) => setModalYears(data.data || [])).catch(() => setModalYears([]));
	}, [form.model, showModal]);

	const saveItem = async (event) => {
		event.preventDefault();
		if (!form.title.trim() || !form.year) return;

		let mileageBands = [];
		try {
			mileageBands = JSON.parse(form.mileageBandsJson || "[]");
			if (!Array.isArray(mileageBands)) throw new Error("mileageBands must be an array");
		} catch {
			window.alert("Mileage bands must be valid JSON array.");
			return;
		}

		setSaving(true);
		try {
			const payload = {
				title: form.title.trim(),
				year: form.year,
				make: form.make || null,
				part: form.part || null,
				price: form.price,
				productUrl: form.productUrl,
				productId: form.productId === "" ? null : form.productId,
				priceSource: form.priceSource,
				mileageBands,
			};

			if (editingId) {
				await api.put(`/catalog/trims/${editingId}`, payload);
			} else {
				await api.post("/catalog/trims", payload);
			}

			setShowModal(false);
			setEditingId("");
			setForm(EMPTY_FORM);
			fetchCatalog();
		} catch {
			// toast from interceptor
		} finally {
			setSaving(false);
		}
	};

	const deleteItem = async (row) => {
		if (!window.confirm(`Delete catalog product "${row.title}"?`)) return;
		try {
			await api.delete(`/catalog/trims/${row._id}`);
			fetchCatalog();
		} catch {
			// ignore
		}
	};

	const partBody = (row) => row.part?.title || "—";
	const makeBody = (row) => row.make?.name || "—";
	const modelBody = (row) => row.model?.title || "—";
	const yearBody = (row) => row.year?.title || "—";
	const trimBody = (row) => row.title || "—";
	const priceBody = (row) => (isMileagePricedPart(row.part?.title) ? formatPrice(row.price) : "—");
	const mileageBody = (row) => {
		if (!isMileagePricedPart(row.part?.title)) return "—";
		const count = Array.isArray(row.mileageBands) ? row.mileageBands.length : 0;
		return count > 0 ? `${count} band${count === 1 ? "" : "s"}` : "—";
	};
	const actionsBody = (row) => (
		<div className="d-flex align-items-center gap-2">
			{canEdit && (
				<>
					<button type="button" className="admin-row-action" aria-label="Edit" onClick={() => openEditModal(row)}>
						<BiEdit size={17} />
					</button>
					<button type="button" className="admin-row-action" aria-label="Delete" onClick={() => deleteItem(row)}>
						<BiTrash size={17} />
					</button>
				</>
			)}
		</div>
	);

	const filterBar = (
		<div className="row g-2 mb-3">
			<div className="col-md-3 col-lg-2">
				<Form.Select value={filters.part} onChange={(e) => onFilterChange("part", e.target.value)}>
					<option value="">— Part —</option>
					{parts.map((p) => (
						<option key={p._id} value={p._id}>{p.title}</option>
					))}
				</Form.Select>
			</div>
			<div className="col-md-3 col-lg-2">
				<Form.Select value={filters.make} onChange={(e) => onFilterChange("make", e.target.value)} disabled={!filters.part}>
					<option value="">— Make —</option>
					{filterMakes.map((m) => (
						<option key={m._id} value={m._id}>{m.name}</option>
					))}
				</Form.Select>
			</div>
			<div className="col-md-3 col-lg-2">
				<Form.Select value={filters.model} onChange={(e) => onFilterChange("model", e.target.value)} disabled={!filters.make}>
					<option value="">— Model —</option>
					{filterModels.map((m) => (
						<option key={m._id} value={m._id}>{m.title}</option>
					))}
				</Form.Select>
			</div>
			<div className="col-md-3 col-lg-2">
				<Form.Select value={filters.year} onChange={(e) => onFilterChange("year", e.target.value)} disabled={!filters.model}>
					<option value="">— Year —</option>
					{filterYears.map((y) => (
						<option key={y._id} value={y._id}>{y.title}</option>
					))}
				</Form.Select>
			</div>
			<div className="col-md-6 col-lg-3">
				<div className="admin-search w-100">
					<i className="pi pi-search" />
					<InputText
						value={filters.q}
						onChange={(e) => onFilterChange("q", e.target.value)}
						placeholder="Search trim title (2+ chars)"
						className="w-100"
					/>
				</div>
			</div>
		</div>
	);

	return (
		<section>
			<div className="d-flex justify-content-between align-items-center mb-3">
				<div>
					<h2 className="h3 fw-bold mb-1">Catalog Products</h2>
					<p className="admin-subtle-text mb-0">
						Manage vehicle trim listings (price, mileage bands) from the live catalog. Use filters before loading results.
					</p>
				</div>
				{canEdit && activeTab === "catalog" && (
					<Button className="admin-cta-btn" onClick={openAddModal} disabled={!filters.year && !filters.model}>
						Add Trim Product
					</Button>
				)}
			</div>

			<Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || "catalog")}>
				<Nav variant="tabs" className="mb-3 border-0 gap-2">
					<Nav.Item>
						<Nav.Link eventKey="catalog" className="rounded-3">Catalog (trims)</Nav.Link>
					</Nav.Item>
					<Nav.Item>
						<Nav.Link eventKey="manual" className="rounded-3">Manual SKUs</Nav.Link>
					</Nav.Item>
				</Nav>

				<Tab.Content>
					<Tab.Pane eventKey="catalog">
						{filterBar}
						{filterHint && <p className="text-muted small mb-2">{filterHint}</p>}
						<div className="admin-table-wrap">
							<DataTable
								value={items}
								lazy
								paginator
								first={lazyParams.first}
								rows={lazyParams.rows}
								totalRecords={totalRecords}
								onPage={onPage}
								loading={loading}
								className="admin-data-table"
								rowsPerPageOptions={[10, 25, 50, 100]}
								paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
								emptyMessage={hasCatalogFilter ? "No trims found for this filter." : "Apply a filter to load products."}
							>
								<Column header="Trim" body={trimBody} style={{ minWidth: "220px" }} />
								<Column header="Part" body={partBody} />
								<Column header="Make" body={makeBody} />
								<Column header="Model" body={modelBody} />
								<Column header="Year" body={yearBody} />
								<Column header="Price" body={priceBody} />
								<Column header="Mileage" body={mileageBody} />
								{canEdit && <Column header="Actions" body={actionsBody} style={{ width: "100px" }} />}
							</DataTable>
						</div>
					</Tab.Pane>

					<Tab.Pane eventKey="manual">
						<p className="admin-subtle-text small mb-3">
							Manual SKU products for search and special listings. Engine and Transmission entries are listed first.
						</p>
						<div className="admin-table-wrap">
							<DataTable
								value={manualProducts}
								loading={manualLoading}
								paginator
								rows={10}
								className="admin-data-table"
								emptyMessage="No manual products."
							>
								<Column field="name" header="Name" sortable />
								<Column field="category.title" header="Part" />
								<Column field="subCategory.name" header="Make" />
								<Column field="price" header="Price" body={(r) => formatPrice(r.price)} />
							</DataTable>
						</div>
					</Tab.Pane>
				</Tab.Content>
			</Tab.Container>

			{canEdit && (
				<Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
					<Modal.Header closeButton>
						<Modal.Title>{editingId ? "Edit Catalog Product" : "Add Catalog Product"}</Modal.Title>
					</Modal.Header>
					<Form onSubmit={saveItem}>
						<Modal.Body>
							<Form.Group className="mb-3">
								<Form.Label>Trim title</Form.Label>
								<Form.Control name="title" value={form.title} onChange={onFormChange} required />
							</Form.Group>
							<div className="row g-3 mb-3">
								<div className="col-md-6">
									<Form.Label>Part</Form.Label>
									<Form.Select name="part" value={form.part} onChange={onFormChange}>
										<option value="">— Select part —</option>
										{parts.map((p) => (
											<option key={p._id} value={p._id}>{p.title}</option>
										))}
									</Form.Select>
								</div>
								<div className="col-md-6">
									<Form.Label>Make</Form.Label>
									<Form.Select name="make" value={form.make} onChange={onFormChange} disabled={!form.part}>
										<option value="">— Select make —</option>
										{modalMakes.map((m) => (
											<option key={m._id} value={m._id}>{m.name}</option>
										))}
									</Form.Select>
								</div>
								<div className="col-md-6">
									<Form.Label>Model</Form.Label>
									<Form.Select name="model" value={form.model} onChange={onFormChange} disabled={!form.make}>
										<option value="">— Select model —</option>
										{modalModels.map((m) => (
											<option key={m._id} value={m._id}>{m.title}</option>
										))}
									</Form.Select>
								</div>
								<div className="col-md-6">
									<Form.Label>Year</Form.Label>
									<Form.Select name="year" value={form.year} onChange={onFormChange} disabled={!form.model} required>
										<option value="">— Select year —</option>
										{modalYears.map((y) => (
											<option key={y._id} value={y._id}>{y.title}</option>
										))}
									</Form.Select>
								</div>
							</div>
							{(() => {
								const selectedPart = parts.find((p) => String(p._id) === String(form.part));
								const showMileageFields = isMileagePricedPart(selectedPart?.title);
								return showMileageFields ? (
									<>
										<div className="row g-3 mb-3">
											<div className="col-md-4">
												<Form.Label>Price</Form.Label>
												<Form.Control name="price" value={form.price} onChange={onFormChange} placeholder="e.g. 1165 or Get a quote" />
											</div>
											<div className="col-md-4">
												<Form.Label>Product ID</Form.Label>
												<Form.Control name="productId" value={form.productId} onChange={onFormChange} />
											</div>
											<div className="col-md-4">
												<Form.Label>Price source</Form.Label>
												<Form.Control name="priceSource" value={form.priceSource} onChange={onFormChange} />
											</div>
										</div>
										<Form.Group>
											<Form.Label>Mileage bands (JSON array)</Form.Label>
											<Form.Control
												as="textarea"
												rows={5}
												name="mileageBandsJson"
												value={form.mileageBandsJson}
												onChange={onFormChange}
												style={{ fontFamily: "monospace", fontSize: "12px" }}
											/>
										</Form.Group>
									</>
								) : (
									<p className="text-muted small mb-0">Price and mileage bands apply to Engine and Transmission parts only.</p>
								);
							})()}
						</Modal.Body>
						<Modal.Footer>
							<Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
							<Button type="submit" className="admin-cta-btn" disabled={saving}>
								{saving ? "Saving…" : editingId ? "Update" : "Save"}
							</Button>
						</Modal.Footer>
					</Form>
				</Modal>
			)}
		</section>
	);
}
