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
