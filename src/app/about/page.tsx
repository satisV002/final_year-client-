'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring, useMotionValue, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import {
    Droplets, Shield, BarChart3, BrainCircuit, CloudRain, MapPin,
    ArrowRight, Database, Globe, Waves, RadioTower, ChevronDown
} from 'lucide-react';

/* ─── Three.js Globe Component ─────────────────────────────────── */
function WaterGlobe() {
    const mountRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!mountRef.current) return;
        const W = mountRef.current.clientWidth;
        const H = mountRef.current.clientHeight;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(W, H);
        mountRef.current.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
        camera.position.set(0, 0, 3.2);

        /* Globe */
        const geo = new THREE.SphereGeometry(1, 64, 64);
        const mat = new THREE.MeshPhongMaterial({
            color: 0x0a2a4a,
            emissive: 0x061828,
            specular: 0x22d3ee,
            shininess: 60,
            transparent: true,
            opacity: 0.92,
        });
        const globe = new THREE.Mesh(geo, mat);
        scene.add(globe);

        /* Wireframe overlay */
        const wfMat = new THREE.MeshBasicMaterial({ color: 0x0e7490, wireframe: true, transparent: true, opacity: 0.18 });
        const wfMesh = new THREE.Mesh(new THREE.SphereGeometry(1.01, 28, 28), wfMat);
        scene.add(wfMesh);

        /* Equator ring */
        const ringGeo = new THREE.TorusGeometry(1.18, 0.012, 16, 120);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.55 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2.4;
        scene.add(ring);

        /* Outer atmosphere */
        const atmMat = new THREE.MeshBasicMaterial({ color: 0x0891b2, transparent: true, opacity: 0.07, side: THREE.BackSide });
        scene.add(new THREE.Mesh(new THREE.SphereGeometry(1.14, 32, 32), atmMat));

        /* Particles */
        const pCount = 420;
        const pPositions = new Float32Array(pCount * 3);
        for (let i = 0; i < pCount; i++) {
            const phi = Math.acos(2 * Math.random() - 1);
            const theta = 2 * Math.PI * Math.random();
            const r = 1.28 + Math.random() * 0.6;
            pPositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pPositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pPositions[i * 3 + 2] = r * Math.cos(phi);
        }
        const pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
        const pMat = new THREE.PointsMaterial({ color: 0x67e8f9, size: 0.022, transparent: true, opacity: 0.7 });
        scene.add(new THREE.Points(pGeo, pMat));

        /* Lights */
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        const dir = new THREE.DirectionalLight(0x22d3ee, 1.8);
        dir.position.set(3, 2, 3);
        scene.add(dir);
        const dir2 = new THREE.DirectionalLight(0x0ea5e9, 0.8);
        dir2.position.set(-3, -1, -2);
        scene.add(dir2);

        let frame: number;
        const animate = () => {
            frame = requestAnimationFrame(animate);
            globe.rotation.y += 0.003;
            wfMesh.rotation.y += 0.003;
            ring.rotation.z += 0.005;
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(frame);
            renderer.dispose();
            mountRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} className="w-full h-full" />;
}

/* ─── Floating Particle Field Background ─────────────────────────── */
function ParticleField() {
    const mountRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!mountRef.current) return;
        const W = window.innerWidth, H = window.innerHeight;
        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
        renderer.setSize(W, H);
        mountRef.current.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
        camera.position.z = 50;

        const count = 800;
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 120;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 120;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ color: 0x0891b2, size: 0.28, transparent: true, opacity: 0.35 });
        const pts = new THREE.Points(geo, mat);
        scene.add(pts);

        let frame: number;
        const animate = () => {
            frame = requestAnimationFrame(animate);
            pts.rotation.y += 0.0004;
            pts.rotation.x += 0.0002;
            renderer.render(scene, camera);
        };
        animate();
        return () => {
            cancelAnimationFrame(frame);
            renderer.dispose();
            mountRef.current?.removeChild(renderer.domElement);
        };
    }, []);
    return <div ref={mountRef} className="fixed inset-0 pointer-events-none z-0" />;
}

/* ─── 3D Tilt Card ──────────────────────────────────────────────── */
function TiltCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rx = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 });
    const ry = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 });

    const onMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={onMove}
            onMouseLeave={() => { x.set(0); y.set(0); }}
            style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ─── Animated Counter ──────────────────────────────────────────── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const inView = useInView(ref, { once: true });
    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const step = target / 60;
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [inView, target]);
    return <span ref={ref}>{count}{suffix}</span>;
}

