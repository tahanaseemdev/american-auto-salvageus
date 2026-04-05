import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { BiChevronRight } from 'react-icons/bi';
import { IoShieldCheckmark, IoGridOutline } from 'react-icons/io5';
import { HiSparkles } from 'react-icons/hi';
import api from '../utils/api';
import { resolveImageUrl } from '../utils/image';

const PART_LEVEL_PAGE_SIZE = 24;

const fadeUp = {
	hidden: { opacity: 0, y: 28 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.06 } },
};
const staggerItem = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const MotionDiv = motion.div;
function Reveal({ children, className = '', delay = 0, variants = fadeUp }) {
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, margin: '-60px' });
	return (
		<MotionDiv
			ref={ref}
			variants={variants}
			initial="hidden"
			animate={inView ? 'visible' : 'hidden'}
			transition={{ delay }}
			className={className}
		>
			{children}
		</MotionDiv>
	);
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?q=80&w=1200&auto=format&fit=crop';

function Hero({ title, subtitle }) {
	return (
		<section className="bg-neutral-950 pt-[68px] md:pt-[104px] pb-10 relative overflow-hidden">
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					backgroundImage:
						'linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)',
					backgroundSize: '52px 52px',
				}}
			/>
			<div
				className="absolute top-0 right-0 w-[500px] h-[300px] pointer-events-none"
				style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 65%)' }}
			/>
			<div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 relative">
				<Reveal>
					<span className="font-['Barlow_Condensed',sans-serif] font-bold text-xs tracking-[0.18em] uppercase text-amber-400 flex items-center gap-2 mb-3">
						<HiSparkles /> Our Catalog
					</span>
					<h1 className="font-['Barlow_Condensed',sans-serif] font-black text-5xl md:text-6xl uppercase leading-none text-white mb-3">
						{title}
					</h1>
					<p className="text-neutral-400 max-w-2xl">{subtitle}</p>
				</Reveal>
			</div>
		</section>
	);
}

function Breadcrumbs({ part, make, model, year, trim, partId, makeId, modelId, yearId }) {
	return (
		<div className="flex flex-wrap items-center gap-2 text-[11px] font-black tracking-widest uppercase text-neutral-400">
			<Link to="/shop" className="hover:text-amber-500 transition-colors">Shop</Link>
			{part && (
				<>
					<BiChevronRight className="text-neutral-300" />
					<Link to={`/shop/part/${partId}`} className="hover:text-amber-500 transition-colors">
						{part.title}
					</Link>
				</>
			)}
			{make && (
				<>
					<BiChevronRight className="text-neutral-300" />
					<Link to={`/shop/part/${partId}/make/${makeId}`} className="hover:text-amber-500 transition-colors">
						{make.name}
					</Link>
				</>
			)}
			{model && (
				<>
					<BiChevronRight className="text-neutral-300" />
					<Link
						to={`/shop/part/${partId}/make/${makeId}/model/${modelId}`}
						className="hover:text-amber-500 transition-colors"
					>
						{model.title}
					</Link>
				</>
			)}
			{year && (
				<>
					<BiChevronRight className="text-neutral-300" />
					<Link
						to={`/shop/part/${partId}/make/${makeId}/model/${modelId}/year/${yearId}`}
						className="hover:text-amber-500 transition-colors"
					>
						{year.title}
					</Link>
				</>
			)}
			{trim && (
				<>
					<BiChevronRight className="text-neutral-300" />
					<span className="text-neutral-700">{trim.title}</span>
				</>
			)}
		</div>
	);
}

