'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Droplets, Menu, X, BarChart3, RadioTower,
    MapPin, CloudRain, LogOut, User as UserIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handler = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handler);
        handler(); // Check initial scroll
        return () => window.removeEventListener('scroll', handler);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    // Don't show generic navbar on login/register specifically designed pages
    const isAuthPage = pathname === '/login' || pathname === '/register';
    if (isAuthPage) return null;

    const navLinks = isAuthenticated ? [
        { href: '/overview', label: 'Dashboard', icon: BarChart3 },
        { href: '/stations', label: 'Stations', icon: RadioTower },
        { href: '/map', label: 'Map', icon: MapPin },
        { href: '/rainfall', label: 'Rainfall', icon: CloudRain },
        { href: '/about', label: 'About', icon: null },
    ] : [
        { href: '/', label: 'Home', icon: null },
        { href: '/about', label: 'About', icon: null },
    ];

    const isTransparentPage = pathname === '/' || pathname === '/about';
    const navStyle = isTransparentPage && !scrolled && !menuOpen
        ? 'bg-transparent border-transparent'
        : 'bg-slate-950/90 backdrop-blur-xl border-white/8 shadow-xl shadow-black/30';

    return (
        <>
            <motion.nav
                className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-500 border-b ${navStyle}`}
                initial={{ y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
                <Link href={isAuthenticated ? '/overview' : '/'} className="flex items-center gap-2.5 z-50">
                    <motion.div
                        className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30"
                        whileHover={{ scale: 1.1, rotate: 8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                    >
                        <Droplets className="w-4 h-4 text-white" />
                    </motion.div>
                    <span className="font-bold text-white tracking-tight">AquaWatch</span>
                    <span className="hidden sm:block text-xs text-slate-500 border border-slate-700/60 px-1.5 py-0.5 rounded">India</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-6">
                    <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
                        {navLinks.map((link) => {
                            const isActive = pathname.startsWith(link.href) && (link.href !== '/' || pathname === '/');
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`relative px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-300 flex items-center gap-2
                                        ${isActive ? 'text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-pill"
                                            className="absolute inset-0 bg-white/10 rounded-lg"
                                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-1.5">
                                        {link.icon && <link.icon className="w-3.5 h-3.5" />}
                                        {link.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>

                    <div className="h-6 w-px bg-white/10" />

                    {isAuthenticated ? (
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                                <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                                    <UserIcon className="w-3.5 h-3.5" />
                                </div>
                                <span className="hidden lg:block truncate max-w-[120px]">{user?.fullname?.split(' ')[0] || 'User'}</span>
                            </div>
                            <button
                                onClick={logout}
                                className="text-sm px-3 py-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition border border-transparent hover:border-red-500/20 flex items-center gap-1.5"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden lg:block">Sign out</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">Sign In</Link>
                            <Link href="/register"
                                className="text-sm px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:scale-105 transition-transform shadow-lg shadow-cyan-500/20">
                                Get Started
                            </Link>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <motion.button
                    className="md:hidden text-slate-400 hover:text-white transition-colors p-2 z-50"
                    onClick={() => setMenuOpen(!menuOpen)}
                    whileTap={{ scale: 0.9 }}
                >
                    {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </motion.button>
            </motion.nav>

            {/* Mobile Nav Overlay */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        className="fixed inset-0 z-40 bg-slate-950/98 backdrop-blur-2xl md:hidden pt-24 px-6 flex flex-col"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        <div className="flex flex-col gap-2 mb-8">
                            {navLinks.map((link, i) => {
                                const isActive = pathname.startsWith(link.href) && (link.href !== '/' || pathname === '/');
                                return (
                                    <motion.div
                                        key={link.href}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Link
                                            href={link.href}
                                            className={`flex items-center gap-3 p-4 rounded-xl text-lg font-medium transition-colors
                                                ${isActive ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'text-slate-300 hover:bg-white/5 border border-transparent'}`}
                                        >
                                            {link.icon && <link.icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />}
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className="mt-auto pb-8">
                            {isAuthenticated ? (
                                <motion.div
                                    className="pt-6 border-t border-white/10"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="flex items-center gap-3 mb-6 px-2 text-slate-300">
                                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                                            <UserIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{user?.fullname || 'User'}</p>
                                            <p className="text-xs text-slate-500">{user?.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center justify-center gap-2 p-4 rounded-xl text-red-400 font-medium bg-red-500/10 border border-red-500/20 active:scale-95 transition"
                                    >
                                        <LogOut className="w-5 h-5" /> Sign out
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    className="pt-6 border-t border-white/10 flex flex-col gap-3"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <Link href="/login" className="w-full p-4 text-center rounded-xl text-slate-300 font-medium bg-white/5 hover:bg-white/10 active:scale-95 transition border border-white/10">
                                        Sign In
                                    </Link>
                                    <Link href="/register"
                                        className="w-full p-4 text-center rounded-xl text-white font-bold bg-gradient-to-r from-cyan-500 to-blue-600 active:scale-95 transition shadow-lg shadow-cyan-500/25">
                                        Get Started Free
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
