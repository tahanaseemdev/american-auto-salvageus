import { useMemo, useState } from 'react';
import { BiLock, BiCheckCircle, BiArrowBack } from 'react-icons/bi';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';

export default function ResetPassword() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const tokenFromQuery = useMemo(() => searchParams.get('token') || '', [searchParams]);

	const [token, setToken] = useState(tokenFromQuery);
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState('');
	const [error, setError] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		if (!token) {
			setError('Reset token is required. Please use the full reset link from your email.');
			return;
		}
		if (!password || password.length < 8) {
			setError('Password must be at least 8 characters.');
			return;
		}
		if (password !== confirmPassword) {
			setError('Passwords do not match.');
			return;
		}

		setLoading(true);
		try {
			const { data } = await api.post('/auth/reset-password', { token, password });
			setSuccess(data.message || 'Password reset successfully.');
			setTimeout(() => navigate('/login'), 1400);
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to reset password.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="font-['Barlow',sans-serif] bg-neutral-950 min-h-screen pt-[68px] md:pt-[104px] flex items-center justify-center relative overflow-hidden">
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					backgroundImage:
						'linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)',
					backgroundSize: '52px 52px',
				}}
			/>
			<div
				className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
				style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 65%)' }}
			/>

			<div className="relative w-full max-w-md mx-auto px-4 sm:px-6">
				<div className="bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden">
					<div className="bg-amber-400 px-8 py-6">
						<h1 className="font-['Barlow_Condensed',sans-serif] font-black text-2xl uppercase text-neutral-900 mb-1">
							Reset Password
						</h1>
						<p className="text-neutral-700 text-sm">Set your new account password below.</p>
					</div>

					<div className="p-7">
						<form onSubmit={handleSubmit} noValidate className="space-y-4">
							{success && (
								<div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 font-semibold flex items-center gap-2">
									<BiCheckCircle size={18} />
									{success}
								</div>
							)}
							{error && (
								<div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-semibold">
									{error}
								</div>
							)}

							<div>
								<label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1.5 block">
									Reset Token <span className="text-amber-500">*</span>
								</label>
								<input
									type="text"
									value={token}
									onChange={(e) => setToken(e.target.value)}
									placeholder="Paste reset token"
									className="w-full bg-neutral-50 border border-neutral-200 rounded-xl outline-none text-sm text-neutral-700 placeholder-neutral-400 px-3 py-3 focus:border-amber-400"
								/>
							</div>

							<div>
								<label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1.5 block">
									New Password <span className="text-amber-500">*</span>
								</label>
								<div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-xl overflow-hidden focus-within:border-amber-400">
									<BiLock size={16} className="ml-4 text-neutral-400 shrink-0" />
									<input
										type="password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										placeholder="Minimum 8 characters"
										className="flex-1 bg-transparent outline-none text-sm text-neutral-700 placeholder-neutral-400 px-3 py-3"
									/>
								</div>
							</div>

							<div>
								<label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1.5 block">
									Confirm Password <span className="text-amber-500">*</span>
								</label>
								<div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-xl overflow-hidden focus-within:border-amber-400">
									<BiLock size={16} className="ml-4 text-neutral-400 shrink-0" />
									<input
										type="password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										placeholder="Re-enter new password"
										className="flex-1 bg-transparent outline-none text-sm text-neutral-700 placeholder-neutral-400 px-3 py-3"
									/>
								</div>
							</div>

							<button
								type="submit"
								disabled={loading}
								className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-neutral-900 font-black text-[13px] tracking-widest uppercase py-3.5 rounded-xl transition-colors"
							>
								{loading ? 'Resetting Password...' : 'Reset Password'}
							</button>
						</form>

						<Link
							to="/login"
							className="mt-5 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 font-semibold transition-colors"
						>
							<BiArrowBack size={16} />
							Back to Sign In
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
