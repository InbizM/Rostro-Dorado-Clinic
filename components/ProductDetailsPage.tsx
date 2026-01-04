import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ShoppingBag, Star, Check, Play, ChevronDown, Sparkles, Droplets, Info } from 'lucide-react';
import Navbar from './Layout/Navbar';
import Footer from './Layout/Footer';
import FloatingWhatsApp from './FloatingWhatsApp';
import LegalModal from './LegalModal';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ProductDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeMedia, setActiveMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);
    const [openSection, setOpenSection] = useState<string | null>('benefits');

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchProduct = async () => {
            if (!id) {
                navigate('/productos');
                return;
            }
            try {
                const docRef = doc(db, 'products', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = { id: docSnap.id, ...docSnap.data() } as Product;
                    setProduct(data);
                    setActiveMedia({ type: 'image', url: data.image });
                } else {
                    navigate('/productos');
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                navigate('/productos');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, navigate]);

    if (loading || !product) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gold/20"></div>
                    <p className="text-white/30 text-sm">Cargando producto...</p>
                </div>
            </div>
        );
    }

    const handleBuy = () => {
        addToCart(product);
    };

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] selection:bg-gold selection:text-white flex flex-col">
            <Navbar />

            <main className="flex-grow pt-20">
                {/* Back Button - Sticky */}
                <div className="sticky top-[72px] z-30 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pb-4 -mx-4 md:mx-0 px-4 md:px-0">
                    <div className="max-w-6xl mx-auto px-4">
                        <button
                            onClick={() => navigate('/productos')}
                            className="flex items-center gap-2 text-white/40 hover:text-gold transition-colors text-xs uppercase tracking-widest py-3"
                        >
                            <ArrowLeft size={14} />
                            Catálogo
                        </button>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 pb-12">
                    {/* Main Product Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                        {/* Left: Image Gallery */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="lg:col-span-5"
                        >
                            {/* Main Image */}
                            <div className="relative rounded-2xl overflow-hidden aspect-square bg-gradient-to-br from-white/5 to-white/0 border border-white/10">
                                {activeMedia?.type === 'video' ? (
                                    <video
                                        src={activeMedia.url}
                                        controls
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <img
                                        src={activeMedia?.url || product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        referrerPolicy="no-referrer"
                                    />
                                )}

                                {/* Stock Badge */}
                                {product.stock !== undefined && (
                                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${product.stock > 0
                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                        }`}>
                                        {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                                    </div>
                                )}
                            </div>

                            {/* Thumbnails */}
                            {product.media && product.media.length > 0 && (
                                <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
                                    <button
                                        onClick={() => setActiveMedia({ type: 'image', url: product.image })}
                                        className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeMedia?.url === product.image
                                            ? 'border-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                                            : 'border-white/10 opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img src={product.image} className="w-full h-full object-cover" />
                                    </button>
                                    {product.media.map((item, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveMedia(item)}
                                            className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeMedia?.url === item.url
                                                ? 'border-gold shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                                                : 'border-white/10 opacity-60 hover:opacity-100'
                                                }`}
                                        >
                                            {item.type === 'video' ? (
                                                <div className="w-full h-full bg-black/50 flex items-center justify-center">
                                                    <Play size={18} className="text-white" />
                                                </div>
                                            ) : (
                                                <img src={item.url} className="w-full h-full object-cover" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </motion.div>

                        {/* Right: Product Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-7 space-y-4"
                        >
                            {/* Category Breadcrumb */}
                            <p className="text-gold/60 text-[10px] uppercase tracking-widest">
                                {product.category}
                            </p>

                            {/* Title & Rating */}
                            <div>
                                <h1 className="font-serif text-2xl md:text-3xl text-white leading-tight mb-2">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-1 text-gold">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} fill="currentColor" />
                                    ))}
                                    <span className="text-white/30 text-xs ml-1">(5.0)</span>
                                </div>
                            </div>

                            {/* Price Card */}
                            <div className="bg-gradient-to-r from-gold/10 to-gold/5 border border-gold/20 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">Precio</p>
                                    <p className="text-3xl font-serif text-gold">${product.price.toLocaleString()}</p>
                                </div>
                                <button
                                    onClick={handleBuy}
                                    disabled={!product.stock || product.stock <= 0}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold uppercase tracking-wider text-sm transition-all ${!product.stock || product.stock <= 0
                                        ? 'bg-white/10 text-white/30 cursor-not-allowed'
                                        : 'bg-gold text-black hover:bg-white hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                                        }`}
                                >
                                    <ShoppingBag size={16} />
                                    {!product.stock || product.stock <= 0 ? 'Agotado' : 'Agregar'}
                                </button>
                            </div>

                            {/* Short Description */}
                            <p className="text-white/60 text-sm leading-relaxed">
                                {product.description}
                            </p>

                            {/* Accordion Sections */}
                            <div className="space-y-2 pt-2">
                                {/* Benefits Section */}
                                {product.benefits && product.benefits.length > 0 && (
                                    <div className="border border-white/10 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => toggleSection('benefits')}
                                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Sparkles size={16} className="text-gold" />
                                                <span className="text-white text-sm font-medium">Beneficios</span>
                                            </div>
                                            <ChevronDown
                                                size={16}
                                                className={`text-white/40 transition-transform ${openSection === 'benefits' ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                        <AnimatePresence>
                                            {openSection === 'benefits' && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {product.benefits.map((benefit, i) => (
                                                            <div key={i} className="flex items-start gap-2 text-white/70 text-xs">
                                                                <Check size={12} className="text-gold mt-0.5 shrink-0" />
                                                                <span>{benefit}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* Ingredients Section */}
                                {product.ingredients && product.ingredients.length > 0 && (
                                    <div className="border border-white/10 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => toggleSection('ingredients')}
                                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Droplets size={16} className="text-gold" />
                                                <span className="text-white text-sm font-medium">Ingredientes Clave</span>
                                            </div>
                                            <ChevronDown
                                                size={16}
                                                className={`text-white/40 transition-transform ${openSection === 'ingredients' ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                        <AnimatePresence>
                                            {openSection === 'ingredients' && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-4 pb-4 flex flex-wrap gap-2">
                                                        {product.ingredients.map((ing, i) => (
                                                            <span
                                                                key={i}
                                                                className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-white/60 text-[11px]"
                                                            >
                                                                {ing}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* Usage Section */}
                                {product.usage && (
                                    <div className="border border-white/10 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => toggleSection('usage')}
                                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Info size={16} className="text-gold" />
                                                <span className="text-white text-sm font-medium">Modo de Uso</span>
                                            </div>
                                            <ChevronDown
                                                size={16}
                                                className={`text-white/40 transition-transform ${openSection === 'usage' ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                        <AnimatePresence>
                                            {openSection === 'usage' && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-4 pb-4">
                                                        <p className="text-white/60 text-xs leading-relaxed whitespace-pre-line">
                                                            {product.usage}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}

                                {/* Long Description Section */}
                                {product.longDescription && (
                                    <div className="border border-white/10 rounded-xl overflow-hidden">
                                        <button
                                            onClick={() => toggleSection('details')}
                                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Info size={16} className="text-gold" />
                                                <span className="text-white text-sm font-medium">Descripción Completa</span>
                                            </div>
                                            <ChevronDown
                                                size={16}
                                                className={`text-white/40 transition-transform ${openSection === 'details' ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                        <AnimatePresence>
                                            {openSection === 'details' && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-4 pb-4">
                                                        <p className="text-white/60 text-xs leading-relaxed whitespace-pre-line">
                                                            {product.longDescription}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
            <FloatingWhatsApp />
            <LegalModal />
        </div>
    );
};

export default ProductDetailsPage;
