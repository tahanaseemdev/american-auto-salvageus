import { useState } from 'react';
import { motion } from 'framer-motion';
import { BiLock, BiChevronDown, BiCheck } from 'react-icons/bi';
import { IoShieldCheckmark } from "react-icons/io5";
import { FaTruck, FaCreditCard } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const ORDER_ITEMS = [
  { id: 1, name: 'Engine Assembly — 2.4L I4', sku: 'ENG-241-HND', qty: 1, price: 1249 },
  { id: 2, name: 'Alternator — 130 Amp', sku: 'ALT-130-FRD', qty: 2, price: 95 },
  { id: 3, name: 'Power Steering Pump', sku: 'PSP-CHV-ENS', qty: 1, price: 85 },
];

const US_STATES = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];

function InputField({ label, type = 'text', placeholder, hint, required = false }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400">
        {label}{required && <span className="text-amber-500 ml-0.5">*</span>}
      </label>
      {type === 'select' ? (
        <div className="relative">
          <select className="w-full appearance-none bg-neutral-50 border border-neutral-200 focus:border-amber-400 rounded-lg px-4 py-2.5 text-sm text-neutral-700 outline-none transition-colors pr-9">
            <option value="">{placeholder}</option>
            {US_STATES.map(s => <option key={s}>{s}</option>)}
          </select>
          <BiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
        </div>
      ) : type === 'textarea' ? (
        <textarea rows={3} placeholder={placeholder}
          className="bg-neutral-50 border border-neutral-200 focus:border-amber-400 rounded-lg px-4 py-2.5 text-sm text-neutral-700 outline-none transition-colors resize-none" />
      ) : (
        <input type={type} placeholder={placeholder}
          className="bg-neutral-50 border border-neutral-200 focus:border-amber-400 rounded-lg px-4 py-2.5 text-sm text-neutral-700 outline-none transition-colors" />
      )}
      {hint && <span className="text-[11px] text-neutral-400">{hint}</span>}
    </div>
  );
}

export default function Checkout() {


  return (
    <div>Checkout</div>);
}

