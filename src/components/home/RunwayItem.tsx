import React, { useState } from 'react';
import { Product } from '../../data/products';
import HoverVideo from './HoverVideo';

interface RunwayItemProps {
  product: Product;
  index: number;
  onAddToCart: (product: Product) => void;
}

const RunwayItem: React.FC<RunwayItemProps> = ({ product, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="flex-shrink-0 w-[100px] md:w-[120px] cursor-pointer group mb-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onAddToCart(product)}
      style={{ willChange: 'transform' }}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900 border border-white/5 shadow-lg rounded-lg">
        <img 
          src={product.image} 
          alt={product.name}
          className={`w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
        />
        {product.video && (
          <HoverVideo src={product.video} poster={product.image} isHovered={isHovered} />
        )}
        
        {/* Instant Add Hotspot Indicator */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-75">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-black">
            <span className="text-lg font-black">+</span>
          </div>
        </div>
      </div>

      <div className="mt-3 px-1">
        <h3 className="text-[10px] md:text-[12px] font-bold uppercase truncate tracking-tight text-white/80 group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <p className="text-[9px] font-tech text-white/40 italic">
          ${product.price}
        </p>
      </div>
    </div>
  );
};

export default RunwayItem;
