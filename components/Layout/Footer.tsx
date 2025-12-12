import React from 'react';

const Footer: React.FC = () => {
  const openLegal = (e: React.MouseEvent, tab: 'terms' | 'privacy') => {
      e.preventDefault();
      const event = new CustomEvent('openLegal', { detail: { tab } });
      window.dispatchEvent(event);
  };

  return (
    <footer className="bg-charcoal text-white/40 py-8 text-center text-xs font-sans border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p>&copy; {new Date().getFullYear()} Rostro Dorado Clinic. Todos los derechos reservados.</p>
        
        <div className="flex gap-4 md:gap-8">
            <button 
                onClick={(e) => openLegal(e, 'terms')} 
                className="p-2 hover:text-gold transition-colors cursor-hover inline-block"
                aria-label="Ver términos y condiciones"
            >
                Términos y Condiciones
            </button>
            <button 
                onClick={(e) => openLegal(e, 'privacy')} 
                className="p-2 hover:text-gold transition-colors cursor-hover inline-block"
                aria-label="Ver política de privacidad"
            >
                Política de Privacidad
            </button>
        </div>

        <p>Diseño Web: Premium Aesthetics</p>
      </div>
    </footer>
  );
};

export default Footer;