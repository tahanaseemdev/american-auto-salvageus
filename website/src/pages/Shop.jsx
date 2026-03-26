import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { BiCart, BiChevronRight } from 'react-icons/bi';
import { IoShieldCheckmark, IoGridOutline } from "react-icons/io5";
import { HiSparkles } from 'react-icons/hi';
import api from '../utils/api';
import { useCart } from '../context/CartContext';

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

const MotionDiv = motion.div;
const MotionButton = motion.button;

function Reveal({ children, className = '', delay = 0, variants = fadeUp }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <MotionDiv ref={ref} variants={variants} initial="hidden"
      animate={inView ? 'visible' : 'hidden'} transition={{ delay }} className={className}>
      {children}
    </MotionDiv>
  );
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?q=80&w=1200&auto=format&fit=crop';

function Hero({ title, subtitle }) {
  return (
    <section className="bg-neutral-950 pt-[68px] md:pt-[104px] pb-10 relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(245,158,11,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.04) 1px, transparent 1px)',
          backgroundSize: '52px 52px'
        }}
      />
      <div
        className="absolute top-0 right-0 w-[500px] h-[300px] pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 65%)' }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 relative">
        <Reveal>
          <span className="font-['Barlow_Condensed',sans-serif] font-bold text-xs tracking-[0.18em] uppercase text-amber-400 flex items-center gap-2 mb-3">
            <HiSparkles /> Our Catalog
          </span>
          <h1 className="font-['Barlow_Condensed',sans-serif] font-black text-5xl md:text-6xl uppercase leading-none text-white mb-3">
            {title}
          </h1>
          <p className="text-neutral-400 max-w-2xl">{subtitle}</p>
        </Reveal>
      </div>
    </section>
  );
}

function Breadcrumbs({ category, subCategory }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px] font-black tracking-widest uppercase text-neutral-400">
      <Link to="/shop" className="hover:text-amber-500 transition-colors">Shop</Link>
      {category && (
        <>
          <BiChevronRight className="text-neutral-300" />
          <Link
            to={`/shop/category/${category._id}`}
            className={`transition-colors ${subCategory ? 'hover:text-amber-500' : 'text-neutral-700'}`}
          >
            {category.title}
          </Link>
        </>
      )}
      {subCategory && (
        <>
          <BiChevronRight className="text-neutral-300" />
          <span className="text-neutral-700">{subCategory.name}</span>
        </>
      )}
    </div>
  );
}

