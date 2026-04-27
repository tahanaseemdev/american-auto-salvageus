import { Link } from 'react-router-dom';
import { BiMap, BiPhone, BiEnvelope, BiRightArrowAlt } from 'react-icons/bi';
import { FaFacebookF, FaInstagram, FaYoutube, FaXTwitter } from 'react-icons/fa6';
import logoImg from '../../assets/american autos.png';

const shopLinks = [
	{ label: 'Engines', href: '/shop' },
	{ label: 'Transmissions', href: '/shop' },
	{ label: 'Alternators', href: '/shop' },
	{ label: 'Headlights', href: '/shop' },
	{ label: 'Axles', href: '/shop' },
	{ label: 'Starters', href: '/shop' },
];

const helpLinks = [
	{ label: 'Warranty & Returns', href: '/returns' },
	{ label: 'Returns & Refund', href: '/returns' },
	// { label: 'Track My Order', href: '/tracking' },
	{ label: 'Contact Us', href: '/contact' },
];

const usefulLinks = [
	{ label: 'Privacy Policy', href: '/privacy' },
	{ label: 'Disclaimer', href: '/disclaimer' },
	{ label: 'Terms of Use', href: '/terms' },
	{ label: 'Contact Us', href: '/contact' },
];

const contactItems = [
	{
		icon: BiMap, text: '30 N Gould St Ste R Sheridan, WY 82801', href: null
	},
	{ icon: BiPhone, text: '+1-866-206-9163', href: '+1-866-206-9163' },
	{ icon: BiEnvelope, text: 'info@americanautosalvageus.com', href: 'mailto:info@americanautosalvageus.com' },
];

const socials = [
	{ icon: FaFacebookF, href: '/contact', label: 'Facebook' },
	{ icon: FaInstagram, href: '/contact', label: 'Instagram' },
	{ icon: FaXTwitter, href: '/contact', label: 'X / Twitter' },
	{ icon: FaYoutube, href: '/contact', label: 'YouTube' },
];

