import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Product } from '../../data/products';
import HoverVideo from './HoverVideo';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface RunwayItemProps {
  product: Product;
  index: number;
  onAddToCart: (product: Product) => void;
}

const RunwayItem: React.FC<RunwayItemProps> = ({ product, index, onAddToCart }) => {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isLeft = index % 2 === 0;

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(containerRef.current, 
        { 
          opacity: 0, 
          y: 100, 
          scale: 0.95,
          x: isLeft ? -50 : 50
        },
        {
          opacity: 1, 
          y: 0, 
          scale: 1,
          x: 0,
          duration: 1.5,
          ease: "power3.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            end: "top 50%",
            scrub: 1,
          }
        }
      );
    }
  }, [isLeft]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full min-h-[80vh] flex items-center ${isLeft ? 'justify-start pl-8 md:pl-20' : 'justify-end pr-8 md:pr-20'} mb-20`}
    >
      <div 
        className="relative w-full max-w-[300px] md:max-w-[450px] cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onAddToCart(product)}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-neutral-900 border border-white/5 shadow-2xl">
          <img 
            src={product.image} 
            alt={product.name}
            className={`w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
          />
          {product.video && (
            <HoverVideo src={product.video} poster={product.image} isHovered={isHovered} />
          )}
          
          {/* Instant Add Hotspot Indicator */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-black">
              <span className="text-xl font-black">+</span>
            </div>
          </div>
        </div>

        <div className={`mt-6 ${isLeft ? 'text-left' : 'text-right'}`}>
          <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-2 italic">
            {product.name}
          </h3>
          <p className="text-xl md:text-2xl font-tech text-white/40 italic">
            ${product.price}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RunwayItem;
