import { useState } from 'react';
import { BiEnvelope, BiCheckShield, BiArrowBack } from 'react-icons/bi';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function ForgotPassword() {
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [serverMessage, setServerMessage] = useState('');
	const [error, setError] = useState('');

	const onSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setServerMessage('');

		if (!email) {
			setError('Email is required.');
			return;
		}

		if (!/\S+@\S+\.\S+/.test(email)) {
			setError('Enter a valid email address.');
			return;
		}

		setLoading(true);
		try {
			const { data } = await api.post('/auth/forgot-password', { email });
			setServerMessage(data.message || 'If an account with that email exists, a reset link has been sent.');
		} catch (err) {
			setError(err.response?.data?.message || 'Unable to process your request right now.');
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
						<div className="flex items-center gap-3 mb-1">
							<div className="w-8 h-8 rounded-lg bg-neutral-900/20 flex items-center justify-center">
								<BiCheckShield size={18} className="text-neutral-900" />
							</div>
							<h1 className="font-['Barlow_Condensed',sans-serif] font-black text-2xl uppercase text-neutral-900">
								Forgot Password
							</h1>
						</div>
						<p className="text-neutral-700 text-sm">Enter your email and we will send a reset link.</p>
					</div>

					<div className="p-7">
						<form onSubmit={onSubmit} noValidate className="space-y-4">
							{serverMessage && (
								<div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 font-semibold">
									{serverMessage}
								</div>
							)}
							{error && (
								<div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-semibold">
									{error}
								</div>
							)}

							<div>
								<label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1.5 block">
									Email Address <span className="text-amber-500">*</span>
								</label>
								<div
									className={`flex items-center bg-neutral-50 border rounded-xl overflow-hidden transition-colors focus-within:border-amber-400 ${error ? 'border-red-300 bg-red-50' : 'border-neutral-200'
										}`}
								>
									<BiEnvelope size={16} className="ml-4 text-neutral-400 shrink-0" />
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										placeholder="you@example.com"
										className="flex-1 bg-transparent outline-none text-sm text-neutral-700 placeholder-neutral-400 px-3 py-3"
									/>
								</div>
							</div>

							<button
								type="submit"
								disabled={loading}
								className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-neutral-900 font-black text-[13px] tracking-widest uppercase py-3.5 rounded-xl transition-colors"
							>
								{loading ? 'Sending Reset Link...' : 'Send Reset Link'}
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