export default function Footer() {
	return (
		<>
			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@400;500;600;700&display=swap');
        .font-barlow            { font-family: 'Barlow', sans-serif; }
        .font-barlow-condensed  { font-family: 'Barlow Condensed', sans-serif; }
        .footer-link { transition: color 0.18s, padding-left 0.18s; }
        .footer-link:hover { color: #F59E0B; padding-left: 4px; }
      `}</style>

			<footer className="font-barlow bg-neutral-950 text-neutral-400 border-t border-white/5">

				{/* ── Top CTA Strip ── */}
				<div className="border-b border-white/5 bg-neutral-900/60">
					<div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
						<p className="font-barlow-condensed font-black text-lg uppercase text-white tracking-tight">
							Can't find your part?{' '}
							<span className="text-amber-400">We'll source it for you.</span>
						</p>
						<Link to="/contact"
							className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-900 font-black text-[11px] tracking-widest uppercase px-5 py-3 rounded-lg transition-colors shrink-0">
							Talk to a Specialist <BiRightArrowAlt size={16} />
						</Link>
					</div>
				</div>

				{/* ── Main Grid ── */}
				<div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

						{/* Brand — spans 3 cols */}
						<div className="lg:col-span-3 flex flex-col gap-5">
							{/* Logo */}
							<Link to="/" className="flex items-center self-start focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:ring-offset-2 focus:ring-offset-neutral-950 rounded">
								<img
									src={logoImg}
									alt="American Auto Salvageus"
									className="h-8 sm:h-9 md:h-10 w-auto max-w-40 sm:max-w-[200px] object-contain object-left"
								/>
							</Link>

							<p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
								Quality-tested used OEM engines, transmissions, and parts.
								Mileage-based pricing. Nationwide shipping. America's trusted
								source for 20 million+ auto parts.
							</p>
							{/* Socials */}
							<div className="flex gap-2 mt-1">
								{socials.map(({ icon: Icon, href, label }) => (
									<a key={label} href={href} aria-label={label}
										className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-amber-400 text-neutral-400 hover:text-neutral-900 flex items-center justify-center transition-all duration-200">
										<Icon size={14} />
									</a>
								))}
							</div>
						</div>

						{/* Shop — spans 2 cols */}
						<div className="lg:col-span-2">
							<h4 className="font-barlow-condensed font-black text-sm tracking-[0.14em] uppercase text-white mb-5 flex items-center gap-2">
								<span className="w-4 h-0.5 bg-amber-400 rounded" />
								Shop
							</h4>
							<ul className="space-y-2.5">
								{shopLinks.map(({ label, href }) => (
									<li key={label}>
										<Link to={href} className="footer-link text-sm text-neutral-500 inline-block">{label}</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Help — spans 2 cols */}
						<div className="lg:col-span-2">
							<h4 className="font-barlow-condensed font-black text-sm tracking-[0.14em] uppercase text-white mb-5 flex items-center gap-2">
								<span className="w-4 h-0.5 bg-amber-400 rounded" />
								Help
							</h4>
							<ul className="space-y-2.5">
								{helpLinks.map(({ label, href }) => (
									<li key={label}>
										<Link to={href} className="footer-link text-sm text-neutral-500 inline-block">{label}</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Useful Links — spans 2 cols */}
						<div className="lg:col-span-2">
							<h4 className="font-barlow-condensed font-black text-sm tracking-[0.14em] uppercase text-white mb-5 flex items-center gap-2">
								<span className="w-4 h-0.5 bg-amber-400 rounded" />
								Useful Links
							</h4>
							<ul className="space-y-2.5">
								{usefulLinks.map(({ label, href }) => (
									<li key={label}>
										<Link to={href} className="footer-link text-sm text-neutral-500 inline-block">{label}</Link>
									</li>
								))}
							</ul>
						</div>

						{/* Contact — spans 3 cols */}
						<div className="lg:col-span-3">
							<h4 className="font-barlow-condensed font-black text-sm tracking-[0.14em] uppercase text-white mb-5 flex items-center gap-2">
								<span className="w-4 h-0.5 bg-amber-400 rounded" />
								Contact
							</h4>
							<ul className="space-y-4">
								{contactItems.map(({ icon: Icon, text, href }) => (
									<li key={text}>
										{href ? (
											<a href={href}
												className="flex items-start gap-3 text-sm text-neutral-500 hover:text-amber-400 transition-colors group">
												<div className="w-7 h-7 rounded-lg bg-neutral-800 group-hover:bg-amber-400/10 flex items-center justify-center shrink-0 mt-0.5 transition-colors">
													<Icon className="text-amber-400" size={14} />
												</div>
												{text}
											</a>
										) : (
											<div className="flex items-start gap-3 text-sm text-neutral-500">
												<div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
													<Icon className="text-amber-400" size={14} />
												</div>
												{text}
											</div>
										)}
									</li>
								))}
							</ul>

							{/* Hours */}
							<div className="mt-6 bg-neutral-900 border border-neutral-800 rounded-xl p-4">
								<p className="text-[10px] font-bold tracking-widest uppercase text-amber-400 mb-2">Business Hours</p>
								<div className="flex justify-between text-xs text-neutral-500">
									<span>Mon – Fri</span><span className="text-neutral-300 font-semibold">8am – 6pm CST</span>
								</div>
								<div className="flex justify-between text-xs text-neutral-500 mt-1">
									<span>Saturday</span><span className="text-neutral-300 font-semibold">9am – 3pm CST</span>
								</div>
								<div className="flex justify-between text-xs text-neutral-500 mt-1">
									<span>Sunday</span><span className="text-neutral-400">Closed</span>
								</div>
							</div>
						</div>

					</div>
				</div>

				{/* ── Bottom Bar ── */}
				<div className="border-t border-white/5">
					<div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-neutral-600">
						<span>© {new Date().getFullYear()} American Auto Salvageus — All rights reserved.</span>
						<div className="flex items-center gap-5">
							<Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
							<span className="w-px h-3 bg-neutral-800" />
							<Link to="/returns" className="hover:text-amber-400 transition-colors">Returns & Refund</Link>
						</div>
					</div>
				</div>

			</footer>
		</>
	);
}