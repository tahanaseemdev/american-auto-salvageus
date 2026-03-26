import { useEffect, useState } from "react";
import { BiCategoryAlt, BiPackage, BiSolidUser, BiUserPin } from "react-icons/bi";
import api from "../utils/api";

export default function DashboardPage() {
	const [stats, setStats] = useState({
		customers: 0,
		products: 0,
		categories: 0,
		subAdmins: 0,
	});

	useEffect(() => {
		fetchDashboardStats();
	}, []);

	const fetchDashboardStats = async () => {
		try {
			const [usersRes, productsRes, categoriesRes] = await Promise.all([
				api.get("/admin/users?limit=1000"),
				api.get("/products/admin/all?limit=1"),
				api.get("/categories/admin/all"),
			]);

			const users = usersRes.data.data?.users || [];
			const customers = users.filter((user) => !user.role).length;
			const subAdmins = users.filter((user) => user.role && user.role.title !== "Super Admin").length;
			const products = productsRes.data.data?.pagination?.total || 0;
			const categories = Array.isArray(categoriesRes.data.data) ? categoriesRes.data.data.length : 0;

			setStats({ customers, products, categories, subAdmins });
		} catch {
			// ignore fetch errors and keep defaults
		}
	};

	const statCards = [
		{ label: "Users", value: stats.customers, icon: BiSolidUser },
		{ label: "Products", value: stats.products, icon: BiPackage },
		{ label: "Categories", value: stats.categories, icon: BiCategoryAlt },
		{ label: "Sub Admins", value: stats.subAdmins, icon: BiUserPin },
	];

	return (
		<section className="container-fluid p-0">
			<div className="mb-3">
				<h2 className="h3 fw-bold mb-0">Dashboard</h2>
			</div>

			<div className="admin-hero p-4 p-md-5 mb-4">
				<p className="fs-3 fw-bold mb-1">Hello, Admin</p>
				<h1 className="display-5 fw-semibold mb-0">Welcome To Dashboard</h1>
			</div>

			<div className="row g-3">
				{statCards.map((item) => {
					const Icon = item.icon;
					return (
						<div key={item.label} className="col-12 col-sm-6 col-xl-3">
							<div className="admin-stat-card p-3 h-100 d-flex flex-column justify-content-between">
								<div className="d-flex justify-content-between align-items-start">
									<Icon size={30} />
									<span className="fs-1 fw-bold lh-1">{item.value}</span>
								</div>
								<p className="fs-4 fw-semibold mb-0 mt-3">{item.label}</p>
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
}
