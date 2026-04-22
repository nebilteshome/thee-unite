import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import { cartStore } from '../../lib/cart';

interface FloatingCartProps {
  itemCount: number;
  onClick: () => void;
}

const FloatingCart: React.FC<FloatingCartProps> = ({ itemCount, onClick }) => {
  if (itemCount === 0) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-8 right-8 z-[150] bg-accent text-black p-6 rounded-full shadow-2xl flex items-center gap-4 group"
    >
      <div className="relative">
        <ShoppingBag size={24} />
        <span className="absolute -top-2 -right-2 bg-black text-accent text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
          {itemCount}
        </span>
      </div>
      <span className="max-w-0 overflow-hidden group-hover:max-w-[100px] transition-all duration-500 font-black uppercase text-xs tracking-widest whitespace-nowrap">
        View_Bag
      </span>
    </motion.button>
  );
};

export default FloatingCart;
