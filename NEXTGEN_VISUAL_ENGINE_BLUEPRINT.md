# NEXTGEN_VISUAL_ENGINE_BLUEPRINT.md
> **Version:** 2.0.0 | **Target Stack:** React 18+ / Tailwind CSS v4 / Supabase / Vite
> **Classification:** AI Code-Generation Ingest — Technical Specification
> **Derived from:** Draftly.space, Apple Liquid Glass, GSAP ScrollTrigger, CSS Scroll-Driven Animations (2025–2026 frontier)

---

## TABLE OF CONTENTS

```
01. VISUAL ENGINE ............ Z-axis, Perspective, Matrix3D, Layered Shadows
02. SCROLL-DRIVEN ENGINE ..... Frame Sequencing, ScrollTimeline, Parallax Layers
03. MOTION PHYSICS ........... Spring/Damping, Layout Projection, RAF Loop
04. MATERIAL SYSTEM .......... Glassmorphism, Liquid Glass, Mesh Gradients, Noise
05. MICRO-INTERACTIONS ....... Hover States, Kinetic Typography, Cursor FX
06. COMPONENT RECIPES ........ Drop-in React patterns for each system
07. TAILWIND TOKEN MAP ........ CSS variables → Tailwind arbitrary values
08. PERFORMANCE CONTRACTS .... GPU compositing, will-change, Layer budgets
09. SUPABASE INTEGRATION ..... Real-time visual state, Edge Function triggers
10. AGENT PROMPT TEMPLATES ... Ingest-ready snippets for code-gen agents
```

---

## 01. VISUAL ENGINE — DEPTH & Z-AXIS SYSTEM

### 1.1 Perspective & 3D Context Hierarchy

```css
/* ROOT PERSPECTIVE CONTAINER */
.scene-root {
  perspective: 1200px;             /* Human eye equiv ~800–1400px */
  perspective-origin: 50% 40%;    /* Slight above-center = cinematic camera */
  transform-style: preserve-3d;   /* Mandatory: propagates 3D to children */
}

/* DEPTH LAYER ASSIGNMENTS */
.layer--bg      { transform: translateZ(-200px) scale(1.18); }
.layer--mid     { transform: translateZ(-80px)  scale(1.07); }
.layer--surface { transform: translateZ(0px); }
.layer--float   { transform: translateZ(40px); }
.layer--overlay { transform: translateZ(80px); }
.layer--cursor  { transform: translateZ(160px); }
```

### 1.2 Matrix3D Transform — Tilt-on-Pointer (Vanilla JS)

```typescript
// useDepthTilt.ts — React hook
import { useRef, useCallback } from 'react';

interface TiltConfig {
  maxRotate?: number;   // default: 12
  perspective?: number; // default: 1000
  scale?: number;       // default: 1.04
  easing?: number;      // lerp factor 0–1, default: 0.08
}

export function useDepthTilt(config: TiltConfig = {}) {
  const { maxRotate = 12, perspective = 1000, scale = 1.04, easing = 0.08 } = config;
  const ref = useRef<HTMLDivElement>(null);
  const current = useRef({ rx: 0, ry: 0 });
  const target  = useRef({ rx: 0, ry: 0 });
  const raf     = useRef<number>(0);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const animate = useCallback(() => {
    current.current.rx = lerp(current.current.rx, target.current.rx, easing);
    current.current.ry = lerp(current.current.ry, target.current.ry, easing);
    if (ref.current) {
      const { rx, ry } = current.current;
      // Matrix3D: [cos(ry),0,sin(ry),0, sin(rx)*sin(ry),cos(rx),-sin(rx)*cos(ry),0, ...]
      // Shorthand via rotateX/Y — browser compiles to matrix3d internally:
      ref.current.style.transform =
        `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${scale},${scale},${scale})`;
    }
    raf.current = requestAnimationFrame(animate);
  }, [easing, perspective, scale]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const nx = (e.clientX - cx) / (rect.width  / 2); // -1 → 1
    const ny = (e.clientY - cy) / (rect.height / 2); // -1 → 1
    target.current.rx = -ny * maxRotate;
    target.current.ry =  nx * maxRotate;
  }, [maxRotate]);

  const onMouseLeave = useCallback(() => {
    target.current = { rx: 0, ry: 0 };
  }, []);

  const onMouseEnter = useCallback(() => {
    raf.current = requestAnimationFrame(animate);
  }, [animate]);

  return { ref, onMouseMove, onMouseLeave, onMouseEnter };
}
```

### 1.3 Layered Box-Shadow — Depth Illusion System

