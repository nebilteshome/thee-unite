import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';

// Fisher-Yates Shuffle Algorithm
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface GalleryItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  title: string;
  span?: string;
  order: number;
}

interface HeroSettings {
  title: string;
  subtitle: string;
  bgUrl: string;
  bgType: 'image' | 'video';
}

const CharacterReveal = ({ text, className, onComplete }: { text: string, className?: string, onComplete?: () => void }) => {
  const characters = text.split("");
  
  return (
    <motion.div 
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 2.5 / characters.length,
            onComplete: onComplete
          }
        }
      }}
    >
      {characters.map((char, index) => (
        <motion.span
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
            visible: { opacity: 1, y: 0, filter: "blur(0px)" }
          }}
          transition={{ duration: 0.5 }}
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
              viewBox="0 0 280 150" 
              className="w-[110px] md:w-[200px] h-auto overflow-visible"
            >
              <motion.text
                x="0"
                y="115"
                className="thee-text"
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
            <span className="text-7xl md:text-[12rem] font-display uppercase italic text-outline-accent leading-none pr-8">
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
      className="text-6xl md:text-[10vw] font-display uppercase leading-none tracking-tighter"
    >
      {title}
    </motion.h1>
  );
};

export default function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hero, setHero] = useState<HeroSettings>({
    title: 'THEE UNITE',
    subtitle: 'CRAFTING BOLD EXPRESSIONS THROUGH MODERN STREETWEAR DESIGN.',
    bgUrl: '/hero-video.mp4',
    bgType: 'video'
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [videoCanPlay, setVideoCanPlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Hero Settings
        const heroSnap = await getDoc(doc(db, 'settings', 'hero'));
        if (heroSnap.exists()) {
          const data = heroSnap.data();
          setHero({
            title: data.title,
            subtitle: data.subtitle,
            bgUrl: data.bgUrl,
            bgType: data.bgType
          });
        }

        // Fetch Gallery Items
        const q = query(collection(db, 'gallery'), orderBy('order'));
        const querySnapshot = await getDocs(q);
        const galleryData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as GalleryItem));
        
        if (galleryData.length > 0) {
          setItems(shuffleArray(galleryData));
        }
      } catch (error) {
        console.error("Error fetching gallery data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (videoCanPlay && videoRef.current && hero.bgType === 'video') {
      videoRef.current.play().catch(err => console.log("Video autoplay blocked:", err));
    }
  }, [videoCanPlay, hero.bgType]);

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center font-tech text-accent uppercase tracking-widest">Synchronizing_Visuals...</div>;

  return (
    <div className="min-h-screen bg-black pt-32 pb-20 px-4 sm:px-8 overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full border-[1px] border-white/5 opacity-20 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, #ffffff10 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <header className="mb-24 relative min-h-[70vh] flex flex-col justify-center overflow-hidden rounded-3xl border border-white/5 bg-surface/20">
          {/* Hero Background */}
          <div className="absolute inset-0 z-0">
            {hero.bgType === 'video' ? (
              <video
                ref={videoRef}
                src={hero.bgUrl}
                loop
                muted
                playsInline
                className={`w-full h-full object-cover transition-opacity duration-[3000ms] ease-in-out ${videoCanPlay ? 'opacity-50' : 'opacity-0'}`}
              />
            ) : (
              <img 
                src={hero.bgUrl}
                className={`w-full h-full object-cover transition-opacity duration-[3000ms] ease-in-out ${videoCanPlay ? 'opacity-50' : 'opacity-0'}`}
                onLoad={() => setVideoCanPlay(true)}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
          </div>

          <div className="relative z-10 p-8 md:p-16">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col"
            >
              <span className="font-tech text-accent tracking-[0.6em] text-xs uppercase mb-8 overflow-hidden inline-block">
                <CharacterReveal text="For every soul that dares to dream." />
              </span>
              
              <div className="mb-8">
                <TheeUniteReveal title={hero.title} onComplete={() => setVideoCanPlay(true)} />
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={videoCanPlay ? { opacity: 0.5, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="font-tech text-xs tracking-[0.3em] uppercase max-w-md border-l border-accent/30 pl-6 py-2"
              >
                {hero.subtitle}
              </motion.div>
            </motion.div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            className="absolute top-0 right-8 vertical-text font-tech text-white text-xs tracking-[1em] h-full hidden md:flex items-center"
          >
            SCROLL TO EXPLORE
          </motion.div>
        </header>

        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
          {items.map((item, index) => {
            const mediaUrl = item.url;
            if (!mediaUrl) return null;

            return (
              <motion.div
                key={item.id}
                layoutId={`media-${item.id}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: (index % 5) * 0.1 }}
                onClick={() => setSelectedId(item.id)}
                className="relative group cursor-pointer overflow-hidden rounded-2xl bg-surface border border-white/5 break-inside-avoid mb-6 shadow-2xl"
              >
                {item.type === 'video' ? (
                  <video
                    src={mediaUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                    onError={(e) => {
                      (e.target as HTMLVideoElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <img
                    src={mediaUrl}
                    alt={item.title || 'Manifest Data'}
                    loading="lazy"
                    className="w-full h-auto group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/600x800/black/accent?text=MANIFEST_DATA_UNAVAILABLE';
                    }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
        {items.length === 0 && (
          <div className="col-span-4 text-center py-40 border border-white/5 bg-surface/30">
            <p className="text-white/20 font-black tracking-[0.5em] uppercase italic">GALLERY EMPTY</p>
            <p className="mt-4 text-[10px] font-tech text-accent/50 uppercase">Manifest media in the administrative core.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 backdrop-blur-2xl bg-black/90"
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              layoutId={`media-${selectedId}`}
              className="relative max-w-5xl w-full max-h-full overflow-hidden rounded-xl border border-white/10 bg-surface shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedId(null)}
                className="absolute top-6 right-6 z-30 text-white/50 hover:text-accent transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>

              {items.find(i => i.id === selectedId)?.type === 'video' ? (
                <video
                  src={items.find(i => i.id === selectedId)?.url}
                  autoPlay loop muted playsInline controls
                  className="w-full h-auto max-h-[90vh] object-contain"
                />
              ) : (
                <img
                  src={items.find(i => i.id === selectedId)?.url}
                  className="w-full h-auto max-h-[90vh] object-contain"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
