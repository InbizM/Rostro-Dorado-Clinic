import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, X, Sparkles, CalendarCheck } from 'lucide-react';
import { Treatment } from '../types';

// Updated to match the 4 main categories from the Menu Image
const treatments: (Treatment & { image: string })[] = [
    {
        id: 1,
        title: 'Armonización Facial',
        description: 'Protocolos de arquitectura facial: RostroDorado, Rinomodelación, Labios, Ojeras y Definición Mandibular.',
        image: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80',
        icon: ArrowUpRight
    },
    {
        id: 2,
        title: 'Toxina Botulínica',
        description: 'Suavizado de líneas de expresión, tratamiento de bruxismo, sonrisa gingival y sonrisa triste.',
        image: 'https://i.imgur.com/s80wdTi.jpeg',
        icon: ArrowUpRight
    },
    {
        id: 3,
        title: 'Calidad de Piel',
        description: 'Revitalización profunda: Peeling químico, Detox facial, NCTF 135HA y manejo de acné o manchas.',
        image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&q=80',
        icon: ArrowUpRight
    },
    {
        id: 4,
        title: 'Tecnologías & Bioestimulación',
        description: 'Regeneración avanzada con Endolift Láser, CO2, Harmonyca, Sculptra y Radiesse.',
        image: 'https://i.imgur.com/NmWewPA.jpeg',
        icon: ArrowUpRight
    },
];

const fullServiceList = [
    {
        category: "Armonización Facial",
        items: [
            "RostroDorado (Sustentación)",
            "Rinomodelación",
            "Corrección de ojeras",
            "Perfilamiento, aumento e hidratación de labios",
            "Skinbooster: hidratación profunda",
            "Manejo de arrugas profundas faciales",
            "Definición mandibular"
        ]
    },
    {
        category: "Toxina Botulínica (BOTOX)",
        items: [
            "Manejo de líneas de expresión",
            "Bruxismo",
            "Sonrisa triste",
            "Sonrisa gingival"
        ]
    },
    {
        category: "Calidad de Piel",
        items: [
            "Peeling químico",
            "Detox facial profundo",
            "Manejo de manchas",
            "Manejo de acné",
            "NCTF 135HA"
        ]
    },
    {
        category: "Bioestimulación & Tecnologías",
        items: [
            "Bioestimulación: Harmonyca, Sculptra, Radiesse",
            "Láser de CO2: poros, manchas, cauterización",
            "Endolift láser: Perfil facial definido, bye papada"
        ]
    }
];