/* ─── Data ──────────────────────────────────────────────────────── */
const improvements = [
    { icon: Droplets, title: 'Rainwater Harvesting', desc: 'Capturing and storing rainwater from rooftops and surfaces to recharge underground aquifers.', color: 'from-cyan-500 to-blue-500' },
    { icon: Waves, title: 'Recharge Wells', desc: 'Specialized wells designed to direct surface water directly into deep groundwater layers.', color: 'from-blue-500 to-indigo-500' },
    { icon: Shield, title: 'Check Dams', desc: 'Small barriers built across streams to slow water flow and increase soil infiltration.', color: 'from-teal-500 to-cyan-500' },
    { icon: Globe, title: 'Tree Plantation', desc: 'Reforestation helps soil retain moisture and facilitates natural groundwater recharge.', color: 'from-emerald-500 to-teal-500' },
    { icon: BarChart3, title: 'Water Conservation', desc: 'Reducing overall demand through efficient usage and recycling of greywater.', color: 'from-sky-500 to-blue-500' },
    { icon: BrainCircuit, title: 'Smart Irrigation', desc: 'Using AI and sensors to deliver precise amounts of water to crops, minimizing waste.', color: 'from-violet-500 to-blue-500' },
    { icon: RadioTower, title: 'DWLR Monitoring', desc: 'Continuous data collection from stations to detect depletion trends early.', color: 'from-cyan-400 to-sky-500' },
];

const stats = [
    { label: 'DWLR Stations', value: 22000, suffix: '+' },
    { label: 'States Covered', value: 28, suffix: '' },
    { label: '% Rural Drinking Water', value: 85, suffix: '%' },
    { label: 'Years of Data', value: 30, suffix: '+' },
];

const dataSources = [
    { src: 'India WRIS · CGWB', detail: 'DWLR groundwater level readings across all major Indian states. Updated regularly via REST API.', link: 'https://indiawris.gov.in', color: '#06b6d4' },
    { src: 'Open-Meteo', detail: 'Free precision weather API for historical and forecast rainfall data. No API key required.', link: 'https://open-meteo.com', color: '#0ea5e9' },
    { src: 'Historical CGWB Records', detail: 'Multi-year historical MBGL readings used to train ML prediction models.', link: null, color: '#6366f1' },
];

