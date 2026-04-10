import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BiSearch, BiCheckCircle, BiRightArrowAlt, BiUser, BiPhone, BiMenu, BiX, BiEnvelope, BiAward } from 'react-icons/bi';
import { FaClipboardCheck, FaTruck } from 'react-icons/fa';
import { BsFillLightningChargeFill } from 'react-icons/bs';
import { IoShieldCheckmark } from 'react-icons/io5';
import { BiCreditCard } from 'react-icons/bi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import api from '../utils/api';
import { resolveImageUrl } from '../utils/image';
import 'swiper/css';
/* ─── Animation Variants ─── */
const fadeUp = {
	hidden: { opacity: 0, y: 28 },
	visible: (delay = 0) => ({
		opacity: 1, y: 0,
		transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
	}),
};
const stagger = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.08 } },
};
const staggerItem = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};
const scaleIn = {
	hidden: { opacity: 0, scale: 0.95 },
	visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const MotionDiv = motion.div;

/* ─── Scroll Reveal Wrapper ─── */
function Reveal({ children, className = '', delay = 0, variants = fadeUp }) {
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, margin: '-60px' });
	return (
		<MotionDiv ref={ref} className={className} initial="hidden"
			animate={inView ? 'visible' : 'hidden'} custom={delay} variants={variants}>
			{children}
		</MotionDiv>
	);
}

/* ─── Section Header ─── */
function SectionLabel({ eyebrow, heading, light = false }) {
	return (
		<Reveal>
			<p className={`font-['Barlow_Condensed',sans-serif] font-bold text-xs tracking-[0.18em] uppercase mb-1 ${light ? 'text-amber-400' : 'text-amber-500'}`}>{eyebrow}</p>
			<h2 className={`font-['Barlow_Condensed',sans-serif] font-black text-4xl uppercase leading-none ${light ? 'text-white' : 'text-neutral-900'}`}>{heading}</h2>
		</Reveal>
	);
}

const CATEGORIES = ['Engines', 'Transmissions', 'Alternators', 'Headlights'];
const TICKER_ITEMS = ['Engines', 'Transmissions', 'Axles', 'Alternators', 'Headlights', 'Starters', 'Radiators', 'Catalytic Converters', 'Door Panels', 'Control Arms', 'Fuel Pumps', 'CV Shafts'];
const SEARCH_FIELDS = ['Part', 'Make', 'Model', 'Year', 'Trim'];
const PRIORITY_PART_TITLES = ['engine', 'engines', 'transmission', 'transmissions'];
const FEATURED_STATIC_PRODUCTS = [
	{
		id: '65f1a001c12d4a001a000016-69cfbed27b92a7441ac50bd3-69cfc2df7b92a7441ac54130-69cfc2fc7b92a7441ac541c6-911800663e091e76169d5282',
		title: '1995 Volvo 960 Engine (2.9L, VIN 96, 6th and 7th digit), B6304F engine',
		price: 1165,
		img: 'https://allusedautoparts.world/aaps-img/engine.jpg',
		tag: 'Engine',
	},
	{
		id: '69cfbed17b92a7441ac50ba3-69cfbed27b92a7441ac50bbe-69cfc0ea7b92a7441ac52d10-69cfc0ff7b92a7441ac52dcf-74aa49358bbb16ec24043c1b',
		title: '1988 Mazda MX6 Transmission AT, w/o Turbo',
		price: 9140,
		img: 'https://allusedautoparts.world/aaps-img/transmission.jpg',
		tag: 'Transmission',
	},
	{
		id: '69cfbed17b92a7441ac50ba3-69cfbed27b92a7441ac50bab-69cfbf837b92a7441ac514fb-69cfbfa57b92a7441ac517ab-9657809acf4becee3152bcee',
		title: '1967 Chevrolet Suburban-10 (1988 Down) Transmission MT, 4 speed, Muncie manufactured',
		price: 949,
		img: 'https://allusedautoparts.world/aaps-img/transmission.jpg',
		tag: 'Transmission',
	},
	{
		id: '65f1a001c12d4a001a000016-69cfbed27b92a7441ac50baf-69cfbfd77b92a7441ac51b91-69cfbfea7b92a7441ac51cfa-927cea07235dc2ad97060ee2',
		title: '1977 Dodge Monaco (1978 Down) Engine 8-400, 4BC VIN N (5th digit)',
		price: 3536,
		img: 'https://allusedautoparts.world/aaps-img/engine.jpg',
		tag: 'Engine',
	},
];

