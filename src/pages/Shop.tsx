import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, getDocs, limit, query } from 'firebase/firestore';
import { useSearchParams, Link } from 'react-router-dom';
import { cartStore } from '../lib/cart';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  images: string[];
  image?: string; // fallback
  sizes: string[];
  colors: string[];
}

export default function Shop() {
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (productId) {
          const docRef = doc(db, 'products', productId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = { id: docSnap.id, ...docSnap.data() } as Product;
            setProduct(data);
            if (data.sizes?.length) setSelectedSize(data.sizes[0]);
            if (data.colors?.length) setSelectedColor(data.colors[0]);
          }
        } else {
          const q = query(collection(db, 'products'), limit(1));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const first = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Product;
            setProduct(first);
            if (first.sizes?.length) setSelectedSize(first.sizes[0]);
            if (first.colors?.length) setSelectedColor(first.colors[0]);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    const images = product.images || [product.image];
    cartStore.addItem({
      id: `${product.id}-${selectedSize}-${selectedColor}`,
      name: product.name,
      price: product.price,
      image: images[0] || '',
      size: selectedSize,
      color: selectedColor,
      quantity: 1
    });
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center font-tech text-accent">SYNCHRONIZING_PRODUCT...</div>;

  if (!product) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-4xl font-black uppercase italic mb-8">PRODUCT_NOT_FOUND</h2>
        <Link to="/collection" className="text-accent underline underline-offset-8">RETURN_TO_DOMAIN</Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [product.image || ''];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto min-h-screen">
      <Link to="/collection" className="inline-flex items-center gap-2 text-[10px] font-tech text-white/40 hover:text-accent uppercase tracking-widest mb-12 transition-colors">
        <ArrowLeft size={14} /> Back_To_Collection
      </Link>

      <div className="flex flex-col lg:flex-row gap-20">
        {/* Product Images */}
        <div className="w-full lg:w-3/5 space-y-6">
          <div className="aspect-[4/5] bg-surface relative overflow-hidden group border border-white/5 accent-glow">
            <AnimatePresence mode="wait">
              <motion.img 
                key={activeImageIndex}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5 }}
                src={images[activeImageIndex]} 
                alt={product.name} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>
            
            {images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setActiveImageIndex((i) => (i > 0 ? i - 1 : images.length - 1))}
                  className="p-4 bg-black/40 backdrop-blur-md text-white hover:text-accent transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <button 
                  onClick={() => setActiveImageIndex((i) => (i < images.length - 1 ? i + 1 : 0))}
                  className="p-4 bg-black/40 backdrop-blur-md text-white hover:text-accent transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            )}

            <div className="absolute top-8 left-8">
              <span className="bg-accent text-black px-4 py-2 text-xs font-black uppercase italic tracking-widest">
                {product.category}_SERIES
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImageIndex(i)}
                  className={`aspect-square border-2 overflow-hidden transition-all ${activeImageIndex === i ? 'border-accent grayscale-0' : 'border-white/5 grayscale hover:grayscale-0 hover:border-white/20'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="w-full lg:w-2/5 space-y-12">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <span className="font-tech text-xs tracking-[0.4em] text-accent font-black italic">MANIFEST_ID: {product.id.slice(0, 8)}</span>
              <div className="h-px w-12 bg-accent/20" />
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.8] mb-6">
              {product.name}
            </h1>
            <p className="text-4xl font-black text-accent italic">${product.price}</p>
          </div>

          <div className="space-y-10">
            {/* Color Select */}
            {product.colors?.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="font-tech text-[10px] tracking-[0.4em] uppercase text-white/40">Select_Color</span>
                  <span className="text-xs font-black uppercase text-accent italic">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {product.colors.map(color => (
                    <button 
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-6 py-3 border font-black uppercase text-xs transition-all ${selectedColor === color ? 'bg-white text-black border-white' : 'border-white/10 hover:border-white/30 text-white/60'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Select */}
            {product.sizes?.length > 0 && (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="font-tech text-[10px] tracking-[0.4em] uppercase text-white/40">Select_Size</span>
                  <button className="text-[10px] font-black uppercase text-white/20 hover:text-accent underline decoration-accent/30">Size_Guide</button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {product.sizes.map(size => (
                    <button 
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-4 font-black transition-all border ${selectedSize === size ? 'bg-accent text-black border-accent' : 'bg-black text-white border-white/10 hover:border-white/40'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-4 pt-4">
              <button 
                onClick={handleAddToCart}
                className="w-full bg-accent text-black py-6 font-black uppercase text-sm tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-white transition-all transform hover:-translate-y-1 active:scale-95"
              >
                ADD_TO_BAG <Plus size={18} />
              </button>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-white/5 bg-surface text-center">
                  <span className="font-tech text-[9px] tracking-widest uppercase text-white/20 block mb-1">Shipping</span>
                  <span className="text-[10px] font-black uppercase tracking-tighter italic">World_Wide</span>
                </div>
                <div className="p-4 border border-white/5 bg-surface text-center">
                  <span className="font-tech text-[9px] tracking-widest uppercase text-white/20 block mb-1">Authenticity</span>
                  <span className="text-[10px] font-black uppercase tracking-tighter italic">Greater_Domain</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/10">
            <p className="text-white/60 text-lg italic leading-relaxed font-medium">
              {product.description || 'Every soul that dares to dream requires armor that reflects its frequency. A manifestation of street grit and soulful vision.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
