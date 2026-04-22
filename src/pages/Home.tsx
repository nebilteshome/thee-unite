import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import RunwayProducts from '../components/home/RunwayProducts';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
              <defs>
                <style>{`
                  @import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');
                  .thee-text-home {
                    font-family: 'Anton', sans-serif;
                    font-size: 150px;
                    font-style: italic;
                    text-transform: uppercase;
                  }
                `}</style>
              </defs>
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
            <span className="text-7xl sm:text-9xl md:text-[14vw] font-black uppercase tracking-tighter italic text-outline-accent leading-none pr-8">
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
      className="text-6xl sm:text-8xl md:text-[12vw] font-black uppercase tracking-tighter italic leading-none"
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
  
  const heroRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

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
        video.src = `${settings.bgUrl}?v=${Date.now()}`; // Cache bust to force reload
        video.preload = 'auto';
        video.oncanplaythrough = () => resolve();
        video.onerror = () => resolve(); // Avoid getting stuck
      } else {
        const img = new Image();
        img.src = `${settings.bgUrl}?v=${Date.now()}`;
        img.onload = () => resolve();
        img.onerror = () => resolve();
      }
    });
  };

  useEffect(() => {
    if (!heroRef.current || !overlayRef.current) return;

    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '+=100%', 
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        }
      });

      tl.to(overlayRef.current, {
        y: -150,
        opacity: 0,
        scale: 0.95,
        filter: 'blur(10px)',
        duration: 1,
        ease: 'power2.inOut'
      })
      .to(videoContainerRef.current, {
        scale: 1.05,
        opacity: 0.4,
        duration: 1,
      }, 0); 

    });

    return () => ctx.revert();
  }, [videoCanPlay]); 

  return (
    <div className="bg-black">
      <section ref={heroRef} className="h-screen relative overflow-hidden flex items-center justify-center bg-black w-full">
        {/* Triple-layer Double Buffer Background Container */}
        <div ref={videoContainerRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
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
                    className="absolute inset-0 w-full h-full object-cover brightness-[1.35] contrast-[1.1] opacity-60"
                    src={activeHero.bgUrl}
                  />
                ) : (
                  <img 
                    src={activeHero.bgUrl}
                    className="absolute inset-0 w-full h-full object-cover brightness-[1.1] opacity-60"
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
                    className="absolute inset-0 w-full h-full object-cover brightness-[1.35] contrast-[1.1] opacity-60"
                    src={hero.bgUrl}
                  />
                ) : (
                  <img 
                    src={hero.bgUrl}
                    className="absolute inset-0 w-full h-full object-cover brightness-[1.1] opacity-60"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
          <div className="absolute inset-0 bg-black/10 z-20" />
        </div>

        {/* Content Overlay */}
        <div ref={overlayRef} className="relative z-30 text-center px-6 w-full max-w-screen-2xl mx-auto">
          <div className="flex flex-col items-center justify-center">
            <TheeUniteReveal title={hero.title} onComplete={() => setVideoCanPlay(true)} />
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={videoCanPlay ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="flex items-center justify-center gap-6 mt-8"
            >
              <div className="h-px w-8 bg-white/20" />
              <p className="font-tech text-sm md:text-lg tracking-[0.6em] text-accent font-black uppercase">
                {hero.tagline}
              </p>
              <div className="h-px w-8 bg-white/20" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={videoCanPlay ? { opacity: 0.5 } : { opacity: 0 }}
              transition={{ delay: 1, duration: 1 }}
              className="mt-6 font-tech text-[10px] tracking-[0.4em] uppercase text-white/60 max-w-md mx-auto"
            >
              {hero.subtitle}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={videoCanPlay ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="absolute bottom-[-100px] left-1/2 -translate-x-1/2"
          >
            <div className="group flex flex-col items-center gap-4">
              <span className="font-tech text-[10px] tracking-[0.4em] text-white/30 uppercase group-hover:text-accent transition-colors">Scroll to explore</span>
              <div className="w-px h-16 bg-gradient-to-b from-accent to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>
      
      <div className="relative z-30 bg-black">
        <RunwayProducts />
      </div>
    </div>
  );
}
