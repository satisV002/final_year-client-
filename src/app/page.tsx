'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import {
    Droplets, BarChart3, MapPin, BrainCircuit,
    CloudRain, Shield, ArrowRight, ChevronRight,
    RadioTower, Waves, TrendingUp, Menu, X
} from 'lucide-react';

/* ─────────────────────────────────────────
   THREE.JS GROUNDWATER SCENE
───────────────────────────────────────── */
function GroundwaterCanvas() {
    const mountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = mountRef.current;
        if (!el) return;

        const W = el.clientWidth, H = el.clientHeight;
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        el.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 200);
        camera.position.set(0, 0, 50);

        /* ── Underground layer strata ── */
        const strata: THREE.Mesh[] = [];
        const strataColors = [0x0f172a, 0x0c4a6e, 0x164e63, 0x083344, 0x0a2235];
        for (let i = 0; i < 5; i++) {
            const geo = new THREE.PlaneGeometry(200, 8, 80, 1);
            const verts = geo.attributes.position;
            for (let j = 0; j < verts.count; j++) {
                verts.setZ(j, (Math.random() - 0.5) * 2);
            }
            const mat = new THREE.MeshBasicMaterial({
                color: strataColors[i],
                transparent: true,
                opacity: 0.35 - i * 0.04,
                side: THREE.DoubleSide,
            });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.y = -10 - i * 9;
            mesh.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.15;
            scene.add(mesh);
            strata.push(mesh);
        }

        /* ── Water particle aquifer ── */
        const PARTICLE_COUNT = 2200;
        const positions = new Float32Array(PARTICLE_COUNT * 3);
        const colors = new Float32Array(PARTICLE_COUNT * 3);
        const sizes = new Float32Array(PARTICLE_COUNT);
        const speeds = new Float32Array(PARTICLE_COUNT);

        const c1 = new THREE.Color(0x22d3ee); // cyan-400
        const c2 = new THREE.Color(0x38bdf8); // sky-400
        const c3 = new THREE.Color(0x7dd3fc); // light blue

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            const layer = Math.floor(Math.random() * 5);
            positions[i * 3] = (Math.random() - 0.5) * 120;
            positions[i * 3 + 1] = -8 - layer * 9 + (Math.random() - 0.5) * 4;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 40;

            const mix = Math.random();
            const col = mix < 0.33 ? c1 : mix < 0.66 ? c2 : c3;
            colors[i * 3] = col.r;
            colors[i * 3 + 1] = col.g;
            colors[i * 3 + 2] = col.b;

            sizes[i] = Math.random() * 1.8 + 0.4;
            speeds[i] = (Math.random() + 0.3) * 0.012;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const mat = new THREE.PointsMaterial({
            size: 0.8,
            vertexColors: true,
            transparent: true,
            opacity: 0.75,
            sizeAttenuation: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const particles = new THREE.Points(geo, mat);
        scene.add(particles);

        /* ── Rising bubble particles ── */
        const BUBBLE_COUNT = 180;
        const bPos = new Float32Array(BUBBLE_COUNT * 3);
        const bSpeed = new Float32Array(BUBBLE_COUNT);
        for (let i = 0; i < BUBBLE_COUNT; i++) {
            bPos[i * 3] = (Math.random() - 0.5) * 80;
            bPos[i * 3 + 1] = -45 + Math.random() * 40;
            bPos[i * 3 + 2] = (Math.random() - 0.5) * 30;
            bSpeed[i] = 0.04 + Math.random() * 0.06;
        }
        const bGeo = new THREE.BufferGeometry();
        bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
        const bMat = new THREE.PointsMaterial({
            size: 1.2, color: 0x67e8f9, transparent: true, opacity: 0.55,
            sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false,
        });
        const bubbles = new THREE.Points(bGeo, bMat);
        scene.add(bubbles);

        /* ── Underground scan beam ── */
        const beamGeo = new THREE.PlaneGeometry(100, 0.3);
        const beamMat = new THREE.MeshBasicMaterial({
            color: 0x22d3ee, transparent: true, opacity: 0.12,
            side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.position.z = 5;
        scene.add(beam);

        /* ── Aquifer glow plane ── */
        const glowGeo = new THREE.PlaneGeometry(140, 5, 50, 1);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0x0ea5e9, transparent: true, opacity: 0.06,
            side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.y = -18;
        glow.rotation.x = Math.PI / 2;
        scene.add(glow);

        /* ── Mouse parallax ── */
        let mx = 0, my = 0;
        const onMouse = (e: MouseEvent) => {
            mx = (e.clientX / window.innerWidth - 0.5) * 2;
            my = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener('mousemove', onMouse);

        /* ── Resize ── */
        const onResize = () => {
            const W = el.clientWidth, H = el.clientHeight;
            camera.aspect = W / H;
            camera.updateProjectionMatrix();
            renderer.setSize(W, H);
        };
        window.addEventListener('resize', onResize);

        /* ── Animation loop ── */
        let t = 0;
        let raf: number;
        const animate = () => {
            raf = requestAnimationFrame(animate);
            t += 0.008;

            // Parallax camera drift
            camera.position.x += (mx * 6 - camera.position.x) * 0.04;
            camera.position.y += (-my * 3 - camera.position.y) * 0.04;
            camera.lookAt(0, -15, 0);

            // Flow particles underground
            const pos = geo.attributes.position as THREE.BufferAttribute;
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                pos.setX(i, pos.getX(i) + speeds[i]);
                if (pos.getX(i) > 60) pos.setX(i, -60);
                // slight oscillation vertically
                pos.setY(i, pos.getY(i) + Math.sin(t + i) * 0.002);
            }
            pos.needsUpdate = true;

            // Rising bubbles
            const bp = bGeo.attributes.position as THREE.BufferAttribute;
            for (let i = 0; i < BUBBLE_COUNT; i++) {
                bp.setY(i, bp.getY(i) + bSpeed[i]);
                if (bp.getY(i) > 15) {
                    bp.setY(i, -45);
                    bp.setX(i, (Math.random() - 0.5) * 80);
                }
            }
            bp.needsUpdate = true;

            // Scan beam sweep
            beam.position.y = -5 + Math.sin(t * 0.4) * 25;
            beamMat.opacity = 0.08 + Math.sin(t * 0.8) * 0.05;

            // Strata subtle wave
            strata.forEach((s, idx) => {
                s.rotation.z = Math.sin(t * 0.15 + idx) * 0.005;
            });

            // Particle pulse
            mat.opacity = 0.65 + Math.sin(t * 1.2) * 0.12;

            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('mousemove', onMouse);
            window.removeEventListener('resize', onResize);
            renderer.dispose();
            if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
        };
    }, []);

    return <div ref={mountRef} className="absolute inset-0 w-full h-full" />;
}

/* ─────────────────────────────────────────
   WATER RIPPLE (CSS only)
───────────────────────────────────────── */
function Ripple({ delay, size }: { delay: number; size: number }) {
    return (
        <motion.div
            className="absolute rounded-full border border-cyan-400/15 pointer-events-none"
            style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2, left: '50%', top: '50%' }}
            initial={{ scale: 0.3, opacity: 0.6 }}
            animate={{ scale: 2.5, opacity: 0 }}
            transition={{ duration: 4, delay, repeat: Infinity, ease: 'easeOut' }}
        />
    );
}

