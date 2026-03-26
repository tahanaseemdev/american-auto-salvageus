import { useState } from 'react';
import { motion } from 'framer-motion';
import { BiEnvelope, BiLock, BiUser, BiShow, BiHide, BiPhone, BiCheck } from 'react-icons/bi';
import { HiSparkles } from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register: registerUser, loading } = useAuth();
  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', terms: false, newsletter: false });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name required.';
    if (!form.lastName.trim()) errs.lastName = 'Last name required.';
    if (!form.email) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 8) errs.password = 'Minimum 8 characters.';
    if (form.confirmPassword !== form.password) errs.confirmPassword = 'Passwords do not match.';
    if (!form.terms) errs.terms = 'You must accept the terms.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    const result = await registerUser({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      password: form.password,
    });

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors({ api: result.message });
    }
  };

  const strength = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500'];

  return (
    <div className="font-['Barlow',sans-serif] bg-neutral-950 min-h-screen pt-[68px] md:pt-[104px] flex items-center justify-center py-12 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 65%)' }} />

      <div className="relative w-full max-w-lg mx-auto px-4 sm:px-6">
        {submitted ? (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
              className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center mx-auto mb-4">
              <BiCheck size={32} className="text-amber-600" />
            </motion.div>
            <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-3xl uppercase text-neutral-900 mb-2">Account Created!</h2>
            <p className="text-neutral-500 mb-2">Welcome, <span className="font-bold text-amber-500">{form.firstName}</span>! Your account is ready.</p>
            <p className="text-neutral-400 text-sm mb-6">Check your email ({form.email}) for a confirmation link.</p>
            <div className="flex justify-center gap-3">
              <Link to="/login" className="bg-amber-400 hover:bg-amber-500 text-neutral-900 font-black text-[12px] tracking-widest uppercase px-6 py-3 rounded-xl transition-colors">
                Sign In
              </Link>
              <a href="/shop" className="border border-neutral-200 hover:border-amber-400 text-neutral-600 hover:text-amber-500 font-black text-[12px] tracking-widest uppercase px-6 py-3 rounded-xl transition-all">Shop Parts</a>
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden">

            {/* Header */}
            <div className="bg-amber-400 px-8 py-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-lg bg-neutral-900/20 flex items-center justify-center">
                  <HiSparkles size={16} className="text-neutral-900" />
                </div>
                <h1 className="font-['Barlow_Condensed',sans-serif] font-black text-2xl uppercase text-neutral-900">Create Account</h1>
              </div>
              <p className="text-neutral-700 text-sm">Join over 200,000 customers who trust us for their auto parts.</p>
            </div>

            <div className="p-7">
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {errors.api && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-semibold">
                    {errors.api}
                  </div>
                )}
                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1.5 block">
                      First Name <span className="text-amber-500">*</span>
                    </label>
                    <div className={`flex items-center bg-neutral-50 border rounded-xl overflow-hidden focus-within:border-amber-400 transition-colors ${errors.firstName ? 'border-red-300 bg-red-50' : 'border-neutral-200'}`}>
                      <BiUser size={15} className="ml-3 text-neutral-400 shrink-0" />
                      <input type="text" value={form.firstName} onChange={e => update('firstName', e.target.value)}
                        placeholder="John"
                        className="flex-1 bg-transparent outline-none text-sm text-neutral-700 placeholder-neutral-400 px-2 py-2.5" />
                    </div>
                    {errors.firstName && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1.5 block">
                      Last Name <span className="text-amber-500">*</span>
                    </label>
                    <div className={`flex items-center bg-neutral-50 border rounded-xl overflow-hidden focus-within:border-amber-400 transition-colors ${errors.lastName ? 'border-red-300 bg-red-50' : 'border-neutral-200'}`}>
                      <input type="text" value={form.lastName} onChange={e => update('lastName', e.target.value)}
                        placeholder="Doe"
                        className="flex-1 bg-transparent outline-none text-sm text-neutral-700 placeholder-neutral-400 px-3 py-2.5" />
                    </div>
                    {errors.lastName && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.lastName}</p>}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1.5 block">
                    Email Address <span className="text-amber-500">*</span>
                  </label>
                  <div className={`flex items-center bg-neutral-50 border rounded-xl overflow-hidden focus-within:border-amber-400 transition-colors ${errors.email ? 'border-red-300 bg-red-50' : 'border-neutral-200'}`}>
                    <BiEnvelope size={16} className="ml-4 text-neutral-400 shrink-0" />
                    <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                      placeholder="john@example.com"
                      className="flex-1 bg-transparent outline-none text-sm text-neutral-700 placeholder-neutral-400 px-3 py-3" />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1.5 block">Phone Number</label>
                  <div className="flex items-center bg-neutral-50 border border-neutral-200 rounded-xl overflow-hidden focus-within:border-amber-400 transition-colors">
                    <BiPhone size={16} className="ml-4 text-neutral-400 shrink-0" />
                    <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="flex-1 bg-transparent outline-none text-sm text-neutral-700 placeholder-neutral-400 px-3 py-3" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1.5 block">
                    Password <span className="text-amber-500">*</span>
                  </label>
                  <div className={`flex items-center bg-neutral-50 border rounded-xl overflow-hidden focus-within:border-amber-400 transition-colors ${errors.password ? 'border-red-300 bg-red-50' : 'border-neutral-200'}`}>
                    <BiLock size={16} className="ml-4 text-neutral-400 shrink-0" />
                    <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => update('password', e.target.value)}
                      placeholder="Min. 8 characters"
                      className="flex-1 bg-transparent outline-none text-sm text-neutral-700 placeholder-neutral-400 px-3 py-3" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="mr-3 text-neutral-400 hover:text-neutral-600 transition-colors">
                      {showPass ? <BiHide size={16} /> : <BiShow size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password}</p>}
                  {form.password && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex gap-1 flex-1">
                        {[1, 2, 3].map(i => (
                          <div key={i} className={`h-1 rounded-full flex-1 transition-all ${i <= strength ? strengthColors[strength] : 'bg-neutral-100'}`} />
                        ))}
                      </div>
                      <span className={`text-[11px] font-bold ${strength === 1 ? 'text-red-500' : strength === 2 ? 'text-amber-500' : 'text-emerald-500'}`}>{strengthLabel[strength]}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1.5 block">
                    Confirm Password <span className="text-amber-500">*</span>
                  </label>
                  <div className={`flex items-center bg-neutral-50 border rounded-xl overflow-hidden focus-within:border-amber-400 transition-colors ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-neutral-200'}`}>
                    <BiLock size={16} className="ml-4 text-neutral-400 shrink-0" />
                    <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                      placeholder="Re-enter password"
                      className="flex-1 bg-transparent outline-none text-sm text-neutral-700 placeholder-neutral-400 px-3 py-3" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="mr-3 text-neutral-400 hover:text-neutral-600 transition-colors">
                      {showConfirm ? <BiHide size={16} /> : <BiShow size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.confirmPassword}</p>}
                </div>

                {/* Terms */}
                <div className="space-y-2">
                  <label className={`flex items-start gap-2 cursor-pointer text-sm font-medium ${errors.terms ? 'text-red-500' : 'text-neutral-600'}`}>
                    <input type="checkbox" checked={form.terms} onChange={e => update('terms', e.target.checked)}
                      className="mt-0.5 accent-amber-400 w-4 h-4 shrink-0" />
                    I agree to the{' '}
                    <a href="#" className="text-amber-500 hover:underline font-semibold">Terms of Service</a> and{' '}
                    <a href="#" className="text-amber-500 hover:underline font-semibold">Privacy Policy</a>. <span className="text-amber-500">*</span>
                  </label>
                  {errors.terms && <p className="text-red-500 text-xs font-semibold">{errors.terms}</p>}
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-500 font-medium">
                    <input type="checkbox" checked={form.newsletter} onChange={e => update('newsletter', e.target.checked)}
                      className="accent-amber-400 w-4 h-4" />
                    Send me deals, alerts, and part availability updates.
                  </label>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-neutral-900 font-black text-[13px] tracking-widest uppercase py-3.5 rounded-xl transition-colors">
                  {loading ? 'Creating Account…' : 'Create Account'}
                </motion.button>
              </form>

              <p className="text-center text-sm text-neutral-400 mt-5">
                Already have an account?{' '}
                <Link to="/login" className="text-amber-500 font-bold hover:text-amber-600 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
