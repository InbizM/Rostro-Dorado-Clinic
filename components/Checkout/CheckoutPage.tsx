import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react'; // Removing Loader, using custom spinner or simple text
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Navbar from '../Layout/Navbar';
import { useAuth } from '../../context/AuthContext';
import Footer from '../Layout/Footer';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { COLOMBIA_DATA } from '../../data/colombia';
import CustomSelect from '../CustomSelect';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { UserProfile, Address } from '../../types';
import {
    loadWompiScript,
    generateSignature,
    WOMPI_PUBLIC_KEY,
    WOMPI_INTEGRITY_SECRET,
    WompiWidgetConfig
} from '../../utils/wompi';
import { showToast } from '../../components/ToastContainer';

const CheckoutPage: React.FC = () => {
    const { cart, cartTotal, clearCart } = useCart();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        email: '',
        newsbox: true, // "Enviarme novedades..."
        firstName: '',
        lastName: '',
        identification: '', // Cédula
        address: '',
        apartment: '',
        department: '',
        city: '',
        postalCode: '', // Optional
        phone: '',
        saveInfo: true, // "Guardar mi información..."
        notes: ''
    });

    const [billingOption, setBillingOption] = useState<'same' | 'different'>('same');

    // Load User Data if logged in
    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({
                ...prev,
                email: currentUser.email || '',
                firstName: currentUser.displayName?.split(' ')[0] || '',
                lastName: currentUser.displayName?.split(' ').slice(1).join(' ') || ''
            }));
            // Ideally we would fetch saved addresses here too, but for this redesign ensuring Guest Flow is priority.
            // We can add address pre-fill optimization later.
        }
    }, [currentUser]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const cities = COLOMBIA_DATA.find(d => d.departamento === formData.department)?.ciudades || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await loadWompiScript();

            // 1. Create Order in Firebase
            const orderData = {
                userId: currentUser?.uid || 'guest',
                customer: {
                    ...formData,
                    // Combine legacy name field if ever needed by other components, or rely on split names
                    name: `${formData.firstName} ${formData.lastName}`.trim()
                },
                items: cart,
                total: cartTotal,
                status: 'pending',
                createdAt: serverTimestamp(),
                paymentMethod: 'wompi'
            };

            const docRef = await addDoc(collection(db, 'orders'), orderData);
            console.log("Order created:", docRef.id);

            // 2. Prepare Wompi Data
            const amountInCents = cartTotal * 100;
            const currency = 'COP';
            const reference = docRef.id;
            const integritySignature = await generateSignature(reference, amountInCents, currency, WOMPI_INTEGRITY_SECRET);

            const checkoutConfig: WompiWidgetConfig = {
                currency,
                amountInCents,
                reference,
                publicKey: WOMPI_PUBLIC_KEY,
                signature: { integrity: integritySignature },
                redirectUrl: 'https://rostrodorado-clinic.web.app/mis-pedidos',
                customerData: {
                    email: formData.email,
                    fullName: `${formData.firstName} ${formData.lastName}`,
                    phoneNumber: formData.phone,
                    phoneNumberPrefix: '+57',
                    legalId: formData.identification,
                    legalIdType: 'CC'
                },
                shippingAddress: {
                    addressLine1: formData.address + (formData.apartment ? ` Apto/Oficina ${formData.apartment}` : ''),
                    city: formData.city,
                    phoneNumber: formData.phone,
                    region: formData.department,
                    country: 'CO'
                }
            };

            // @ts-ignore
            const checkout = new WidgetCheckout(checkoutConfig);
            document.body.style.overflow = 'hidden';

            checkout.open(async (result: any) => {
                document.body.style.overflow = 'auto';
                const transaction = result.transaction;

                if (transaction.status === 'APPROVED') {
                    setSuccess(true);
                    clearCart();

                    // Update Order & Create Payment Record logic...
                    const orderRef = doc(db, 'orders', docRef.id);
                    await updateDoc(orderRef, {
                        status: 'processing',
                        paymentStatus: 'approved',
                        transactionId: transaction.id
                    });

                    // Add Payment Record... (Simplified for brevity, similar to previous)
                    await addDoc(collection(db, 'payments'), {
                        id: transaction.id,
                        orderId: docRef.id,
                        userId: currentUser?.uid || 'guest',
                        amountInCents: transaction.amountInCents,
                        status: transaction.status,
                        paymentMethod: transaction.paymentMethodType,
                        reference: transaction.reference,
                        createdAt: serverTimestamp(),
                        customerEmail: transaction.customerEmail
                    });

                } else if (transaction.status === 'DECLINED' || transaction.status === 'ERROR') {
                    showToast('Transacción rechazada o error. Intenta nuevamente.', 'error');
                }
            });

        } catch (error) {
            console.error("Error:", error);
            showToast('Error al iniciar el pago.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-[#fff] flex flex-col items-center justify-center text-center px-6 text-black">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-lg w-full"
                >
                    <CheckCircle size={64} className="text-black mx-auto mb-6" />
                    <h1 className="font-serif text-3xl mb-4">¡Gracias por tu compra!</h1>
                    <p className="mb-8 font-light">
                        Hemos recibido tu pedido. Te enviaremos un correo con la confirmación.
                    </p>
                    <Link to="/" className="inline-block bg-black text-white uppercase tracking-widest text-xs font-bold px-8 py-4 hover:opacity-80 transition-opacity">
                        Volver al Inicio
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center px-6">
                <Navbar /> {/* Ensure Navbar handles light mode or force dark if needed, but this redesign implies a clean look */}
                <h1 className="font-serif text-3xl text-black mb-4">Tu carrito está vacío</h1>
                <Link to="/productos" className="text-gray-500 hover:text-black underline">Volver a comprar</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-[#333] selection:bg-gray-200">
            {/* Header / Logo Only for Checkout */}
            <div className="py-8 border-b border-gray-100 flex justify-between items-center px-6 md:px-12 max-w-[1400px] mx-auto">
                <Link to="/" className="flex flex-col items-center group">
                    <div className="h-8 md:h-10 w-auto text-black">
                        <svg
                            version="1.2"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 825 82"
                            className="w-full h-full fill-current"
                            aria-label="Rostro Dorado"
                        >
                            <path d="m784.75 4.34c17.7-1.86 33.61 10.89 35.63 28.58 2.03 17.69-10.58 33.71-28.25 35.9-17.91 2.21-34.18-10.59-36.23-28.52-2.05-17.92 10.9-34.07 28.85-35.96zm7.4 63.21c6.22-1.67 11.58-4.45 14.6-10.43 9.83-19.43 5.83-53.5-22.42-51.34-15.83 4.24-20.28 19.86-19.43 34.4 1 16.98 9.23 28.36 27.25 27.37z" />
                            <path d="m505.07 4.4c17.74-1.55 33.4 11.51 35.06 29.23 1.67 17.73-11.28 33.48-29 35.26-17.88 1.8-33.81-11.3-35.49-29.2-1.68-17.89 11.53-33.73 29.43-35.29zm6.73 63.08c16.91-4.84 20.62-19.77 19.3-35.54-1.32-15.66-9.31-27.37-26.71-26.2-6.25 1.52-11.9 4.47-14.93 10.42-9.99 19.57-6.27 53.43 22.34 51.32z" />
                            <path d="m108.02 4.86c6.42-0.94 16.53 2.1 21.2 6.27 20.7 18.5 13.89 56.31-16.82 58.23-42.49 1.58-44.85-60.23-4.38-64.5zm6.79 62.64c18.44-4.89 20.71-27.9 16.41-43.62-3.48-12.68-12.19-17.87-25.05-17.13-3.03 0.87-5.63 1.79-8.19 3.79-14.59 11.44-14.81 45.75 2.14 55.15 4.56 2.52 9.66 2.51 14.69 1.81z" />
                            <path d="m366.18 4.84c13.14-2.05 27.1 7.4 30.95 19.69 6.49 20.69-1.26 41.39-24.27 44.63-8.66 0.28-15.22-0.15-22.65-5.56-14.46-10.52-16.23-33.61-5.7-47.43 5.53-7.27 12.86-10.31 21.67-11.33zm6.74 62.78c2.15-0.54 4.88-1.3 6.75-2.47 16.32-10.12 16.04-46.36-0.69-56.05-4.38-2.53-8.85-2.66-13.73-2.36-6.33 1.78-11.69 4.91-14.64 11.01-9.49 19.64-6.05 52.05 22.31 49.87z" />
                            <path d="m409.9 5.24q10.07-0.16 20.15-0.19c26.95 0.16 39.72 17.14 32.93 43.73-1.36 5.33-5.11 10.03-9.12 13.73-13.97 9.48-28.06 5.12-45.01 5.93 6.04-11.09 2.67-28.45 3.49-41.12 0.46-7.02 0.07-15.48-2.44-22.08zm9.7 61.34c10.82 0.78 19.83 0.67 28.52-6.91l0.39-0.35c13.45-15.18 11.24-43.84-10.11-50.75-6.7-2.17-11.91-1.99-18.92-1.88 0.03 18.3-0.78 42.15 0.12 59.89z" />
                            <path d="m690.46 5.17c24.38 0.11 54.69-4.15 55.11 32.48 0.11 9.73-3.17 17.37-10.21 24.25-11.81 9.56-30.02 6.12-45.11 6.52 4.62-8.57 4.44-54.31 0.21-63.25zm10.21 61.65c10.22 0.8 19.37 0.69 27.61-6.37q0.59-0.51 1.17-1.04c16.07-18.6 8.3-51.48-18.94-52.62-3.35-0.14-6.44-0.09-9.79 0.01q-0.39 18.14-0.27 36.29c0 7.05-0.28 16.9 0.22 23.73z" />
                            <path d="m553.87 5.17c10.27 0.07 34.89-1.61 42.78 2 15.88 7.25 13.85 27.84-3.99 34.13 10.44 6.48 11.13 15.06 19.05 25.19 8.11 10.37 16.66 15.77 30.47 11.36 2.44-0.78 7.46-5.7 9.78-5.38-1.83 3.15-7.82 6.38-11.16 7.62q-1.16 0.37-2.33 0.66c-5.48 1.4-11.16 1.2-16.56 0.09-22.42-4.6-23.55-30.9-37.49-39.27q-10.42-0.03-20.83 0.08c0.19 8.74-1.7 19.2 2.59 26.53l-13.19 0.23c0.62-1.02 1.24-2.05 1.72-3.14 2.56-5.83 2.16-46.37 1.07-53.98-0.3-2.13-1.11-4.13-1.91-6.12zm9.6 34.97c9.59 0.09 23.58 1.61 31-4.19 3.88-4.15 5.12-7.01 5.06-12.72-0.18-19.8-22.08-16.64-35.68-16.36-0.7 10.15-0.45 22.94-0.38 33.27z" />
                            <path d="m11.63 6.18c9.72-0.29 35.77-1.47 43.18 2 4.35 2.03 7.8 5.62 9.34 10.21 1.6 4.79 1.49 9.73-0.89 14.16-3 5.59-6.55 7.97-12.54 9.74 12.44 6.88 15.74 30.43 32.71 36.26 12.16 4.19 17.03-1.18 25.68-5.27l0.55-0.26c-5.02 5.22-7.33 6.59-14.26 8.5-16.81 2.27-29.28-3.35-37.57-18.27-4.66-8.4-6.85-15.24-15.16-20.7-7.37-0.62-14.13 0.25-21.23-0.32 0.38 9.79-1.72 17.44 2.51 26.32-4.23 0.14-8.7 0.1-12.95 0.13 6.3-10.96 2.52-41.97 2.89-55.32 0.05-1.65-1.54-5.47-2.26-7.18zm9.83 34.93c9.61 0.01 23.44 1.42 31.04-4.27 8.68-10.38 5.64-27.14-9.17-28.95-6.58-0.8-15.16-0.26-21.95-0.21 0.48 10.13 0.11 23.07 0.08 33.43z" />
                            <path d="m270.54 5.89c10.56 0.06 35.7-1.46 44.03 2.97 4.22 2.25 7.29 5.98 8.53 10.62 1.27 4.83 0.99 10.19-1.73 14.48-2.56 4.05-6.46 6.66-11.1 7.69q-0.32 0.07-0.64 0.13l-0.1 0.62c11.62 4.84 14.57 26 25.98 33.38 2.29 1.48 4.36 2.32 6.82 3.41-6.67-0.55-9.94-0.58-15.86-3.96-12.46-8.09-11.1-24.15-24.97-32.74-7.28-0.49-14.28 0.22-21.4-0.2 0.26 9.44-2.18 18.49 2.59 26.19-4.08 0.23-8.71 0.15-12.84 0.16 5.56-10.23 1.85-30.87 2.93-42.79 0.52-5.78 0.09-14.66-2.24-19.96zm9.72 35.1c9.77 0.3 23.02 1.59 30.86-4.08 5.87-7.24 7.64-18.28-0.24-25.12-6.66-5.78-21.49-4.18-30.44-4.09-0.48 9.85-0.51 23.34-0.18 33.29z" />
                            <path d="m649.57 3.99c1.68 1.95 4.44 9.28 5.59 12.06l11.82 28.81c3.45 8.47 6.04 17.79 13.04 23.84-2.62-0.34-13.8-0.26-14.98-0.85 2.46-5.11-2.26-13.17-4.15-18.52-3.59 0.13-7.95 0-11.6-0.02q-8.05 0.39-16.1 0.31c-2.11 5.15-5.72 11.53-4.11 16.95l0.29 0.93-0.43 0.75c-1.47 0.72-5.06 0.04-8.37 0.57l-0.73 0.12c6.55-4.67 9.04-13.71 11.9-21.01l10.09-25.87c2.24-5.73 4.81-12.75 7.74-18.07zm-15.74 43.8c4.61 0.28 8.34 0.3 12.96 0.26h13.41c-1.91-4.89-11.6-30.77-13.52-33.03-4.2 10.66-8.49 22.3-12.85 32.77z" />
                            <path d="m174.71 4.9c10.57 0.21 15.83 2.81 23.79 9.07-0.89 1.48-2.11 3.13-3.12 4.57-6.78-8.98-17.59-15.58-29.68-10.01-3.94 1.82-5.46 5.52-6.55 9.54 5.46 17.08 37.54 15.49 40.53 33.38 2.08 12.42-10.73 17.2-21.58 17.82-9.85 0.07-18.14-1.96-25.57-8.72l3.08-4.56c6.21 8.22 12.01 11.64 22.52 11.62 4.55-0.01 9.91-1.25 13.11-4.74 1.74-1.93 2.58-4.51 2.32-7.1-1.66-17.28-55.51-17.72-36.71-44.4 3.58-5.06 12.13-6.15 17.86-6.47z" />
                            <path d="m207.78 5.7c6.14 0.64 14.58 0.46 20.85 0.45l31.26-0.13 0.08 6.6c-8.08-6.13-12.6-5.14-22.31-5.01 0.35 13.49-0.13 29.69-0.16 43.43-0.13 7.36-0.45 10.79 2.52 17.62l-12.65-0.04c4.42-6.85 3.13-17.8 3.12-25.89l-0.1-35.18c-10.45-0.56-14.99-0.42-23.51 5.58 0.21-2.43 0.59-5.01 0.9-7.43z" />
                        </svg>
                    </div>
                    <span className="font-sans font-medium text-[10px] uppercase tracking-[0.4em] mt-1 text-black">
                        Clinic
                    </span>
                </Link>
                {/* Bag Icon with count? */}
            </div>

            <main className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2">

                {/* LEFT COLUMN: FORM */}
                <div className="p-6 md:p-12 lg:pr-24 border-r border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-12">

                        {/* 1. Contacto */}
                        <section>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-medium">Contacto</h2>
                                {!currentUser && (
                                    <Link to="/login" className="text-sm underline text-gray-500 hover:text-black">Iniciar sesión</Link>
                                )}
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Correo electrónico"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full border border-gray-300 rounded p-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors mb-2"
                            />
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="newsbox"
                                    name="newsbox"
                                    // checked={formData.newsbox}
                                    onChange={handleChange}
                                    className="accent-black w-4 h-4 rounded border-gray-300"
                                />
                                <label htmlFor="newsbox" className="text-sm text-gray-600">Enviarme novedades y ofertas por correo electrónico</label>
                            </div>
                        </section>

                        {/* 2. Entrega */}
                        <section>
                            <h2 className="text-xl font-medium mb-4">Entrega</h2>

                            <div className="space-y-3">
                                {/* Country */}
                                <div className="border border-gray-300 rounded p-3 text-gray-600 text-sm bg-gray-50">
                                    País / Región <br />
                                    <span className="text-black font-medium">Colombia</span>
                                </div>

                                {/* Names */}
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="text" name="firstName" placeholder="Nombre"
                                        value={formData.firstName} onChange={handleChange} required
                                        className="w-full border border-gray-300 rounded p-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                                    />
                                    <input
                                        type="text" name="lastName" placeholder="Apellidos"
                                        value={formData.lastName} onChange={handleChange} required
                                        className="w-full border border-gray-300 rounded p-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                                    />
                                </div>

                                {/* ID */}
                                <input
                                    type="text" name="identification" placeholder="Cédula"
                                    value={formData.identification} onChange={handleChange} required
                                    className="w-full border border-gray-300 rounded p-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                                />

                                {/* Address */}
                                <input
                                    type="text" name="address" placeholder="Dirección"
                                    value={formData.address} onChange={handleChange} required
                                    className="w-full border border-gray-300 rounded p-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                                />

                                {/* Apartment */}
                                <input
                                    type="text" name="apartment" placeholder="Casa, apartamento, etc. (opcional)"
                                    value={formData.apartment} onChange={handleChange}
                                    className="w-full border border-gray-300 rounded p-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                                />

                                {/* City / Dept Grid */}
                                <div className="grid grid-cols-3 gap-3">
                                    {/* Using standard selects for now to match the "clean" aesthetic or refactor CustomSelect to be light theme */}
                                    {/* Department Mockup - using CustomSelect logic but inline for light theme integration */}
                                    <div className="relative col-span-1">
                                        <select
                                            name="department"
                                            value={formData.department}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setFormData(prev => ({ ...prev, department: val, city: '' }));
                                            }}
                                            required
                                            className="w-full border border-gray-300 rounded p-3 text-sm focus:border-black appearance-none bg-white"
                                        >
                                            <option value="">Depto</option>
                                            {COLOMBIA_DATA.map(d => <option key={d.departamento} value={d.departamento}>{d.departamento}</option>)}
                                        </select>
                                    </div>

                                    <div className="relative col-span-1">
                                        <select
                                            name="city"
                                            value={formData.city}
                                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                            required
                                            disabled={!formData.department}
                                            className="w-full border border-gray-300 rounded p-3 text-sm focus:border-black appearance-none bg-white disabled:bg-gray-100"
                                        >
                                            <option value="">Ciudad</option>
                                            {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>

                                    <input
                                        type="text" name="postalCode" placeholder="Código postal (opc)"
                                        value={formData.postalCode} onChange={handleChange}
                                        className="col-span-1 w-full border border-gray-300 rounded p-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                                    />
                                </div>

                                {/* Phone */}
                                <div className="relative">
                                    <input
                                        type="tel" name="phone" placeholder="Teléfono"
                                        value={formData.phone} onChange={handleChange} required
                                        className="w-full border border-gray-300 rounded p-3 text-sm focus:border-black focus:ring-1 focus:ring-black outline-none transition-colors"
                                    />
                                    <div className="absolute right-3 top-3 text-gray-400 text-xs flex items-center gap-1">
                                        <span className="text-lg">🇨🇴</span>
                                    </div>
                                </div>

                                {/* Save Info Checkbox */}
                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        type="checkbox"
                                        id="saveInfo"
                                        name="saveInfo"
                                        // checked={formData.saveInfo}
                                        onChange={handleChange}
                                        className="accent-black w-4 h-4 rounded border-gray-300"
                                    />
                                    <label htmlFor="saveInfo" className="text-sm text-gray-600">Guardar mi información y consultar más rápidamente la próxima vez</label>
                                </div>

                            </div>
                        </section>

                        {/* 3. Métodos de envío */}
                        <section>
                            <h2 className="text-xl font-medium mb-4">Métodos de envío</h2>
                            <div className="border border-gray-300 rounded p-4 flex justify-between items-center bg-gray-50">
                                <span className="text-sm text-gray-800">Compras superiores a $500.000</span>
                                <span className="font-bold text-sm">GRATIS</span>
                            </div>
                        </section>

                        {/* 4. Pago */}
                        <section>
                            <h2 className="text-xl font-medium mb-2">Pago</h2>
                            <p className="text-sm text-gray-500 mb-4">Todas las transacciones son seguras y están encriptadas.</p>

                            <div className="border border-gray-300 rounded overflow-hidden">
                                <div className="bg-gray-50 p-4 border-b border-gray-300 flex justify-between items-center">
                                    <span className="font-medium text-sm">Wompi (Tarjetas, PSE, Nequi)</span>
                                    <div className="flex gap-1">
                                        <span className="bg-white border px-1 rounded text-[10px font-bold">VISA</span>
                                        <span className="bg-white border px-1 rounded text-[10px font-bold">MC</span>
                                    </div>
                                </div>
                                <div className="p-8 text-center bg-gray-50/50">
                                    <div className="w-24 h-16 border-2 border-dashed border-gray-300 mx-auto rounded mb-4 flex items-center justify-center">
                                        <span className="text-xs text-gray-400">Wompi Widget</span>
                                    </div>
                                    <p className="text-sm text-gray-600 px-8">
                                        Después de hacer clic en "Pagar ahora", serás redirigido a Wompi para completar tu compra de forma segura.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* 5. Facturación */}
                        <section>
                            <h2 className="text-xl font-medium mb-4">Dirección de facturación</h2>
                            <div className="border border-gray-300 rounded overflow-hidden">
                                <label className="flex items-center gap-3 p-4 border-b border-gray-300 cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio" name="billing"
                                        checked={billingOption === 'same'}
                                        onChange={() => setBillingOption('same')}
                                        className="accent-black w-4 h-4"
                                    />
                                    <span className="text-sm">La misma dirección de envío</span>
                                </label>
                                <label className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50">
                                    <input
                                        type="radio" name="billing"
                                        checked={billingOption === 'different'}
                                        onChange={() => setBillingOption('different')}
                                        className="accent-black w-4 h-4"
                                    />
                                    <span className="text-sm">Usar una dirección de facturación distinta</span>
                                </label>
                            </div>
                            {billingOption === 'different' && (
                                <div className="mt-4 p-4 bg-gray-50 border border-gray-300 rounded text-sm text-gray-500 text-center">
                                    La facturación detallada estará disponible pronto. Por ahora usaremos la dirección de envío.
                                </div>
                            )}
                        </section>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white font-bold py-5 rounded-lg text-xl hover:opacity-90 transition-opacity"
                        >
                            {loading ? 'Redirigiendo a Wompi...' : 'Pagar ahora'}
                        </button>

                    </form>
                </div>

                {/* RIGHT COLUMN: ORDER SUMMARY */}
                <div className="p-6 md:p-12 bg-gray-50 lg:min-h-screen">
                    {/* Item List */}
                    <div className="space-y-6 mb-8">
                        {cart.map((item) => (
                            <div key={item.id} className="flex gap-4 items-center">
                                <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg relative flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                                    <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
                                        {item.quantity}
                                    </span>
                                </div>
                                <div className="flex-grow">
                                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                                    <p className="text-xs text-gray-500">{item.quantity > 1 ? `${item.quantity} unidades` : ''}</p>
                                </div>
                                <p className="text-sm font-medium text-gray-800">
                                    ${(item.price * item.quantity).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-gray-200 pt-6 space-y-3 text-sm text-gray-600">
                        <div className="flex justify-between">
                            <span>Subtotal • {cart.reduce((ack, item) => ack + item.quantity, 0)} artículos</span>
                            <span className="font-bold text-gray-800">${cartTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Envío</span>
                            <span className="text-gray-800">GRATIS</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 mt-6 pt-6 flex justify-between items-center">
                        <span className="text-xl font-medium text-gray-800">Total</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-xs text-gray-500">COP</span>
                            <span className="text-3xl font-bold text-black">${cartTotal.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default CheckoutPage;
