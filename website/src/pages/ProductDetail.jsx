import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { BiChevronRight, BiPhoneCall, BiArrowBack } from 'react-icons/bi';
import { IoShieldCheckmark } from 'react-icons/io5';
import api from '../utils/api';
import { resolveImageUrl } from '../utils/image';

function formatCurrency(value) {
	if (value === null || value === undefined || Number.isNaN(Number(value))) return '';
	return Number(value).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export default function ProductDetail() {
	const { productId } = useParams();
	const location = useLocation();
	const routeProduct = location.state?.product;
	const initialProduct = routeProduct && String(routeProduct._id) === String(productId) ? routeProduct : null;
	const [product, setProduct] = useState(initialProduct);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		let cancelled = false;

		if (initialProduct?.synthetic) {
			setProduct(initialProduct);
			setLoading(false);
			setError('');
			return () => {
				cancelled = true;
			};
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
					if (initialProduct) {
						setProduct(initialProduct);
						setError('');
					} else {
						setError(err?.response?.data?.message || 'Unable to load product details right now.');
					}
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
								<div className="bg-neutral-100 border-b lg:border-b-0 lg:border-r border-neutral-200 aspect-4/3 lg:aspect-auto">
									{product.image ? (
										<img src={resolveImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
									) : (
										<div className="w-full h-full min-h-80 flex items-center justify-center text-neutral-400">
											<div className="text-center">
												<IoShieldCheckmark size={34} className="mx-auto mb-3" />
												<p className="text-sm font-semibold">Image unavailable</p>
											</div>
										</div>
									)}
								</div>

								<div className="p-6 sm:p-7 lg:p-8 flex flex-col">
									<p className="text-[11px] font-black tracking-widest uppercase text-amber-500">Product Detail</p>
									<h1 className="font-['Barlow_Condensed',sans-serif] font-black text-4xl uppercase leading-none text-neutral-900 mt-2">
										{product.name}
									</h1>

									<div className="mt-5 space-y-3 text-sm text-neutral-600">
										<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
											<div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
												<p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">Category</p>
												<p className="font-semibold text-neutral-800 mt-1">{product.category?.title || '-'}</p>
											</div>
											<div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
												<p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">Make</p>
												<p className="font-semibold text-neutral-800 mt-1">{product.subCategory?.name || '-'}</p>
											</div>
											<div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
												<p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">Model</p>
												<p className="font-semibold text-neutral-800 mt-1">{product.model?.title || '-'}</p>
											</div>
											<div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3">
												<p className="text-[10px] font-bold tracking-widest uppercase text-neutral-400">Year / Trim</p>
												<p className="font-semibold text-neutral-800 mt-1">
													{product.year?.title || '-'}{product.trim?.title ? ` / ${product.trim.title}` : ''}
												</p>
											</div>
										</div>

										<div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
											<p className="text-[10px] font-bold tracking-widest uppercase text-amber-700">Price</p>
											<p className="font-black text-xl text-neutral-900 mt-1">
												{Number(product.price) > 0 ? formatCurrency(product.price) : 'Contact for pricing'}
											</p>
										</div>
									</div>

									<div className="pt-6 mt-auto">
										<Link
											to={`/product/${product._id}/call-now`}
											className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-amber-400 hover:text-neutral-900 text-white text-[12px] font-black tracking-widest uppercase px-6 py-3 rounded-lg transition-colors"
										>
											<BiPhoneCall size={15} />
											Call Now
										</Link>
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