import React from 'react';
import { TableData, FloorPlan } from './FloorPlan';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface CustomerPageProps {
  tables: TableData[];
  selectedTableId: string | null;
  onSelectTable: (table: TableData) => void;
}

export const CustomerPage: React.FC<CustomerPageProps> = ({
  tables,
  selectedTableId,
  onSelectTable,
}) => {
  
  // Slider scroll helper
  const handleSliderScroll = (direction: 'left' | 'right') => {
    const slider = document.getElementById('product-slider');
    if (slider) {
      const cardWidth = (slider.querySelector('.snap-start') as HTMLElement)?.offsetWidth || 350;
      const scrollAmount = direction === 'left' ? -(cardWidth + 24) : (cardWidth + 24);
      slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full text-on-surface bg-surface font-sans">
      
      {/* Scroll Sections Container (drives canvas animation timelines) */}
      <div className="scroll-container">
        
        {/* Section 1: Hero Section */}
        <section className="scroll-section" id="hero">
          <div className="content hero-text-container">
            <div className="text-backdrop-shadow mb-8">
              <h1 className="hero-cafe-name">Amora</h1>
              <p className="hero-cafe-subtitle">Coffee Is Here!!</p>
            </div>
            <div className="scroll-indicator">
              <span className="mouse">
                <span className="wheel"></span>
              </span>
            </div>
          </div>
        </section>

        {/* Section 2: Canvas Space Filler 1 */}
        <section className="scroll-section" id="story-1"></section>

        {/* Section 3: Canvas Space Filler 2 */}
        <section className="scroll-section" id="story-2"></section>

        {/* Section 4: Canvas Space Filler 3 */}
        <section className="scroll-section" id="story-3"></section>

        {/* Section 5: Canvas Space Filler 4 */}
        <section className="scroll-section" id="story-4"></section>
      </div>

      {/* Landing Page Content Wrapper */}
      <div className="relative z-10 w-full shadow-2xl">
        
        {/* Food Philosophy Section */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-lowest overflow-hidden">
          <div className="max-w-container-max mx-auto text-left">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="relative">
                <div className="absolute -top-12 -left-12 w-64 h-64 bg-secondary-fixed-dim/30 rounded-full blur-3xl"></div>
                <img 
                  className="rounded-xl shadow-2xl relative z-10 w-full aspect-[4/5] object-cover" 
                  alt="Organic lavender honeycomb" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCOcIe4wea3H3dMNEyJiNdf3RwD2ylmaWB2b9cgSn7Umf-dSIJhrV854oxbUE-jNTkFd3bJmj0wAlZ6vC4U1NpyaYMm_TYbePITPUlETl4ALlKzcSF5LW8vcGkaa2z4h7ousw5XonQ3Gi4SNbEMm6VAIi8Z7H96pn-Io1MpMAMk3KJ8NzN-iJF-Z5s6zvBmcaGSp57HzuFRzi9P06JKz8zUbmSI_uX9x4pbw7pz89SLPAQWnk7uFEx0iaijTLcAT4E5Lo5qdNTIUoY0"
                />
              </div>
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="font-headline-lg text-headline-xl-mobile md:text-headline-lg text-primary">
                    Crafted with Love, <br/>Sourced from Nature
                  </h2>
                  <div className="w-16 h-1 bg-primary-fixed-dim"></div>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Every ingredient at Amora is chosen with a deep respect for its origin. We partner with local regenerative farmers to bring you organic produce that captures the essence of the season. 
                </p>
                <div className="grid grid-cols-2 gap-6 md:gap-8">
                  <div className="space-y-2">
                    <span className="material-symbols-outlined text-primary">eco</span>
                    <h3 className="font-label-md text-label-md text-primary uppercase">100% Organic</h3>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Pure, pesticide-free ingredients for your wellbeing.</p>
                  </div>
                  <div className="space-y-2">
                    <span className="material-symbols-outlined text-primary">local_shipping</span>
                    <h3 className="font-label-md text-label-md text-primary uppercase">Locally Sourced</h3>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Supporting our community within a 50-mile radius.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Famous Dishes Grid Slider */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface overflow-hidden">
          <div className="max-w-container-max mx-auto space-y-16">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-left">
              <div className="space-y-4">
                <h2 className="font-headline-lg text-headline-xl-mobile md:text-headline-lg text-primary">
                  The Signature Collection
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  A symphony of flavors designed to delight the senses.
                </p>
              </div>
              
              {/* Slider Navigation Buttons */}
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={() => handleSliderScroll('left')} 
                  className="p-3 rounded-full border border-outline-variant text-primary hover:bg-primary hover:text-on-primary transition-all"
                >
                  <ArrowLeft size={16} />
                </button>
                <button 
                  onClick={() => handleSliderScroll('right')} 
                  className="p-3 rounded-full border border-outline-variant text-primary hover:bg-primary hover:text-on-primary transition-all"
                >
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Horizontal Scrollable Slider Container */}
            <div id="product-slider" className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 no-scrollbar text-left">
              
              {/* Dish 1 */}
              <div className="snap-start shrink-0 w-[82vw] sm:w-[44vw] md:w-[31.5%] max-w-[380px] group relative overflow-hidden rounded-xl bg-surface-container-low transition-all duration-500 hover:-translate-y-2">
                <div className="aspect-[3/4] overflow-hidden">
                  <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Lavender Honey Toast" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAq0JAkjjAz4uvYiUyRb0WofTozRnwVJlqg25Ul7VwNdCt8WcHxwk4bU-75I5vCb8eS62oe9jV5oZhFz2r2f6QYsAvLY0ikOQjNcoHFV6Nvyh0SSRHHymX1lUSsdlKGWrycD6EGeuh3iS5ZE5i13fv1Hkv1W0e85nsT8YMO16NVtCezmFsmQ35rCzs9bKrRDoR6OVixk-hU3WrNb1WcgWSWiJOk5y-vb_vA-0-VpfmRtX48bYFB7Ny4k9A_dGmDogqq9kAMLeC3ZvoV"/>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-headline-md text-headline-md text-primary">Lavender Honey Toast</h3>
                    <span className="font-label-md text-label-md text-secondary">₹450</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">Thick-cut brioche, wildflower honey, organic lavender blossoms.</p>
                  <span className="inline-block px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full text-[10px] uppercase font-bold tracking-tighter">Vegan Option</span>
                </div>
              </div>

              {/* Dish 2 */}
              <div className="snap-start shrink-0 w-[82vw] sm:w-[44vw] md:w-[31.5%] max-w-[380px] group relative overflow-hidden rounded-xl bg-surface-container-low transition-all duration-500 hover:-translate-y-2">
                <div className="aspect-[3/4] overflow-hidden">
                  <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Signature Violet Latte" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJismn3-US-niCwrNkH09APst5neNK5sDfN4-9X8SYHEZdsQxsCEo9syLt01eUUCnjXMM5NGPWmRwdneXIFrjxnVlO5f82xrdrpTTRHtKDkLr_ORRlXZSp4dmB-IdmrN_e3uMuxrAsJo6pTBJtr_Oc93N0uFNSGEAmecmHPO8RvgyAou80e-tHXHCzQ67oCZDnT05G1ybjq8egV-kcg20o77VTxqvNurMri_B-qvz0eX9XNuf9MXIr6q3y8Rm1Gmj6ov7MFas737FY"/>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-headline-md text-headline-md text-primary">Signature Violet Latte</h3>
                    <span className="font-label-md text-label-md text-secondary">₹280</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">Our layered taro and lavender espresso masterpiece.</p>
                  <span className="inline-block px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-[10px] uppercase font-bold tracking-tighter">Bestseller</span>
                </div>
              </div>

              {/* Dish 3 */}
              <div className="snap-start shrink-0 w-[82vw] sm:w-[44vw] md:w-[31.5%] max-w-[380px] group relative overflow-hidden rounded-xl bg-surface-container-low transition-all duration-500 hover:-translate-y-2">
                <div className="aspect-[3/4] overflow-hidden">
                  <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Rose and Pistachio Croissant" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgX9OQXRRD33nMB8jeIwSDQ5KfWgW0nn9cRntUtxUB25bJMRsrWZfZG8_XHhP6Trllxsm3_sNQk1CqnydsdoTnLFIH1UIkjQyd_aGcECykIgrmj1aO6VWGrrzSdvll5fz8N2Refe8tFJb92RD3vKpRrRrCclRYVX0yIiuzp2soNITkVK27VsP9864V2mrjwXUEj1zBmO9VIsY92pMfxwZpKZby01QIKIg96hovaINSV8oER8mJWqvl2d5mxrbM_zKnH4La8EbOBt04"/>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-headline-md text-headline-md text-primary">Rose &amp; Pistachio</h3>
                    <span className="font-label-md text-label-md text-secondary">₹320</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">Twice-baked croissant with Persian rose water and pistachio crème.</p>
                  <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] uppercase font-bold tracking-tighter">Seasonal</span>
                </div>
              </div>

              {/* Dish 4 */}
              <div className="snap-start shrink-0 w-[82vw] sm:w-[44vw] md:w-[31.5%] max-w-[380px] group relative overflow-hidden rounded-xl bg-surface-container-low transition-all duration-500 hover:-translate-y-2">
                <div className="aspect-[3/4] overflow-hidden">
                  <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Cardamom Rose Latte" src="/products/cardamom_rose_latte.png"/>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-headline-md text-headline-md text-primary">Cardamom Rose Latte</h3>
                    <span className="font-label-md text-label-md text-secondary">₹240</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">Creamy espresso infused with cardamom and organic rose water syrup.</p>
                  <span className="inline-block px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-[10px] uppercase font-bold tracking-tighter">New</span>
                </div>
              </div>

              {/* Dish 5 */}
              <div className="snap-start shrink-0 w-[82vw] sm:w-[44vw] md:w-[31.5%] max-w-[380px] group relative overflow-hidden rounded-xl bg-surface-container-low transition-all duration-500 hover:-translate-y-2">
                <div className="aspect-[3/4] overflow-hidden">
                  <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Saffron Almond Cake" src="/products/saffron_almond_cake.png"/>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-headline-md text-headline-md text-primary">Saffron Almond Cake</h3>
                    <span className="font-label-md text-label-md text-secondary">₹290</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">Moist tea cake infused with Kashmiri saffron, almonds, and cardamoms.</p>
                  <span className="inline-block px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded-full text-[10px] uppercase font-bold tracking-tighter">Chef's Special</span>
                </div>
              </div>

              {/* Dish 6 */}
              <div className="snap-start shrink-0 w-[82vw] sm:w-[44vw] md:w-[31.5%] max-w-[380px] group relative overflow-hidden rounded-xl bg-surface-container-low transition-all duration-500 hover:-translate-y-2">
                <div className="aspect-[3/4] overflow-hidden">
                  <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Mango Mint Elixir" src="/products/mango_mint_elixir.png"/>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-headline-md text-headline-md text-primary">Mango Mint Elixir</h3>
                    <span className="font-label-md text-label-md text-secondary">₹220</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">Refreshing cold brew tea with Alphonso mango purée and mint.</p>
                  <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-[10px] uppercase font-bold tracking-tighter">Refreshing</span>
                </div>
              </div>

              {/* Dish 7 */}
              <div className="snap-start shrink-0 w-[82vw] sm:w-[44vw] md:w-[31.5%] max-w-[380px] group relative overflow-hidden rounded-xl bg-surface-container-low transition-all duration-500 hover:-translate-y-2">
                <div className="aspect-[3/4] overflow-hidden">
                  <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Avocado Sourdough" src="/products/avocado_sourdough.png"/>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-headline-md text-headline-md text-primary">Avocado Sourdough</h3>
                    <span className="font-label-md text-label-md text-secondary">₹380</span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant">Toasted sourdough topped with mashed avocado, cherry tomatoes, and microgreens.</p>
                  <span className="inline-block px-3 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded-full text-[10px] uppercase font-bold tracking-tighter">Organic</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Ambient Mood Banner */}
        <section className="relative h-[450px] md:h-[614px] flex items-center justify-center overflow-hidden">
          <img 
            className="absolute inset-0 w-full h-full object-cover" 
            alt="Cafe interior morning" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAoiboEZLjOe9iuJmOHrhsZy-7sm3WCnhBFX8gHoYC6mYNpnjzU5JgfHFXYB-2cHYdrVSfR692-_7NRRMDAvq5PVcEE6DU1kAvlArSfBsn7q8vERC2YIIb4FBY7rH4A8sOge3hLNDgHaMRY3xMn9k5aOdC9OCIf8Zz5X7D6PTRBejzTimDE0eVvxujo6QBdUlfkzFmhlnLjFno9FvSLKmRG-Bdq7u_dttoFFC3mJ4UDZTnq3kUxiGgM2HG3N1nQZ4-0MeuQxuMYGgx4"
          />
          <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px]"></div>
          <div className="relative z-10 text-center space-y-6 px-margin-mobile">
            <h2 className="font-headline-xl text-2xl md:text-headline-xl text-surface tracking-tight max-w-4xl mx-auto italic font-light px-4 leading-relaxed">
              "A sanctuary where time stands still and flavors come alive."
            </h2>
          </div>
        </section>

        {/* NEW Interactive Table Reservation Section */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface-container-low border-t border-[#2d1e18]/15 relative">
          <div className="max-w-container-max mx-auto space-y-12">
            <div className="text-center space-y-4 text-left">
              <div className="inline-block py-1.5 px-3.5 bg-amber-500/10 text-[#d4b26f] rounded-lg font-bold text-xs uppercase tracking-widest border border-[#d4b26f]/20">
                Interactive Seating Map
              </div>
              <h2 className="font-headline-lg text-headline-xl-mobile md:text-headline-lg text-primary mt-2">
                Reserve Your Table
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mx-auto">
                Pinch/scroll to zoom and drag to explore the top-view layout of the cafe. Select any green glowing table to fill out the reservation.
              </p>
            </div>
            
            {/* Interactive SVG Floor Plan */}
            <div className="relative w-full">
              <FloorPlan
                tables={tables}
                selectedTableId={selectedTableId}
                onSelectTable={onSelectTable}
              />
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="py-24 px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="max-w-container-max mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6 text-left">
              <div className="space-y-4">
                <h2 className="font-headline-lg text-headline-xl-mobile md:text-headline-lg text-primary">From Our Guests</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Kind words from our Amora community.</p>
              </div>
            </div>
            
            {/* Reviews Cards */}
            <div className="grid md:grid-cols-3 gap-gutter text-left">
              {/* Review 1 */}
              <div className="glass-card p-8 rounded-xl border border-outline-variant/30 space-y-6">
                <div className="flex text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface italic">
                  "The most beautiful cafe I've ever visited. The Violet Latte is as delicious as it is stunning. Truly a slow-living dream."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-secondary-fixed"></div>
                  <div>
                    <h4 className="font-label-md text-label-md text-primary">Elena Rodriguez</h4>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Interior Designer</p>
                  </div>
                </div>
              </div>
              {/* Review 2 */}
              <div className="glass-card p-8 rounded-xl border border-outline-variant/30 space-y-6">
                <div className="flex text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface italic">
                  "You can taste the quality and the care in every bite. The Lavender Honey Toast is life-changing."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed"></div>
                  <div>
                    <h4 className="font-label-md text-label-md text-primary">Marcus Thorne</h4>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Food Critic</p>
                  </div>
                </div>
              </div>
              {/* Review 3 */}
              <div className="glass-card p-8 rounded-xl border border-outline-variant/30 space-y-6">
                <div className="flex text-primary">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>star</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface italic">
                  "A tranquil oasis in the middle of the city. Perfect for focused work or a quiet morning reflection."
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-tertiary-fixed"></div>
                  <div>
                    <h4 className="font-label-md text-label-md text-primary">Sarah Jenkins</h4>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Author</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Section */}
        <footer className="w-full py-12 px-margin-mobile md:px-margin-desktop bg-surface-container-low dark:bg-surface-container-high border-t border-outline-variant/10 text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-container-max mx-auto">
            <div className="text-center md:text-left space-y-4">
              <span className="font-headline-lg text-headline-lg text-primary dark:text-primary-fixed-dim">Amora</span>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xs">© 2024 Amora Cafe. Crafted for slow living.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">Contact Us</a>
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">Privacy Policy</a>
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">Instagram</a>
              <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">Facebook</a>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
};