const formatMoney = (value) =>
	Number(value || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
const promos = [
	{ id: 1, eyebrow: "Big Sale", title: "Used Engines", badge: "Save 25%", img: "https://allusedautoparts.world/images/promo/promo1.jpg" },
	{ id: 2, eyebrow: "Ready for", title: "Used Transmissions", badge: "New Arrivals", img: "https://allusedautoparts.world/images/promo/promo2.jpg" },
	{ id: 3, eyebrow: "Engine", title: "Truck Parts", badge: "Top Rated", img: "https://allusedautoparts.world/images/promo/promo3.jpg" },
];
const partsGrid = [
	{ title: "A/C Control", img: "https://allusedautoparts.world/aaps-img/a-c-control.jpg" },
	{ title: "ABS Control Module", img: "https://allusedautoparts.world/aaps-img/abs-control-module-pump.jpg" },
	{ title: "AC Control", img: "https://allusedautoparts.world/aaps-img/ac-control.jpg" },
	{ title: "Air Bag", img: "https://allusedautoparts.world/aaps-img/air-bag.jpg" },
	{ title: "AC Compressor", img: "https://allusedautoparts.world/aaps-img/air-conditioner-compressor.jpg" },
	{ title: "Alternator", img: "https://allusedautoparts.world/aaps-img/alternator.jpg" },
	{ title: "Axle Front", img: "https://allusedautoparts.world/aaps-img/axle-front.jpg" },
	{ title: "Axle Rear", img: "https://allusedautoparts.world/aaps-img/axle-rear.jpg" },
	{ title: "Axle Shaft", img: "https://allusedautoparts.world/aaps-img/axle-shaft.jpg" },
	{ title: "Chassis Computer", img: "https://allusedautoparts.world/aaps-img/chassis-computer.jpg" },
	{ title: "Convertible Top Motor", img: "https://allusedautoparts.world/aaps-img/convertible-top-motor.jpg" },
	{ title: "Door Panel", img: "https://allusedautoparts.world/aaps-img/abs-control-module-pump.jpg" },
];
const brands = [
	{ name: "Acura", img: "https://allusedautoparts.world/aaps-img/acura.jpg" },
	{ name: "Alfa Romeo", img: "https://allusedautoparts.world/aaps-img/alfa.jpg" },
	{ name: "AMC", img: "https://allusedautoparts.world/aaps-img/amc.jpg" },
	{ name: "Audi", img: "https://allusedautoparts.world/aaps-img/audi.jpg" },
	{ name: "BMW", img: "https://allusedautoparts.world/aaps-img/bmw.jpg" },
	{ name: "Buick", img: "https://allusedautoparts.world/aaps-img/buick.jpg" },
	{ name: "Cadillac", img: "https://allusedautoparts.world/aaps-img/cadillac.jpg" },
	{ name: "Chevrolet", img: "https://allusedautoparts.world/aaps-img/chevrolet.jpg" },
	{ name: "Chrysler", img: "https://allusedautoparts.world/aaps-img/chrysler.jpg" },
	{ name: "Daewoo", img: "https://allusedautoparts.world/aaps-img/daewoo.jpg" },
	{ name: "Dodge", img: "https://allusedautoparts.world/aaps-img/dodge.jpg" },
	{ name: "Ford", img: "https://allusedautoparts.world/aaps-img/ford.jpg" },
	{ name: "Fiat", img: "https://allusedautoparts.world/aaps-img/fiat.jpg" },
	{ name: "Eagle", img: "https://allusedautoparts.world/aaps-img/eagle.jpg" },
];
const testimonials = [
	{ id: 1, quote: "Found a low-miles Tucson transmission in minutes. Shipping was quick and the unit was clean and tested.", author: "Casey Rossi", detail: "4.9 / 5 rating" },
	{ id: 2, quote: "Matched the exact 3.3L V6 for my Sienna. The mileage tier pricing made sense and saved me money.", author: "Jordan P.", detail: "Engine Purchase" },
	{ id: 3, quote: "Great support during install. They checked fitment by VIN before shipping — zero surprises.", author: "Amira K.", detail: "Transmission" },
	{ id: 4, quote: "Part arrived fast and exactly as described. Will buy again for our shop.", author: "Luis R.", detail: "Mechanic Shop Owner" },
	{ id: 5, quote: "OEM alternator, tested and clean. Core policy was simple and fair.", author: "Sophie D.", detail: "Alternator" },
];
const benefits = [
	{ icon: FaTruck, title: "Fast Shipping", sub: "Nationwide delivery" },
	{ icon: IoShieldCheckmark, title: "90-Day Warranty", sub: "On eligible parts" },
	{ icon: FaClipboardCheck, title: "Quality Tested", sub: "OEM used parts" },
	{ icon: BiCreditCard, title: "WhatsApp Ordering", sub: "Fast confirmation" },
];

/* ════════════════════════════════
	HERO COMPONENT
════════════════════════════════ */
function Hero() {
	const [activeChip, setActiveChip] = useState(0);
	useEffect(() => {
		const id = setInterval(() => setActiveChip(p => (p + 1) % CATEGORIES.length), 2000);
		return () => clearInterval(id);
	}, []);

	return (
		<>
			{/* Ticker */}
			<div className="bg-amber-400 overflow-hidden py-2.5">
				<motion.div className="inline-flex whitespace-nowrap"
					animate={{ x: ['0%', '-50%'] }}
					transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}>
					{[...Array(2)].map((_, gi) =>
						TICKER_ITEMS.map(item => (
							<span key={`${gi}-${item}`} className="inline-flex items-center gap-5 px-8 font-['Barlow_Condensed',sans-serif] font-bold text-[13px] tracking-[0.14em] uppercase text-neutral-900">
								{item} <span className="w-1 h-1 rounded-full bg-neutral-900/30 shrink-0" />
							</span>
						))
					)}
				</motion.div>
			</div>

			{/* Hero */}
			<section className="relative bg-neutral-950 min-h-[calc(100vh-48px)] flex items-center overflow-hidden">
				{/* Grid texture */}
				<div className="absolute inset-0 pointer-events-none opacity-100"
					style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(245,158,11,0.04) 1px,transparent 1px)', backgroundSize: '52px 52px' }} />
				{/* Glows */}
				<div className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full pointer-events-none"
					style={{ background: 'radial-gradient(circle,rgba(245,158,11,0.13) 0%,transparent 65%)' }} />
				<div className="absolute -bottom-1/4 -left-1/4 w-[480px] h-[480px] rounded-full pointer-events-none"
					style={{ background: 'radial-gradient(circle,rgba(220,38,38,0.07) 0%,transparent 65%)' }} />

				<div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

					{/* Left content */}
					<motion.div initial="hidden" animate="visible" variants={stagger}>
						<motion.div variants={staggerItem} className="flex items-center gap-3 mb-6">
							<span className="w-8 h-0.5 bg-amber-400 rounded-full" />
							<span className="text-amber-400 text-[11px] font-bold tracking-[0.18em] uppercase">OEM Quality · Real Inventory · Nationwide Shipping</span>
						</motion.div>

						<motion.h1 variants={staggerItem}
							className="font-['Barlow_Condensed',sans-serif] font-black uppercase leading-[0.92] tracking-tight mb-6 text-7xl">
							<span className="text-white block">The Right Part</span>
							<em className="text-amber-400 block not-italic">Right Now.</em>
						</motion.h1>

						<motion.p variants={staggerItem} className="text-neutral-400 text-base lg:text-[17px] leading-relaxed max-w-md mb-8">
							Search by Year → Make → Model → Part → Trim. Mileage-based pricing, verified inventory, and 90-day warranties on every order.
						</motion.p>

						<motion.div variants={staggerItem} className="flex flex-wrap gap-2 mb-10">
							{CATEGORIES.map((cat, i) => (
								<motion.button key={cat} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
									onMouseEnter={() => setActiveChip(i)}
									className={`px-4 py-1.5 rounded-full border text-[12px] font-bold tracking-widest uppercase transition-all duration-200 cursor-pointer ${i === activeChip ? 'bg-amber-400 border-amber-400 text-neutral-900' : 'border-neutral-700 bg-neutral-800/60 text-neutral-300 hover:border-amber-400/50 hover:text-amber-400'}`}>
									{cat}
								</motion.button>
							))}
						</motion.div>

						<motion.div variants={staggerItem} className="flex flex-wrap gap-4 mb-12">
							<motion.a href="/shop" whileHover={{ y: -2, boxShadow: '0 10px 30px rgba(245,158,11,0.3)' }} whileTap={{ scale: 0.97 }}
								className="inline-flex items-center gap-2.5 bg-amber-400 hover:bg-amber-500 text-neutral-900 font-black text-[13px] tracking-widest uppercase px-7 py-3.5 rounded transition-colors">
								Browse Parts <BiRightArrowAlt size={20} />
							</motion.a>
							<motion.a href="/contact" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
								className="inline-flex items-center gap-2.5 border border-neutral-600 hover:border-amber-400/60 text-neutral-300 hover:text-amber-400 font-bold text-[13px] tracking-widest uppercase px-7 py-3.5 rounded transition-all">
								Talk to an Expert
							</motion.a>
						</motion.div>

						<motion.div variants={staggerItem} className="flex divide-x divide-neutral-800 border border-neutral-800 rounded-lg overflow-hidden">
							{[{ val: '20M+', lbl: 'Parts in Stock' }, { val: '90-Day', lbl: 'Avg. Warranty' }, { val: '48hr', lbl: 'Fast Shipping' }].map(({ val, lbl }) => (
								<div key={lbl} className="flex-1 px-5 py-4 bg-neutral-900/50">
									<div className="font-['Barlow_Condensed',sans-serif] font-black text-2xl text-amber-400 leading-none">{val}</div>
									<div className="text-[11px] font-semibold text-neutral-500 tracking-widest uppercase mt-0.5">{lbl}</div>
								</div>
							))}
						</motion.div>
					</motion.div>

					{/* Right image */}
					<motion.div initial="hidden" animate="visible" variants={scaleIn} className="hidden lg:block relative">
						<div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-3/5 rounded-full"
							style={{ background: 'linear-gradient(to bottom,#F59E0B,transparent)' }} />
						<div className="relative rounded-xl overflow-hidden border border-amber-500/15" style={{ aspectRatio: '4/3' }}>
							<img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=900&q=85&auto=format"
								alt="Engine" className="w-full h-full object-cover brightness-90 contrast-110" />
							<div className="absolute inset-0" style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.12) 0%,transparent 50%,rgba(0,0,0,0.4) 100%)' }} />
							<div className="absolute bottom-5 left-5 z-10 bg-neutral-950/85 backdrop-blur-md border border-amber-400/25 rounded-lg px-4 py-3">
								<div className="text-amber-400 text-[10px] font-bold tracking-widest uppercase mb-0.5">✓ Verified Stock</div>
								<div className="text-neutral-200 text-[13px] font-semibold">Ships within 48 hours</div>
							</div>
						</div>
						<div className="absolute -top-4 -right-4 bg-amber-400 text-neutral-900 font-['Barlow_Condensed',sans-serif] font-black text-[13px] tracking-wide uppercase px-4 py-2.5 rounded-lg shadow-[0_8px_24px_rgba(245,158,11,0.4)] leading-tight text-center">
							20M+ Parts<br />in Stock
						</div>
					</motion.div>
				</div>
			</section>
		</>
	);
}