function ProductGrid({ products, addedIds, onAdd }) {
  if (!products.length) {
    return (
      <div className="text-center py-16 text-neutral-400 border border-dashed border-neutral-300 rounded-2xl bg-white/70">
        <IoGridOutline size={40} className="mx-auto mb-3 opacity-40" />
        <p className="font-semibold">No products found.</p>
      </div>
    );
  }

  return (
    <MotionDiv
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
    >
      {products.map((product) => (
        <MotionDiv
          key={product._id}
          variants={staggerItem}
          whileHover={{ y: -5, boxShadow: '0 20px 48px -8px rgba(0,0,0,0.15)' }}
          className="bg-white rounded-2xl overflow-hidden border border-neutral-200 flex flex-col"
        >
          <div className="aspect-4/3 bg-neutral-100 border-b border-neutral-100 relative overflow-hidden">
            {product.image ? (
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center text-neutral-300">
                  <div className="w-16 h-16 rounded-xl bg-neutral-200 mx-auto mb-2 flex items-center justify-center">
                    <IoShieldCheckmark size={28} className="text-neutral-400" />
                  </div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Quality Tested</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 flex flex-col flex-1">
            <h3 className="text-sm font-semibold text-neutral-800 leading-snug mb-2 flex-1">{product.name}</h3>

            <div className="flex items-end justify-between mt-auto pt-3 border-t border-neutral-100">
              <span className="font-['Barlow_Condensed',sans-serif] font-black text-2xl text-neutral-900">
                ${Number(product.price || 0).toLocaleString()}
              </span>
              <MotionButton
                whileTap={{ scale: 0.95 }}
                onClick={() => onAdd(product)}
                className={`flex items-center gap-1.5 text-[11px] font-black tracking-widest uppercase px-4 py-2 rounded-lg transition-all ${addedIds.includes(product._id)
                  ? 'bg-emerald-500 text-white'
                  : 'bg-neutral-900 hover:bg-amber-400 hover:text-neutral-900 text-white'
                  }`}
              >
                <BiCart size={14} />
                {addedIds.includes(product._id) ? 'Added!' : 'Add'}
              </MotionButton>
            </div>
          </div>
        </MotionDiv>
      ))}
    </MotionDiv>
  );
}

export default function Shop() {
  const { categoryId, subCategoryId } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = (searchParams.get('q') || '').trim();
  const partFilter = (searchParams.get('part') || '').trim();
  const makeFilter = (searchParams.get('make') || '').trim();
  const modelFilter = (searchParams.get('model') || '').trim();
  const yearFilter = (searchParams.get('year') || '').trim();
  const trimFilter = (searchParams.get('trim') || '').trim();
  const { addItem } = useCart();

  const [categories, setCategories] = useState([]);
  const [categoryDetail, setCategoryDetail] = useState(null);
  const [subCategoryProducts, setSubCategoryProducts] = useState([]);
  const [searchProducts, setSearchProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedIds, setAddedIds] = useState([]);

  const hasStructuredFilters = Boolean(partFilter || makeFilter || modelFilter || yearFilter || trimFilter);

  const category = categoryDetail?.category || null;
  const subCategories = categoryDetail?.subCategories || [];
  const categoryProducts = categoryDetail?.products || [];
  const activeSubCategory = subCategories.find((item) => item._id === subCategoryId) || null;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      try {
        if (searchQuery) {
          const { data } = await api.get(`/products?q=${encodeURIComponent(searchQuery)}&limit=100`);
          if (!cancelled) {
            setSearchProducts(data?.data?.products || []);
            setCategories([]);
            setCategoryDetail(null);
            setSubCategoryProducts([]);
          }
          return;
        }

        if (hasStructuredFilters) {
          const params = new URLSearchParams();
          params.set('limit', '100');
          if (partFilter) params.set('category', partFilter);
          if (makeFilter) params.set('subCategory', makeFilter);
          if (modelFilter) params.set('model', modelFilter);
          if (yearFilter) params.set('year', yearFilter);
          if (trimFilter) params.set('trim', trimFilter);

          const { data } = await api.get(`/products?${params.toString()}`);
          if (!cancelled) {
            setSearchProducts(data?.data?.products || []);
            setCategories([]);
            setCategoryDetail(null);
            setSubCategoryProducts([]);
          }
          return;
        }

        if (!categoryId) {
          const { data } = await api.get('/categories');
          if (!cancelled) {
            setCategories(Array.isArray(data.data) ? data.data : []);
            setCategoryDetail(null);
            setSubCategoryProducts([]);
            setSearchProducts([]);
          }
          return;
        }

        const detailRequest = api.get(`/categories/${categoryId}`);
        const subProductsRequest = subCategoryId
          ? api.get(`/products?subCategory=${subCategoryId}&limit=100`)
          : Promise.resolve(null);

        const [detailRes, subProductsRes] = await Promise.all([detailRequest, subProductsRequest]);
        if (cancelled) return;

        setCategoryDetail(detailRes.data?.data || null);
        setSubCategoryProducts(subProductsRes?.data?.data?.products || []);
        setSearchProducts([]);
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Unable to load catalog data right now.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [
    categoryId,
    subCategoryId,
    searchQuery,
    hasStructuredFilters,
    partFilter,
    makeFilter,
    modelFilter,
    yearFilter,
    trimFilter,
  ]);

  const heroContent = useMemo(() => {
    if (!categoryId) {
      if (searchQuery) {
        return {
          title: <>Search <span className="text-amber-400">Results</span></>,
          subtitle: `Showing parts matching "${searchQuery}".`
        };
      }
      if (hasStructuredFilters) {
        return {
          title: <>Filtered <span className="text-amber-400">Results</span></>,
          subtitle: 'Showing products matching your selected Part, Make, Model, Year, and Trim filters.'
        };
      }
      return {
        title: <>Shop <span className="text-amber-400">Categories</span></>,
        subtitle: 'Pick a category to browse available sub-categories and inventory curated for your vehicle needs.'
      };
    }

    if (subCategoryId && activeSubCategory) {
      return {
        title: <><span className="text-amber-400">{activeSubCategory.name}</span> Parts</>,
        subtitle: `Browse inventory listed under ${activeSubCategory.name}.`
      };
    }

    return {
      title: <>{category?.title || 'Category'} <span className="text-amber-400">Parts</span></>,
      subtitle: 'Choose a sub-category or browse all products available in this category.'
    };
  }, [categoryId, subCategoryId, activeSubCategory, category, searchQuery, hasStructuredFilters]);

  const handleAdd = async (product) => {
    await addItem(product, 1);
    setAddedIds((prev) => [...prev, product._id]);
    window.setTimeout(() => {
      setAddedIds((prev) => prev.filter((id) => id !== product._id));
    }, 1200);
  };

  return (
    <div className="font-['Barlow',sans-serif]">
      <Hero title={heroContent.title} subtitle={heroContent.subtitle} />

      <section className="bg-neutral-50 py-10 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-7">
          <Reveal>
            <Breadcrumbs category={category} subCategory={activeSubCategory} />
          </Reveal>

          {loading ? (
            <div className="bg-white border border-neutral-200 rounded-2xl p-10 text-center text-neutral-400">
              Loading catalog...
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-5 text-sm font-semibold">
              {error}
            </div>
          ) : (searchQuery || hasStructuredFilters) ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-3xl uppercase text-neutral-900">
                  Matching Products
                </h2>
                <Link
                  to="/shop"
                  className="text-[11px] font-black tracking-widest uppercase text-neutral-500 hover:text-amber-500 transition-colors"
                >
                  Clear Search
                </Link>
              </div>
              <ProductGrid products={searchProducts} addedIds={addedIds} onAdd={handleAdd} />
            </div>
          ) : !categoryId ? (
            <MotionDiv
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
            >
              {categories.map((item) => (
                <MotionDiv key={item._id} variants={staggerItem}>
                  <Link
                    to={`/shop/category/${item._id}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-neutral-200 flex flex-col hover:border-amber-300 transition-colors"
                  >
                    <div className="aspect-4/3 bg-neutral-100 overflow-hidden relative">
                      <img
                        src={item.image || FALLBACK_IMAGE}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/35 via-black/5 to-transparent" />
                    </div>
                    <div className="p-4 flex items-center justify-between gap-3">
                      <h3 className="font-['Barlow_Condensed',sans-serif] font-black text-2xl uppercase text-neutral-900">
                        {item.title}
                      </h3>
                      <span className="text-[11px] font-black tracking-widest uppercase text-amber-500">View</span>
                    </div>
                  </Link>
                </MotionDiv>
              ))}
            </MotionDiv>
          ) : (
            <div className="space-y-8">
              <div className="bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6">
                <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-3xl uppercase text-neutral-900 mb-4">
                  Sub Categories
                </h2>
                {subCategories.length === 0 ? (
                  <p className="text-sm text-neutral-500">No sub-categories available for this category yet.</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {subCategories.map((item) => {
                      const isActive = subCategoryId === item._id;
                      return (
                        <Link
                          key={item._id}
                          to={`/shop/category/${categoryId}/subcategory/${item._id}`}
                          className={`rounded-xl border text-center px-4 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${isActive
                            ? 'bg-amber-400 border-amber-400 text-neutral-900'
                            : 'border-neutral-300 text-neutral-700 hover:border-amber-400 hover:text-amber-600'
                            }`}
                        >
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-['Barlow_Condensed',sans-serif] font-black text-3xl uppercase text-neutral-900">
                    {subCategoryId && activeSubCategory ? `${activeSubCategory.name} Products` : `${category?.title || 'Category'} Products`}
                  </h2>
                  {subCategoryId && (
                    <Link
                      to={`/shop/category/${categoryId}`}
                      className="text-[11px] font-black tracking-widest uppercase text-neutral-500 hover:text-amber-500 transition-colors"
                    >
                      View All in Category
                    </Link>
                  )}
                </div>
                <ProductGrid
                  products={subCategoryId ? subCategoryProducts : categoryProducts}
                  addedIds={addedIds}
                  onAdd={handleAdd}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
