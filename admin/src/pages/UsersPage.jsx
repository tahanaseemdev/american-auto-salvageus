import { useEffect, useState } from "react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import api from "../utils/api";

export default function UsersPage() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [globalFilter, setGlobalFilter] = useState("");

	useEffect(() => {
		fetchUsers();
	}, []);

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const { data } = await api.get("/admin/users?limit=100");
			const allUsers = data.data?.users || [];
			setUsers(allUsers.filter((user) => !user.role));
		} catch { /* ignore */ } finally {
			setLoading(false);
		}
	};

	const statusBody = (row) => {
		const isRevoked = row.isRevoked;
		return <span className={`admin-tag ${isRevoked ? "danger" : "success"}`}>{isRevoked ? "Revoked" : "Active"}</span>;
	};

	const numberBody = (_row, options) => options.rowIndex + 1;

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
			<div className="d-flex align-items-center mb-3">
				<div>
					<h2 className="h3 fw-bold mb-1 d-flex align-items-center gap-2">Customers <span className="admin-count-badge">{users.length}</span></h2>
					<p className="admin-subtle-text mb-0">Only customers are shown here. Sub-admins are managed in Permissions page.</p>
				</div>
			</div>

			<div className="admin-table-wrap">
				<DataTable
					value={users}
					header={header}
					className="admin-data-table"
					loading={loading}
					paginator
					rows={7}
					globalFilter={globalFilter}
					globalFilterFields={["name", "email"]}
					paginatorTemplate="PrevPageLink NextPageLink"
					emptyMessage="No customers found."
				>
					<Column header="No" body={numberBody} style={{ width: "80px" }} />
					<Column field="name" header="Name" sortable />
					<Column field="email" header="Email" sortable />
					<Column header="Role" body={() => "Customer"} style={{ width: "120px" }} />
					<Column header="Status" body={statusBody} style={{ width: "120px" }} />
					<Column field="createdAt" header="Joined" sortable body={(r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"} />
				</DataTable>
			</div>
		</section>
	);
}


