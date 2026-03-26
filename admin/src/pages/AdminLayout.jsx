import { BiCategoryAlt, BiEnvelope, BiGridAlt, BiLock, BiLogOut, BiPackage, BiSolidUserCircle, BiUser, BiListUl } from "react-icons/bi";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import logo from "../assets/american autos.png";
import { useAdminAuth } from "../context/AuthContext";
import { canAccessPath } from "../utils/rbac";

const NAV_ITEMS = [
	{ name: "Dashboard", to: "/dashboard", icon: BiGridAlt },
	{ name: "Users", to: "/users", icon: BiUser },
	{ name: "Parts", to: "/categories", icon: BiCategoryAlt },
	{ name: "Makes", to: "/sub-categories", icon: BiCategoryAlt },
	{ name: "Models", to: "/models", icon: BiCategoryAlt },
	{ name: "Years", to: "/years", icon: BiCategoryAlt },
	{ name: "Trims", to: "/trims", icon: BiCategoryAlt },
	{ name: "Products", to: "/products", icon: BiPackage },
	{ name: "Orders", to: "/orders", icon: BiListUl },
	{ name: "Contact Queries", to: "/contact-queries", icon: BiEnvelope },
	{ name: "Permissions", to: "/permissions", icon: BiLock },
	{ name: "My Account", to: "/my-account", icon: BiSolidUserCircle }
];

export default function AdminLayout() {
	const { admin, logout } = useAdminAuth();
	const navigate = useNavigate();
	const visibleNavItems = NAV_ITEMS.filter((item) => canAccessPath(admin, item.to));

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	return (
		<div className="min-vh-100 bg-[#f3f4f6] d-flex flex-column">
			<header className="bg-white border-bottom">
				<div className="container-fluid px-4 py-2 d-flex align-items-center justify-content-between">
					<div className="d-flex align-items-center gap-3">
						<img src={logo} alt="American Auto Salvageus" style={{ height: "46px", width: "auto" }} />
					</div>
					<div className="rounded-3 border bg-light px-2 py-1 d-flex align-items-center gap-2">
						<BiSolidUserCircle size={34} color="#64748b" />
						{admin?.name && <span className="small text-secondary fw-semibold">{admin.name}</span>}
					</div>
				</div>

				<div className="container-fluid px-4 py-2 border-top bg-white d-flex flex-wrap align-items-center gap-2">
					<nav className="d-flex flex-wrap align-items-center gap-1 grow">
						{visibleNavItems.map((item) => {
							const Icon = item.icon;
							return (
								<NavLink key={item.to} to={item.to} className={({ isActive }) => `admin-tab-link ${isActive ? "active" : ""}`}>
									<span className="d-inline-flex align-items-center gap-2">
										<Icon size={17} />
										{item.name}
									</span>
								</NavLink>
							);
						})}
					</nav>

					<button type="button" onClick={handleLogout} className="btn admin-cta-btn d-inline-flex align-items-center gap-2 px-3 py-2">
						<BiLogOut size={17} />
						Sign Out
					</button>
				</div>
			</header>

			<main className="container-fluid px-4 py-4 grow">
				<div className="admin-card p-3 p-md-4">
					<Outlet />
				</div>
			</main>
		</div>
	);
}