function ProductGrid({ products }) {
	if (!products.length) {
		return (
			<div className="text-center py-16 text-neutral-400 border border-dashed border-neutral-300 rounded-2xl bg-white/70">
				<IoGridOutline size={40} className="mx-auto mb-3 opacity-40" />
				<p className="font-semibold">No products found.</p>
			</div>
		);
	}

	return (
		<MotionDiv
			variants={stagger}
			initial="hidden"
			animate="visible"
			className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
		>
			{products.map((product) => (
				<MotionDiv
					key={product._id}
					variants={staggerItem}
					whileHover={{ y: -5, boxShadow: '0 20px 48px -8px rgba(0,0,0,0.15)' }}
					className="bg-white rounded-2xl overflow-hidden border border-neutral-200 flex flex-col"
				>
					<div className="aspect-4/3 bg-neutral-100 border-b border-neutral-100 relative overflow-hidden">
						{product.image ? (
							<img src={resolveImageUrl(product.image)} alt={product.name} className="w-full h-full object-cover" />
						) : (
							<div className="w-full h-full flex items-center justify-center">
								<div className="text-center text-neutral-300">
									<div className="w-16 h-16 rounded-xl bg-neutral-200 mx-auto mb-2 flex items-center justify-center">
										<IoShieldCheckmark size={28} className="text-neutral-400" />
									</div>
									<span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Quality Tested</span>
								</div>
							</div>
						)}
					</div>

					<div className="p-4 flex flex-col flex-1">
						<h3 className="text-sm font-semibold text-neutral-800 leading-snug mb-2 flex-1">{product.name}</h3>

						<div className="flex items-end justify-end mt-auto pt-3 border-t border-neutral-100">
							<Link
								to={`/product/${product._id}`}
								state={{ product }}
								className={`flex items-center gap-1.5 text-[11px] font-black tracking-widest uppercase px-4 py-2 rounded-lg transition-all ${product.synthetic
									? 'bg-amber-100 text-amber-800 hover:bg-amber-400 hover:text-neutral-900'
									: 'bg-neutral-900 hover:bg-amber-400 hover:text-neutral-900 text-white'
									}`}
							>
								View Details
							</Link>
						</div>
					</div>
				</MotionDiv>
			))}
		</MotionDiv>
	);
}

