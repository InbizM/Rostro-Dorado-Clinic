import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { signInWithEmailAndPassword, signInWithCustomToken } from 'firebase/auth'; // Import password auth and custom token
import { auth } from '../../firebase';
import { ArrowRight, CheckCircle, Mail, Eye, EyeOff } from 'lucide-react';
import Navbar from '../Layout/Navbar';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otpCode, setOtpCode] = useState(''); // New state for OTP
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState<'idle' | 'otp_sent' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    const hasSentAutoCode = React.useRef(false);

    // Auto-handle redirect from Checkout
    React.useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
            if (location.state.autoSend && status === 'idle' && !hasSentAutoCode.current) {
                // Prevent double sending
                hasSentAutoCode.current = true;
                const autoEmail = location.state.email;
                handleSendCode(null, autoEmail);
            }
        }
    }, [location.state]);

    // Use emulator URL for local dev or production URL
    // Since we don't have the cloud functions URL yet, we must change this after deployment.
    // For now we assume local emulator default port 5001 or we will instruct user to deploy.
    // const FUNCTIONS_URL = 'http://127.0.0.1:5001/rostro-dorado-clinic/us-central1';
    // For production (after deploy): https://us-central1-rostro-dorado-clinic.cloudfunctions.net
    const guessFunctionsUrl = () => {
        if (window.location.hostname === 'localhost') {
            return 'http://127.0.0.1:5001/rostrodorado-80279/us-central1';
        }
        return 'https://us-central1-rostrodorado-80279.cloudfunctions.net';
    }
    const FUNCTIONS_URL = guessFunctionsUrl();


    const handleSendCode = async (e: React.FormEvent | null, manualEmail?: string) => {
        if (e) e.preventDefault();
        const targetEmail = manualEmail || email; // Use manual if provided

        setLoading(true);
        setStatus('idle');
        setErrorMessage('');

        try {
            // ADMIN LOGIN FLOW (Password)
            if (targetEmail === 'isauradorado@rostrodorado.com') {
                if (!password) {
                    // If admin enters email but no password yet, just let them see the password field
                    // (Handled by UI state)
                    if (status !== 'idle') return; // Don't loop
                } else {
                    const userCredential = await signInWithEmailAndPassword(auth, targetEmail, password);
                    console.log('Admin logged in:', userCredential.user.uid);
                    navigate('/admin');
                    return;
                }
            }

            // CUSTOMER OTP FLOW - STEP 1: SEND CODE
            const response = await fetch(`${FUNCTIONS_URL}/sendOtp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: targetEmail })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Error enviando código.');

            setStatus('otp_sent');

        } catch (error: any) {
            console.error(error);
            setStatus('error');
            if (error.code === 'auth/wrong-password') {
                setErrorMessage('Contraseña incorrecta.');
            } else {
                setErrorMessage(error.message || 'Error al conectar con el servidor.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

        try {
            // CUSTOMER OTP FLOW - STEP 2: VERIFY CODE
            const response = await fetch(`${FUNCTIONS_URL}/verifyOtp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code: otpCode })
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Código inválido.');

            // Sign in with custom token
            await signInWithCustomToken(auth, data.token);
            navigate('/productos'); // Or wherever

        } catch (error: any) {
            console.error(error);
            setStatus('error'); // Keep them on the form
            setErrorMessage(error.message || 'Código incorrecto. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f9f8f6] selection:bg-gold selection:text-white flex flex-col">

            <Navbar />

            <div className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gold/10 rounded-full blur-[120px] pointer-events-none"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white border border-gray-100 p-8 md:p-12 rounded-3xl relative overflow-hidden shadow-xl">

                        <div className="text-center mb-10">
                            <h1 className="font-serif text-3xl text-black mb-2">Bienvenido</h1>
                            <p className="text-gray-500 text-sm font-light">
                                {status === 'otp_sent'
                                    ? `Ingresa el código enviado a ${email}`
                                    : 'Ingresa tu correo para recibir un código de acceso'}
                            </p>
                        </div>

                        {status === 'otp_sent' ? (
                            <form onSubmit={handleVerifyCode} className="space-y-6">
                                {status === 'error' && errorMessage && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-xl text-center">
                                        {errorMessage}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-gray-400 ml-1">Código de Seguridad</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-black text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all placeholder:text-gray-200"
                                            placeholder="000000"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full relative overflow-hidden bg-black text-white font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-all duration-300 hover:bg-gold hover:text-black hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group mt-4 border border-transparent"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {loading ? 'Verificando...' : 'Verificar y Entrar'}
                                        {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStatus('idle')}
                                    className="w-full text-center text-xs text-gray-400 hover:text-black transition-colors"
                                >
                                    Enviar código a otro correo
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleSendCode} className="space-y-6">
                                {status === 'error' && errorMessage && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-xl text-center">
                                        {errorMessage}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-gray-400 ml-1">Email</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-black focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all pl-12 placeholder:text-gray-300"
                                            placeholder="tu@email.com"
                                        />
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    </div>
                                </div>

                                {/* Admin Password Field */}
                                {email === 'isauradorado@rostrodorado.com' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-2 overflow-hidden"
                                    >
                                        <label className="text-xs uppercase tracking-widest text-gray-400 ml-1">Contraseña Admin</label>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="w-full bg-gray-50 border border-gray-100 p-4 rounded-xl text-black focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/20 transition-all pl-12 placeholder:text-gray-300"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full relative overflow-hidden bg-black text-white font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-all duration-300 hover:bg-gold hover:text-black hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group mt-4 border border-transparent"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {loading ? 'Procesando...' : (email === 'isauradorado@rostrodorado.com' ? 'Iniciar Sesión Admin' : 'Enviar Código')}
                                        {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                                    </span>
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
