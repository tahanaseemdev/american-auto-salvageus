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
    <div>Privacy Policy</div>
  );
}
