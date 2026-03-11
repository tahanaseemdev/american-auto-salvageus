import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BiSearch, BiFilter, BiCart, BiChevronDown, BiStar, BiX } from 'react-icons/bi';
import { IoShieldCheckmark } from "react-icons/io5";
import { FaSlidersH } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

function Reveal({ children, className = '', delay = 0, variants = fadeUp }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div ref={ref} variants={variants} initial="hidden"
      animate={inView ? 'visible' : 'hidden'} transition={{ delay }} className={className}>
      {children}
    </motion.div>
  );
}

const PRODUCTS = [
  { id: 1, name: 'Complete Engine Assembly — 2.4L Inline-4', category: 'Engines', price: 1249, originalPrice: 1899, },
  { id: 2, name: 'Transmission — 6-Speed Automatic', category: 'Transmissions', price: 879, originalPrice: 1400, },
  { id: 3, name: 'Front Door Assembly — Driver Side', category: 'Body Parts', price: 175, originalPrice: 290, },
  { id: 4, name: 'Alternator — 130 Amp', category: 'Electrical', price: 95, originalPrice: 175, },
  { id: 5, name: 'Radiator — 2-Row Heavy Duty', category: 'Cooling', price: 120, originalPrice: 220, },
  { id: 6, name: 'Rear Axle Assembly — Complete', category: 'Drivetrain', price: 450, originalPrice: 780, },
  { id: 7, name: 'Hood — Factory Finish', category: 'Body Parts', price: 210, originalPrice: 360, },
  { id: 8, name: 'Starter Motor — V6 3.5L', category: 'Electrical', price: 75, originalPrice: 140, },
  { id: 9, name: 'Complete Strut Assembly — Front Pair', category: 'Suspension', price: 280, originalPrice: 480, },
  { id: 10, name: 'Fuel Tank — Steel 16-Gallon', category: 'Fuel System', price: 145, originalPrice: 250, },
  { id: 11, name: 'Power Steering Pump', category: 'Steering', price: 85, originalPrice: 160, },
  { id: 12, name: 'Catalytic Converter — CARB Compliant', category: 'Exhaust', price: 320, originalPrice: 560, },
];

const CATEGORIES = ['All', 'Engines', 'Transmissions', 'Body Parts', 'Electrical', 'Suspension', 'Cooling', 'Drivetrain', 'Exhaust', 'Fuel System', 'Steering'];
const SORT_OPTIONS = ['Featured', 'Price: Low to High', 'Price: High to Low', 'Top Rated', 'Newest'];


