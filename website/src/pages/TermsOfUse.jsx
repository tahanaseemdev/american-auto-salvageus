import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BiFile, BiShield, BiLinkExternal, BiEnvelope, BiPhone, BiMap, BiMessageDetail } from 'react-icons/bi';
import { HiSparkles } from 'react-icons/hi';

const fadeUp = {
	hidden: { opacity: 0, y: 24 },
	visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

function Reveal({ children, className = '', delay = 0 }) {
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, margin: '-60px' });
	return (
		<motion.div ref={ref} variants={fadeUp} initial="hidden"
			animate={inView ? 'visible' : 'hidden'} transition={{ delay }} className={className}>
			{children}
		</motion.div>
	);
}

function Section({ icon, title, children }) {
	return (
		<Reveal>
			<div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden mb-5">
				<div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-100 bg-neutral-50">
					<div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
						{icon}
					</div>
					<h2 className="font-['Barlow_Condensed',sans-serif] font-black text-lg uppercase text-neutral-900">{title}</h2>
				</div>
				<div className="px-6 py-5 text-sm text-neutral-600 leading-relaxed space-y-3">
					{children}
				</div>
			</div>
		</Reveal>
	);
}

function BulletList({ items }) {
	return (
		<ul className="space-y-2">
			{items.map((item, i) => (
				<li key={i} className="flex items-start gap-2.5">
					<span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
					<span>{item}</span>
				</li>
			))}
		</ul>
	);
}

