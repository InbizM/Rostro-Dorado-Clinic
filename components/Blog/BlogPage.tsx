import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { BlogPost } from '../../types';

const BlogPage = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const q = query(
                    collection(db, 'posts'),
                    where('published', '==', true)
                );
                const snapshot = await getDocs(q);
                const fetchedPosts = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as BlogPost[];
                setPosts(fetchedPosts);
            } catch (error) {
                console.error("Error fetching blog posts:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

    return (
        <div className="bg-base min-h-screen pt-24 pb-20">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="text-center mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-serif text-4xl md:text-5xl text-charcoal mb-4"
                    >
                        Blog & Actualidad
                    </motion.h1>
                    <p className="font-sans text-gray-500 max-w-2xl mx-auto">
                        Descubre los secretos de la medicina estética, consejos de cuidado en casa y las últimas tendencias en tratamientos.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center h-64 items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <motion.div
                                    key={post.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 group"
                                >
                                    <Link to={`/blog/${post.slug}`} className="block h-full">
                                        <div className="relative h-64 overflow-hidden">
                                            <img
                                                src={post.coverImage}
                                                alt={post.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors"></div>
                                        </div>
                                        <div className="p-6">
                                            <span className="text-xs font-bold text-gold tracking-widest uppercase mb-2 block">
                                                ARTÍCULO
                                            </span>
                                            <h2 className="font-serif text-2xl text-charcoal mb-3 group-hover:text-gold transition-colors line-clamp-2">
                                                {post.title}
                                            </h2>
                                            <p className="text-gray-500 font-sans text-sm mb-4 line-clamp-3">
                                                {post.excerpt}
                                            </p>
                                            <div className="text-xs text-gray-400 font-sans border-t border-gray-100 pt-4 flex justify-between">
                                                <span>{post.author}</span>
                                                <span>{new Date(post.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20 text-gray-400">
                                <p>Aún no hay artículos publicados. ¡Pronto más novedades!</p>
                            </div>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
};

export default BlogPage;
