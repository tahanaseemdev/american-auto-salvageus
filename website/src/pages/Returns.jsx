import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  BiPackage, BiPhone, BiEnvelope, BiCheckCircle, BiTime, BiInfoCircle
} from 'react-icons/bi';
import { FaTruck, FaTools, FaExchangeAlt, FaFileAlt } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const staggerItem = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

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

function PolicySection({ icon, title, children }) {
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

function NumberedList({ items }) {
  return (
    <ol className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="font-['Barlow_Condensed',sans-serif] font-black text-sm text-amber-500 bg-amber-50 border border-amber-100 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            {i + 1}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

function BulletList({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <BiCheckCircle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const HOW_TO_STEPS = [
  <>Contact us on our dedicated support toll-free number <a href="tel:+1-866-206-9163" className="text-amber-500 font-semibold hover:underline">+1-866-206-9163</a> or email us at <a href="mailto:info@americanautosalvageus.com" className="text-amber-500 font-semibold hover:underline">info@americanautosalvageus.com</a> Mon–Fri, 9:00 AM – 6:00 PM CST.</>,
  'You have a 6-month return and replacement warranty from the date of delivery to return the merchandise.',
  'Our support team will initiate the pick-up procedure upon approval from the warranty team. We will provide a BOL (Bill of Lading) that needs to be printed and shown to the driver at the time of pick-up.',
  'Returned merchandise must be in the same condition or with the same packaging as originally shipped. The ability to process returns is limited if the merchandise received is modified, damaged, or partially/fully installed.',
  'A refund will be initiated after we receive and inspect the returned item. Original transportation costs will be covered by us if the return is approved.',
  'We have room for exceptions for a used engine if it is received damaged or accepted incorrectly by us.',
  'Once we receive the merchandise, we will initiate the replacement or refund as per your requirement.',
  <>In case of a <strong className="text-neutral-800">refund</strong>: it will take 3–5 business days (excluding holidays and weekends) to process back to your source account.</>,
  <>In case of a <strong className="text-neutral-800">replacement</strong>: we will take 3–5 business days to deliver the replacement merchandise per our standard fulfillment process.</>,
  'Defective merchandise must be picked up prior to the replacement shipment or refund initiation.',
];

export default function Returns() {
  return (
    <div>Returns</div>
  );
}

function Returns1() {
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
              <HiSparkles /> Warranty & Returns
            </span>
            <h1 className="font-['Barlow_Condensed',sans-serif] font-black text-5xl md:text-6xl uppercase leading-none text-white mb-4">
              Returns &<br /><span className="text-amber-400">Refund Policy</span>
            </h1>
            <p className="text-neutral-400 max-w-2xl">
              American Auto Salvageus strives to make every purchase wrinkle free. That's why we secure our merchandise with a warranty policy that enables customers to avail of returns and refunds in case they receive defective or wrong merchandise.
            </p>
          </Reveal>

          {/* Promise chips */}
          <Reveal delay={0.1}>
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-3 mt-8"
            >
              {[
                { icon: <BiTime size={14} />, label: '6-Month Warranty' },
                { icon: <FaExchangeAlt size={13} />, label: 'Free Return Shipping' },
                { icon: <BiPackage size={14} />, label: '3–5 Day Refund Processing' },
                { icon: <FaTools size={13} />, label: 'ASE-Certified Inspection' },
              ].map(chip => (
                <motion.div key={chip.label} variants={staggerItem}
                  className="flex items-center gap-2 bg-neutral-900/60 border border-white/10 text-neutral-300 text-xs font-semibold px-3 py-2 rounded-xl">
                  <span className="text-amber-400">{chip.icon}</span>
                  {chip.label}
                </motion.div>
              ))}
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ── Content ── */}
      <section className="bg-neutral-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* Warranty Claim Requirements */}
          <PolicySection icon={<FaFileAlt size={14} className="text-amber-500" />} title="How to Claim Warranty">
            <p>
              If you wish to initiate a warranty claim, please have the following information ready before contacting us:
            </p>
            <BulletList items={[
              'Proof of the issue (clear images or videos showing the defect)',
              'Warranty documents signed at the time of placing the order',
              'A diagnostic report by an ASE-certified mechanic — required if images/videos are unavailable',
            ]} />
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 flex items-start gap-3 mt-2">
              <BiInfoCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 font-medium">
                Before initiating a warranty claim, ensure all pre-installation checks were followed at the time of installation — this eliminates the most common issues and expedites your claim.
              </p>
            </div>
          </PolicySection>

          {/* How to Initiate Return */}
          <PolicySection icon={<BiPackage size={15} className="text-amber-500" />} title="How to Initiate a Return">
            <p>
              We take all measures to ship a good working unit in the first place. If you still wish to return your used engine or transmission due to any issue, follow these guidelines:
            </p>
            <NumberedList items={HOW_TO_STEPS} />
          </PolicySection>

          {/* Failed Delivery */}
          <PolicySection icon={<FaTruck size={14} className="text-amber-500" />} title="What to Do in Case of Failed Delivery">
            <p>
              Though the occurrence of such circumstances is negligible — as we maintain close oversight over our shipments and partner with the best delivery providers in the USA — some unavoidable situations can arise.
            </p>
            <p>
              When merchandise is not delivered, it will automatically be returned to American Auto Salvageus. Once received, we offer two resolutions:
            </p>
            <BulletList items={[
              'Resend the merchandise through a different carrier at no additional cost to you',
              'Issue a full refund upon request if you no longer wish to receive the order',
            ]} />
          </PolicySection>

          {/* Timeline summary card */}
          <Reveal>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 mb-5">
              <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-xl uppercase text-white mb-5 flex items-center gap-2">
                <span className="w-4 h-0.5 bg-amber-400 inline-block" /> Resolution Timelines
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: <BiTime className="text-amber-400" size={18} />, label: 'Warranty Period', value: '6 Months', sub: 'from delivery date' },
                  { icon: <FaExchangeAlt className="text-amber-400" size={16} />, label: 'Replacement', value: '3–5 Days', sub: 'after approval' },
                  { icon: <BiPackage className="text-amber-400" size={18} />, label: 'Refund', value: '3–5 Days', sub: 'business days' },
                ].map(item => (
                  <div key={item.label} className="bg-neutral-800/60 border border-white/5 rounded-xl px-5 py-4 text-center">
                    <div className="flex justify-center mb-2">{item.icon}</div>
                    <div className="font-['Barlow_Condensed',sans-serif] font-black text-2xl text-amber-400 leading-none">{item.value}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-1">{item.label}</div>
                    <div className="text-[11px] text-neutral-600 mt-0.5">{item.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Contact CTA */}
          <Reveal>
            <div className="bg-amber-400 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div>
                <h3 className="font-['Barlow_Condensed',sans-serif] font-black text-2xl uppercase text-neutral-900 mb-1">
                  Need to Start a Claim?
                </h3>
                <p className="text-neutral-700 text-sm">
                  Our dedicated support team is ready to assist you Mon–Fri, 9:00 AM – 6:00 PM CST.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 flex-shrink-0">
                <a href="tel:+1-866-206-9163"
                  className="flex items-center gap-2 bg-neutral-900 hover:bg-neutral-800 text-white font-black text-[12px] tracking-widest uppercase px-5 py-3 rounded-xl transition-colors">
                  <BiPhone size={14} /> Call Us
                </a>
                <a href="mailto:info@americanautosalvageus.com"
                  className="flex items-center gap-2 bg-white/60 hover:bg-white text-neutral-900 font-black text-[12px] tracking-widest uppercase px-5 py-3 rounded-xl border border-neutral-900/10 transition-colors">
                  <BiEnvelope size={14} /> Email Us
                </a>
              </div>
            </div>
          </Reveal>

        </div>
      </section>

    </div>
  );
}
