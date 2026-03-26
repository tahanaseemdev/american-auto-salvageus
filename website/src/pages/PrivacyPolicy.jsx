import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BiLock, BiUser, BiEnvelope, BiPhone, BiMap } from 'react-icons/bi';
import { IoShieldCheckmark } from "react-icons/io5";
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
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
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
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="font-['Barlow',sans-serif]">

      {/* ── Hero ── */}
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
              Privacy <span className="text-amber-400">Policy</span>
            </h1>
            <p className="text-neutral-400 max-w-xl">
              At American Auto Salvageus, we respect your privacy and are committed to protecting your personal information.
            </p>
            <p className="text-neutral-500 text-xs font-semibold tracking-wide mt-4">Last updated: January 2025</p>
          </Reveal>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="bg-neutral-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          <Section icon={<BiUser size={16} className="text-amber-500" />} title="Information We Collect">
            <p>We collect personal information you provide to us when using our services, including but not limited to:</p>
            <BulletList items={[
              'Contact information: name, email address, phone number, and mailing address',
              'Vehicle information: make, model, year, and VIN (Vehicle Identification Number)',
              'Payment information: credit card details, billing address, and transaction history',
              'Order and service history: parts purchased, warranties claimed, and support interactions',
            ]} />
          </Section>

          <Section icon={<IoShieldCheckmark size={16} className="text-amber-500" />} title="How We Use Your Information">
            <BulletList items={[
              'Process transactions, fulfill orders, and provide the services you request',
              'Communicate with you about your account, active orders, and support requests',
              'Improve our services, product catalog, and overall customer experience',
              'Send promotional offers, newsletters, and product updates (you may opt out at any time)',
              'Comply with legal requirements, industry standards, and regulatory obligations',
              'Detect and prevent fraudulent transactions and unauthorized access',
            ]} />
          </Section>

          <Section icon={<BiLock size={16} className="text-amber-500" />} title="How We Protect Your Information">
            <p>We take the security of your personal information seriously and implement industry-standard safeguards:</p>
            <BulletList items={[
              'Secure, encrypted servers and databases with restricted physical and digital access',
              'SSL/TLS encryption for all data transmitted between your browser and our servers',
              'Access controls limiting data visibility to authorized personnel only',
              'Regular security audits, penetration testing, and vulnerability assessments',
              'Employee training on data privacy best practices and security protocols',
            ]} />
          </Section>

          <Section icon={<BiUser size={16} className="text-amber-500" />} title="Sharing Your Information">
            <p>We handle your personal data with care and discretion:</p>
            <BulletList items={[
              'We do not sell, rent, or trade your personal information to third-party marketers',
              'We may share data with trusted service providers (e.g., shipping carriers, payment processors) strictly for fulfilling your order',
              'Partners and vendors only receive the minimum data necessary for their designated business function',
              'We may disclose information in response to valid legal processes, court orders, or government requests',
              'In the event of a merger or acquisition, user data may be transferred as part of business assets — you will be notified',
            ]} />
          </Section>

          <Section icon={<BiUser size={16} className="text-amber-500" />} title="Your Rights">
            <p>You have the following rights regarding your personal information:</p>
            <BulletList items={[
              'Access and review the personal information we hold about you',
              'Request corrections to inaccurate or incomplete information',
              'Opt out of marketing communications at any time via the unsubscribe link in emails or by contacting us',
              'Request deletion of your personal data (subject to applicable legal and operational requirements)',
              'Lodge a complaint with a supervisory authority if you believe your rights have been violated',
            ]} />
          </Section>

          <Section icon={<IoShieldCheckmark size={16} className="text-amber-500" />} title="Changes to This Policy">
            <BulletList items={[
              'We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements',
              'Material changes will be communicated via a notice on our website or by email',
              'Your continued use of our services after changes are posted constitutes acceptance of the updated policy',
            ]} />
          </Section>

          {/* Contact block */}
          <Reveal>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-xl uppercase text-white mb-4 flex items-center gap-2">
                <span className="w-4 h-0.5 bg-amber-400 inline-block" /> Contact Us
              </h2>
              <p className="text-neutral-400 text-sm mb-5">
                If you have questions, concerns, or requests related to this Privacy Policy, please reach out to our team:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: <BiMap size={15} className="text-amber-400" />, label: 'Address', value: '30 N Gould St Ste R\nSheridan, WY 82801' },
                  { icon: <BiPhone size={15} className="text-amber-400" />, label: 'Phone', value: '+1-866-206-9163', href: 'tel:+1-866-206-9163' },
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
