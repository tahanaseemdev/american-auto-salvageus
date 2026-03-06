import { useState, useEffect } from 'react';
import { BiPhone, BiEnvelope, BiSearch, BiCart, BiMenu, BiX, BiUser } from 'react-icons/bi';
import { motion } from 'framer-motion';


const NAV_LINKS = [
	{ label: 'Home', href: '/' },
	{ label: 'About', href: '/' },
	{ label: 'Shop', href: '/' },
	{ label: 'Tracking', href: '/' },
	{ label: 'Find Mechanic', href: '/' },
	{ label: 'Contact', href: '/' },
];

export default function Header() {
	const [menuOpen, setMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [query, setQuery] = useState('');

	useEffect(() => {
		const fn = () => setScrolled(window.scrollY > 20);
		window.addEventListener('scroll', fn);
		return () => window.removeEventListener('scroll', fn);
	}, []);

	return (
		<header className="fixed top-0 left-0 right-0 z-50">
			{/* Topbar */}
			<div className="hidden md:flex bg-neutral-950 border-b border-white/5 py-2 px-8 justify-end items-center gap-8">
				<a href="tel:+1-888-818-5001" className="flex items-center gap-2 text-neutral-500 hover:text-amber-400 transition-colors text-xs tracking-widest uppercase font-semibold">
					<BiPhone size={13} /> +1-888-818-5001
				</a>
				<a href="mailto:support@allusedautoparts.world" className="flex items-center gap-2 text-neutral-500 hover:text-amber-400 transition-colors text-xs tracking-widest uppercase font-semibold">
					<BiEnvelope size={13} /> support@allusedautoparts.world
				</a>
			</div>

			{/* Main Nav */}
			<nav className={`flex items-center justify-between px-6 lg:px-8 h-[68px] transition-all duration-300 ${scrolled ? 'bg-neutral-950/95 backdrop-blur-xl border-b border-amber-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.6)]' : 'bg-neutral-950/85 backdrop-blur-md border-b border-white/5'}`}>
				{/* Logo */}
				<a href="/" className="font-['Barlow_Condensed',sans-serif] font-black text-xl tracking-tight text-white flex items-center flex-shrink-0">
					ALL USED<span className="text-amber-400">&nbsp;PARTS</span>
					<span className="w-1.5 h-1.5 rounded-full bg-amber-400 mb-0.5 ml-1 flex-shrink-0" />
				</a>

				{/* Desktop links */}
				<ul className="hidden lg:flex items-center gap-1 list-none">
					{NAV_LINKS.map(l => (
						<li key={l.label}>
							<a href={l.href} className={`px-3 py-1.5 rounded text-xs font-bold tracking-widest uppercase transition-all duration-200 hover:text-amber-400 ${l.label === 'Home' ? 'text-amber-400' : 'text-neutral-300'}`}>
								{l.label}
							</a>
						</li>
					))}
				</ul>

				{/* Search */}
				<div className="hidden lg:flex items-center bg-neutral-800 border border-neutral-700 focus-within:border-amber-400 rounded overflow-hidden flex-1 max-w-sm mx-5 transition-colors duration-200">
					<input type="text" value={query} onChange={e => setQuery(e.target.value)}
						placeholder="e.g. 2017 Honda Civic engine..."
						className="bg-transparent border-none outline-none text-white text-sm placeholder-neutral-500 px-4 py-2.5 w-full" />
					<button className="bg-amber-400 hover:bg-amber-500 text-neutral-900 px-4 py-2.5 transition-colors flex-shrink-0">
						<BiSearch size={18} />
					</button>
				</div>

				{/* Actions */}
				<div className="hidden lg:flex items-center gap-3">
					<a href="/login.php" className="flex items-center gap-2 text-neutral-300 hover:text-amber-400 border border-neutral-700 hover:border-amber-400/50 px-4 py-2 rounded text-xs font-bold tracking-widest uppercase transition-all">
						<BiUser size={14} /> Login
					</a>
					<a href="/cart.php" className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-900 px-4 py-2 rounded text-xs font-black tracking-widest uppercase transition-colors">
						<BiCart size={15} /> Cart
						<span className="bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">3</span>
					</a>
				</div>

				{/* Hamburger */}
				<button className="lg:hidden border border-neutral-700 text-white rounded p-2 hover:border-amber-400/50 transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
					{menuOpen ? <BiX size={22} /> : <BiMenu size={22} />}
				</button>
			</nav>

			{/* Mobile drawer */}
			<motion.div initial={false}
				animate={{ height: menuOpen ? 'auto' : 0, opacity: menuOpen ? 1 : 0 }}
				transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
				className="lg:hidden bg-neutral-950 border-t border-white/5 overflow-hidden">
				<div className="px-6 py-4 flex flex-col gap-1">
					{[...NAV_LINKS, { label: 'Login', href: '/' }, { label: 'Cart (3)', href: '/' }].map(l => (
						<a key={l.label} href={l.href} className="py-3 border-b border-neutral-800 last:border-0 text-xs font-bold tracking-widest uppercase text-neutral-300 hover:text-amber-400 transition-colors">{l.label}</a>
					))}
					<div className="flex mt-3 bg-neutral-800 border border-neutral-700 rounded overflow-hidden">
						<input type="text" placeholder="Search parts..." className="bg-transparent outline-none text-white text-sm placeholder-neutral-500 px-4 py-3 w-full" />
						<button className="bg-amber-400 text-neutral-900 px-4"><BiSearch size={18} /></button>
					</div>
				</div>
			</motion.div>
		</header>
	);
}