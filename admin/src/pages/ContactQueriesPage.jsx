import { useEffect, useState } from "react";
import { Button } from "react-bootstrap";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import api from "../utils/api";

export default function ContactQueriesPage() {
	const [queries, setQueries] = useState([]);
	const [loading, setLoading] = useState(true);
	const [globalFilter, setGlobalFilter] = useState("");

	useEffect(() => {
		fetchQueries();
	}, []);

	const fetchQueries = async () => {
		setLoading(true);
		try {
			const { data } = await api.get("/admin/contact-queries?limit=200");
			setQueries(data.data?.queries || []);
		} catch {
			// ignore
		} finally {
			setLoading(false);
		}
	};

	const markAsRead = async (row) => {
		if (row.isRead) return;
		try {
			const { data } = await api.patch(`/admin/contact-queries/${row._id}/read`);
			setQueries((prev) => prev.map((item) => (item._id === row._id ? data.data : item)));
		} catch {
			// ignore
		}
	};

	const numberBody = (_row, options) => options.rowIndex + 1;
	const dateBody = (row) => (row.createdAt ? new Date(row.createdAt).toLocaleString() : "-");
	const messageBody = (row) => (
		<div style={{ maxWidth: 420 }} className="small text-wrap">
			{row.message}
		</div>
	);
	const statusBody = (row) => (
		<span className={`admin-tag ${row.isRead ? "success" : "warn"}`}>
			{row.isRead ? "Read" : "Unread"}
		</span>
	);

	const actionBody = (row) => (
		<Button
			variant={row.isRead ? "outline-secondary" : "outline-success"}
			size="sm"
			disabled={row.isRead}
			onClick={() => markAsRead(row)}
		>
			{row.isRead ? "Read" : "Mark Read"}
		</Button>
	);

	const header = (
		<div className="admin-table-toolbar d-flex flex-wrap align-items-center justify-content-between gap-3">
			<div className="admin-search">
				<i className="pi pi-search" />
				<InputText value={globalFilter} onChange={(event) => setGlobalFilter(event.target.value)} placeholder="Search queries..." />
			</div>
			<Button variant="outline-secondary" size="sm" onClick={fetchQueries}>Refresh</Button>
		</div>
	);

	return (
		<section>
			<div className="d-flex justify-content-between align-items-center mb-3">
				<div>
					<h2 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">
						Contact Queries <span className="admin-count-badge">{queries.length}</span>
					</h2>
					<p className="admin-subtle-text mb-0">Messages submitted through the website contact form.</p>
				</div>
			</div>

			<div className="admin-table-wrap">
				<DataTable
					value={queries}
					header={header}
					className="admin-data-table"
					loading={loading}
					paginator
					rows={10}
					globalFilter={globalFilter}
					globalFilterFields={["name", "email", "phone", "subject", "message"]}
					paginatorTemplate="PrevPageLink NextPageLink"
					emptyMessage="No contact queries found."
					sortField="createdAt"
					sortOrder={-1}
				>
					<Column header="No" body={numberBody} style={{ width: "70px" }} />
					<Column field="name" header="Name" sortable />
					<Column field="email" header="Email" sortable />
					<Column field="phone" header="Phone" />
					<Column field="subject" header="Subject" sortable />
					<Column header="Message" body={messageBody} />
					<Column header="Status" body={statusBody} sortable field="isRead" style={{ width: "110px" }} />
					<Column header="Submitted" body={dateBody} sortable field="createdAt" style={{ width: "180px" }} />
					<Column header="Action" body={actionBody} style={{ width: "120px" }} />
				</DataTable>
			</div>
		</section>
	);
}


