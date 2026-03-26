import { useState } from 'react';
import { motion } from 'framer-motion';
import { BiLock, BiCheck } from 'react-icons/bi';
import { IoShieldCheckmark } from "react-icons/io5";
import { FaTruck } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { useCart } from '../context/CartContext';
import api from '../utils/api';

function InputField({ label, type = 'text', placeholder, hint, required = false, value, onChange, name, options }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold tracking-widest uppercase text-neutral-400">
        {label}{required && <span className="text-amber-500 ml-0.5">*</span>}
      </label>
      {type === 'select' ? (
        <div className="relative">
          <select name={name} value={value} onChange={onChange}
            className="w-full appearance-none bg-neutral-50 border border-neutral-200 focus:border-amber-400 rounded-lg px-4 py-2.5 text-sm text-neutral-700 outline-none transition-colors pr-9">
            <option value="">{placeholder}</option>
            {(options || []).map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      ) : type === 'textarea' ? (
        <textarea rows={3} name={name} value={value} onChange={onChange} placeholder={placeholder}
          className="bg-neutral-50 border border-neutral-200 focus:border-amber-400 rounded-lg px-4 py-2.5 text-sm text-neutral-700 outline-none transition-colors resize-none" />
      ) : (
        <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
          className="bg-neutral-50 border border-neutral-200 focus:border-amber-400 rounded-lg px-4 py-2.5 text-sm text-neutral-700 outline-none transition-colors" />
      )}
      {hint && <span className="text-[11px] text-neutral-400">{hint}</span>}
    </div>
  );
}

