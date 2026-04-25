import React, { useState, useEffect, useRef } from 'react';
import { fetchProducts, Product } from '../../data/products';
import RunwayItem from './RunwayItem';
import FloatingCart from './FloatingCart';
import { cartStore } from '../../lib/cart';
import gsap from 'gsap';
import { Loader2 } from 'lucide-react';

interface RunwayProductsProps {
  products?: Product[];
  loading?: boolean;
  showCart?: boolean;
}

const RunwayProducts: React.FC<RunwayProductsProps> = ({ 
  products: initialProducts, 
  loading: initialLoading = false,
  showCart = true 
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(initialLoading && !initialProducts);
  const [cartCount, setCartCount] = useState(cartStore.items.length);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
      setLoading(false);
      return;
    }

    const loadProducts = async () => {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
      setLoading(false);
    };
    loadProducts();
  }, [initialProducts]);

  useEffect(() => {
    const unsubscribe = cartStore.subscribe(() => {
      setCartCount(cartStore.items.reduce((acc, item) => acc + item.quantity, 0));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!loading && rowRef.current && products.length > 0) {
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
  }, [loading, products.length]);

  const handleAddToCart = (product: Product) => {
    cartStore.addItem({
      id: `${product.id}-OS-DEFAULT`,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || product.image || '',
      size: 'OS',
      color: 'DEFAULT',
      quantity: 1
    }, false); // Set openCart to false
  };

  const handleOpenCart = () => {
    cartStore.setIsOpen(true);
  };

  if (loading) {
    return (
      <div className="relative bg-black py-20 flex flex-col items-center justify-center text-accent font-tech">
        <Loader2 className="animate-spin mb-4" size={24} />
        <p className="text-[10px] tracking-[0.5em] uppercase">INITIALIZING_RUNWAY...</p>
      </div>
    );
  }

  return (
    <div className="relative bg-black py-10 overflow-hidden min-h-[400px]">
      {products.length === 0 ? (
        <div className="flex items-center justify-center h-40 border border-dashed border-white/10 mx-8 rounded-2xl text-white/20 font-tech text-[10px] uppercase tracking-widest">
          No items manifested in core catalog
        </div>
      ) : (
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
      )}

      {showCart && <FloatingCart itemCount={cartCount} onClick={handleOpenCart} />}
    </div>
  );
};

export default RunwayProducts;
