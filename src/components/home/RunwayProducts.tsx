import React, { useState, useEffect, useRef } from 'react';
import { products, Product } from '../../data/products';
import RunwayItem from './RunwayItem';
import FloatingCart from './FloatingCart';
import CheckoutModal from './CheckoutModal';
import { cartStore } from '../../lib/cart';
import gsap from 'gsap';

const RunwayProducts: React.FC = () => {
  const [cartCount, setCartCount] = useState(cartStore.items.length);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = cartStore.subscribe(() => {
      setCartCount(cartStore.items.reduce((acc, item) => acc + item.quantity, 0));
    });

    if (rowRef.current) {
      gsap.fromTo(rowRef.current,
        { opacity: 0, x: 50 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 1.2, 
          ease: "power3.out",
          scrollTrigger: {
            trigger: rowRef.current,
            start: "top 90%",
          }
        }
      );
    }

    return unsubscribe;
  }, []);

  const handleAddToCart = (product: Product) => {
    cartStore.addItem({
      id: `${product.id}-OS-DEFAULT`,
      name: product.name,
      price: product.price,
      image: product.image,
      size: 'OS',
      color: 'DEFAULT',
      quantity: 1
    });
    setSelectedProduct(product);
    setIsCheckoutOpen(true);
  };

  const handleOpenCart = () => {
    cartStore.setIsOpen(true);
  };

  return (
    <div className="relative bg-black py-10 overflow-hidden">
      <div 
        ref={rowRef}
        className="flex flex-row overflow-x-auto overflow-y-hidden scrollbar-hide px-8 gap-4 scroll-smooth"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {products.map((product, index) => (
          <RunwayItem 
            key={product.id} 
            product={product} 
            index={index} 
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      <FloatingCart itemCount={cartCount} onClick={handleOpenCart} />
      
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)}
        product={selectedProduct}
        onFinalize={() => {
          setIsCheckoutOpen(false);
          cartStore.setIsOpen(true);
        }}
      />
    </div>
  );
};

export default RunwayProducts;
