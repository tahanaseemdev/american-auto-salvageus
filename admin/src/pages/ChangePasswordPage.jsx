import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAdminAuth } from "../context/AuthContext";
import { getFirstAccessiblePath } from "../utils/rbac";

export default function ChangePasswordPage() {
	const { changePassword, admin } = useAdminAuth();
	const navigate = useNavigate();
	const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
	const [saving, setSaving] = useState(false);

	const onSubmit = async (event) => {
		event.preventDefault();
		if (form.newPassword.length < 8) {
			toast.error("Password must be at least 8 characters.");
			return;
		}
		if (form.newPassword !== form.confirmPassword) {
			toast.error("Passwords do not match.");
			return;
		}

		setSaving(true);
		const result = await changePassword(form.currentPassword, form.newPassword);
		setSaving(false);

		if (result.success) {
			toast.success("Password updated successfully.");
			const nextPath = getFirstAccessiblePath({ ...admin, mustChangePassword: false });
			navigate(nextPath, { replace: true });
		} else {
			toast.error(result.message);
		}
	};

	return (
		<section className="mx-auto" style={{ maxWidth: "480px" }}>
			<h2 className="h3 fw-bold mb-1">Change your password</h2>
			<p className="admin-subtle-text mb-4">
				For security, you must set a new password before continuing.
			</p>
			<Form onSubmit={onSubmit} className="d-flex flex-column gap-3">
				<Form.Group>
					<Form.Label>Current password</Form.Label>
					<Form.Control
						type="password"
						value={form.currentPassword}
						onChange={(e) => setForm((p) => ({ ...p, currentPassword: e.target.value }))}
						required
					/>
				</Form.Group>
				<Form.Group>
					<Form.Label>New password</Form.Label>
					<Form.Control
						type="password"
						value={form.newPassword}
						onChange={(e) => setForm((p) => ({ ...p, newPassword: e.target.value }))}
						required
						minLength={8}
					/>
				</Form.Group>
				<Form.Group>
					<Form.Label>Confirm new password</Form.Label>
					<Form.Control
						type="password"
						value={form.confirmPassword}
						onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
						required
						minLength={8}
					/>
				</Form.Group>
				<Button type="submit" className="admin-cta-btn" disabled={saving}>
					{saving ? "Saving…" : "Update password"}
				</Button>
			</Form>
		</section>
	);
}
