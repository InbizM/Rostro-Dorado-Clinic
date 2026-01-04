import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    currentUser: null,
    loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Determine Sync: Check if user doc exists in Firestore, if not create it (Lazy Sync)
                // We do this silently to ensure Admin Panel has data
                const userDocRef = doc(db, 'users', user.uid);
                getDoc(userDocRef).then((docSnap) => {
                    if (!docSnap.exists()) {
                        setDoc(userDocRef, {
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName || 'Usuario',
                            firstName: user.displayName?.split(' ')[0] || 'Usuario',
                            lastName: user.displayName?.split(' ')[1] || '',
                            createdAt: serverTimestamp(),
                            role: user.email === 'isauradorado@rostrodorado.com' ? 'admin' : 'customer'
                        }).catch(e => console.error("Error auto-syncing user:", e));
                    }
                });

                setCurrentUser(user);
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