function Checkout1() {
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [step, setStep] = useState(1); // 1=shipping 2=payment 3=confirm
  const [submitted, setSubmitted] = useState(false);

  const subtotal = ORDER_ITEMS.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = 0;
  const tax = Math.round(subtotal * 0.08);
  const total = subtotal + shipping + tax;

  if (submitted) {
    return (
      <div className="font-['Barlow',sans-serif] bg-neutral-50 min-h-screen pt-[68px] md:pt-[104px]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-24 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto mb-6">
            <BiCheck size={40} className="text-emerald-600" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="font-['Barlow_Condensed',sans-serif] font-black text-4xl uppercase text-neutral-900 mb-3">
              Order Confirmed!
            </h1>
            <p className="text-neutral-500 mb-2">Order <span className="font-bold text-amber-500">#AAS-{Date.now().toString().slice(-6)}</span> placed successfully.</p>
            <p className="text-neutral-400 text-sm mb-8">You'll receive a confirmation email shortly with tracking info.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/tracking" className="bg-amber-400 hover:bg-amber-500 text-neutral-900 font-black text-[12px] tracking-widest uppercase px-7 py-4 rounded-xl transition-colors">Track Order</a>
              <a href="/shop" className="border border-neutral-300 hover:border-amber-400 text-neutral-600 hover:text-amber-500 font-black text-[12px] tracking-widest uppercase px-7 py-4 rounded-xl transition-all">Shop More</a>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="font-['Barlow',sans-serif] bg-neutral-50 min-h-screen">

      {/* ── Banner ── */}
      <section className="bg-neutral-950 pt-[68px] md:pt-[104px] pb-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative">
          <span className="font-['Barlow_Condensed',sans-serif] font-bold text-xs tracking-[0.18em] uppercase text-amber-400 flex items-center gap-2 mb-3">
            <HiSparkles /> Almost There
          </span>
          <h1 className="font-['Barlow_Condensed',sans-serif] font-black text-4xl md:text-5xl uppercase leading-none text-white">
            Secure <span className="text-amber-400">Checkout</span>
          </h1>
          {/* Steps */}
          <div className="flex items-center gap-2 mt-4">
            {['Shipping', 'Payment', 'Review'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <button onClick={() => step > i + 1 && setStep(i + 1)}
                  className={`flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full transition-all ${step === i + 1 ? 'bg-amber-400 text-neutral-900' : step > i + 1 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-neutral-400'}`}>
                  {step > i + 1 ? <BiCheck size={12} /> : null}
                  {s}
                </button>
                {i < 2 && <div className={`w-8 h-px ${step > i + 1 ? 'bg-emerald-400' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Form Column */}
          <div className="lg:col-span-2 space-y-5">

            {/* Step 1: Shipping */}
            <motion.div
              initial={false}
              animate={{ opacity: step === 1 ? 1 : step > 1 ? 0.5 : 1 }}
              className="bg-white border border-neutral-200 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-xl uppercase text-neutral-900 flex items-center gap-2">
                  <FaTruck className="text-amber-400" /> Shipping Address
                </h2>
                {step > 1 && (
                  <button onClick={() => setStep(1)} className="text-xs font-bold tracking-widest uppercase text-amber-500 hover:text-amber-600">Edit</button>
                )}
              </div>
              {step === 1 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="First Name" placeholder="John" required />
                  <InputField label="Last Name" placeholder="Doe" required />
                  <div className="sm:col-span-2">
                    <InputField label="Email Address" type="email" placeholder="john@example.com" required />
                  </div>
                  <div className="sm:col-span-2">
                    <InputField label="Phone Number" type="tel" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="sm:col-span-2">
                    <InputField label="Street Address" placeholder="123 Main Street" required />
                  </div>
                  <InputField label="Apartment / Suite" placeholder="Apt 4B (optional)" />
                  <InputField label="City" placeholder="New York" required />
                  <InputField label="State" type="select" placeholder="Select state" required />
                  <InputField label="ZIP Code" placeholder="10001" required hint="5-digit US ZIP code" />

                  <div className="sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400">Delivery Notes</label>
                    <textarea rows={2} placeholder="Gate code, special instructions..." className="bg-neutral-50 border border-neutral-200 focus:border-amber-400 rounded-lg px-4 py-2.5 text-sm text-neutral-700 outline-none transition-colors resize-none" />
                  </div>

                  <div className="sm:col-span-2">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(2)}
                      className="bg-amber-400 hover:bg-amber-500 text-neutral-900 font-black text-[13px] tracking-widest uppercase px-8 py-3.5 rounded-xl transition-colors">
                      Continue to Payment
                    </motion.button>
                  </div>
                </div>
              )}
              {step > 1 && (
                <p className="text-sm text-neutral-500">123 Main Street, New York, NY 10001</p>
              )}
            </motion.div>

            {/* Step 2: Payment */}
            {step >= 2 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-neutral-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-xl uppercase text-neutral-900 flex items-center gap-2">
                    <FaCreditCard className="text-amber-400" /> Payment
                  </h2>
                  {step > 2 && (
                    <button onClick={() => setStep(2)} className="text-xs font-bold tracking-widest uppercase text-amber-500 hover:text-amber-600">Edit</button>
                  )}
                </div>
                {step === 2 && (
                  <>
                    {/* Method tabs */}
                    <div className="flex gap-2 mb-5">
                      {[
                        { id: 'card', label: 'Credit Card', icon: <FaCreditCard size={14} /> },
                      ].map(m => (
                        <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold tracking-widest uppercase transition-all ${paymentMethod === m.id ? 'bg-amber-400 border-amber-400 text-neutral-900' : 'border-neutral-200 text-neutral-500 hover:border-amber-300'}`}>
                          {m.icon} {m.label}
                        </button>
                      ))}
                    </div>

                    {paymentMethod === 'card' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                          <InputField label="Cardholder Name" placeholder="John Doe" required />
                        </div>
                        <div className="sm:col-span-2">
                          <InputField label="Card Number" placeholder="•••• •••• •••• ••••" required />
                        </div>
                        <InputField label="Expiry Date" placeholder="MM / YY" required />
                        <InputField label="CVV" placeholder="•••" required hint="3–4 digits on back of card" />
                      </div>
                    )}

                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(3)}
                      className="mt-5 bg-amber-400 hover:bg-amber-500 text-neutral-900 font-black text-[13px] tracking-widest uppercase px-8 py-3.5 rounded-xl transition-colors">
                      Review Order
                    </motion.button>
                  </>
                )}
                {step > 2 && (
                  <p className="text-sm text-neutral-500">•••• •••• •••• 4242</p>
                )}
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-neutral-200 rounded-2xl p-6">
                <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-xl uppercase text-neutral-900 mb-4">Review & Place Order</h2>
                <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 mb-5 text-sm text-neutral-600 space-y-1">
                  <p><span className="font-semibold text-neutral-800">Ship to:</span> 123 Main Street, New York, NY 10001</p>
                  <p><span className="font-semibold text-neutral-800">Payment:</span> Credit card ending in 4242</p>
                  <p><span className="font-semibold text-neutral-800">Estimated delivery:</span> 3–5 business days</p>
                </div>
                <label className="flex items-start gap-3 text-sm text-neutral-600 mb-5 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 accent-amber-400 w-4 h-4 rounded flex-shrink-0" />
                  I agree to the <a href="#" className="text-amber-500 hover:underline font-semibold">Terms & Conditions</a> and confirm this order is correct.
                </label>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setSubmitted(true)}
                  className="bg-amber-400 hover:bg-amber-500 text-neutral-900 font-black text-[13px] tracking-widest uppercase px-8 py-4 rounded-xl transition-colors flex items-center gap-2">
                  <BiLock size={15} /> Place Order — ${total.toLocaleString()}
                </motion.button>
              </motion.div>
            )}

          </div>

          {/* Order Summary Sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 sticky top-[120px]">
              <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-xl uppercase text-neutral-900 mb-5">
                Order Summary
              </h2>

              <div className="space-y-3 mb-5">
                {ORDER_ITEMS.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 flex-shrink-0 flex items-center justify-center">
                      <IoShieldCheckmark size={16} className="text-neutral-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-neutral-800 leading-tight truncate">{item.name}</div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">Qty: {item.qty} × ${item.price}</div>
                    </div>
                    <div className="text-xs font-bold text-neutral-800 flex-shrink-0">${(item.price * item.qty).toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-100 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span><span className="font-semibold text-neutral-700">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Shipping</span><span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>Tax (8%)</span><span className="font-semibold text-neutral-700">${tax.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-100">
                  <span className="font-black text-neutral-900">Total</span>
                  <span className="font-['Barlow_Condensed',sans-serif] font-black text-2xl text-neutral-900">${total.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-neutral-100 space-y-2">
                {[
                  { icon: <IoShieldCheckmark className="text-amber-500" />, text: '90-Day Warranty' },
                  { icon: <FaTruck className="text-amber-500" />, text: 'Free Express Shipping' },
                  { icon: <BiLock className="text-amber-500" />, text: 'Encrypted Payment' },
                ].map(b => (
                  <div key={b.text} className="flex items-center gap-2 text-xs text-neutral-500 font-medium">
                    {b.icon} {b.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
