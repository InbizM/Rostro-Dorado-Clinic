import React, { useState, useEffect } from 'react';
import { ArrowRight, Check, MapPin } from 'lucide-react';
import CustomSelect from './CustomSelect';
import { motion } from 'framer-motion';

const TREATMENTS = [
    "RostroDorado (Sustentación)",
    "Rinomodelación",
    "Corrección de ojeras",
    "Perfilamiento, aumento e hidratación de labios",
    "Skinbooster: hidratación profunda",
    "Manejo de arrugas profundas faciales",
    "Definición mandibular",
    "Manejo de líneas de expresión",
    "Bruxismo",
    "Sonrisa triste",
    "Sonrisa gingival",
    "Peeling químico",
    "Detox facial profundo",
    "Manejo de manchas",
    "Manejo de acné",
    "NCTF 135HA",
    "Bioestimulación: Harmonyca, Sculptra, Radiesse",
    "Láser de CO2: poros, manchas, cauterización",
    "Endolift láser: Perfil facial definido, bye papada",
    "Otro (especificar abajo)"
];

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        treatment: '',
        details: '',
        privacy: false
    });

    const [focusedField, setFocusedField] = useState<string | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);

    // Listen for prefill events from other components (Treatments, Before/After)
    useEffect(() => {
        const handlePrefill = (e: Event) => {
            const customEvent = e as CustomEvent;
            const interest = customEvent.detail?.interest;

            if (interest) {
                // Check if exact match exists in our list
                const exactMatch = TREATMENTS.find(t => t === interest);

                if (exactMatch) {
                    // If we found the exact service, select it
                    setFormData(prev => ({
                        ...prev,
                        treatment: exactMatch,
                        // If it was an exact match, we don't necessarily need to populate details, 
                        // unless user had already typed something.
                    }));
                    setFocusedField('treatment');
                } else {
                    // If it's a category name or something not in the list, select "Otro"
                    setFormData(prev => ({
                        ...prev,
                        treatment: "Otro (especificar abajo)",
                        details: prev.details ? prev.details : `Me interesa: ${interest}`
                    }));
                    setFocusedField('details');
                }

                // Visual feedback timeout
                setTimeout(() => setFocusedField(null), 2500);
            }
        };

        window.addEventListener('prefillContact', handlePrefill);
        return () => window.removeEventListener('prefillContact', handlePrefill);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTreatmentChange = (value: string) => {
        setFormData(prev => ({ ...prev, treatment: value }));
    };

    const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, privacy: e.target.checked }));
    };

    const openLegal = (e: React.MouseEvent, tab: 'terms' | 'privacy') => {
        e.preventDefault();
        e.stopPropagation();
        const event = new CustomEvent('openLegal', { detail: { tab } });
        window.dispatchEvent(event);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.privacy) return;

        // Construct WhatsApp Message
        const text = `Hola Dra. Isaura, ¡Quiero mi cita gratuita! ✨%0A%0A*Mis Datos:*%0A👤 Nombre: ${formData.name}%0A📱 Tel: ${formData.phone}%0A📧 Email: ${formData.email}%0A%0A*Me interesa:*%0A💉 ${formData.treatment || 'No especificado'}%0A📝 Detalles: ${formData.details || 'N/A'}`;

        // Open WhatsApp
        window.open(`https://wa.me/573126196527?text=${text}`, '_blank');
    };

    const inputClasses = (fieldName: string) => `
    w-full bg-transparent border-b py-4 text-base md:text-lg text-white font-serif
    focus:outline-none transition-all duration-300 placeholder-white/40
    ${focusedField === fieldName || formData[fieldName as keyof typeof formData] ? 'border-gold' : 'border-white/10'}
  `;

    return (
        <section id="contact" className="bg-base-white pt-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[700px]">

                {/* Map Side (5 Columns) */}
                <div className="lg:col-span-5 relative h-[400px] lg:h-auto w-full order-2 lg:order-1 overflow-hidden group bg-charcoal">
                    {/* Facade Loading for Map - Se ve igual pero no carga el iframe hasta interactuar */}
                    {!isMapLoaded ? (
                        <div
                            className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer group z-20 overflow-hidden"
                            onClick={() => setIsMapLoaded(true)}
                        >
                            {/* Background Image: Facade - UPDATED IMAGE */}
                            <div className="absolute inset-0 bg-[url('https://i.imgur.com/fw1q1bk.jpeg')] bg-cover bg-center transition-transform duration-[2000ms] ease-out group-hover:scale-105"></div>

                            {/* Dark Overlay for contrast */}
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>

                            {/* Elegant Button Container */}
                            <motion.div
                                className="relative z-10 flex flex-col items-center"
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/30 flex items-center justify-center mb-4 shadow-xl group-hover:bg-gold/90 group-hover:border-gold transition-all duration-300">
                                    <MapPin className="w-8 h-8 text-white group-hover:text-white transition-colors" />
                                </div>

                                <span className="text-sm uppercase tracking-[0.2em] text-white font-medium drop-shadow-md border-b border-transparent group-hover:border-white pb-1 transition-all text-center px-4">
                                    Ver ubicación en el mapa
                                </span>
                            </motion.div>
                        </div>
                    ) : (
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3916.634882756858!2d-72.9173475!3d11.5460254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e8b63efe7154287%3A0x45d8ddc4b8966f7f!2sRostro%20Dorado%20Clinic!5e0!3m2!1ses!2sco!4v1708305000000!5m2!1ses!2sco"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={true}
                            loading="lazy"
                            title="Ubicación Rostro Dorado Clinic"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="grayscale contrast-[0.9] hover:grayscale-0 transition-all duration-700"
                        ></iframe>
                    )}

                    {!isMapLoaded && <div className="absolute inset-0 bg-charcoal/20 pointer-events-none group-hover:bg-transparent transition-colors duration-700 z-10"></div>}

                    {/* Overlay Info for Mobile Map */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal to-transparent p-8 text-white lg:hidden z-30 pointer-events-none">
                        <p className="text-xs uppercase tracking-widest text-gold mb-1">Visítanos</p>
                        <p className="font-serif text-xl">Calle 12 #12-03 local 2, Riohacha</p>
                    </div>
                </div>

                {/* Form Side (7 Columns) */}
                <div className="lg:col-span-7 bg-[#0f0f0f] text-base-white p-8 md:p-16 xl:p-24 flex flex-col justify-center order-1 lg:order-2 relative overflow-hidden">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 rounded-full blur-[100px] pointer-events-none"></div>

                    <div className="relative z-10 max-w-xl mx-auto w-full">
                        <span className="inline-block py-1 px-3 border border-gold/30 rounded-full text-gold text-[10px] uppercase tracking-widest mb-6">
                            Agenda Abierta 2026
                        </span>

                        <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">
                            Tu mejor versión<br /> empieza aquí.
                        </h2>
                        <p className="font-sans text-white/50 font-light mb-12 text-sm md:text-base max-w-md">
                            Agenda tu valoración gratuita. Un espacio exclusivo para diseñar el plan perfecto para tu rostro.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-8 w-full">

                            {/* Nombre */}
                            <div className="group">
                                <label
                                    htmlFor="name"
                                    className={`block text-[10px] uppercase tracking-widest transition-colors duration-300 ${focusedField === 'name' ? 'text-gold' : 'text-white/70'}`}
                                >
                                    Nombre Completo *
                                </label>
                                <input
                                    id="name"
                                    required
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('name')}
                                    onBlur={() => setFocusedField(null)}
                                    type="text"
                                    className={inputClasses('name')}
                                    placeholder="Escribe tu nombre aquí"
                                />
                            </div>

                            {/* Contact Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label
                                        htmlFor="phone"
                                        className={`block text-[10px] uppercase tracking-widest transition-colors duration-300 ${focusedField === 'phone' ? 'text-gold' : 'text-white/70'}`}
                                    >
                                        Celular / WhatsApp *
                                    </label>
                                    <input
                                        id="phone"
                                        required
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('phone')}
                                        onBlur={() => setFocusedField(null)}
                                        type="tel"
                                        pattern="[3][0-9]{9}"
                                        title="Debe ser un número celular válido de Colombia (10 dígitos)"
                                        className={inputClasses('phone')}
                                        placeholder="300 000 0000"
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="email"
                                        className={`block text-[10px] uppercase tracking-widest transition-colors duration-300 ${focusedField === 'email' ? 'text-gold' : 'text-white/70'}`}
                                    >
                                        Correo Electrónico *
                                    </label>
                                    <input
                                        id="email"
                                        required
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        type="email"
                                        className={inputClasses('email')}
                                        placeholder="tu@correo.com"
                                    />
                                </div>
                            </div>

                            {/* Treatment Select - Custom Style */}
                            <div className="relative">
                                <label
                                    htmlFor="treatment"
                                    className={`block text-[10px] uppercase tracking-widest transition-colors duration-300 ${focusedField === 'treatment' ? 'text-gold' : 'text-white/70'}`}
                                >
                                    Tratamiento de Interés *
                                </label>
                                <div className="pt-2">
                                    <CustomSelect
                                        options={TREATMENTS}
                                        value={formData.treatment}
                                        onChange={handleTreatmentChange}
                                        placeholder="Selecciona una opción..."
                                        label=""
                                    />
                                </div>
                            </div>

                            {/* Details */}
                            <div>
                                <label
                                    htmlFor="details"
                                    className={`block text-[10px] uppercase tracking-widest transition-colors duration-300 ${focusedField === 'details' ? 'text-gold' : 'text-white/70'}`}
                                >
                                    Cuéntanos más (Opcional)
                                </label>
                                <textarea
                                    id="details"
                                    name="details"
                                    value={formData.details}
                                    onChange={handleChange}
                                    onFocus={() => setFocusedField('details')}
                                    onBlur={() => setFocusedField(null)}
                                    maxLength={150}
                                    rows={2}
                                    className={`${inputClasses('details')} resize-none`}
                                    placeholder="¿Qué te gustaría mejorar?"
                                />
                            </div>

                            {/* Custom Privacy Checkbox */}
                            <div className="flex items-start gap-4 pt-4 group">
                                <div className="relative flex items-center mt-1">
                                    <input
                                        required
                                        type="checkbox"
                                        id="privacy"
                                        checked={formData.privacy}
                                        onChange={handleCheckbox}
                                        className="peer h-5 w-5 cursor-pointer appearance-none border border-white/20 rounded-sm bg-transparent checked:bg-gold checked:border-gold transition-all duration-300"
                                    />
                                    <Check size={14} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-charcoal opacity-0 peer-checked:opacity-100 transition-opacity" />
                                </div>
                                <label htmlFor="privacy" className="text-xs font-light text-white/70 cursor-pointer select-none group-hover:text-white/80 transition-colors leading-relaxed">
                                    He leído y acepto los <button type="button" onClick={(e) => openLegal(e, 'terms')} className="p-1 -m-1 underline decoration-white/30 hover:decoration-gold hover:text-gold transition-colors font-medium inline-block">Términos y Condiciones</button> y autorizo el <button type="button" onClick={(e) => openLegal(e, 'privacy')} className="p-1 -m-1 underline decoration-white/30 hover:decoration-gold hover:text-gold transition-colors font-medium inline-block">Tratamiento de Datos Personales</button>.
                                </label>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full relative overflow-hidden bg-white text-charcoal hover:text-white font-bold py-5 px-8 transition-all duration-500 group shadow-[0_0_0_1px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(198,168,124,0.4)]"
                                >
                                    {/* Hover Background */}
                                    <div className="absolute inset-0 w-full h-full bg-gold scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ease-out"></div>

                                    <span className="relative z-10 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs">
                                        Confirmar Cita Gratuita
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
                                    </span>
                                </button>
                            </div>
                        </form>

                        <div className="mt-16 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-white/30 border-t border-white/5 pt-8 gap-4">
                            <span className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                Respuesta Inmediata
                            </span>
                            <span>Calle 12 #12-03 local 2, Riohacha</span>
                            <span className="hover:text-gold transition-colors cursor-pointer">+57 312 619 6527</span>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default Contact;