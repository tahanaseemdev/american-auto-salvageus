import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { BiChevronRight, BiPhoneCall, BiArrowBack } from 'react-icons/bi';
import { FaFileInvoiceDollar } from 'react-icons/fa';
import { IoShieldCheckmark } from 'react-icons/io5';
import api from '../utils/api';
import { resolveImageUrl } from '../utils/image';

function formatCurrency(value) {
	if (value === null || value === undefined) return '';
	const normalized = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]/g, ''));
	if (!Number.isFinite(normalized)) return '';
	return normalized.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

const WHY_BUY_ITEMS = [
	'🛠️ Fully inspected and road-tested',
	'🛡️ 1-Year Parts Warranty included',
	'🔄 30-Day Hassle-Free Return Policy',
	'🧼 Cleaned and ready for installation',
	'🚚 Free Shipping across the U.S.',
	'📦 Securely packaged for safe transit',
	'☎️ Support available before & after your purchase',
];

const MILEAGE_PART_PATTERN = /\b(engine|transmission)s?\b/i;

function buildSyntheticProductId(product, trimId) {
	const partId = String(product?.category?._id || '').trim();
	const makeId = String(product?.subCategory?._id || '').trim();
	const modelId = String(product?.model?._id || '').trim();
	const yearId = String(product?.year?._id || '').trim();
	const selectedTrimId = String(trimId || product?.trim?._id || '').trim();

	if (!partId || !makeId || !modelId || !yearId || !selectedTrimId) return '';
	return `${partId}-${makeId}-${modelId}-${yearId}-${selectedTrimId}`;
}

