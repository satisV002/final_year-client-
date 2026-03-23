'use client';

import { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff, Droplets, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import WaterCharacter from '@/components/ui/WaterCharacter';

const FIELD_BASE =
    'w-full px-4 py-3 rounded-xl bg-white/5 border text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all duration-300';
const FIELD_VALID = 'border-white/10 focus:ring-cyan-500/40 focus:border-cyan-500/40';
const FIELD_ERR = 'border-red-500/60 focus:ring-red-500/30';

/* ── Ripple ring ── */
function RippleOrb({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) {
    return (
        <motion.div
            className="absolute rounded-full border border-cyan-400/10 pointer-events-none"
            style={{ left: x, top: y, width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
            initial={{ scale: 0.4, opacity: 0.5 }}
            animate={{ scale: [0.4, 1.6, 2.2], opacity: [0.4, 0.15, 0] }}
            transition={{ duration: 5, delay, repeat: Infinity, ease: 'easeOut' }}
        />
    );
}

/* ── Floating data chip ── */
function FloatingChip({
    label, value, color, delay, top, left, right, bottom,
}: {
    label: string; value: string; color: string;
    delay: number; top?: string; left?: string; right?: string; bottom?: string;
}) {
    return (
        <motion.div
            className="absolute glass rounded-xl px-4 py-3 text-xs text-left backdrop-blur-md bg-white/5 border border-white/10 shadow-xl"
            style={{ top, left, right, bottom }}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: [0, -8, 0], scale: 1 }}
            transition={{
                opacity: { duration: 0.6, delay },
                scale: { duration: 0.6, delay },
                y: { duration: 4, delay: delay + 0.6, repeat: Infinity, ease: 'easeInOut' },
            }}
        >
            <p className="text-slate-500 mb-0.5">{label}</p>
            <p className={`font-semibold ${color}`}>{value}</p>
        </motion.div>
    );
}

/* ── Horizontal shimmer line ── */
function ShimmerLine({ top, delay }: { top: string; delay: number }) {
    return (
        <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent pointer-events-none"
            style={{ top }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: [0, 1, 1, 0], opacity: [0, 1, 1, 0] }}
            transition={{ duration: 3.5, delay, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
        />
    );
}

export default function LoginPage() {
    const { login, isLoading, error, clearError } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
    const [isSuccess, setIsSuccess] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    /* ── Subtle parallax tilt ── */
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { stiffness: 60, damping: 20 });
    const springY = useSpring(mouseY, { stiffness: 60, damping: 20 });
    const rotateX = useTransform(springY, [-300, 300], [3, -3]);
    const rotateY = useTransform(springX, [-300, 300], [-3, 3]);

    const handleMouseMove = (e: React.MouseEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        mouseX.set(e.clientX - rect.left - rect.width / 2);
        mouseY.set(e.clientY - rect.top - rect.height / 2);
    };
    const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

    const validate = () => {
        const errs: typeof fieldErrors = {};
        if (!email) errs.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email';
        if (!password) errs.password = 'Password is required';
        else if (password.length < 8) errs.password = 'At least 8 characters';
        return errs;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();
        const errs = validate();
        if (Object.keys(errs).length) { setFieldErrors(errs); return; }
        setFieldErrors({});
        try {
            await login(email, password);
            setIsSuccess(true);
            setTimeout(() => router.push('/overview'), 1200);
        } catch { /* error shown via context */ }
    };

    const hasError = !!error && !isLoading;

    /* Staggered form reveal */
    const formVariants = {
        hidden: {},
        show: { transition: { staggerChildren: 0.09, delayChildren: 0.35 } },
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 18, filter: 'blur(4px)' },
        show: {
            opacity: 1, y: 0, filter: 'blur(0px)',
            transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as any },
        },
    };

    return (
        <div
            className="min-h-screen flex overflow-hidden bg-slate-950"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* ── Ambient BG ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute -top-48 -left-48 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                    className="absolute -bottom-48 -right-48 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.9, 0.5] }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
                />
                <motion.div
                    className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-teal-500/5 rounded-full blur-3xl"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
                />

                {/* Ripple rings */}
                {mounted && (
                    <>
                        <RippleOrb delay={0} x="30%" y="40%" size={300} />
                        <RippleOrb delay={1.8} x="65%" y="60%" size={240} />
                        <RippleOrb delay={3.2} x="50%" y="25%" size={180} />
                        <RippleOrb delay={5} x="20%" y="70%" size={200} />
                    </>
                )}

                {/* Shimmer lines */}
                <ShimmerLine top="25%" delay={0} />
                <ShimmerLine top="60%" delay={2.2} />
                <ShimmerLine top="80%" delay={4.5} />

                {/* Fine grid */}
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage:
                            'linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            {/* ══════════ RIGHT: Form ══════════ */}
            <motion.div
                className="relative z-10 flex flex-col justify-center w-full max-w-md px-8 py-12 lg:px-12 lg:ml-auto lg:mr-16 xl:mr-24"
                style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] as any }}
            >
                {/* Glass card */}
                <div className="relative rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/[0.08] shadow-2xl shadow-black/40 px-8 py-10 overflow-hidden">
                    {/* Edge glows */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-600/5 pointer-events-none" />
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />

                    <motion.div variants={formVariants} initial="hidden" animate="show">

                        {/* Logo */}
                        <motion.div variants={itemVariants} className="mb-8">
                            <Link href="/home" className="inline-flex items-center gap-2.5 group">
                                <motion.div
                                    className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30"
                                    whileHover={{ scale: 1.1, rotate: 8 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                >
                                    <Droplets className="w-5 h-5 text-white" />
                                </motion.div>
                                <span className="font-bold text-white text-lg tracking-tight">AquaWatch</span>
                            </Link>
                            <h1 className="text-3xl font-bold text-white mt-8 mb-1 tracking-tight">Welcome back</h1>
                            <p className="text-slate-400 text-sm">Sign in to your groundwater monitoring dashboard</p>
                        </motion.div>

                        {/* Error Banner */}
                        <AnimatePresence>
                            {hasError && (
                                <motion.div
                                    className="mb-5 flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm"
                                    initial={{ opacity: 0, y: -12, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as any }}
                                >
                                    <motion.div
                                        animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                    >
                                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    </motion.div>
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

                            {/* Email */}
                            <motion.div variants={itemVariants}>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
                                <input
                                    id="email" type="email" autoComplete="email"
                                    value={email}
                                    onChange={e => { setEmail(e.target.value); clearError(); }}
                                    placeholder="you@example.com"
                                    className={`${FIELD_BASE} ${fieldErrors.email ? FIELD_ERR : FIELD_VALID}`}
                                />
                                <AnimatePresence>
                                    {fieldErrors.email && (
                                        <motion.p
                                            className="mt-1.5 text-xs text-red-400"
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                        >{fieldErrors.email}</motion.p>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Password */}
                            <motion.div variants={itemVariants}>
                                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPass ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        value={password}
                                        onChange={e => { setPassword(e.target.value); clearError(); }}
                                        onFocus={() => setPasswordFocused(true)}
                                        onBlur={() => setPasswordFocused(false)}
                                        placeholder="••••••••"
                                        className={`${FIELD_BASE} pr-12 ${fieldErrors.password ? FIELD_ERR : FIELD_VALID}`}
                                    />
                                    <motion.button
                                        type="button" tabIndex={-1}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                                        onClick={() => setShowPass(p => !p)}
                                        whileHover={{ scale: 1.15 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <AnimatePresence mode="wait">
                                            <motion.div
                                                key={showPass ? 'off' : 'on'}
                                                initial={{ opacity: 0, rotate: -20, scale: 0.7 }}
                                                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                                exit={{ opacity: 0, rotate: 20, scale: 0.7 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </motion.div>
                                        </AnimatePresence>
                                    </motion.button>
                                </div>
                                <AnimatePresence>
                                    {fieldErrors.password && (
                                        <motion.p
                                            className="mt-1.5 text-xs text-red-400"
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                        >{fieldErrors.password}</motion.p>
                                    )}
                                </AnimatePresence>
                            </motion.div>

                            {/* Submit */}
                            <motion.div variants={itemVariants}>
                                <motion.button
                                    type="submit"
                                    disabled={isLoading || isSuccess}
                                    className="relative w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 mt-2 overflow-hidden"
                                    whileHover={{ scale: 1.015, boxShadow: '0 0 32px rgba(6,182,212,0.4)' }}
                                    whileTap={{ scale: 0.985 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                >
                                    {/* Shimmer sweep */}
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12"
                                        initial={{ x: '-100%' }}
                                        whileHover={{ x: '200%' }}
                                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                                    />

                                    <AnimatePresence mode="wait">
                                        {isLoading ? (
                                            <motion.span key="loading" className="flex items-center gap-2"
                                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                                transition={{ duration: 0.2 }}>
                                                <Loader2 className="w-5 h-5 animate-spin" /> Signing in...
                                            </motion.span>
                                        ) : isSuccess ? (
                                            <motion.span key="success" className="flex items-center gap-2"
                                                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 18 }}>
                                                <motion.span initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }} transition={{ duration: 0.45 }}>✓</motion.span>
                                                Redirecting...
                                            </motion.span>
                                        ) : (
                                            <motion.span key="idle" className="flex items-center gap-2"
                                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                                                transition={{ duration: 0.2 }}>
                                                Sign In
                                                <motion.div
                                                    animate={{ x: [0, 4, 0] }}
                                                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                </motion.div>
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            </motion.div>
                        </form>

                        <motion.p variants={itemVariants} className="mt-6 text-center text-sm text-slate-400">
                            Don&apos;t have an account?{' '}
                            <motion.button
                                onClick={() => router.push('/register')}
                                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors cursor-pointer hover:underline"
                                whileHover={{ scale: 1.04 }}
                                whileTap={{ scale: 0.97 }}
                            >
                                Create one
                            </motion.button>
                        </motion.p>

                        <motion.p variants={itemVariants} className="mt-8 text-xs text-slate-600 text-center">
                            AquaWatch · India Groundwater Monitoring System · CGWB Data
                        </motion.p>

                    </motion.div>
                </div>
            </motion.div>

            {/* ══════════ LEFT: Character Panel ══════════ */}
            <motion.div
                className="hidden lg:flex flex-1 items-center justify-center relative order-first"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-cyan-950/20 to-blue-950/40 border-l border-white/5" />

                {/* Concentric pulse rings behind character */}
                {[120, 200, 290, 390].map((size, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full border border-cyan-400/8 pointer-events-none"
                        style={{ width: size, height: size }}
                        animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }}
                    />
                ))}

                {/* Floating chips */}
                <FloatingChip label="Monitoring" value="5,260+ Stations" color="text-cyan-400" delay={0.6} top="12%" right="10%" />
                <FloatingChip label="LSTM Model" value="87% accuracy" color="text-green-400" delay={0.9} bottom="16%" left="8%" />
                <FloatingChip label="Real-time" value="WRIS Data" color="text-blue-400" delay={1.2} top="38%" left="6%" />

                {/* Character */}
                <motion.div
                    className="relative z-10 w-64 h-64"
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] as any }}
                >
                    <WaterCharacter
                        isPasswordFocused={passwordFocused}
                        hasError={hasError}
                        isSuccess={isSuccess}
                        isLoading={isLoading}
                        mood="welcome"
                    />
                </motion.div>

                {/* Headline */}
                <motion.div
                    className="absolute bottom-12 text-center px-8 z-10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.8, ease: [0.22, 1, 0.36, 1] as any }}
                >
                    <h2 className="text-white font-semibold text-lg tracking-tight">Sustainable Groundwater</h2>
                    <motion.p
                        className="text-cyan-400 font-semibold"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        Management System
                    </motion.p>
                    <p className="text-slate-500 text-xs mt-2">India WRIS · CGWB · Real-time Data</p>
                </motion.div>
            </motion.div>
        </div>
    );
}