```css
/* ELEVATION TOKENS — 6 levels */
:root {
  --shadow-0:  none;
  --shadow-1:  0 1px  2px  rgba(0,0,0,.06), 0 1px  3px  rgba(0,0,0,.10);
  --shadow-2:  0 4px  6px  rgba(0,0,0,.07), 0 2px  4px  rgba(0,0,0,.06);
  --shadow-3:  0 10px 15px rgba(0,0,0,.10), 0 4px  6px  rgba(0,0,0,.05);
  --shadow-4:  0 20px 25px rgba(0,0,0,.12), 0 8px  10px rgba(0,0,0,.06);
  --shadow-5:  0 40px 60px rgba(0,0,0,.16), 0 16px 24px rgba(0,0,0,.08);

  /* PREMIUM: Colored ambient + key light */
  --shadow-premium:
    0 0   0  1px  rgba(255,255,255,.06),    /* inner border glow */
    0 2px  4px   rgba(0,0,0,.30),           /* contact shadow */
    0 8px  16px  rgba(0,0,0,.18),           /* mid shadow */
    0 32px 64px  rgba(0,0,0,.22),           /* ambient */
    0 0   80px  rgba(120,80,255,.12);       /* colored bloom */

  --shadow-float-hover:
    0 0   0  1px  rgba(255,255,255,.10),
    0 4px  8px   rgba(0,0,0,.25),
    0 16px 32px  rgba(0,0,0,.20),
    0 48px 96px  rgba(0,0,0,.24),
    0 0  120px  rgba(120,80,255,.18);
}
```

---

## 02. SCROLL-DRIVEN ENGINE

### 2.1 Frame-Sequence Scroll Animation (Draftly-Pattern)

```typescript
// ImageSequenceScroller.tsx
// Replicates Draftly's core: video frames → scroll-driven canvas playback

import { useEffect, useRef } from 'react';

interface SequenceConfig {
  frameCount: number;             // total extracted frames (e.g. 120 @ 24fps × 5s)
  frameDir:   string;             // '/frames/' — must be in /public
  ext?:       'jpg' | 'webp';     // default: 'webp' (better compression)
  scrollHeight: number;           // sticky container height in vh-units (e.g. 500)
  ease?: (t: number) => number;   // easing fn — default: easeInOutCubic
}

export function ImageSequenceScroller({ frameCount, frameDir, ext = 'webp', scrollHeight, ease }: SequenceConfig) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const images     = useRef<HTMLImageElement[]>([]);
  const currentIdx = useRef(0);

  // Preload all frames (critical path — do during idle)
  useEffect(() => {
    const load = async () => {
      const urls = Array.from({ length: frameCount }, (_, i) =>
        `${frameDir}frame-${String(i + 1).padStart(4, '0')}.${ext}`
      );
      // Stagger preload to avoid network saturation
      const chunks = [];
      for (let i = 0; i < urls.length; i += 10) chunks.push(urls.slice(i, i + 10));
      for (const chunk of chunks) {
        await Promise.all(chunk.map(src => new Promise<void>(res => {
          const img = new Image();
          img.src = src;
          img.onload = () => { images.current.push(img); res(); };
        })));
      }
      // Draw first frame
      drawFrame(0);
    };
    load();
  }, [frameCount, frameDir, ext]);

  const easeInOutCubic = (t: number) => t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;

  const drawFrame = (idx: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !images.current[idx]) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.drawImage(images.current[idx], 0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    const onScroll = () => {
      const el = canvasRef.current?.closest('[data-sequence-root]') as HTMLElement;
      if (!el) return;
      const rect     = el.getBoundingClientRect();
      const total    = el.offsetHeight - window.innerHeight;
      const scrolled = -rect.top;
      const rawT     = Math.max(0, Math.min(1, scrolled / total));
      const t        = (ease ?? easeInOutCubic)(rawT);
      const idx      = Math.min(Math.floor(t * (frameCount - 1)), frameCount - 1);

      if (idx !== currentIdx.current) {
        currentIdx.current = idx;
        drawFrame(idx);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [frameCount, ease]);

  return (
    <div
      data-sequence-root
      style={{ height: `${scrollHeight}vh`, position: 'relative' }}
    >
      <div style={{ position: 'sticky', top: 0, height: '100vh' }}>
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}
```

### 2.2 CSS Scroll-Driven Animations (Native — No JS)

```css
/* animation-timeline: scroll() — Chrome 115+, Safari 18+, Edge 115+ */
/* NOTE: Firefox support absent as of 2026 — provide JS fallback */

@keyframes parallax-drift {
  from { transform: translateY(0px);   }
  to   { transform: translateY(-80px); }
}

.parallax-bg {
  animation: parallax-drift linear both;
  animation-timeline: scroll(root block);
  animation-range: 0% 100%;
}

/* VIEW TIMELINE — element-scoped */
@keyframes fade-up-in {
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0px);  }
}

.reveal-on-enter {
  animation: fade-up-in linear both;
  animation-timeline: view();
  animation-range: entry 0% entry 30%;  /* triggers as element enters viewport */
}

/* NAMED SCROLL TIMELINES */
.scroll-container {
  scroll-timeline: --section-scroll block;
  overflow-y: scroll;
  height: 100vh;
}

.progress-bar {
  animation: grow-x linear both;
  animation-timeline: --section-scroll;
}
@keyframes grow-x {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
```

### 2.3 GSAP ScrollTrigger — Cinematic Layer Parallax

