// utils/storage.ts
export const safeSessionStorage = {
    getItem: (key: string): string | null => {
        if (typeof window === 'undefined') return null;
        try {
            return sessionStorage.getItem(key);
        } catch (error) {
            console.error('Error accessing sessionStorage:', error);
            return null;
        }
    },

    setItem: (key: string, value: string): void => {
        if (typeof window === 'undefined') return;
        try {
            sessionStorage.setItem(key, value);
        } catch (error) {
            console.error('Error setting sessionStorage:', error);
        }
    },

    removeItem: (key: string): void => {
        if (typeof window === 'undefined') return;
        try {
            sessionStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from sessionStorage:', error);
        }
    }
};