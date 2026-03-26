import { useState } from "react";

export default function MyAccountPage() {
	const [emailForm, setEmailForm] = useState({ currentEmail: "admin@americanautosalvageus.com", newEmail: "" });
	const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
	const [emailMessage, setEmailMessage] = useState("");
	const [passwordMessage, setPasswordMessage] = useState("");

	const onEmailSubmit = (event) => {
		event.preventDefault();
		if (!emailForm.newEmail.trim()) return;

		setEmailForm((prev) => ({ currentEmail: prev.newEmail.trim().toLowerCase(), newEmail: "" }));
		setEmailMessage("Email updated successfully.");
	};

	const onPasswordSubmit = (event) => {
		event.preventDefault();

		if (!passwordForm.newPassword || passwordForm.newPassword !== passwordForm.confirmPassword) {
			setPasswordMessage("New password and confirm password must match.");
			return;
		}

		setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
		setPasswordMessage("Password changed successfully.");
	};

	return (
		<section>
			<div className="mb-3">
				<h2 className="h3 fw-bold mb-1">My Account</h2>
				<p className="admin-subtle-text mb-0">Update your admin email and password securely.</p>
			</div>

			<div className="row g-4">
				<article className="col-12 col-xl-6">
					<div className="admin-card p-4">
						<h3 className="h5 fw-bold mb-3">Change Email</h3>
						<form onSubmit={onEmailSubmit}>
							<div className="mb-3">
								<label className="form-label">Current Email</label>
								<input value={emailForm.currentEmail} disabled className="form-control" />
							</div>
							<div className="mb-3">
								<label className="form-label">New Email</label>
								<input
									type="email"
									value={emailForm.newEmail}
									onChange={(event) => setEmailForm((prev) => ({ ...prev, newEmail: event.target.value }))}
									className="form-control"
									required
								/>
							</div>
							<button type="submit" className="btn admin-cta-btn">Update Email</button>
							{emailMessage && <p className="text-success fw-semibold mt-3 mb-0">{emailMessage}</p>}
						</form>
					</div>
				</article>

				<article className="col-12 col-xl-6">
					<div className="admin-card p-4">
						<h3 className="h5 fw-bold mb-3">Change Password</h3>
						<form onSubmit={onPasswordSubmit}>
							<div className="mb-3">
								<label className="form-label">Current Password</label>
								<input
									type="password"
									value={passwordForm.currentPassword}
									onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
									className="form-control"
									required
								/>
							</div>
							<div className="mb-3">
								<label className="form-label">New Password</label>
								<input
									type="password"
									value={passwordForm.newPassword}
									onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
									className="form-control"
									required
								/>
							</div>
							<div className="mb-3">
								<label className="form-label">Confirm Password</label>
								<input
									type="password"
									value={passwordForm.confirmPassword}
									onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
									className="form-control"
									required
								/>
							</div>
							<button type="submit" className="btn admin-cta-btn">Update Password</button>
							{passwordMessage && <p className={`fw-semibold mt-3 mb-0 ${passwordMessage.includes("must match") ? "text-danger" : "text-success"}`}>{passwordMessage}</p>}
						</form>
					</div>
				</article>
			</div>
		</section>
	);
}
