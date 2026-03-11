import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BiSearch, BiPackage, BiCheck, BiTime, BiMapPin, BiPhone } from 'react-icons/bi';
import { FaTruck } from "react-icons/fa";
import { HiSparkles } from 'react-icons/hi';
import { FaBox, FaWarehouse, FaShippingFast, FaCheckCircle } from 'react-icons/fa';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
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

// Demo tracking data for the mock order
const DEMO_TRACKING = {
  orderNumber: 'AAS-284761',
  status: 'In Transit',
  estimatedDelivery: 'March 14, 2026',
  carrier: 'FedEx Ground',
  trackingCode: '279119660352460',
  item: 'Complete Engine Assembly — 2.4L Inline-4',
  origin: 'Kansas City, MO',
  destination: 'Newark, NJ',
  steps: [
    { label: 'Order Confirmed', sub: 'Received & processed by warehouse', date: 'Mar 9, 9:02 AM', icon: <FaBox />, done: true },
    { label: 'Picked & Packed', sub: 'Part inspected and packaged securely', date: 'Mar 9, 2:47 PM', icon: <FaWarehouse />, done: true },
    { label: 'Shipped', sub: 'Picked up by FedEx Ground, Kansas City MO', date: 'Mar 10, 8:15 AM', icon: <FaShippingFast />, done: true },
    { label: 'In Transit', sub: 'En route — estimated arrival Mar 14', date: 'Mar 11, 6:30 AM', icon: <FaTruck />, done: true, active: true },
    { label: 'Out for Delivery', sub: 'Will be loaded on local route', date: 'Pending', icon: <BiMapPin />, done: false },
    { label: 'Delivered', sub: 'Awaiting delivery confirmation', date: 'Pending', icon: <FaCheckCircle />, done: false },
  ],
};

const RECENT_UPDATES = [
  { time: 'Mar 11 · 6:30 AM', loc: 'Philadelphia, PA', note: 'Arrived at regional sort facility' },
  { time: 'Mar 10 · 11:58 PM', loc: 'Columbus, OH', note: 'Departed distribution hub' },
  { time: 'Mar 10 · 4:22 PM', loc: 'Columbus, OH', note: 'Arrived at distribution hub' },
  { time: 'Mar 10 · 8:15 AM', loc: 'Kansas City, MO', note: 'Picked up by FedEx Ground' },
];

export default function OrderTracking() {


  return (
    <div>Order Tracking</div>
  );
}

