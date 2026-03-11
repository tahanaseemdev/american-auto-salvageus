import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BiCheckCircle, BiTrophy, BiGroup, BiStar, BiTime, BiMap } from 'react-icons/bi';
import { IoShieldCheckmark } from "react-icons/io5";
import { FaTruck, FaRecycle, FaHandshake, FaWrench } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
};

function Reveal({ children, className = '', delay = 0, variants = fadeUp }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const STATS = [
  { value: '25+', label: 'Years in Business' },
  { value: '500K+', label: 'Parts in Stock' },
  { value: '98%', label: 'Customer Satisfaction' },
  { value: '50+', label: 'States Served' },
];

const VALUES = [
  {
    icon: <IoShieldCheckmark size={26} className="text-amber-400" />,
    title: 'Quality Assurance',
    desc: 'Every part is inspected, tested, and graded before listing. We stand behind what we sell — no exceptions.',
  },
  {
    icon: <FaTruck size={22} className="text-amber-400" />,
    title: 'Fast & Reliable Shipping',
    desc: 'Same-day dispatch on orders placed before 3 PM. Real-time tracking so you always know where your part is.',
  },
  {
    icon: <FaRecycle size={22} className="text-amber-400" />,
    title: 'Sustainable Practices',
    desc: 'We give car parts a second life, reducing waste and keeping quality components out of landfills.',
  },
  {
    icon: <FaHandshake size={22} className="text-amber-400" />,
    title: 'Trusted Partnerships',
    desc: 'Working with a vetted network of salvage yards across the U.S. to bring you the widest selection.',
  },
];

const TEAM = [
  { name: 'Marcus Allen', role: 'Founder & CEO', initials: 'MA', years: '25 yrs exp.' },
  { name: 'Diana Torres', role: 'Head of Operations', initials: 'DT', years: '18 yrs exp.' },
  { name: 'Ryan Kowalski', role: 'Lead Parts Specialist', initials: 'RK', years: '14 yrs exp.' },
  { name: 'Priya Nair', role: 'Customer Experience', initials: 'PN', years: '10 yrs exp.' },
];

export default function About() {
  return (
    <div>About</div>
  );
}

function About1() {
  return (
    <div className="font-['Barlow',sans-serif]">

      {/* ── Hero ── */}
      <section className="bg-neutral-950 pt-[68px] md:pt-[124px] pb-20 relative overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />
        {/* Amber glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 65%)' }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <Reveal>
            <span className="font-['Barlow_Condensed',sans-serif] font-bold text-xs tracking-[0.18em] uppercase text-amber-400 flex items-center gap-2 mb-4">
              <HiSparkles /> Our Story
            </span>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="font-['Barlow_Condensed',sans-serif] font-black text-5xl md:text-7xl uppercase leading-none text-white mb-6">
              Built by Car People,<br />
              <span className="text-amber-400">For Car People.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-neutral-400 text-lg max-w-2xl leading-relaxed mb-10">
              For over 25 years, American Auto Salvageus has been the trusted source for quality used auto parts. We combine deep automotive expertise with a commitment to making the right part accessible to everyone — on time, every time.
            </p>
          </Reveal>
          {/* Stats */}
          <Reveal delay={0.15}>
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {STATS.map(s => (
                <motion.div key={s.label} variants={staggerItem}
                  className="bg-neutral-900/60 border border-white/8 rounded-xl px-5 py-5 text-center">
                  <div className="font-['Barlow_Condensed',sans-serif] font-black text-3xl text-amber-400 mb-1">{s.value}</div>
                  <div className="text-[11px] font-semibold text-neutral-500 tracking-widest uppercase">{s.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </Reveal>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className="bg-neutral-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image side */}
          <Reveal variants={scaleIn}>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden  bg-neutral-200 flex items-center justify-center">
                <img src="https://plus.unsplash.com/premium_photo-1678318784591-cb64d92e14cb?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="" />
              </div>
              {/* Corner tag */}
              <div className="absolute -bottom-4 -right-4 bg-amber-400 rounded-xl p-4 text-center shadow-xl">
                <div className="font-['Barlow_Condensed',sans-serif] font-black text-2xl text-neutral-900 leading-none">25+</div>
                <div className="text-[10px] font-black tracking-widest uppercase text-neutral-700 mt-0.5">Years</div>
              </div>
            </div>
          </Reveal>

          {/* Text side */}
          <div>
            <Reveal>
              <span className="font-['Barlow_Condensed',sans-serif] font-bold text-xs tracking-[0.18em] uppercase text-amber-500 mb-3 block">
                Who We Are
              </span>
              <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-4xl uppercase leading-none text-neutral-900 mb-6">
                A Legacy of Trust<br />& Expertise
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="text-neutral-600 leading-relaxed mb-4">
                Founded in 1999, American Auto Salvageus started as a single salvage yard in the midwest with a simple mission: give every customer access to high-quality used parts at honest prices.
              </p>
              <p className="text-neutral-600 leading-relaxed mb-6">
                Today, we operate a nationwide network of partner salvage yards, serving professional mechanics, independent repair shops, and everyday drivers across all 50 states. Our catalog spans millions of parts across every major make and model.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <ul className="space-y-3">
                {['90-day warranty on all parts', 'Professionally graded & tested inventory', 'Expert support from real automotive technicians', 'Over 500,000 parts ready to ship'].map(item => (
                  <li key={item} className="flex items-center gap-3 text-neutral-700 text-sm font-medium">
                    <BiCheckCircle size={18} className="text-amber-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="bg-neutral-950 py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 65%)' }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative">
          <Reveal className="text-center mb-14">
            <span className="font-['Barlow_Condensed',sans-serif] font-bold text-xs tracking-[0.18em] uppercase text-amber-400 mb-3 block">
              What Drives Us
            </span>
            <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-4xl md:text-5xl uppercase leading-none text-white">
              Our Core Values
            </h2>
          </Reveal>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {VALUES.map(v => (
              <motion.div
                key={v.title}
                variants={staggerItem}
                whileHover={{ y: -5 }}
                className="bg-neutral-900/60 border border-white/8 rounded-2xl p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-4">
                  {v.icon}
                </div>
                <h3 className="font-['Barlow_Condensed',sans-serif] font-black text-lg uppercase text-white mb-2">{v.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center mb-14">
            <span className="font-['Barlow_Condensed',sans-serif] font-bold text-xs tracking-[0.18em] uppercase text-amber-500 mb-3 block">
              The People Behind It
            </span>
            <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-4xl md:text-5xl uppercase leading-none text-neutral-900">
              Meet Our Team
            </h2>
          </Reveal>
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {TEAM.map(member => (
              <motion.div
                key={member.name}
                variants={staggerItem}
                whileHover={{ y: -5, boxShadow: '0 20px 48px -8px rgba(0,0,0,0.12)' }}
                className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6 text-center"
              >
                <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-200 flex items-center justify-center mx-auto mb-4">
                  <span className="font-['Barlow_Condensed',sans-serif] font-black text-xl text-amber-600">{member.initials}</span>
                </div>
                <div className="font-bold text-sm text-neutral-900 mb-0.5">{member.name}</div>
                <div className="text-amber-500 text-xs font-semibold tracking-wide mb-2">{member.role}</div>
                <div className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-neutral-400 bg-neutral-100 border border-neutral-200 px-2 py-1 rounded">
                  <BiTime size={11} /> {member.years}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Accolades ── */}
      <section className="bg-neutral-100 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <Reveal className="flex flex-wrap items-center justify-center gap-6">
            {[
              { icon: <BiTrophy size={22} />, label: 'BBB Accredited Business' },
              { icon: <BiStar size={22} />, label: '4.9 / 5 Average Rating' },
              { icon: <BiGroup size={22} />, label: '200,000+ Happy Customers' },
              { icon: <BiMap size={22} />, label: 'Nationwide Coverage' },
            ].map(badge => (
              <div key={badge.label}
                className="flex items-center gap-3 bg-white border border-neutral-200 rounded-xl px-5 py-3">
                <span className="text-amber-500">{badge.icon}</span>
                <span className="font-bold text-sm text-neutral-700">{badge.label}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-amber-400 py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <Reveal>
            <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-4xl md:text-5xl uppercase text-neutral-900 mb-4">
              Ready to Find Your Part?
            </h2>
            <p className="text-neutral-700 font-medium mb-8 max-w-xl mx-auto">
              Browse our catalog of over half a million quality-tested parts and get it shipped to your door.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.a
                href="/shop"
                whileHover={{ scale: 1.03 }}
                className="bg-neutral-900 hover:bg-neutral-800 text-white font-black text-[12px] tracking-widest uppercase px-8 py-4 rounded-xl transition-colors"
              >
                Shop Parts
              </motion.a>
              <motion.a
                href="/contact"
                whileHover={{ scale: 1.03 }}
                className="bg-white/50 hover:bg-white text-neutral-900 font-black text-[12px] tracking-widest uppercase px-8 py-4 rounded-xl border border-neutral-900/10 transition-colors"
              >
                Contact Us
              </motion.a>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
