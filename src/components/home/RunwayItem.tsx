import React, { useState, useEffect } from 'react';
import { Product } from '../../data/products';
import HoverVideo from './HoverVideo';
import { useNavigate } from 'react-router-dom';

interface RunwayItemProps {
  product: Product;
  index: number;
  onAddToCart: (product: Product) => void;
}

const RunwayItem: React.FC<RunwayItemProps> = ({ product, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  if (!product) return null;

  const firstImage = product.images?.[0] || product.image || '';
  const secondImage = product.images?.[1];
  const videoSrc = product.video;

  const handleCardClick = () => {
    navigate(`/shop?id=${product.id}`);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <div 
      className="w-full cursor-pointer group mb-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="relative aspect-square overflow-hidden bg-neutral-900 border border-white/5">
        {/* First Image */}
        <img 
          src={firstImage} 
          alt={product.name}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${isHovered && (secondImage || videoSrc) ? 'opacity-0' : 'opacity-100'}`}
          onError={(e) => {
            console.error(`Failed to load image for ${product.name}:`, firstImage);
            (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
          }}
        />

        {/* Second Image on Hover */}
        {secondImage && (
          <img 
            src={secondImage} 
            alt={`${product.name} hover`}
            loading="lazy"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          />
        )}
        
        {/* Video on Hover (only if no second image) */}
        {!secondImage && videoSrc && (
          <HoverVideo 
            src={videoSrc} 
            poster={firstImage} 
            isHovered={isHovered} 
          />
        )}
        
        {/* Quick Add Button */}
        <div 
          onClick={handleQuickAdd}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 hover:scale-90 z-10"
        >
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-black shadow-xl">
            <span className="text-lg font-black">+</span>
          </div>
        </div>
      </div>

      <div className="mt-2 px-1">
        <h3 className="text-[11px] font-medium uppercase truncate tracking-tight text-white/80 group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <p className="text-[10px] opacity-70 italic">
          ${product.price}
        </p>
      </div>
    </div>
  );
};

export default RunwayItem;