/* ─── Page ──────────────────────────────────────────────────────── */
export default function AboutPage() {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ target: containerRef });
    const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -60]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

    return (
        <div ref={containerRef} className="min-h-screen bg-[#020b18] text-slate-100 overflow-x-hidden">
            {/* Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');
                * { font-family: 'DM Sans', system-ui, sans-serif; }
                h1,h2,h3,.font-display { font-family: 'Syne', system-ui, sans-serif !important; }

                @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
                @keyframes pulse-ring { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(1.5);opacity:0} }
                @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
                @keyframes scan { 0%{top:0} 100%{top:100%} }

                .float { animation: float 6s ease-in-out infinite; }
                .float-delay { animation: float 6s ease-in-out 1.5s infinite; }

                .shimmer-text {
                    background: linear-gradient(90deg, #22d3ee 0%, #67e8f9 40%, #a5f3fc 50%, #67e8f9 60%, #22d3ee 100%);
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: shimmer 4s linear infinite;
                }

                .glass {
                    background: rgba(6,24,42,0.6);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                }

                .card-glow:hover {
                    box-shadow: 0 0 40px rgba(6,182,212,0.2), 0 0 80px rgba(6,182,212,0.08);
                }

                .scan-line::after {
                    content: '';
                    position: absolute;
                    left: 0; right: 0; height: 2px;
                    background: linear-gradient(90deg, transparent, rgba(34,211,238,0.6), transparent);
                    animation: scan 3s linear infinite;
                }

                .noise-overlay::before {
                    content: '';
                    position: fixed;
                    inset: 0;
                    opacity: 0.035;
                    pointer-events: none;
                    z-index: 1;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
                }
            `}</style>

            <div className="noise-overlay" />
            <ParticleField />

            {/* Ambient glows */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/8 rounded-full blur-[120px]" />
                <div className="absolute top-1/3 -left-1/4 w-[500px] h-[500px] bg-blue-600/6 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-indigo-500/6 rounded-full blur-[100px]" />
            </div>

            {/* ── Hero ──────────────────────────────────────────────── */}
            <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-6 z-10">
                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="text-center max-w-4xl mx-auto">

                    {/* Live badge */}
                    <motion.div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/25 bg-cyan-500/5 mb-8"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                    >
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        <span className="text-cyan-400 text-sm font-medium tracking-wider uppercase">Live Monitoring Active</span>
                    </motion.div>

                    {/* 3D Globe */}
                    <motion.div
                        className="relative w-52 h-52 mx-auto mb-10 float"
                        initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, type: 'spring', bounce: 0.35 }}
                    >
                        <div className="absolute inset-0 rounded-full border border-cyan-400/30 scale-110"
                            style={{ animation: 'pulse-ring 2.5s ease-out infinite' }} />
                        <div className="absolute inset-0 rounded-full border border-cyan-400/20 scale-125"
                            style={{ animation: 'pulse-ring 2.5s ease-out 0.8s infinite' }} />
                        <div className="w-full h-full rounded-full overflow-hidden"
                            style={{ boxShadow: '0 0 60px rgba(6,182,212,0.4), 0 0 120px rgba(6,182,212,0.15), inset 0 0 40px rgba(6,182,212,0.1)' }}>
                            <WaterGlobe />
                        </div>
                    </motion.div>

                    <motion.h1
                        className="font-display text-5xl md:text-7xl font-extrabold text-white mb-5 leading-[1.05] tracking-tight"
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
                    >
                        About{' '}
                        <span className="shimmer-text">AquaWatch India</span>
                    </motion.h1>

                    <motion.p
                        className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed mb-10"
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}
                    >
                        India's groundwater monitoring and prediction platform — built to help understand,
                        protect, and sustainably manage one of our most precious resources.
                    </motion.p>

                    <motion.div className="flex flex-col items-center gap-1 text-slate-600"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>
                        <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
                        <ChevronDown className="w-4 h-4 animate-bounce" />
                    </motion.div>
                </motion.div>
            </section>

            {/* ── Content ───────────────────────────────────────────── */}
            <div className="relative z-10 max-w-6xl mx-auto px-6 pb-32 space-y-28">

                {/* Stats */}
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.6 }}
                >
                    {stats.map((s, i) => (
                        <motion.div key={s.label}
                            className="glass border border-white/5 rounded-2xl p-6 text-center card-glow transition-all duration-500"
                            whileHover={{ y: -4, borderColor: 'rgba(34,211,238,0.3)' }}
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                        >
                            <p className="font-display text-3xl font-extrabold text-cyan-400 mb-1">
                                <Counter target={s.value} suffix={s.suffix} />
                            </p>
                            <p className="text-slate-500 text-sm">{s.label}</p>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Why It Matters */}
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.7 }}
                    >
                        <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-3">Why It Matters</p>
                        <h2 className="font-display text-4xl font-bold text-white mb-6 leading-tight">
                            Groundwater Monitoring<br />
                            <span className="text-slate-400 font-normal">at National Scale</span>
                        </h2>
                        <div className="space-y-4 text-slate-300 leading-relaxed text-[15px]">
                            <p>
                                Groundwater is India's most critical hidden resource, serving over{' '}
                                <span className="text-cyan-400 font-semibold">85% of rural drinking water needs</span> and
                                nearly 60% of irrigated agriculture.
                            </p>
                            <p>Dedicated DWLR stations collect continuous data enabling:</p>
                        </div>
                        <ul className="mt-5 space-y-3">
                            {[
                                ['Early Detection', 'Rapid depletion triggers immediate policy intervention'],
                                ['Salinity Mapping', 'Prevents saline intrusion into freshwater aquifers'],
                                ['Recharge Planning', 'Pinpoints optimal locations for artificial recharge'],
                            ].map(([title, desc]) => (
                                <motion.li key={title}
                                    className="flex items-start gap-3"
                                    whileHover={{ x: 4 }} transition={{ type: 'spring', stiffness: 400 }}
                                >
                                    <span className="mt-1 w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center flex-shrink-0">
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                    </span>
                                    <span>
                                        <span className="text-white font-medium">{title}:</span>{' '}
                                        <span className="text-slate-400">{desc}</span>
                                    </span>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* 3D HUD Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }} transition={{ duration: 0.7 }}
                    >
                        <TiltCard>
                            <div className="relative scan-line overflow-hidden glass border border-cyan-500/15 rounded-3xl p-8"
                                style={{ boxShadow: '0 25px 80px rgba(6,182,212,0.12), inset 0 1px 0 rgba(255,255,255,0.05)' }}>
                                {/* HUD corner accents */}
                                {['top-0 left-0 border-t border-l', 'top-0 right-0 border-t border-r',
                                    'bottom-0 left-0 border-b border-l', 'bottom-0 right-0 border-b border-r'].map((cls, i) => (
                                        <div key={i} className={`absolute w-4 h-4 border-cyan-400/60 ${cls}`} />
                                    ))}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                                        <RadioTower className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white text-sm">Live Network Status</p>
                                        <p className="text-cyan-400 text-xs">All systems operational</p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        <span className="text-emerald-400 text-xs">Online</span>
                                    </div>
                                </div>

                                {[
                                    { label: 'Active Stations', val: '22,485', bar: 92 },
                                    { label: 'Data Points Today', val: '1.4M', bar: 78 },
                                    { label: 'States Reporting', val: '28 / 28', bar: 100 },
                                    { label: 'Prediction Accuracy', val: '94.2%', bar: 94 },
                                ].map((item, i) => (
                                    <div key={item.label} className="mb-4 last:mb-0">
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-slate-400">{item.label}</span>
                                            <span className="text-white font-medium">{item.val}</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${item.bar}%` }}
                                                viewport={{ once: true }}
                                                transition={{ delay: i * 0.15 + 0.3, duration: 0.8, ease: 'easeOut' }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </TiltCard>
                    </motion.div>
                </div>

                {/* Improvement Methods */}
                <div>
                    <motion.div className="text-center mb-14"
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                        <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest mb-3">Solutions</p>
                        <h2 className="font-display text-4xl font-bold text-white">
                            Groundwater <span className="text-slate-400 font-normal">Improvement Methods</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {improvements.map((g, i) => (
                            <TiltCard key={g.title}>
                                <motion.div
                                    className="relative overflow-hidden glass border border-white/5 rounded-3xl p-6 h-full card-glow transition-all duration-500 cursor-default"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-40px' }}
                                    transition={{ delay: i * 0.07, duration: 0.5 }}
                                    whileHover={{ borderColor: 'rgba(34,211,238,0.35)' }}
                                >
                                    <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-20 bg-gradient-to-br ${g.color}`} />
                                    <motion.div
                                        className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${g.color} p-[1px] mb-5`}
                                        style={{ boxShadow: '0 8px 24px rgba(0,0,0,0.4), 0 2px 6px rgba(6,182,212,0.3)' }}
                                        whileHover={{ rotateY: 15, rotateX: -10 }}
                                        transition={{ type: 'spring', stiffness: 300 }}
                                    >
                                        <div className="w-full h-full rounded-2xl bg-slate-900/80 flex items-center justify-center">
                                            <g.icon className="w-7 h-7 text-cyan-300" />
                                        </div>
                                    </motion.div>
                                    <h3 className="font-display text-base font-bold text-white mb-2">{g.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{g.desc}</p>
                                </motion.div>
                            </TiltCard>
                        ))}
                    </div>
                </div>

                {/* Data Sources */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.6 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Database className="w-5 h-5 text-cyan-400" />
                        <p className="text-cyan-400 text-sm font-semibold uppercase tracking-widest">Infrastructure</p>
                    </div>
                    <h2 className="font-display text-4xl font-bold text-white mb-10">Data Sources</h2>
                    <div className="grid md:grid-cols-3 gap-5">
                        {dataSources.map((d, i) => (
                            <motion.div key={d.src}
                                className="relative overflow-hidden glass border border-white/5 rounded-3xl p-7 card-glow transition-all duration-500 group"
                                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                                whileHover={{ borderColor: 'rgba(34,211,238,0.3)', y: -4 }}
                            >
                                <div className="absolute top-0 left-0 right-0 h-[1px]"
                                    style={{ background: `linear-gradient(90deg, transparent, ${d.color}60, transparent)` }} />
                                <div className="w-10 h-10 rounded-xl mb-5 flex items-center justify-center"
                                    style={{ background: `${d.color}18`, border: `1px solid ${d.color}35` }}>
                                    <Database className="w-5 h-5" style={{ color: d.color }} />
                                </div>
                                <p className="font-display font-bold text-white mb-2">{d.src}</p>
                                <p className="text-slate-500 text-sm leading-relaxed mb-4">{d.detail}</p>
                                {d.link && (
                                    <a href={d.link} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors group-hover:gap-2 duration-300">
                                        Visit source <ArrowRight className="w-3 h-3" />
                                    </a>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    className="relative overflow-hidden rounded-3xl p-[1px]"
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ duration: 0.6 }}
                    style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.5), rgba(14,165,233,0.2), rgba(99,102,241,0.4))' }}
                >
                    <div className="relative overflow-hidden rounded-3xl glass p-14 text-center">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
                        <div className="float-delay relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-500/30">
                                <Droplets className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h2 className="relative font-display text-4xl font-extrabold text-white mb-4">
                            Ready to Explore?
                        </h2>
                        <p className="relative text-slate-400 mb-10 max-w-md mx-auto">
                            Dive into India's groundwater data with real-time DWLR monitoring, ML forecasts, and rainfall correlations.
                        </p>
                        <Link href="/register">
                            <motion.button
                                className="relative inline-flex items-center gap-3 px-10 py-4 rounded-2xl text-white font-semibold text-[15px] overflow-hidden"
                                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                                style={{
                                    background: 'linear-gradient(135deg, #06b6d4, #0284c7)',
                                    boxShadow: '0 8px 40px rgba(6,182,212,0.35), 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)',
                                }}
                            >
                                <motion.span
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                                    animate={{ x: ['-100%', '200%'] }}
                                    transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
                                />
                                <span className="relative">Get Started Free</span>
                                <ArrowRight className="relative w-4 h-4" />
                            </motion.button>
                        </Link>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}