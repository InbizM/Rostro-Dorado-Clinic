import React from 'react';
import { motion } from 'framer-motion';

const FloatingWhatsApp: React.FC = () => {
  const scrollToContact = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.a
      href="#contact"
      onClick={scrollToContact}
      className="fixed bottom-8 right-8 z-50 group cursor-hover"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative flex items-center gap-3 px-6 py-3 bg-black/20 backdrop-blur-md border border-white/10 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:bg-[#111111] hover:border-gold/40 hover:shadow-[0_10px_30px_rgba(198,168,124,0.2)] transition-all duration-500 overflow-hidden">
        
        {/* Shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
        
        {/* Status Indicator */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
        </span>

        {/* Text - White on glass, Gold on solid hover */}
        <span className="relative z-10 font-serif italic text-sm text-white/90 tracking-widest uppercase group-hover:text-gold transition-colors duration-300">
          Contáctanos
        </span>
      </div>
    </motion.a>
  );
};

export default FloatingWhatsApp;