```typescript
// ParallaxScene.tsx — GSAP-based multi-layer depth
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// SPEED MULTIPLIERS: 0.2–0.5 feel natural; >0.7 = motion sickness risk
const LAYER_SPEEDS = {
  sky:        0.15,  // most distant
  mountains:  0.30,
  midground:  0.45,
  foreground: 0.60,
  ui:         0.80,  // closest to camera
};

export function ParallaxScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      Object.entries(LAYER_SPEEDS).forEach(([name, speed]) => {
        gsap.to(`[data-layer="${name}"]`, {
          yPercent: -100 * speed,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,  // scrub:true = 1:1 scroll binding
          },
        });
      });

      // Section reveal with stagger
      gsap.fromTo('.section-card', {
        opacity: 0,
        y: 60,
        scale: 0.96,
        filter: 'blur(8px)',
      }, {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.section-cards-container',
          start: 'top 80%',
          toggleActions: 'play none none reverse',
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return <div ref={containerRef}>{/* layer markup */}</div>;
}
```

---

## 03. MOTION PHYSICS — SPRING, DAMPING, RAF LOOP

### 3.1 Spring Dynamics Parameters

```typescript
// springPhysics.ts — physics-accurate spring simulation

interface SpringConfig {
  stiffness: number;    // k — spring constant (force per unit displacement)
  damping:   number;    // c — energy dissipation coefficient
  mass?:     number;    // m — inertia (default: 1)
  precision?: number;   // velocity threshold to stop (default: 0.001)
}

// PRESET LIBRARY
export const SpringPresets = {
  // Smooth, gentle — for modals, drawers
  GENTLE:     { stiffness: 120,  damping: 14,  mass: 1   } as SpringConfig,
  // Snappy, responsive — for hover micro-interactions
  SNAPPY:     { stiffness: 380,  damping: 20,  mass: 1   } as SpringConfig,
  // Bouncy — for playful UI elements
  BOUNCY:     { stiffness: 600,  damping: 15,  mass: 1.5 } as SpringConfig,
  // Critically damped — no overshoot (ratio = 1.0)
  CRITICAL:   { stiffness: 200,  damping: 28,  mass: 1   } as SpringConfig,
  // Overdamped — slow settle, luxury feel
  LUXURY:     { stiffness: 80,   damping: 20,  mass: 1   } as SpringConfig,
  // High-frequency — notification badges, number counters
  ELASTIC:    { stiffness: 800,  damping: 18,  mass: 0.8 } as SpringConfig,
};

// Damping ratio: ζ = c / (2 * sqrt(k * m))
// ζ < 1 = underdamped (oscillates)
// ζ = 1 = critically damped (fastest settle, no oscillation)
// ζ > 1 = overdamped (slow, no oscillation)

export class SpringSolver {
  private velocity = 0;
  private current:  number;

  constructor(initial: number, private config: SpringConfig) {
    this.current = initial;
  }

  tick(target: number, dt: number): number {
    const { stiffness, damping, mass = 1 } = this.config;
    const spring = -stiffness * (this.current - target);
    const damp   = -damping   * this.velocity;
    const accel  = (spring + damp) / mass;

    this.velocity += accel * dt;
    this.current  += this.velocity * dt;
    return this.current;
  }

  isSettled(target: number, precision = 0.001): boolean {
    return (
      Math.abs(this.current - target) < precision &&
      Math.abs(this.velocity) < precision
    );
  }
}

// Usage in RAF loop:
// const solver = new SpringSolver(0, SpringPresets.SNAPPY);
// let last = performance.now();
// function animate() {
//   const now = performance.now();
//   const dt  = Math.min((now - last) / 1000, 0.05); // cap at 50ms
//   last = now;
//   const val = solver.tick(targetValue, dt);
//   el.style.transform = `translateY(${val}px)`;
//   if (!solver.isSettled(targetValue)) requestAnimationFrame(animate);
// }
```

### 3.2 Layout Projection — FLIP Technique

```typescript
// useFlipAnimation.ts
// FLIP = First, Last, Invert, Play — GPU-composited layout transitions

import { useRef, useCallback } from 'react';

export function useFlip() {
  const snapshots = useRef<Map<string, DOMRect>>(new Map());

  // FIRST: capture before layout change
  const snapshot = useCallback((id: string, el: HTMLElement) => {
    snapshots.current.set(id, el.getBoundingClientRect());
  }, []);

  // PLAY: called after DOM mutation
  const play = useCallback((id: string, el: HTMLElement, duration = 400) => {
    const first = snapshots.current.get(id);
    if (!first) return;

    // LAST
    const last = el.getBoundingClientRect();

    // INVERT
    const dx = first.left - last.left;
    const dy = first.top  - last.top;
    const sw = first.width  / last.width;
    const sh = first.height / last.height;

    // Apply inverse transform synchronously
    el.style.transform = `translate(${dx}px, ${dy}px) scale(${sw}, ${sh})`;
    el.style.transformOrigin = 'top left';
    el.style.transition = 'none';

    // PLAY: remove inverse on next frame → browser interpolates
    requestAnimationFrame(() => {
      el.style.transition = `transform ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
      el.style.transform  = '';
      el.addEventListener('transitionend', () => {
        el.style.transition    = '';
        el.style.transformOrigin = '';
      }, { once: true });
    });
  }, []);

  return { snapshot, play };
}
```

### 3.3 Optimized RAF Loop (Compositor-Friendly)

```typescript
// motionLoop.ts — centralized animation loop

type AnimationCallback = (dt: number, elapsed: number) => void;

class MotionLoop {
  private callbacks  = new Map<symbol, AnimationCallback>();
  private handle?:    number;
  private lastTime =  0;
  private elapsed  =  0;

