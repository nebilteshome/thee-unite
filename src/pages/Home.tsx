import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import ProductSection from '../components/ProductSection';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
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
  const [videoCanPlay, setVideoCanPlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHero = async () => {
      const snap = await getDoc(doc(db, 'settings', 'hero'));
      if (snap.exists()) setHero(snap.data() as HeroSettings);
    };
    fetchHero();
  }, []);

  useEffect(() => {
    if (videoCanPlay && videoRef.current && hero.bgType === 'video') {
      videoRef.current.play().catch(err => console.log("Video autoplay blocked:", err));
    }
  }, [videoCanPlay, hero.bgType]);

  useEffect(() => {
    if (!heroRef.current || !overlayRef.current) return;

    let ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: '+=100%', // Pin for 100% of viewport height
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
      }, 0); // Concurrent animation

    });

    return () => ctx.revert();
  }, [videoCanPlay]); // Re-run when video is ready to ensure correct pinning heights

  return (
    <div className="bg-black">
      <section ref={heroRef} className="h-screen relative overflow-hidden flex items-center justify-center bg-black w-full">
        {/* Background Video/Image Container */}
        <div ref={videoContainerRef} className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          {hero.bgType === 'video' ? (
            <video
              ref={videoRef}
              loop
              muted
              playsInline
              key={hero.bgUrl}
              className={`absolute inset-0 w-full h-full object-cover scale-100 brightness-[1.35] contrast-[1.1] transition-opacity duration-[3000ms] ease-in-out ${videoCanPlay ? 'opacity-60' : 'opacity-0'}`}
              src={hero.bgUrl}
            />
          ) : (
            <img 
              src={hero.bgUrl}
              key={hero.bgUrl}
              className={`absolute inset-0 w-full h-full object-cover scale-100 brightness-[1.1] transition-opacity duration-[3000ms] ease-in-out ${videoCanPlay ? 'opacity-60' : 'opacity-0'}`}
              onLoad={() => setVideoCanPlay(true)}
            />
          )}
          <div className="absolute inset-0 bg-black/10 z-10" />
        </div>

        {/* Content Overlay */}
        <div ref={overlayRef} className="relative z-20 text-center px-6 w-full max-w-screen-2xl mx-auto">
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
        <ProductSection />
      </div>
    </div>
  );
}
