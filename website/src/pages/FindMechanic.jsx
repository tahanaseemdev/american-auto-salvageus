import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  BiSearch, BiStar, BiMapPin, BiPhone, BiEnvelope, BiTime, BiCheck, BiFilter
} from 'react-icons/bi';
import { FaWrench, FaTools, FaCar, FaCertificate } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const staggerItem = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

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

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <BiStar key={i} size={13}
          className={i <= Math.round(rating) ? 'text-amber-400' : 'text-neutral-200'}
          style={{ fill: i <= Math.round(rating) ? '#FCD34D' : 'none' }} />
      ))}
    </div>
  );
}

const MECHANICS = [
  {
    id: 1, name: 'AutoFix Pro', location: 'Newark, NJ', distance: '0.8 mi',
    specialties: ['Engine Repair', 'Transmission', 'Electrical'],
    rating: 4.9, reviews: 142, certified: true, years: 15,
    phone: '(973) 555-0191', hours: 'Mon–Sat 8AM–6PM',
    bio: 'Full-service repair shop with factory-trained technicians. ASE certified, specializing in import and domestic vehicles.',
  },
  {
    id: 2, name: 'Garcia\'s Garage', location: 'Hoboken, NJ', distance: '1.4 mi',
    specialties: ['Body Work', 'Paint', 'Frame Repair'],
    rating: 4.7, reviews: 89, certified: true, years: 22,
    phone: '(201) 555-0274', hours: 'Mon–Fri 7AM–5PM',
    bio: 'Family-owned collision specialist for over two decades. Insurance-approved, same-day estimates.',
  },
  {
    id: 3, name: 'Precision Motor Works', location: 'Jersey City, NJ', distance: '2.1 mi',
    specialties: ['European Cars', 'Diagnostics', 'Performance'],
    rating: 4.8, reviews: 211, certified: true, years: 11,
    phone: '(551) 555-0340', hours: 'Mon–Sat 9AM–7PM',
    bio: 'Specialists in BMW, Audi, and Mercedes. Advanced diagnostics, performance upgrades, and restoration.',
  },
  {
    id: 4, name: 'Quik Lube & Auto', location: 'Bayonne, NJ', distance: '2.9 mi',
    specialties: ['Oil Change', 'Brakes', 'Tires', 'Suspension'],
    rating: 4.5, reviews: 67, certified: false, years: 8,
    phone: '(201) 555-0512', hours: 'Mon–Sun 8AM–8PM',
    bio: 'No appointment needed. Fast, affordable preventive maintenance and brake/tire services.',
  },
  {
    id: 5, name: 'Ramos Auto Electric', location: 'Elizabeth, NJ', distance: '4.2 mi',
    specialties: ['Electrical', 'Alternators', 'Starters', 'A/C'],
    rating: 4.9, reviews: 95, certified: true, years: 18,
    phone: '(908) 555-0627', hours: 'Mon–Fri 8AM–5PM',
    bio: 'Dedicated auto electrical shop. Starters, alternators, wiring, and full A/C system repair.',
  },
  {
    id: 6, name: 'Tire Kingdom Plus', location: 'Union City, NJ', distance: '3.7 mi',
    specialties: ['Tires', 'Alignment', 'Suspension', 'Brakes'],
    rating: 4.6, reviews: 133, certified: true, years: 13,
    phone: '(551) 555-0789', hours: 'Mon–Sat 8AM–7PM',
    bio: 'Full tire service from mounting to alignment. Nationwide warranty on all tires. Quick turnaround.',
  },
];

const SPECIALTIES = ['All', 'Engine Repair', 'Transmission', 'Body Work', 'Electrical', 'Tires', 'Brakes', 'Suspension', 'Diagnostics', 'Performance', 'A/C'];

