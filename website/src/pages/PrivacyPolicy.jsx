import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BiLock, BiUser, BiEnvelope, BiPhone, BiMap, BiCookie } from 'react-icons/bi';
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
              This policy explains how American Auto Salvageus collects, uses, and protects information when you use our website and services.
            </p>
            <p className="text-neutral-500 text-xs font-semibold tracking-wide mt-4">Last updated: April 2026</p>
          </Reveal>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="bg-neutral-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          <Section icon={<BiUser size={16} className="text-amber-500" />} title="Information We Collect">
            <p>We may collect information you provide directly to us, information collected automatically, and information received from third parties when needed to support your request or order.</p>
            <BulletList items={[
              'Contact details such as name, email address, phone number, and mailing address',
              'Order details, vehicle information, and part preferences shared through forms or support channels',
              'Usage data such as browser type, pages viewed, referring pages, IP address, and session activity',
            ]} />
          </Section>

          <Section icon={<IoShieldCheckmark size={16} className="text-amber-500" />} title="How We Use Your Information">
            <BulletList items={[
              'Provide, operate, and maintain our website and services',
              'Respond to inquiries, quote requests, and support messages',
              'Improve our website, products, customer experience, and marketing',
              'Send order updates, service notifications, and other important communications',
              'Detect fraud, prevent misuse, and comply with applicable laws and business obligations',
            ]} />
          </Section>

          <Section icon={<BiLock size={16} className="text-amber-500" />} title="How We Protect Your Information">
            <p>We use reasonable administrative, technical, and physical safeguards designed to protect the information we handle.</p>
            <BulletList items={[
              'Limited access to sensitive data on a need-to-know basis',
              'Secure transmission methods where available',
              'Ongoing review of systems and processes to help reduce unauthorized access',
            ]} />
          </Section>

          <Section icon={<BiUser size={16} className="text-amber-500" />} title="Sharing Your Information">
            <p>We do not sell personal information. We may share information only when necessary to run our business or meet legal requirements.</p>
            <BulletList items={[
              'Service providers that help us process payments, ship orders, host systems, or support our operations',
              'Professional advisors, regulators, or law enforcement when required by law',
              'Business partners only when needed to complete a service you requested',
            ]} />
          </Section>

          <Section icon={<BiCookie size={16} className="text-amber-500" />} title="Cookies and Log Data">
            <p>Like most websites, we use cookies and similar technologies to remember preferences, understand traffic, and improve site performance.</p>
            <BulletList items={[
              'Browser type, internet service provider, date and time, referring pages, and click activity may be logged for analytics and security',
              'Cookies may be used to personalize content and improve your browsing experience',
              'You can disable cookies in your browser, though some site features may not work as intended',
            ]} />
          </Section>

          <Section icon={<BiUser size={16} className="text-amber-500" />} title="Children's Privacy">
            <BulletList items={[
              'Our website is not directed to children under 13',
              'We do not knowingly collect personal information from children under 13',
              'If you believe a child has provided personal information to us, contact us so we can review and remove it where appropriate',
            ]} />
          </Section>

          <Section icon={<IoShieldCheckmark size={16} className="text-amber-500" />} title="Changes to This Policy">
            <BulletList items={[
              'We may update this Privacy Policy from time to time',
              'Changes will appear on this page with a revised effective date when appropriate',
              'Your continued use of the website after changes are posted means you accept the updated policy',
            ]} />
          </Section>

          {/* Contact block */}
          <Reveal>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-xl uppercase text-white mb-4 flex items-center gap-2">
                <span className="w-4 h-0.5 bg-amber-400 inline-block" /> Contact Us
              </h2>
              <p className="text-neutral-400 text-sm mb-5">
                If you have questions, concerns, or requests related to this Privacy Policy, please reach out to our team.
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