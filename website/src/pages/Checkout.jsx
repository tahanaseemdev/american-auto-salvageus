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