function HierarchyGrid({ title, emptyMessage, items, getItemLabel, getItemLink, activeId }) {
	return (
		<div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6">
			<h2 className="font-['Barlow_Condensed',sans-serif] font-black text-3xl uppercase text-neutral-900 mb-4">
				{title}
			</h2>
			{items.length === 0 ? (
				<p className="text-sm text-neutral-500">{emptyMessage}</p>
			) : (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
					{items.map((item) => {
						const isActive = activeId === item._id;
						return (
							<Link
								key={item._id}
								to={getItemLink(item)}
								className={`rounded-xl border text-center px-4 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${isActive
									? 'bg-amber-400 border-amber-400 text-neutral-900'
									: 'border-neutral-300 text-neutral-700 hover:border-amber-400 hover:text-amber-600'
									}`}
							>
								{getItemLabel(item)}
							</Link>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default function Shop() {
	const {
		partId,
		makeId,
		modelId,
		yearId,
		trimId,
		categoryId,
		subCategoryId,
	} = useParams();

	const activePartId = partId || categoryId;
	const activeMakeId = makeId || subCategoryId;
	const [searchParams] = useSearchParams();
	const searchQuery = (searchParams.get('q') || '').trim();
	const partFilter = (searchParams.get('part') || '').trim();
	const makeFilter = (searchParams.get('make') || '').trim();
	const modelFilter = (searchParams.get('model') || '').trim();
	const yearFilter = (searchParams.get('year') || '').trim();
	const trimFilter = (searchParams.get('trim') || '').trim();

	const [categories, setCategories] = useState([]);
	const [categoryDetail, setCategoryDetail] = useState(null);
	const [searchProducts, setSearchProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [productPage, setProductPage] = useState(1);

	const hasStructuredFilters = Boolean(partFilter || makeFilter || modelFilter || yearFilter || trimFilter);

	const part = categoryDetail?.part || null;
	const makes = categoryDetail?.makes || [];
	const models = categoryDetail?.models || [];
	const years = categoryDetail?.years || [];
	const trims = categoryDetail?.trims || [];
	const partProducts = categoryDetail?.products || [];

	const activeMake = makes.find((item) => item._id === activeMakeId) || null;
	const activeModel = models.find((item) => item._id === modelId) || null;
	const activeYear = years.find((item) => item._id === yearId) || null;
	const activeTrim = trims.find((item) => item._id === trimId) || null;

	const isPartOnlySelection = Boolean(activePartId && !activeMakeId && !modelId && !yearId && !trimId && !searchQuery && !hasStructuredFilters);
	const productTotalPages = isPartOnlySelection
		? Math.max(1, Math.ceil(partProducts.length / PART_LEVEL_PAGE_SIZE))
		: 1;
	const paginatedPartProducts = useMemo(() => {
		if (!isPartOnlySelection) return partProducts;
		const start = (productPage - 1) * PART_LEVEL_PAGE_SIZE;
		return partProducts.slice(start, start + PART_LEVEL_PAGE_SIZE);
	}, [isPartOnlySelection, partProducts, productPage]);

	useEffect(() => {
		setProductPage(1);
	}, [activePartId, activeMakeId, modelId, yearId, trimId, searchQuery, hasStructuredFilters]);

	useEffect(() => {
		if (productPage > productTotalPages) {
			setProductPage(productTotalPages);
		}
	}, [productPage, productTotalPages]);

	useEffect(() => {
		let cancelled = false;

		async function load() {
			setLoading(true);
			setError('');

			try {
				if (searchQuery) {
					const { data } = await api.get(`/products?q=${encodeURIComponent(searchQuery)}&limit=100`);
					if (!cancelled) {
						setSearchProducts(data?.data?.products || []);
						setCategories([]);
						setCategoryDetail(null);
					}
					return;
				}

				if (hasStructuredFilters) {
					if (!partFilter) {
						if (!cancelled) {
							setSearchProducts([]);
							setCategories([]);
							setCategoryDetail(null);
						}
						return;
					}

					const params = new URLSearchParams();
					if (makeFilter) params.set('make', makeFilter);
					if (modelFilter) params.set('model', modelFilter);
					if (yearFilter) params.set('year', yearFilter);
					if (trimFilter) params.set('trim', trimFilter);

					const url = params.toString() ? `/parts/${partFilter}?${params.toString()}` : `/parts/${partFilter}`;
					const { data } = await api.get(url);
					if (!cancelled) {
						setCategoryDetail(data?.data || null);
						setSearchProducts([]);
						setCategories([]);
					}
					return;
				}

				if (!activePartId) {
					const { data } = await api.get('/parts');
					if (!cancelled) {
						setCategories(Array.isArray(data.data) ? data.data : []);
						setCategoryDetail(null);
						setSearchProducts([]);
					}
					return;
				}

				const params = new URLSearchParams();
				if (activeMakeId) params.set('make', activeMakeId);
				if (modelId) params.set('model', modelId);
				if (yearId) params.set('year', yearId);
				if (trimId) params.set('trim', trimId);

				const url = params.toString() ? `/parts/${activePartId}?${params.toString()}` : `/parts/${activePartId}`;
				const { data } = await api.get(url);
				if (!cancelled) {
					setCategoryDetail(data?.data || null);
					setSearchProducts([]);
				}
			} catch (err) {
				if (!cancelled) {
					setError(err?.response?.data?.message || 'Unable to load catalog data right now.');
				}
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		load();
		return () => {
			cancelled = true;
		};
	}, [
		activePartId,
		activeMakeId,
		modelId,
		yearId,
		trimId,
		searchQuery,
		hasStructuredFilters,
		partFilter,
		makeFilter,
		modelFilter,
		yearFilter,
		trimFilter,
	]);

	const heroContent = useMemo(() => {
		if (!activePartId) {
			if (searchQuery) {
				return {
					title: <>Search <span className="text-amber-400">Results</span></>,
					subtitle: `Showing parts matching "${searchQuery}".`,
				};
			}
			if (hasStructuredFilters) {
				return {
					title: <>Filtered <span className="text-amber-400">Results</span></>,
					subtitle: 'Showing products matching your selected Part, Make, Model, Year, and Trim filters.',
				};
			}
			return {
				title: <>Shop by <span className="text-amber-400">Parts</span></>,
				subtitle: 'Pick a part category to browse Make, Model, Year, and Trim options with matching inventory.',
			};
		}

		if (trimId && activeTrim) {
			return {
				title: <><span className="text-amber-400">{activeTrim.title}</span> Trim Parts</>,
				subtitle: `Showing products available for trim ${activeTrim.title}.`,
			};
		}

		if (yearId && activeYear) {
			return {
				title: <><span className="text-amber-400">{activeYear.title}</span> Year Parts</>,
				subtitle: `Pick a trim or browse all products for model year ${activeYear.title}.`,
			};
		}

		if (modelId && activeModel) {
			return {
				title: <><span className="text-amber-400">{activeModel.title}</span> Model Parts</>,
				subtitle: `Pick a year or browse all products available for ${activeModel.title}.`,
			};
		}

		if (activeMakeId && activeMake) {
			return {
				title: <><span className="text-amber-400">{activeMake.name}</span> Make Parts</>,
				subtitle: `Pick a model or browse all products listed under ${activeMake.name}.`,
			};
		}

		return {
			title: <>{part?.title || 'Part'} <span className="text-amber-400">Parts</span></>,
			subtitle: 'Choose a make to continue drilling down through model, year, and trim.',
		};
	}, [
		activePartId,
		searchQuery,
		hasStructuredFilters,
		part,
		activeMakeId,
		modelId,
		yearId,
		trimId,
		activeMake,
		activeModel,
		activeYear,
		activeTrim,
	]);

	let levelConfig = null;
	if (activePartId && !activeMakeId) {
		levelConfig = {
			title: 'Makes',
			emptyMessage: 'No makes available for this part yet.',
			items: makes,
			getItemLabel: (item) => item.name,
			getItemLink: (item) => `/shop/part/${activePartId}/make/${item._id}`,
			activeId: activeMakeId,
		};
	} else if (activePartId && !modelId) {
		levelConfig = {
			title: 'Models',
			emptyMessage: 'No models available for this make yet.',
			items: models,
			getItemLabel: (item) => item.title,
			getItemLink: (item) => `/shop/part/${activePartId}/make/${activeMakeId}/model/${item._id}`,
			activeId: modelId,
		};
	} else if (activePartId && !yearId) {
		levelConfig = {
			title: 'Years',
			emptyMessage: 'No years available for this model yet.',
			items: years,
			getItemLabel: (item) => item.title,
			getItemLink: (item) => `/shop/part/${activePartId}/make/${activeMakeId}/model/${modelId}/year/${item._id}`,
			activeId: yearId,
		};
	} else if (activePartId && !trimId) {
		levelConfig = {
			title: 'Trims',
			emptyMessage: 'No trims available for this year yet.',
			items: trims,
			getItemLabel: (item) => item.title,
			getItemLink: (item) => `/shop/part/${activePartId}/make/${activeMakeId}/model/${modelId}/year/${yearId}/trim/${item._id}`,
			activeId: trimId,
		};
	}

	const productsHeading = activeTrim?.title || activeYear?.title || activeModel?.title || activeMake?.name || part?.title || 'Part';

	const backLink = trimId
		? `/shop/part/${activePartId}/make/${activeMakeId}/model/${modelId}/year/${yearId}`
		: yearId
			? `/shop/part/${activePartId}/make/${activeMakeId}/model/${modelId}`
			: modelId
				? `/shop/part/${activePartId}/make/${activeMakeId}`
				: activeMakeId
					? `/shop/part/${activePartId}`
					: '/shop';

	const backLabel = trimId
		? 'Back to Year'
		: yearId
			? 'Back to Model'
			: modelId
				? 'Back to Make'
				: activeMakeId
					? 'Back to Part'
					: 'Back to Shop';

	return (
		<div className="font-['Barlow',sans-serif]">
			<Hero title={heroContent.title} subtitle={heroContent.subtitle} />

			<section className="bg-neutral-50 py-10 min-h-screen">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-7">
					<Reveal>
						<Breadcrumbs
							part={part}
							make={activeMake}
							model={activeModel}
							year={activeYear}
							trim={activeTrim}
							partId={activePartId}
							makeId={activeMakeId}
							modelId={modelId}
							yearId={yearId}
						/>
					</Reveal>

					{loading ? (
						<div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center text-neutral-400">
							Loading catalog...
						</div>
					) : error ? (
						<div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-5 text-sm font-semibold">
							{error}
						</div>
					) : searchQuery ? (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="font-['Barlow_Condensed',sans-serif] font-black text-3xl uppercase text-neutral-900">
									Matching Products
								</h2>
								<Link
									to="/shop"
									className="text-[11px] font-black tracking-widest uppercase text-neutral-500 hover:text-amber-500 transition-colors"
								>
									Clear Search
								</Link>
							</div>
							<ProductGrid products={searchProducts} />
						</div>
					) : hasStructuredFilters ? (
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<h2 className="font-['Barlow_Condensed',sans-serif] font-black text-3xl uppercase text-neutral-900">
									Matching Products
								</h2>
								<Link
									to="/shop"
									className="text-[11px] font-black tracking-widest uppercase text-neutral-500 hover:text-amber-500 transition-colors"
								>
									Clear Filters
								</Link>
							</div>
							<ProductGrid products={partProducts} />
						</div>
					) : !activePartId ? (
						<MotionDiv
							variants={stagger}
							initial="hidden"
							animate="visible"
							className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
						>
							{categories.map((item) => (
								<MotionDiv key={item._id} variants={staggerItem} className="h-full">
									<Link
										to={`/shop/part/${item._id}`}
										className="group h-full bg-white rounded-2xl overflow-hidden border border-neutral-200 flex flex-col hover:border-amber-300 transition-colors"
									>
										<div className="p-3 bg-neutral-100 border-b border-neutral-200">
											<div className="aspect-4/3 overflow-hidden rounded-xl relative">
												<img
													src={item.image ? resolveImageUrl(item.image) : FALLBACK_IMAGE}
													alt={item.title}
													className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
												/>
												<div className="absolute inset-0 bg-linear-to-t from-black/35 via-black/5 to-transparent" />
											</div>
										</div>
										<div className="p-4 flex items-center justify-between gap-3 flex-1">
											<h3 className="font-['Barlow_Condensed',sans-serif] font-black text-xl leading-tight uppercase text-neutral-900 min-h-12">
												{item.title}
											</h3>
											<span className="text-[11px] font-black tracking-widest uppercase text-amber-500">View</span>
										</div>
									</Link>
								</MotionDiv>
							))}
						</MotionDiv>
					) : (
						<div className="space-y-8">
							{levelConfig && (
								<HierarchyGrid
									title={levelConfig.title}
									emptyMessage={levelConfig.emptyMessage}
									items={levelConfig.items}
									getItemLabel={levelConfig.getItemLabel}
									getItemLink={levelConfig.getItemLink}
									activeId={levelConfig.activeId}
								/>
							)}

							<div>
								<div className="flex items-center justify-between mb-4">
									<h2 className="font-['Barlow_Condensed',sans-serif] font-black text-3xl uppercase text-neutral-900">
										{productsHeading} Products
									</h2>
									{(activeMakeId || modelId || yearId || trimId) && (
										<Link
											to={backLink}
											className="text-[11px] font-black tracking-widest uppercase text-neutral-500 hover:text-amber-500 transition-colors"
										>
											{backLabel}
										</Link>
									)}
								</div>
								<ProductGrid products={paginatedPartProducts} />
								{isPartOnlySelection && partProducts.length > PART_LEVEL_PAGE_SIZE && (
									<div className="mt-5 flex flex-wrap items-center justify-between gap-3">
										<p className="text-xs font-semibold text-neutral-500 mb-0">
											Showing {(productPage - 1) * PART_LEVEL_PAGE_SIZE + 1}-{Math.min(productPage * PART_LEVEL_PAGE_SIZE, partProducts.length)} of {partProducts.length}
										</p>
										<div className="flex items-center gap-2">
											<button
												type="button"
												onClick={() => setProductPage((prev) => Math.max(1, prev - 1))}
												disabled={productPage === 1}
												className="px-3 py-1.5 rounded-lg border border-neutral-300 text-[11px] font-black tracking-widest uppercase text-neutral-700 hover:border-amber-400 hover:text-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
											>
												Prev
											</button>
											<span className="text-xs font-bold text-neutral-500 min-w-16 text-center">
												{productPage} / {productTotalPages}
											</span>
											<button
												type="button"
												onClick={() => setProductPage((prev) => Math.min(productTotalPages, prev + 1))}
												disabled={productPage === productTotalPages}
												className="px-3 py-1.5 rounded-lg border border-neutral-300 text-[11px] font-black tracking-widest uppercase text-neutral-700 hover:border-amber-400 hover:text-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
											>
												Next
											</button>
										</div>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</section>
		</div>
	);
}
