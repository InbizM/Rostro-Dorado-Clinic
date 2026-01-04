import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Star } from 'lucide-react';
import { Product } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { products as FALLBACK_PRODUCTS } from '../data/products';
import { useCart } from '../context/CartContext';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface ProductsProps {
    preview?: boolean;
}

const Products: React.FC<ProductsProps> = ({ preview = false }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { addToCart } = useCart();

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'products'));
            const productsData: Product[] = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            } as Product));

            console.log('✅ Productos cargados desde Firebase:', productsData.length);
            setProducts(productsData);
        } catch (error) {
            console.error('❌ Error cargando productos de Firebase:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // Filter out out-of-stock products for customers, then apply preview slice
    const availableProducts = products.filter(p => p.stock && p.stock > 0);
    const displayProducts = preview ? availableProducts.slice(0, 3) : availableProducts;

    const handleBuy = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation(); // Prevent card click
        addToCart(product);
    };

    const handleCardClick = (id: string) => {
        navigate(`/productos/${id}`);
    };

    if (loading) {
        return (
            <section id="productos" className="bg-[#0a0a0a] py-24 relative overflow-hidden min-h-[60vh] flex items-center justify-center">
                <div className="container mx-auto px-6 text-center">
                    <div className="animate-pulse space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-gold/20"></div>
                        <p className="text-white/50">Cargando productos...</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section id="productos" className="bg-[#0a0a0a] py-24 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <span className="inline-block py-1 px-3 border border-gold/30 rounded-full text-gold text-[10px] uppercase tracking-widest mb-4">
                        Tienda Exclusiva
                    </span>
                    <h2 className="font-serif text-4xl md:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60 mb-6">
                        {preview ? 'Productos Destacados' : 'Catálogo Completo'}
                    </h2>
                    <p className="font-sans text-white/50 max-w-2xl mx-auto font-light">
                        Complementa tus tratamientos con nuestra línea de productos de grado dermatológico.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {displayProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleCardClick(product.id)}
                            className="group bg-white/5 border border-white/10 hover:border-gold/30 rounded-xl overflow-hidden transition-all duration-500 hover:bg-white/[0.07] cursor-pointer"
                        >
                            {/* Image Container */}
                            <div className="h-64 overflow-hidden relative">
                                <div className="absolute top-4 right-4 z-20 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                                    <span className="text-xs text-white uppercase tracking-wider">{product.category}</span>
                                </div>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0"
                                    referrerPolicy="no-referrer"
                                />
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60"></div>
                            </div>

                            <div className="p-8">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-serif text-xl text-white group-hover:text-gold transition-colors">{product.name}</h3>
                                    <div className="flex text-gold text-xs gap-0.5">
                                        <Star size={12} fill="currentColor" />
                                        <Star size={12} fill="currentColor" />
                                        <Star size={12} fill="currentColor" />
                                        <Star size={12} fill="currentColor" />
                                        <Star size={12} fill="currentColor" />
                                    </div>
                                </div>

                                <p className="text-white/50 text-sm mb-6 font-light line-clamp-2 min-h-[2.5em]">
                                    {product.description}
                                </p>

                                <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-auto">
                                    <span className="text-2xl font-serif text-white">
                                        ${product.price.toLocaleString()}
                                    </span>

                                    <button
                                        onClick={(e) => handleBuy(e, product)}
                                        className="flex items-center gap-2 text-xs uppercase tracking-widest text-white hover:text-gold transition-colors group/btn z-10"
                                    >
                                        Agregar
                                        <div className="bg-white/10 p-2 rounded-full group-hover/btn:bg-gold group-hover/btn:text-black transition-all">
                                            <ShoppingBag size={16} />
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* View All Button - Only in Preview Mode */}
                {preview && (
                    <div className="text-center mt-12">
                        <Link
                            to="/productos"
                            onClick={(e) => {
                                // Scroll to top when navigating
                                window.scrollTo(0, 0);
                            }}
                            className="inline-flex items-center gap-3 bg-transparent border border-white/20 hover:border-gold text-white hover:text-gold px-8 py-4 uppercase tracking-[0.2em] text-xs transition-all duration-300 group"
                        >
                            Ver Todos Los Productos
                            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
};

export default Products;
