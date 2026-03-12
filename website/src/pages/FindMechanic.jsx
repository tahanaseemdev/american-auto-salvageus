import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  BiSearch, BiStar, BiMapPin, BiPhone, BiEnvelope, BiTime, BiCheck, BiFilter
} from 'react-icons/bi';
import { FaWrench, FaTools, FaCar, FaCertificate } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };
const staggerItem = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

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

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <BiStar key={i} size={13}
          className={i <= Math.round(rating) ? 'text-amber-400' : 'text-neutral-200'}
          style={{ fill: i <= Math.round(rating) ? '#FCD34D' : 'none' }} />
      ))}
    </div>
  );
}

const MECHANICS = [
  {
    id: 1, name: 'AutoFix Pro', location: 'Newark, NJ', distance: '0.8 mi',
    specialties: ['Engine Repair', 'Transmission', 'Electrical'],
    rating: 4.9, reviews: 142, certified: true, years: 15,
    phone: '(973) 555-0191', hours: 'Mon–Sat 8AM–6PM',
    bio: 'Full-service repair shop with factory-trained technicians. ASE certified, specializing in import and domestic vehicles.',
  },
  {
    id: 2, name: 'Garcia\'s Garage', location: 'Hoboken, NJ', distance: '1.4 mi',
    specialties: ['Body Work', 'Paint', 'Frame Repair'],
    rating: 4.7, reviews: 89, certified: true, years: 22,
    phone: '(201) 555-0274', hours: 'Mon–Fri 7AM–5PM',
    bio: 'Family-owned collision specialist for over two decades. Insurance-approved, same-day estimates.',
  },
  {
    id: 3, name: 'Precision Motor Works', location: 'Jersey City, NJ', distance: '2.1 mi',
    specialties: ['European Cars', 'Diagnostics', 'Performance'],
    rating: 4.8, reviews: 211, certified: true, years: 11,
    phone: '(551) 555-0340', hours: 'Mon–Sat 9AM–7PM',
    bio: 'Specialists in BMW, Audi, and Mercedes. Advanced diagnostics, performance upgrades, and restoration.',
  },
  {
    id: 4, name: 'Quik Lube & Auto', location: 'Bayonne, NJ', distance: '2.9 mi',
    specialties: ['Oil Change', 'Brakes', 'Tires', 'Suspension'],
    rating: 4.5, reviews: 67, certified: false, years: 8,
    phone: '(201) 555-0512', hours: 'Mon–Sun 8AM–8PM',
    bio: 'No appointment needed. Fast, affordable preventive maintenance and brake/tire services.',
  },
  {
    id: 5, name: 'Ramos Auto Electric', location: 'Elizabeth, NJ', distance: '4.2 mi',
    specialties: ['Electrical', 'Alternators', 'Starters', 'A/C'],
    rating: 4.9, reviews: 95, certified: true, years: 18,
    phone: '(908) 555-0627', hours: 'Mon–Fri 8AM–5PM',
    bio: 'Dedicated auto electrical shop. Starters, alternators, wiring, and full A/C system repair.',
  },
  {
    id: 6, name: 'Tire Kingdom Plus', location: 'Union City, NJ', distance: '3.7 mi',
    specialties: ['Tires', 'Alignment', 'Suspension', 'Brakes'],
    rating: 4.6, reviews: 133, certified: true, years: 13,
    phone: '(551) 555-0789', hours: 'Mon–Sat 8AM–7PM',
    bio: 'Full tire service from mounting to alignment. Nationwide warranty on all tires. Quick turnaround.',
  },
];

const SPECIALTIES = ['All', 'Engine Repair', 'Transmission', 'Body Work', 'Electrical', 'Tires', 'Brakes', 'Suspension', 'Diagnostics', 'Performance', 'A/C'];

export default function FindMechanic() {

  return (
    <div>FindMechanic</div>
  );
}

