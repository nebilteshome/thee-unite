import React, { useState, useEffect } from 'react';
import { fetchProducts, Product } from '../data/products';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import HoverVideo from '../components/home/HoverVideo';

export default function Collection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        console.log("Collection products fetched:", data);
        setProducts(data);
      } catch (error) {
        console.error("Error loading collection products:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-accent font-tech">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-[10px] tracking-[0.5em] uppercase">SYNCHRONIZING_COLLECTION...</p>
      </div>
    );
  }

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-24">
        <div className="relative">
          <span className="font-tech text-xs tracking-[0.3em] text-accent uppercase mb-4 block underline underline-offset-8 decoration-accent/30">DROP 001_SERIES</span>
          <h2 className="text-8xl font-black uppercase leading-none tracking-tighter italic">SHOP</h2>
        </div>
        <Link to="/new" className="text-xs font-black tracking-[0.3em] uppercase py-4 px-8 border border-accent text-accent hover:bg-accent hover:text-black transition-all">
          VIEW LATEST RELEASE
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-2">
        {products.length === 0 ? (
          <div className="col-span-full py-20 text-center border border-dashed border-white/10 text-white/20 font-tech text-xs uppercase">
            No products detected in core repository
          </div>
        ) : (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);
  const imageSrc = product.images?.[0] || product.image || '';
  const videoSrc = product.video;

  return (
    <Link 
      to={`/shop?id=${product.id}`} 
      className="group cursor-pointer block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-surface border border-white/5 mb-1 transition-transform duration-300 group-hover:scale-[1.03] ease-out">
        <img 
          src={imageSrc} 
          loading="lazy"
          className={`w-full h-full object-cover transition-opacity duration-700 ${isHovered && videoSrc ? 'opacity-0' : 'opacity-100'}`} 
          referrerPolicy="no-referrer" 
          onError={(e) => {
            console.error(`Failed to load image for ${product.name}:`, imageSrc);
          }}
        />
        
        {videoSrc && (
          <HoverVideo 
            src={videoSrc} 
            poster={imageSrc} 
            isHovered={isHovered} 
          />
        )}
      </div>
      <div className="flex flex-col px-1">
        <h3 className="font-medium text-[11px] tracking-tight uppercase group-hover:text-accent transition-colors duration-300 truncate">{product.name}</h3>
        <span className="font-sans text-[10px] text-white/70 italic">${product.price}</span>
      </div>
    </Link>
  );
}
