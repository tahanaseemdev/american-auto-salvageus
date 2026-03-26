import { motion, AnimatePresence } from 'framer-motion';
import { BiCart, BiTrash, BiPlus, BiMinus, BiArrowBack, BiLock } from 'react-icons/bi';
import { FaTruck } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { IoShieldCheckmark } from "react-icons/io5";
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, updateItem, removeItem, subtotal } = useCart();

  const shipping = subtotal > 500 ? 0 : 29;
  const total = subtotal + shipping;

  // Normalise item shape from both logged-in (backend) and guest (local) formats
  const getProductId = (item) => item.product?._id || item.product?.id || String(item.id || '');
  const getProductName = (item) => item.product?.name || item.name || '';
  const getProductPrice = (item) => item.product?.price || item.price || 0;
  const getProductMiles = (item) => item.product?.mileage || item.miles || '';

  const totalItemCount = items.reduce((sum, i) => sum + (i.quantity || 1), 0);

  return (
    <div className="font-['Barlow',sans-serif] bg-neutral-50 min-h-screen">

      {/* ── Header Banner ── */}
      <section className="bg-neutral-950 pt-[68px] md:pt-[104px] pb-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 relative">
          <span className="font-['Barlow_Condensed',sans-serif] font-bold text-xs tracking-[0.18em] uppercase text-amber-400 flex items-center gap-2 mb-3">
            <HiSparkles /> Your Selection
          </span>
          <h1 className="font-['Barlow_Condensed',sans-serif] font-black text-4xl md:text-5xl uppercase leading-none text-white">
            Shopping <span className="text-amber-400">Cart</span>
          </h1>
          <p className="text-neutral-400 mt-2">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
        </div>
      </section>

      {/* ── Cart Body ── */}
      <section className="py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {items.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-24">
              <BiCart size={56} className="mx-auto mb-4 text-neutral-300" />
              <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-3xl uppercase text-neutral-700 mb-2">Your Cart is Empty</h2>
              <p className="text-neutral-400 mb-8">Browse our catalog to find the parts you need.</p>
              <a href="/shop"
                className="inline-block bg-amber-400 hover:bg-amber-500 text-neutral-900 font-black text-[12px] tracking-widest uppercase px-8 py-4 rounded-xl transition-colors">
                Shop Parts
              </a>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <AnimatePresence>
                  {items.map(item => {
                    const pid = getProductId(item);
                    const name = getProductName(item);
                    const price = getProductPrice(item);
                    const miles = getProductMiles(item);
                    const qty = item.quantity || 1;

                    return (
                      <motion.div
                        key={pid}
                        layout
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}
                        className="bg-white border border-neutral-200 rounded-2xl p-5 flex gap-4"
                      >
                        {/* Image placeholder */}
                        <div className="w-20 h-20 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0 border border-neutral-200">
                          {item.product?.image
                            ? <img src={item.product.image} alt={name} className="w-full h-full object-cover rounded-xl" />
                            : <IoShieldCheckmark size={28} className="text-neutral-300" />
                          }
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-sm text-neutral-800 leading-snug">{name}</h3>
                            <button onClick={() => removeItem(pid)}
                              className="flex-shrink-0 text-neutral-300 hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
                              <BiTrash size={17} />
                            </button>
                          </div>
                          {miles && <p className="text-xs text-neutral-400 mt-0.5">{miles}</p>}

                          {/* Qty + Price */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center gap-2 bg-neutral-50 border border-neutral-200 rounded-lg overflow-hidden">
                              <button onClick={() => qty > 1 ? updateItem(pid, qty - 1) : removeItem(pid)}
                                className="px-3 py-2 hover:bg-amber-50 hover:text-amber-600 transition-colors text-neutral-500">
                                <BiMinus size={14} />
                              </button>
                              <span className="min-w-[28px] text-center text-sm font-bold text-neutral-800">{qty}</span>
                              <button onClick={() => updateItem(pid, qty + 1)}
                                className="px-3 py-2 hover:bg-amber-50 hover:text-amber-600 transition-colors text-neutral-500">
                                <BiPlus size={14} />
                              </button>
                            </div>
                            <div className="text-right">
                              <span className="font-['Barlow_Condensed',sans-serif] font-black text-xl text-neutral-900">
                                ${(price * qty).toLocaleString()}
                              </span>
                              {qty > 1 && (
                                <div className="text-[11px] text-neutral-400">${price} each</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Continue shopping */}
                <a href="/shop"
                  className="inline-flex items-center gap-2 text-neutral-500 hover:text-amber-500 text-xs font-bold tracking-widest uppercase transition-colors mt-2">
                  <BiArrowBack size={14} /> Continue Shopping
                </a>
              </div>

              {/* Order Summary */}
              <div className="space-y-4">
                <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                  <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-xl uppercase text-neutral-900 mb-5 flex items-center gap-2 after:content-[''] after:flex-1 after:h-px after:bg-neutral-100">
                    Order Summary
                  </h2>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-neutral-600">
                      <span>Subtotal ({totalItemCount} item{totalItemCount !== 1 ? 's' : ''})</span>
                      <span className="font-semibold text-neutral-800">${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-neutral-600">
                      <span>Shipping</span>
                      <span className={`font-semibold ${shipping === 0 ? 'text-emerald-600' : 'text-neutral-800'}`}>
                        {shipping === 0 ? 'FREE' : `$${shipping}`}
                      </span>
                    </div>
                    <div className="pt-3 border-t border-neutral-100 flex justify-between">
                      <span className="font-black text-neutral-900">Total</span>
                      <span className="font-['Barlow_Condensed',sans-serif] font-black text-2xl text-neutral-900">${total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Checkout button */}
                  <motion.a href="/checkout"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full mt-5 bg-amber-400 hover:bg-amber-500 text-neutral-900 font-black text-[13px] tracking-widest uppercase py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                    Proceed to Checkout
                  </motion.a>
                </div>

                {/* Trust badges */}
                <div className="bg-neutral-100 border border-neutral-200 rounded-2xl p-4 space-y-3">
                  {[
                    { icon: <IoShieldCheckmark className="text-amber-500" />, text: '90-Day Warranty on All Parts' },
                    { icon: <FaTruck className="text-amber-500" />, text: 'Free Shipping Over $500' },
                    { icon: <BiLock className="text-amber-500" />, text: 'Secure & Encrypted Checkout' },
                  ].map(b => (
                    <div key={b.text} className="flex items-center gap-3 text-sm text-neutral-600 font-medium">
                      {b.icon} {b.text}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>
      </section>

    </div>
  );
}