  register(cb: AnimationCallback): () => void {
    const id = Symbol();
    this.callbacks.set(id, cb);
    if (!this.handle) this.start();
    return () => {
      this.callbacks.delete(id);
      if (this.callbacks.size === 0) this.stop();
    };
  }

  private tick = (timestamp: number) => {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 1/30); // 30fps min cap
    this.lastTime = timestamp;
    this.elapsed += dt;

    // All mutations go through here → single RAF per frame
    for (const cb of this.callbacks.values()) cb(dt, this.elapsed);

    this.handle = requestAnimationFrame(this.tick);
  };

  private start() { this.lastTime = performance.now(); this.handle = requestAnimationFrame(this.tick); }
  private stop()  { if (this.handle) cancelAnimationFrame(this.handle); this.handle = undefined; }
}

export const motionLoop = new MotionLoop(); // singleton
```

---

## 04. MATERIAL SYSTEM

### 4.1 Glassmorphism — Specification & Implementation

```typescript
// GlassPanel.tsx

interface GlassPanelProps {
  blur?:       'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';  // default: 'xl'
  opacity?:    number;    // bg opacity 0–1, default: 0.12
  saturation?: number;    // backdrop-saturate %, default: 180
  border?:     boolean;   // inner border glow, default: true
  tint?:       string;    // CSS color for glass tint, default: 'white'
  shadow?:     'none' | 'soft' | 'deep';
}

// Tailwind mapping:
// blur:xl        → backdrop-blur-xl         (24px Gaussian)
// opacity:0.12   → bg-white/[0.12]
// saturation:180 → backdrop-saturate-[180%]

// CRITICAL: requires visible background behind element (gradient/image)
// backdrop-filter is GPU-accelerated but expensive if overused
// Rule: max 3–4 glass panels active simultaneously

const blurMap = {
  sm:  'backdrop-blur-sm',   // 4px
  md:  'backdrop-blur-md',   // 12px
  lg:  'backdrop-blur-lg',   // 16px
  xl:  'backdrop-blur-xl',   // 24px
  '2xl': 'backdrop-blur-2xl', // 40px
  '3xl': 'backdrop-blur-3xl', // 64px — Apple-tier frosted glass
};

export function GlassPanel({
  blur = 'xl',
  opacity = 0.12,
  saturation = 180,
  border = true,
  tint = 'white',
  shadow = 'soft',
  children,
}: GlassPanelProps & { children: React.ReactNode }) {
  return (
    <div
      className={`
        relative isolate rounded-2xl
        ${blurMap[blur]}
        backdrop-saturate-[${saturation}%]
        ${shadow === 'soft' ? 'shadow-[0_8px_32px_rgba(0,0,0,0.18)]' : ''}
        ${shadow === 'deep' ? 'shadow-[0_20px_60px_rgba(0,0,0,0.30),0_0_120px_rgba(120,80,255,0.12)]' : ''}
      `}
      style={{ background: `rgba(255,255,255,${opacity})` }}
    >
      {border && (
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/20 pointer-events-none" />
      )}
      {children}
    </div>
  );
}
```

### 4.2 Liquid Glass — SVG Filter Refraction System

```tsx
// LiquidGlass.tsx — iOS 26-inspired with displacement + specular highlights

export function LiquidGlassFilter({ id = 'liquid-glass' }: { id?: string }) {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden>
      <defs>
        <filter id={id} x="-20%" y="-20%" width="140%" height="140%"
                colorInterpolationFilters="sRGB">

          {/* Step 1: Gaussian blur source (creates frosted base) */}
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.5" result="blur-source" />

          {/* Step 2: Displacement map — warps pixels for refraction */}
          <feImage
            href="/assets/glass-displacement.png"  /* radial gradient PNG — see 4.2a */
            x="0" y="0" width="100%" height="100%"
            result="disp-map"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="disp-map"
            scale="12"                  /* 8–18 range; higher = more refraction */
            xChannelSelector="R"
            yChannelSelector="G"
            result="refracted"
          />

          {/* Step 3: Backdrop blur simulation via composite */}
          <feGaussianBlur in="refracted" stdDeviation="8" result="blurred" />

          {/* Step 4: Specular rim highlight */}
          <feSpecularLighting in="blur-source" surfaceScale="3"
                              specularConstant="0.8" specularExponent="28"
                              result="specular">
            <fePointLight x="50%" y="0%" z="200" />
          </feSpecularLighting>
          <feComposite in="specular" in2="SourceGraphic" operator="in" result="specular-mask" />

          {/* Step 5: Composite layers */}
          <feComposite in="blurred" in2="specular-mask" operator="over" result="glass-base" />
          <feBlend in="glass-base" in2="SourceGraphic" mode="luminosity" result="final" />

          <feComponentTransfer in="final">
            <feFuncA type="linear" slope="0.85" />  {/* overall opacity */}
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  );
}

