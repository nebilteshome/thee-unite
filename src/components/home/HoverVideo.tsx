import React, { useRef, useEffect } from 'react';

interface HoverVideoProps {
  src: string;
  poster: string;
  isHovered: boolean;
}

const HoverVideo: React.FC<HoverVideoProps> = ({ src, poster, isHovered }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        videoRef.current.play().catch(err => console.error("Video play failed", err));
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovered]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        className={`w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};

export default HoverVideo;
