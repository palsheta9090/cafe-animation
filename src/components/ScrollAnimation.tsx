import React, { useEffect, useState, useRef } from 'react';

interface ScrollAnimationProps {
  onLoaded: () => void;
}

export const ScrollAnimation: React.FC<ScrollAnimationProps> = ({ onLoaded }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [percent, setPercent] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const totalFrames = 220;
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(1);
  const targetFrameRef = useRef(1);
  const preloadedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const requiredFrames = 15; // Only wait for the first 15 frames to show the page
    let loadedCount = 0;
    let requiredLoadedCount = 0;
    let loaderHidden = false;
    const images: HTMLImageElement[] = [];

    // Preload all 220 images
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const paddedNum = String(i).padStart(3, '0');
      img.src = `/frames/ezgif-frame-${paddedNum}.jpg`;

      img.onload = () => {
        loadedCount++;
        
        if (i <= requiredFrames) {
          requiredLoadedCount++;
          const pct = Math.round((requiredLoadedCount / requiredFrames) * 100);
          setPercent(pct);
        }

        if (requiredLoadedCount >= requiredFrames && !loaderHidden) {
          loaderHidden = true;
          preloadedRef.current = true;
          // Snappy delay to clear loader once critical frames are ready
          setTimeout(() => {
            setLoading(false);
            onLoaded();
          }, 150);
        }
      };

      img.onerror = () => {
        loadedCount++;
        if (i <= requiredFrames) {
          requiredLoadedCount++;
          const pct = Math.round((requiredLoadedCount / requiredFrames) * 100);
          setPercent(pct);
        }
        if (requiredLoadedCount >= requiredFrames && !loaderHidden) {
          loaderHidden = true;
          preloadedRef.current = true;
          setLoading(false);
          onLoaded();
        }
      };

      images.push(img);
    }
    imagesRef.current = images;

    // Draw Covered Frame
    const drawFrame = (index: number) => {
      const img = imagesRef.current[index - 1];
      if (!img || !img.complete) return;

      const dpr = window.devicePixelRatio || 1;
      const canvasWidth = window.innerWidth * dpr;
      const canvasHeight = window.innerHeight * dpr;

      const imgWidth = img.naturalWidth || img.width;
      const imgHeight = img.naturalHeight || img.height;

      const imgRatio = imgWidth / imgHeight;
      const canvasRatio = canvasWidth / canvasHeight;

      let drawWidth, drawHeight, x, y;

      if (canvasRatio > imgRatio) {
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imgRatio;
        x = 0;
        y = (canvasHeight - drawHeight) / 2;
      } else {
        drawWidth = canvasHeight * imgRatio;
        drawHeight = canvasHeight;
        x = (canvasWidth - drawWidth) / 2;
        y = 0;
      }

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, x, y, drawWidth, drawHeight);
    };

    // Scroll tracker
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollContainer = document.querySelector('.scroll-container') as HTMLElement;
      if (!scrollContainer) return;

      const maxAnimationScroll = scrollContainer.offsetHeight - window.innerHeight;
      const scrollFraction = maxAnimationScroll <= 0 ? 0 : Math.min(1, scrollTop / maxAnimationScroll);

      targetFrameRef.current = Math.max(
        1,
        Math.min(totalFrames, Math.floor(scrollFraction * (totalFrames - 1)) + 1)
      );
    };

    // Resize
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;

      if (preloadedRef.current) {
        drawFrame(Math.round(currentFrameRef.current));
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleResize);

    // Initial resize
    handleResize();

    // Render loop
    let animationFrameId: number;
    const renderLoop = () => {
      if (preloadedRef.current) {
        const ease = 0.1;
        currentFrameRef.current += (targetFrameRef.current - currentFrameRef.current) * ease;
        drawFrame(Math.round(currentFrameRef.current));

        // Animate text overlays
        animateOverlays();
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onLoaded]);

  const animateOverlays = () => {
    const sections = document.querySelectorAll('.scroll-section');
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const sectionHeight = rect.height;
      const centerY = rect.top + sectionHeight / 2;
      const viewportCenter = window.innerHeight / 2;

      const distanceFromCenter = Math.abs(centerY - viewportCenter);
      const fadeDistance = window.innerHeight * 0.45;

      let opacity = 1 - (distanceFromCenter / fadeDistance);
      opacity = Math.max(0, Math.min(1, opacity));
      opacity = Math.pow(opacity, 1.8);

      const content = section.querySelector('.content') as HTMLElement;
      if (content) {
        content.style.opacity = String(opacity);
        const drift = (centerY - viewportCenter) * 0.12;
        content.style.transform = `translateY(${drift}px)`;

        if (opacity > 0.1) {
          content.classList.add('visible');
        } else {
          content.classList.remove('visible');
        }
      }
    });
  };

  return (
    <>
      {loading && (
        <div id="loader" className="loader-overlay">
          <div className="loader-content">
            <div className="loader-bar-container">
              <div id="loader-bar" className="loader-bar" style={{ width: `${percent}%` }}></div>
            </div>
            <div id="loader-text" className="loader-text">{percent}%</div>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} id="animation-canvas"></canvas>
    </>
  );
};
