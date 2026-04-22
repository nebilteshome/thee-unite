import React, { useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const products = [
  {
    id: 1,
    name: "BLACK ESSENTIAL HOODIE",
    price: "$120",
    image: "/images/product1.jpg"
  },
  {
    id: 2,
    name: "OVERSIZED TEE",
    price: "$80",
    image: "/images/product2.jpg"
  },
  {
    id: 3,
    name: "CARGO PANTS",
    price: "$150",
    image: "/images/product3.jpg"
  }
];

const ProductSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const cards = containerRef.current.children;
    
    gsap.fromTo(cards, 
      { 
        opacity: 0, 
        y: 50 
      }, 
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        }
      }
    );
  }, []);

  return (
    <section ref={sectionRef} className="py-24 px-4 md:px-8 bg-black overflow-hidden flex justify-center">
      <div 
        ref={containerRef}
        className="grid grid-cols-5 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-8 gap-x-4 md:gap-x-8 gap-y-12 w-full max-w-screen-2xl mx-auto items-start"
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={product.price}
            image={product.image}
          />
        ))}
      </div>
    </section>
  );
};

export default ProductSection;
