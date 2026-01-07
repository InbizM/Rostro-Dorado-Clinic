import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, query, where, limit, orderBy, getDocs } from 'firebase/firestore';

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
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // If user has no display name, try to fetch from orders
                if (!user.displayName) {
                    try {
                        const ordersRef = collection(db, 'orders');
                        const q = query(
                            ordersRef,
                            // Simplified query to avoid "Missing Index" error
                            where('customer.email', '==', user.email),
                            limit(1)
                        );

                        const orderSnap = await getDocs(q);

                        if (!orderSnap.empty) {
                            const orderData = orderSnap.docs[0].data();
                            const customerName = `${orderData.customer.firstName} ${orderData.customer.lastName}`;

                            // Update the Auth Profile
                            await updateProfile(user, { displayName: customerName });
                            // Reload user to get updated profile
                            await user.reload();
                            // Update local reference if needed, though onAuthStateChanged loop might not re-trigger immediately
                            // We can rely on auth.currentUser being updated
                        }
                    } catch (e) {
                        console.error("Error fetching customer info from orders:", e);
                    }
                }

                // Determine Sync: Check if user doc exists in Firestore, if not create it (Lazy Sync)
                const userDocRef = doc(db, 'users', user.uid);
                getDoc(userDocRef).then((docSnap) => {
                    if (!docSnap.exists()) {
                        setDoc(userDocRef, {
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName || '', // Changed from 'Usuario' to empty string to allow fallback
                            firstName: user.displayName?.split(' ')[0] || '',
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
