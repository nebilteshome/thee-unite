import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  images?: string[];
  image?: string;
}

export default function Collection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(data);
      } catch (e) {
        console.error("Error fetching products:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center font-tech text-accent">FETCHING_CATALOG...</div>;

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-24">
        <div className="relative">
          <span className="font-tech text-xs tracking-[0.3em] text-accent uppercase mb-4 block underline underline-offset-8 decoration-accent/30">DROP 001_SERIES</span>
          <h2 className="text-8xl font-black uppercase leading-none tracking-tighter italic">COLLECTION</h2>
        </div>
        <Link to="/shop" className="text-xs font-black tracking-[0.3em] uppercase py-4 px-8 border border-accent text-accent hover:bg-accent hover:text-black transition-all">
          VIEW FULL SHOP
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.length > 0 ? (
          products.map((product) => (
            <Link to={`/shop?id=${product.id}`} key={product.id} className="group cursor-pointer">
              <div className="relative aspect-[3/4] overflow-hidden bg-surface border border-white/5 mb-6 accent-glow">
                <img 
                  src={(product.images && product.images.length > 0) ? product.images[0] : product.image} 
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                  referrerPolicy="no-referrer" 
                />
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-accent text-black px-3 py-1 text-[8px] font-black tracking-widest uppercase italic">{product.category}</span>
                </div>
              </div>
              <div className="flex justify-between items-start px-2">
                <div>
                  <h3 className="font-black text-xl tracking-tighter uppercase group-hover:text-accent duration-300">{product.name}</h3>
                  <p className="text-white/40 text-[9px] font-tech uppercase tracking-[0.3em]">Available Now</p>
                </div>
                <span className="font-bold text-accent text-lg italic">${product.price}</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-4 text-center py-40 border border-white/5 bg-surface/30">
            <p className="text-white/20 font-black tracking-[0.5em] uppercase italic">NO MANIFESTATIONS FOUND</p>
            <p className="mt-4 text-[10px] font-tech text-accent/50 uppercase">Update administrative core to populate the domain.</p>
          </div>
        )}
      </div>
    </section>
  );
}
