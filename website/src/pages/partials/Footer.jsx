import { BiMap, BiPhone, BiEnvelope, BiRightArrowAlt } from 'react-icons/bi';
import { FaFacebookF, FaInstagram, FaYoutube, FaXTwitter } from 'react-icons/fa6';

const shopLinks = [
	{ label: 'Engines', href: '#' },
	{ label: 'Transmissions', href: '#' },
	{ label: 'Alternators', href: '#' },
	{ label: 'Headlights', href: '#' },
	{ label: 'Axles', href: '#' },
	{ label: 'Starters', href: '#' },
];

const helpLinks = [
	{ label: 'Warranty', href: '/warranty-policy.php' },
	{ label: 'Shipping Policy', href: '/shipping-policy.php' },
	{ label: 'Returns & Refund', href: '/return-policy.php' },
	{ label: 'Track My Order', href: '/track_order.php' },
	{ label: 'Contact Us', href: '/contact.php' },
];

const contactItems = [
	{ icon: BiMap, text: '11011 Richmond Ave Ste 722, Houston, TX 77042', href: null },
	{ icon: BiPhone, text: '+1-888-818-5001', href: 'tel:+1-888-818-5001' },
	{ icon: BiEnvelope, text: 'support@allusedautoparts.world', href: 'mailto:support@allusedautoparts.world' },
];

const socials = [
	{ icon: FaFacebookF, href: '#', label: 'Facebook' },
	{ icon: FaInstagram, href: '#', label: 'Instagram' },
	{ icon: FaXTwitter, href: '#', label: 'X / Twitter' },
	{ icon: FaYoutube, href: '#', label: 'YouTube' },
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
						<a href="/contact.php"
							className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-900 font-black text-[11px] tracking-widest uppercase px-5 py-3 rounded-lg transition-colors flex-shrink-0">
							Talk to a Specialist <BiRightArrowAlt size={16} />
						</a>
					</div>
				</div>

				{/* ── Main Grid ── */}
				<div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-10">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">

						{/* Brand — spans 4 cols */}
						<div className="lg:col-span-4 flex flex-col gap-5">
							{/* Logo wordmark */}
							<a href="/" className="font-barlow-condensed font-black text-2xl tracking-tight text-white flex items-center gap-1 self-start">
								ALL USED<span className="text-amber-400">&nbsp;PARTS</span>
								<span className="w-1.5 h-1.5 rounded-full bg-amber-400 mb-0.5 ml-0.5 flex-shrink-0" />
							</a>

							<p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
								Quality-tested used OEM engines, transmissions, and parts.
								Mileage-based pricing. Nationwide shipping. America's trusted
								source for 20 million+ auto parts.
							</p>

							{/* Trust badges */}
							<div className="flex flex-wrap gap-2 mt-1">
								{['OEM Tested', '90-Day Warranty', 'VIN Verified', 'SSL Secure'].map(badge => (
									<span key={badge}
										className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 border border-neutral-800 px-2.5 py-1 rounded-md">
										{badge}
									</span>
								))}
							</div>

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
										<a href={href} className="footer-link text-sm text-neutral-500 inline-block">{label}</a>
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
										<a href={href} className="footer-link text-sm text-neutral-500 inline-block">{label}</a>
									</li>
								))}
							</ul>
						</div>

						{/* Contact — spans 4 cols */}
						<div className="lg:col-span-4">
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
												<div className="w-7 h-7 rounded-lg bg-neutral-800 group-hover:bg-amber-400/10 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors">
													<Icon className="text-amber-400" size={14} />
												</div>
												{text}
											</a>
										) : (
											<div className="flex items-start gap-3 text-sm text-neutral-500">
												<div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5">
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
						<span>© {new Date().getFullYear()} allusedautoparts.world — All rights reserved.</span>
						<div className="flex items-center gap-5">
							<a href="/privacy-policy.php" className="hover:text-amber-400 transition-colors">Privacy Policy</a>
							<span className="w-px h-3 bg-neutral-800" />
							<a href="/terms-conditions.php" className="hover:text-amber-400 transition-colors">Terms & Conditions</a>
							<span className="w-px h-3 bg-neutral-800" />
							<a href="/sitemap.php" className="hover:text-amber-400 transition-colors">Sitemap</a>
						</div>
					</div>
				</div>

			</footer>
		</>
	);
}