import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import RunwayProducts from '../components/home/RunwayProducts';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

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
  const [hero, setHero] = useState<HeroSettings>({
    title: 'THEE UNITE',
    tagline: 'EST 2024',
    subtitle: 'FOR EVERY SOUL THAT DARES TO DREAM',
    bgUrl: '/hero-video.mp4',
    bgType: 'video'
  });
  const [activeHero, setActiveHero] = useState<HeroSettings | null>(null);
  const [videoCanPlay, setVideoCanPlay] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Live updates from Firestore with smooth transitions
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'hero'), (snap) => {
      if (snap.exists()) {
        const newData = snap.data() as HeroSettings;
        
        // Initial load
        if (!activeHero) {
          preloadAsset(newData).then(() => {
            setHero(newData);
            setActiveHero(newData);
          });
          return;
        }

        // If background changed, handle transition
        if (newData.bgUrl !== activeHero.bgUrl || newData.bgType !== activeHero.bgType) {
          preloadAsset(newData).then(() => {
            setHero(newData);
            setIsTransitioning(true);
            // Duration should match transition in motion.div below
            setTimeout(() => {
              setActiveHero(newData);
              setIsTransitioning(false);
            }, 1000); 
          });
        } else {
          // If only metadata (title, tagline, etc.) changed
          setHero(newData);
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
        video.onerror = () => resolve(); // Avoid getting stuck
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
      <section className="h-screen relative overflow-hidden flex items-center justify-center bg-black w-full">
        {/* Triple-layer Double Buffer Background Container */}
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
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.7] opacity-100"
                    src={activeHero.bgUrl}
                  />
                ) : (
                  <img 
                    src={activeHero.bgUrl}
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.8] opacity-100"
                  />
                )}
              </motion.div>
            )}

            {/* Next Layer Buffer (Preparing to swap) */}
            {isTransitioning && hero.bgUrl !== activeHero?.bgUrl && (
              <motion.div
                key={hero.bgUrl + hero.bgType + "_preloading"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 w-full h-full z-10"
              >
                {hero.bgType === 'video' ? (
                  <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.7] opacity-100"
                    src={hero.bgUrl}
                  />
                ) : (
                  <img 
                    src={hero.bgUrl}
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.8] opacity-100"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/30 z-20" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-30 text-center px-6 w-full h-full flex flex-col justify-end pb-32">
          <div className="max-w-4xl mx-auto w-full">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={videoCanPlay ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-tech text-xs tracking-[0.4em] uppercase text-white mb-4"
            >
              {hero.tagline}
            </motion.p>

            <div className="mb-8">
              <TheeUniteReveal title={hero.title} onComplete={() => setVideoCanPlay(true)} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={videoCanPlay ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-row items-center justify-center gap-4"
            >
              <Link 
                to="/shop"
                className="min-w-[160px] py-4 bg-white text-black font-black uppercase text-[10px] tracking-[0.2em] hover:bg-accent transition-colors"
              >
                Shop Now
              </Link>
              <Link 
                to="/collection"
                className="min-w-[160px] py-4 border border-white/30 backdrop-blur-md text-white font-black uppercase text-[10px] tracking-[0.2em] hover:bg-white/10 transition-colors"
              >
                The Story
              </Link>
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
      
      <div className="relative z-30 bg-black">
        <RunwayProducts />
      </div>
    </div>
  );
}
