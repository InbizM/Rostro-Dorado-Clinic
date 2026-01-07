import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth, db } from '../../firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    LogOut,
    Menu,
    X,
    TrendingUp,
    AlertCircle,
    Server,
    Database,
    CreditCard,
    Activity,
    Clock,
    FolderTree,
    MessageCircle,
} from 'lucide-react';

import { parseFirestoreDate } from '../../utils/dateUtils';

import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import AdminUsers from './AdminUsers';
import AdminPayments from './AdminPayments';
import SystemStatus from './SystemStatus';
import SalesChart from './SalesChart';
import AdminChats from './AdminChats';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalUsers: 0
    });
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [salesData, setSalesData] = useState<{ date: string; sales: number }[]>([]);

    const [recentActivities, setRecentActivities] = useState<any[]>([]);

    useEffect(() => {
        fetchStats();
        fetchRecentActivity();
        fetchSalesData();
    }, []);

    const fetchSalesData = async () => {
        try {
            const now = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);

            const q = query(collection(db, 'orders'), orderBy('createdAt', 'asc'));
            const querySnapshot = await getDocs(q);

            const dailySales: { [key: string]: number } = {};

            // Initialize last 30 days with 0
            for (let i = 29; i >= 0; i--) {
                const d = new Date();
                d.setDate(now.getDate() - i);
                const dateKey = d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' });
                dailySales[dateKey] = 0;
            }

            querySnapshot.docs.forEach(doc => {
                const data = doc.data();
                if (data.createdAt) {
                    const date = parseFirestoreDate(data.createdAt);
                    if (date && date >= thirtyDaysAgo) {
                        const dateKey = date.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' });
                        if (dailySales[dateKey] !== undefined) {
                            dailySales[dateKey] += data.total || 0;
                        }
                    }
                }
            });

            const formattedData = Object.keys(dailySales).map(date => ({
                date,
                sales: dailySales[date]
            }));

            setSalesData(formattedData);

        } catch (error) {
            console.error("Error fetching sales data:", error);
        }
    };

    const fetchStats = async () => {
        try {
            const ordersSnapshot = await getDocs(collection(db, 'orders'));
            const usersSnapshot = await getDocs(collection(db, 'users'));

            const orders = ordersSnapshot.docs.map(doc => doc.data());
            const totalSales = orders.reduce((sum, order: any) => sum + (order.total || 0), 0);

            setStats({
                totalSales,
                totalOrders: ordersSnapshot.size,
                totalUsers: usersSnapshot.size
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const fetchRecentActivity = async () => {
        try {
            // Fetch last 5 orders
            const ordersQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
            const ordersSnapshot = await getDocs(ordersQ);
            const orders = ordersSnapshot.docs.map(doc => ({
                id: doc.id,
                type: 'ORDER',
                data: doc.data(),
                date: doc.data().createdAt
            }));

            // Fetch last 5 payments
            const paymentsQ = query(collection(db, 'payments'), orderBy('createdAt', 'desc'), limit(5));
            const paymentsSnapshot = await getDocs(paymentsQ);
            const payments = paymentsSnapshot.docs.map(doc => ({
                id: doc.id,
                type: 'PAYMENT',
                data: doc.data(),
                date: doc.data().createdAt
            }));

            // Fetch last 5 users
            const usersQ = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5));
            const usersSnapshot = await getDocs(usersQ);
            const users = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                type: 'USER',
                data: doc.data(),
                date: doc.data().createdAt
            }));

            // Combine and sort
            const combined = [...orders, ...payments, ...users]
                .sort((a, b) => {
                    const dateA = parseFirestoreDate(a.date)?.getTime() || 0;
                    const dateB = parseFirestoreDate(b.date)?.getTime() || 0;
                    return dateB - dateA;
                })
                .slice(0, 10); // keep top 10 most recent across all categories

            setRecentActivities(combined);

        } catch (error) {
            console.error("Error fetching recent activity:", error);
        }
    };

    const formatDate = (timestamp: any) => {
        const date = parseFirestoreDate(timestamp);
        if (!date) return 'Reciente';

        const now = new Date();
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

        if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
        if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} horas`;
        return new Intl.DateTimeFormat('es-CO', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
    };

    const handleViewOrder = (orderId: string) => {
        setSelectedOrderId(orderId);
        setActiveTab('orders');
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const menuItems = [
        { id: 'overview', label: 'Resumen', icon: LayoutDashboard },
        { id: 'chats', label: 'Chats', icon: MessageCircle },
        { id: 'orders', label: 'Pedidos', icon: ShoppingBag },
        { id: 'payments', label: 'Pagos', icon: CreditCard },
        { id: 'products', label: 'Productos', icon: Package },
        { id: 'users', label: 'Usuarios', icon: Users },
        { id: 'system', label: 'Sistema', icon: Server },
    ];

    const renderActivityItem = (item: any) => {
        switch (item.type) {
            case 'ORDER':
                return (
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-500/20 text-blue-500 rounded-lg">
                                <ShoppingBag size={20} />
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">Nuevo Pedido <span className="text-gold font-mono">#{item.id.slice(0, 6)}</span></p>
                                <p className="text-white/50 text-xs">de {item.data.customer?.name || 'Cliente'}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-white font-medium text-sm">${item.data.total?.toLocaleString()}</p>
                            <p className="text-white/40 text-xs flex items-center gap-1 justify-end">
                                <Clock size={10} /> {formatDate(item.date)}
                            </p>
                        </div>
                    </div>
                );
            case 'PAYMENT':
                return (
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-green-500/20 text-green-500 rounded-lg">
                                <CreditCard size={20} />
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">Pago Recibido</p>
                                <p className="text-white/50 text-xs">Ref: {item.id}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-green-500 font-medium text-sm">+${(item.data.amountInCents / 100)?.toLocaleString()}</p>
                            <p className="text-white/40 text-xs flex items-center gap-1 justify-end">
                                <Clock size={10} /> {formatDate(item.date)}
                            </p>
                        </div>
                    </div>
                );
            case 'USER':
                return (
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-purple-500/20 text-purple-500 rounded-lg">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-white text-sm font-medium">Nuevo Usuario</p>
                                <p className="text-white/50 text-xs">{item.data.displayName || item.data.email}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-white/40 text-xs flex items-center gap-1 justify-end">
                                <Clock size={10} /> {formatDate(item.date)}
                            </p>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    // ... existing overview code ...
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-serif text-white mb-8">Panel de Control</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { title: 'Ventas Totales', value: `$${stats.totalSales.toLocaleString()}`, icon: TrendingUp, color: 'text-green-500' },
                                    { title: 'Pedidos', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-blue-500' },
                                    { title: 'Usuarios', value: stats.totalUsers.toString(), icon: Users, color: 'text-purple-500' },
                                ].map((stat, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-white/5 border border-white/10 p-6 rounded-2xl"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`p-3 bg-white/5 rounded-xl ${stat.color}`}>
                                                <stat.icon size={24} />
                                            </div>
                                        </div>
                                        <h3 className="text-white/50 text-sm uppercase tracking-wide mb-1">{stat.title}</h3>
                                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </div>


                        {/* Sales Chart Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <SalesChart data={salesData} />
                        </motion.div>

                        {/* Recent Activity Section */}
                        <div>
                            <h3 className="text-xl font-serif text-white mb-6 flex items-center gap-2">
                                <Activity className="text-gold" />
                                Actividad Reciente
                            </h3>
                            <div className="grid gap-4">
                                {recentActivities.length > 0 ? (
                                    recentActivities.map(item => (
                                        <motion.div
                                            key={`${item.type}-${item.id}`}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                        >
                                            {renderActivityItem(item)}
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-white/30 bg-white/5 rounded-xl border border-white/5">
                                        No hay actividad reciente.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            case 'chats':
                return <AdminChats />;
            case 'orders':
                return <AdminOrders highlightOrderId={selectedOrderId} />;
            case 'payments':
                return <AdminPayments onViewOrder={handleViewOrder} />;
            case 'products':
                return <AdminProducts />;
            case 'users':
                return <AdminUsers />;
            case 'system':
                return <SystemStatus />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex">
            {/* Sidebar */}
            <motion.aside
                initial={{ x: -300 }}
                animate={{ x: isSidebarOpen ? 0 : -300 }}
                className={`fixed lg:sticky lg:top-0 inset-y-0 left-0 z-50 w-64 bg-[#111] border-r border-white/10 transform transition-transform duration-300 ease-in-out flex flex-col h-screen ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
            >
                <div className="p-8 border-b border-white/10 flex-shrink-0">
                    <h1 className="text-xl font-serif text-gold">Rostro Dorado</h1>
                    <p className="text-xs text-white/50 uppercase tracking-widest mt-1">Admin Panel</p>
                </div>

                <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${activeTab === item.id ? 'bg-gold text-black font-bold' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10 space-y-2 flex-shrink-0 bg-[#111]">
                    <button
                        onClick={() => setActiveTab('system')}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-colors ${activeTab === 'system' ? 'text-blue-500 bg-blue-500/10' : 'text-blue-500 hover:bg-blue-500/10'}`}
                    >
                        <Database size={20} />
                        <span>Estado BD</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
                    >
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#0a0a0a] relative">
                <header className="bg-[#111] border-b border-white/10 p-4 sticky top-0 z-40 flex justify-between items-center lg:hidden">
                    <div className="text-gold font-serif">Rostro Dorado</div>
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white">
                        {isSidebarOpen ? <X /> : <Menu />}
                    </button>
                </header>

                <div className="p-8 lg:p-12 max-w-7xl mx-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