// 4.2a: Displacement map generation (run once, save as PNG)
// Canvas radial gradient: center=(255,128,0), edge=(0,128,255)
// R-channel encodes horizontal displacement
// G-channel encodes vertical displacement
function generateDisplacementMap(width = 200, height = 200): string {
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(
    width/2, height/2, 0,
    width/2, height/2, width/2
  );
  grad.addColorStop(0,   'rgb(128, 128, 0)');  // neutral center
  grad.addColorStop(0.5, 'rgb(255, 64,  0)');  // push right
  grad.addColorStop(1,   'rgb(0,   192, 255)'); // push left+down
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);
  return canvas.toDataURL('image/png');
}
```

### 4.3 Mesh Gradient System

```css
/* MESH GRADIENT — CSS conic + radial composition */

.mesh-gradient {
  background:
    /* Node 1: top-left warm */
    radial-gradient(ellipse 60% 50% at 10%  15%,  rgba(255, 100, 60,  0.72) transparent),
    /* Node 2: top-right cool */
    radial-gradient(ellipse 55% 60% at 85%  10%,  rgba(80,  120, 255, 0.68) transparent),
    /* Node 3: center */
    radial-gradient(ellipse 70% 50% at 50%  50%,  rgba(120, 60,  220, 0.60) transparent),
    /* Node 4: bottom-left */
    radial-gradient(ellipse 60% 55% at 15%  85%,  rgba(60,  200, 180, 0.65) transparent),
    /* Node 5: bottom-right */
    radial-gradient(ellipse 65% 60% at 88%  82%,  rgba(255, 180, 60,  0.58) transparent),
    /* Base fill */
    #0f0a1e;
  background-blend-mode: screen, screen, screen, screen, screen, normal;
}

/* ANIMATED mesh — keyframe node drift */
@keyframes mesh-drift {
  0%   { background-position: 10% 15%, 85% 10%, 50% 50%, 15% 85%, 88% 82%; }
  25%  { background-position: 15% 25%, 78% 18%, 55% 45%, 20% 78%, 82% 88%; }
  50%  { background-position: 20% 20%, 82% 12%, 48% 52%, 18% 82%, 85% 85%; }
  75%  { background-position: 12% 18%, 80% 15%, 52% 48%, 16% 80%, 87% 80%; }
  100% { background-position: 10% 15%, 85% 10%, 50% 50%, 15% 85%, 88% 82%; }
}

.mesh-gradient--animated {
  animation: mesh-drift 12s ease-in-out infinite;
}
```

### 4.4 Noise Texture — SVG Filter Grain System

```tsx
// NoiseOverlay.tsx — film grain effect via SVG feTurbulence

interface NoiseConfig {
  frequency?: number;  // 0.6–0.8 typical; lower = coarser grain
  octaves?:   number;  // 4 default; more = finer detail
  opacity?:   number;  // overlay opacity 0–1; 0.04–0.12 for subtle
  animate?:   boolean; // shift noise seed over time
  blendMode?: 'overlay' | 'soft-light' | 'screen' | 'multiply';
}

export function NoiseOverlay({
  frequency = 0.65,
  octaves   = 4,
  opacity   = 0.06,
  animate   = false,
  blendMode = 'overlay'
}: NoiseConfig) {
  return (
    <>
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden>
        <defs>
          <filter id="noise-grain" x="0%" y="0%" width="100%" height="100%"
                  colorInterpolationFilters="linearRGB">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={frequency}
              numOctaves={octaves}
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix type="saturate" values="0" />  {/* desaturate to pure grain */}
          </filter>
        </defs>
      </svg>
      <div
        aria-hidden
        style={{
          position:   'fixed',
          inset:      0,
          zIndex:     9999,
          pointerEvents: 'none',
          opacity,
          mixBlendMode: blendMode,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${frequency}' numOctaves='${octaves}' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />
    </>
  );
}
```

---

## 05. MICRO-INTERACTIONS

### 5.1 Hover State System — 4-Layer Model

```typescript
// useHoverEffect.ts — magnetic, glow, ripple, tilt composite

export function useMagneticHover(strength = 0.35) {
  const ref    = useRef<HTMLElement>(null);
  const solver = useRef(new SpringSolver(0, SpringPresets.SNAPPY));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let animating = false;
    let targetX = 0, targetY = 0;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      targetX    = (e.clientX - cx) * strength;
      targetY    = (e.clientY - cy) * strength;
      if (!animating) { animating = true; tick(); }
    };

    const onLeave = () => { targetX = 0; targetY = 0; };

    let lastT = 0;
    const tick = (t = 0) => {
      const dt = Math.min((t - lastT) / 1000, 0.05);
      lastT = t;
      // Simplified: directly lerp for magnetic (not spring needed here)
      const cx = parseFloat(el.dataset.mx || '0');
      const cy = parseFloat(el.dataset.my || '0');
      const nx = cx + (targetX - cx) * 0.12;
      const ny = cy + (targetY - cy) * 0.12;
      el.dataset.mx = String(nx);
      el.dataset.my = String(ny);
      el.style.transform = `translate(${nx}px, ${ny}px)`;
      if (Math.abs(nx - targetX) > 0.1 || Math.abs(ny - targetY) > 0.1) {
        requestAnimationFrame(tick);
      } else {
        animating = false;
      }
    };

    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [strength]);

  return ref;
}

