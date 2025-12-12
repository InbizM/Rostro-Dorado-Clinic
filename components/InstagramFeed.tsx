import React from 'react';
import { motion } from 'framer-motion';
import { Instagram, ExternalLink, ArrowRight } from 'lucide-react';

const InstagramFeed: React.FC = () => {
  return (
    <section className="py-24 bg-base-white relative overflow-hidden">
        {/* Decorative background text */}
        <div className="absolute top-10 right-0 w-full text-right pointer-events-none opacity-[0.02]">
            <span className="text-[10rem] leading-none font-serif text-charcoal">SOCIAL</span>
        </div>

        <div className="max-w-[1200px] mx-auto px-6">
            <div className="mb-12 text-center lg:text-left">
                <span className="text-gold text-xs uppercase tracking-widest mb-2 block">Connect With Us</span>
                <a href="https://www.instagram.com/rostrodoradoclinic" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 group cursor-hover">
                    <h2 className="font-serif text-3xl md:text-4xl text-charcoal group-hover:text-gold transition-colors">
                        @rostrodoradoclinic
                    </h2>
                    <ExternalLink size={20} className="text-charcoal group-hover:text-gold transition-colors opacity-0 group-hover:opacity-100 transform translate-y-1 group-hover:translate-y-0 duration-300" />
                </a>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                
                {/* Featured Video Embed (Left Side) */}
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="w-full flex justify-center lg:justify-end"
                >
                    <div className="w-full max-w-[400px] overflow-hidden rounded-xl shadow-2xl border border-charcoal/5 bg-white relative">
                        <iframe 
                            src="https://www.instagram.com/p/DHG0tQXuEew/embed" 
                            className="w-full aspect-[4/5]"
                            style={{ minHeight: '600px', border: 'none', overflow: 'hidden' }}
                            scrolling="no"
                            title="Rostro Dorado Clinic Instagram Video"
                            loading="lazy"
                        ></iframe>
                    </div>
                </motion.div>

                {/* Biography / Context Text (Right Side) */}
                <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="flex flex-col gap-6 lg:max-w-lg"
                >
                    <div>
                        <span className="font-sans text-gold text-xs uppercase tracking-widest mb-3 block">La visión detrás de la clínica</span>
                        <h3 className="font-serif text-3xl md:text-4xl text-charcoal leading-tight mb-4">
                            Arte, Ciencia y <br/>
                            <span className="italic text-taupe">Empatía Médica.</span>
                        </h3>
                    </div>

                    <p className="font-serif text-lg text-charcoal/80 font-light leading-relaxed">
                        "En mis redes sociales no solo comparto resultados, sino el proceso humano detrás de cada transformación. 
                        Para mí, la medicina estética es el equilibrio perfecto entre la precisión técnica y la visión artística."
                    </p>

                    <p className="font-sans text-sm text-charcoal/60 leading-relaxed">
                        A través de @rostrodoradoclinic, la Dra. Isaura Dorado abre las puertas de su consultorio para mostrar la realidad 
                        de los tratamientos, desmitificar procedimientos y educar sobre el cuidado de la piel con honestidad y transparencia.
                    </p>

                    <div className="pt-4">
                        <a 
                            href="https://www.instagram.com/rostrodoradoclinic" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-3 text-charcoal uppercase tracking-widest text-xs font-medium hover:text-gold transition-colors cursor-hover"
                        >
                            Ver más contenido exclusivo
                            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-300" />
                        </a>
                    </div>
                </motion.div>
            </div>
        </div>
    </section>
  );
};

export default InstagramFeed;