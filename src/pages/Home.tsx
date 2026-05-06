import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import RunwayProducts from '../components/home/RunwayProducts';
import { db } from '../lib/firebase';
import { onSnapshot, collection } from 'firebase/firestore';
import { fetchProducts, Product } from '../data/products';
import { Loader2, ChevronRight } from 'lucide-react';

interface HeroSettings {
  title: string;
  tagline: string;
  subtitle: string;
  bgUrl: string;
  bgType: 'image' | 'video';
}

const CharacterReveal = ({ text, className, delay = 0 }: { text: string, className?: string, delay?: number }) => {
  const characters = text.split("");
  return (
    <motion.div 
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: delay
          }
        }
      }}
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.div>
  );
};

const TheeUniteReveal = ({ title, onComplete }: { title: string, onComplete: () => void }) => {
  const isDefaultTitle = title.toUpperCase() === 'THEE UNITE';

  if (isDefaultTitle) {
    return (
      <motion.div
        animate={{
          rotateX: [0, 25, -8, 2, 0],
          y: [0, 8, -2, 0, 0]
        }}
        transition={{
          duration: 1.5,
          times: [0, 0.3, 0.6, 0.8, 1],
          repeat: Infinity,
          repeatDelay: 3.2,
          ease: "easeInOut",
          delay: 4
        }}
        className="flex flex-row items-center justify-center perspective-1000 w-full overflow-visible"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="relative flex flex-row items-center justify-center">
          <div className="relative overflow-visible flex items-center">
            <svg 
              viewBox="0 0 320 150" 
              className="w-[120px] sm:w-[180px] md:w-[240px] h-auto overflow-visible"
            >
              <motion.text
                x="0"
                y="115"
                className="thee-text-home"
                stroke="white"
                strokeWidth="2"
                fill="none"
                initial={{ strokeDasharray: 1000, strokeDashoffset: 1000, opacity: 0 }}
                animate={{ 
                  strokeDashoffset: 0, 
                  opacity: 1,
                  transition: { 
                    strokeDashoffset: { duration: 2.5, ease: "easeInOut" },
                    opacity: { duration: 0.5 }
                  }
                }}
              >
                THEE
              </motion.text>
            </svg>
          </div>

          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            transition={{ 
              delay: 2, 
              duration: 1.2, 
              ease: [0.16, 1, 0.3, 1],
              onComplete: onComplete
            }}
            className="overflow-hidden whitespace-nowrap flex items-center"
          >
            <span className="text-7xl sm:text-9xl md:text-[14vw] font-display font-medium uppercase tracking-tight italic leading-none pr-8 text-accent">
              UNITE
            </span>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.h1 
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], onComplete }}
      className="text-6xl sm:text-8xl md:text-[12vw] font-display font-medium uppercase tracking-tight italic leading-none"
    >
      {title}
    </motion.h1>
  );
};

