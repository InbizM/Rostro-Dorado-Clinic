import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { Order } from '../../types';
import { Package, Calendar, User, MapPin, ChevronDown, ChevronUp, Download, MessageCircle } from 'lucide-react';
import OrderChat from '../OrderChat';

interface AdminOrdersProps {
    highlightOrderId?: string | null;
}

const AdminOrders: React.FC<AdminOrdersProps> = ({ highlightOrderId }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
    const [chatOrder, setChatOrder] = useState<Order | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (highlightOrderId && !loading && orders.length > 0) {
            setExpandedOrder(highlightOrderId);
            // Optionally scroll to element after a brief delay to ensure render
            setTimeout(() => {
                const element = document.getElementById(`order-${highlightOrderId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }, [highlightOrderId, loading, orders.length]);

    const fetchOrders = async () => {
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Firestore timeout')), 3000)
        );

        try {
            const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
            const querySnapshot = await Promise.race([getDocs(q), timeoutPromise]) as any;
            const ordersData: Order[] = querySnapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data()
            } as Order));
            setOrders(ordersData);
        } catch (error) {
            console.error("Error fetching orders:", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
        try {
            await updateDoc(doc(db, 'orders', orderId), {
                status: newStatus
            });
            setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        } catch (error) {
            console.error("Error updating order:", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500/20 text-yellow-500';
            case 'processing': return 'bg-blue-500/20 text-blue-500';
            case 'shipped': return 'bg-purple-500/20 text-purple-500';
            case 'delivered': return 'bg-green-500/20 text-green-500';
            case 'cancelled': return 'bg-red-500/20 text-red-500';
            default: return 'bg-gray-500/20 text-gray-500';
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '';
        const date = timestamp.toDate();
        return new Intl.DateTimeFormat('es-CO', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date);
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'processing': return 'Procesando';
            case 'shipped': return 'Enviado';
            case 'delivered': return 'Entregado';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    const exportToCSV = () => {
        const headers = ['ID', 'Fecha', 'Cliente', 'Email', 'Teléfono', 'Total', 'Estado', 'Estado Pago'];
        const rows = orders.map(order => [
            order.id,
            order.createdAt ? order.createdAt.toDate().toLocaleDateString() : '',
            order.customer.name,
            order.customer.email,
            order.customer.phone,
            order.total,
            order.status,
            order.paymentStatus || 'pending'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `pedidos_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return <div className="text-white/50">Cargando pedidos...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-serif text-white">Gestión de Pedidos</h2>
                <div className="flex items-center gap-4">
                    <button
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors border border-white/10"
                    >
                        <Download size={18} />
                        <span className="text-sm">Exportar CSV</span>
                    </button>
                    <div className="text-white/50 text-sm">Total: {orders.length} pedidos</div>
                </div>
            </div>

            <div className="space-y-4">
                {orders.map((order) => (
                    <motion.div
                        id={`order-${order.id}`}
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`bg-white/5 border rounded-xl overflow-hidden transition-all duration-300 ${highlightOrderId === order.id ? 'border-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'border-white/10'
                            }`}
                    >
                        <div
                            className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
                            onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        >
                            <div className="flex flex-wrap gap-4 items-center justify-between">
                                <div className="flex-1 min-w-[200px]">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="font-mono text-gold text-sm">#{order.id.slice(0, 8)}</span>
                                        <span className={`text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold ${getStatusColor(order.status)}`}>
                                            {getStatusText(order.status)}
                                        </span>
                                        {/* Payment Status Badge */}
                                        {order.paymentStatus && (
                                            <span className={`text-xs px-3 py-1 rounded-full uppercase tracking-wider font-bold ${order.paymentStatus === 'approved'
                                                ? 'bg-green-500/20 text-green-500'
                                                : 'bg-red-500/20 text-red-500'
                                                }`}>
                                                {order.paymentStatus === 'approved' ? 'PAGADO' : 'NO PAGADO'}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-white/50 text-sm">
                                        <Calendar size={14} />
                                        {formatDate(order.createdAt)}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-white/70 text-sm">
                                    <User size={14} />
                                    {order.customer.name}
                                </div>

                                <div className="text-right">
                                    <p className="text-xs uppercase tracking-widest text-white/50 mb-1">Total</p>
                                    <p className="font-serif text-xl text-white">${order.total.toLocaleString()}</p>
                                </div>

                                {expandedOrder === order.id ? <ChevronUp className="text-gold" /> : <ChevronDown className="text-white/50" />}
                            </div>
                        </div>

                        {expandedOrder === order.id && (
                            <div className="border-t border-white/10 bg-black/20 p-6 space-y-6">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="text-xs uppercase tracking-widest text-gold mb-4">Productos</h4>
                                        <div className="space-y-3">
                                            {order.items?.map((item, idx) => (
                                                <div key={idx} className="flex gap-4 items-center bg-white/5 p-3 rounded-lg">
                                                    <div className="w-12 h-12 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-white text-sm font-medium">{item.name}</p>
                                                        <p className="text-white/50 text-xs">Cant: {item.quantity} x ${item.price.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            )) || <p className="text-white/30 text-sm">Sin productos</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs uppercase tracking-widest text-gold mb-4">Información del Cliente</h4>
                                        <div className="space-y-2 text-sm text-white/70 bg-white/5 p-4 rounded-lg">
                                            <p><span className="text-white/30 uppercase text-xs block mb-1">Nombre:</span> {order.customer.name}</p>
                                            <p><span className="text-white/30 uppercase text-xs block mb-1">Email:</span> {order.customer.email}</p>
                                            <p><span className="text-white/30 uppercase text-xs block mb-1">Teléfono:</span> {order.customer.phone}</p>
                                            <p><span className="text-white/30 uppercase text-xs block mb-1">Dirección:</span> {order.customer.address}</p>
                                            <p><span className="text-white/30 uppercase text-xs block mb-1">Ubicación:</span> {order.customer.city}, {order.customer.department}</p>
                                            {order.customer.notes && (
                                                <p className="mt-3"><span className="text-white/30 uppercase text-xs block mb-1">Notas:</span> "{order.customer.notes}"</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs uppercase tracking-widest text-gold mb-4">Cambiar Estado</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {(['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as Order['status'][]).map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => updateOrderStatus(order.id, status)}
                                                className={`px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-bold transition-colors ${order.status === status
                                                    ? getStatusColor(status)
                                                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                                                    }`}
                                            >
                                                {getStatusText(status)}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Chat Button */}
                                    <button
                                        onClick={() => setChatOrder(order)}
                                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold rounded-lg transition-colors border border-gold/30"
                                    >
                                        <MessageCircle size={18} />
                                        <span className="text-sm font-bold uppercase tracking-wider">Chat con Cliente</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}

                {orders.length === 0 && (
                    <div className="bg-white/5 border border-white/10 p-12 rounded-xl text-center">
                        <Package size={48} className="text-white/20 mx-auto mb-4" />
                        <p className="text-white/50">No hay pedidos registrados</p>
                    </div>
                )}
            </div>

            {/* Order Chat Modal */}
            {chatOrder && (
                <OrderChat
                    order={chatOrder}
                    isOpen={!!chatOrder}
                    onClose={() => setChatOrder(null)}
                    isAdmin={true}
                />
            )}
        </div>
    );
};

export default AdminOrders;
