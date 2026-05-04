import React, { useState, useEffect } from 'react';
import { fetchProducts, Product } from '../data/products';
import { Link } from 'react-router-dom';
import { Loader2, ArrowUpRight } from 'lucide-react';
import HoverVideo from '../components/home/HoverVideo';
import { motion } from 'motion/react';

export default function NewProduct() {
  const [latestProduct, setLatestProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const data = await fetchProducts();
        if (data.length > 0) {
          // Sort by createdAt DESC
          const sorted = [...data].sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setLatestProduct(sorted[0]);
        }
      } catch (error) {
        console.error("Error loading latest product:", error);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-accent font-tech bg-black">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-[10px] tracking-[0.5em] uppercase">SYNCHRONIZING_NEW_ENTRY...</p>
      </div>
    );
  }

  if (!latestProduct) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white/20 font-tech bg-black">
        <p className="text-[10px] tracking-[0.5em] uppercase italic">NO_NEW_ENTRY_DETECTED</p>
        <Link to="/collection" className="mt-8 text-accent underline text-xs tracking-widest">ENTER_COLLECTION</Link>
      </div>
    );
  }

  const imageSrc = latestProduct.images?.[0] || latestProduct.image || '';
  const videoSrc = latestProduct.video;

  return (
    <section className="min-h-screen pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center bg-black">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
      >
        {/* Visual Content */}
        <div className="relative aspect-[3/4] overflow-hidden bg-surface border border-white/5 accent-glow">
          <img 
            src={imageSrc} 
            className="w-full h-full object-cover" 
            alt={latestProduct.name}
          />
          {videoSrc && (
            <div className="absolute inset-0">
               <video 
                src={videoSrc} 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="absolute top-8 left-8 z-10">
            <span className="bg-accent text-black px-4 py-2 text-[10px] font-black tracking-widest uppercase italic">LATEST_RELEASE</span>
          </div>
        </div>

        {/* Info Content */}
        <div className="flex flex-col gap-8 lg:pl-12">
          <div className="space-y-4">
            <span className="font-tech text-xs tracking-[0.3em] text-accent uppercase block underline underline-offset-8 decoration-accent/30">
              NEW_MANIFESTATION
            </span>
            <h2 className="text-8xl font-black uppercase leading-none tracking-tighter italic">
              {latestProduct.name}
            </h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-end gap-4">
              <span className="text-6xl font-black text-accent italic leading-none">${latestProduct.price}</span>
              <span className="text-[10px] font-tech text-white/30 uppercase tracking-widest mb-1">Currency: USD</span>
            </div>
            
            <p className="text-white/40 italic text-lg leading-relaxed max-w-md">
              {latestProduct.description || "The newest manifestation in our technical clothing series. Reconstructing reality through high-frequency streetwear."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link 
                to={`/shop?id=${latestProduct.id}`} 
                className="group bg-accent text-black px-12 py-6 font-black uppercase text-sm tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-white transition-all transform hover:-translate-y-1"
              >
                VIEW_DETAILS <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Link>
              <Link 
                to="/collection" 
                className="bg-white/5 border border-white/10 text-white px-12 py-6 font-black uppercase text-sm tracking-[0.3em] flex items-center justify-center gap-4 hover:bg-white/10 transition-all"
              >
                COLLECTION_CORE
              </Link>
            </div>
          </div>

          <div className="mt-12 pt-12 border-t border-white/10">
            <div className="grid grid-cols-2 gap-8 text-[10px] font-tech text-white/30 uppercase tracking-[0.3em]">
              <div>
                <span className="block mb-2 text-white/10">Series</span>
                <span className="text-white">SERIES_01</span>
              </div>
              <div>
                <span className="block mb-2 text-white/10">Availability</span>
                <span className="text-accent">NOW_ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