export default function Home() {
  const defaultHero: HeroSettings = {
    title: 'THEE UNITE',
    tagline: 'EST 2024',
    subtitle: 'FOR EVERY SOUL THAT DARES TO DREAM',
    bgUrl: '/hero-video.mp4',
    bgType: 'video'
  };

  const [mainHero, setMainHero] = useState<HeroSettings>(defaultHero);
  const [activeHero, setActiveHero] = useState<HeroSettings>(defaultHero);
  const [videoCanPlay, setVideoCanPlay] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [groupedProducts, setGroupedProducts] = useState<Record<string, Product[]>>({});
  const [categoryMedia, setCategoryMedia] = useState<Record<string, { url: string, type: 'image' | 'video' }>>({});
  const [loading, setLoading] = useState(true);
  const activeHeroRef = useRef<HeroSettings>(defaultHero);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const prodData = await fetchProducts();
        const grouped = prodData.reduce((acc, product) => {
          const cat = product.category || 'GENERAL';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(product);
          return acc;
        }, {} as Record<string, Product[]>);
        setGroupedProducts(grouped);
      } catch (error) {
        console.error("Error loading products:", error);
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'settings'), (snapshot) => {
      const allSettings = snapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data();
        return acc;
      }, {} as any);
      
      setCategoryMedia(allSettings.categoryMedia || {});

      const mainHeroDoc = allSettings.hero;
      if (mainHeroDoc) {
        const data = mainHeroDoc;
        const newData: HeroSettings = {
          title: data.title || defaultHero.title,
          tagline: data.tagline || defaultHero.tagline,
          subtitle: data.subtitle || defaultHero.subtitle,
          bgUrl: data.backgroundUrl || data.bgUrl || defaultHero.bgUrl,
          bgType: data.backgroundType || data.bgType || defaultHero.bgType
        };
        
        const currentActive = activeHeroRef.current;

        if (newData.bgUrl !== currentActive.bgUrl || newData.bgType !== currentActive.bgType) {
          preloadAsset(newData).then(() => {
            setMainHero(newData);
            setIsTransitioning(true);
            setTimeout(() => {
              setActiveHero(newData);
              activeHeroRef.current = newData;
              setIsTransitioning(false);
            }, 1000);
          });
        } else {
          setMainHero(newData);
          setActiveHero(newData);
          activeHeroRef.current = newData;
        }
      }
      
      setLoading(false);
    }, (error) => {
      console.error("Settings sync error:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const preloadAsset = (settings: HeroSettings): Promise<void> => {
    return new Promise((resolve) => {
      if (settings.bgType === 'video') {
        const video = document.createElement('video');
        video.src = settings.bgUrl;
        video.oncanplaythrough = () => resolve();
        video.onerror = () => resolve();
      } else {
        const img = new Image();
        img.src = settings.bgUrl;
        img.onload = () => resolve();
        img.onerror = () => resolve();
      }
    });
  };

  const categories = Object.keys(groupedProducts).sort((a, b) => {
    if (a.toUpperCase() === 'PREMIUM') return -1;
    if (b.toUpperCase() === 'PREMIUM') return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="bg-black text-white min-h-screen">
      <style>{`
        .category-media { width: 100%; height: 70vh; margin: 0; overflow: hidden; }
        .category-media img, .category-media video { width: 100%; height: 100%; object-fit: cover; }
      `}</style>

      {/* Main Hero Section */}
      <section className="h-screen relative overflow-hidden flex items-center justify-center bg-black w-full">
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeHero.bgUrl + activeHero.bgType}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 w-full h-full"
            >
              {activeHero.bgType === 'video' ? (
                <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover brightness-[0.7]" src={activeHero.bgUrl} />
              ) : (
                <img src={activeHero.bgUrl} className="absolute inset-0 w-full h-full object-cover brightness-[0.8]" alt="Hero" />
              )}
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/30 z-20" />
        </div>

        <div className="relative z-30 text-center px-6 w-full h-full flex flex-col justify-end pb-32">
          <div className="max-w-4xl mx-auto w-full">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-tech text-xs tracking-[0.4em] uppercase text-white mb-4"
            >
              {mainHero.tagline}
            </motion.p>

            <div className="mb-8">
              <TheeUniteReveal title={mainHero.title} onComplete={() => setVideoCanPlay(true)} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-row items-center justify-center gap-4"
            >
              <Link to="/collection" className="min-w-[160px] py-4 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] hover:bg-accent transition-colors">Shop Now</Link>
              <Link to="/gallery" className="min-w-[160px] py-4 border border-white/30 backdrop-blur-md text-white font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 transition-colors">The Story</Link>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="w-1 h-12 bg-gradient-to-b from-white to-transparent opacity-20" />
          </motion.div>
        </div>
      </section>
      
      {/* Dynamic Content */}
      <div className="relative z-30 bg-black">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-accent font-tech">
            <Loader2 className="animate-spin mb-4" size={24} />
            <p className="text-[10px] tracking-[0.5em] uppercase">SYNCHRONIZING_EXPERIENCE...</p>
          </div>
        ) : (
          categories.map((cat, index) => {
            const products = groupedProducts[cat];
            const media = categoryMedia[cat];
            return (
              <React.Fragment key={cat}>
                {/* Simplified Media Block (Link to Collection Category) */}
                {media && (
                  <Link 
                    to={`/collection?category=${encodeURIComponent(cat)}`}
                    className="category-media relative group block cursor-pointer"
                  >
                    {media.type === "video" ? (
                      <video src={media.url} autoPlay loop muted playsInline />
                    ) : (
                      <img src={media.url} alt={cat} />
                    )}
                    
                    {/* Transparent 'SHOP' Box Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
                      <div className="border border-white/30 bg-black/10 backdrop-blur-md px-10 py-4 font-black uppercase text-sm tracking-[0.4em] text-white hover:bg-white hover:text-black transition-all">
                        SHOP
                      </div>
                    </div>
                  </Link>
                )}

                {/* Category Products (Seamless below media) */}
                <div className="bg-black">
                  <RunwayProducts products={products} showCart={index === categories.length - 1} />
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
}