export default function FindMechanic() {
  const [zip, setZip] = useState('');
  const [specialty, setSpecialty] = useState('All');
  const [certifiedOnly, setCertifiedOnly] = useState(false);
  const [searched, setSearched] = useState(true); // Show results by default

  const filtered = MECHANICS.filter(m => {
    const matchSpec = specialty === 'All' || m.specialties.some(s => s.includes(specialty) || specialty.includes(s));
    const matchCert = !certifiedOnly || m.certified;
    return matchSpec && matchCert;
  });

  return (
    <div className="font-['Barlow',sans-serif]">

      {/* ── Hero ── */}
      <section className="bg-neutral-950 pt-[68px] md:pt-[104px] pb-14 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 65%)' }} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 relative">
          <Reveal className="text-center">
            <span className="font-['Barlow_Condensed',sans-serif] font-bold text-xs tracking-[0.18em] uppercase text-amber-400 flex items-center justify-center gap-2 mb-4">
              <HiSparkles /> Vetted Local Shops
            </span>
            <h1 className="font-['Barlow_Condensed',sans-serif] font-black text-5xl md:text-6xl uppercase leading-none text-white mb-4">
              Find a <span className="text-amber-400">Mechanic</span>
            </h1>
            <p className="text-neutral-400 max-w-xl mx-auto mb-8">
              Connect with trusted, certified auto shops near you. We've vetted every mechanic in our network so you don't have to.
            </p>
          </Reveal>

          {/* Search form */}
          <Reveal delay={0.08}>
            <div className="bg-white rounded-2xl shadow-2xl p-5 md:p-6 border border-neutral-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-2 block">ZIP Code</label>
                  <div className="flex items-center bg-neutral-50 border border-neutral-200 focus-within:border-amber-400 rounded-xl overflow-hidden transition-colors">
                    <BiMapPin size={16} className="ml-3 text-neutral-400 flex-shrink-0" />
                    <input type="text" value={zip} onChange={e => setZip(e.target.value)}
                      placeholder="Your ZIP code"
                      className="flex-1 bg-transparent outline-none text-sm text-neutral-700 placeholder-neutral-400 px-3 py-2.5" />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-2 block">Specialty</label>
                  <select value={specialty} onChange={e => setSpecialty(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 focus:border-amber-400 rounded-xl px-4 py-2.5 text-sm text-neutral-700 outline-none transition-colors">
                    {SPECIALTIES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="flex flex-col justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => setSearched(true)}
                    className="bg-amber-400 hover:bg-amber-500 text-neutral-900 font-black text-[12px] tracking-widest uppercase py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                    <BiSearch size={15} /> Search Mechanics
                  </motion.button>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Results ── */}
      {searched && (
        <section className="bg-neutral-50 py-12">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <div>
                <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-2xl uppercase text-neutral-900">
                  {filtered.length} Mechanics Found
                </h2>
                <p className="text-sm text-neutral-400">
                  {zip ? `Near ${zip}` : 'Showing all available mechanics'} · sorted by distance
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <BiFilter size={14} /> {filtered.length} of {MECHANICS.length} shown
              </div>
            </div>

            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {filtered.map(m => (
                <motion.div
                  key={m.id}
                  variants={staggerItem}
                  whileHover={{ y: -4, boxShadow: '0 20px 48px -8px rgba(0,0,0,0.13)' }}
                  className="bg-white border border-neutral-200 rounded-2xl overflow-hidden flex flex-col"
                >
                  {/* Top color bar */}
                  <div className="h-1.5 bg-amber-400" />

                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      {/* Avatar */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center flex-shrink-0">
                          <FaWrench size={20} className="text-amber-500" />
                        </div>
                        <div>
                          <h3 className="font-['Barlow_Condensed',sans-serif] font-black text-lg uppercase text-neutral-900 leading-tight">
                            {m.name}
                          </h3>
                          <div className="flex items-center gap-1 text-xs text-neutral-400 font-medium">
                            <BiMapPin size={11} /> {m.location} · <span className="text-amber-500 font-semibold">{m.distance}</span>
                          </div>
                        </div>
                      </div>
                      {m.certified && (
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 border border-amber-100 px-2 py-1 rounded-lg flex-shrink-0">
                          <FaCertificate size={10} /> ASE
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-3">
                      <Stars rating={m.rating} />
                      <span className="text-xs font-bold text-neutral-700">{m.rating}</span>
                      <span className="text-xs text-neutral-400">({m.reviews} reviews)</span>
                      <span className="ml-auto text-[11px] text-neutral-400 font-semibold">{m.years} yrs in business</span>
                    </div>

                    {/* Bio */}
                    <p className="text-xs text-neutral-500 leading-relaxed mb-3 flex-1">{m.bio}</p>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {m.specialties.map(s => (
                        <span key={s} className="text-[10px] font-bold tracking-widest uppercase text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Hours + contact */}
                    <div className="border-t border-neutral-100 pt-4 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold">
                        <BiTime size={13} className="text-amber-400" /> {m.hours}
                      </div>
                      <div className="flex gap-2">
                        <a href={`tel:${m.phone}`}
                          className="flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase border border-neutral-200 hover:border-amber-400/50 text-neutral-500 hover:text-amber-500 px-3 py-2 rounded-xl transition-all">
                          <BiPhone size={12} /> Call
                        </a>
                        <button className="bg-amber-400 hover:bg-amber-500 text-neutral-900 text-[11px] font-black tracking-widest uppercase px-3 py-2 rounded-xl transition-colors">
                          Get Directions
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* No results */}
            {filtered.length === 0 && (
              <div className="text-center py-20 text-neutral-400">
                <FaTools size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-semibold text-neutral-600">No mechanics match your filters.</p>
                <p className="text-sm mt-1">Try changing the specialty or removing the certification filter.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Why Our Network ── */}
      <section className="bg-neutral-900 py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <Reveal className="text-center mb-10">
            <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-3xl uppercase text-white">
              Why Our <span className="text-amber-400">Mechanic Network</span>
            </h2>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <FaCertificate size={22} />, label: 'ASE Certified', desc: 'All mechanics vetted by our team' },
              { icon: <BiCheck size={22} />, label: 'Background Checked', desc: 'Fully screened and insured shops' },
              { icon: <BiStar size={22} />, label: 'Community Rated', desc: 'Real reviews from real customers' },
              { icon: <FaCar size={22} />, label: 'Parts + Labor', desc: 'Use our parts for seamless installs' },
            ].map(f => (
              <Reveal key={f.label}>
                <div className="bg-neutral-800/60 border border-white/8 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mx-auto mb-3 text-amber-400">
                    {f.icon}
                  </div>
                  <div className="font-['Barlow_Condensed',sans-serif] font-black text-sm uppercase text-white mb-1">{f.label}</div>
                  <div className="text-xs text-neutral-400">{f.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
