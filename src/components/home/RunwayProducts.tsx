import React, { useState, useEffect } from 'react';
import { products, Product } from '../../data/products';
import RunwayItem from './RunwayItem';
import FloatingCart from './FloatingCart';
import CheckoutModal from './CheckoutModal';
import { cartStore } from '../../lib/cart';

const RunwayProducts: React.FC = () => {
  const [cartCount, setCartCount] = useState(cartStore.items.length);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    const unsubscribe = cartStore.subscribe(() => {
      setCartCount(cartStore.items.reduce((acc, item) => acc + item.quantity, 0));
    });
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
    <div className="relative bg-black pt-20">
      <div className="max-w-7xl mx-auto">
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