export default function Shop() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('Any Condition');
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sortBy, setSortBy] = useState('Featured');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [addedIds, setAddedIds] = useState([]);

  const filtered = PRODUCTS.filter(p => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchCond = selectedCondition === 'Any Condition' || p.condition === selectedCondition;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchPrice = p.price <= maxPrice;
    return matchCat && matchCond && matchSearch && matchPrice;
  }).sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    if (sortBy === 'Top Rated') return b.rating - a.rating;
    return 0;
  });

  const handleAdd = (id) => {
    setAddedIds(prev => [...prev, id]);
    setTimeout(() => setAddedIds(prev => prev.filter(x => x !== id)), 1500);
  };

  const Sidebar = () => (
    <aside className="w-full space-y-6">
      {/* Category */}
      <div>
        <h3 className="font-['Barlow_Condensed',sans-serif] font-black text-xs tracking-[0.14em] uppercase text-neutral-900 mb-3 flex items-center gap-2">
          <span className="w-4 h-0.5 bg-amber-400 inline-block" /> Category
        </h3>
        <div className="space-y-1">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedCategory === cat ? 'bg-amber-400 text-neutral-900 font-bold' : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button onClick={() => { setSelectedCategory('All'); setSelectedCondition('Any Condition'); setMaxPrice(2000); setSearch(''); }}
        className="w-full border border-neutral-300 hover:border-amber-400 text-neutral-500 hover:text-amber-500 text-xs font-bold tracking-widest uppercase py-2.5 rounded-lg transition-all">
        Reset Filters
      </button>
    </aside>
  );

  return (
    <div className="font-['Barlow',sans-serif]">

      {/* ── Hero Banner ── */}
      <section className="bg-neutral-950 pt-[68px] md:pt-[104px] pb-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)', backgroundSize: '52px 52px' }} />
        <div className="absolute top-0 right-0 w-[500px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 65%)' }} />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 relative">
          <Reveal>
            <span className="font-['Barlow_Condensed',sans-serif] font-bold text-xs tracking-[0.18em] uppercase text-amber-400 flex items-center gap-2 mb-3">
              <HiSparkles /> Our Catalog
            </span>
            <h1 className="font-['Barlow_Condensed',sans-serif] font-black text-5xl md:text-6xl uppercase leading-none text-white mb-3">
              Shop <span className="text-amber-400">All Parts</span>
            </h1>
            <p className="text-neutral-400 max-w-xl">
              Over 500,000 quality-tested used parts — all grades, all makes, all models.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Filters Bar + Grid ── */}
      <section className="bg-neutral-50 py-10 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <div className="flex gap-8">
            {/* Sidebar — desktop */}
            <div className="hidden lg:block w-56 flex-shrink-0">
              <Sidebar />
            </div>

            {/* Mobile sidebar drawer */}
            {sidebarOpen && (
              <div className="lg:hidden fixed inset-0 z-40 flex">
                <div className="bg-black/50 flex-1" onClick={() => setSidebarOpen(false)} />
                <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="w-72 bg-white h-full overflow-y-auto p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-['Barlow_Condensed',sans-serif] font-black text-lg uppercase text-neutral-900">Filters</span>
                    <button onClick={() => setSidebarOpen(false)}><BiX size={22} className="text-neutral-500" /></button>
                  </div>
                  <Sidebar />
                </motion.div>
              </div>
            )}

            {/* Product Grid */}
            <div className="flex-1 min-w-0">
              {filtered.length === 0 ? (
                <div className="text-center py-20 text-neutral-400">
                  <BiFilter size={48} className="mx-auto mb-4 opacity-30" />
                  <p className="font-semibold">No parts match your filters.</p>
                  <p className="text-sm mt-1">Try adjusting or resetting your filters.</p>
                </div>
              ) : (
                <motion.div
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                  {filtered.map(product => (
                    <motion.div
                      key={product.id}
                      variants={staggerItem}
                      whileHover={{ y: -5, boxShadow: '0 20px 48px -8px rgba(0,0,0,0.15)' }}
                      className="bg-white rounded-2xl overflow-hidden border border-neutral-200 flex flex-col"
                    >
                      {/* Image placeholder */}
                      <div className="aspect-[4/3] bg-neutral-50 border-b border-neutral-100 flex items-center justify-center relative p-6">
                        <div className="text-center text-neutral-300">
                          <div className="w-16 h-16 rounded-xl bg-neutral-100 mx-auto mb-2 flex items-center justify-center">
                            <IoShieldCheckmark size={28} className="text-neutral-300" />
                          </div>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-300">{product.category}</span>
                        </div>
                      </div>

                      <div className="p-4 flex flex-col flex-1">
                        <h3 className="text-sm font-semibold text-neutral-800 leading-snug mb-2 flex-1">{product.name}</h3>

                        {/* Price row */}
                        <div className="flex items-end justify-between mt-auto pt-3 border-t border-neutral-100">
                          <div>
                            <span className="font-['Barlow_Condensed',sans-serif] font-black text-2xl text-neutral-900">
                              ${product.price.toLocaleString()}
                            </span>
                            <span className="text-xs text-neutral-400 line-through ml-2">${product.originalPrice.toLocaleString()}</span>
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleAdd(product.id)}
                            className={`flex items-center gap-1.5 text-[11px] font-black tracking-widest uppercase px-4 py-2 rounded-lg transition-all ${addedIds.includes(product.id) ? 'bg-emerald-500 text-white' : 'bg-neutral-900 hover:bg-amber-400 hover:text-neutral-900 text-white'}`}
                          >
                            <BiCart size={14} />
                            {addedIds.includes(product.id) ? 'Added!' : 'Add'}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