/* ════════════════════════════════
	HOME PAGE
════════════════════════════════ */
export default function Home() {
	const navigate = useNavigate();
	const [featuredCategories, setFeaturedCategories] = useState([]);
	const [filterOptions, setFilterOptions] = useState({ parts: [], makes: [], models: [], years: [], trims: [] });
	const [filters, setFilters] = useState({ part: '', make: '', model: '', year: '', trim: '' });

	useEffect(() => {
		let cancelled = false;

		async function loadFeatured() {
			try {
				const { data } = await api.get('/parts?featured=true');
				if (cancelled) return;
				setFeaturedCategories(Array.isArray(data?.data) ? data.data : []);
			} catch {
				if (!cancelled) setFeaturedCategories([]);
			}
		}

		loadFeatured();
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		let cancelled = false;

		async function loadFilterOptions() {
			try {
				const [partsRes, makesRes] = await Promise.all([api.get('/parts'), api.get('/parts/makes')]);

				if (cancelled) return;
				const parts = partsRes?.data?.data || [];
				const makes = (makesRes?.data?.data || []).slice().sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || '')));
				setFilterOptions({
					parts,
					makes,
					models: [],
					years: [],
					trims: [],
				});
			} catch {
				if (!cancelled) {
					setFilterOptions({ parts: [], makes: [], models: [], years: [], trims: [] });
				}
			}
		}

		loadFilterOptions();
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		let cancelled = false;

		async function loadHierarchyOptions() {
			if (!filters.part) {
				setFilterOptions((prev) => ({ ...prev, models: [], years: [], trims: [] }));
				return;
			}

			try {
				const params = new URLSearchParams();
				if (filters.make) params.set('make', filters.make);
				if (filters.model) params.set('model', filters.model);
				if (filters.year) params.set('year', filters.year);
				const url = params.toString() ? `/parts/${filters.part}?${params.toString()}` : `/parts/${filters.part}`;
				const { data } = await api.get(url);
				const payload = data?.data || {};
				const makes = (payload.makes || []).slice().sort((a, b) => String(a?.name || '').localeCompare(String(b?.name || '')));
				const models = (payload.models || []).slice().sort((a, b) => String(a?.title || '').localeCompare(String(b?.title || '')));
				const years = (payload.years || []).slice().sort((a, b) => String(a?.title || '').localeCompare(String(b?.title || '')));
				const trims = (payload.trims || []).slice().sort((a, b) => String(a?.title || '').localeCompare(String(b?.title || '')));

				if (cancelled) return;
				setFilterOptions((prev) => ({ ...prev, makes, models, years, trims }));
			} catch {
				if (!cancelled) {
					setFilterOptions((prev) => ({ ...prev, models: [], years: [], trims: [] }));
				}
			}
		}

		loadHierarchyOptions();
		return () => {
			cancelled = true;
		};
	}, [filters.part, filters.make, filters.model, filters.year]);

	const onFilterChange = (name, value) => {
		setFilters((prev) => {
			const next = { ...prev, [name]: value };
			if (name === 'part') {
				next.make = '';
				next.model = '';
				next.year = '';
				next.trim = '';
			}
			if (name === 'make') {
				next.model = '';
				next.year = '';
				next.trim = '';
			}
			if (name === 'model') {
				next.year = '';
				next.trim = '';
			}
			if (name === 'year') {
				next.trim = '';
			}
			return next;
		});
	};

	const handleFilterSearch = () => {
		const params = new URLSearchParams();
		if (filters.part) params.set('part', filters.part);
		if (filters.make) params.set('make', filters.make);
		if (filters.model) params.set('model', filters.model);
		if (filters.year) params.set('year', filters.year);
		if (filters.trim) params.set('trim', filters.trim);

		const query = params.toString();
		navigate(query ? `/shop?${query}` : '/shop');
	};

	const makeOptions = filterOptions.makes;
	const orderedPartOptions = useMemo(() => {
		const parts = Array.isArray(filterOptions.parts) ? filterOptions.parts : [];
		const prioritized = [];
		const regular = [];

		for (const item of parts) {
			const title = String(item?.title || '').trim();
			const normalized = title.toLowerCase();
			if (PRIORITY_PART_TITLES.includes(normalized)) {
				prioritized.push(item);
			} else {
				regular.push(item);
			}
		}

		prioritized.sort((a, b) => String(a?.title || '').localeCompare(String(b?.title || '')));
		regular.sort((a, b) => String(a?.title || '').localeCompare(String(b?.title || '')));

		return [...prioritized, ...regular];
	}, [filterOptions.parts]);

	const displayedPopularParts = FEATURED_STATIC_PRODUCTS;

	const onViewDetails = (part) => {
		if (!part?.id) {
			navigate('/shop');
			return;
		}
		navigate(`/product/${part.id}`, {
			state: {
				product: {
					_id: part.id,
					name: part.title,
					price: part.price,
					image: part.img,
					synthetic: true,
				},
			},
		});
	};

	const displayedPartsGrid = featuredCategories.length
		? featuredCategories.map((category) => ({
			title: category.title,
			img: category.image ? resolveImageUrl(category.image) : 'https://allusedautoparts.world/aaps-img/alternator.jpg',
			href: `/shop/part/${category._id}`,
		}))
		: partsGrid;

	const isPriorityPart = (title) => PRIORITY_PART_TITLES.includes(String(title || '').trim().toLowerCase());

	return (
		<div className="font-['Barlow',sans-serif]">
			<Hero />
			<main className="bg-neutral-50">

				{/* ══ 1. YMM SEARCH ══ */}
				<section className="bg-neutral-950 pb-10 pt-4">
					<div className="max-w-6xl mx-auto px-4 sm:px-6">
						<Reveal>
							<div className="bg-white rounded-2xl shadow-2xl p-5 md:p-7 border border-neutral-100">
								<p className="font-['Barlow_Condensed',sans-serif] font-bold text-xs tracking-[0.18em] uppercase text-neutral-400 mb-4">
									Search by Part → Make → Model → Year → Trim
								</p>
								<div className="grid grid-cols-2 lg:grid-cols-6 gap-3 items-end">
									<div className="flex flex-col gap-1">
										<label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400">{SEARCH_FIELDS[0]}</label>
										<select value={filters.part} onChange={(event) => onFilterChange('part', event.target.value)} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-700 focus:ring-2 focus:ring-amber-400 focus:outline-none appearance-none cursor-pointer">
											<option value="">Select...</option>
											{orderedPartOptions.map((item) => (
												<option
													key={item._id}
													value={item._id}
													style={isPriorityPart(item?.title) ? { fontWeight: 700 } : undefined}
												>
													{item.title}
												</option>
											))}
										</select>
									</div>
									<div className="flex flex-col gap-1">
										<label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400">{SEARCH_FIELDS[1]}</label>
										<select value={filters.make} onChange={(event) => onFilterChange('make', event.target.value)} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-700 focus:ring-2 focus:ring-amber-400 focus:outline-none appearance-none cursor-pointer">
											<option value="">Select...</option>
											{makeOptions.map((item) => (
												<option key={item._id} value={item._id}>{item.name}</option>
											))}
										</select>
									</div>
									<div className="flex flex-col gap-1">
										<label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400">{SEARCH_FIELDS[2]}</label>
										<select value={filters.model} onChange={(event) => onFilterChange('model', event.target.value)} disabled={!filters.make} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-700 focus:ring-2 focus:ring-amber-400 focus:outline-none appearance-none cursor-pointer disabled:opacity-50">
											<option value="">Select...</option>
											{filterOptions.models.map((item) => (
												<option key={item._id} value={item._id}>{item.title}</option>
											))}
										</select>
									</div>
									<div className="flex flex-col gap-1">
										<label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400">{SEARCH_FIELDS[3]}</label>
										<select value={filters.year} onChange={(event) => onFilterChange('year', event.target.value)} disabled={!filters.model} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-700 focus:ring-2 focus:ring-amber-400 focus:outline-none appearance-none cursor-pointer disabled:opacity-50">
											<option value="">Select...</option>
											{filterOptions.years.map((item) => (
												<option key={item._id} value={item._id}>{item.title}</option>
											))}
										</select>
									</div>
									<div className="flex flex-col gap-1">
										<label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400">{SEARCH_FIELDS[4]}</label>
										<select value={filters.trim} onChange={(event) => onFilterChange('trim', event.target.value)} disabled={!filters.year} className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 text-sm text-neutral-700 focus:ring-2 focus:ring-amber-400 focus:outline-none appearance-none cursor-pointer disabled:opacity-50">
											<option value="">Select...</option>
											{filterOptions.trims.map((item) => (
												<option key={item._id} value={item._id}>{item.title}</option>
											))}
										</select>
									</div>
									<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }}
										onClick={handleFilterSearch}
										className="col-span-2 lg:col-span-1 bg-amber-400 hover:bg-amber-500 text-neutral-900 font-black text-[13px] tracking-widest uppercase py-2.5 px-4 rounded-lg flex justify-center items-center gap-2 transition-colors h-[42px]">
										<BiSearch size={18} /> Search
									</motion.button>
								</div>
								{/* <div className="mt-4 flex flex-wrap items-center gap-2">
									<span className="font-semibold text-xs tracking-widest uppercase text-neutral-400">Popular:</span>
									{['1997 Acura CL Engine', '2009 Dodge Durango Trans', '2005 Toyota Sienna V6'].map(q => (
										<motion.button key={q} whileHover={{ scale: 1.03 }}
											className="bg-neutral-100 hover:bg-amber-50 hover:text-amber-600 border border-neutral-200 hover:border-amber-300 px-3 py-1 rounded-full text-xs font-semibold transition-all">
											{q}
										</motion.button>
									))}
								</div> */}
							</div>
						</Reveal>
					</div>
				</section>

				{/* ══ 2. BENEFITS STRIP ══ */}
				<section className="bg-white border-b border-neutral-100">
					<div className="max-w-6xl mx-auto px-4 sm:px-6">
						<motion.div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-neutral-100"
							initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}>
							{benefits.map(({ icon: Icon, title, sub }) => {
								const BenefitIcon = Icon;
								return (
									<motion.div key={title} variants={staggerItem} className="flex items-center gap-4 px-6 py-5">
										<div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
											<BenefitIcon className="text-amber-500" size={20} />
										</div>
										<div>
											<div className="font-bold text-neutral-900 text-sm">{title}</div>
											<div className="text-xs text-neutral-400 font-medium">{sub}</div>
										</div>
									</motion.div>
								);
							})}
						</motion.div>
					</div>
				</section>

				{/* ══ 3. PROMO BANNERS ══ */}
				<section className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
					<div className="mb-8">
						<SectionLabel eyebrow="Deals & Categories" heading="Featured Offers" />
					</div>
					<motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-5"
						initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}>
						{promos.map(promo => (
							<motion.a key={promo.id} href="/shop" variants={staggerItem}
								className="relative block rounded-2xl overflow-hidden min-h-[220px] group cursor-pointer"
								whileHover={{ y: -5 }} transition={{ duration: 0.25 }}>
								<motion.img src={promo.img} alt={promo.title}
									className="absolute inset-0 w-full h-full object-cover"
									whileHover={{ scale: 1.06 }} transition={{ duration: 0.5 }} />
								<div className="absolute inset-0 bg-linear-to-r from-neutral-950/90 via-neutral-950/50 to-transparent" />
								<div className="relative z-10 p-7 h-full flex flex-col justify-end">
									<p className="text-amber-400 text-[10px] font-bold tracking-[0.18em] uppercase mb-1">{promo.eyebrow}</p>
									<h3 className="font-['Barlow_Condensed',sans-serif] font-black text-2xl uppercase text-white leading-tight mb-3">{promo.title}</h3>
									<span className="self-start bg-amber-400 text-neutral-900 font-black text-[11px] tracking-widest uppercase px-3 py-1.5 rounded-md">{promo.badge}</span>
								</div>
							</motion.a>
						))}
					</motion.div>
				</section>

				{/* ══ 4. POPULAR PARTS ══ */}
				<section className="bg-neutral-100 py-14">
					<div className="max-w-6xl mx-auto px-4 sm:px-6">
						<div className="flex items-end justify-between mb-8">
							<SectionLabel eyebrow="Mileage-Tier Pricing" heading="Popular Parts" />
							<Reveal>
								<a href="/shop" className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-neutral-500 hover:text-amber-500 border border-neutral-300 hover:border-amber-400 px-4 py-2 rounded-full transition-all">
									View All <BiRightArrowAlt size={16} />
								</a>
							</Reveal>
						</div>
						<motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
							initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}>
							{displayedPopularParts.map(part => (
								<motion.div key={part.id} variants={staggerItem}
									className="bg-white rounded-2xl overflow-hidden border border-neutral-200 flex flex-col group cursor-pointer"
									whileHover={{ y: -5, boxShadow: '0 20px 48px -8px rgba(0,0,0,0.15)' }} transition={{ duration: 0.22 }}>
									<div className="aspect-4/3 bg-neutral-50 flex items-center justify-center p-5 border-b border-neutral-100 overflow-hidden">
										<motion.img src={part.img} alt={part.title} className="max-h-full object-contain"
											whileHover={{ scale: 1.08 }} transition={{ duration: 0.3 }} />
									</div>
									<div className="p-5 flex flex-col grow">
										<span className="inline-block mb-2 text-[10px] font-bold tracking-widest uppercase text-amber-500 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded self-start">
											{part.tag} · Mileage Tiers
										</span>
										<h3 className="text-sm font-semibold text-neutral-800 leading-snug mb-4 grow">{part.title}</h3>
										<div className="mb-4 text-sm font-black text-neutral-900">{formatMoney(part.price)}</div>
										<div className="flex items-center justify-end mt-auto">
											<motion.button
												onClick={() => onViewDetails(part)}
												whileHover={{ backgroundColor: '#F59E0B', color: '#171717' }}
												whileTap={{ scale: 0.95 }}
												className="flex items-center gap-2 bg-neutral-900 text-white text-[11px] font-black tracking-widest uppercase px-4 py-2 rounded-lg transition-colors duration-200">
												View Details
											</motion.button>
										</div>
									</div>
								</motion.div>
							))}
						</motion.div>
					</div>
				</section>

				{/* ══ 5. WHY CHOOSE US ══ */}
				<section className="relative py-20 bg-neutral-950 overflow-hidden">
					<div className="absolute inset-0 opacity-10"
						style={{ backgroundImage: "url('https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=2000&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
					<div className="absolute inset-0 bg-linear-to-br from-neutral-950/95 via-neutral-950/80 to-neutral-950/95" />
					<div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
						style={{ background: 'radial-gradient(circle,rgba(245,158,11,0.12) 0%,transparent 70%)' }} />

					<div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
							<Reveal>
								<p className="font-['Barlow_Condensed',sans-serif] font-bold text-xs tracking-[0.18em] uppercase text-amber-400 mb-3">Why Choose Us</p>
								<h2 className="font-['Barlow_Condensed',sans-serif] font-black text-5xl uppercase text-white leading-none mb-5">
									Quality OEM Parts,<br /><span className="text-amber-400">No Guesswork.</span>
								</h2>
								<p className="text-neutral-400 text-base leading-relaxed mb-8 max-w-md">
									Fitment verified, mileage-tier pricing, and fast nationwide shipping — backed by real mechanics who know your car.
								</p>
								<motion.ul className="space-y-4 mb-10"
									initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
									{[[IoShieldCheckmark, '90-day warranty on eligible parts'], [IoShieldCheckmark, 'VIN-match fitment checks before ship'], [FaClipboardCheck, 'Mileage tiers for clear, honest pricing']].map(([Icon, text], i) => {
										const FeatureIcon = Icon;
										return (
											<motion.li key={i} variants={staggerItem} className="flex items-center gap-3 text-neutral-300 text-sm font-medium">
												<div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
													<FeatureIcon className="text-amber-400" size={16} />
												</div>
												{text}
											</motion.li>
										);
									})}
								</motion.ul>
								<motion.div className="grid grid-cols-4 gap-3"
									initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
									{[['20M+', 'Parts'], ['4.9/5', 'Rating'], ['48h', 'Dispatch'], ['100%', 'Verified']].map(([val, lbl]) => (
										<motion.div key={lbl} variants={staggerItem}
											className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
											<div className="font-['Barlow_Condensed',sans-serif] font-black text-xl text-amber-400">{val}</div>
											<div className="text-[10px] font-semibold text-neutral-500 tracking-widest uppercase mt-0.5">{lbl}</div>
										</motion.div>
									))}
								</motion.div>
							</Reveal>

							<Reveal delay={0.15} className="relative h-96 hidden lg:block">
								<img src="https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=600&auto=format&fit=crop"
									className="absolute w-2/3 right-0 top-0 rounded-2xl shadow-2xl rotate-2 border border-white/10" alt="Engine" />
								<img src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=600&auto=format&fit=crop"
									className="absolute w-1/2 left-0 bottom-10 rounded-2xl shadow-2xl -rotate-3 border border-white/10" alt="Transmission" />
								<div className="absolute top-8 left-8 bg-white text-neutral-900 font-black text-xs tracking-widest uppercase px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2">
									<BiAward className="text-amber-500" size={18} /> OEM Tested
								</div>
								<div className="absolute bottom-24 right-6 bg-amber-400 text-neutral-900 font-black text-xs tracking-widest uppercase px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2">
									<BsFillLightningChargeFill size={16} /> Fast Ship
								</div>
							</Reveal>
						</div>
					</div>
				</section>

				{/* ══ 6. BRANDS TICKER ══ */}
				<section className="bg-white py-14 border-b border-neutral-100">
					<div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
						<SectionLabel eyebrow="Nationwide Network" heading="Brands We Carry" />
					</div>
					<div className="overflow-hidden">
						<motion.div className="inline-flex"
							animate={{ x: ['0%', '-50%'] }}
							transition={{ repeat: Infinity, duration: 34, ease: 'linear' }}>
							{[...Array(2)].map((_, gi) =>
								brands.map(brand => (
									<motion.div key={`${gi}-${brand.name}`}
										className="inline-flex items-center gap-3 bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 mx-2 cursor-pointer shrink-0"
										whileHover={{ scale: 1.05, borderColor: '#FCD34D', backgroundColor: '#FFFBEB' }}>
										<div className="w-14 h-8 flex items-center justify-center">
											<img src={brand.img} alt={brand.name} className="max-w-full max-h-full object-contain mix-blend-multiply" />
										</div>
										<span className="font-bold text-sm text-neutral-700 whitespace-nowrap">{brand.name}</span>
									</motion.div>
								))
							)}
						</motion.div>
					</div>
				</section>

				{/* ══ 7. GUIDES & ARTICLES ══ */}
				<section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
						<Reveal className="relative order-2 lg:order-1">
							<img src="https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1600&auto=format&fit=crop"
								alt="Guides" className="rounded-2xl shadow-xl w-full object-cover aspect-4/3" />
							<div className="absolute -bottom-4 -right-4 bg-amber-400 text-neutral-900 font-['Barlow_Condensed',sans-serif] font-black text-sm tracking-widest uppercase px-5 py-3 rounded-xl shadow-lg">
								Mechanic-Approved
							</div>
						</Reveal>
						<Reveal delay={0.1} className="order-1 lg:order-2">
							<p className="font-['Barlow_Condensed',sans-serif] font-bold text-xs tracking-[0.18em] uppercase text-amber-500 mb-3">Knowledge Base</p>
							<h2 className="font-['Barlow_Condensed',sans-serif] font-black text-5xl uppercase text-neutral-900 leading-none mb-4">Guides &<br />Articles</h2>
							<p className="text-neutral-500 text-base leading-relaxed mb-8">Make confident purchases with help from our mechanics. Real advice, clear explanations.</p>
							<motion.ul className="space-y-4 mb-10"
								initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
								{['How to decode your VIN to match the right engine', 'Transmission compatibility: swap tips by generation', 'Shipping and core return policy explained'].map(item => (
									<motion.li key={item} variants={staggerItem} className="flex items-start gap-3 text-neutral-700 text-sm font-medium">
										<BiCheckCircle className="text-amber-400 shrink-0 mt-0.5" size={20} /> {item}
									</motion.li>
								))}
							</motion.ul>
							<motion.a href="/shop"
								whileHover={{ y: -2, backgroundColor: '#F59E0B', color: '#171717' }} whileTap={{ scale: 0.97 }}
								className="inline-flex items-center gap-2 bg-neutral-900 text-white font-black text-[12px] tracking-widest uppercase px-6 py-3.5 rounded-xl transition-colors duration-200">
								Read the Guides <BiRightArrowAlt size={18} />
							</motion.a>
						</Reveal>
					</div>
				</section>

				{/* ══ 8. PARTS GRID ══ */}
				<section className="bg-neutral-100 py-14">
					<div className="max-w-6xl mx-auto px-4 sm:px-6">
						<div className="flex items-end justify-between mb-8">
							<SectionLabel eyebrow="Full Catalog" heading="Parts We Carry" />
							<Reveal>
								<a href="/shop" className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-neutral-500 hover:text-amber-500 border border-neutral-300 hover:border-amber-400 px-4 py-2 rounded-full transition-all">
									Browse All <BiRightArrowAlt size={16} />
								</a>
							</Reveal>
						</div>
						<motion.div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
							initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={stagger}>
							{displayedPartsGrid.map((cat, idx) => (
								<motion.div key={idx} variants={staggerItem}
									className="bg-white border border-neutral-200 rounded-xl overflow-hidden text-center group cursor-pointer"
									whileHover={{ y: -4, boxShadow: '0 12px 32px -6px rgba(0,0,0,0.12)' }}>
									<div className="aspect-square bg-neutral-50 flex items-center justify-center p-4 border-b border-neutral-100">
										<motion.img src={cat.img} alt={cat.title} className="max-h-full object-contain"
											whileHover={{ scale: 1.12 }} transition={{ duration: 0.3 }} />
									</div>
									<a href={cat.href || '/shop'} className="block py-3 px-2 font-bold text-neutral-700 text-xs tracking-wide truncate group-hover:text-amber-500 transition-colors">
										{cat.title}
									</a>
								</motion.div>
							))}
						</motion.div>
					</div>
				</section>

				{/* ══ 9. TESTIMONIALS ══ */}
				<section className="bg-white py-16">
					<div className="max-w-6xl mx-auto px-4 sm:px-6">
						<div className="flex items-end justify-between mb-8">
							<SectionLabel eyebrow="Customer Reviews" heading="What They Say" />
							<Reveal>
								<div className="hidden md:flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase text-neutral-400">
									<span className="w-6 h-0.5 bg-neutral-200 rounded" /> Swipe to see more
								</div>
							</Reveal>
						</div>
						<Reveal>
							<Swiper modules={[Autoplay]} loop
								autoplay={{ delay: 3800, disableOnInteraction: false }}
								spaceBetween={16} slidesPerView={1.05}
								breakpoints={{ 576: { slidesPerView: 1.2 }, 768: { slidesPerView: 2 }, 992: { slidesPerView: 3, spaceBetween: 20 } }}>
								{testimonials.map(t => (
									<SwiperSlide key={t.id} className="h-auto">
										<motion.div className="h-full bg-neutral-50 border border-neutral-200 rounded-2xl p-6 flex flex-col justify-between"
											whileHover={{ borderColor: '#FCD34D', y: -3 }} transition={{ duration: 0.2 }}>
											<div className="flex gap-0.5 mb-4">
												{[...Array(5)].map((_, i) => (
													<svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
														<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
													</svg>
												))}
											</div>
											<p className="text-neutral-700 text-sm leading-relaxed grow mb-5">"{t.quote}"</p>
											<div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
												<div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-['Barlow_Condensed',sans-serif] font-black text-amber-600 text-sm shrink-0">{t.author[0]}</div>
												<div>
													<div className="font-bold text-xs text-neutral-900">{t.author}</div>
													<div className="text-[11px] text-neutral-400">{t.detail}</div>
												</div>
											</div>
										</motion.div>
									</SwiperSlide>
								))}
							</Swiper>
							{/* <div className="testi-pagination mt-7 flex justify-center gap-1.5" /> */}
						</Reveal>
					</div>
				</section>

				{/* ══ 10. BOTTOM CTA ══ */}
				<Reveal>
					<section className="bg-amber-400 py-14">
						<div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
							<div>
								<h2 className="font-['Barlow_Condensed',sans-serif] font-black text-4xl md:text-5xl uppercase text-neutral-900 leading-none">
									Can't Find Your Part?
								</h2>
								<p className="text-neutral-700 font-medium mt-2">Talk to a parts specialist — we'll source it for you.</p>
							</div>
							<div className="flex gap-4 flex-wrap">
								<motion.a href="/contact" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
									className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-black text-[12px] tracking-widest uppercase px-7 py-4 rounded-xl transition-colors">
									Contact Us <BiRightArrowAlt size={18} />
								</motion.a>
								<motion.a href="tel:+1-866-206-9163" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
									className="inline-flex items-center gap-2 bg-white/50 hover:bg-white text-neutral-900 font-black text-[12px] tracking-widest uppercase px-7 py-4 rounded-xl transition-all border border-neutral-900/10">
									Call Now
								</motion.a>
							</div>
						</div>
					</section>
				</Reveal>

			</main>
		</div>
	);
}