// CSS hover states — gradient border reveal
// .btn-premium:hover rule:
// --hover-states CSS:
const hoverStyles = `
.btn-glow {
  position: relative;
  isolation: isolate;
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1),
              box-shadow 200ms ease;
}
.btn-glow::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: conic-gradient(
    from var(--angle, 0deg),
    rgba(120,80,255,0), rgba(120,80,255,0.8),
    rgba(80,160,255,0.8), rgba(120,80,255,0)
  );
  opacity: 0;
  transition: opacity 300ms ease;
  z-index: -1;
}
.btn-glow:hover::before { opacity: 1; }
.btn-glow:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 8px 32px rgba(120,80,255,0.35);
}
@property --angle {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}
@keyframes spin-border {
  to { --angle: 360deg; }
}
.btn-glow:hover::before {
  animation: spin-border 2s linear infinite;
}
`;
```

### 5.2 Kinetic Typography System

```typescript
// KineticText.tsx — character-level spring animation

interface KineticTextProps {
  text:       string;
  trigger:    'mount' | 'scroll' | 'hover';
  variant:    'wave' | 'stagger-up' | 'blur-in' | 'scramble';
  staggerMs?: number;  // default: 40ms per char
  spring?:    SpringConfig;
}

// VARIANT: stagger-up (most common in premium UIs)
export function StaggerText({ text, staggerMs = 40 }: { text: string; staggerMs?: number }) {
  return (
    <span aria-label={text} style={{ display: 'inline-block' }}>
      {text.split('').map((char, i) => (
        <span
          key={i}
          className="inline-block animate-[fade-up_0.5s_ease_both]"
          style={{
            animationDelay: `${i * staggerMs}ms`,
            // animate-[fade-up] must be in Tailwind config keyframes
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
}

// Tailwind config addtion:
// theme.extend.keyframes['fade-up'] = {
//   from: { opacity: '0', transform: 'translateY(0.5em) rotateX(-30deg)', filter: 'blur(4px)' },
//   to:   { opacity: '1', transform: 'translateY(0)',                     filter: 'blur(0)'   },
// }

// VARIANT: scramble (Daftpunk/sci-fi reveal)
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';

export function ScrambleText({ text, trigger = 'hover' }: { text: string; trigger?: 'hover' | 'mount' }) {
  const [displayed, setDisplayed] = React.useState(text);
  const iterRef = useRef(0);

  const scramble = useCallback(() => {
    let frame = 0;
    const totalFrames = text.length * 3;

    const animate = () => {
      setDisplayed(
        text.split('').map((char, i) => {
          if (char === ' ') return ' ';
          if (frame / 3 > i) return char; // reveal left-to-right
          return CHARS[Math.floor(Math.random() * CHARS.length)];
        }).join('')
      );
      frame++;
      if (frame < totalFrames) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [text]);

  return (
    <span
      onMouseEnter={trigger === 'hover' ? scramble : undefined}
      style={{ fontVariantNumeric: 'tabular-nums', cursor: 'default' }}
    >
      {displayed}
    </span>
  );
}
```

### 5.3 Scroll-Triggered Parallax — React Hook (Pure, No Lib)

```typescript
// useParallax.ts — library-free, compositor-threaded

export function useParallax(speed: number = 0.3) {
  // speed: 0.0 = no movement, 1.0 = full scroll speed
  // Range 0.2–0.5 = natural depth; values sourced from builder.io 2026 guidance
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      if (!el) return;
      const scrollY = window.scrollY;
      // Transform runs on compositor — no layout thrash
      el.style.transform = `translate3d(0, ${scrollY * speed}px, 0)`;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [speed]);

  return ref as React.RefObject<HTMLElement>;
}

// Usage: <img ref={useParallax(0.3)} src="..." />
```

---

## 06. COMPONENT RECIPES (COPY-PASTE READY)

### 6.1 Premium Hero Section

```tsx
// HeroCinematic.tsx
export function HeroCinematic() {
  return (
    <section className="relative h-screen overflow-hidden">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 mesh-gradient mesh-gradient--animated" />

      {/* Noise overlay */}
      <NoiseOverlay opacity={0.05} blendMode="overlay" />

      {/* Frame sequence OR video fallback */}
      <ImageSequenceScroller frameCount={120} frameDir="/frames/" scrollHeight={300} />

      {/* Floating glass card */}
      <div className="absolute inset-0 flex items-center justify-center">
        <GlassPanel blur="2xl" opacity={0.08} shadow="deep" className="p-10 max-w-2xl text-center">
          <ScrambleText text="CINEMATIC SCROLL" trigger="mount" />
          <p className="mt-4 text-white/70 text-lg">
            Frame-extracted motion. No WebGL. Pure scroll.
          </p>
        </GlassPanel>
      </div>
    </section>
  );
}
```

### 6.2 3D Product Card

```tsx
export function ProductCard3D({ image, title, price }: ProductCardProps) {
  const { ref, onMouseMove, onMouseLeave, onMouseEnter } = useDepthTilt({
    maxRotate: 8, scale: 1.03
  });

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove as any}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
      className="relative w-72 rounded-3xl overflow-hidden cursor-pointer"
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      {/* Layer: background image */}
      <img src={image} className="w-full h-80 object-cover"
           style={{ transform: 'translateZ(-20px) scale(1.05)' }} />

      {/* Layer: glass info panel */}
      <div style={{ transform: 'translateZ(30px)' }}>
        <GlassPanel blur="xl" opacity={0.15} className="absolute bottom-0 inset-x-0 p-5">
          <p className="text-white font-semibold text-lg">{title}</p>
          <p className="text-white/60 mt-1">{price}</p>
        </GlassPanel>
      </div>
    </div>
  );
}
```

---

## 07. TAILWIND TOKEN MAP

```javascript
// tailwind.config.ts additions

module.exports = {
  theme: {
    extend: {
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(0.5em) rotateX(-30deg)', filter: 'blur(4px)' },
          to:   { opacity: '1', transform: 'translateY(0)',                     filter: 'blur(0)'   },
        },
        'mesh-drift': {
          '0%, 100%': { backgroundPosition: '10% 15%, 85% 10%, 50% 50%' },
          '50%':      { backgroundPosition: '20% 20%, 82% 12%, 48% 52%' },
        },
        'spin-angle': {
          to: { '--angle': '360deg' },
        },
        'grain-shift': {
          '0%':   { transform: 'translate(0, 0)' },
          '10%':  { transform: 'translate(-2%, -3%)' },
          '30%':  { transform: 'translate(3%, 2%)' },
          '50%':  { transform: 'translate(-1%, 4%)' },
          '70%':  { transform: 'translate(2%, -2%)' },
          '100%': { transform: 'translate(0, 0)' },
        },
      },
      backdropBlur: {
        '4xl': '80px',
        '5xl': '120px',
      },
      boxShadow: {
        'glass-sm':    '0 4px 16px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.12)',
        'glass-md':    '0 8px 32px rgba(0,0,0,0.20), inset 0 0 0 1px rgba(255,255,255,0.15)',
        'glass-lg':    '0 20px 60px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(255,255,255,0.18)',
        'premium':     '0 0 0 1px rgba(255,255,255,0.06), 0 2px 4px rgba(0,0,0,0.30), 0 32px 64px rgba(0,0,0,0.22), 0 0 80px rgba(120,80,255,0.12)',
        'elevation-1': '0 1px 3px rgba(0,0,0,0.10), 0 1px 2px rgba(0,0,0,0.06)',
        'elevation-5': '0 40px 60px rgba(0,0,0,0.16), 0 16px 24px rgba(0,0,0,0.08)',
      },
    },
  },
};
```

---

## 08. PERFORMANCE CONTRACTS

### GPU Compositing Rules

```
SAFE (compositor thread — no layout/paint):
  ✓ transform: translate3d(), rotate(), scale(), matrix3d()
  ✓ opacity
  ✓ filter (GPU-based; monitor overdraw)
  ✓ backdrop-filter (expensive — max 4 active)
  ✓ will-change: transform, opacity (pre-promotes to GPU layer)

UNSAFE (triggers layout):
  ✗ top, left, right, bottom (use transform instead)
  ✗ width, height on animated elements
  ✗ margin, padding during animations

will-change STRATEGY:
  - Apply on :hover-intent (mouseenter), NOT globally
  - Remove after animation completes
  - Global will-change: transform = memory leak risk
  - Max 10–15 promoted layers before memory pressure on mobile
```

### Frame Budget (60fps = 16.67ms/frame)

```
BUDGET ALLOCATION:
  JS execution:     ≤ 4ms   (use RAF, avoid synchronous layout queries)
  Style recalc:     ≤ 2ms   (minimize selector complexity)
  Layout:           ≤ 2ms   (avoid during scroll; use fixed/absolute)
  Paint:            ≤ 4ms   (containment: strict helps)
  Composite:        ≤ 2ms   (maximize compositor-only properties)
  Margin:           ≤ 2.67ms

CSS containment:
  .scene-layer { contain: layout style; }         /* reduces style recalc scope */
  .isolated-card { contain: strict; }             /* full isolation */
  .scroll-section { content-visibility: auto; }  /* defers off-screen rendering */
```

---

## 09. SUPABASE INTEGRATION — REAL-TIME VISUAL STATE

```typescript
// useRealtimeTheme.ts — sync visual state across clients (Draftly-style live edit)

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface VisualState {
  project_id:    string;
  primary_color: string;
  mesh_colors:   string[];
  frame_fps:     number;       // 10–40 per Draftly spec
  active_section: string;
}

export function useRealtimeVisualState(projectId: string) {
  const [state, setState] = React.useState<VisualState | null>(null);

  useEffect(() => {
    // Initial fetch
    supabase
      .from('visual_states')
      .select('*')
      .eq('project_id', projectId)
      .single()
      .then(({ data }) => setState(data));

    // Real-time subscription → live color/FPS sync
    const channel = supabase
      .channel(`visual:${projectId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'visual_states',
        filter: `project_id=eq.${projectId}`,
      }, ({ new: newState }) => setState(newState as VisualState))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [projectId]);

  const updateState = useCallback(async (partial: Partial<VisualState>) => {
    await supabase
      .from('visual_states')
      .update({ ...partial, updated_at: new Date().toISOString() })
      .eq('project_id', projectId);
  }, [projectId]);

  return { state, updateState };
}

// Supabase table schema (SQL):
// CREATE TABLE visual_states (
//   id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
//   project_id   text NOT NULL UNIQUE,
//   primary_color text DEFAULT '#7c3aed',
//   mesh_colors  jsonb DEFAULT '["#ff643c","#5078ff","#783cdc","#3cc8b4","#ffb43c"]',
//   frame_fps    int  DEFAULT 24,
//   active_section text DEFAULT 'hero',
//   updated_at   timestamptz DEFAULT now()
// );
// ALTER TABLE visual_states ENABLE ROW LEVEL SECURITY;
```

---

## 10. AGENT PROMPT TEMPLATES (CODE-GEN INGEST)

### Template A: Cinematic Hero Section

```
CONTEXT: React 18 + Tailwind v4 + Vite. No external animation libs unless GSAP.
TASK: Build a full-viewport hero section with:
  - CSS mesh gradient background (5 radial nodes, animated drift at 12s interval)
  - SVG feTurbulence noise overlay at 0.06 opacity, overlay blend mode
  - Sticky scroll-driven image sequence (120 frames, /public/frames/)
  - Glass panel card centered: backdrop-blur-2xl, bg-white/[0.08], ring-1 ring-white/20
  - Scramble-reveal typography on mount (40ms stagger per char)
  - All transforms on compositor thread: translate3d, no top/left
CONSTRAINTS: 60fps on mobile, content-visibility:auto on off-screen sections,
             max 3 backdrop-filter elements active simultaneously.
OUTPUT: Single TSX file + inline CSS-in-JS variables. No styled-components.
```

### Template B: 3D Product Showcase

```
CONTEXT: Same stack. E-commerce product card.
TASK: Build a tiltable 3D card using useDepthTilt hook (perspective:1000px, maxRotate:12,
      scale:1.04, easing lerp:0.08). Foreground glass badge at translateZ(40px).
      Background image at translateZ(-20px) scale(1.05).
      On hover: box-shadow transitions from --shadow-3 to --shadow-premium.
      Gradient border via @property --angle + conic-gradient spin animation.
CONSTRAINTS: transformStyle:preserve-3d on card. willChange applied on mouseenter only.
OUTPUT: TSX component + SpringPresets import. No external 3D libs.
```

### Template C: Scroll Reveal Section Grid

```
CONTEXT: Same stack + GSAP (CDN).
TASK: 3-column feature grid. On scroll enter (80% viewport):
      - Cards fade from opacity:0 + translateY:60px + blur:8px
      - To opacity:1 + translateY:0 + blur:0
      - Stagger: 150ms between cards
      - Easing: power3.out, duration: 0.8s
      - ScrollTrigger: start:"top 80%", toggleActions:"play none none reverse"
CONSTRAINTS: GSAP context cleanup on unmount via ctx.revert().
OUTPUT: React component with useEffect GSAP setup + card markup.
```

---

## APPENDIX A: BROWSER SUPPORT MATRIX (2026)

| Feature                         | Chrome 115+ | Safari 18+ | Firefox 127+ | Edge 115+ |
|---------------------------------|:-----------:|:----------:|:------------:|:---------:|
| CSS `animation-timeline:scroll` | ✅           | ✅          | ❌            | ✅         |
| `backdrop-filter`               | ✅           | ✅          | ✅            | ✅         |
| `@property` (custom props)      | ✅           | ✅          | ✅            | ✅         |
| `content-visibility: auto`      | ✅           | ✅          | ✅            | ✅         |
| CSS `contain: strict`           | ✅           | ✅          | ✅            | ✅         |
| SVG `feDisplacementMap`         | ✅           | ✅          | ✅            | ✅         |
| `transform-style: preserve-3d`  | ✅           | ✅          | ✅            | ✅         |

**Firefox fallback for scroll-driven animations:**
```javascript
// Detect and polyfill
if (!CSS.supports('animation-timeline', 'scroll()')) {
  // Fall back to IntersectionObserver + manual scroll listener
  import('./scrollFallback').then(m => m.init());
}
```

---

## APPENDIX B: ASSET PIPELINE (DRAFTLY-PATTERN)

```
FRAME EXTRACTION WORKFLOW:
  1. Generate keyframe images: AI image model (Flux/DALL-E/Midjourney)
  2. Animate to video: Runway Gen-4 / Kling / Luma Dream Machine (8s, 24fps)
  3. Extract frames: FFmpeg — `ffmpeg -i input.mp4 -vf fps=24 frames/frame-%04d.webp`
  4. Optimize: `cwebp -q 75 frame-XXXX.jpg -o frame-XXXX.webp` (avg 15–25KB/frame)
  5. Frame count: 24fps × 8s = 192 frames (full) | 12fps × 8s = 96 (perf mode)
  6. Preload strategy: load first 10 synchronously; chunk-load remaining 10 at a time

FRAME FPS GUIDE:
  10 FPS = sparse, slightly choppy but < 1MB total
  24 FPS = cinematic smooth, ~2–4MB total (recommended)
  40 FPS = buttery, ~6–8MB total (premium desktop only)

TOTAL ASSET BUDGET:
  Mobile:  ≤ 2MB frame set (use 12fps, webp quality 65)
  Desktop: ≤ 6MB frame set (use 24fps, webp quality 75)
  4K:      ≤ 12MB (40fps allowed)
```

---

*End of Blueprint — v2.0.0*
*This document is structured for direct ingestion by code-generation agents.*
*All code samples are self-contained; import paths are project-relative.*
