import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import RunwayProducts from '../components/home/RunwayProducts';
import { db } from '../lib/firebase';
import { doc, onSnapshot, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { fetchProducts, Product } from '../data/products';
import { Loader2, ChevronRight } from 'lucide-react';

interface HeroSection {
  id: string;
  category: string;
  title: string;
  subtitle?: string;
  backgroundType: 'image' | 'video';
  backgroundUrl: string;
  textColor: string;
  fontSize: string;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
  fontFamily: string;
  order: number;
  createdAt: string;
}

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
            <span className="text-7xl sm:text-9xl md:text-[14vw] font-display uppercase tracking-tight italic leading-none pr-8 text-accent">
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
      className="text-6xl sm:text-8xl md:text-[12vw] font-display uppercase tracking-tight italic leading-none"
    >
      {title}
    </motion.h1>
  );
};

export default function Home() {
  const [mainHero, setMainHero] = useState<HeroSettings>({
    title: 'THEE UNITE',
    tagline: 'EST 2024',
    subtitle: 'FOR EVERY SOUL THAT DARES TO DREAM',
    bgUrl: '/hero-video.mp4',
    bgType: 'video'
  });
  const [activeHero, setActiveHero] = useState<HeroSettings | null>(null);
  const [videoCanPlay, setVideoCanPlay] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryHeros, setCategoryHeros] = useState<HeroSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [prodData, heroSnap] = await Promise.all([
        fetchProducts(),
        getDocs(query(collection(db, 'heros'), orderBy('order', 'asc')))
      ]);
      
      const heros = heroSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as HeroSection));
      setProducts(prodData);
      setCategoryHeros(heros);
      setLoading(false);
    };
    loadData();
  }, []);

  // Live updates for main hero
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'hero'), (snap) => {
      if (snap.exists()) {
        const newData = snap.data() as HeroSettings;
        if (!activeHero) {
          preloadAsset(newData).then(() => {
            setMainHero(newData);
            setActiveHero(newData);
          });
          return;
        }
        if (newData.bgUrl !== activeHero.bgUrl || newData.bgType !== activeHero.bgType) {
          preloadAsset(newData).then(() => {
            setMainHero(newData);
            setIsTransitioning(true);
            setTimeout(() => {
              setActiveHero(newData);
              setIsTransitioning(false);
            }, 1000);
          });
        } else {
          setMainHero(newData);
          setActiveHero(newData);
        }
      }
    });
    return () => unsubscribe();
  }, [activeHero]);

  const preloadAsset = (settings: HeroSettings): Promise<void> => {
    return new Promise((resolve) => {
      if (settings.bgType === 'video') {
        const video = document.createElement('video');
        video.src = settings.bgUrl;
        video.preload = 'auto';
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

  return (
    <div className="bg-black">
      {/* Main Hero Section */}
      <section className="h-screen relative overflow-hidden flex items-center justify-center bg-black w-full">
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <AnimatePresence mode="popLayout">
            {activeHero && (
              <motion.div
                key={activeHero.bgUrl + activeHero.bgType}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 w-full h-full"
              >
                {activeHero.bgType === 'video' ? (
                  <video
                    autoPlay loop muted playsInline preload="auto"
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.7]"
                    src={activeHero.bgUrl}
                  />
                ) : (
                  <img 
                    src={activeHero.bgUrl}
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.8]"
                  />
                )}
              </motion.div>
            )}

            {isTransitioning && mainHero.bgUrl !== activeHero?.bgUrl && (
              <motion.div
                key={mainHero.bgUrl + mainHero.bgType + "_preloading"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 w-full h-full z-10"
              >
                {mainHero.bgType === 'video' ? (
                  <video
                    autoPlay loop muted playsInline preload="auto"
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.7]"
                    src={mainHero.bgUrl}
                  />
                ) : (
                  <img 
                    src={mainHero.bgUrl}
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.8]"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/30 z-20" />
        </div>

        <div className="relative z-30 text-center px-6 w-full h-full flex flex-col justify-end pb-32">
          <div className="max-w-4xl mx-auto w-full">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={videoCanPlay ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-tech text-xs tracking-[0.4em] uppercase text-white mb-4"
            >
              {mainHero.tagline}
            </motion.p>

            <div className="mb-8">
              <TheeUniteReveal title={mainHero.title} onComplete={() => setVideoCanPlay(true)} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={videoCanPlay ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-row items-center justify-center gap-4"
            >
              <Link to="/shop" className="min-w-[160px] py-4 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] hover:bg-accent transition-colors">Shop Now</Link>
              <Link to="/collection" className="min-w-[160px] py-4 border border-white/30 backdrop-blur-md text-white font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 transition-colors">The Story</Link>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={videoCanPlay ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="w-1 h-12 bg-gradient-to-b from-white to-transparent opacity-20" />
          </motion.div>
        </div>
      </section>
      
      {/* Category Sections */}
      <div className="relative z-30 bg-black">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-accent font-tech">
            <Loader2 className="animate-spin mb-4" size={24} />
            <p className="text-[10px] tracking-[0.5em] uppercase">SYNCHRONIZING_EXPERIENCE...</p>
          </div>
        ) : (
          categoryHeros.map((hero, index) => {
            const categoryProducts = products.filter(p => p.category === hero.category);
            if (categoryProducts.length === 0) return null;

            return (
              <React.Fragment key={hero.id}>
                {/* Dynamic Category Hero */}
                <section className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center bg-black">
                  <div className="absolute inset-0 w-full h-full">
                    {hero.backgroundType === 'video' ? (
                      <video
                        autoPlay loop muted playsInline
                        className="w-full h-full object-cover brightness-[0.5]"
                        src={hero.backgroundUrl}
                      />
                    ) : (
                      <img
                        src={hero.backgroundUrl}
                        className="w-full h-full object-cover brightness-[0.5]"
                        alt={hero.category}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
                  </div>
                  
                  <div 
                    className="relative z-10 px-6 w-full max-w-7xl mx-auto"
                    style={{ textAlign: hero.textAlign }}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                      viewport={{ once: true }}
                    >
                      <span className="font-tech text-xs tracking-[0.5em] text-accent uppercase mb-6 block italic opacity-70">
                        {hero.category}_SERIES
                      </span>
                      <h2 
                        className="uppercase italic tracking-tighter leading-[0.85]"
                        style={{ 
                          color: hero.textColor,
                          fontSize: hero.fontSize,
                          fontWeight: hero.fontWeight,
                          fontFamily: hero.fontFamily
                        }}
                      >
                        {hero.title}
                      </h2>
                      {hero.subtitle && (
                        <p className="mt-8 font-tech text-sm tracking-[0.2em] uppercase opacity-40 max-w-xl inline-block">
                          {hero.subtitle}
                        </p>
                      )}
                    </motion.div>
                  </div>
                </section>

                {/* Category Products */}
                <div className="py-24">
                  <div className="px-8 mb-12 flex items-end justify-between">
                    <div>
                      <span className="text-accent font-tech text-[10px] tracking-[0.4em] uppercase mb-2 block">CATALOG_SCAN</span>
                      <h3 className="text-5xl font-black uppercase italic tracking-tighter">{hero.category}</h3>
                    </div>
                    <Link to="/shop" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-accent transition-colors flex items-center gap-4">
                      VIEW FULL COLLECTION <ChevronRight size={14} />
                    </Link>
                  </div>
                  <RunwayProducts 
                    products={categoryProducts} 
                    showCart={index === categoryHeros.length - 1} 
                  />
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>
    </div>
  );
}
