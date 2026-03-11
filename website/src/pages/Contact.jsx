import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  BiPhone, BiEnvelope, BiMapPin, BiTime, BiSend, BiCheck
} from 'react-icons/bi';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

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

const SUBJECTS = ['General Inquiry', 'Order Support', 'Part Availability', 'Return / Warranty', 'Find a Mechanic', 'Business / Wholesale', 'Other'];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.email) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.subject) errs.subject = 'Please select a subject.';
    if (!form.message.trim()) errs.message = 'Message is required.';
    else if (form.message.trim().length < 20) errs.message = 'Please write at least 20 characters.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitted(true);
  };

  return (
    <div>Contact</div>
  );
}

function Contact1() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.email) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.subject) errs.subject = 'Please select a subject.';
    if (!form.message.trim()) errs.message = 'Message is required.';
    else if (form.message.trim().length < 20) errs.message = 'Please write at least 20 characters.';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitted(true);
  };

  return (
    <div className="font-['Barlow',sans-serif]">

      {/* ── Hero ── */}
      <section className="bg-neutral-950 pt-[68px] md:pt-[104px] pb-14 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[400px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 65%)' }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 relative">
          <Reveal>
            <span className="font-['Barlow_Condensed',sans-serif] font-bold text-xs tracking-[0.18em] uppercase text-amber-400 flex items-center gap-2 mb-4">
              <HiSparkles /> We're Here to Help
            </span>
            <h1 className="font-['Barlow_Condensed',sans-serif] font-black text-5xl md:text-6xl uppercase leading-none text-white mb-4">
              Get in <span className="text-amber-400">Touch</span>
            </h1>
            <p className="text-neutral-400 max-w-xl">
              Have a question about a part, an order, or your vehicle? Our team of automotive experts is ready to help.
            </p>
          </Reveal>
          {/* Quick contact chips */}
          <Reveal delay={0.08}>
            <div className="flex flex-wrap gap-3 mt-8">
              <a href="tel:+1-866-206-9163"
                className="flex items-center gap-2 bg-neutral-900/60 border border-white/10 hover:border-amber-500/30 text-neutral-300 hover:text-amber-400 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all">
                <BiPhone className="text-amber-400" /> +1-866-206-9163
              </a>
              <a href="mailto:info@americanautosalvageus.com"
                className="flex items-center gap-2 bg-neutral-900/60 border border-white/10 hover:border-amber-500/30 text-neutral-300 hover:text-amber-400 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all">
                <BiEnvelope className="text-amber-400" /> info@americanautosalvageus.com
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Main Body ── */}
      <section className="bg-neutral-50 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Contact Form — 3 cols */}
          <div className="lg:col-span-3">
            <Reveal>
              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
                <div className="bg-amber-400 px-6 py-5">
                  <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-2xl uppercase text-neutral-900">Send Us a Message</h2>
                  <p className="text-neutral-700 text-sm">We respond within 1 business day.</p>
                </div>

                <div className="p-6">
                  {submitted ? (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12">
                      <div className="w-14 h-14 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto mb-4">
                        <BiCheck size={28} className="text-emerald-600" />
                      </div>
                      <h3 className="font-['Barlow_Condensed',sans-serif] font-black text-2xl uppercase text-neutral-900 mb-2">Message Sent!</h3>
                      <p className="text-neutral-500 mb-1">Thanks, <span className="font-bold text-amber-500">{form.name}</span>. We received your message.</p>
                      <p className="text-neutral-400 text-sm">Expect a reply at <span className="font-semibold">{form.email}</span> within 1 business day.</p>
                      <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                        className="mt-6 border border-neutral-200 hover:border-amber-400 text-neutral-600 hover:text-amber-500 font-bold text-xs tracking-widest uppercase px-5 py-2.5 rounded-xl transition-all">
                        Send Another
                      </button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} noValidate className="space-y-4">
                      {/* Name + Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1.5 block">
                            Full Name <span className="text-amber-500">*</span>
                          </label>
                          <input type="text" value={form.name} onChange={e => update('name', e.target.value)}
                            placeholder="John Doe"
                            className={`w-full bg-neutral-50 border rounded-xl px-4 py-2.5 text-sm text-neutral-700 outline-none focus:border-amber-400 transition-colors placeholder-neutral-400 ${errors.name ? 'border-red-300' : 'border-neutral-200'}`} />
                          {errors.name && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1.5 block">
                            Email Address <span className="text-amber-500">*</span>
                          </label>
                          <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                            placeholder="you@example.com"
                            className={`w-full bg-neutral-50 border rounded-xl px-4 py-2.5 text-sm text-neutral-700 outline-none focus:border-amber-400 transition-colors placeholder-neutral-400 ${errors.email ? 'border-red-300' : 'border-neutral-200'}`} />
                          {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email}</p>}
                        </div>
                      </div>

                      {/* Phone + Subject */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1.5 block">Phone (Optional)</label>
                          <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-700 outline-none focus:border-amber-400 transition-colors placeholder-neutral-400" />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1.5 block">
                            Subject <span className="text-amber-500">*</span>
                          </label>
                          <select value={form.subject} onChange={e => update('subject', e.target.value)}
                            className={`w-full bg-neutral-50 border rounded-xl px-4 py-2.5 text-sm text-neutral-700 outline-none focus:border-amber-400 transition-colors ${errors.subject ? 'border-red-300' : 'border-neutral-200'}`}>
                            <option value="">Select a subject</option>
                            {SUBJECTS.map(s => <option key={s}>{s}</option>)}
                          </select>
                          {errors.subject && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.subject}</p>}
                        </div>
                      </div>

                      {/* Message */}
                      <div>
                        <label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1.5 block">
                          Message <span className="text-amber-500">*</span>
                        </label>
                        <textarea rows={5} value={form.message} onChange={e => update('message', e.target.value)}
                          placeholder="Describe your question or issue in detail..."
                          className={`w-full bg-neutral-50 border rounded-xl px-4 py-3 text-sm text-neutral-700 outline-none focus:border-amber-400 transition-colors resize-none placeholder-neutral-400 ${errors.message ? 'border-red-300' : 'border-neutral-200'}`} />
                        <div className="flex justify-between items-center mt-1">
                          {errors.message ? <p className="text-red-500 text-xs font-semibold">{errors.message}</p> : <span />}
                          <span className="text-[11px] text-neutral-400">{form.message.length} chars</span>
                        </div>
                      </div>

                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-neutral-900 font-black text-[12px] tracking-widest uppercase px-8 py-3.5 rounded-xl transition-colors">
                        <BiSend size={14} /> Send Message
                      </motion.button>
                    </form>
                  )}
                </div>
              </div>
            </Reveal>
          </div>

          {/* Info Column — 2 cols */}
          <div className="lg:col-span-2 space-y-5">
            {/* Contact Details */}
            <Reveal delay={0.05}>
              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-lg uppercase text-neutral-900 mb-5 flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-amber-400 inline-block" /> Contact Info
                </h2>
                <div className="space-y-4">
                  {[
                    { icon: <BiPhone size={16} className="text-amber-500" />, label: 'Phone', value: '+1-866-206-9163', href: 'tel:+1-866-206-9163' },
                    { icon: <BiEnvelope size={16} className="text-amber-500" />, label: 'Email', value: 'info@americanautosalvageus.com', href: 'mailto:info@americanautosalvageus.com' },
                    { icon: <BiMapPin size={16} className="text-amber-500" />, label: 'Address', value: '1800 Auto Park Dr, Kansas City, MO 64108', href: null },
                  ].map(item => (
                    <div key={item.label} className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0">
                        {item.icon}
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">{item.label}</div>
                        {item.href ? (
                          <a href={item.href} className="text-sm text-neutral-700 font-semibold hover:text-amber-500 transition-colors">{item.value}</a>
                        ) : (
                          <span className="text-sm text-neutral-700 font-semibold">{item.value}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Business Hours */}
            <Reveal delay={0.08}>
              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-lg uppercase text-white mb-4 flex items-center gap-2">
                  <BiTime className="text-amber-400" /> Business Hours
                </h2>
                <div className="space-y-2.5">
                  {[
                    { day: 'Monday – Friday', hours: '8:00 AM – 7:00 PM EST', open: true },
                    { day: 'Saturday', hours: '9:00 AM – 5:00 PM EST', open: true },
                    { day: 'Sunday', hours: 'Closed', open: false },
                  ].map(h => (
                    <div key={h.day} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                      <span className="text-sm text-neutral-300 font-medium">{h.day}</span>
                      <span className={`text-xs font-bold ${h.open ? 'text-amber-400' : 'text-neutral-500'}`}>{h.hours}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-xl px-3 py-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  <span className="text-xs text-amber-300 font-semibold">We're currently open</span>
                </div>
              </div>
            </Reveal>

            {/* Social Media */}
            <Reveal delay={0.10}>
              <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-lg uppercase text-neutral-900 mb-4 flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-amber-400 inline-block" /> Follow Us
                </h2>
                <div className="flex gap-3">
                  {[
                    { icon: <FaFacebook size={18} />, label: 'Facebook', color: 'text-blue-600 hover:bg-blue-50 hover:border-blue-200' },
                    { icon: <FaInstagram size={18} />, label: 'Instagram', color: 'text-pink-500 hover:bg-pink-50 hover:border-pink-200' },
                    { icon: <FaTwitter size={18} />, label: 'Twitter', color: 'text-sky-500 hover:bg-sky-50 hover:border-sky-200' },
                    { icon: <FaYoutube size={18} />, label: 'YouTube', color: 'text-red-500 hover:bg-red-50 hover:border-red-200' },
                  ].map(s => (
                    <motion.a key={s.label} href="#" whileHover={{ scale: 1.1 }}
                      className={`w-10 h-10 rounded-xl border border-neutral-200 flex items-center justify-center transition-all ${s.color}`}
                      aria-label={s.label}>
                      {s.icon}
                    </motion.a>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Map placeholder ── */}
      <section className="bg-neutral-100 h-64 flex items-center justify-center border-t border-neutral-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-neutral-200" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 47px, #cbd5e1 47px, #cbd5e1 48px), repeating-linear-gradient(90deg, transparent, transparent 47px, #cbd5e1 47px, #cbd5e1 48px)' }} />
        <div className="relative bg-white border border-neutral-300 rounded-2xl px-6 py-4 text-center shadow-lg">
          <BiMapPin size={28} className="text-amber-500 mx-auto mb-2" />
          <div className="font-['Barlow_Condensed',sans-serif] font-black text-lg uppercase text-neutral-800">1800 Auto Park Dr</div>
          <div className="text-sm text-neutral-500">Kansas City, MO 64108</div>
          <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer"
            className="mt-3 inline-block bg-amber-400 hover:bg-amber-500 text-neutral-900 font-black text-[11px] tracking-widest uppercase px-4 py-2 rounded-lg transition-colors">
            Open in Maps
          </a>
        </div>
      </section>

    </div>
  );
}
