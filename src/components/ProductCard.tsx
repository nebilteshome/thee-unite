import React from 'react';
import { motion } from 'motion/react';

interface ProductCardProps {
  name: string;
  price: string;
  image: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ name, price, image }) => {
  return (
    <div className="group flex flex-col items-center">
      <div className="w-full aspect-square overflow-hidden bg-[#111] border border-white/5 mb-4 relative">
        <motion.img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700"
          whileHover={{ scale: 1.05 }}
          loading="lazy"
        />
      </div>
      <div className="text-center space-y-1">
        <h3 className="font-medium text-[10px] md:text-xs tracking-[0.2em] uppercase text-white/90">
          {name}
        </h3>
        <p className="font-tech text-[8px] md:text-[10px] tracking-widest text-white/40 italic">
          {price}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
