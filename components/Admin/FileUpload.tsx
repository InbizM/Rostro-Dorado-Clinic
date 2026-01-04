import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Image as ImageIcon, Video, Cloud, AlertCircle, Upload } from 'lucide-react';

interface FileUploadProps {
    value: string;
    onChange: (url: string) => void;
    accept?: string;
}

const CLIENT_ID = '465268571821-6qb8iprlmgkdqmut165di1rpq2t3b8bf.apps.googleusercontent.com';
const SCOPES = 'https://www.googleapis.com/auth/drive.file';

declare global {
    interface Window {
        google: any;
    }
}

const FileUpload: React.FC<FileUploadProps> = ({ value, onChange, accept = 'image/*,video/*' }) => {
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState<string>(value);
    const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
    const [tokenClient, setTokenClient] = useState<any>(null);
    const [error, setError] = useState<string>('');
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [cachedToken, setCachedToken] = useState<string | null>(null);
    const [tokenExpiry, setTokenExpiry] = useState<number>(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const pendingFileRef = useRef<File | null>(null); // Use ref to persist across OAuth callback

    // Sync preview with value prop
    useEffect(() => {
        if (value && !pendingFile) {
            setPreview(value);
        }
    }, [value, pendingFile]);

    // Load cached token from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('drive_access_token');
        const savedExpiry = localStorage.getItem('drive_token_expiry');

        if (savedToken && savedExpiry) {
            const expiry = parseInt(savedExpiry);
            if (expiry > Date.now()) {
                setCachedToken(savedToken);
                setTokenExpiry(expiry);
                console.log('✅ Token cargado desde localStorage, válido hasta:', new Date(expiry).toLocaleTimeString());
            } else {
                console.log('⚠️ Token en localStorage expirado, se limpiará');
                localStorage.removeItem('drive_access_token');
                localStorage.removeItem('drive_token_expiry');
            }
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            if (window.google && window.google.accounts) {
                const client = window.google.accounts.oauth2.initTokenClient({
                    client_id: CLIENT_ID,
                    scope: SCOPES,
                    callback: handleTokenResponse,
                });
                setTokenClient(client);
                clearInterval(interval);
                console.log('✅ Google OAuth client initialized');
            }
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const handleTokenResponse = async (resp: any) => {
        console.log('🎫 handleTokenResponse llamado');
        console.log('📦 Respuesta OAuth:', resp);

        if (resp.error) {
            console.error('❌ OAuth error:', resp);
            setError('Error de autenticación con Google');
            setUploading(false);
            setPendingFile(null);
            pendingFileRef.current = null;
            return;
        }

        // Cache token for future uploads (in state AND localStorage)
        const expiryTime = Date.now() + (resp.expires_in * 1000) - 60000; // Expire 1 min early
        setCachedToken(resp.access_token);
        setTokenExpiry(expiryTime);

        // Persist to localStorage
        localStorage.setItem('drive_access_token', resp.access_token);
        localStorage.setItem('drive_token_expiry', expiryTime.toString());

        console.log('✅ Token guardado en localStorage, válido hasta:', new Date(expiryTime).toLocaleTimeString());

        const file = pendingFileRef.current; // FIXED: Use ref instead of state
        console.log('📁 Archivo a subir:', file?.name);

        if (!file) {
            setError('No hay archivo pendiente');
            setUploading(false);
            return;
        }

        await uploadToDrive(file, resp.access_token);
    };

    const handleFileSelect = (file: File) => {
        if (!file) return;
        setError('');

        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');

        if (!isImage && !isVideo) {
            setError('Solo se permiten imágenes y videos');
            return;
        }

        setFileType(isImage ? 'image' : 'video');

        // Show local preview immediately
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result as string);
        reader.readAsDataURL(file);

        // Store file for later upload (both state for UI and ref for OAuth callback)
        setPendingFile(file);
        pendingFileRef.current = file;

        // Start upload automatically
        setTimeout(() => {
            if (!tokenClient) {
                setError('Google aún está cargando. Intenta en unos segundos.');
                return;
            }

            setUploading(true);
            setProgress(5);

            // Check if we have a valid cached token
            if (cachedToken && tokenExpiry > Date.now()) {
                console.log('✅ Usando token guardado, sin pedir permiso');
                uploadToDrive(file, cachedToken);
            } else {
                console.log('🔓 Token expirado o no existe, solicitando nuevo...');
                tokenClient.requestAccessToken(); // Will call handleTokenResponse
                console.log('⏳ Esperando respuesta de OAuth...');
            }
        }, 100);
    };

    const startUpload = () => {
        console.log('🚀 startUpload llamado');
        console.log('📁 Archivo pendiente:', pendingFile?.name);
        console.log('🔑 Token client:', tokenClient ? 'OK' : 'NO INICIALIZADO');

        if (!pendingFile) {
            setError('Selecciona un archivo primero');
            return;
        }

        if (!tokenClient) {
            setError('Google aún está cargando. Espera unos segundos.');
            return;
        }

        setUploading(true);
        setProgress(5);
        setError('');

        console.log('🔓 Solicitando token de acceso...');
        // This is a DIRECT user click, so popup won't be blocked
        tokenClient.requestAccessToken(); // No prompt = use cached if available
        console.log('⏳ Esperando respuesta de OAuth...');
    };

    const getOrCreateFolder = async (name: string, parentId: string = 'root', accessToken: string): Promise<string> => {
        // 1. Search for folder
        const query = `name='${name}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
        const searchRes = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
            {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            }
        );
        const searchData = await searchRes.json();

        if (searchData.files && searchData.files.length > 0) {
            console.log(`📂 Carpeta encontrada: ${name} (${searchData.files[0].id})`);
            return searchData.files[0].id;
        }

        // 2. Create if not found
        console.log(`✨ Creando carpeta: ${name} en ${parentId}...`);
        const createRes = await fetch(
            'https://www.googleapis.com/drive/v3/files',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: [parentId]
                })
            }
        );
        const createData = await createRes.json();
        console.log(`✅ Carpeta creada: ${name} (${createData.id})`);
        return createData.id;
    };

    const uploadToDrive = async (file: File, accessToken: string) => {
        console.log('📤 Iniciando upload a Drive...');
        setProgress(10);

        try {
            // 1. Ensure folder structure: rostrodorado/pics
            setProgress(20);
            const mainFolderId = await getOrCreateFolder('rostrodorado', 'root', accessToken);
            setProgress(30);
            const targetFolderId = await getOrCreateFolder('pics', mainFolderId, accessToken);
            setProgress(40);

            const metadata = {
                name: `product_${Date.now()}_${file.name}`,
                mimeType: file.type,
                parents: [targetFolderId]
            };

            const form = new FormData();
            form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
            form.append('file', file);

            const response = await fetch(
                'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    body: form,
                }
            );

            setProgress(70);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Upload failed:', errorText);
                throw new Error('Error al subir archivo');
            }

            const data = await response.json();
            const fileId = data.id;
            console.log('✅ Archivo subido, ID:', fileId);

            setProgress(85);

            // Make file public
            await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    role: 'reader',
                    type: 'anyone',
                }),
            });

            setProgress(95);

            // Generate public URL
            const publicUrl = `https://lh3.googleusercontent.com/d/${fileId}=s1200`;
            console.log('✅ URL pública generada:', publicUrl);
            console.log('🔄 Llamando onChange con URL:', publicUrl);

            // Update parent state
            onChange(publicUrl);

            console.log('✅ onChange ejecutado');
            setPreview(publicUrl);
            setProgress(100);

            // Clear pending file
            setPendingFile(null);
            pendingFileRef.current = null;

            // Small delay then reset
            setTimeout(() => {
                setUploading(false);
                setProgress(0);
                console.log('✅ Upload completado');
            }, 500);

        } catch (err: any) {
            console.error('❌ Error en upload:', err);
            setError(err.message || 'Error desconocido al subir');
            setUploading(false);
            setProgress(0);
            setPendingFile(null);
            pendingFileRef.current = null;
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const removeFile = () => {
        setPreview('');
        setFileType(null);
        setError('');
        setPendingFile(null);
        pendingFileRef.current = null;
        onChange('');
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const hasUploadedUrl = value && !pendingFile;

    return (
        <div className="space-y-3">
            {error && (
                <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}

            {!preview ? (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !uploading && inputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragActive
                        ? 'border-gold bg-gold/10'
                        : 'border-white/20 hover:border-white/40 bg-black/20'
                        } ${uploading ? 'pointer-events-none' : ''}`}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        onChange={handleChange}
                        className="hidden"
                        disabled={uploading}
                    />

                    {uploading ? (
                        <div className="space-y-3">
                            <div className="animate-pulse">
                                <Cloud className="mx-auto text-gold" size={48} />
                            </div>
                            <p className="text-white font-medium">Subiendo a Google Drive... {Math.round(progress)}%</p>
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="bg-gold h-full transition-all"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <Cloud className="mx-auto text-white/50" size={48} />
                            <div>
                                <p className="text-white font-medium mb-1">
                                    Selecciona una imagen o video
                                </p>
                                <p className="text-white/50 text-sm">
                                    Arrastra o haz clic aquí
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="relative group">
                        <div className="relative rounded-xl overflow-hidden bg-black/20 border border-white/10">
                            {fileType === 'image' || !preview.match(/\.(mp4|webm|ogg)$/i) ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    referrerPolicy="no-referrer"
                                    className="w-full h-48 object-cover"
                                    onError={() => setError('Error cargando imagen')}
                                />
                            ) : (
                                <video
                                    src={preview}
                                    controls
                                    className="w-full h-48 object-cover"
                                />
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={removeFile}
                                    className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-white/50">
                            {fileType === 'image' ? <ImageIcon size={14} /> : <Video size={14} />}
                            <span className="truncate max-w-[200px]">
                                {hasUploadedUrl ? 'Imagen guardada en Drive' : 'Vista previa local'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Manual URL input */}
            <div className="text-center">
                <p className="text-white/30 text-xs mb-2">o pega una URL directa</p>
                <input
                    type="url"
                    value={value}
                    onChange={(e) => {
                        const val = e.target.value;
                        onChange(val);
                        setPreview(val);
                        setPendingFile(null);
                        if (val) setFileType('image');
                    }}
                    placeholder="https://..."
                    className="w-full bg-black/20 border border-white/10 p-2 rounded-lg text-white text-sm focus:border-gold outline-none"
                />
            </div>
        </div>
    );
};

export default FileUpload;