function OrderTracking1() {
  const [orderInput, setOrderInput] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = () => {
    setError('');
    if (!orderInput.trim()) { setError('Please enter an order number or tracking code.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Demo: any input shows the demo order
      setTrackingResult(DEMO_TRACKING);
    }, 900);
  };

  return (
    <div className="font-['Barlow',sans-serif]">

      {/* ── Hero ── */}
      <section className="bg-neutral-950 pt-[68px] md:pt-[104px] pb-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 65%)' }} />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 relative text-center">
          <Reveal>
            <span className="font-['Barlow_Condensed',sans-serif] font-bold text-xs tracking-[0.18em] uppercase text-amber-400 flex items-center justify-center gap-2 mb-4">
              <HiSparkles /> Real-Time Updates
            </span>
            <h1 className="font-['Barlow_Condensed',sans-serif] font-black text-5xl md:text-6xl uppercase leading-none text-white mb-4">
              Track Your <span className="text-amber-400">Order</span>
            </h1>
            <p className="text-neutral-400 mb-10 max-w-lg mx-auto">
              Enter your order number or carrier tracking code below to get live status updates on your shipment.
            </p>
          </Reveal>

          {/* Search card */}
          <Reveal delay={0.08}>
            <div className="bg-white rounded-2xl shadow-2xl border border-neutral-100 p-6 md:p-8">
              <label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 block mb-2 text-left">
                Order Number or Tracking Code
              </label>
              <div className="flex gap-3">
                <div className="flex-1 flex items-center bg-neutral-50 border border-neutral-200 focus-within:border-amber-400 rounded-xl overflow-hidden transition-colors">
                  <BiPackage size={18} className="ml-4 text-neutral-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={orderInput}
                    onChange={e => setOrderInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTrack()}
                    placeholder="e.g. AAS-284761 or FedEx tracking #"
                    className="flex-1 bg-transparent outline-none text-sm text-neutral-700 placeholder-neutral-400 px-3 py-3"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleTrack}
                  disabled={loading}
                  className="bg-amber-400 hover:bg-amber-500 text-neutral-900 font-black text-[12px] tracking-widest uppercase px-6 py-3 rounded-xl transition-colors flex items-center gap-2 flex-shrink-0 disabled:opacity-60">
                  {loading ? (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : <BiSearch size={16} />}
                  Track
                </motion.button>
              </div>
              {error && <p className="text-red-500 text-xs font-semibold mt-2 text-left">{error}</p>}
              <p className="text-[11px] text-neutral-400 mt-3 text-left">
                Tip: Try entering <button onClick={() => setOrderInput('AAS-284761')} className="text-amber-500 font-bold hover:underline">AAS-284761</button> to see a demo.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Tracking Result ── */}
      {trackingResult && (
        <section className="bg-neutral-50 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">

            {/* Status hero card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-neutral-200 rounded-2xl overflow-hidden mb-6"
            >
              {/* Top status bar */}
              <div className="bg-amber-400 px-6 py-4 flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="font-['Barlow_Condensed',sans-serif] font-black text-xl uppercase text-neutral-900">{trackingResult.status}</div>
                  <div className="text-neutral-700 text-xs font-semibold">Est. Delivery: {trackingResult.estimatedDelivery}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs text-neutral-700 uppercase tracking-widest">{trackingResult.carrier}</div>
                  <div className="text-neutral-900 text-xs font-mono font-semibold">{trackingResult.trackingCode}</div>
                </div>
              </div>

              {/* Order details */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm border-b border-neutral-100">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Order</div>
                  <div className="font-bold text-neutral-800">{trackingResult.orderNumber}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Item</div>
                  <div className="font-semibold text-neutral-800">{trackingResult.item}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Route</div>
                  <div className="font-semibold text-neutral-800">{trackingResult.origin} → {trackingResult.destination}</div>
                </div>
              </div>

              {/* Timeline */}
              <div className="p-6">
                <div className="relative">
                  {/* Vertical line */}
                  <div className="absolute left-4 top-5 bottom-5 w-0.5 bg-neutral-100" />

                  <div className="space-y-6">
                    {trackingResult.steps.map((step, i) => (
                      <motion.div
                        key={step.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-start gap-5 relative"
                      >
                        {/* Dot */}
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center z-10 text-sm
                          ${step.active ? 'bg-amber-400 text-neutral-900 shadow-[0_0_0_4px_#FCD34D33]'
                            : step.done ? 'bg-emerald-500 text-white'
                              : 'bg-neutral-100 text-neutral-400 border border-neutral-200'}`}>
                          {step.done && !step.active ? <BiCheck size={16} /> : step.icon}
                        </div>

                        <div className="flex-1 pt-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-bold text-sm ${step.active ? 'text-amber-500' : step.done ? 'text-neutral-800' : 'text-neutral-400'}`}>
                              {step.label}
                            </span>
                            {step.active && (
                              <span className="text-[10px] font-bold tracking-widest uppercase bg-amber-100 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full animate-pulse">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-500 mt-0.5">{step.sub}</div>
                          <div className="text-[11px] text-neutral-400 font-semibold mt-0.5 flex items-center gap-1">
                            <BiTime size={11} /> {step.date}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Recent scans */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white border border-neutral-200 rounded-2xl p-6">
              <h3 className="font-['Barlow_Condensed',sans-serif] font-black text-lg uppercase text-neutral-900 mb-4">Transit Log</h3>
              <div className="space-y-3">
                {RECENT_UPDATES.map((u, i) => (
                  <div key={i} className="flex gap-4 text-sm pb-3 border-b border-neutral-50 last:border-0">
                    <div className="text-[11px] font-semibold text-neutral-400 whitespace-nowrap w-36 flex-shrink-0">{u.time}</div>
                    <div>
                      <div className="font-semibold text-neutral-700">{u.note}</div>
                      <div className="text-xs text-neutral-400 flex items-center gap-1 mt-0.5"><BiMapPin size={11} /> {u.loc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Help row */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="mt-6 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="font-bold text-white text-sm mb-0.5">Need help with your order?</div>
                <div className="text-neutral-400 text-xs">Our team is available Mon–Sat, 8 AM – 6 PM EST.</div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <a href="tel:+1-866-206-9163"
                  className="flex items-center gap-2 border border-neutral-700 hover:border-amber-400/50 text-neutral-300 hover:text-amber-400 text-xs font-bold tracking-widest uppercase px-4 py-2.5 rounded-xl transition-all">
                  <BiPhone size={13} /> Call Us
                </a>
                <a href="/contact"
                  className="bg-amber-400 hover:bg-amber-500 text-neutral-900 text-xs font-black tracking-widest uppercase px-4 py-2.5 rounded-xl transition-colors">
                  Contact Support
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── FAQ ── */}
      {!trackingResult && (
        <section className="bg-white py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <Reveal className="text-center mb-10">
              <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-3xl uppercase text-neutral-900">Tracking FAQs</h2>
            </Reveal>
            <div className="space-y-4">
              {[
                { q: 'Where do I find my order number?', a: 'Your order number is in your confirmation email — it starts with "AAS-" followed by 6 digits.' },
                { q: 'How long before tracking updates appear?', a: 'Tracking is usually active within 24 hours of your order being shipped. Carrier scans update in near-real time.' },
                { q: 'My tracking shows no movement. What should I do?', a: 'Some carriers only scan packages at major hubs. If there\'s been no movement for 3+ days, please contact our support team.' },
              ].map((faq, i) => (
                <Reveal key={i} delay={i * 0.05}>
                  <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5">
                    <div className="font-bold text-neutral-800 text-sm mb-1.5">{faq.q}</div>
                    <div className="text-sm text-neutral-500 leading-relaxed">{faq.a}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
