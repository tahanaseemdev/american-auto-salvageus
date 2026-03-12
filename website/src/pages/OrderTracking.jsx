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