const EMPTY_SHIPPING = { firstName: '', lastName: '', email: '', phone: '', street: '', apartment: '', city: '', state: '', zip: '', notes: '' };

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [orderResult, setOrderResult] = useState(null);
  const [placing, setPlacing] = useState(false);
  const [apiError, setApiError] = useState('');
  const [shipping, setShipping] = useState(EMPTY_SHIPPING);

  const total = subtotal;

  const updateShipping = (e) => setShipping(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // Normalise cart items to the payload shape the API expects
  const orderProducts = items.map(item => ({
    product: item.product?._id || item.product?.id || item.id,
    name: item.product?.name || item.name || '',
    sku: item.product?.sku || item.sku || '',
    price: item.product?.price || item.price || 0,
    quantity: item.quantity || 1,
  }));

  const placeOrder = async () => {
    if (!orderProducts.length) { setApiError('Your cart is empty.'); return; }
    setPlacing(true);
    setApiError('');
    try {
      const { data } = await api.post('/orders', {
        products: orderProducts,
        shippingDetails: shipping,
        paymentMethod: 'whatsapp',
        subtotal,
        shipping: 0,
      });
      await clearCart();
      setOrderResult(data.data);
      // Redirect to WhatsApp
      window.location.href = data.data.whatsappUrl;
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (orderResult) {
    return (
      <div className="font-['Barlow',sans-serif] bg-neutral-50 min-h-screen pt-[68px] md:pt-[104px]">
        <div className="max-w-xl mx-auto px-4 sm:px-6 py-24 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center mx-auto mb-6">
            <BiCheck size={40} className="text-emerald-600" />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="font-['Barlow_Condensed',sans-serif] font-black text-4xl uppercase text-neutral-900 mb-3">
              Order Received!
            </h1>
            <p className="text-neutral-500 mb-2">Order <span className="font-bold text-amber-500">#{orderResult.orderNumber}</span> placed successfully.</p>
            <p className="text-neutral-400 text-sm mb-2">Our team will contact you shortly to confirm your order details.</p>
            <p className="text-neutral-400 text-sm mb-8">Redirecting you to WhatsApp now…</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href={orderResult.whatsappUrl} target="_blank" rel="noopener noreferrer"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[12px] tracking-widest uppercase px-7 py-4 rounded-xl transition-colors">
                Open WhatsApp
              </a>
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
            {['Order Details', 'Review'].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <button onClick={() => step > i + 1 && setStep(i + 1)}
                  className={`flex items-center gap-1.5 text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full transition-all ${step === i + 1 ? 'bg-amber-400 text-neutral-900' : step > i + 1 ? 'bg-emerald-500 text-white' : 'bg-white/10 text-neutral-400'}`}>
                  {step > i + 1 ? <BiCheck size={12} /> : null}
                  {s}
                </button>
                {i < 1 && <div className={`w-8 h-px ${step > i + 1 ? 'bg-emerald-400' : 'bg-white/10'}`} />}
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
            <motion.div initial={false} animate={{ opacity: step === 1 ? 1 : 0.5 }}
              className="bg-white border border-neutral-200 rounded-2xl p-6">
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
                  <InputField label="First Name" name="firstName" value={shipping.firstName} onChange={updateShipping} placeholder="John" required />
                  <InputField label="Last Name" name="lastName" value={shipping.lastName} onChange={updateShipping} placeholder="Doe" required />
                  <div className="sm:col-span-2">
                    <InputField label="Email Address" type="email" name="email" value={shipping.email} onChange={updateShipping} placeholder="john@example.com" required />
                  </div>
                  <div className="sm:col-span-2">
                    <InputField label="Phone Number" type="tel" name="phone" value={shipping.phone} onChange={updateShipping} placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="sm:col-span-2">
                    <InputField label="Street Address" name="street" value={shipping.street} onChange={updateShipping} placeholder="123 Main Street" required />
                  </div>
                  <InputField label="Apartment / Suite" name="apartment" value={shipping.apartment} onChange={updateShipping} placeholder="Apt 4B (optional)" />
                  <InputField label="City" name="city" value={shipping.city} onChange={updateShipping} placeholder="New York" required />
                  <InputField label="State" name="state" value={shipping.state} onChange={updateShipping} placeholder="State / Province" required />
                  <InputField label="ZIP Code" name="zip" value={shipping.zip} onChange={updateShipping} placeholder="10001" required hint="5-digit US ZIP code" />
                  <div className="sm:col-span-2">
                    <InputField label="Delivery Notes" type="textarea" name="notes" value={shipping.notes} onChange={updateShipping} placeholder="Gate code, special instructions…" />
                  </div>
                  <div className="sm:col-span-2">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(2)}
                      className="bg-amber-400 hover:bg-amber-500 text-neutral-900 font-black text-[13px] tracking-widest uppercase px-8 py-3.5 rounded-xl transition-colors">
                      Continue to Review
                    </motion.button>
                  </div>
                </div>
              )}
              {step > 1 && (
                <p className="text-sm text-neutral-500">
                  {[shipping.street, shipping.city, shipping.state, shipping.zip].filter(Boolean).join(', ') || '—'}
                </p>
              )}
            </motion.div>

            {/* Step 2: Confirm */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-neutral-200 rounded-2xl p-6">
                <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-xl uppercase text-neutral-900 mb-4">Review & Place Order</h2>
                <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-4 mb-5 text-sm text-neutral-600 space-y-1">
                  <p><span className="font-semibold text-neutral-800">Ship to:</span> {[shipping.street, shipping.city, shipping.state, shipping.zip].filter(Boolean).join(', ') || '—'}</p>
                  <p><span className="font-semibold text-neutral-800">Contact:</span> {shipping.phone || 'Phone not provided'}</p>
                  <p><span className="font-semibold text-neutral-800">Confirmation:</span> Our team will contact you on WhatsApp to confirm your order.</p>
                </div>

                {apiError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 font-semibold mb-4">
                    {apiError}
                  </div>
                )}

                <label className="flex items-start gap-3 text-sm text-neutral-600 mb-5 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 accent-amber-400 w-4 h-4 rounded shrink-0" />
                  I agree to the <a href="/returns" className="text-amber-500 hover:underline font-semibold">Terms & Conditions</a> and confirm this order is correct.
                </label>
                <motion.button
                  disabled={placing}
                  whileHover={{ scale: placing ? 1 : 1.02 }}
                  whileTap={{ scale: placing ? 1 : 0.98 }}
                  onClick={placeOrder}
                  className="bg-amber-400 hover:bg-amber-500 disabled:opacity-60 text-neutral-900 font-black text-[13px] tracking-widest uppercase px-8 py-4 rounded-xl transition-colors flex items-center gap-2">
                  <BiLock size={15} /> {placing ? 'Placing Order…' : `Place Order — $${total.toLocaleString()}`}
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

              <div className="space-y-3 mb-5 max-h-56 overflow-y-auto pr-1">
                {items.length === 0 ? (
                  <p className="text-sm text-neutral-400">No items in cart.</p>
                ) : items.map((item, idx) => {
                  const name = item.product?.name || item.name || '';
                  const price = item.product?.price || item.price || 0;
                  const qty = item.quantity || 1;
                  const key = item.product?._id || item.id || idx;
                  return (
                    <div key={key} className="flex gap-3">
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 shrink-0 flex items-center justify-center">
                        <IoShieldCheckmark size={16} className="text-neutral-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-neutral-800 leading-tight truncate">{name}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">Qty: {qty} × ${price}</div>
                      </div>
                      <div className="text-xs font-bold text-neutral-800 shrink-0">${(price * qty).toLocaleString()}</div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-neutral-100 pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span><span className="font-semibold text-neutral-700">${subtotal.toLocaleString()}</span>
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
                  { icon: <BiLock className="text-amber-500" />, text: 'WhatsApp Order Confirmation' },
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
