import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BiCart, BiTrash, BiPlus, BiMinus, BiArrowBack, BiLock } from 'react-icons/bi';
import { FaTruck, FaTag } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { IoShieldCheckmark } from "react-icons/io5";


const INITIAL_ITEMS = [
  { id: 1, name: 'Complete Engine Assembly — 2.4L Inline-4', qty: 1, price: 1249, miles: '54K mi' },
  { id: 2, name: 'Alternator — 130 Amp', qty: 2, price: 95, miles: '61K mi' },
  { id: 3, name: 'Power Steering Pump', qty: 1, price: 85, miles: '59K mi' },
];

export default function Cart() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const updateQty = (id, delta) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, qty: Math.max(1, item.qty + delta) }
          : item
      )
    );
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal > 500 ? 0 : 29;
  const total = subtotal - discount + shipping;

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'SAVE10') {
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code.');
      setCouponApplied(false);
    }
  };

  return (
    <div>Cart</div>
  );
}

