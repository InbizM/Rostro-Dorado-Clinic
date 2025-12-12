import React, { useState, useRef, useEffect } from 'react';
import { ChevronsLeftRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Data for the cases
const CASES = [
  {
    id: 1,
    title: "Armonización Full Face",
    description: "Proyección de pómulos y definición de arco mandibular.",
    // Como no tenemos el par exacto, usamos la misma imagen y el componente aplica B/N al 'antes'
    before: "https://i.imgur.com/nR5Xiik.jpeg", 
    after: "https://i.imgur.com/nR5Xiik.jpeg",
    tags: ["RostroDorado", "Bioestimulación"]
  },
  {
    id: 2,
    title: "Rejuvenecimiento de Labios",
    description: "Hidratación profunda y corrección de asimetrías sutiles.",
    before: "https://i.imgur.com/43p0T1w.jpeg",
    after: "https://i.imgur.com/43p0T1w.jpeg",
    tags: ["Ácido Hialurónico", "Perfilado"]
  },
  {
    id: 3,
    title: "Rinomodelación & Mentón",
    description: "Equilibrio del perfil mediante puntos de luz estratégicos.",
    before: "https://i.imgur.com/KP4F1NB.jpeg",
    after: "https://i.imgur.com/KP4F1NB.jpeg",
    tags: ["Perfilamiento", "Sin Cirugía"]
  }
];

const BeforeAfter: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Reset slider position when changing cases
  useEffect(() => {
    setSliderPosition(50);
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % CASES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + CASES.length) % CASES.length);
  };

  const handleMove = (event: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!containerRef.current) return;

    const { left, width } = containerRef.current.getBoundingClientRect();
    let clientX;
    
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
    } else {
      clientX = (event as any).clientX;
    }

    const position = ((clientX - left) / width) * 100;
    setSliderPosition(Math.min(100, Math.max(0, position)));
  };

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleConsult = (caseTitle: string) => {
    // Dispatch event to pre-fill the contact form
    const event = new CustomEvent('prefillContact', { detail: { interest: caseTitle } });
    window.dispatchEvent(event);

    // Scroll smoothly to the contact form
    const element = document.getElementById('contact');
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (isDragging.current) {
        handleMove(e);
      }
    };
    
    window.addEventListener('mousemove', handleGlobalMove);
    window.addEventListener('touchmove', handleGlobalMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
        window.removeEventListener('mousemove', handleGlobalMove);
        window.removeEventListener('touchmove', handleGlobalMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchend', handleMouseUp);
    };
  }, []);

  const currentCase = CASES[currentIndex];

  return (
    <section id="results" className="py-24 md:py-32 px-6 bg-base overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
             <span className="text-gold text-xs uppercase tracking-widest mb-4 block">Galería de Transformaciones</span>
             <h2 className="font-serif text-4xl md:text-5xl text-charcoal mb-6">Resultados Reales</h2>
             <p className="font-sans text-taupe font-light tracking-wide text-lg">
                Desliza para descubrir el cambio. La evidencia de nuestra dedicación a la armonía natural.
             </p>
        </div>

        {/* Carousel Area */}
        <div className="relative max-w-6xl mx-auto">
            
            {/* Navigation Buttons */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-12 z-20">
                <button 
                    onClick={handlePrev}
                    className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center text-charcoal hover:bg-gold hover:text-white hover:border-gold transition-all duration-300 cursor-hover bg-white/50 backdrop-blur-sm"
                >
                    <ChevronLeft size={24} />
                </button>
            </div>
            
            <div className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-12 z-20">
                <button 
                    onClick={handleNext}
                    className="w-12 h-12 rounded-full border border-gold/30 flex items-center justify-center text-charcoal hover:bg-gold hover:text-white hover:border-gold transition-all duration-300 cursor-hover bg-white/50 backdrop-blur-sm"
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            {/* Main Slider Component */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Image Container */}
                <div className="lg:col-span-8 relative shadow-2xl rounded-sm overflow-hidden bg-charcoal/5">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="aspect-[4/5] md:aspect-[16/10] relative"
                        >
                            <div 
                                ref={containerRef}
                                className="relative w-full h-full cursor-col-resize select-none group touch-none"
                                onMouseDown={handleMouseDown}
                                onTouchStart={handleMouseDown}
                            >
                                {/* Image After (Background - Full Color) */}
                                <img 
                                    src={currentCase.after} 
                                    alt="Resultado Después" 
                                    className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
                                />
                                <span className="absolute top-6 right-6 font-sans text-[10px] uppercase tracking-widest text-charcoal bg-white/90 px-3 py-1 backdrop-blur-md z-10 rounded-sm">
                                    Después
                                </span>

                                {/* Image Before (Foreground - Clipped & Grayscale) */}
                                <div 
                                    className="absolute inset-0 overflow-hidden pointer-events-none border-r-2 border-white/80"
                                    style={{ width: `${sliderPosition}%` }}
                                >
                                    <img 
                                        src={currentCase.before} 
                                        alt="Resultado Antes" 
                                        className="absolute inset-0 w-full max-w-none h-full object-cover grayscale contrast-125 brightness-90" 
                                        style={{ width: '100%', maxWidth: 'none' }} // Ensure image doesn't squish
                                    />
                                     {/* Simple Overlay for text readability on before side */}
                                     <div className="absolute inset-0 bg-charcoal/10 mix-blend-multiply"></div>
                                     
                                     <span className="absolute top-6 left-6 font-sans text-[10px] uppercase tracking-widest text-white bg-charcoal/80 px-3 py-1 backdrop-blur-md rounded-sm">
                                        Antes
                                     </span>
                                </div>

                                {/* Slider Handle */}
                                <div 
                                    className="absolute top-0 bottom-0 w-1 bg-transparent cursor-col-resize z-20 flex items-center justify-center"
                                    style={{ left: `${sliderPosition}%` }}
                                >
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.2)] border border-white transform transition-transform group-hover:scale-110 -ml-1">
                                        <ChevronsLeftRight size={18} className="text-white drop-shadow-md" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Info Side */}
                <div className="lg:col-span-4 flex flex-col justify-center h-full">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.4 }}
                            className="bg-white p-8 md:p-10 shadow-lg border border-gold/10 relative"
                        >
                             <span className="absolute -top-6 left-8 text-6xl text-gold/10 font-serif font-bold">
                                0{currentCase.id}
                             </span>
                             
                             <div className="flex gap-2 mb-4 flex-wrap">
                                {currentCase.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-base text-[10px] uppercase tracking-widest text-gold-dark rounded-full">
                                        {tag}
                                    </span>
                                ))}
                             </div>

                             <h3 className="font-serif text-3xl text-charcoal mb-4 italic">
                                {currentCase.title}
                             </h3>
                             
                             <div className="w-12 h-px bg-gold mb-6"></div>
                             
                             <p className="font-sans font-light text-charcoal/70 leading-relaxed mb-8">
                                {currentCase.description}
                             </p>

                             <button 
                                onClick={() => handleConsult(currentCase.title)}
                                className="text-xs font-bold uppercase tracking-widest text-charcoal hover:text-gold transition-colors flex items-center gap-2 group cursor-hover"
                             >
                                Consultar este caso
                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                             </button>
                        </motion.div>
                    </AnimatePresence>

                    {/* Pagination Dots */}
                    <div className="flex gap-3 mt-8 justify-center lg:justify-start px-10">
                        {CASES.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`h-1 transition-all duration-300 rounded-full ${idx === currentIndex ? 'w-12 bg-gold' : 'w-4 bg-charcoal/20 hover:bg-gold/50'}`}
                                aria-label={`Go to case ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </div>
      </div>
    </section>
  );
};

export default BeforeAfter;