export default function TermsOfUse() {
	return (
		<div className="font-['Barlow',sans-serif]">
			<section className="bg-neutral-950 pt-[68px] md:pt-[104px] pb-12 relative overflow-hidden">
				<div className="absolute inset-0 pointer-events-none"
					style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />
				<div className="absolute top-0 right-0 w-[500px] h-[350px] pointer-events-none"
					style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.09) 0%, transparent 65%)' }} />
				<div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 relative">
					<Reveal>
						<span className="font-['Barlow_Condensed',sans-serif] font-bold text-xs tracking-[0.18em] uppercase text-amber-400 flex items-center gap-2 mb-4">
							<HiSparkles /> Legal
						</span>
						<h1 className="font-['Barlow_Condensed',sans-serif] font-black text-5xl md:text-6xl uppercase leading-none text-white mb-4">
							Terms <span className="text-amber-400">&amp; Conditions</span>
						</h1>
						<p className="text-neutral-400 max-w-xl">
							These terms govern your use of the American Auto Salvage US website, services, and SMS communications.
						</p>
						<p className="text-neutral-500 text-xs font-semibold tracking-wide mt-4">Last updated: May 2026</p>
					</Reveal>
				</div>
			</section>

			<section className="bg-neutral-50 py-12">
				<div className="max-w-4xl mx-auto px-4 sm:px-6">
					<Section icon={<BiShield size={16} className="text-amber-500" />} title="Acceptance of These Terms">
						<p>
							By accessing or using this website, you agree to follow these Terms of Use and any additional policies referenced on the site. If you do not agree, you should not use the website.
						</p>
					</Section>

					<Section icon={<BiFile size={16} className="text-amber-500" />} title="Permitted Use">
						<BulletList items={[
							'Use the site only for lawful, personal, and non-commercial purposes unless we agree otherwise in writing',
							'Do not interfere with the operation, security, or availability of the site',
							'Do not copy, scrape, or reuse site content without permission where prohibited by law',
						]} />
					</Section>

					<Section icon={<BiLinkExternal size={16} className="text-amber-500" />} title="Third-Party Links and Services">
						<p>
							We may include links to other websites or services. Those third-party sites are independent from us, and we are not responsible for their content, terms, or privacy practices.
						</p>
					</Section>

					<Section icon={<BiShield size={16} className="text-amber-500" />} title="Product and Site Information">
						<BulletList items={[
							'Inventory, pricing, images, and specifications may change without notice',
							'We try to keep information current, but we do not guarantee it is always complete or error free',
							'Any reliance on site content is at your own risk',
						]} />
					</Section>

					<Section icon={<BiShield size={16} className="text-amber-500" />} title="Limitation of Liability">
						<p>
							To the fullest extent permitted by law, American Auto Salvageus is not liable for indirect, incidental, special, or consequential damages arising from your use of the website. Your exclusive remedy for dissatisfaction with the site is to stop using it.
						</p>
					</Section>

					<Section icon={<BiShield size={16} className="text-amber-500" />} title="Changes and Termination">
						<BulletList items={[
							'We may update these Terms & Conditions at any time by posting a revised version on this page',
							'Continued use of the site after changes are posted means you accept the revised terms',
							'We may suspend or terminate access to the site if necessary to protect the business, users, or platform',
						]} />
					</Section>

					<Reveal>
						<div className="flex items-center gap-2 mb-5 px-1">
							<span className="w-8 h-px bg-amber-400" />
							<p className="font-['Barlow_Condensed',sans-serif] font-black text-sm uppercase tracking-[0.14em] text-neutral-500">
								SMS Terms
							</p>
						</div>
					</Reveal>

					<Section icon={<BiMessageDetail size={16} className="text-amber-500" />} title="1. SMS Consent Communication">
						<p>
							The information (phone numbers) obtained as part of the SMS consent process will not be shared with third parties for marketing purposes.
						</p>
					</Section>

					<Section icon={<BiMessageDetail size={16} className="text-amber-500" />} title="2. Types of SMS Communications">
						<p>
							If you have consented to receive text messages from American Auto Salvage US, you may receive messages related to the following:
						</p>
						<BulletList items={[
							'Order confirmations and status updates',
							'Quote and product inquiry follow-up messages',
							'Billing and payment inquiries',
							'Shipping and delivery notifications',
						]} />
					</Section>

					<Section icon={<BiMessageDetail size={16} className="text-amber-500" />} title="3. Message Frequency">
						<p>
							Message frequency may vary depending on the type of communication. For example, you may receive up to 5 SMS messages per week related to your orders, quotes, billing, and shipping updates.
						</p>
					</Section>

					<Section icon={<BiMessageDetail size={16} className="text-amber-500" />} title="4. Potential Fees for SMS Messaging">
						<p>
							Please note that standard message and data rates may apply, depending on your carrier&apos;s pricing plan. These fees may vary if the message is sent domestically or internationally.
						</p>
					</Section>

					<Section icon={<BiMessageDetail size={16} className="text-amber-500" />} title="5. Opt-In Method">
						<p>You may opt in to receive SMS messages from American Auto Salvage US in the following ways:</p>
						<BulletList items={[
							'Verbally, during a phone conversation with our team',
							'By submitting an online form on our website (contact, registration, product inquiry, or checkout)',
							'By providing your mobile number when requesting order or quote updates',
						]} />
					</Section>

					<Section icon={<BiMessageDetail size={16} className="text-amber-500" />} title="6. Opt-Out Method">
						<p>
							You can opt out of receiving SMS messages at any time. To do so, simply reply &quot;STOP&quot; to any SMS message you receive. Alternatively, you can contact us at{' '}
							<a href="tel:+18667009187" className="text-amber-600 font-semibold hover:text-amber-700 underline underline-offset-2">1-(866) 700-9187</a>
							{' '}or{' '}
							<a href="mailto:info@americanautosalvageus.com" className="text-amber-600 font-semibold hover:text-amber-700 underline underline-offset-2">info@americanautosalvageus.com</a>
							{' '}to request removal from our messaging list.
						</p>
					</Section>

					<Section icon={<BiMessageDetail size={16} className="text-amber-500" />} title="7. Help">
						<p>
							If you are experiencing any issues, you can reply with the keyword &quot;HELP&quot;. Or, you can get help directly from us on our{' '}
							<Link to="/contact" className="text-amber-600 font-semibold hover:text-amber-700 underline underline-offset-2">Contact Us</Link>
							{' '}page, by calling{' '}
							<a href="tel:+18667009187" className="text-amber-600 font-semibold hover:text-amber-700 underline underline-offset-2">1-(866) 700-9187</a>
							, or by emailing{' '}
							<a href="mailto:info@americanautosalvageus.com" className="text-amber-600 font-semibold hover:text-amber-700 underline underline-offset-2">info@americanautosalvageus.com</a>.
						</p>
					</Section>

					<Section icon={<BiMessageDetail size={16} className="text-amber-500" />} title="8. Standard Messaging Disclosures">
						<BulletList items={[
							'Message and data rates may apply.',
							'You can opt out at any time by texting "STOP."',
							'For assistance, text "HELP" or visit our Privacy Policy and Terms & Conditions pages.',
							'Message frequency may vary.',
						]} />
						<p className="text-neutral-500 text-xs pt-1">
							See our{' '}
							<Link to="/privacy" className="text-amber-600 font-semibold hover:text-amber-700 underline underline-offset-2">Privacy Policy</Link>
							{' '}and{' '}
							<Link to="/terms-and-conditions" className="text-amber-600 font-semibold hover:text-amber-700 underline underline-offset-2">Terms &amp; Conditions</Link>
							{' '}for more information.
						</p>
					</Section>

					<Reveal>
						<div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-5">
							<h2 className="font-['Barlow_Condensed',sans-serif] font-black text-xl uppercase text-white mb-4 flex items-center gap-2">
								<span className="w-4 h-0.5 bg-amber-400 inline-block" /> Contact Us
							</h2>
							<p className="text-neutral-400 text-sm mb-5">
								If you have questions about these Terms &amp; Conditions, please contact us using the information below.
							</p>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								{[
									{ icon: <BiMap size={15} className="text-amber-400" />, label: 'Address', value: '30 N Gould St Ste R\nSheridan, WY 82801' },
									{ icon: <BiPhone size={15} className="text-amber-400" />, label: 'Phone', value: '1-(866) 700-9187', href: 'tel:+18667009187' },
									{ icon: <BiEnvelope size={15} className="text-amber-400" />, label: 'Email', value: 'info@americanautosalvageus.com', href: 'mailto:info@americanautosalvageus.com' },
								].map(item => (
									<div key={item.label} className="bg-neutral-800/60 border border-white/5 rounded-xl px-4 py-3">
										<div className="flex items-center gap-1.5 mb-1.5">
											{item.icon}
											<span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{item.label}</span>
										</div>
										{item.href ? (
											<a href={item.href} className="text-sm text-neutral-300 hover:text-amber-400 transition-colors font-medium break-all">
												{item.value}
											</a>
										) : (
											<span className="text-sm text-neutral-300 font-medium whitespace-pre-line">{item.value}</span>
										)}
									</div>
								))}
							</div>
						</div>
					</Reveal>
				</div>
			</section>
		</div>
	);
}