const Treatments: React.FC = () => {
    const [activeTreatment, setActiveTreatment] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Function to handle booking from main list or modal
    const handleBook = (treatmentName: string) => {
        // Close modal if open
        setIsModalOpen(false);

        // Dispatch event to pre-fill the contact form
        const event = new CustomEvent('prefillContact', { detail: { interest: treatmentName } });
        window.dispatchEvent(event);

        // Scroll smoothly to the contact form
        setTimeout(() => {
            const element = document.getElementById('contact');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    };

    return (
        <section id="treatments" className="py-24 bg-charcoal text-base-white relative overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                {/* Left: List */}
                <div className="relative z-10">
                    <span className="text-gold text-xs uppercase tracking-widest mb-8 block">Nuestros Tratamientos</span>
                    <div className="flex flex-col border-t border-white/10">
                        {treatments.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onMouseEnter={() => setActiveTreatment(idx)}
                                className={`group py-8 border-b border-white/10 cursor-pointer transition-all duration-500 relative ${activeTreatment === idx ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
                                onClick={() => setActiveTreatment(idx)}
                            >
                                {/* Active Marker Line (Stable positioning) */}
                                {activeTreatment === idx && (
                                    <motion.div
                                        layoutId="activeLine"
                                        className="absolute left-0 top-0 bottom-0 w-[2px] bg-gold"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                )}

                                <div className="flex justify-between items-center pl-6">
                                    <h3 className={`font-serif text-3xl md:text-4xl transition-colors duration-300 ${activeTreatment === idx ? 'text-white italic' : 'text-white/80'}`}>
                                        {item.title}
                                    </h3>
                                    <ArrowUpRight className={`w-6 h-6 text-gold transition-all duration-300 ${activeTreatment === idx ? 'opacity-100 rotate-45' : 'opacity-0 -rotate-45'}`} />
                                </div>
                                <AnimatePresence>
                                    {activeTreatment === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden pl-6"
                                        >
                                            <p className="font-sans font-light text-white/60 mt-4 max-w-md leading-relaxed">
                                                {item.description}
                                            </p>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleBook(item.title);
                                                }}
                                                className="mt-6 flex items-center gap-3 px-6 py-3 border border-gold/30 rounded-sm text-gold text-xs uppercase tracking-widest hover:bg-gold hover:text-white hover:border-gold transition-all duration-300 group/btn"
                                            >
                                                Agendar Cita
                                                <ArrowUpRight size={14} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                    <div className="mt-12 pl-6">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-xs uppercase tracking-widest border-b border-gold pb-1 text-gold hover:text-white hover:border-white transition-colors cursor-hover"
                        >
                            Ver menú completo de servicios
                        </button>
                    </div>
                </div>

                {/* Right: Image Preview */}
                <div className="relative h-[600px] hidden lg:block sticky top-24">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={activeTreatment}
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="absolute inset-0 overflow-hidden rounded-sm"
                        >
                            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-charcoal/40 z-10"></div>
                            <img
                                src={treatments[activeTreatment].image}
                                alt={treatments[activeTreatment].title}
                                className="w-full h-full object-cover grayscale opacity-70"
                                width="800"
                                height="1000"
                                loading="lazy"
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Full Menu Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm cursor-pointer"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 50, scale: 0.95 }}
                            className="relative bg-[#FAF7F2] w-full max-w-5xl max-h-[90vh] rounded-lg shadow-2xl flex flex-col md:flex-row overflow-hidden"
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 z-20 p-2 text-charcoal/60 hover:text-charcoal hover:bg-black/5 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>

                            {/* Left Decorative Side (Desktop) */}
                            <div className="hidden md:flex w-1/3 bg-gold/10 flex-col items-center justify-center p-12 text-center border-r border-gold/20 flex-shrink-0">
                                <Sparkles className="text-gold w-12 h-12 mb-6" />
                                <h2 className="font-serif text-3xl text-charcoal mb-4">Menú de Servicios</h2>
                                <div className="w-12 h-px bg-gold mb-4"></div>
                                <p className="font-sans text-xs uppercase tracking-widest text-taupe mb-8">Rostro Dorado Clinic</p>
                                <p className="text-charcoal/60 font-serif text-sm italic">
                                    "Selecciona el tratamiento que deseas para ir directamente a tu reserva."
                                </p>
                            </div>

                            {/* Content List */}
                            <div className="flex-1 p-8 md:p-12 overflow-y-auto">
                                <div className="md:hidden text-center mb-8">
                                    <h2 className="font-serif text-3xl text-charcoal">Nuestros Servicios</h2>
                                    <div className="w-12 h-px bg-gold mx-auto mt-4"></div>
                                </div>

                                <div className="grid grid-cols-1 gap-y-12">
                                    {fullServiceList.map((category, idx) => (
                                        <div key={idx}>
                                            <h3 className="font-serif text-xl text-gold-dark mb-5 italic border-b border-gold/20 pb-2">
                                                {category.category}
                                            </h3>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                                                {category.items.map((item, i) => (
                                                    <li
                                                        key={i}
                                                        onClick={() => handleBook(item)}
                                                        className="group flex items-center justify-between gap-4 py-3 px-3 rounded-md hover:bg-gold/10 transition-colors cursor-pointer border-b border-dashed border-gold/10 md:border-none"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <span className="text-gold mt-2 w-1.5 h-1.5 rounded-full bg-gold shrink-0 block group-hover:scale-125 transition-transform"></span>
                                                            <span className="text-charcoal/80 font-sans text-sm font-light leading-relaxed group-hover:text-charcoal group-hover:font-medium transition-colors">
                                                                {item}
                                                            </span>
                                                        </div>

                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] uppercase tracking-wider text-gold font-bold whitespace-nowrap">
                                                            Agendar
                                                            <CalendarCheck size={12} />
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default Treatments;