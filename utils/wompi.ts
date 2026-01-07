
export const WOMPI_PUBLIC_KEY = 'pub_test_Tn3z1QjsZlrLR5X2pZHdRFsnuVUa6cPC'; // Updated with User Key
export const WOMPI_INTEGRITY_SECRET = 'test_integrity_mVgk9S7Js9aq9X0z6xwZ99Pm2bGtHr9W'; // Correcto

export interface WompiWidgetConfig {
    currency: string;
    amountInCents: number;
    reference: string;
    publicKey: string;
    signature: { integrity: string };
    redirectUrl?: string;
    customerData?: {
        email: string;
        fullName: string;
        phoneNumber: string;
        phoneNumberPrefix: string;
        legalId?: string;
        legalIdType?: string;
    };
    shippingAddress?: {
        addressLine1: string;
        country: string; // 'CO'
        city: string;
        phoneNumber: string;
        region?: string;
        name?: string;
    };
}

import CryptoJS from 'crypto-js';

export const loadWompiScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Polyfill for enumerateDevices to prevent Wompi crash on insecure origins (HTTP)
        if (!navigator.mediaDevices) {
            // @ts-ignore
            navigator.mediaDevices = {};
        }
        if (!navigator.mediaDevices.enumerateDevices) {
            // @ts-ignore
            navigator.mediaDevices.enumerateDevices = async () => [];
        }

        if (document.getElementById('wompi-script')) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.id = 'wompi-script';
        script.src = 'https://checkout.wompi.co/widget.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Wompi script'));
        document.head.appendChild(script);
    });
};

export const generateSignature = async (
    reference: string,
    amountInCents: number,
    currency: string,
    secret: string
): Promise<string> => {
    // Cadena: Reference + AmountInCents + Currency + Secret
    const chain = `${reference}${amountInCents}${currency}${secret}`;

    // Use CryptoJS for robust SHA-256 hashing in all environments
    const hash = CryptoJS.SHA256(chain);
    return hash.toString(CryptoJS.enc.Hex);
};
