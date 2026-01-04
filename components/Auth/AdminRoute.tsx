import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';


interface AdminRouteProps {
    children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const { currentUser, loading } = useAuth();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [checkingRole, setCheckingRole] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const checkAdminRole = async () => {
            console.log('=== ADMIN CHECK START ===');
            console.log('Loading:', loading);
            console.log('CurrentUser:', currentUser?.email);

            if (currentUser) {
                // Fallback: Check email directly if it's the admin email
                if (currentUser.email === 'isauradorado@rostrodorado.com') {
                    console.log('✅ Admin email detected (fallback check)');
                    if (isMounted) {
                        setIsAdmin(true);
                        setCheckingRole(false);
                    }
                    return;
                }

                console.log('Checking admin role for user:', currentUser.email);
                try {
                    const docRef = doc(db, 'users', currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    console.log('User document exists:', docSnap.exists());

                    if (!isMounted) return;

                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        console.log('User data:', userData);
                        console.log('User role:', userData.role);
                        console.log('User email:', userData.email);
                        if (userData.role === 'admin') {
                            console.log('✅ User IS admin');
                            setIsAdmin(true);
                        } else {
                            console.warn('❌ User is NOT admin. Role:', userData.role);
                            setIsAdmin(false);
                        }
                    } else {
                        console.error('❌ User document not found in Firestore');
                        setIsAdmin(false);
                    }
                } catch (error) {
                    console.error("❌ Error checking admin role:", error);
                    // If Firestore is offline and email is admin, allow access
                    if (currentUser.email === 'isauradorado@rostrodorado.com') {
                        console.log('✅ Allowing access due to admin email (Firestore offline)');
                        if (isMounted) setIsAdmin(true);
                    } else {
                        if (isMounted) setIsAdmin(false);
                    }
                }
            } else {
                console.log('❌ No current user');
                if (isMounted) setIsAdmin(false);
            }

            if (isMounted) {
                console.log('=== ADMIN CHECK END ===');
                setCheckingRole(false);
            }
        };

        if (!loading) {
            checkAdminRole();
        }

        return () => {
            isMounted = false;
        };
    }, [currentUser, loading]);

    if (loading || checkingRole) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">

                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }

    if (!currentUser || !isAdmin) {
        console.log('Access denied. CurrentUser:', !!currentUser, 'IsAdmin:', isAdmin);
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default AdminRoute;
