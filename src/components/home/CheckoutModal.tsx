import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, ArrowUpRight } from 'lucide-react';
import { Product } from '../../data/products';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onFinalize: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, product, onFinalize }) => {
  return (
    <AnimatePresence>
      {isOpen && product && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[200]"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 w-full bg-neutral-900 border-t border-white/10 z-[201] p-8 md:p-12 rounded-t-[3rem]"
          >
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h3 className="font-tech text-xs tracking-[0.4em] uppercase text-accent mb-2">INSTANT_MANIFEST</h3>
                  <p className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Review Order</p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-4 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={32} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="flex gap-8 items-center">
                  <div className="w-32 md:w-48 aspect-[3/4] bg-black overflow-hidden border border-white/5">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-2xl md:text-4xl font-black uppercase italic mb-2 tracking-tighter">{product.name}</h4>
                    <p className="text-xl font-tech text-accent font-black">${product.price}</p>
                    <div className="mt-4 flex gap-4 text-[10px] font-tech uppercase tracking-widest text-white/40">
                      <span>QTY: 1</span>
                      <span className="w-px h-4 bg-white/10" />
                      <span>SIZE: OS</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-black/50 border border-white/5 rounded-2xl">
                    <div className="flex justify-between items-end mb-4 text-white/40 font-tech text-[10px] uppercase tracking-widest">
                      <span>Subtotal</span>
                      <span className="text-white font-black italic text-lg">${product.price}</span>
                    </div>
                    <div className="flex justify-between items-end text-white/40 font-tech text-[10px] uppercase tracking-widest">
                      <span>Logistics</span>
                      <span className="text-white font-black italic text-lg">Calculated at Core</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={onFinalize}
                    className="w-full bg-accent text-black py-6 rounded-full font-black uppercase text-sm tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-white transition-all transform hover:-translate-y-1"
                  >
                    FINALIZE_MANIFEST <ArrowUpRight size={18} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;
