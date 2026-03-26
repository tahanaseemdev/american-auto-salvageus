import { useState } from 'react';
import { BiEnvelope, BiLock, BiUser, BiShow, BiHide, BiCheck } from 'react-icons/bi';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [submitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrors({ api: result.message });
    }
  };

  return (
    <div className="font-['Barlow',sans-serif] bg-neutral-950 min-h-screen pt-[68px] md:pt-[104px] flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 65%)' }} />

      <div className="relative w-full max-w-md mx-auto px-4 sm:px-6 py-12">

        {submitted ? (
          <div
            className="bg-white rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto mb-4">
              <BiCheck size={32} className="text-emerald-600" />
            </div>
            <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-3xl uppercase text-neutral-900 mb-2">Welcome Back!</h2>
            <p className="text-neutral-500 mb-6">You've been logged in successfully.</p>
            <button onClick={() => navigate('/')}
              className="bg-amber-400 hover:bg-amber-500 text-neutral-900 font-black text-[12px] tracking-widest uppercase px-7 py-3.5 rounded-xl transition-colors inline-block">
              Go to Homepage
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-2xl border border-neutral-100 overflow-hidden">

            {/* Top amber bar */}
            <div className="bg-amber-400 px-8 py-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-lg bg-neutral-900/20 flex items-center justify-center">
                  <BiUser size={18} className="text-neutral-900" />
                </div>
                <h1 className="font-['Barlow_Condensed',sans-serif] font-black text-2xl uppercase text-neutral-900">Sign In</h1>
              </div>
              <p className="text-neutral-700 text-sm">Welcome back — access your account below.</p>
            </div>

            <div className="p-7">
              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {errors.api && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-semibold">
                    {errors.api}
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400 mb-1.5 block">
                    Email Address <span className="text-amber-500">*</span>
                  </label>
                  <div className={`flex items-center bg-neutral-50 border rounded-xl overflow-hidden transition-colors focus-within:border-amber-400 ${errors.email ? 'border-red-300 bg-red-50' : 'border-neutral-200'}`}>
                    <BiEnvelope size={16} className="ml-4 text-neutral-400 shrink-0" />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="flex-1 bg-transparent outline-none text-sm text-neutral-700 placeholder-neutral-400 px-3 py-3" />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400">
                      Password <span className="text-amber-500">*</span>
                    </label>
                    <Link to="/forgot-password" className="text-[11px] font-bold text-amber-500 hover:text-amber-600 tracking-wide">Forgot password?</Link>
                  </div>
                  <div className={`flex items-center bg-neutral-50 border rounded-xl overflow-hidden transition-colors focus-within:border-amber-400 ${errors.password ? 'border-red-300 bg-red-50' : 'border-neutral-200'}`}>
                    <BiLock size={16} className="ml-4 text-neutral-400 shrink-0" />
                    <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="flex-1 bg-transparent outline-none text-sm text-neutral-700 placeholder-neutral-400 px-3 py-3" />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="mr-3 text-neutral-400 hover:text-neutral-600 transition-colors">
                      {showPass ? <BiHide size={16} /> : <BiShow size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password}</p>}
                </div>

                {/* Remember me */}
                <label className="flex items-center gap-2 cursor-pointer text-sm text-neutral-600 font-medium">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                    className="accent-amber-400 w-4 h-4 rounded" />
                  Keep me signed in
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-neutral-900 font-black text-[13px] tracking-widest uppercase py-3.5 rounded-xl transition-colors mt-2">
                  {loading ? 'Signing In…' : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-sm text-neutral-400 mt-5">
                Don't have an account?{' '}
                <Link to="/register" className="text-amber-500 font-bold hover:text-amber-600 transition-colors">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
