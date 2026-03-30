import { createContext, useContext, useEffect, useState } from "react";
import type { IUser } from "../assets/assets";
import api from "../configs/api";
import toast from "react-hot-toast";

interface AuthContextProps {
    isLoggedIn: boolean;
    setIsLoggedIn: (isLoggedIn: boolean) => void;
    user: IUser | null;
    setUser: (user: IUser | null) => void;
    login: (user: { email: string; password: string }) => Promise<boolean>;
    signUp: (user: { name: string; email: string; password: string }) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
    isLoggedIn: false,
    setIsLoggedIn: () => {},
    user: null,
    setUser: () => {},
    login: async () => false,   // ✅ fixed
    signUp: async () => false,  // ✅ fixed
    logout: async () => {},     // ✅ ok
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

    const [user, setUser] = useState<IUser | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    // ✅ SIGNUP
    const signUp = async ({ name, email, password }: { name: string; email: string; password: string }) => {
        try {
            const { data } = await api.post(
                '/api/auth/register',
                { name, email, password },
                { withCredentials: true } // ✅ important if using cookies
            );

            if (data.user) {
                setUser(data.user as IUser);
                setIsLoggedIn(true);
            }

            toast.success(data.message);
            return true;
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
            } else {
                console.log(error);
            }
            toast.error("Sign up failed. Please try again.");
            return false;
        }
    };

    // ✅ LOGIN
    const login = async ({ email, password }: { email: string; password: string }) => {
        try {
            const { data } = await api.post(
                '/api/auth/login',
                { email, password },
                { withCredentials: true }
            );

            if (data.user) {
                setUser(data.user as IUser);
                setIsLoggedIn(true);
            }

            toast.success(data.message);
            return true;
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
            } else {
                console.log(error);
            }
            toast.error("Login failed. Please check your email and password.");
            return false;
        }
    };

    // ✅ LOGOUT
    const logout = async () => {
        try {
            const { data } = await api.post(
                '/api/auth/logout',
                {},
                { withCredentials: true }
            );

            setUser(null);
            setIsLoggedIn(false);

            toast.success(data.message);
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
            } else {
                console.log(error);
            }
        }
    };

    // ✅ VERIFY USER (auto login on refresh)
    const fetchUser = async () => {
        try {
            const { data } = await api.post(
                '/api/auth/verify',
                {},
                { withCredentials: true }
            );

            if (data.user) {
                setUser(data.user as IUser);
                setIsLoggedIn(true);
            }
        } catch (error) {
            console.log("User not logged in");
        }
    };

    // ✅ RUN ON APP LOAD
    useEffect(() => {
        fetchUser();
    }, []);

    const value = {
        user,
        setUser,
        isLoggedIn,
        setIsLoggedIn,
        signUp,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// ✅ CUSTOM HOOK
export const useAuth = () => useContext(AuthContext);