import './style.css';

const canvas = document.getElementById('animation-canvas');
const ctx = canvas.getContext('2d');
const totalFrames = 257;
const images = [];
let loadedCount = 0;
let currentFrame = 1;
let targetFrame = 1;
let preloaded = false;

// Preload all 257 images
function preloadImages() {
  return new Promise((resolve) => {
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const paddedNum = String(i).padStart(3, '0');
      // The frames are copied inside public/frames
      img.src = `/frames/ezgif-frame-${paddedNum}.jpg`;
      
      img.onload = () => {
        loadedCount++;
        const percent = Math.round((loadedCount / totalFrames) * 100);
        
        const loaderBar = document.getElementById('loader-bar');
        const loaderText = document.getElementById('loader-text');
        
        if (loaderBar) loaderBar.style.width = `${percent}%`;
        if (loaderText) loaderText.innerText = `Loading Assets ${percent}%`;
        
        if (loadedCount === totalFrames) {
          finishLoading(resolve);
        }
      };
      
      img.onerror = () => {
        loadedCount++;
        console.warn(`Failed to load frame ${paddedNum}`);
        if (loadedCount === totalFrames) {
          finishLoading(resolve);
        }
      };
      
      images.push(img);
    }
  });
}

function finishLoading(resolve) {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('fade-out');
    setTimeout(() => {
      loader.style.display = 'none';
    }, 800);
  }
  preloaded = true;
  resolve();
}

// Calculate the target frame number based on current page scroll
function updateTargetFrame() {
  const scrollTop = window.scrollY;
  const scrollContainer = document.querySelector('.scroll-container');
  if (!scrollContainer) return;
  
  const maxAnimationScroll = scrollContainer.offsetHeight - window.innerHeight;
  const scrollFraction = maxAnimationScroll <= 0 ? 0 : Math.min(1, scrollTop / maxAnimationScroll);
  
  // Map fraction 0-1 to frame 1-257
  targetFrame = Math.max(1, Math.min(totalFrames, Math.floor(scrollFraction * (totalFrames - 1)) + 1));
}

// Render a specific frame image onto the canvas in COVER mode
function drawFrame(index) {
  const img = images[index - 1];
  if (!img || !img.complete) return;
  
  const dpr = window.devicePixelRatio || 1;
  const canvasWidth = window.innerWidth * dpr;
  const canvasHeight = window.innerHeight * dpr;
  
  const imgWidth = img.naturalWidth || img.width;
  const imgHeight = img.naturalHeight || img.height;
  
  // Calculate ratios to perform 'object-fit: cover' drawing
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
}

// Perform animations inside the requestAnimationFrame loop
function render() {
  if (preloaded) {
    const ease = 0.1; // Smooth scroll frame inertia coefficient (smaller = smoother/slower)
    
    // Interpolate current frame toward target frame
    currentFrame += (targetFrame - currentFrame) * ease;
    
    // Render interpolated frame
    drawFrame(Math.round(currentFrame));
    
    // Animate text elements based on viewport positions
    animateOverlays();
  }
  
  requestAnimationFrame(render);
}

// Calculate opacity and drift for scrolling cards based on distance to viewport center
function animateOverlays() {
  const sections = document.querySelectorAll('.scroll-section');
  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const sectionHeight = rect.height;
    
    // Y position of section's center relative to viewport
    const centerY = rect.top + sectionHeight / 2;
    const viewportCenter = window.innerHeight / 2;
    
    const distanceFromCenter = Math.abs(centerY - viewportCenter);
    const fadeDistance = window.innerHeight * 0.45; // Fade begins when card is within 45% of viewport height
    
    let opacity = 1 - (distanceFromCenter / fadeDistance);
    opacity = Math.max(0, Math.min(1, opacity));
    
    // Smooth the fade curve
    opacity = Math.pow(opacity, 1.8);
    
    const content = section.querySelector('.content');
    if (content) {
      content.style.opacity = opacity;
      
      // Parallax text drift
      const drift = (centerY - viewportCenter) * 0.12; // 12% scroll velocity drift
      content.style.transform = `translateY(${drift}px)`;
      
      // CSS hook class
      if (opacity > 0.1) {
        content.classList.add('visible');
      } else {
        content.classList.remove('visible');
      }
    }
  });
}

// Resize canvas correctly for high-DPI screens
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  
  if (preloaded) {
    drawFrame(Math.round(currentFrame));
  }
}

// Event hooks
window.addEventListener('scroll', updateTargetFrame);
window.addEventListener('resize', resizeCanvas);

// Initialize canvas
resizeCanvas();

// Kick off asset preloader
preloadImages().then(() => {
  updateTargetFrame();
  drawFrame(1);
});

// Run animation loop
requestAnimationFrame(render);

// Mouse trail effect for atmospheric feel
const handleMouseMove = e => {
  const cursor = document.createElement('div');
  cursor.className = 'fixed pointer-events-none w-4 h-4 rounded-full bg-primary/5 blur-xl transition-all duration-1000 z-[9999]';
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  document.body.appendChild(cursor);
  setTimeout(() => cursor.remove(), 1000);
};
document.addEventListener('mousemove', handleMouseMove);

// Horizontal Product Slider control buttons
const slider = document.getElementById('product-slider');
const prevBtn = document.getElementById('slider-prev');
const nextBtn = document.getElementById('slider-next');

if (slider && prevBtn && nextBtn) {
  prevBtn.addEventListener('click', () => {
    const cardWidth = slider.querySelector('.snap-start')?.offsetWidth || 350;
    slider.scrollBy({ left: -(cardWidth + 24), behavior: 'smooth' }); // card width + gap
  });
  nextBtn.addEventListener('click', () => {
    const cardWidth = slider.querySelector('.snap-start')?.offsetWidth || 350;
    slider.scrollBy({ left: (cardWidth + 24), behavior: 'smooth' }); // card width + gap
  });
}
