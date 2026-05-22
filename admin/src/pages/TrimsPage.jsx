import { Navigate } from "react-router-dom";

/** Trims are managed under Catalog Products (paginated). */
export default function TrimsPage() {
	return <Navigate to="/products" replace />;
}
