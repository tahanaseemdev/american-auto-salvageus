import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BiBox, BiLock, BiLogOut, BiRefresh, BiUser } from 'react-icons/bi';
import { HiSparkles } from 'react-icons/hi';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const MotionArticle = motion.article;

const fadeUp = {
	hidden: { opacity: 0, y: 24 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

function StatusTag({ status }) {
	const key = String(status || 'Pending');
	const tones = {
		Pending: 'bg-amber-100 text-amber-700 border-amber-200',
		Confirmed: 'bg-sky-100 text-sky-700 border-sky-200',
		Shipped: 'bg-blue-100 text-blue-700 border-blue-200',
		Delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
		Cancelled: 'bg-red-100 text-red-700 border-red-200',
	};

	return (
		<span className={`inline-flex items-center border rounded-full px-2.5 py-1 text-[10px] font-black tracking-widest uppercase ${tones[key] || tones.Pending}`}>
			{key}
		</span>
	);
}

export default function Dashboard() {
	const { user, updateProfile, changePassword, logout } = useAuth();
	const [orders, setOrders] = useState([]);
	const [loadingOrders, setLoadingOrders] = useState(true);
	const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
	const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
	const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
	const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
	const [savingProfile, setSavingProfile] = useState(false);
	const [savingPassword, setSavingPassword] = useState(false);

	useEffect(() => {
		setProfileForm({ name: user?.name || '', phone: user?.phone || '' });
	}, [user?.name, user?.phone]);

	const fetchOrders = async () => {
		setLoadingOrders(true);
		try {
			const { data } = await api.get('/orders/my-orders');
			setOrders(Array.isArray(data.data) ? data.data : []);
		} catch {
			setOrders([]);
		} finally {
			setLoadingOrders(false);
		}
	};

	useEffect(() => {
		fetchOrders();
	}, []);

	const totalSpent = useMemo(
		() => orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0),
		[orders]
	);

	const onProfileSave = async (e) => {
		e.preventDefault();
		setProfileMsg({ type: '', text: '' });

		if (!profileForm.name.trim()) {
			setProfileMsg({ type: 'error', text: 'Name is required.' });
			return;
		}

		setSavingProfile(true);
		const result = await updateProfile({ name: profileForm.name, phone: profileForm.phone });
		setSavingProfile(false);

		if (result.success) {
			setProfileMsg({ type: 'success', text: 'Profile updated successfully.' });
		} else {
			setProfileMsg({ type: 'error', text: result.message });
		}
	};

	const onPasswordSave = async (e) => {
		e.preventDefault();
		setPasswordMsg({ type: '', text: '' });

		if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
			setPasswordMsg({ type: 'error', text: 'All password fields are required.' });
			return;
		}
		if (passwordForm.newPassword.length < 8) {
			setPasswordMsg({ type: 'error', text: 'New password must be at least 8 characters.' });
			return;
		}
		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			setPasswordMsg({ type: 'error', text: 'New password and confirm password must match.' });
			return;
		}

		setSavingPassword(true);
		const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
		setSavingPassword(false);

		if (result.success) {
			setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
			setPasswordMsg({ type: 'success', text: 'Password changed successfully.' });
		} else {
			setPasswordMsg({ type: 'error', text: result.message });
		}
	};

	return (
		<div className="font-['Barlow',sans-serif] bg-neutral-50 min-h-screen">
			<section className="bg-neutral-950 pt-[68px] md:pt-[104px] pb-10 relative overflow-hidden">
				<div className="absolute inset-0 pointer-events-none"
					style={{
						backgroundImage:
							'linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)',
						backgroundSize: '52px 52px'
					}}
				/>
				<div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative">
					<span className="font-['Barlow_Condensed',sans-serif] font-bold text-xs tracking-[0.18em] uppercase text-amber-400 flex items-center gap-2 mb-3">
						<HiSparkles /> My Account
					</span>
					<div className="flex flex-wrap items-end justify-between gap-4">
						<div>
							<h1 className="font-['Barlow_Condensed',sans-serif] font-black text-4xl md:text-5xl uppercase leading-none text-white">
								Account <span className="text-amber-400">Dashboard</span>
							</h1>
							<p className="text-neutral-400 mt-2">Welcome back, {user?.name || 'Customer'}.</p>
						</div>
						<button
							onClick={logout}
							className="inline-flex items-center gap-2 border border-neutral-700 hover:border-red-500/40 text-neutral-300 hover:text-red-400 text-xs font-black tracking-widest uppercase px-4 py-2.5 rounded-lg transition-all"
						>
							<BiLogOut size={14} /> Logout
						</button>
					</div>
				</div>
			</section>

			<section className="py-10">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
					<MotionArticle variants={fadeUp} initial="hidden" animate="visible" className="bg-white border border-neutral-200 rounded-2xl p-5">
						<div className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1">Total Orders</div>
						<div className="font-['Barlow_Condensed',sans-serif] font-black text-4xl text-neutral-900">{orders.length}</div>
					</MotionArticle>
					<MotionArticle variants={fadeUp} initial="hidden" animate="visible" className="bg-white border border-neutral-200 rounded-2xl p-5">
						<div className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1">Total Spent</div>
						<div className="font-['Barlow_Condensed',sans-serif] font-black text-4xl text-neutral-900">${totalSpent.toFixed(2)}</div>
					</MotionArticle>
					<MotionArticle variants={fadeUp} initial="hidden" animate="visible" className="bg-white border border-neutral-200 rounded-2xl p-5">
						<div className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1">Email</div>
						<div className="font-semibold text-neutral-800 break-all">{user?.email || '-'}</div>
					</MotionArticle>
				</div>

				<div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
					<div className="xl:col-span-2 bg-white border border-neutral-200 rounded-2xl p-6">
						<div className="flex items-center justify-between mb-4">
							<h2 className="font-['Barlow_Condensed',sans-serif] font-black text-2xl uppercase text-neutral-900 flex items-center gap-2">
								<BiBox className="text-amber-500" /> My Orders
							</h2>
							<button onClick={fetchOrders} className="text-xs font-black tracking-widest uppercase text-neutral-500 hover:text-amber-500 transition-colors inline-flex items-center gap-1">
								<BiRefresh size={14} /> Refresh
							</button>
						</div>

						{loadingOrders ? (
							<div className="text-sm text-neutral-500">Loading orders...</div>
						) : orders.length === 0 ? (
							<div className="text-sm text-neutral-500 border border-dashed border-neutral-300 rounded-xl p-5">No orders found yet.</div>
						) : (
							<div className="space-y-3">
								{orders.map((order) => (
									<div key={order._id} className="border border-neutral-200 rounded-xl p-4">
										<div className="flex flex-wrap items-center justify-between gap-3">
											<div>
												<div className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">Order</div>
												<div className="font-semibold text-neutral-800">#{order.orderNumber}</div>
											</div>
											<StatusTag status={order.status} />
										</div>
										<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 text-sm">
											<div>
												<div className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">Placed</div>
												<div className="text-neutral-700">{new Date(order.createdAt).toLocaleString()}</div>
											</div>
											<div>
												<div className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">Items</div>
												<div className="text-neutral-700">{order.products?.length || 0}</div>
											</div>
											<div>
												<div className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">Total</div>
												<div className="text-neutral-900 font-bold">${Number(order.totalAmount || 0).toFixed(2)}</div>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>

					<div className="space-y-6">
						<div className="bg-white border border-neutral-200 rounded-2xl p-6">
							<h2 className="font-['Barlow_Condensed',sans-serif] font-black text-2xl uppercase text-neutral-900 flex items-center gap-2 mb-4">
								<BiUser className="text-amber-500" /> Profile
							</h2>
							<form onSubmit={onProfileSave} className="space-y-3">
								<div>
									<label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1.5 block">Full Name</label>
									<input
										value={profileForm.name}
										onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
										className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-amber-400"
									/>
								</div>
								<div>
									<label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1.5 block">Phone</label>
									<input
										value={profileForm.phone}
										onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
										className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-amber-400"
									/>
								</div>
								{profileMsg.text && (
									<p className={`text-xs font-semibold ${profileMsg.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
										{profileMsg.text}
									</p>
								)}
								<button disabled={savingProfile} className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-neutral-900 font-black text-[12px] tracking-widest uppercase px-4 py-3 rounded-lg transition-colors">
									{savingProfile ? 'Saving...' : 'Save Profile'}
								</button>
							</form>
						</div>

						<div className="bg-white border border-neutral-200 rounded-2xl p-6">
							<h2 className="font-['Barlow_Condensed',sans-serif] font-black text-2xl uppercase text-neutral-900 flex items-center gap-2 mb-4">
								<BiLock className="text-amber-500" /> Password
							</h2>
							<form onSubmit={onPasswordSave} className="space-y-3">
								<input
									type="password"
									placeholder="Current Password"
									value={passwordForm.currentPassword}
									onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
									className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-amber-400"
								/>
								<input
									type="password"
									placeholder="New Password"
									value={passwordForm.newPassword}
									onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
									className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-amber-400"
								/>
								<input
									type="password"
									placeholder="Confirm New Password"
									value={passwordForm.confirmPassword}
									onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
									className="w-full bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-700 outline-none focus:border-amber-400"
								/>
								{passwordMsg.text && (
									<p className={`text-xs font-semibold ${passwordMsg.type === 'success' ? 'text-emerald-600' : 'text-red-500'}`}>
										{passwordMsg.text}
									</p>
								)}
								<button disabled={savingPassword} className="w-full bg-neutral-900 hover:bg-neutral-700 disabled:opacity-60 text-white font-black text-[12px] tracking-widest uppercase px-4 py-3 rounded-lg transition-colors">
									{savingPassword ? 'Updating...' : 'Change Password'}
								</button>
							</form>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