/* ─────────────────────────────────────────
   DATA
───────────────────────────────────────── */
const features = [
    { icon: MapPin, title: 'Interactive Map', desc: 'Real-time DWLR station data plotted on India map with color-coded water level indicators.', accent: 'cyan' },
    { icon: BrainCircuit, title: 'ML Predictions', desc: 'LSTM-powered forecasting for 2026 groundwater levels using historical CGWB data.', accent: 'violet' },
    { icon: CloudRain, title: 'Rainfall Correlation', desc: 'Understand how monsoon rainfall patterns impact groundwater levels across states.', accent: 'blue' },
    { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Comprehensive charts, trends, and downloadable reports for researchers and policymakers.', accent: 'emerald' },
    { icon: RadioTower, title: '5,260+ Stations', desc: 'Coverage across all major Indian states via WRIS data — Telangana, Odisha, UP, and more.', accent: 'orange' },
    { icon: Shield, title: 'Secure Platform', desc: 'JWT-authenticated access, rate limiting, and encrypted data pipeline.', accent: 'slate' },
];

const stats = [
    { val: '5,260+', label: 'DWLR Stations', icon: RadioTower, color: 'text-cyan-400', glow: 'bg-cyan-400' },
    { val: '28', label: 'Indian States', icon: MapPin, color: 'text-blue-400', glow: 'bg-blue-400' },
    { val: '87%', label: 'ML Accuracy', icon: BrainCircuit, color: 'text-violet-400', glow: 'bg-violet-400' },
    { val: '2026', label: 'Forecast Ready', icon: TrendingUp, color: 'text-green-400', glow: 'bg-green-400' },
];

const howItWorks = [
    { step: '01', title: 'Register & Login', desc: 'Create a free account to access the full monitoring platform.' },
    { step: '02', title: 'Search & Filter', desc: 'Select state, district, station, and date range to query live WRIS data.' },
    { step: '03', title: 'Visualize & Predict', desc: 'Explore charts, maps, trends, and ML-powered 2026 forecasts.' },
];

const accentMap: Record<string, string> = {
    cyan: 'border-cyan-500/25 hover:border-cyan-500/60 group-hover:text-cyan-400 from-cyan-500/10',
    violet: 'border-violet-500/25 hover:border-violet-500/60 group-hover:text-violet-400 from-violet-500/10',
    blue: 'border-blue-500/25 hover:border-blue-500/60 group-hover:text-blue-400 from-blue-500/10',
    emerald: 'border-emerald-500/25 hover:border-emerald-500/60 group-hover:text-emerald-400 from-emerald-500/10',
    orange: 'border-orange-500/25 hover:border-orange-500/60 group-hover:text-orange-400 from-orange-500/10',
    slate: 'border-slate-500/25 hover:border-slate-400/50 group-hover:text-slate-300 from-slate-500/10',
};

/* ─────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────── */
export default function HomePage() {
    const { scrollY } = useScroll();
    const heroY = useTransform(scrollY, [0, 600], [0, -120]);
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">

            {/* ═══════════ HERO ═══════════ */}
            <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

                {/* Three.js canvas fills hero */}
                <div className="absolute inset-0">
                    <GroundwaterCanvas />
                </div>

                {/* Dark overlay gradient so text is readable */}
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/30 to-slate-950/90 pointer-events-none" />

                {/* Ripple rings */}
                <div className="absolute bottom-32 left-1/2 pointer-events-none">
                    <Ripple delay={0} size={200} />
                    <Ripple delay={1.4} size={340} />
                    <Ripple delay={2.8} size={480} />
                </div>

                {/* Hero content */}
                <motion.div
                    className="relative z-10 text-center px-6 max-w-5xl mx-auto"
                    style={{ y: heroY, opacity: heroOpacity }}
                >
                    {/* Badge */}
                    <motion.div
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 border border-cyan-500/25 rounded-full text-cyan-400 text-xs font-medium mb-8"
                        initial={{ opacity: 0, scale: 0.85, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                        Real-time Monitoring Active · CGWB Data
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        className="text-6xl md:text-8xl font-black text-white leading-[0.93] tracking-tight mb-6"
                        initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Sustainable<br />
                        <span className="bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            Groundwater
                        </span><br />
                        <span className="text-slate-300 text-5xl md:text-6xl font-bold">Management</span>
                    </motion.h1>

                    <motion.p
                        className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    >
                        Advanced monitoring and AI-driven prediction for India&apos;s DWLR network.
                        Empowering researchers and policymakers with actionable groundwater insights.
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-4 mt-8 w-full max-w-3xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.72, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <Link href="/login" className="w-full sm:w-auto">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="relative overflow-hidden px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl flex justify-center items-center gap-2 shadow-xl shadow-cyan-500/25 text-sm group"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-700 pointer-events-none" />
                                <span>Open Dashboard</span> <ArrowRight className="w-4 h-4" />
                            </motion.div>
                        </Link>
                        
                        <Link href="/register" className="w-full sm:w-auto">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-8 py-4 bg-slate-800/80 border border-white/12 text-slate-300 font-semibold rounded-xl hover:bg-slate-700/80 hover:text-white flex justify-center items-center transition-colors text-sm backdrop-blur-sm w-full"
                            >
                                Create Free Account
                            </motion.div>
                        </Link>

                        <Link href="/about" className="w-full sm:w-auto">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-8 py-4 bg-transparent border border-white/20 text-slate-300 font-semibold rounded-xl hover:bg-white/10 hover:text-white flex justify-center items-center transition-colors text-sm backdrop-blur-sm w-full"
                            >
                                About Project
                            </motion.div>
                        </Link>
                    </motion.div>

                    {/* Scroll hint */}
                    <motion.div
                        className="mt-16 flex flex-col items-center gap-2 text-slate-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 0.8 }}
                    >
                        <span className="text-xs tracking-widest uppercase">Scroll to explore</span>
                        <motion.div
                            className="w-px h-10 bg-gradient-to-b from-slate-600 to-transparent"
                            animate={{ scaleY: [0.3, 1, 0.3], opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                    </motion.div>
                </motion.div>

                {/* Underground label */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 text-xs text-slate-500 z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.8, duration: 0.6 }}
                >
                    <div className="w-16 h-px bg-gradient-to-r from-transparent to-slate-600" />
                    <span className="tracking-widest uppercase">Aquifer Layer Visualization</span>
                    <div className="w-16 h-px bg-gradient-to-l from-transparent to-slate-600" />
                </motion.div>
            </section>

            {/* ═══════════ STATS ═══════════ */}
            <section className="py-24 px-6 border-y border-white/5 bg-slate-900/40 relative overflow-hidden">
                {/* BG glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/3 via-transparent to-blue-500/3 pointer-events-none" />
                <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-5">
                    {stats.map((s, i) => (
                        <motion.div key={s.label}
                            className="relative group rounded-2xl border border-white/6 bg-slate-900/70 backdrop-blur-sm p-6 text-center overflow-hidden cursor-default"
                            initial={{ opacity: 0, y: 40, scale: 0.95 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true, margin: '-50px' }}
                            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                            whileHover={{ scale: 1.04, borderColor: 'rgba(255,255,255,0.15)' }}
                        >
                            {/* Glow blob */}
                            <div className={`absolute -top-8 -right-8 w-24 h-24 ${s.glow} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <s.icon className={`w-7 h-7 ${s.color} mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`} />
                            <motion.p
                                className={`text-4xl font-black tabular-nums ${s.color}`}
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                            >
                                {s.val}
                            </motion.p>
                            <p className="text-slate-400 text-xs mt-2 uppercase tracking-widest font-semibold">{s.label}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ═══════════ FEATURES ═══════════ */}
            <section className="py-28 px-6 relative">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/4 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/4 rounded-full blur-3xl" />
                </div>
                <div className="max-w-6xl mx-auto">
                    <motion.div className="text-center mb-18"
                        initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="text-xs text-cyan-400 tracking-[0.3em] uppercase font-semibold mb-3">Platform Capabilities</p>
                        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">Precision Monitoring</h2>
                        <p className="text-slate-400 max-w-xl mx-auto leading-relaxed">Access industrial-grade tools for groundwater exploration and scientific analysis.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-14">
                        {features.map((f, i) => {
                            const a = accentMap[f.accent];
                            return (
                                <motion.div key={f.title}
                                    className={`relative group rounded-2xl border bg-slate-900/50 backdrop-blur-sm p-7 overflow-hidden transition-all duration-400 ${a}`}
                                    initial={{ opacity: 0, y: 30, filter: 'blur(4px)' }}
                                    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    viewport={{ once: true, margin: '-40px' }}
                                    transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                                    whileHover={{ y: -6 }}
                                >
                                    {/* Left accent bar */}
                                    <motion.div
                                        className={`absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b from-cyan-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                                    />
                                    {/* BG gradient on hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${a.split(' ').find(c => c.startsWith('from-')) || ''} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400`} />

                                    <div className="relative z-10">
                                        <motion.div
                                            className="w-11 h-11 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center mb-5 group-hover:bg-white/10 transition-colors duration-300"
                                            whileHover={{ rotate: 8, scale: 1.1 }}
                                        >
                                            <f.icon className={`w-5 h-5 text-slate-400 transition-colors duration-300 ${a.split(' ').find(c => c.startsWith('group-hover:text-')) || ''}`} />
                                        </motion.div>
                                        <h3 className="text-lg font-bold text-white mb-2.5 tracking-tight">{f.title}</h3>
                                        <p className="text-slate-500 text-sm leading-relaxed group-hover:text-slate-400 transition-colors duration-300">{f.desc}</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════════ HOW IT WORKS ═══════════ */}
            <section className="py-24 px-6 bg-slate-900/30 border-t border-white/5">
                <div className="max-w-4xl mx-auto">
                    <motion.div className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <p className="text-xs text-cyan-400 tracking-[0.3em] uppercase font-semibold mb-3">Simple Workflow</p>
                        <h2 className="text-4xl font-black text-white tracking-tight">How It Works</h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting line */}
                        <div className="hidden md:block absolute top-7 left-[17%] right-[17%] h-px bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-cyan-500/30" />

                        {howItWorks.map((s, i) => (
                            <motion.div key={s.step} className="text-center relative"
                                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                            >
                                <motion.div
                                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-blue-500/15 border border-cyan-500/25 flex items-center justify-center mx-auto mb-5 relative z-10"
                                    whileHover={{ scale: 1.1, boxShadow: '0 0 30px rgba(6,182,212,0.3)' }}
                                >
                                    <span className="text-cyan-400 font-black text-lg">{s.step}</span>
                                </motion.div>
                                <h3 className="text-white font-bold mb-2 tracking-tight">{s.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════ AWARENESS BANNER ═══════════ */}
            <section className="py-20 px-6 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/6 rounded-full blur-3xl" />
                </div>
                <motion.div
                    className="max-w-3xl mx-auto text-center relative z-10"
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="bg-gradient-to-br from-cyan-500/8 via-blue-500/5 to-slate-900/50 border border-cyan-500/15 rounded-3xl p-12 backdrop-blur-sm relative overflow-hidden">
                        {/* Top edge glow */}
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                            className="inline-block mb-5"
                        >
                            <Waves className="w-12 h-12 text-cyan-400 mx-auto" />
                        </motion.div>

                        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
                            Save Groundwater.
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Every Drop Matters.</span>
                        </h2>
                        <p className="text-slate-400 mb-8 max-w-xl mx-auto leading-relaxed">
                            India&apos;s groundwater serves over 85% of rural drinking water needs.
                            Monitoring and conservation today determines availability for future generations.
                        </p>
                        <Link href="/register" className="inline-block w-full sm:w-auto">
                            <motion.div 
                                whileHover={{ scale: 1.02 }} 
                                whileTap={{ scale: 0.98 }}
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-xl shadow-cyan-500/25 text-sm hover:shadow-cyan-500/40 transition-shadow"
                            >
                                Start Monitoring <ArrowRight className="w-4 h-4" />
                            </motion.div>
                        </Link>
                    </div>
                </motion.div>
            </section>

            {/* ═══════════ FOOTER ═══════════ */}
            <footer className="border-t border-white/5 py-8 px-6 text-center bg-slate-950/80">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Droplets className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-bold text-white text-sm tracking-tight">AquaWatch India</span>
                </div>
                <p className="text-slate-600 text-xs">Data sourced from India WRIS · Central Ground Water Board (CGWB) · Open-Meteo</p>
                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-600">
                    <Link href="/login" className="hover:text-slate-400 transition-colors">Sign In</Link>
                    <Link href="/register" className="hover:text-slate-400 transition-colors">Register</Link>
                </div>
            </footer>
        </div>
    );
}