export default function ProductDetail() {
	const { productId } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const routeProduct = location.state?.product;
	const initialProduct = routeProduct && String(routeProduct._id) === String(productId) ? routeProduct : null;
	const [product, setProduct] = useState(initialProduct);
	const [loading, setLoading] = useState(true);
	const [trimOptions, setTrimOptions] = useState([]);
	const [error, setError] = useState('');
	const [selectedMileageBandKey, setSelectedMileageBandKey] = useState('');

	const partKey = String(product?.category?.title || '').trim();
	const isMileagePart = MILEAGE_PART_PATTERN.test(partKey);
	const mileageBands = useMemo(() => (Array.isArray(product?.mileageBands) ? product.mileageBands : []), [product?.mileageBands]);
	const selectedMileageBand = useMemo(() => {
		if (!mileageBands.length) return null;
		if (selectedMileageBandKey) {
			return mileageBands.find((band) => String(band?.key || '') === selectedMileageBandKey) || null;
		}
		return mileageBands.find((band) => band?.selected) || mileageBands[0] || null;
	}, [mileageBands, selectedMileageBandKey]);

	const normalizedPrice =
		selectedMileageBand && Number.isFinite(Number(selectedMileageBand?.amount))
			? Number(selectedMileageBand.amount)
			: typeof product?.price === 'number'
				? product.price
				: Number(String(product?.price ?? '').replace(/[^0-9.-]/g, ''));
	const hasPrice = Number.isFinite(normalizedPrice) && normalizedPrice > 0;
	const partName = product?.category?.title || 'part';
	const selectedTrimId = String(product?.trim?._id || '');

	useEffect(() => {
		let cancelled = false;

		if (initialProduct) {
			setProduct(initialProduct);
		}

		async function loadProduct() {
			setLoading(true);
			setError('');
			try {
				const { data } = await api.get(`/products/${productId}`);
				if (!cancelled) {
					setProduct(data?.data || null);
				}
			} catch (err) {
				if (!cancelled) {
					setProduct(initialProduct || null);
					setError(err?.response?.data?.message || 'Unable to load product details right now.');
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		if (productId) {
			loadProduct();
		}

		return () => {
			cancelled = true;
		};
	}, [productId, initialProduct]);

	useEffect(() => {
		const preselectedKey = String(product?.selectedMileageBand?.key || '').trim();
		if (preselectedKey) {
			setSelectedMileageBandKey(preselectedKey);
			return;
		}

		const firstSelected = Array.isArray(product?.mileageBands)
			? product.mileageBands.find((band) => band?.selected)
			: null;
		setSelectedMileageBandKey(String(firstSelected?.key || ''));
	}, [product]);

	useEffect(() => {
		let cancelled = false;

		async function loadTrimOptions() {
			const partId = String(product?.category?._id || '').trim();
			const makeId = String(product?.subCategory?._id || '').trim();
			const modelId = String(product?.model?._id || '').trim();
			const yearId = String(product?.year?._id || '').trim();

			if (!partId || !makeId || !modelId || !yearId) {
				setTrimOptions([]);
				return;
			}

			try {
				const { data } = await api.get(`/parts/${partId}?make=${encodeURIComponent(makeId)}&model=${encodeURIComponent(modelId)}&year=${encodeURIComponent(yearId)}`);
				if (!cancelled) {
					setTrimOptions(Array.isArray(data?.data?.trims) ? data.data.trims : []);
				}
			} catch {
				if (!cancelled) {
					setTrimOptions([]);
				}
			}
		}

		if (product) {
			loadTrimOptions();
		}

		return () => {
			cancelled = true;
		};
	}, [product]);

	const handleTrimClick = (trimId) => {
		const nextTrimId = String(trimId || '').trim();
		if (!nextTrimId || nextTrimId === selectedTrimId) return;

		const nextProductId = buildSyntheticProductId(product, nextTrimId);
		if (!nextProductId) return;

		navigate(`/product/${nextProductId}`);
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
						to="/shop"
						className="inline-flex items-center gap-1.5 text-[11px] font-black tracking-widest uppercase text-neutral-400 hover:text-amber-400 transition-colors"
					>
						<BiArrowBack size={15} /> Back to Shop
					</Link>
					<div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-black tracking-widest uppercase text-neutral-400">
						<Link to="/shop" className="hover:text-amber-400 transition-colors">Shop</Link>
						<BiChevronRight className="text-neutral-500" />
						<span className="text-amber-400">Product Details</span>
					</div>
				</div>
			</section>

			<section className="bg-neutral-50 py-10 min-h-screen">
				<div className="max-w-6xl mx-auto px-4 sm:px-6">
					{loading ? (
						<div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center text-neutral-400">
							Loading product details...
						</div>
					) : error ? (
						<div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-5 text-sm font-semibold">
							{error}
						</div>
					) : !product ? (
						<div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center text-neutral-500">
							Product not found.
						</div>
					) : (
						<div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
							<div className="grid grid-cols-1 lg:grid-cols-2">
								<div className="bg-neutral-100 border-b lg:border-b-0 lg:border-r border-neutral-200 flex items-start justify-start p-4 sm:p-6 min-h-80 lg:min-h-[640px]">
									{product.image ? (
										<img src={resolveImageUrl(product.image)} alt={product.name} className="block max-w-full max-h-[560px] w-auto h-auto object-contain" />
									) : (
										<div className="w-full h-full min-h-80 flex items-start justify-start text-neutral-400">
											<div className="text-center">
												<IoShieldCheckmark size={34} className="mx-auto mb-3" />
												<p className="text-sm font-semibold">Image unavailable</p>
											</div>
										</div>
									)}
								</div>

								<div className="p-6 sm:p-7 lg:p-8 flex flex-col">
									<p className="text-[11px] font-black tracking-widest uppercase text-amber-500">Product Detail</p>
									<h1 className="font-['Barlow_Condensed',sans-serif] font-black text-3xl sm:text-4xl uppercase leading-none text-neutral-900 mt-2">
										{product.name}
									</h1>
									<div className="flex flex-wrap items-center gap-3 my-3">
										<Link
											to={`/product/${product._id}/call-now?mode=quote`}
											className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-900 text-[12px] font-black tracking-widest uppercase px-6 py-3 rounded-lg transition-colors"
										>
											<FaFileInvoiceDollar size={14} />
											Get a Quote
										</Link>
										<Link
											to={`/product/${product._id}/call-now?mode=call`}
											className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-amber-400 hover:text-neutral-900 text-white text-[12px] font-black tracking-widest uppercase px-6 py-3 rounded-lg transition-colors"
										>
											<BiPhoneCall size={15} />
											Call Now
										</Link>
									</div>

									<div className="mt-4 space-y-2 text-[15px] text-neutral-700">
										<p><span className="font-black tracking-wide uppercase text-neutral-400">⚙️ Part:</span> <span className="font-semibold text-neutral-900">{product.category?.title || '-'}</span></p>
										<p><span className="font-black tracking-wide uppercase text-neutral-400">🚗 Make:</span> <span className="font-semibold text-neutral-900">{product.subCategory?.name || '-'}</span></p>
										<p><span className="font-black tracking-wide uppercase text-neutral-400">🚘 Model:</span> <span className="font-semibold text-neutral-900">{product.model?.title || '-'}</span></p>
										<p><span className="font-black tracking-wide uppercase text-neutral-400">📅 Year:</span> <span className="font-semibold text-neutral-900">{product.year?.title || '-'}</span></p>
										<p><span className="font-black tracking-wide uppercase text-neutral-400">🔍 Spec:</span> <span className="font-semibold text-neutral-900">{product.trim?.title || '-'}</span></p>
									</div>

									{isMileagePart && mileageBands.length > 0 ? (
										<div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-4">
											<label htmlFor="mileage-band" className="block text-[11px] font-black tracking-widest uppercase text-neutral-500 mb-2">
												Choose Miles
											</label>
											<select
												id="mileage-band"
												value={selectedMileageBand?.key || ''}
												onChange={(event) => setSelectedMileageBandKey(event.target.value)}
												className="w-full bg-white border border-neutral-300 focus:border-amber-400 rounded-lg px-3 py-2.5 text-sm text-neutral-800 outline-none"
											>
												{mileageBands.map((band) => (
													<option key={band.key} value={band.key}>
														{band.label} — {formatCurrency(band.amount)}
													</option>
												))}
											</select>
										</div>
									) : null}

									{trimOptions.length > 0 ? (
										<div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-4">
											<div className="block text-[11px] font-black tracking-widest uppercase text-neutral-500 mb-3">
												Other Trims
											</div>
											<div className="flex flex-wrap gap-2">
												{trimOptions.map((trim) => {
													const nextProductId = buildSyntheticProductId(product, trim._id);
													const isActive = String(trim._id) === selectedTrimId;
													const content = (
														<span className={`inline-flex items-center rounded-full border px-3 py-2 text-[11px] font-black tracking-widest uppercase transition-colors ${isActive ? 'border-amber-400 bg-amber-400 text-neutral-900' : 'border-neutral-300 bg-white text-neutral-700 hover:border-amber-400 hover:text-amber-600'}`}>
															{trim.title}
														</span>
													);

													if (!nextProductId) {
														return <span key={trim._id}>{content}</span>;
													}

													return isActive ? (
														<button key={trim._id} type="button" disabled className="cursor-default">
															{content}
														</button>
													) : (
														<button key={trim._id} type="button" onClick={() => handleTrimClick(trim._id)} className="cursor-pointer">
															{content}
														</button>
													);
												})}
											</div>
										</div>
									) : null}

									{hasPrice ? (
										<div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
											<p className="text-[9px] font-bold tracking-widest uppercase text-amber-700">Price</p>
											<p className="font-black text-lg text-neutral-900 mt-1">{formatCurrency(normalizedPrice)}</p>
											{selectedMileageBand?.label ? (
												<p className="text-xs font-semibold text-neutral-600 mt-1">{selectedMileageBand.label}</p>
											) : null}
										</div>
									) : null}

									<div className="pt-6 mt-auto space-y-4">
										<div className="rounded-xl border border-neutral-200 bg-white px-4 py-4">
											<p className="text-xs font-black tracking-widest uppercase text-neutral-500 mb-2">Description</p>
											<p className="text-sm text-neutral-700 leading-relaxed">
												This {partName} has been professionally inspected and compression-tested to ensure reliable performance. It’s a clean pullout - free from cracks, leaks, and internal damage. Backed by our 1-Year Parts Warranty and 30-Day Return Policy, this unit is ready for direct installation and built to meet factory standards. Skip the guesswork and buy with confidence.
											</p>
										</div>

										<div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-4">
											<p className="text-[11px] font-black tracking-widest uppercase text-neutral-500 mb-2">Why Buy From Us?</p>
											<div className="space-y-2">
												{WHY_BUY_ITEMS.map((item) => (
													<p key={item} className="text-[13px] font-medium text-neutral-700 leading-snug">{item}</p>
												))}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</section>
		</div>
	);
}