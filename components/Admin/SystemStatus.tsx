import React, { useState, useEffect, useRef } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../../firebase';
import { initializeDatabase } from '../../utils/initializeDatabase';
import { Database, Activity, Server, FileText, Users, ShoppingBag, Play, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const SystemStatus: React.FC = () => {
    const [stats, setStats] = useState({
        products: 0,
        orders: 0,
        users: 0,
        addresses: 0
    });
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState(false);
    const [logs, setLogs] = useState<string[]>([]);
    const logsEndRef = useRef<HTMLDivElement>(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [productsCount, ordersCount, usersCount, addressesCount] = await Promise.all([
                getCountFromServer(collection(db, 'products')),
                getCountFromServer(collection(db, 'orders')),
                getCountFromServer(collection(db, 'users')),
                getCountFromServer(collection(db, 'addresses'))
            ]);

            setStats({
                products: productsCount.data().count,
                orders: ordersCount.data().count,
                users: usersCount.data().count,
                addresses: addressesCount.data().count
            });
        } catch (error) {
            console.error("Error fetching system stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const handleInitDB = async () => {
        const confirm = window.confirm("¿Inicializar la base de datos? Esto creará las colecciones si no existen.");
        if (!confirm) return;

        setInitializing(true);
        setLogs([]); // Clear previous logs
        setLogs(prev => [...prev, "🏁 Iniciando proceso..."]);

        await initializeDatabase((msg) => {
            setLogs(prev => [...prev, msg]);
        });

        setLogs(prev => [...prev, "🏁 Proceso finalizado."]);
        setInitializing(false);
        fetchStats(); // Refresh stats after init
    };

    const statCards = [
        { label: 'Productos', count: stats.products, icon: Database, color: 'text-gold' },
        { label: 'Pedidos', count: stats.orders, icon: ShoppingBag, color: 'text-blue-500' },
        { label: 'Usuarios', count: stats.users, icon: Users, color: 'text-green-500' },
        { label: 'Direcciones', count: stats.addresses, icon: Activity, color: 'text-purple-500' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-serif text-white">Estado del Sistema</h2>
                <button
                    onClick={fetchStats}
                    className="text-white/50 hover:text-white text-sm flex items-center gap-2"
                >
                    <Activity size={14} /> Refrescar datos
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors"
                    >
                        <stat.icon className={`mb-2 ${stat.color}`} size={24} />
                        <span className="text-2xl font-bold text-white">{loading ? '-' : stat.count}</span>
                        <span className="text-xs text-white/50 uppercase tracking-widest">{stat.label}</span>
                    </motion.div>
                ))}
            </div>

            {/* Granular Controls */}
            <div className="flex gap-4 flex-wrap">
                <button
                    onClick={handleInitDB}
                    disabled={initializing}
                    className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700 flex items-center gap-2"
                >
                    <Plus size={16} /> Crear Productos
                </button>
                <button
                    onClick={handleInitDB}
                    disabled={initializing}
                    className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700 flex items-center gap-2"
                >
                    <Plus size={16} /> Crear Pedidos
                </button>
                <button
                    onClick={handleInitDB}
                    disabled={initializing}
                    className="bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-700 flex items-center gap-2"
                >
                    <Plus size={16} /> Crear Usuarios
                </button>
            </div>

            {/* Initialization & Logs */}
            <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <Server size={18} className="text-gold" /> Consola de Inicialización
                    </h3>
                    <button
                        onClick={handleInitDB}
                        disabled={initializing}
                        className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all
                            ${initializing
                                ? 'bg-white/10 text-white/50 cursor-not-allowed'
                                : 'bg-gold text-black hover:bg-white'
                            }`}
                    >
                        {initializing ? <Activity className="animate-spin" size={16} /> : <Play size={16} />}
                        {initializing ? 'Procesando...' : 'Inicializar BD'}
                    </button>
                </div>

                <div className="h-64 bg-black p-4 overflow-y-auto font-mono text-xs text-green-400 space-y-1">
                    {logs.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-white/20">
                            <FileText size={32} className="mb-2" />
                            <p>Esperando comandos...</p>
                            <p className="text-[10px]">Pulsa "Inicializar BD" para comenzar</p>
                        </div>
                    ) : (
                        logs.map((log, i) => (
                            <div key={i} className="border-l-2 border-green-500/30 pl-2">
                                <span className="text-white/30 mr-2">{new Date().toLocaleTimeString()}</span>
                                {log}
                            </div>
                        ))
                    )}
                    <div ref={logsEndRef} />
                </div>
            </div>
        </div>
    );
};

export default SystemStatus;
