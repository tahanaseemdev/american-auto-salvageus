import { useState } from "react";
import { BiEnvelope, BiLock, BiShow, BiHide, BiShield } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AuthContext";

export default function AdminLogin() {
	const navigate = useNavigate();
	const { login, loading } = useAdminAuth();
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [remember, setRemember] = useState(true);
	const [error, setError] = useState("");

	const onSubmit = async (event) => {
		event.preventDefault();

		if (!email.trim() || !password.trim()) {
			setError("Email and password are required.");
			return;
		}

		setError("");
		const result = await login(email, password);
		if (result.success) {
			navigate("/dashboard");
		} else {
			setError(result.message);
		}
	};

	return (
		<div className="font-['Barlow',sans-serif] bg-neutral-950 min-h-screen relative overflow-hidden flex items-center justify-center px-4">
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					backgroundImage:
						"linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)",
					backgroundSize: "52px 52px"
				}}
			/>
			<div
				className="absolute top-0 left-1/2 -translate-x-1/2 w-[560px] h-[320px] pointer-events-none"
				style={{ background: "radial-gradient(circle, rgba(245,158,11,0.18), transparent 70%)" }}
			/>

			<div className="relative w-full max-w-md">
				<div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden">
					<div className="bg-amber-400 px-6 py-6">
						<div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-neutral-900/15 mb-3">
							<BiShield size={22} className="text-neutral-900" />
						</div>
						<h1 className="font-['Barlow_Condensed',sans-serif] text-3xl font-black uppercase text-neutral-900 leading-none">Admin Login</h1>
						<p className="text-sm text-neutral-700 mt-2">Sign in to manage users, products, and permissions.</p>
					</div>

					<form onSubmit={onSubmit} className="p-6 space-y-4" noValidate>
						<div>
							<label className="text-[11px] tracking-[0.14em] uppercase font-bold text-neutral-400 block mb-1.5">Email</label>
							<div className="flex items-center border border-neutral-200 rounded-xl bg-neutral-50 focus-within:border-amber-400 transition-colors">
								<BiEnvelope className="ml-3 text-neutral-400" size={17} />
								<input
									type="email"
									value={email}
									onChange={(event) => setEmail(event.target.value)}
									className="w-full px-3 py-3 bg-transparent outline-none text-sm text-neutral-700"
									placeholder="admin@company.com"
								/>
							</div>
						</div>

						<div>
							<label className="text-[11px] tracking-[0.14em] uppercase font-bold text-neutral-400 block mb-1.5">Password</label>
							<div className="flex items-center border border-neutral-200 rounded-xl bg-neutral-50 focus-within:border-amber-400 transition-colors">
								<BiLock className="ml-3 text-neutral-400" size={17} />
								<input
									type={showPassword ? "text" : "password"}
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									className="w-full px-3 py-3 bg-transparent outline-none text-sm text-neutral-700"
									placeholder="Enter your password"
								/>
								<button
									type="button"
									onClick={() => setShowPassword((prev) => !prev)}
									className="mr-3 text-neutral-500 hover:text-neutral-700"
								>
									{showPassword ? <BiHide size={18} /> : <BiShow size={18} />}
								</button>
							</div>
						</div>

						<label className="flex items-center gap-2 text-sm text-neutral-600 font-medium cursor-pointer">
							<input
								type="checkbox"
								checked={remember}
								onChange={(event) => setRemember(event.target.checked)}
								className="w-4 h-4 accent-amber-400"
							/>
							Keep me signed in
						</label>

						{error && <p className="text-sm text-red-600 font-semibold">{error}</p>}

						<button
							type="submit"
							disabled={loading}
							className="w-full rounded-xl bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-neutral-900 py-3.5 text-[13px] tracking-[0.14em] uppercase font-black transition-colors"
						>
							{loading ? "Signing In…" : "Sign In"}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
