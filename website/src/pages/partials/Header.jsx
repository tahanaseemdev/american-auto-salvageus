import { useState, useEffect } from 'react';
import { BiPhone, BiEnvelope, BiSearch, BiMenu, BiX, BiUser, BiLogOut } from 'react-icons/bi';
import { motion } from 'framer-motion';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import logoImg from '../../assets/american autos.png';
import { useAuth } from '../../context/AuthContext';


const NAV_LINKS = [
	{ label: 'Home', href: '/' },
	{ label: 'About', href: '/about' },
	{ label: 'Shop', href: '/shop' },
	// { label: 'Tracking', href: '/tracking' },
	{ label: 'Contact', href: '/contact' },
];

export default function Header() {
	const [menuOpen, setMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [query, setQuery] = useState('');
	const navigate = useNavigate();
	const { user, isLoggedIn, logout } = useAuth();

	useEffect(() => {
		const fn = () => setScrolled(window.scrollY > 20);
		window.addEventListener('scroll', fn);
		return () => window.removeEventListener('scroll', fn);
	}, []);

	const handleSearch = (e) => {
		e.preventDefault();
		if (query.trim()) {
			navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
			setQuery('');
		}
	};

	const handleLogout = async () => {
		await logout();
		navigate('/');
	};

	return (
		<header className="fixed top-0 left-0 right-0 z-50">
			{/* Topbar */}
			<div className="hidden md:flex bg-neutral-950 border-b border-white/5 py-2 px-8 justify-end items-center gap-8">
				<a href="tel:+1-866-206-9163" className="flex items-center gap-2 text-neutral-500 hover:text-amber-400 transition-colors text-xs tracking-widest uppercase font-semibold">
					<BiPhone size={13} /> +1-866-206-9163
				</a>
				<a href="mailto:info@americanautosalvageus.com" className="flex items-center gap-2 text-neutral-500 hover:text-amber-400 transition-colors text-xs tracking-widest uppercase font-semibold">
					<BiEnvelope size={13} /> info@americanautosalvageus.com
				</a>
			</div>

			{/* Main Nav */}
			<nav className={`flex items-center justify-between px-6 lg:px-8 h-[68px] transition-all duration-300 ${scrolled ? 'bg-neutral-950/95 backdrop-blur-xl border-b border-amber-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.6)]' : 'bg-neutral-950/85 backdrop-blur-md border-b border-white/5'}`}>
				{/* Logo */}
				<Link to="/" className="flex items-center shrink-0 h-9 sm:h-10 focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-2 focus:ring-offset-neutral-950 rounded">
					<img
						src={logoImg}
						alt="American Auto Salvageus"
						className="h-full w-auto max-w-[140px] sm:max-w-40 lg:max-w-[200px] object-contain object-left"
					/>
				</Link>

				{/* Desktop links */}
				<ul className="hidden lg:flex items-center gap-1 list-none">
					{NAV_LINKS.map(l => (
						<li key={l.label}>
							<NavLink
								to={l.href}
								end={l.href === '/'}
								className={({ isActive }) =>
									`px-3 py-1.5 rounded text-xs font-bold tracking-widest uppercase transition-all duration-200 hover:text-amber-400 ${isActive ? 'text-amber-400' : 'text-neutral-300'}`
								}
							>
								{l.label}
							</NavLink>
						</li>
					))}
				</ul>

				{/* Search */}
				<form onSubmit={handleSearch} className="hidden lg:flex items-center bg-neutral-800 border border-neutral-700 focus-within:border-amber-400 rounded overflow-hidden flex-1 max-w-sm mx-5 transition-colors duration-200">
					<input type="text" value={query} onChange={e => setQuery(e.target.value)}
						placeholder="e.g. 2017 Honda Civic engine..."
						className="bg-transparent border-none outline-none text-white text-sm placeholder-neutral-500 px-4 py-2.5 w-full" />
					<button type="submit" className="bg-amber-400 hover:bg-amber-500 text-neutral-900 px-4 py-2.5 transition-colors shrink-0">
						<BiSearch size={18} />
					</button>
				</form>

				{/* Actions */}
				<div className="hidden lg:flex items-center gap-3">
					{isLoggedIn ? (
						<>
							<Link to="/dashboard" className="flex items-center gap-2 text-neutral-300 hover:text-amber-400 border border-neutral-700 hover:border-amber-400/50 px-4 py-2 rounded text-xs font-bold tracking-widest uppercase transition-all">
								<BiUser size={14} /> {'My Account'}
							</Link>
							<button onClick={handleLogout}
								className="flex items-center gap-2 text-neutral-400 hover:text-red-400 border border-neutral-700 hover:border-red-500/40 px-3 py-2 rounded text-xs font-bold tracking-widest uppercase transition-all">
								Log out<BiLogOut size={14} />
							</button>
						</>
					) : (
						<Link to="/login" className="flex items-center gap-2 text-neutral-300 hover:text-amber-400 border border-neutral-700 hover:border-amber-400/50 px-4 py-2 rounded text-xs font-bold tracking-widest uppercase transition-all">
							<BiUser size={14} /> Login
						</Link>
					)}
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
					{NAV_LINKS.map(l => (
						<NavLink
							key={l.label}
							to={l.href}
							end={l.href === '/'}
							onClick={() => setMenuOpen(false)}
							className={({ isActive }) =>
								`py-3 border-b border-neutral-800 last:border-0 text-xs font-bold tracking-widest uppercase transition-colors ${isActive ? 'text-amber-400' : 'text-neutral-300 hover:text-amber-400'}`
							}
						>
							{l.label}
						</NavLink>
					))}
					{isLoggedIn ? (
						<>
							<Link to="/dashboard" onClick={() => setMenuOpen(false)}
								className="py-3 border-b border-neutral-800 text-xs font-bold tracking-widest uppercase text-neutral-300 hover:text-amber-400 transition-colors">
								Dashboard
							</Link>
							<button onClick={() => { handleLogout(); setMenuOpen(false); }}
								className="py-3 border-b border-neutral-800 text-xs font-bold tracking-widest uppercase text-neutral-300 hover:text-red-400 transition-colors text-left">
								Logout
							</button>
						</>
					) : (
						<Link to="/login" onClick={() => setMenuOpen(false)}
							className="py-3 border-b border-neutral-800 text-xs font-bold tracking-widest uppercase text-neutral-300 hover:text-amber-400 transition-colors">
							Login
						</Link>
					)}
					<form onSubmit={handleSearch} className="flex mt-3 bg-neutral-800 border border-neutral-700 rounded overflow-hidden">
						<input type="text" value={query} onChange={e => setQuery(e.target.value)}
							placeholder="Search parts..." className="bg-transparent outline-none text-white text-sm placeholder-neutral-500 px-4 py-3 w-full" />
						<button type="submit" className="bg-amber-400 text-neutral-900 px-4"><BiSearch size={18} /></button>
					</form>
				</div>
			</motion.div>
		</header>
	);
}
