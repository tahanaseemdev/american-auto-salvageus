import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { BiArrowBack, BiLoaderAlt, BiPhoneCall } from 'react-icons/bi';
import api from '../utils/api';

const EMPTY_FORM = {
	firstName: '',
	lastName: '',
	email: '',
	phone: '',
	street: '',
	city: '',
	state: '',
	zip: '',
	notes: '',
};

function Input({ label, name, value, onChange, type = 'text', required = false, placeholder = '' }) {
	return (
		<label className="flex flex-col gap-1.5">
			<span className="text-[11px] font-bold tracking-widest uppercase text-neutral-400">
				{label}
				{required ? <span className="text-amber-500"> *</span> : null}
			</span>
			<input
				type={type}
				name={name}
				value={value}
				onChange={onChange}
				required={required}
				placeholder={placeholder}
				className="bg-neutral-50 border border-neutral-200 focus:border-amber-400 rounded-lg px-3.5 py-2.5 text-sm text-neutral-700 outline-none"
			/>
		</label>
	);
}

export default function ProductInquiry() {
	const { productId } = useParams();
	const [product, setProduct] = useState(null);
	const [loadingProduct, setLoadingProduct] = useState(true);
	const [form, setForm] = useState(EMPTY_FORM);
	const [sending, setSending] = useState(false);
	const [error, setError] = useState('');

	const fullName = useMemo(() => `${form.firstName} ${form.lastName}`.trim(), [form.firstName, form.lastName]);

	useEffect(() => {
		let cancelled = false;

		async function loadProduct() {
			setLoadingProduct(true);
			setError('');
			try {
				const { data } = await api.get(`/products/${productId}`);
				if (!cancelled) {
					setProduct(data?.data || null);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err?.response?.data?.message || 'Unable to load product details right now.');
				}
			} finally {
				if (!cancelled) setLoadingProduct(false);
			}
		}

		if (productId) {
			loadProduct();
		}

		return () => {
			cancelled = true;
		};
	}, [productId]);

	const onChange = (event) => {
		const { name, value } = event.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const submitInquiry = async (event) => {
		event.preventDefault();
		if (!product?._id) return;

		setSending(true);
		setError('');

		try {
			const { data } = await api.post('/orders', {
				products: [
					{
						product: product._id,
						name: product.name,
						sku: product.sku || '',
						price: 0,
						quantity: 1,
					},
				],
				shippingDetails: {
					firstName: form.firstName,
					lastName: form.lastName,
					email: form.email,
					phone: form.phone,
					street: form.street,
					city: form.city,
					state: form.state,
					zip: form.zip,
					notes: `Lead source: Call Now page. ${form.notes}`.trim(),
				},
				paymentMethod: 'whatsapp',
				subtotal: 0,
				shipping: 0,
			});

			const redirectUrl = data?.data?.whatsappUrl;
			if (!redirectUrl) {
				throw new Error('Redirect URL is missing in response.');
			}

			window.location.href = redirectUrl;
		} catch (err) {
			setError(err?.response?.data?.message || err?.message || 'Unable to submit your request right now.');
		} finally {
			setSending(false);
		}
	};

	return (
		<div className="font-['Barlow',sans-serif]">
			<section className="bg-neutral-950 pt-[68px] md:pt-[104px] pb-10 relative overflow-hidden">
				<div
					className="absolute inset-0 pointer-events-none"
					style={{
						backgroundImage:
							'linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)',
						backgroundSize: '52px 52px',
					}}
				/>
				<div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 relative">
					<Link
						to={productId ? `/product/${productId}` : '/shop'}
						className="inline-flex items-center gap-1.5 text-[11px] font-black tracking-widest uppercase text-neutral-400 hover:text-amber-400 transition-colors"
					>
						<BiArrowBack size={15} /> Back to Product
					</Link>
					<p className="font-['Barlow_Condensed',sans-serif] font-bold text-xs tracking-[0.18em] uppercase text-amber-400 mt-5 mb-2">
						Call Now Request
					</p>
					<h1 className="font-['Barlow_Condensed',sans-serif] font-black text-5xl md:text-6xl uppercase leading-none text-white">
						{loadingProduct ? 'Loading...' : product?.name || 'Product'}
					</h1>
				</div>
			</section>

			<section className="bg-neutral-50 py-10 min-h-screen">
				<div className="max-w-3xl mx-auto px-4 sm:px-6">
					<div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 lg:p-7 space-y-4">
						<div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
							<p className="text-xs text-amber-900 font-semibold leading-relaxed">
								Share your details and our team will follow up with your product request.
							</p>
							<a href="tel:+1-866-206-9163" className="inline-flex items-center gap-2 mt-2 text-[11px] font-black tracking-widest uppercase text-amber-700 hover:text-amber-800">
								<BiPhoneCall size={14} /> Call +1-866-206-9163
							</a>
						</div>

						{error ? (
							<div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
								{error}
							</div>
						) : null}

						{!loadingProduct && !product ? (
							<div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
								Product not found.
							</div>
						) : (
							<form onSubmit={submitInquiry} className="space-y-4">
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
									<Input label="First Name" name="firstName" value={form.firstName} onChange={onChange} required placeholder="John" />
									<Input label="Last Name" name="lastName" value={form.lastName} onChange={onChange} required placeholder="Doe" />
									<Input label="Email" name="email" value={form.email} onChange={onChange} type="email" placeholder="john@example.com" />
									<Input label="Phone" name="phone" value={form.phone} onChange={onChange} type="tel" required placeholder="+1 (555) 000-0000" />
									<div className="sm:col-span-2">
										<Input label="Street Address" name="street" value={form.street} onChange={onChange} placeholder="123 Main Street" />
									</div>
									<Input label="City" name="city" value={form.city} onChange={onChange} placeholder="Austin" />
									<Input label="State" name="state" value={form.state} onChange={onChange} placeholder="TX" />
									<Input label="ZIP" name="zip" value={form.zip} onChange={onChange} placeholder="78701" />
								</div>

								<label className="flex flex-col gap-1.5">
									<span className="text-[11px] font-bold tracking-widest uppercase text-neutral-400">Order Notes</span>
									<textarea
										name="notes"
										rows={3}
										value={form.notes}
										onChange={onChange}
										placeholder="Add vehicle details, urgency, preferred call time, etc."
										className="bg-neutral-50 border border-neutral-200 focus:border-amber-400 rounded-lg px-3.5 py-2.5 text-sm text-neutral-700 outline-none resize-none"
									/>
								</label>

								<div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
									<span className="font-semibold text-neutral-800">Request for:</span> {product?.name || '-'}
									{fullName ? <span className="block mt-1">Requested by: {fullName}</span> : null}
								</div>

								<button
									type="submit"
									disabled={sending || loadingProduct || !product}
									className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-amber-400 hover:text-neutral-900 disabled:opacity-60 text-white text-[12px] font-black tracking-widest uppercase px-6 py-3 rounded-lg transition-colors"
								>
									{sending ? <BiLoaderAlt className="animate-spin" size={15} /> : <BiPhoneCall size={15} />}
									{sending ? 'Submitting...' : 'Submit Request'}
								</button>
							</form>
						)}
					</div>
				</div>
			</section>
		</div>
	);
}