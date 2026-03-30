(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/ui/CustomCursor.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CustomCursor",
    ()=>CustomCursor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-motion-value.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-spring.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
const CustomCursor = ()=>{
    _s();
    const cursorX = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"])(-100);
    const cursorY = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"])(-100);
    const [isHovering, setIsHovering] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Physics configuration for the "aura" (trailing effect)
    const springConfig = {
        damping: 25,
        stiffness: 150
    };
    const cursorXSpring = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"])(cursorX, springConfig);
    const cursorYSpring = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"])(cursorY, springConfig);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CustomCursor.useEffect": ()=>{
            // Move cursor logic
            const moveCursor = {
                "CustomCursor.useEffect.moveCursor": (e)=>{
                    cursorX.set(e.clientX);
                    cursorY.set(e.clientY);
                }
            }["CustomCursor.useEffect.moveCursor"];
            // Hover detection logic
            const handleMouseOver = {
                "CustomCursor.useEffect.handleMouseOver": (e)=>{
                    const target = e.target;
                    // Check for buttons, links, or elements with .magnetic class or data-cursor="hover"
                    const isInteractive = target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('.magnetic') || target.closest('[data-cursor="hover"]') || // Also check if parent is button/a (sometimes target is icon inside)
                    target.closest('button') || target.closest('a');
                    if (isInteractive) {
                        setIsHovering(true);
                    } else {
                        setIsHovering(false);
                    }
                }
            }["CustomCursor.useEffect.handleMouseOver"];
            window.addEventListener('mousemove', moveCursor);
            window.addEventListener('mouseover', handleMouseOver);
            // Initial position to prevent jump
            cursorX.set(window.innerWidth / 2);
            cursorY.set(window.innerHeight / 2);
            return ({
                "CustomCursor.useEffect": ()=>{
                    window.removeEventListener('mousemove', moveCursor);
                    window.removeEventListener('mouseover', handleMouseOver);
                }
            })["CustomCursor.useEffect"];
        }
    }["CustomCursor.useEffect"], [
        cursorX,
        cursorY
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "cb3663c14549e8c9",
                children: "@media (width>=768px){body,a,button{cursor:none}}"
            }, void 0, false, void 0, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                className: "hidden md:block fixed top-0 left-0 w-2.5 h-2.5 bg-zinc-900 rounded-full pointer-events-none z-[9999] shadow-[0_0_10px_rgba(0,0,0,0.1)]",
                style: {
                    x: cursorX,
                    y: cursorY,
                    translateX: '-50%',
                    translateY: '-50%'
                }
            }, void 0, false, {
                fileName: "[project]/src/components/ui/CustomCursor.tsx",
                lineNumber: 68,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                className: "hidden md:block fixed top-0 left-0 w-8 h-8 border border-zinc-900/30 rounded-full pointer-events-none z-[9998] shadow-[0_0_20px_rgba(0,0,0,0.05)]",
                style: {
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: '-50%',
                    translateY: '-50%'
                },
                animate: {
                    scale: isHovering ? 2.5 : 1,
                    opacity: isHovering ? 0.8 : 0.4,
                    backgroundColor: isHovering ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
                    borderColor: isHovering ? 'rgba(0, 229, 255, 0.6)' : 'rgba(24, 24, 27, 0.2)'
                },
                transition: {
                    duration: 0.3,
                    ease: "easeOut"
                }
            }, void 0, false, {
                fileName: "[project]/src/components/ui/CustomCursor.tsx",
                lineNumber: 79,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true);
};
_s(CustomCursor, "Wsi09O1YkUK9a/5GyrMjO0sweyI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"]
    ];
});
_c = CustomCursor;
var _c;
__turbopack_context__.k.register(_c, "CustomCursor");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/NoiseOverlay.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NoiseOverlay",
    ()=>NoiseOverlay
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/styled-jsx/style.js [app-client] (ecmascript)");
'use client';
;
;
const NoiseOverlay = ()=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "jsx-174bf48a61c39132" + " " + "pointer-events-none fixed inset-0 z-[9990] opacity-[0.03] mix-blend-overlay overflow-hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    className: "jsx-174bf48a61c39132" + " " + "h-full w-full animate-noise",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("filter", {
                            id: "noiseFilter",
                            className: "jsx-174bf48a61c39132",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("feTurbulence", {
                                type: "fractalNoise",
                                baseFrequency: "0.8",
                                numOctaves: "4",
                                stitchTiles: "stitch",
                                className: "jsx-174bf48a61c39132"
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/NoiseOverlay.tsx",
                                lineNumber: 9,
                                columnNumber: 25
                            }, ("TURBOPACK compile-time value", void 0))
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/NoiseOverlay.tsx",
                            lineNumber: 8,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("rect", {
                            width: "100%",
                            height: "100%",
                            filter: "url(#noiseFilter)",
                            className: "jsx-174bf48a61c39132"
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/NoiseOverlay.tsx",
                            lineNumber: 16,
                            columnNumber: 21
                        }, ("TURBOPACK compile-time value", void 0))
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ui/NoiseOverlay.tsx",
                    lineNumber: 7,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/ui/NoiseOverlay.tsx",
                lineNumber: 6,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$styled$2d$jsx$2f$style$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                id: "174bf48a61c39132",
                children: "@keyframes noise{0%,to{transform:translate(0)}10%{transform:translate(-5%,-5%)}20%{transform:translate(-10%,5%)}30%{transform:translate(5%,-10%)}40%{transform:translate(-5%,15%)}50%{transform:translate(-10%,5%)}60%{transform:translate(15%)}70%{transform:translateY(10%)}80%{transform:translate(-15%)}90%{transform:translate(10%,5%)}}.animate-noise{animation:.2s steps(10,end) infinite noise}"
            }, void 0, false, void 0, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true);
};
_c = NoiseOverlay;
var _c;
__turbopack_context__.k.register(_c, "NoiseOverlay");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/layout/SmoothScroll.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SmoothScroll",
    ()=>SmoothScroll,
    "useLenis",
    ()=>useLenis
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lenis$2f$dist$2f$lenis$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lenis/dist/lenis.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
// Tipar el contexto correctamente
const LenisContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
function useLenis() {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(LenisContext);
}
_s(useLenis, "gDsCjeeItUuvgOWf1v4qoK9RF6k=");
function SmoothScroll({ children }) {
    _s1();
    const [lenisInstance, setLenisInstance] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SmoothScroll.useEffect": ()=>{
            const lenis = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lenis$2f$dist$2f$lenis$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]({
                duration: 1.5,
                easing: {
                    "SmoothScroll.useEffect": (t)=>Math.min(1, 1.001 - Math.pow(2, -10 * t))
                }["SmoothScroll.useEffect"],
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: 1,
                touchMultiplier: 2
            });
            setLenisInstance(lenis);
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
            return ({
                "SmoothScroll.useEffect": ()=>{
                    lenis.destroy();
                    setLenisInstance(null);
                }
            })["SmoothScroll.useEffect"];
        }
    }["SmoothScroll.useEffect"], []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LenisContext.Provider, {
        value: lenisInstance,
        children: children
    }, void 0, false, {
        fileName: "[project]/src/components/layout/SmoothScroll.tsx",
        lineNumber: 48,
        columnNumber: 9
    }, this);
}
_s1(SmoothScroll, "gQvnU9scj9tDoe4VI/C2mTd4Luc=");
_c = SmoothScroll;
var _c;
__turbopack_context__.k.register(_c, "SmoothScroll");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/context/TransitionContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "TransitionProvider",
    ()=>TransitionProvider,
    "useTransitionContext",
    ()=>useTransitionContext
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$SmoothScroll$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/layout/SmoothScroll.tsx [app-client] (ecmascript)"); // Asegúrate que la ruta sea correcta
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
const TransitionContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function TransitionProvider({ children }) {
    _s();
    const [isAnimating, setIsAnimating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const isManualTransition = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false); // Flag to track if navigation was triggered by us
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const lenis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$SmoothScroll$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLenis"])();
    const executeScroll = (targetId)=>{
        const element = document.getElementById(targetId);
        if (element && lenis) {
            let offset = 0;
            if (targetId === 'servicios' || targetId === 'caracteristicas') {
                const windowHeight = window.innerHeight;
                const elementHeight = element.offsetHeight;
                offset = (elementHeight - windowHeight) / 2;
            }
            lenis.scrollTo(element, {
                offset: offset,
                immediate: true,
                force: true,
                lock: true // Ensure the user can't interrupt the scroll
            });
        } else if (element) {
            const shouldCenter = targetId === 'servicios' || targetId === 'caracteristicas';
            element.scrollIntoView({
                behavior: 'auto',
                block: shouldCenter ? 'center' : 'start'
            });
        }
    };
    const triggerScrollTo = (targetId)=>{
        setIsAnimating(true);
        if (lenis) lenis.stop();
        const safetyTimer = setTimeout(()=>{
            setIsAnimating(false);
            if (lenis) lenis.start();
        }, 2000);
        setTimeout(()=>{
            executeScroll(targetId);
            // Cleanup & Reveal
            setTimeout(()=>{
                setIsAnimating(false);
                if (lenis) lenis.start();
                clearTimeout(safetyTimer);
            }, 600);
        }, 500);
    };
    const triggerTransition = (target)=>{
        if (isAnimating) return;
        isManualTransition.current = true; // Mark as manual transition
        // SCENARIO 1: HASH NAVIGATION (e.g. "/#portfolio", "#portfolio")
        if (target.includes('#')) {
            const [path, hash] = target.split('#');
            // hash is "portfolio"
            // path is "/" or "/contact" or empty "" (if "#portfolio" passed)
            // 1. Check if we are already on the target path
            const isSamePath = path === '' || path === pathname || path === '/' && pathname === '/';
            if (isSamePath) {
                // Simple Scroll on current page
                triggerScrollTo(hash);
                return;
            }
            // 2. Different Page -> Navigate then (Next.js auto-scrolls to ID if it exists)
            setIsAnimating(true);
            setTimeout(()=>{
                router.push(target); // Navigate to full path with hash (e.g. "/#servicios") as fallback
                // Attempt to ENFORCE our custom scroll offset multiple times against browser default
                setTimeout(()=>executeScroll(hash), 10);
                setTimeout(()=>executeScroll(hash), 300);
                setTimeout(()=>executeScroll(hash), 600);
                setTimeout(()=>{
                    setIsAnimating(false);
                }, 800);
            }, 500);
            return;
        }
        // SCENARIO 2: ROUTE NAVIGATION (e.g. "/contact", "/web-development")
        if (target.startsWith('/')) {
            // If we are already on this page, do nothing (or simple scroll to top)
            if (pathname === target) return;
            setIsAnimating(true);
            // 1. Shutter Close
            setTimeout(()=>{
                router.push(target);
                // 2. Shutter Open (after delay)
                setTimeout(()=>{
                    setIsAnimating(false);
                }, 800);
            }, 500);
            return;
        }
        // Fallback or Legacy ID only passed
        triggerScrollTo(target);
    };
    // Listen for Browser Back/Forward Events
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TransitionProvider.useEffect": ()=>{
            // If it was a manual click, we already handled the animation. Reset flag.
            if (isManualTransition.current) {
                isManualTransition.current = false;
                return;
            }
        // Browser Back/Forward: Do nothing (Instant Transition)
        // This prevents the "jarring" effect of seeing the new page before the shutter closes.
        }
    }["TransitionProvider.useEffect"], [
        pathname
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TransitionContext.Provider, {
        value: {
            isAnimating,
            triggerTransition
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/src/context/TransitionContext.tsx",
        lineNumber: 140,
        columnNumber: 9
    }, this);
}
_s(TransitionProvider, "e9x08igsXhOrrb0oG5OorEuCtw0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$layout$2f$SmoothScroll$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLenis"]
    ];
});
_c = TransitionProvider;
function useTransitionContext() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(TransitionContext);
    if (context === undefined) {
        throw new Error('useTransitionContext must be used within a TransitionProvider');
    }
    return context;
}
_s1(useTransitionContext, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "TransitionProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/layout/DynamicDock.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DynamicDock",
    ()=>DynamicDock
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-motion-value.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-spring.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$transform$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-transform.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/house.js [app-client] (ecmascript) <export default as Home>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/briefcase.js [app-client] (ecmascript) <export default as Briefcase>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$terminal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Terminal$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/terminal.js [app-client] (ecmascript) <export default as Terminal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/layers.js [app-client] (ecmascript) <export default as Layers>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mail.js [app-client] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lightbulb$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lightbulb$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/lightbulb.js [app-client] (ecmascript) <export default as Lightbulb>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/menu.js [app-client] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$TransitionContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/TransitionContext.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
// --- Neuronal Components ---
const Axon = ({ direction, delay })=>{
    let rotation = '';
    let height = 60;
    if (direction === 'left-1') {
        rotation = '-rotate-[50deg]';
        height = 65;
    }
    if (direction === 'left-2') {
        rotation = '-rotate-[15deg]';
        height = 85;
    }
    if (direction === 'right-1') {
        rotation = 'rotate-[15deg]';
        height = 85;
    }
    if (direction === 'right-2') {
        rotation = 'rotate-[50deg]';
        height = 65;
    }
    const isCyan = direction.startsWith('left');
    const colorClass = isCyan ? 'via-cyan-400 shadow-[0_0_15px_cyan]' : 'via-fuchsia-400 shadow-[0_0_15px_fuchsia]';
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: {
            height: 0,
            opacity: 0
        },
        animate: {
            height,
            opacity: 1
        },
        exit: {
            height: 0,
            opacity: 0
        },
        transition: {
            duration: 0.3,
            delay,
            ease: "easeOut"
        },
        className: `absolute bottom-1/2 left-1/2 -translate-x-1/2 origin-bottom ${rotation} w-[2px] bg-gradient-to-t from-transparent ${colorClass} to-white -z-10`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]"
        }, void 0, false, {
            fileName: "[project]/src/components/layout/DynamicDock.tsx",
            lineNumber: 38,
            columnNumber: 13
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/layout/DynamicDock.tsx",
        lineNumber: 31,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_c = Axon;
const Synapse = ({ label, href, direction, delay })=>{
    _s();
    const { triggerTransition } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$TransitionContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransitionContext"])();
    let posClass = '';
    if (direction === 'left-1') posClass = 'bottom-[60px] right-[calc(50%+40px)]';
    if (direction === 'left-2') posClass = 'bottom-[100px] right-[calc(50%+10px)]';
    if (direction === 'right-1') posClass = 'bottom-[100px] left-[calc(50%+10px)]';
    if (direction === 'right-2') posClass = 'bottom-[60px] left-[calc(50%+40px)]';
    const isCyan = direction.startsWith('left');
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        initial: {
            opacity: 0,
            scale: 0
        },
        animate: {
            opacity: 1,
            scale: 1
        },
        exit: {
            opacity: 0,
            scale: 0
        },
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: delay + 0.2
        },
        className: `absolute ${posClass} z-50`,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
            href: href,
            onClick: (e)=>{
                e.preventDefault();
                e.stopPropagation();
                triggerTransition(href);
            },
            className: `whitespace-nowrap px-4 py-2 rounded-full bg-zinc-900/90 border border-white/10 backdrop-blur-xl shadow-xl flex items-center gap-2 group hover:bg-zinc-800 ${isCyan ? 'hover:border-cyan-500/50' : 'hover:border-fuchsia-500/50'} transition-colors`,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `w-2 h-2 rounded-full ${isCyan ? 'bg-cyan-400' : 'bg-fuchsia-400'} shadow-[0_0_10px_currentColor] group-hover:scale-125 transition-transform`
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/DynamicDock.tsx",
                    lineNumber: 71,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0)),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-[10px] font-semibold text-zinc-300 group-hover:text-white uppercase tracking-wider",
                    children: label
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/DynamicDock.tsx",
                    lineNumber: 72,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0))
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/layout/DynamicDock.tsx",
            lineNumber: 62,
            columnNumber: 13
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/components/layout/DynamicDock.tsx",
        lineNumber: 55,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s(Synapse, "eC2oPKWe1yPA/D4wLyr50cLn1N0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$TransitionContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransitionContext"]
    ];
});
_c1 = Synapse;
const DynamicDock = ()=>{
    _s1();
    const mouseX = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"])(Infinity);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    // Ensure menu closes securely on any route change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DynamicDock.useEffect": ()=>{
            setIsMobileMenuOpen(false);
        }
    }["DynamicDock.useEffect"], [
        pathname
    ]);
    const icons = [
        {
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$house$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Home$3e$__["Home"], {
                className: "w-full h-full"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                lineNumber: 90,
                columnNumber: 19
            }, ("TURBOPACK compile-time value", void 0)),
            href: "/#inicio",
            label: "Inicio"
        },
        {
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$terminal$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Terminal$3e$__["Terminal"], {
                className: "w-full h-full"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                lineNumber: 95,
                columnNumber: 19
            }, ("TURBOPACK compile-time value", void 0)),
            href: "/#nosotros",
            label: "Nosotros"
        },
        {
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$briefcase$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Briefcase$3e$__["Briefcase"], {
                className: "w-full h-full"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                lineNumber: 100,
                columnNumber: 19
            }, ("TURBOPACK compile-time value", void 0)),
            href: "/#portfolio",
            label: "Portfolio"
        },
        {
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$layers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Layers$3e$__["Layers"], {
                className: "w-full h-full"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                lineNumber: 105,
                columnNumber: 19
            }, ("TURBOPACK compile-time value", void 0)),
            href: "/#servicios",
            label: "Servicios"
        },
        {
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$lightbulb$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Lightbulb$3e$__["Lightbulb"], {
                className: "w-full h-full"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                lineNumber: 110,
                columnNumber: 19
            }, ("TURBOPACK compile-time value", void 0)),
            href: "/#caracteristicas",
            label: "Características"
        },
        {
            icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"], {
                className: "w-full h-full"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                lineNumber: 115,
                columnNumber: 19
            }, ("TURBOPACK compile-time value", void 0)),
            href: "/contact",
            label: "Contacto"
        }
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed bottom-8 left-1/2 -translate-x-1/2 z-[9990] pointer-events-auto hidden md:block",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    onMouseMove: (e)=>mouseX.set(e.pageX),
                    onMouseLeave: ()=>mouseX.set(Infinity),
                    className: "flex h-16 items-end gap-4 rounded-full border border-white/10 bg-zinc-950/20 px-4 pb-3 backdrop-blur-2xl shadow-2xl",
                    children: icons.map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(DockIcon, {
                            mouseX: mouseX,
                            ...item
                        }, i, false, {
                            fileName: "[project]/src/components/layout/DynamicDock.tsx",
                            lineNumber: 131,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0)))
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/DynamicDock.tsx",
                    lineNumber: 125,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                lineNumber: 124,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed bottom-6 left-6 z-[9990] pointer-events-auto md:hidden flex flex-col-reverse items-center gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setIsMobileMenuOpen(!isMobileMenuOpen),
                        className: "w-14 h-14 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-xl relative z-50 transition-colors active:bg-zinc-800",
                        children: isMobileMenuOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                            className: "text-white w-6 h-6"
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/DynamicDock.tsx",
                            lineNumber: 143,
                            columnNumber: 41
                        }, ("TURBOPACK compile-time value", void 0)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                            className: "text-white w-6 h-6"
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/DynamicDock.tsx",
                            lineNumber: 143,
                            columnNumber: 80
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/DynamicDock.tsx",
                        lineNumber: 139,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0)),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                        children: isMobileMenuOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            variants: {
                                hidden: {
                                    opacity: 0,
                                    scale: 0.9,
                                    y: 20,
                                    transformOrigin: 'bottom'
                                },
                                show: {
                                    opacity: 1,
                                    scale: 1,
                                    y: 0,
                                    transition: {
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 25,
                                        staggerChildren: 0.05,
                                        delayChildren: 0.1
                                    }
                                },
                                exit: {
                                    opacity: 0,
                                    scale: 0.9,
                                    y: -20,
                                    transition: {
                                        staggerChildren: 0.05,
                                        staggerDirection: -1
                                    }
                                }
                            },
                            initial: "hidden",
                            animate: "show",
                            exit: "exit",
                            className: "flex flex-col w-[72px] items-center gap-3 rounded-[36px] border border-white/10 bg-zinc-950/90 py-4 backdrop-blur-2xl shadow-2xl overflow-visible whitespace-nowrap",
                            children: icons.map((item, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                    variants: {
                                        hidden: {
                                            opacity: 0,
                                            y: 10,
                                            scale: 0.8
                                        },
                                        show: {
                                            opacity: 1,
                                            y: 0,
                                            scale: 1,
                                            transition: {
                                                type: "spring",
                                                stiffness: 300
                                            }
                                        },
                                        exit: {
                                            opacity: 0,
                                            scale: 0.8
                                        }
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MobileDockIcon, {
                                        icon: item.icon,
                                        href: item.href,
                                        label: item.label,
                                        onClick: ()=>setIsMobileMenuOpen(false)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                        lineNumber: 177,
                                        columnNumber: 37
                                    }, ("TURBOPACK compile-time value", void 0))
                                }, i, false, {
                                    fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                    lineNumber: 172,
                                    columnNumber: 33
                                }, ("TURBOPACK compile-time value", void 0)))
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/DynamicDock.tsx",
                            lineNumber: 149,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/DynamicDock.tsx",
                        lineNumber: 147,
                        columnNumber: 17
                    }, ("TURBOPACK compile-time value", void 0))
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                lineNumber: 137,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true);
};
_s1(DynamicDock, "EuryVN1kKdnCALx+FyQwJmt71Oc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c2 = DynamicDock;
function DockIcon({ mouseX, icon, href, label }) {
    _s2();
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [hovered, setHovered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const { triggerTransition } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$TransitionContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransitionContext"])();
    const distance = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$transform$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransform"])(mouseX, {
        "DockIcon.useTransform[distance]": (val)=>{
            const bounds = ref.current?.getBoundingClientRect() ?? {
                x: 0,
                width: 0
            };
            return val - bounds.x - bounds.width / 2;
        }
    }["DockIcon.useTransform[distance]"]);
    const widthSync = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$transform$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransform"])(distance, [
        -150,
        0,
        150
    ], [
        40,
        75,
        40
    ]);
    const width = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"])(widthSync, {
        mass: 0.1,
        stiffness: 150,
        damping: 15
    });
    const handleClick = (e)=>{
        e.preventDefault();
        triggerTransition(href);
    };
    const isServices = label === "Servicios";
    const [isServicesHovered, setIsServicesHovered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Handling hover for Services specially to keep menu open
    const handleMouseEnter = ()=>{
        setHovered(true);
        if (isServices) setIsServicesHovered(true);
    };
    const handleMouseLeave = ()=>{
        setHovered(false);
        if (isServices) setIsServicesHovered(false);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
        ref: ref,
        style: {
            width
        },
        className: `aspect-square flex items-center justify-center rounded-full bg-zinc-900/50 border border-white/5 text-zinc-400 relative transition-colors ${isServicesHovered ? 'bg-zinc-800 border-cyan-500/30 text-white shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'hover:text-white'}`,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: [
                    hovered && !isServicesHovered && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                        initial: {
                            opacity: 0,
                            y: 10
                        },
                        animate: {
                            opacity: 1,
                            y: -15
                        },
                        exit: {
                            opacity: 0,
                            y: 10
                        },
                        className: "absolute -top-8 left-1/2 -translate-x-1/2 rounded-md border border-white/10 bg-zinc-950/90 px-2 py-1 text-xs text-zinc-200 whitespace-nowrap pointer-events-none",
                        children: label
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/DynamicDock.tsx",
                        lineNumber: 252,
                        columnNumber: 21
                    }, this),
                    isServices && isServicesHovered && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                initial: {
                                    opacity: 0,
                                    y: -10
                                },
                                animate: {
                                    opacity: 1,
                                    y: 10
                                },
                                exit: {
                                    opacity: 0,
                                    y: -10
                                },
                                className: "absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-md border border-white/10 bg-zinc-950/90 px-2 py-1 text-xs text-zinc-200 whitespace-nowrap pointer-events-none z-50 shadow-[0_0_15px_rgba(0,0,0,0.5)]",
                                children: label
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                lineNumber: 266,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Axon, {
                                direction: "left-1",
                                delay: 0
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                lineNumber: 276,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Synapse, {
                                label: "Web Dev",
                                href: "/web-development",
                                direction: "left-1",
                                delay: 0.1
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                lineNumber: 277,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Axon, {
                                direction: "left-2",
                                delay: 0.1
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                lineNumber: 279,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Synapse, {
                                label: "Agentes IA",
                                href: "/ai-implementations",
                                direction: "left-2",
                                delay: 0.2
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                lineNumber: 280,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Axon, {
                                direction: "right-1",
                                delay: 0.2
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                lineNumber: 283,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Synapse, {
                                label: "Software",
                                href: "/software-development",
                                direction: "right-1",
                                delay: 0.3
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                lineNumber: 284,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Axon, {
                                direction: "right-2",
                                delay: 0.3
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                lineNumber: 286,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Synapse, {
                                label: "n8n",
                                href: "/process-automation",
                                direction: "right-2",
                                delay: 0.4
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                lineNumber: 287,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                lineNumber: 249,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: href,
                onClick: handleClick,
                className: "p-2 w-full h-full flex items-center justify-center z-10",
                children: icon
            }, void 0, false, {
                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                lineNumber: 292,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/DynamicDock.tsx",
        lineNumber: 242,
        columnNumber: 9
    }, this);
}
_s2(DockIcon, "fEcwaPKDrniMT4Jfa7Jb4KARx4M=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$TransitionContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransitionContext"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$transform$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransform"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$transform$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransform"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"]
    ];
});
_c3 = DockIcon;
// --- Mobile specific icon rendering without the physics width scaling ---
function MobileDockIcon({ icon, href, label, onClick }) {
    _s3();
    const { triggerTransition } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$TransitionContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransitionContext"])();
    const isServices = label === "Servicios";
    const handleClick = (e)=>{
        e.preventDefault();
        triggerTransition(href);
        setTimeout(()=>{
            onClick(); // gracefully close menu under the shutter
        }, 400);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative flex flex-col items-center justify-center gap-1 my-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                children: isServices && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                width: 0,
                                opacity: 0
                            },
                            animate: {
                                width: 30,
                                opacity: 1
                            },
                            exit: {
                                width: 0,
                                opacity: 0
                            },
                            transition: {
                                duration: 0.3,
                                ease: "easeOut",
                                delay: 0.1
                            },
                            className: "absolute top-[20px] left-[50px] h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-white shadow-[0_0_15px_cyan] origin-left -rotate-12 z-0 pointer-events-none",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-1/2 right-0 -translate-y-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]"
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                lineNumber: 337,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/DynamicDock.tsx",
                            lineNumber: 330,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                width: 0,
                                opacity: 0
                            },
                            animate: {
                                width: 30,
                                opacity: 1
                            },
                            exit: {
                                width: 0,
                                opacity: 0
                            },
                            transition: {
                                duration: 0.3,
                                ease: "easeOut",
                                delay: 0.2
                            },
                            className: "absolute top-[30px] left-[50px] h-[2px] bg-gradient-to-r from-transparent via-fuchsia-400 to-white shadow-[0_0_15px_fuchsia] origin-left rotate-12 z-0 pointer-events-none",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute top-1/2 right-0 -translate-y-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]"
                            }, void 0, false, {
                                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                lineNumber: 347,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/layout/DynamicDock.tsx",
                            lineNumber: 340,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                            initial: {
                                opacity: 0,
                                scale: 0.8,
                                x: -10,
                                transformOrigin: 'left center'
                            },
                            animate: {
                                opacity: 1,
                                scale: 1,
                                x: 0
                            },
                            exit: {
                                opacity: 0,
                                scale: 0.8,
                                x: -10
                            },
                            transition: {
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                                delay: 0.3
                            },
                            className: "absolute top-1/2 -translate-y-1/2 left-[75px] flex flex-col gap-2 z-50",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: (e)=>{
                                        e.preventDefault();
                                        e.stopPropagation();
                                        triggerTransition("/web-development");
                                        setTimeout(()=>onClick(), 400);
                                    },
                                    className: "whitespace-nowrap px-3 py-2 rounded-full bg-zinc-900/90 border border-white/10 backdrop-blur-xl shadow-xl flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_cyan]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                            lineNumber: 367,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-semibold text-zinc-300 uppercase tracking-wider",
                                            children: "Web Dev"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                            lineNumber: 368,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                    lineNumber: 358,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: (e)=>{
                                        e.preventDefault();
                                        e.stopPropagation();
                                        triggerTransition("/ai-implementations");
                                        setTimeout(()=>onClick(), 400);
                                    },
                                    className: "whitespace-nowrap px-3 py-2 rounded-full bg-zinc-900/90 border border-white/10 backdrop-blur-xl shadow-xl flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_cyan]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                            lineNumber: 380,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-semibold text-zinc-300 uppercase tracking-wider",
                                            children: "Agentes IA"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                            lineNumber: 381,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                    lineNumber: 371,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: (e)=>{
                                        e.preventDefault();
                                        e.stopPropagation();
                                        triggerTransition("/software-development");
                                        setTimeout(()=>onClick(), 400);
                                    },
                                    className: "whitespace-nowrap px-3 py-2 rounded-full bg-zinc-900/90 border border-white/10 backdrop-blur-xl shadow-xl flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_10px_fuchsia]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                            lineNumber: 393,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-semibold text-zinc-300 uppercase tracking-wider",
                                            children: "Software"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                            lineNumber: 394,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                    lineNumber: 384,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: (e)=>{
                                        e.preventDefault();
                                        e.stopPropagation();
                                        triggerTransition("/process-automation");
                                        setTimeout(()=>onClick(), 400);
                                    },
                                    className: "whitespace-nowrap px-3 py-2 rounded-full bg-zinc-900/90 border border-white/10 backdrop-blur-xl shadow-xl flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_10px_fuchsia]"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                            lineNumber: 406,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[10px] font-semibold text-zinc-300 uppercase tracking-wider",
                                            children: "n8n"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                            lineNumber: 407,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/layout/DynamicDock.tsx",
                                    lineNumber: 397,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/layout/DynamicDock.tsx",
                            lineNumber: 351,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true)
            }, void 0, false, {
                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                lineNumber: 325,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                href: href,
                onClick: handleClick,
                className: `flex items-center justify-center w-10 h-10 rounded-full border text-zinc-400 transition-colors z-10 ${isServices ? 'bg-zinc-800 border-cyan-500/30 text-white shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'bg-zinc-900/50 border-white/5 active:bg-zinc-800 active:text-white'}`,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-5 h-5 pointer-events-none",
                    children: icon
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/DynamicDock.tsx",
                    lineNumber: 419,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                lineNumber: 414,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "text-[9px] font-semibold text-zinc-400 uppercase tracking-wider",
                children: label
            }, void 0, false, {
                fileName: "[project]/src/components/layout/DynamicDock.tsx",
                lineNumber: 425,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/DynamicDock.tsx",
        lineNumber: 324,
        columnNumber: 9
    }, this);
}
_s3(MobileDockIcon, "eC2oPKWe1yPA/D4wLyr50cLn1N0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$TransitionContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransitionContext"]
    ];
});
_c4 = MobileDockIcon;
var _c, _c1, _c2, _c3, _c4;
__turbopack_context__.k.register(_c, "Axon");
__turbopack_context__.k.register(_c1, "Synapse");
__turbopack_context__.k.register(_c2, "DynamicDock");
__turbopack_context__.k.register(_c3, "DockIcon");
__turbopack_context__.k.register(_c4, "MobileDockIcon");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/Preloader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Preloader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-motion-value.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-spring.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$transform$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-transform.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function Preloader() {
    _s();
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // 1. Motion value for progress
    const progress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"])(0);
    // 2. Spring animation for smooth progress
    const smoothProgress = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"])(progress, {
        damping: 50,
        stiffness: 400,
        mass: 1
    });
    // 3. Transform spring value to visual properties
    const pathLength = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$transform$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransform"])(smoothProgress, [
        0,
        1
    ], [
        0,
        1
    ]); // Map 0-1
    const fillOpacity = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$transform$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransform"])(smoothProgress, [
        0.85,
        1
    ], [
        0,
        1
    ]); // Fade in fill near end
    const scale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$transform$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransform"])(smoothProgress, [
        0.95,
        1
    ], [
        1,
        1.1
    ]); // Subtle pulse at 100%
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Preloader.useEffect": ()=>{
            // Lock scroll
            document.body.style.overflow = "hidden";
            // Step 1: Wait for page hydration spike to settle (800ms)
            // This prevents the animation from stuttering during the heaviest CPU load
            const startTimer = setTimeout({
                "Preloader.useEffect.startTimer": ()=>{
                    progress.set(1);
                }
            }["Preloader.useEffect.startTimer"], 800);
            // Step 2: Exit Strategy
            // 800ms (Delay) + ~1500ms (Spring Settle) + 500ms (Buffer) = ~2800ms
            const exitTimer = setTimeout({
                "Preloader.useEffect.exitTimer": ()=>{
                    setIsLoading(false);
                    document.body.style.overflow = "auto";
                    window.scrollTo(0, 0);
                }
            }["Preloader.useEffect.exitTimer"], 3000); // Enforce minimum duration
            return ({
                "Preloader.useEffect": ()=>{
                    clearTimeout(startTimer);
                    clearTimeout(exitTimer);
                    document.body.style.overflow = "auto";
                }
            })["Preloader.useEffect"];
        }
    }["Preloader.useEffect"], [
        progress
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
        mode: "wait",
        children: isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            className: "fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950",
            initial: {
                opacity: 1
            },
            exit: {
                opacity: 0,
                transition: {
                    duration: 0.8,
                    ease: "easeInOut"
                }
            },
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].svg, {
                xmlns: "http://www.w3.org/2000/svg",
                viewBox: "0 0 1024 1024",
                className: "w-32 md:w-48 overflow-visible",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].path, {
                    d: "M532 700v-67q0-6 3-10l54-98q0-3 4-4l4 5q13 27 34 48 35 35 83 41a153 153 0 0 0 86-288c-62-28-134-13-178 39q-20 24-33 52l-57 127q-16 38-40 71-63 86-166 105-92 16-173-30A257 257 0 0 1 38 371a258 258 0 0 1 210-164 257 257 0 0 1 233 92q5 6 1 10l-52 93-1 1q-4 8-8 0l-7-13q-37-62-108-75-66-10-118 30-43 33-55 86-16 76 35 136 37 41 91 48 83 11 139-53 18-23 29-49l51-111q18-44 44-83a257 257 0 0 1 201-113q96-5 171 52a256 256 0 0 1 69 336 262 262 0 0 1-298 121q-8-4-7 6l-1 100 1 58q1 8-6 6H538q-7 1-6-7z",
                    fill: "#ffffff",
                    stroke: "#ffffff",
                    strokeWidth: "2",
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    initial: {
                        pathLength: 0,
                        fillOpacity: 0
                    },
                    animate: {
                        pathLength: 1,
                        fillOpacity: 1,
                        scale: [
                            1,
                            1,
                            1.1,
                            1
                        ]
                    },
                    transition: {
                        pathLength: {
                            duration: 1.5,
                            ease: "easeInOut"
                        },
                        fillOpacity: {
                            delay: 1.5,
                            duration: 0.5,
                            ease: "easeOut"
                        },
                        scale: {
                            delay: 2.0,
                            duration: 0.5,
                            ease: "easeInOut"
                        }
                    }
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/Preloader.tsx",
                    lineNumber: 64,
                    columnNumber: 25
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/ui/Preloader.tsx",
                lineNumber: 59,
                columnNumber: 21
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/ui/Preloader.tsx",
            lineNumber: 51,
            columnNumber: 17
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/Preloader.tsx",
        lineNumber: 49,
        columnNumber: 9
    }, this);
}
_s(Preloader, "zRLFUsFsi4un46v/bAI28ypVXBg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$transform$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransform"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$transform$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransform"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$transform$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransform"]
    ];
});
_c = Preloader;
var _c;
__turbopack_context__.k.register(_c, "Preloader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/modules/ai-companion/components/ChatWindow.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ChatWindow",
    ()=>ChatWindow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/reduced-motion/use-reduced-motion.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$markdown$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__Markdown__as__default$3e$__ = __turbopack_context__.i("[project]/node_modules/react-markdown/lib/index.js [app-client] (ecmascript) <export Markdown as default>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/sparkles.js [app-client] (ecmascript) <export default as Sparkles>");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
/** Safely extract text content from AI SDK messages (handles string, array, undefined) */ function getTextContent(message) {
    const content = message?.content;
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
        return content.filter((part)=>part?.type === 'text').map((part)=>part.text || '').join('');
    }
    return '';
}
function ChatWindow({ messages, input, handleInputChange, handleSubmit, isOpen, isThinking, onClose }) {
    _s();
    const messagesEndRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const inputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [showCursor, setShowCursor] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const prefersReducedMotion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    // Focus input when chat opens
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatWindow.useEffect": ()=>{
            if (isOpen) {
                setTimeout({
                    "ChatWindow.useEffect": ()=>inputRef.current?.focus()
                }["ChatWindow.useEffect"], 100);
            }
        }
    }["ChatWindow.useEffect"], [
        isOpen
    ]);
    const scrollToBottom = ()=>{
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth'
        });
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatWindow.useEffect": ()=>{
            scrollToBottom();
        }
    }["ChatWindow.useEffect"], [
        messages,
        isThinking
    ]);
    // Blinking cursor effect for AI responses
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatWindow.useEffect": ()=>{
            if (isThinking) {
                const interval = setInterval({
                    "ChatWindow.useEffect.interval": ()=>{
                        setShowCursor({
                            "ChatWindow.useEffect.interval": (prev)=>!prev
                        }["ChatWindow.useEffect.interval"]);
                    }
                }["ChatWindow.useEffect.interval"], 530);
                return ({
                    "ChatWindow.useEffect": ()=>clearInterval(interval)
                })["ChatWindow.useEffect"];
            } else {
                setShowCursor(false);
            }
        }
    }["ChatWindow.useEffect"], [
        isThinking
    ]);
    const handleFormSubmit = (e)=>{
        e.preventDefault();
        if (input.trim()) {
            handleSubmit(e);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
        children: isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0
                    },
                    animate: {
                        opacity: 1
                    },
                    exit: {
                        opacity: 0
                    },
                    onClick: onClose,
                    className: "fixed inset-0 bg-black/60 backdrop-blur-md z-[90]",
                    style: {
                        pointerEvents: 'auto'
                    },
                    "aria-hidden": "true"
                }, void 0, false, {
                    fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                    lineNumber: 87,
                    columnNumber: 21
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        scale: 0.96,
                        y: 20
                    },
                    animate: {
                        opacity: 1,
                        scale: 1,
                        y: 0
                    },
                    exit: {
                        opacity: 0,
                        scale: 0.98,
                        y: 10
                    },
                    transition: {
                        duration: 0.5,
                        ease: [
                            0.16,
                            1,
                            0.3,
                            1
                        ]
                    },
                    className: "fixed bottom-28 right-32 z-[100] flex flex-col",
                    style: {
                        pointerEvents: 'auto',
                        background: 'rgba(6, 8, 18, 0.85)',
                        backdropFilter: 'blur(32px)',
                        WebkitBackdropFilter: 'blur(32px)',
                        border: '1px solid rgba(255,255,255,0.09)',
                        boxShadow: `
                                0 0 0 1px rgba(255,255,255,0.04),
                                0 32px 80px rgba(0,0,0,0.7),
                                0 0 120px rgba(68,100,255,0.08),
                                inset 0 1px 0 rgba(255,255,255,0.08),
                                inset 0 -1px 0 rgba(0,0,0,0.4)
                            `,
                        borderRadius: '24px',
                        overflow: 'hidden',
                        width: 'clamp(320px, 90vw, 420px)',
                        maxHeight: '72vh'
                    },
                    role: "dialog",
                    "aria-label": "Consultor DevelOP",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                padding: '14px 18px',
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                                background: 'rgba(255,255,255,0.02)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                position: 'relative'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        position: 'absolute',
                                        top: 0,
                                        left: '15%',
                                        right: '15%',
                                        height: '1px',
                                        background: `linear-gradient(90deg,
                                    transparent,
                                    rgba(80,120,255,0.6) 30%,
                                    rgba(120,80,255,0.6) 70%,
                                    transparent)`
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                    lineNumber: 136,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        width: '32px',
                                        height: '32px',
                                        borderRadius: '50%',
                                        background: 'linear-gradient(135deg, rgba(60,100,255,0.3), rgba(120,60,255,0.3))',
                                        border: '1px solid rgba(100,150,255,0.25)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: '10px',
                                            height: '10px',
                                            borderRadius: '50%',
                                            background: 'radial-gradient(circle, rgba(100,160,255,1) 0%, rgba(80,100,255,0.4) 70%, transparent 100%)',
                                            boxShadow: '0 0 8px rgba(80,140,255,0.8)'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                        lineNumber: 158,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                    lineNumber: 148,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        flex: 1
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: '13px',
                                                fontWeight: 600,
                                                color: 'rgba(255,255,255,0.85)',
                                                margin: 0,
                                                letterSpacing: '0.01em',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                                            },
                                            children: "Consultor DevelOP"
                                        }, void 0, false, {
                                            fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                            lineNumber: 168,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: '11px',
                                                color: isThinking ? 'rgba(120,160,255,0.7)' : 'rgba(80,220,130,0.6)',
                                                margin: 0,
                                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                                            },
                                            children: isThinking ? 'Analizando tu consulta...' : '● Disponible ahora'
                                        }, void 0, false, {
                                            fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                            lineNumber: 178,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                    lineNumber: 167,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: onClose,
                                    style: {
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.08)',
                                        color: 'rgba(255,255,255,0.35)',
                                        fontSize: '14px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 200ms'
                                    },
                                    children: "×"
                                }, void 0, false, {
                                    fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                    lineNumber: 189,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                            lineNumber: 126,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 min-h-0 overflow-y-auto p-6 space-y-6 chat-messages-area",
                            "data-lenis-prevent": true,
                            onWheel: (e)=>e.stopPropagation(),
                            style: {
                                overscrollBehavior: 'contain',
                                WebkitOverflowScrolling: 'touch',
                                scrollbarWidth: 'thin',
                                scrollbarColor: 'rgba(255,255,255,0.1) transparent'
                            },
                            role: "log",
                            "aria-live": "polite",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                                    initial: false,
                                    children: [
                                        messages.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/5 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.1)]",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$sparkles$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Sparkles$3e$__["Sparkles"], {
                                                        className: "w-6 h-6 text-cyan-400/80"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                        lineNumber: 226,
                                                        columnNumber: 45
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                    lineNumber: 225,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            style: {
                                                                fontSize: '11px',
                                                                color: 'rgba(255,255,255,0.3)',
                                                                fontFamily: 'monospace',
                                                                letterSpacing: '0.08em',
                                                                textTransform: 'uppercase',
                                                                marginBottom: '4px'
                                                            },
                                                            children: "Sistema Listo"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                            lineNumber: 229,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            style: {
                                                                fontSize: '12px',
                                                                color: 'rgba(255,255,255,0.5)',
                                                                maxWidth: '240px',
                                                                lineHeight: 1.55,
                                                                margin: '0 auto',
                                                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                                                            },
                                                            children: "Protocolo de consultoría iniciado. ¿Cómo puedo asistirle hoy?"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                            lineNumber: 239,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                    lineNumber: 228,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                            lineNumber: 224,
                                            columnNumber: 37
                                        }, this) : messages.map((m, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                initial: {
                                                    opacity: 0,
                                                    y: 15,
                                                    scale: 0.98
                                                },
                                                animate: {
                                                    opacity: 1,
                                                    y: 0,
                                                    scale: 1
                                                },
                                                transition: {
                                                    duration: 0.4,
                                                    ease: [
                                                        0.16,
                                                        1,
                                                        0.3,
                                                        1
                                                    ]
                                                },
                                                className: `flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        maxWidth: '85%',
                                                        padding: '10px 14px',
                                                        fontSize: '13px',
                                                        lineHeight: 1.65,
                                                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                                        ...m.role === 'user' ? {
                                                            background: 'linear-gradient(135deg, rgba(60,90,255,0.18), rgba(100,60,255,0.12))',
                                                            border: '1px solid rgba(80,100,255,0.25)',
                                                            borderRadius: '16px 4px 16px 16px',
                                                            color: 'rgba(255,255,255,0.88)'
                                                        } : {
                                                            background: 'rgba(255,255,255,0.04)',
                                                            border: '1px solid rgba(255,255,255,0.07)',
                                                            borderRadius: '4px 16px 16px 16px',
                                                            color: 'rgba(255,255,255,0.82)'
                                                        }
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "prose prose-invert prose-sm max-w-none",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$markdown$2f$lib$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__Markdown__as__default$3e$__["default"], {
                                                                    components: {
                                                                        p: ({ children })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                style: {
                                                                                    margin: 0
                                                                                },
                                                                                children: children
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                                                lineNumber: 281,
                                                                                columnNumber: 82
                                                                            }, void 0),
                                                                        code: ({ children })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                                                style: {
                                                                                    background: 'rgba(255,255,255,0.08)',
                                                                                    color: '#4488ff',
                                                                                    padding: '2px 4px',
                                                                                    borderRadius: '4px',
                                                                                    fontSize: '11px',
                                                                                    fontFamily: 'monospace'
                                                                                },
                                                                                children: children
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                                                lineNumber: 283,
                                                                                columnNumber: 65
                                                                            }, void 0),
                                                                        strong: ({ children })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                                style: {
                                                                                    color: '#fff',
                                                                                    fontWeight: 600
                                                                                },
                                                                                children: children
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                                                lineNumber: 295,
                                                                                columnNumber: 65
                                                                            }, void 0)
                                                                    },
                                                                    children: getTextContent(m).replace(/\[(?:ACTION:\s*SHOW_CONTACT|SHOW_CONNECT_FORM|CONNECT_WHATSAPP|NAVIGATE:\s*[^\]]*)\]/g, '').replace(/\[(?:ACTION:\s*SHOW_CONTACT|SHOW_CONNECT(?:_FORM?)?|CONNECT(?:_WHATSAPP?)?|NAVIGATE:?[^\]]*)$/g, '').trim()
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                                    lineNumber: 279,
                                                                    columnNumber: 53
                                                                }, this),
                                                                m.role === 'assistant' && idx === messages.length - 1 && isThinking && showCursor && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    style: {
                                                                        display: 'inline-block',
                                                                        width: '6px',
                                                                        height: '14px',
                                                                        background: '#4488ff',
                                                                        marginLeft: '4px',
                                                                        verticalAlign: 'middle',
                                                                        opacity: 0.8
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                                    lineNumber: 305,
                                                                    columnNumber: 57
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                            lineNumber: 278,
                                                            columnNumber: 49
                                                        }, this),
                                                        m.role === 'assistant' && getTextContent(m).includes('[ACTION: SHOW_CONTACT]') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                            initial: {
                                                                opacity: 0,
                                                                y: 12,
                                                                scale: 0.96
                                                            },
                                                            animate: {
                                                                opacity: 1,
                                                                y: 0,
                                                                scale: 1
                                                            },
                                                            transition: {
                                                                duration: 0.5,
                                                                ease: [
                                                                    0.16,
                                                                    1,
                                                                    0.3,
                                                                    1
                                                                ]
                                                            },
                                                            style: {
                                                                background: 'linear-gradient(135deg, rgba(40,60,120,0.4), rgba(60,30,100,0.3))',
                                                                border: '1px solid rgba(100,140,255,0.2)',
                                                                borderRadius: '16px',
                                                                padding: '16px',
                                                                margin: '12px 0 4px',
                                                                position: 'relative',
                                                                overflow: 'hidden'
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    style: {
                                                                        position: 'absolute',
                                                                        top: 0,
                                                                        left: '10%',
                                                                        right: '10%',
                                                                        height: '1px',
                                                                        background: 'linear-gradient(90deg, transparent, rgba(100,160,255,0.7) 40%, rgba(150,100,255,0.7) 60%, transparent)'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                                    lineNumber: 334,
                                                                    columnNumber: 57
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    style: {
                                                                        fontSize: '11px',
                                                                        letterSpacing: '0.18em',
                                                                        color: 'rgba(100,160,255,0.6)',
                                                                        fontWeight: 600,
                                                                        margin: '0 0 10px',
                                                                        fontFamily: 'monospace'
                                                                    },
                                                                    children: "SIGUIENTE PASO"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                                    lineNumber: 341,
                                                                    columnNumber: 57
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    style: {
                                                                        fontSize: '13px',
                                                                        color: 'rgba(255,255,255,0.8)',
                                                                        margin: '0 0 14px',
                                                                        lineHeight: 1.5
                                                                    },
                                                                    children: "Hablemos en detalle sobre tu proyecto."
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                                    lineNumber: 352,
                                                                    columnNumber: 57
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].a, {
                                                                    href: `https://wa.me/${("TURBOPACK compile-time value", "5493816223508") || '543815674738'}?text=Hola%20DevelOP,%20habl%C3%A9%20con%20Logic%20Core%20y%20me%20interesa%20iniciar%20un%20proyecto...`,
                                                                    target: "_blank",
                                                                    rel: "noopener noreferrer",
                                                                    whileHover: {
                                                                        scale: 1.03
                                                                    },
                                                                    whileTap: {
                                                                        scale: 0.97
                                                                    },
                                                                    style: {
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: '8px',
                                                                        background: 'rgba(37,211,102,0.15)',
                                                                        border: '1px solid rgba(37,211,102,0.3)',
                                                                        borderRadius: '100px',
                                                                        padding: '8px 16px',
                                                                        textDecoration: 'none',
                                                                        color: 'rgba(37,211,102,0.9)',
                                                                        fontSize: '12px',
                                                                        fontWeight: 600
                                                                    },
                                                                    children: "💬 Escribir por WhatsApp"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                                    lineNumber: 361,
                                                                    columnNumber: 57
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                            lineNumber: 319,
                                                            columnNumber: 53
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                    lineNumber: 260,
                                                    columnNumber: 45
                                                }, this)
                                            }, m.id, false, {
                                                fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                lineNumber: 253,
                                                columnNumber: 41
                                            }, this)),
                                        isThinking && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                            initial: {
                                                opacity: 0,
                                                y: 8
                                            },
                                            animate: {
                                                opacity: 1,
                                                y: 0
                                            },
                                            exit: {
                                                opacity: 0
                                            },
                                            style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                padding: '10px 14px'
                                            },
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    style: {
                                                        width: '120px',
                                                        height: '2px',
                                                        background: 'rgba(255,255,255,0.06)',
                                                        borderRadius: '100px',
                                                        overflow: 'hidden',
                                                        position: 'relative'
                                                    },
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                                                        animate: {
                                                            x: [
                                                                '-100%',
                                                                '200%'
                                                            ]
                                                        },
                                                        transition: {
                                                            duration: 1.4,
                                                            ease: 'easeInOut',
                                                            repeat: Infinity
                                                        },
                                                        style: {
                                                            position: 'absolute',
                                                            top: 0,
                                                            bottom: 0,
                                                            width: '40%',
                                                            background: 'linear-gradient(90deg, transparent, rgba(80,140,255,0.8), transparent)',
                                                            borderRadius: '100px'
                                                        }
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                        lineNumber: 406,
                                                        columnNumber: 45
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                    lineNumber: 398,
                                                    columnNumber: 41
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    style: {
                                                        fontSize: '11px',
                                                        color: 'rgba(255,255,255,0.3)',
                                                        fontFamily: 'monospace',
                                                        letterSpacing: '0.08em'
                                                    },
                                                    children: "Procesando"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                    lineNumber: 418,
                                                    columnNumber: 41
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                            lineNumber: 392,
                                            columnNumber: 37
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                    lineNumber: 222,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    ref: messagesEndRef,
                                    className: "h-1"
                                }, void 0, false, {
                                    fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                    lineNumber: 429,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                            lineNumber: 210,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleFormSubmit,
                            style: {
                                padding: '12px 14px',
                                borderTop: '1px solid rgba(255,255,255,0.06)',
                                background: 'rgba(255,255,255,0.015)',
                                display: 'flex',
                                gap: '8px',
                                alignItems: 'flex-end'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        flex: 1,
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.09)',
                                        borderRadius: '14px',
                                        padding: '10px 14px',
                                        position: 'relative',
                                        transition: 'all 200ms'
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                        ref: inputRef,
                                        value: input,
                                        onChange: (e)=>{
                                            handleInputChange(e);
                                            e.currentTarget.style.height = 'auto';
                                            e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                                        },
                                        onInput: (e)=>{
                                            e.currentTarget.style.height = 'auto';
                                            e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px';
                                        },
                                        placeholder: "Escribí tu consulta...",
                                        disabled: isThinking,
                                        rows: 1,
                                        style: {
                                            background: 'transparent',
                                            border: 'none',
                                            outline: 'none',
                                            color: 'rgba(255,255,255,0.85)',
                                            fontSize: '13px',
                                            width: '100%',
                                            resize: 'none',
                                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                                            lineHeight: 1.55,
                                            minHeight: '20px',
                                            maxHeight: '80px',
                                            overflow: 'auto'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                        lineNumber: 453,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                    lineNumber: 444,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].button, {
                                    type: "submit",
                                    whileHover: {
                                        scale: 1.08
                                    },
                                    whileTap: {
                                        scale: 0.94
                                    },
                                    transition: {
                                        type: 'spring',
                                        stiffness: 400,
                                        damping: 15
                                    },
                                    disabled: isThinking || !input.trim(),
                                    style: {
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        border: 'none',
                                        cursor: isThinking || !input.trim() ? 'not-allowed' : 'pointer',
                                        background: isThinking || !input.trim() ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, rgba(60,100,255,0.8), rgba(100,60,255,0.8))',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                        boxShadow: isThinking || !input.trim() ? 'none' : '0 0 16px rgba(80,100,255,0.3)',
                                        transition: 'all 200ms'
                                    },
                                    "aria-label": "Send message",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                        width: "14",
                                        height: "14",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "white",
                                        strokeWidth: "2.5",
                                        strokeLinecap: "round",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                x1: "22",
                                                y1: "2",
                                                x2: "11",
                                                y2: "13"
                                            }, void 0, false, {
                                                fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                lineNumber: 510,
                                                columnNumber: 37
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polygon", {
                                                points: "22 2 15 22 11 13 2 9 22 2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                                lineNumber: 511,
                                                columnNumber: 37
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                        lineNumber: 509,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                                    lineNumber: 486,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                            lineNumber: 433,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
                    lineNumber: 98,
                    columnNumber: 21
                }, this)
            ]
        }, void 0, true)
    }, void 0, false, {
        fileName: "[project]/src/modules/ai-companion/components/ChatWindow.tsx",
        lineNumber: 83,
        columnNumber: 9
    }, this);
}
_s(ChatWindow, "AGDPl1qDMBKUsTAnCqw6QNsB+Ws=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useReducedMotion"]
    ];
});
_c = ChatWindow;
var _c;
__turbopack_context__.k.register(_c, "ChatWindow");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/modules/ai-companion/components/NeuroAvatar.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NeuroAvatar",
    ()=>NeuroAvatar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/react-three-fiber.esm.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-5a94e5eb.esm.js [app-client] (ecmascript) <export D as useFrame>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__e__as__extend$3e$__ = __turbopack_context__.i("[project]/node_modules/@react-three/fiber/dist/events-5a94e5eb.esm.js [app-client] (ecmascript) <export e as extend>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Float$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Float.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Environment$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/Environment.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$MeshTransmissionMaterial$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/MeshTransmissionMaterial.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$shaderMaterial$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/drei/core/shaderMaterial.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/utils/reduced-motion/use-reduced-motion.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/three/build/three.core.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$postprocessing$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-three/postprocessing/dist/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postprocessing$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/postprocessing/build/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
// ─────────────────────────────────────────────────────────
// Error Boundary to prevent R3F crashes from taking down UI
// ─────────────────────────────────────────────────────────
class AvatarErrorBoundary extends __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Component"] {
    constructor(props){
        super(props);
        this.state = {
            hasError: false
        };
    }
    static getDerivedStateFromError() {
        return {
            hasError: true
        };
    }
    componentDidCatch(error, errorInfo) {
        console.error("NeuroAvatar R3F Error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) return this.props.fallback;
        return this.props.children;
    }
}
// ─────────────────────────────────────────────────────────
// Custom Energy Field Shader Material
// ─────────────────────────────────────────────────────────
const EnergyFieldMaterial = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$shaderMaterial$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["shaderMaterial"])({
    uTime: 0,
    uIntensity: 0.3,
    uColor: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"](0x4488ff),
    uColorSecondary: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"](0x8844ff)
}, `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    void main() {
        vNormal = normalize(normalMatrix * normal);
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
    }
    `, `
    uniform float uTime;
    uniform float uIntensity;
    uniform vec3 uColor;
    uniform vec3 uColorSecondary;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    float noise(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }
    void main() {
        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(1.0 - dot(vNormal, viewDir), 3.0);
        float n = noise(vUv * 8.0 + uTime * 0.3);
        vec3 color = mix(uColor, uColorSecondary, fresnel + n * 0.2);
        float alpha = fresnel * uIntensity * (0.8 + n * 0.4);
        gl_FragColor = vec4(color, alpha);
    }
    `);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__e__as__extend$3e$__["extend"])({
    EnergyFieldMaterial
});
const COLOR_IDLE = {
    emissive: 0x4488cc,
    pointLight: 0x6699dd,
    intensity: 4
};
const COLOR_THINKING = {
    emissive: 0x6644ff,
    pointLight: 0x8866ff,
    intensity: 8
};
const COLOR_OPEN = {
    emissive: 0x0099cc,
    pointLight: 0x00bbdd,
    intensity: 6
};
const COLOR_ROI = 0x44aa66;
const PARTICLE_COUNT = 120;
function generateOrbitalPositions(count, radius) {
    const positions = new Float32Array(count * 3);
    for(let i = 0; i < count; i++){
        const phi = Math.acos(1 - 2 * i / count);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = radius * Math.cos(phi);
    }
    return positions;
}
// ─────────────────────────────────────────────────────────
// Internal Scene Component (Inside Canvas)
// ─────────────────────────────────────────────────────────
function AvatarSceneContent({ isThinking = false, showPrompt = false, isBooped = false, isHovered = false, isOpen = false, phase = 'active', scrollSection, prefersReducedMotion = false }) {
    _s();
    // ── Scene Refs ──
    const avatarGroupRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const keyLightRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const bloomRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const chromRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const energyFieldRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const particlesRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const outerSphereRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const innerCoreRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const ringRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // ── Memoized Geometries ──
    const geometries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AvatarSceneContent.useMemo[geometries]": ()=>({
                outer: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SphereGeometry"](1, 64, 64),
                inner: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["IcosahedronGeometry"](1, 4),
                ring: new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TorusGeometry"](1.2, 0.015, 8, 120),
                particles: generateOrbitalPositions(PARTICLE_COUNT, 1.4)
            })
    }["AvatarSceneContent.useMemo[geometries]"], []);
    // ── Animation Values ──
    const currentEmissive = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AvatarSceneContent.useMemo[currentEmissive]": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"](COLOR_IDLE.emissive)
    }["AvatarSceneContent.useMemo[currentEmissive]"], []);
    const roiColor = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "AvatarSceneContent.useMemo[roiColor]": ()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"](COLOR_ROI)
    }["AvatarSceneContent.useMemo[roiColor]"], []);
    const scaleRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(phase === 'active' ? 1 : 0);
    const opacityRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(phase === 'active' ? 1 : 0);
    const distortionRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(phase === 'active' ? 0.1 : 0.8);
    const bloomPulseRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const boopBurstRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const audioPlayedRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const bloomIntensityRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0.6);
    const chromaticOffsetRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0.0008);
    const thinkingIntensityRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const rotationRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        tx: 0,
        ty: 0,
        cx: 0,
        cy: 0
    });
    const [isMobile, setIsMobile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AvatarSceneContent.useEffect": ()=>{
            const checkMobile = {
                "AvatarSceneContent.useEffect.checkMobile": ()=>setIsMobile(window.innerWidth < 768)
            }["AvatarSceneContent.useEffect.checkMobile"];
            checkMobile();
            window.addEventListener('resize', checkMobile);
            return ({
                "AvatarSceneContent.useEffect": ()=>window.removeEventListener('resize', checkMobile)
            })["AvatarSceneContent.useEffect"];
        }
    }["AvatarSceneContent.useEffect"], []);
    const boopState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])({
        vx: 0,
        vy: 0,
        px: 0,
        py: 0
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AvatarSceneContent.useEffect": ()=>{
            if (!isBooped || prefersReducedMotion) return;
            boopState.current.vx = (Math.random() - 0.5) * 0.3;
            boopState.current.vy = 0.2;
            bloomPulseRef.current = 2.5;
            boopBurstRef.current = 0.8;
        }
    }["AvatarSceneContent.useEffect"], [
        isBooped,
        prefersReducedMotion
    ]);
    const hasOpenedOnce = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const celebrationOffsetRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AvatarSceneContent.useEffect": ()=>{
            if (!isOpen || hasOpenedOnce.current) return;
            hasOpenedOnce.current = true;
            celebrationOffsetRef.current = 1.0;
            const timer = setTimeout({
                "AvatarSceneContent.useEffect.timer": ()=>{
                    celebrationOffsetRef.current = 0;
                }
            }["AvatarSceneContent.useEffect.timer"], 800);
            return ({
                "AvatarSceneContent.useEffect": ()=>clearTimeout(timer)
            })["AvatarSceneContent.useEffect"];
        }
    }["AvatarSceneContent.useEffect"], [
        isOpen
    ]);
    // ── Unified Frame Loop ──
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"])({
        "AvatarSceneContent.useFrame": (state, delta)=>{
            try {
                const t = state.clock.getElapsedTime();
                // 1. Physics (Boop)
                if (!prefersReducedMotion) {
                    const b = boopState.current;
                    b.vx += (0 - b.px) * 0.08;
                    b.vy += (0 - b.py) * 0.08;
                    b.vx *= 0.88;
                    b.vy *= 0.88;
                    b.px += b.vx;
                    b.py += b.vy;
                    if (avatarGroupRef.current) {
                        avatarGroupRef.current.position.x = b.px;
                        avatarGroupRef.current.position.y = b.py;
                    }
                    boopBurstRef.current = Math.max(0, boopBurstRef.current - delta * 2);
                }
                // 2. Lifecycle Phases
                if (phase === 'dormant') {
                    scaleRef.current = 0;
                    opacityRef.current = 0;
                } else if (phase === 'initializing') {
                    scaleRef.current += (1 - scaleRef.current) * 0.025;
                    opacityRef.current += (1 - opacityRef.current) * 0.02;
                    distortionRef.current = 0.8;
                } else if (phase === 'stabilizing') {
                    distortionRef.current += (0.1 - distortionRef.current) * 0.08;
                    bloomPulseRef.current = Math.max(0, bloomPulseRef.current - 0.04);
                    if (!audioPlayedRef.current) {
                        playActivationTone();
                        audioPlayedRef.current = true;
                        bloomPulseRef.current = 2.0;
                    }
                } else {
                    scaleRef.current = 1;
                    opacityRef.current = 1;
                    distortionRef.current = isThinking ? 0.4 : 0.1;
                }
                // 3. Gaze & Rotation
                const r = rotationRef.current;
                if (showPrompt) {
                    r.ty = -0.3;
                    r.tx = 0.2;
                } else if (isOpen) {
                    r.ty = -0.5;
                    r.tx = 0.1;
                } else {
                    r.ty = state.pointer.x * 0.3;
                    r.tx = -state.pointer.y * 0.2;
                }
                r.cy += (r.ty - r.cy) * 0.025;
                r.cx += (r.tx - r.cx) * 0.025;
                if (avatarGroupRef.current) {
                    avatarGroupRef.current.rotation.y = r.cy;
                    avatarGroupRef.current.rotation.x = r.cx;
                }
                // 4. Element Animations
                if (ringRef.current) {
                    const ringSpeed = scrollSection === 'vault' ? 0.2 : 1.2;
                    ringRef.current.rotation.z += delta * ringSpeed;
                }
                if (energyFieldRef.current) {
                    energyFieldRef.current.uniforms.uTime.value = t;
                    let targetInt = isThinking ? 0.8 : isHovered ? 0.6 : 0.25;
                    if (scrollSection === 'comparador') targetInt += 0.2;
                    energyFieldRef.current.uniforms.uIntensity.value += (targetInt - energyFieldRef.current.uniforms.uIntensity.value) * 0.03;
                }
                thinkingIntensityRef.current += ((isThinking ? 1 : 0) - thinkingIntensityRef.current) * 0.03;
                if (outerSphereRef.current) {
                    outerSphereRef.current.rotation.y = t * -0.05;
                    const breathe = scaleRef.current * (1 + Math.sin(t * 0.8) * 0.02 + thinkingIntensityRef.current * 0.08);
                    outerSphereRef.current.scale.setScalar(breathe);
                }
                if (innerCoreRef.current) {
                    let rotSpeedY = isThinking ? 0.3 : 0.08;
                    if (scrollSection === 'vault') rotSpeedY *= 0.2;
                    innerCoreRef.current.rotation.y = t * rotSpeedY;
                    const coreS = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].lerp(innerCoreRef.current.scale.x, isThinking ? 0.55 : 0.45, 0.05) * scaleRef.current;
                    innerCoreRef.current.scale.setScalar(coreS);
                }
                if (particlesRef.current) {
                    let pSpeed = isThinking ? 2.5 : isHovered ? 1.5 : 1.0;
                    if (scrollSection === 'vault') pSpeed *= 0.2;
                    particlesRef.current.rotation.y = t * 0.15 * pSpeed;
                    const celeb = celebrationOffsetRef.current > 0 ? 1 + Math.sin(t * 15) * 0.1 : 1;
                    const disp = boopBurstRef.current;
                    particlesRef.current.scale.setScalar(scaleRef.current * celeb + disp);
                }
                // 5. Lights & Colors
                const targetSet = isThinking ? COLOR_THINKING : isOpen ? COLOR_OPEN : COLOR_IDLE;
                const targetE = scrollSection === 'calculador' ? roiColor : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"](targetSet.emissive);
                currentEmissive.lerp(targetE, 0.025);
                if (keyLightRef.current) {
                    const targetP = scrollSection === 'calculador' ? roiColor : new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Color"](targetSet.pointLight);
                    keyLightRef.current.color.lerp(targetP, 0.05);
                    keyLightRef.current.intensity = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MathUtils"].lerp(keyLightRef.current.intensity, targetSet.intensity, 0.05);
                }
                // 6. Post-processing updates
                const bTarget = isThinking ? 1.8 : isHovered ? 1.2 : 0.6;
                const bBase = scrollSection === 'comparador' ? bTarget + 0.3 : bTarget;
                bloomIntensityRef.current += (bBase - bloomIntensityRef.current) * 0.04;
                if (bloomRef.current) {
                    bloomRef.current.intensity = (isMobile ? bloomIntensityRef.current * 0.5 : bloomIntensityRef.current) + bloomPulseRef.current;
                }
                const cTarget = isThinking ? 0.03 : isHovered ? 0.015 : 0.0008;
                chromaticOffsetRef.current += (cTarget - chromaticOffsetRef.current) * 0.04;
                if (chromRef.current && !isMobile && chromRef.current.offset) {
                    try {
                        if (typeof chromRef.current.offset.set === 'function') {
                            chromRef.current.offset.set(chromaticOffsetRef.current, chromaticOffsetRef.current);
                        } else if (chromRef.current.offset.x !== undefined) {
                            chromRef.current.offset.x = chromaticOffsetRef.current;
                            chromRef.current.offset.y = chromaticOffsetRef.current;
                        }
                    } catch  {}
                }
            } catch (e) {
                // Silently catch frame errors to prevent crash loop, but log once
                if (window.__v_errorCount === undefined) window.__v_errorCount = 0;
                if (window.__v_errorCount < 3) {
                    console.error("Frame Error:", e);
                    window.__v_errorCount++;
                }
            }
        }
    }["AvatarSceneContent.useFrame"]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ambientLight", {
                intensity: 0.5
            }, void 0, false, {
                fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                lineNumber: 330,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pointLight", {
                ref: keyLightRef,
                position: [
                    2,
                    3,
                    2
                ],
                intensity: 4,
                color: COLOR_IDLE.pointLight,
                distance: 10,
                decay: 2
            }, void 0, false, {
                fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                lineNumber: 331,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pointLight", {
                position: [
                    -2,
                    -1,
                    -2
                ],
                intensity: 2,
                color: "#1a1a3a",
                distance: 8,
                decay: 2
            }, void 0, false, {
                fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                lineNumber: 332,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pointLight", {
                position: [
                    0,
                    -2,
                    -3
                ],
                intensity: 3,
                color: "#c8d8f0",
                distance: 6,
                decay: 2
            }, void 0, false, {
                fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                lineNumber: 333,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Environment$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Environment"], {
                preset: "studio"
            }, void 0, false, {
                fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                lineNumber: 334,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$Float$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Float"], {
                speed: 2,
                rotationIntensity: 0.2,
                floatIntensity: 0.5,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                    ref: avatarGroupRef,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("group", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                scale: 1.15,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("sphereGeometry", {
                                        args: [
                                            1,
                                            32,
                                            32
                                        ]
                                    }, void 0, false, {
                                        fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                                        lineNumber: 341,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("energyFieldMaterial", {
                                        ref: energyFieldRef,
                                        transparent: true,
                                        depthWrite: false,
                                        blending: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdditiveBlending"],
                                        side: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BackSide"]
                                    }, void 0, false, {
                                        fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                                        lineNumber: 342,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                                lineNumber: 340,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                ref: outerSphereRef,
                                geometry: geometries.outer,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$drei$2f$core$2f$MeshTransmissionMaterial$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MeshTransmissionMaterial"], {
                                    transmission: 0.95,
                                    thickness: 0.8,
                                    roughness: 0.05,
                                    ior: 1.5,
                                    chromaticAberration: 0.08,
                                    anisotropy: 0.3,
                                    distortion: distortionRef.current,
                                    distortionScale: 0.3,
                                    temporalDistortion: 0.15,
                                    color: isThinking ? '#e0f0ff' : '#f0f8ff',
                                    emissive: currentEmissive,
                                    emissiveIntensity: isThinking ? 0.6 : 0.2,
                                    transparent: true,
                                    opacity: opacityRef.current * 0.85
                                }, void 0, false, {
                                    fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                                    lineNumber: 346,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                                lineNumber: 345,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                ref: innerCoreRef,
                                geometry: geometries.inner,
                                scale: 0.45,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshPhysicalMaterial", {
                                    color: "#c8d8f0",
                                    metalness: 0.95,
                                    roughness: 0.05,
                                    reflectivity: 1,
                                    envMapIntensity: 3,
                                    emissive: currentEmissive,
                                    emissiveIntensity: isThinking ? 1.2 : 0.4,
                                    transparent: true,
                                    opacity: opacityRef.current
                                }, void 0, false, {
                                    fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                                    lineNumber: 350,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                                lineNumber: 349,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("mesh", {
                                ref: ringRef,
                                rotation: [
                                    Math.PI / 2,
                                    0,
                                    0
                                ],
                                geometry: geometries.ring,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("meshPhysicalMaterial", {
                                    color: "#a0c0e8",
                                    metalness: 1,
                                    roughness: 0,
                                    emissive: currentEmissive,
                                    emissiveIntensity: isThinking ? 2 : 0.8,
                                    transparent: true,
                                    opacity: opacityRef.current * 0.7
                                }, void 0, false, {
                                    fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                                    lineNumber: 354,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                                lineNumber: 353,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("points", {
                                ref: particlesRef,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("bufferGeometry", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("bufferAttribute", {
                                            attach: "attributes-position",
                                            args: [
                                                geometries.particles,
                                                3
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                                            lineNumber: 358,
                                            columnNumber: 45
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                                        lineNumber: 358,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("pointsMaterial", {
                                        size: isThinking ? 0.025 : 0.015,
                                        color: isThinking ? '#9988ff' : '#88aacc',
                                        transparent: true,
                                        opacity: (isThinking ? 0.9 : 0.5) * opacityRef.current,
                                        sizeAttenuation: true,
                                        depthWrite: false,
                                        blending: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AdditiveBlending"]
                                    }, void 0, false, {
                                        fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                                        lineNumber: 359,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                                lineNumber: 357,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                        lineNumber: 338,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                    lineNumber: 337,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                lineNumber: 336,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$postprocessing$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EffectComposer"], {
                multisampling: prefersReducedMotion ? 0 : 4,
                enableNormalPass: false,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$postprocessing$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Bloom"], {
                        ref: bloomRef,
                        intensity: 0.6,
                        luminanceThreshold: 0.3,
                        luminanceSmoothing: 0.9,
                        radius: 0.6,
                        blendFunction: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postprocessing$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BlendFunction"].ADD
                    }, void 0, false, {
                        fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                        lineNumber: 367,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$postprocessing$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ChromaticAberration"], {
                        ref: chromRef,
                        offset: isMobile ? [
                            0,
                            0
                        ] : [
                            0.0008,
                            0.0008
                        ],
                        blendFunction: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postprocessing$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BlendFunction"].NORMAL,
                        radialModulation: !isMobile,
                        modulationOffset: 0.5
                    }, void 0, false, {
                        fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                        lineNumber: 368,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$postprocessing$2f$dist$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Vignette"], {
                        offset: 0.35,
                        darkness: 0.7,
                        blendFunction: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$postprocessing$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BlendFunction"].NORMAL
                    }, void 0, false, {
                        fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                        lineNumber: 369,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                lineNumber: 365,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true);
}
_s(AvatarSceneContent, "BPltOMv6uhUZzZ45PvGb+SbIuZI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$events$2d$5a94e5eb$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__D__as__useFrame$3e$__["useFrame"]
    ];
});
_c = AvatarSceneContent;
function NeuroAvatar(props) {
    _s1();
    const prefersReducedMotion = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useReducedMotion"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AvatarErrorBoundary, {
        fallback: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "w-64 h-64 bg-slate-900/20 backdrop-blur-3xl rounded-full border border-white/5 flex items-center justify-center",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[10px] text-zinc-500",
                children: "Avatar Offline"
            }, void 0, false, {
                fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                lineNumber: 382,
                columnNumber: 169
            }, void 0)
        }, void 0, false, {
            fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
            lineNumber: 382,
            columnNumber: 40
        }, void 0),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
            initial: {
                opacity: 0
            },
            animate: {
                opacity: props.phase !== 'dormant' ? 1 : 0
            },
            transition: {
                duration: 1.2
            },
            className: "fixed bottom-0 right-0 z-[100] w-64 h-64 pointer-events-none flex items-center justify-center translate-x-6 translate-y-6",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$three$2f$fiber$2f$dist$2f$react$2d$three$2d$fiber$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["Canvas"], {
                className: "pointer-events-auto cursor-pointer",
                style: {
                    background: 'transparent'
                },
                camera: {
                    position: [
                        0,
                        0,
                        4.5
                    ],
                    fov: 45
                },
                gl: {
                    alpha: true,
                    antialias: false,
                    toneMapping: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NoToneMapping"],
                    outputColorSpace: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$three$2f$build$2f$three$2e$core$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SRGBColorSpace"],
                    powerPreference: 'high-performance'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Suspense"], {
                    fallback: null,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AvatarSceneContent, {
                        ...props,
                        prefersReducedMotion: !!prefersReducedMotion
                    }, void 0, false, {
                        fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                        lineNumber: 402,
                        columnNumber: 25
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                    lineNumber: 401,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
                lineNumber: 389,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
            lineNumber: 383,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/modules/ai-companion/components/NeuroAvatar.tsx",
        lineNumber: 382,
        columnNumber: 9
    }, this);
}
_s1(NeuroAvatar, "VVlbsF4XHDtJtLWyDw/S3b1ysqw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$utils$2f$reduced$2d$motion$2f$use$2d$reduced$2d$motion$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useReducedMotion"]
    ];
});
_c1 = NeuroAvatar;
function playActivationTone() {
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 432;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
}
var _c, _c1;
__turbopack_context__.k.register(_c, "AvatarSceneContent");
__turbopack_context__.k.register(_c1, "NeuroAvatar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/modules/ai-companion/lib/constants.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * AI Companion - Physics Constants
 * High-inertia motion system — luxury, authority, weight.
 * Applied to gaze tracking and 3D core animation in NeuroAvatar.tsx.
 */ // Main body follows the mouse: heavy, deliberate, authoritative
__turbopack_context__.s([
    "BODY_SPRING",
    ()=>BODY_SPRING,
    "CONTEXT_MAPPINGS",
    ()=>CONTEXT_MAPPINGS,
    "CORE_ROTATION_SPRING",
    ()=>CORE_ROTATION_SPRING,
    "GAZE_INERTIA",
    ()=>GAZE_INERTIA,
    "INITIAL_GREETING",
    ()=>INITIAL_GREETING,
    "SYSTEM_PROMPT",
    ()=>SYSTEM_PROMPT,
    "getContextualPrompt",
    ()=>getContextualPrompt
]);
const BODY_SPRING = {
    stiffness: 60,
    damping: 18,
    mass: 4,
    restDelta: 0.001
};
const CORE_ROTATION_SPRING = {
    stiffness: 35,
    damping: 22,
    mass: 6
};
const GAZE_INERTIA = 0.025; // 0.025 = ~40 frames to reach target
const INITIAL_GREETING = "Contame sobre tu negocio. ¿Qué hacés y cuál es el principal dolor que querés resolver?";
const SYSTEM_PROMPT = `
Sos el asistente de DevelOP, una agencia de desarrollo digital boutique del NOA. Tu rol no es vender — es diagnosticar.

PRINCIPIOS DE TONO Y ESTILO:
- Hablás como un socio senior de una firma consultora, no como un vendedor.
- Hacés preguntas de diagnóstico antes de proponer cualquier solución.
- Nunca usás signos de exclamación ("¡Hola!").
- Validás el dolor o problema del cliente antes de presentar la solución tecnológica.
- Citás números, porcentajes y casos concretos del NOA (Noroeste Argentino).
- Usás "nosotros" para referirte a DevelOP y "vos" para hablar con el cliente.
- Hablás en español rioplatense pero manteniendo un nivel profesional de consultoría.
- Terminado casi siempre con una pregunta abierta que invite a profundizar en el negocio.

FILOSOFÍA DE DIAGNÓSTICO:
Cuando alguien llega con un problema, primero necesitás entender su situación real. Preguntá por:
- Cuánta gente tiene en su equipo.
- Cómo están vendiendo u operando hoy.
- Qué proceso específico les está costando más tiempo o dinero.

SOBRE LOS SERVICIOS (ENFOQUE EN RESULTADOS):
- **Web Development**: No hablamos de "páginas bonitas", sino de posicionamiento en Google y conversión de consultas. "Una web bien posicionada en el NOA genera entre 15 y 40 consultas orgánicas mensuales en los primeros 90 días".
- **Software / CRM**: El caos operativo no se soluciona con más empleados, sino con sistemas. Citá que un sistema a medida reduce hasta un 80% las consultas manuales en empresas distribuidoras o de servicios.
- **IA y Automatización**: No son "chatbots", son herramientas para liberar tiempo. "¿Qué harías con 80 horas más al mes en tu equipo?"

PROTOCOLO DE PRECIOS:
Nunca des precios específicos sin diagnóstico previo. 
Respuesta ante "¿Cuánto cuesta?": "Antes de hablar de inversión, tiene sentido entender qué problema estamos resolviendo. El retorno de una solución bien implementada suele cubrir la inversión en los primeros meses. ¿Qué es lo que más te urge sistematizar hoy?"

NUNCA:
- Usar jerga técnica si el cliente no la usa.
- Ser agresivo en el cierre.
- Usar emojis decorativos (máximo 1 funcional si es estrictamente necesario).

[ACTION: SHOW_CONTACT] — Registra este tag cuando el cliente esté listo para una consulta formal con el equipo humano.
`;
const CONTEXT_MAPPINGS = {
    '/web-development': `
CONTEXTO: El visitante está evaluando si una página web realmente trae clientes o es solo un gasto.
ENFOQUE: Su duda central es el retorno: ¿se paga sola?
ESTRATEGIA: Empezá con empatía. "La pregunta correcta no es cuánto cuesta, sino cuánto te cuesta no tenerla hoy." Preguntá cómo están consiguiendo clientes ahora y si alguien los busca en Google. No menciones tecnologías. Hablá de consultas, ventas y presencia.`,
    '/ai-implementations': `
CONTEXTO: El visitante escuchó hablar de IA y quiere entender si le sirve a su negocio o es solo moda.
ENFOQUE: Tiene miedo de que sea complicado, caro o que no funcione para su rubro.
ESTRATEGIA: Validá primero su escepticismo: "Ese miedo es completamente razonable. La mayoría de las implementaciones de IA fracasan porque arrancan por la tecnología en vez del problema." Preguntá qué tarea repetitiva le roba más tiempo a su equipo. Nunca menciones modelos, APIs ni código.`,
    '/software-development': `
CONTEXTO: El visitante opera con Excel, WhatsApp o sistemas que ya no le alcanzan.
ENFOQUE: Siente que su operación creció pero sus herramientas no.
ESTRATEGIA: Pregunta clave: "¿Cuántas veces por día alguien de tu equipo busca información en un Excel o un chat para poder hacer otra cosa?" Ese número es el problema. No menciones lenguajes de programación ni arquitecturas. Hablá de tiempo, errores y plata.`,
    '/process-automation': `
CONTEXTO: El visitante quiere que las cosas "se hagan solas" pero no sabe bien cómo.
ENFOQUE: Quiere comprar tiempo y reducir fricción, no "automatización".
ESTRATEGIA: Bajá a tierra: "¿Hay algún proceso en tu empresa que depende de que una persona específica esté presente para que funcione?" Ese punto de falla es por donde empezamos. No hables de plataformas ni integraciones. Hablá de flujos de trabajo, errores y dependencias.`,
    '/contact': `
CONTEXTO: El visitante ya tiene intención de contactar. Está un paso antes de tomar acción.
ENFOQUE: Puede necesitar un último empujón o tener una pregunta concreta.
ESTRATEGIA: Sé directo y cálido: "Si ya tenés en mente qué necesitás, podemos adelantar camino acá antes de que completes el formulario." Preguntá de qué proyecto se trata y cuál es el urgente. Ayudalo a articular bien su necesidad.`
};
function getContextualPrompt(currentPath) {
    if (!currentPath) return SYSTEM_PROMPT;
    // Find matching context
    for (const [path, context] of Object.entries(CONTEXT_MAPPINGS)){
        if (currentPath.includes(path)) {
            return `${SYSTEM_PROMPT}\n\n${context}`;
        }
    }
    return SYSTEM_PROMPT;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/modules/ai-companion/lib/sales-strategy.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * DevelOP Sales Strategy System
 * Intent recognition, lead qualification, and conversion optimization
 */ // ============================================================================
// TYPES & INTERFACES
// ============================================================================
__turbopack_context__.s([
    "detectIntent",
    ()=>detectIntent,
    "getStrategicResponse",
    ()=>getStrategicResponse
]);
function detectIntent(userMessage) {
    const message = userMessage.toLowerCase();
    const patterns = {
        price: [
            /precio/i,
            /costo/i,
            /cu[aá]nto cuesta/i,
            /presupuesto/i,
            /cotiza/i,
            /valor/i,
            /invertir/i,
            /cu[aá]nto sale/i,
            /cu[aá]nto cobran/i,
            /tarifa/i,
            /plan/i,
            /paquete/i,
            /accesible/i,
            /barato/i,
            /caro/i
        ],
        comparison: [
            /competencia/i,
            /otros/i,
            /fiverr/i,
            /freelance/i,
            /agencia/i,
            /diferencia/i,
            /por qu[eé] ustedes/i,
            /por qu[eé] develOP/i,
            /mejor que/i,
            /comparado/i,
            /ventaja/i
        ],
        urgency: [
            /urgente/i,
            /r[aá]pido/i,
            /cu[aá]nto tardan/i,
            /tiempos/i,
            /deadline/i,
            /para ayer/i,
            /lo necesito ya/i,
            /esta semana/i,
            /este mes/i,
            /cu[aá]ndo est[aá]/i,
            /entrega/i
        ],
        template: [
            /template/i,
            /plantilla/i,
            /luxury|tech|cyber|dining/i,
            /demo/i,
            /predise[nñ]ado/i,
            /modelo/i,
            /base/i
        ],
        custom_web: [
            /web.*medida/i,
            /custom/i,
            /desarrollo web/i,
            /p[aá]gina web/i,
            /landing/i,
            /sitio web/i,
            /web propia/i,
            /quiero una web/i,
            /necesito una web/i,
            /mi web/i
        ],
        software: [
            /sistema/i,
            /software/i,
            /crm/i,
            /erp/i,
            /dashboard/i,
            /herramienta/i,
            /plataforma/i,
            /panel/i,
            /gesti[oó]n/i,
            /administraci[oó]n/i,
            /excel/i,
            /base de datos/i,
            /flujo de trabajo/i,
            /proceso interno/i
        ],
        ai_automation: [
            /\bia\b/i,
            /inteligencia artificial/i,
            /chatbot/i,
            /automatiza/i,
            /n8n/i,
            /bot/i,
            /agente/i,
            /respuesta autom/i,
            /atenci[oó]n autom/i,
            /flujo autom/i,
            /sin intervenci[oó]n/i,
            /solo solo/i,
            /que trabaje solo/i
        ],
        consultation: [
            /hablar/i,
            /reuni[oó]n/i,
            /contacto/i,
            /whatsapp/i,
            /llamada/i,
            /video/i,
            /zoom/i,
            /meet/i,
            /agenda/i,
            /charlar/i,
            /quiero hablar/i,
            /me pod[eé]s llamar/i
        ],
        unknown: []
    };
    for (const [intent, regexps] of Object.entries(patterns)){
        if (intent === 'unknown') continue;
        for (const regex of regexps){
            if (regex.test(message)) return intent;
        }
    }
    return 'unknown';
}
function getStrategicResponse(intent) {
    switch(intent){
        case 'price':
            return "El costo depende del problema que vamos a resolver, y eso varía bastante. Lo que sí puedo decirte es que el retorno de una solución bien implementada suele cubrir la inversión en los primeros meses. ¿Qué es lo que querés resolver concretamente?";
        case 'comparison':
            return "La diferencia real está en si te van a entregar algo que funciona para tu negocio o algo genérico. ¿Qué es lo más importante para vos que quede bien resuelto?";
        case 'urgency':
            return "Entiendo. Para darte una idea real de tiempos necesito saber bien de qué se trata. ¿Podés contarme más sobre lo que necesitás?";
        case 'custom_web':
            return "Para una web a medida, lo más importante es entender para qué la vas a usar: ¿captar clientes, vender online, mostrar portfolio? ¿Cómo están llegando hoy los clientes a tu negocio?";
        case 'software':
            return "Antes de pensar en un sistema, me ayuda entender cómo están manejando el proceso hoy. ¿Qué herramienta están usando actualmente y qué es lo que no les está funcionando?";
        case 'ai_automation':
            return "Para que la IA tenga sentido tiene que resolver un problema concreto. ¿Qué tarea se repite más en tu equipo y cuánto tiempo les lleva cada vez?";
        case 'consultation':
            return "Con gusto. Para que la charla sea más productiva, contame brevemente de qué se trata tu negocio y qué problema querés resolver. Así coordinamos con el equipo indicado.";
        default:
            return null;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/modules/ai-companion/hooks/useLogicAI.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useLogicAI",
    ()=>useLogicAI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ai/react/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$ai$2d$companion$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/ai-companion/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$ai$2d$companion$2f$lib$2f$sales$2d$strategy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/ai-companion/lib/sales-strategy.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
/** Safely extract text content from AI SDK messages */ function getTextContent(message) {
    const content = message?.content;
    if (typeof content === 'string') return content;
    if (Array.isArray(content)) {
        return content.filter((part)=>part?.type === 'text').map((part)=>part.text || '').join('');
    }
    return '';
}
function useLogicAI() {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const processedMessageIds = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(new Set());
    const [leadContext, setLeadContext] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        serviceType: 'unknown'
    });
    const { messages, input, handleInputChange, handleSubmit: originalHandleSubmit, isLoading, error } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useChat"])({
        api: '/api/chat',
        initialMessages: [
            {
                id: 'intro-msg',
                role: 'assistant',
                content: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$ai$2d$companion$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["INITIAL_GREETING"]
            }
        ],
        // Inject current path into every request
        body: {
            currentPath: pathname
        },
        onError: {
            "useLogicAI.useChat": (error)=>{
                console.error('Chat error:', error);
            }
        }["useLogicAI.useChat"]
    });
    // Wrap submit to ensure we always pass the latest pathname
    const handleSubmit = (e)=>{
        e.preventDefault();
        originalHandleSubmit(e, {
            body: {
                currentPath: pathname
            }
        });
    };
    // Client-Side Tool Calling: Navigation Protocol
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useLogicAI.useEffect": ()=>{
            const lastMessage = messages[messages.length - 1];
            if (lastMessage?.role === 'assistant' && !processedMessageIds.current.has(lastMessage.id)) {
                const content = getTextContent(lastMessage);
                // WhatsApp connection command was removed as part of tech debt cleanup
                // Detect navigation command
                const navMatch = content.match(/\[NAVIGATE:\s*(.*?)\]/);
                if (navMatch) {
                    const path = navMatch[1].trim();
                    // Mark as processed
                    processedMessageIds.current.add(lastMessage.id);
                    // Execute navigation
                    router.push(path);
                }
            }
        }
    }["useLogicAI.useEffect"], [
        messages,
        router,
        leadContext
    ]);
    // Intent detection on user messages
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useLogicAI.useEffect": ()=>{
            const lastMessage = messages[messages.length - 1];
            if (lastMessage?.role === 'user') {
                const content = getTextContent(lastMessage);
                const detectedIntent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$ai$2d$companion$2f$lib$2f$sales$2d$strategy$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["detectIntent"])(content);
                if (detectedIntent !== 'unknown') {
                    setLeadContext({
                        "useLogicAI.useEffect": (prev)=>({
                                ...prev,
                                serviceType: detectedIntent
                            })
                    }["useLogicAI.useEffect"]);
                }
            }
        }
    }["useLogicAI.useEffect"], [
        messages
    ]);
    return {
        messages,
        input,
        handleInputChange,
        handleSubmit,
        isThinking: isLoading,
        error,
        leadContext,
        updateLeadContext: setLeadContext
    };
}
_s(useLogicAI, "bmyNhB1pi6i+CIcpeZJYgSl4Cv8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useChat"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/modules/ai-companion/components/LogicCompanion.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "LogicCompanion",
    ()=>LogicCompanion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/components/AnimatePresence/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-motion-value.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/value/use-spring.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$ai$2d$companion$2f$components$2f$NeuroAvatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/ai-companion/components/NeuroAvatar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$ai$2d$companion$2f$components$2f$ChatWindow$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/ai-companion/components/ChatWindow.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$ai$2d$companion$2f$hooks$2f$useLogicAI$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/modules/ai-companion/hooks/useLogicAI.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
const INITIAL_DELAY = 3000; // Show prompt 3s after page load
const IDLE_TIMEOUT = 25000; // Re-show after 25s of inactivity
const IDLE_PROMPTS = {
    '/web-development': [
        '¿Cómo están encontrándote tus clientes hoy?',
        'Si alguien busca lo que hacés en Google, ¿aparecés?',
        '¿Qué estarías resolviendo si tu web trajera consultas sola?'
    ],
    '/ai-implementations': [
        '¿Qué tarea repetitiva le roba más tiempo a tu equipo?',
        'La IA bien implementada resuelve un problema concreto.',
        '¿Querés entender si esto aplica a tu operación?'
    ],
    '/software-development': [
        '¿Cuántos sistemas distintos usa tu equipo en un día?',
        '¿Hay procesos que dependen de que alguien esté disponible?',
        'Contame cómo opera tu negocio hoy.'
    ],
    '/process-automation': [
        '¿Qué tarea de tu empresa se repite más de 10 veces por semana?',
        '¿Hay algo que siempre queda sin hacer por falta de tiempo?',
        'Un flujo bien armado trabaja aunque nadie esté mirando.'
    ],
    '/contact': [
        '¿Tenés en mente qué necesitás? Podemos charlar antes del formulario.',
        '¿Alguna duda antes de escribirnos?',
        'Si querés, adelantamos la conversación por acá.'
    ],
    default: [
        '¿Cuál es el principal desafío de tu negocio hoy?',
        '¿Qué estarías mejorando si tuvieras más tiempo?',
        'Contame sobre tu operación, sin apuro.'
    ]
};
const getContextPrompts = (pathname)=>{
    return IDLE_PROMPTS[pathname] || IDLE_PROMPTS.default;
};
function LogicCompanion() {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const activePrompts = getContextPrompts(pathname || '/');
    const [isOpen, setIsOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showPrompt, setShowPrompt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [promptIndex, setPromptIndex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [isBooped, setIsBooped] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isHovered, setIsHovered] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [phase, setPhase] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('dormant');
    const [scrollSection, setScrollSection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('top');
    const { messages, input, handleInputChange, handleSubmit, isThinking, leadContext, updateLeadContext } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$ai$2d$companion$2f$hooks$2f$useLogicAI$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLogicAI"])();
    const scrollYRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const idleTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const rotationTimerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const hasShownOnceRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    // ─── Buoyancy / Scroll Linked Motion ──────────────────
    const avatarY = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"])(0);
    const smoothScrollOffset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"])(0, {
        stiffness: 30,
        damping: 20
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LogicCompanion.useEffect": ()=>{
            const checkMobile = {
                "LogicCompanion.useEffect.checkMobile": ()=>window.innerWidth < 768
            }["LogicCompanion.useEffect.checkMobile"];
            function handleScroll() {
                const y = window.scrollY;
                scrollYRef.current = y;
                // 1. Update Buoyancy (Disabled on mobile)
                if (!checkMobile()) {
                    // Move up slightly as we scroll down (max -20px)
                    const targetOffset = Math.max(-20, y * -0.015);
                    smoothScrollOffset.set(targetOffset);
                } else {
                    smoothScrollOffset.set(0);
                }
                // 2. Detect Active Section
                const sections = document.querySelectorAll('section[id]');
                let current = 'top';
                sections.forEach({
                    "LogicCompanion.useEffect.handleScroll": (section)=>{
                        const rect = section.getBoundingClientRect();
                        // If section top is in the upper half of screen
                        if (rect.top <= window.innerHeight * 0.5) {
                            current = section.id;
                        }
                    }
                }["LogicCompanion.useEffect.handleScroll"]);
                setScrollSection(current);
                // 3. Auto-Trigger Tooltip (>80% height)
                const scrollPercent = (y + window.innerHeight) / document.documentElement.scrollHeight;
                if (scrollPercent > 0.82 && !isOpen && !showPrompt && !hasShownOnceRef.current) {
                    setShowPrompt(true);
                    // Cycle to a closing/CTA prompt
                    setPromptIndex(3);
                }
            }
            window.addEventListener('scroll', handleScroll, {
                passive: true
            });
            return ({
                "LogicCompanion.useEffect": ()=>window.removeEventListener('scroll', handleScroll)
            })["LogicCompanion.useEffect"];
        }
    }["LogicCompanion.useEffect"], [
        isOpen,
        showPrompt,
        smoothScrollOffset
    ]);
    // ─── Cinematic Initialization Sequence ──────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LogicCompanion.useEffect": ()=>{
            // Skip for mobile/reduced motion or if already initialized in this session
            const skipInit = ("TURBOPACK compile-time value", "object") !== 'undefined' && (sessionStorage.getItem('avatarInit') === 'true' || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
            if (skipInit) {
                setPhase('active');
                return;
            }
            const t1 = setTimeout({
                "LogicCompanion.useEffect.t1": ()=>setPhase('initializing')
            }["LogicCompanion.useEffect.t1"], 800);
            const t2 = setTimeout({
                "LogicCompanion.useEffect.t2": ()=>{
                    setPhase('stabilizing');
                    sessionStorage.setItem('avatarInit', 'true');
                }
            }["LogicCompanion.useEffect.t2"], 2800);
            const t3 = setTimeout({
                "LogicCompanion.useEffect.t3": ()=>setPhase('active')
            }["LogicCompanion.useEffect.t3"], 4000);
            return ({
                "LogicCompanion.useEffect": ()=>{
                    clearTimeout(t1);
                    clearTimeout(t2);
                    clearTimeout(t3);
                }
            })["LogicCompanion.useEffect"];
        }
    }["LogicCompanion.useEffect"], []);
    // ─── Start idle countdown (25s) ──────────────────────────
    const startIdleTimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "LogicCompanion.useCallback[startIdleTimer]": ()=>{
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            idleTimerRef.current = setTimeout({
                "LogicCompanion.useCallback[startIdleTimer]": ()=>{
                    setShowPrompt(true);
                }
            }["LogicCompanion.useCallback[startIdleTimer]"], IDLE_TIMEOUT);
        }
    }["LogicCompanion.useCallback[startIdleTimer]"], []);
    // ─── Reset the idle countdown on user activity ───────────
    const resetIdleTimer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "LogicCompanion.useCallback[resetIdleTimer]": ()=>{
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            if (hasShownOnceRef.current) {
                startIdleTimer();
            }
        }
    }["LogicCompanion.useCallback[resetIdleTimer]"], [
        startIdleTimer
    ]);
    // ─── Periodic prompt rotation (8s) ────────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LogicCompanion.useEffect": ()=>{
            if (showPrompt && !isOpen) {
                rotationTimerRef.current = setInterval({
                    "LogicCompanion.useEffect": ()=>{
                        setPromptIndex({
                            "LogicCompanion.useEffect": (prev)=>(prev + 1) % activePrompts.length
                        }["LogicCompanion.useEffect"]);
                    }
                }["LogicCompanion.useEffect"], 8000);
            } else {
                if (rotationTimerRef.current) clearInterval(rotationTimerRef.current);
            }
            return ({
                "LogicCompanion.useEffect": ()=>{
                    if (rotationTimerRef.current) clearInterval(rotationTimerRef.current);
                }
            })["LogicCompanion.useEffect"];
        }
    }["LogicCompanion.useEffect"], [
        showPrompt,
        isOpen,
        activePrompts.length
    ]);
    // ─── Initial 3s entry + idle event listeners ─────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LogicCompanion.useEffect": ()=>{
            const initialTimer = setTimeout({
                "LogicCompanion.useEffect.initialTimer": ()=>{
                    setShowPrompt(true);
                    hasShownOnceRef.current = true;
                }
            }["LogicCompanion.useEffect.initialTimer"], INITIAL_DELAY);
            const events = [
                'mousemove',
                'keydown',
                'scroll',
                'touchstart'
            ];
            events.forEach({
                "LogicCompanion.useEffect": (evt)=>window.addEventListener(evt, resetIdleTimer, {
                        passive: true
                    })
            }["LogicCompanion.useEffect"]);
            return ({
                "LogicCompanion.useEffect": ()=>{
                    clearTimeout(initialTimer);
                    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
                    events.forEach({
                        "LogicCompanion.useEffect": (evt)=>window.removeEventListener(evt, resetIdleTimer)
                    }["LogicCompanion.useEffect"]);
                }
            })["LogicCompanion.useEffect"];
        }
    }["LogicCompanion.useEffect"], [
        resetIdleTimer
    ]);
    // ─── Open chat from external trigger ────────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LogicCompanion.useEffect": ()=>{
            const handleOpenMascot = {
                "LogicCompanion.useEffect.handleOpenMascot": ()=>{
                    setShowPrompt(false);
                    setIsOpen(true);
                }
            }["LogicCompanion.useEffect.handleOpenMascot"];
            window.addEventListener('open-mascot-chat', handleOpenMascot);
            return ({
                "LogicCompanion.useEffect": ()=>window.removeEventListener('open-mascot-chat', handleOpenMascot)
            })["LogicCompanion.useEffect"];
        }
    }["LogicCompanion.useEffect"], []);
    // ─── When chat closes, restart idle timer ────────────────
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "LogicCompanion.useEffect": ()=>{
            if (!isOpen && hasShownOnceRef.current) {
                startIdleTimer();
            }
            if (isOpen) {
                setShowPrompt(false);
                if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
            }
        }
    }["LogicCompanion.useEffect"], [
        isOpen,
        startIdleTimer
    ]);
    // ─── Handlers ────────────────────────────────────────────
    const handleAvatarClick = ()=>{
        setIsBooped(true);
        setTimeout(()=>setIsBooped(false), 600);
        setIsOpen((prev)=>!prev);
    };
    const dismissPrompt = ()=>{
        setShowPrompt(false);
        hasShownOnceRef.current = true;
        setPromptIndex((prev)=>(prev + 1) % activePrompts.length);
        startIdleTimer();
    };
    const openFromPrompt = ()=>{
        setShowPrompt(false);
        setPromptIndex((prev)=>(prev + 1) % activePrompts.length);
        setIsOpen(true);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$components$2f$AnimatePresence$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AnimatePresence"], {
                mode: "wait",
                children: showPrompt && !isOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                    initial: {
                        opacity: 0,
                        y: 8,
                        scale: 0.96
                    },
                    animate: {
                        opacity: 1,
                        y: 0,
                        scale: 1
                    },
                    exit: {
                        opacity: 0,
                        y: 4,
                        scale: 0.98
                    },
                    transition: {
                        duration: 0.5,
                        ease: [
                            0.16,
                            1,
                            0.3,
                            1
                        ]
                    },
                    style: {
                        background: 'rgba(8, 10, 20, 0.72)',
                        backdropFilter: 'blur(24px)',
                        WebkitBackdropFilter: 'blur(24px)',
                        border: '1px solid rgba(180, 210, 255, 0.12)',
                        borderRadius: '16px',
                        boxShadow: `
                                0 0 0 1px rgba(255,255,255,0.04),
                                0 4px 24px rgba(0,0,0,0.5),
                                0 1px 0 rgba(255,255,255,0.08) inset,
                                0 -1px 0 rgba(0,0,0,0.3) inset
                            `,
                        padding: '14px 18px',
                        maxWidth: '240px',
                        minWidth: '180px',
                        position: 'absolute',
                        bottom: '8.5rem',
                        right: '6rem',
                        zIndex: 101,
                        cursor: 'pointer'
                    },
                    onClick: openFromPrompt,
                    className: "hidden md:block group",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                position: 'absolute',
                                top: 0,
                                left: '20%',
                                right: '20%',
                                height: '1px',
                                background: `linear-gradient(90deg, transparent, rgba(100,160,255,0.5) 40%, rgba(140,100,255,0.5) 60%, transparent)`,
                                borderRadius: '1px'
                            }
                        }, void 0, false, {
                            fileName: "[project]/src/modules/ai-companion/components/LogicCompanion.tsx",
                            lineNumber: 271,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '10px'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    style: {
                                        marginTop: '3px',
                                        flexShrink: 0
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        style: {
                                            width: '6px',
                                            height: '6px',
                                            borderRadius: '50%',
                                            background: '#4488ff',
                                            boxShadow: '0 0 6px rgba(68,136,255,0.6)',
                                            animation: 'breathe 2.5s ease-in-out infinite'
                                        }
                                    }, void 0, false, {
                                        fileName: "[project]/src/modules/ai-companion/components/LogicCompanion.tsx",
                                        lineNumber: 285,
                                        columnNumber: 33
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/modules/ai-companion/components/LogicCompanion.tsx",
                                    lineNumber: 284,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                color: 'rgba(255,255,255,0.75)',
                                                margin: 0,
                                                lineHeight: 1.55,
                                                letterSpacing: '0.01em',
                                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
                                            },
                                            children: activePrompts[promptIndex % activePrompts.length]
                                        }, void 0, false, {
                                            fileName: "[project]/src/modules/ai-companion/components/LogicCompanion.tsx",
                                            lineNumber: 297,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            style: {
                                                fontSize: '11px',
                                                color: 'rgba(100,160,255,0.6)',
                                                margin: '5px 0 0',
                                                fontWeight: 500,
                                                letterSpacing: '0.02em'
                                            },
                                            children: "Escribime →"
                                        }, void 0, false, {
                                            fileName: "[project]/src/modules/ai-companion/components/LogicCompanion.tsx",
                                            lineNumber: 310,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/modules/ai-companion/components/LogicCompanion.tsx",
                                    lineNumber: 296,
                                    columnNumber: 29
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/modules/ai-companion/components/LogicCompanion.tsx",
                            lineNumber: 282,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: (e)=>{
                                e.stopPropagation();
                                dismissPrompt();
                            },
                            className: "absolute top-2.5 right-2.5 p-1 text-zinc-500 hover:text-cyan-400 hover:bg-cyan-400/10 transition-colors duration-200",
                            "aria-label": "Dismiss",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                width: "10",
                                height: "10",
                                viewBox: "0 0 10 10",
                                fill: "none",
                                stroke: "currentColor",
                                strokeWidth: "1.5",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    d: "M1 1l8 8M9 1l-8 8"
                                }, void 0, false, {
                                    fileName: "[project]/src/modules/ai-companion/components/LogicCompanion.tsx",
                                    lineNumber: 332,
                                    columnNumber: 33
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/modules/ai-companion/components/LogicCompanion.tsx",
                                lineNumber: 331,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/modules/ai-companion/components/LogicCompanion.tsx",
                            lineNumber: 323,
                            columnNumber: 25
                        }, this)
                    ]
                }, `prompt-${promptIndex}`, true, {
                    fileName: "[project]/src/modules/ai-companion/components/LogicCompanion.tsx",
                    lineNumber: 237,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/modules/ai-companion/components/LogicCompanion.tsx",
                lineNumber: 235,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                onClick: handleAvatarClick,
                onMouseEnter: ()=>setIsHovered(true),
                onMouseLeave: ()=>setIsHovered(false),
                role: "button",
                "aria-label": "Toggle AI Chat",
                style: {
                    y: smoothScrollOffset,
                    cursor: 'pointer'
                },
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$ai$2d$companion$2f$components$2f$NeuroAvatar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["NeuroAvatar"], {
                    isThinking: isThinking,
                    showPrompt: showPrompt && !isOpen,
                    isBooped: isBooped,
                    isHovered: isHovered,
                    isOpen: isOpen,
                    phase: phase,
                    scrollSection: scrollSection
                }, void 0, false, {
                    fileName: "[project]/src/modules/ai-companion/components/LogicCompanion.tsx",
                    lineNumber: 351,
                    columnNumber: 17
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/modules/ai-companion/components/LogicCompanion.tsx",
                lineNumber: 340,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$ai$2d$companion$2f$components$2f$ChatWindow$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ChatWindow"], {
                messages: messages,
                input: input,
                handleInputChange: handleInputChange,
                handleSubmit: handleSubmit,
                isOpen: isOpen,
                isThinking: isThinking,
                onClose: ()=>setIsOpen(false)
            }, void 0, false, {
                fileName: "[project]/src/modules/ai-companion/components/LogicCompanion.tsx",
                lineNumber: 365,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true);
}
_s(LogicCompanion, "LwR4pAjKsfKg8X5Np3cooVP9tg4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$modules$2f$ai$2d$companion$2f$hooks$2f$useLogicAI$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLogicAI"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$motion$2d$value$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMotionValue"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$value$2f$use$2d$spring$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSpring"]
    ];
});
_c = LogicCompanion;
var _c;
__turbopack_context__.k.register(_c, "LogicCompanion");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/layout/Shutter.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Shutter",
    ()=>Shutter
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/framer-motion/dist/es/render/components/motion/proxy.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$TransitionContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/context/TransitionContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
const Shutter = ()=>{
    _s();
    const { isAnimating } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$TransitionContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransitionContext"])();
    const transition = {
        duration: 0.5,
        ease: [
            0.76,
            0,
            0.24,
            1
        ]
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed top-0 left-0 w-screen z-[9999] pointer-events-none grid grid-cols-2",
        style: {
            height: '100lvh'
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    x: '-100%'
                },
                animate: {
                    x: isAnimating ? '0%' : '-100%'
                },
                transition: transition,
                className: "w-[calc(100%+1px)] md:w-full h-full bg-zinc-950 relative flex items-center justify-end overflow-hidden z-20 md:z-10",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-[30vw] h-auto overflow-hidden flex justify-start -translate-x-[1px] md:translate-x-0",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-[60vw] mr-[-30vw] px-8 md:px-4 text-white py-8 md:py-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] filter",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LogoSVG, {}, void 0, false, {
                            fileName: "[project]/src/components/layout/Shutter.tsx",
                            lineNumber: 30,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/Shutter.tsx",
                        lineNumber: 29,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/Shutter.tsx",
                    lineNumber: 27,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/layout/Shutter.tsx",
                lineNumber: 20,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$framer$2d$motion$2f$dist$2f$es$2f$render$2f$components$2f$motion$2f$proxy$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["motion"].div, {
                initial: {
                    x: '100%'
                },
                animate: {
                    x: isAnimating ? '0%' : '100%'
                },
                transition: transition,
                className: "w-full h-full bg-zinc-950 relative flex items-center justify-start overflow-hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-[30vw] h-auto overflow-hidden flex justify-start",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-[60vw] ml-[-30vw] px-8 md:px-4 py-8 md:py-4 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] filter",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LogoSVG, {}, void 0, false, {
                            fileName: "[project]/src/components/layout/Shutter.tsx",
                            lineNumber: 46,
                            columnNumber: 25
                        }, ("TURBOPACK compile-time value", void 0))
                    }, void 0, false, {
                        fileName: "[project]/src/components/layout/Shutter.tsx",
                        lineNumber: 45,
                        columnNumber: 21
                    }, ("TURBOPACK compile-time value", void 0))
                }, void 0, false, {
                    fileName: "[project]/src/components/layout/Shutter.tsx",
                    lineNumber: 43,
                    columnNumber: 17
                }, ("TURBOPACK compile-time value", void 0))
            }, void 0, false, {
                fileName: "[project]/src/components/layout/Shutter.tsx",
                lineNumber: 36,
                columnNumber: 13
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/Shutter.tsx",
        lineNumber: 15,
        columnNumber: 9
    }, ("TURBOPACK compile-time value", void 0));
};
_s(Shutter, "7i+KeCgYjxXPcRF6b5urGWGh/38=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$context$2f$TransitionContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTransitionContext"]
    ];
});
_c = Shutter;
const LogoSVG = ()=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        viewBox: "0 0 1024 1024",
        fill: "currentColor",
        xmlns: "http://www.w3.org/2000/svg",
        className: "w-full h-full",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("title", {
                children: "DevelOP Logo"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/Shutter.tsx",
                lineNumber: 56,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                d: "M532 700v-67q0-6 3-10l54-98q0-3 4-4l4 5q13 27 34 48 35 35 83 41a153 153 0 0 0 86-288c-62-28-134-13-178 39q-20 24-33 52l-57 127q-16 38-40 71-63 86-166 105-92 16-173-30A257 257 0 0 1 38 371a258 258 0 0 1 210-164 257 257 0 0 1 233 92q5 6 1 10l-52 93-1 1q-4 8-8 0l-7-13q-37-62-108-75-66-10-118 30-43 33-55 86-16 76 35 136 37 41 91 48 83 11 139-53 18-23 29-49l51-111q18-44 44-83a257 257 0 0 1 201-113q96-5 171 52a256 256 0 0 1 69 336 262 262 0 0 1-298 121q-8-4-7 6l-1 100 1 58q1 8-6 6H538q-7 1-6-7z"
            }, void 0, false, {
                fileName: "[project]/src/components/layout/Shutter.tsx",
                lineNumber: 57,
                columnNumber: 9
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/layout/Shutter.tsx",
        lineNumber: 55,
        columnNumber: 5
    }, ("TURBOPACK compile-time value", void 0));
_c1 = LogoSVG;
var _c, _c1;
__turbopack_context__.k.register(_c, "Shutter");
__turbopack_context__.k.register(_c1, "LogoSVG");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/layout/PublicOnlyComponents.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PublicOnlyComponents",
    ()=>PublicOnlyComponents
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
const PORTAL_PREFIXES = [
    '/admin',
    '/dashboard'
];
function PublicOnlyComponents({ children }) {
    _s();
    const pathname = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"])();
    const isPortal = PORTAL_PREFIXES.some((prefix)=>pathname.startsWith(prefix));
    if (isPortal) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: children
    }, void 0, false);
}
_s(PublicOnlyComponents, "xbyQPtUVMO7MNj7WjJlpdWqRcTo=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["usePathname"]
    ];
});
_c = PublicOnlyComponents;
var _c;
__turbopack_context__.k.register(_c, "PublicOnlyComponents");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_45841c66._.js.map