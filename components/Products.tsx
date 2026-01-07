import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, Star, Search } from 'lucide-react';
import { Product } from '../types';
import Loader from './Loader';
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
    const [searchTerm, setSearchTerm] = useState('');
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

    // Filter out out-of-stock products for customers, then apply search and preview slice
    const availableProducts = products.filter(p => p.stock && p.stock > 0);
    const filteredProducts = availableProducts.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const displayProducts = preview ? filteredProducts.slice(0, 3) : filteredProducts;

    const handleBuy = (e: React.MouseEvent, product: Product) => {
        e.stopPropagation(); // Prevent card click
        addToCart(product);
    };

    const handleCardClick = (id: string) => {
        navigate(`/productos/${id}`);
    };

    if (loading) {
        return (
            <section id="productos" className="bg-[#f9f8f6] py-24 relative overflow-hidden min-h-[60vh] flex items-center justify-center">
                <div className="container mx-auto px-6 text-center">
                    <Loader className="text-gold" size={120} />
                </div>
            </section>
        );
    }

    return (
        <section id="productos" className="bg-[#f9f8f6] py-12 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-gold/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gray-100 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-8">
                    <span className="inline-block py-0.5 px-2 border border-gold/50 rounded-full text-gold text-[10px] uppercase tracking-widest mb-2">
                        Tienda Exclusiva
                    </span>
                    <h2 className="font-serif text-3xl md:text-4xl text-black mb-3">
                        {preview ? 'Productos Destacados' : 'Catálogo Completo'}
                    </h2>
                    <p className="font-sans text-gray-500 max-w-2xl mx-auto font-light text-sm">
                        Complementa tus tratamientos con nuestra línea de productos de grado dermatológico.
                    </p>
                </div>

                {/* Search Bar - Only show when NOT in preview mode or if preferred */}
                {!preview && (
                    <div className="max-w-md mx-auto mb-12 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-gray-400 text-black"
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                    {displayProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => handleCardClick(product.id)}
                            className="group bg-white border border-gray-100 hover:border-gold/50 rounded-xl overflow-hidden transition-all duration-500 hover:shadow-lg cursor-pointer flex flex-col sm:flex-row h-auto sm:h-72"
                        >
                            {/* Image Container */}
                            <div className="h-64 sm:h-auto sm:w-2/5 relative shrink-0">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    referrerPolicy="no-referrer"
                                />
                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
                            </div>

                            <div className="p-6 md:p-8 flex flex-col flex-grow justify-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">
                                    {product.category}
                                </span>

                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="font-serif text-xl sm:text-2xl text-black group-hover:text-gold transition-colors leading-tight">
                                        {product.name}
                                    </h3>
                                </div>

                                <div className="flex text-gold text-xs gap-0.5 mb-4">
                                    <Star size={12} fill="currentColor" />
                                    <Star size={12} fill="currentColor" />
                                    <Star size={12} fill="currentColor" />
                                    <Star size={12} fill="currentColor" />
                                    <Star size={12} fill="currentColor" />
                                </div>

                                <p className="text-gray-500 text-sm mb-6 font-light line-clamp-2">
                                    {product.description}
                                </p>

                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                    <span className="text-2xl font-serif text-black">
                                        ${product.price.toLocaleString()}
                                    </span>

                                    <button
                                        onClick={(e) => handleBuy(e, product)}
                                        className="flex items-center gap-3 text-xs uppercase tracking-widest text-black font-medium hover:text-gold transition-colors group/btn z-10"
                                    >
                                        Agregar
                                        <div className="bg-gray-100 p-2.5 rounded-full group-hover/btn:bg-gold group-hover/btn:text-black transition-all">
                                            <ShoppingBag size={18} />
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
                            className="inline-flex items-center gap-3 bg-transparent border border-black/20 hover:border-gold text-black hover:text-gold px-8 py-4 uppercase tracking-[0.2em] text-xs transition-all duration-300 group"
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
