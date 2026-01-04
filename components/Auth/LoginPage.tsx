import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { sendSignInLinkToEmail } from 'firebase/auth';
import { auth } from '../../firebase';
import { ArrowRight, CheckCircle, Mail } from 'lucide-react';
import Navbar from '../Layout/Navbar';

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus('idle');
        setErrorMessage('');

        const actionCodeSettings = {
            // URL you want to redirect back to. The domain (www.example.com) for this
            // URL must be in the authorized domains list in the Firebase Console.
            url: window.location.origin + '/verify-login',
            handleCodeInApp: true,
        };

        try {
            await sendSignInLinkToEmail(auth, email, actionCodeSettings);
            // Save the email locally so you don't need to ask the user for it again
            // if they open the link on the same device.
            window.localStorage.setItem('emailForSignIn', email);
            setStatus('success');
        } catch (error: any) {
            console.error(error);
            setStatus('error');
            setErrorMessage('No se pudo enviar el enlace. Verifica que el correo sea válido.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] selection:bg-gold selection:text-white flex flex-col">

            <Navbar />

            <div className="flex-1 flex items-center justify-center px-6 pt-24 pb-12">
                <div className="absolute top-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none"></div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white/5 border border-white/10 p-8 md:p-12 rounded-3xl relative overflow-hidden backdrop-blur-sm shadow-2xl">

                        <div className="text-center mb-10">
                            <h1 className="font-serif text-3xl text-white mb-2">Bienvenido</h1>
                            <p className="text-white/50 text-sm font-light">Ingresa tu correo para recibir un código de acceso</p>
                        </div>

                        {status === 'success' ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20">
                                    <CheckCircle size={32} className="text-green-500" />
                                </div>
                                <h3 className="text-white font-serif text-xl mb-2">¡Enlace Enviado!</h3>
                                <p className="text-white/60 text-sm font-light mb-6">
                                    Hemos enviado un enlace mágico a <strong>{email}</strong>.<br />
                                    Revisa tu bandeja de entrada (y spam) para ingresar.
                                </p>
                                <button
                                    onClick={() => setStatus('idle')}
                                    className="text-gold text-xs uppercase tracking-widest hover:text-white transition-colors"
                                >
                                    Intentar con otro correo
                                </button>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleLogin} className="space-y-6">
                                {status === 'error' && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-4 rounded-xl text-center">
                                        {errorMessage}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-white/50 ml-1">Email</label>
                                    <div className="relative">
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white focus:outline-none focus:border-gold transition-colors pl-12"
                                            placeholder="tu@email.com"
                                        />
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full relative overflow-hidden bg-gold text-black font-bold uppercase tracking-[0.2em] py-4 rounded-xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] disabled:opacity-50 disabled:cursor-not-allowed group mt-4"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {loading ? 'Enviando...' : 'Enviar Código de Acceso'}
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
