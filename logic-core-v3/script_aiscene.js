const fs = require('fs');
const content = fs.readFileSync('src/components/sections/OurServices.tsx', 'utf8');
const lines = content.split('\n');

// ─── 1. Patch the import block to include Target, Calendar, BarChart2 ───────
// They are at lines 15-26 (1-indexed). Find the closing '} from lucide-react'
const importEndIdx = lines.findIndex((l, i) => i >= 14 && l.includes("} from 'lucide-react'"));
if (importEndIdx === -1) { console.error('Import block not found'); process.exit(1); }

// Insert Target, Calendar, BarChart2 before the closing
const newImportBlock = [
  "import {",
  "  ArrowUpRight,",
  "  BarChart2,",
  "  Bot,",
  "  Calendar,",
  "  Check,",
  "  Code2,",
  "  Globe,",
  "  MessageSquare,",
  "  Phone,",
  "  Target,",
  "  type LucideIcon,",
  "  User,",
  "  Zap,",
  "} from 'lucide-react';"
];

// Replace from line 15 (index 14) to importEndIdx (inclusive)
const firstHalf = lines.slice(0, 14);             // lines 1-14
const secondHalf = lines.slice(importEndIdx + 1);  // after the import closing
const patchedLines = [...firstHalf, ...newImportBlock, ...secondHalf];

// ─── 2. Find new AIScene start / end in the patched array ────────────────────
const aiSceneStart = patchedLines.findIndex(l => l.startsWith('const CHAT_MESSAGES'));
if (aiSceneStart === -1) { console.error('CHAT_MESSAGES not found'); process.exit(1); }

// End = the line before `function AutomationScene`
const automationStart = patchedLines.findIndex(l => l.startsWith('function AutomationScene'));
if (automationStart === -1) { console.error('AutomationScene not found'); process.exit(1); }

// ─── 3. New AIScene block ─────────────────────────────────────────────────────
const newAIScene = `const AI_COLOR = '#8b5cf6';

type AISimulation = {
  id: number;
  label: string;
  icon: LucideIcon;
  duration: number;
  color: string;
};

const AI_SIMULATIONS: AISimulation[] = [
  { id: 1, label: 'Chat IA',  icon: MessageSquare, duration: 6000, color: AI_COLOR },
  { id: 2, label: 'Leads',    icon: Target,        duration: 5500, color: AI_COLOR },
  { id: 3, label: 'Agenda',   icon: Calendar,      duration: 5000, color: AI_COLOR },
  { id: 4, label: 'Métricas', icon: BarChart2,     duration: 4500, color: AI_COLOR },
];

type AISimProps = { isActive: boolean; progress: number; color: string };

function SimChat({ isActive: _isActive, progress: _progress, color: _color }: AISimProps) {
  return <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, padding: 12 }}>Chat IA — próximo sprint</div>;
}
function SimLeadsIA({ isActive: _isActive, progress: _progress, color: _color }: AISimProps) {
  return <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, padding: 12 }}>Leads IA — próximo sprint</div>;
}
function SimAgenda({ isActive: _isActive, progress: _progress, color: _color }: AISimProps) {
  return <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, padding: 12 }}>Agenda — próximo sprint</div>;
}
function SimMetricas({ isActive: _isActive, progress: _progress, color: _color }: AISimProps) {
  return <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, padding: 12 }}>Métricas — próximo sprint</div>;
}

function AIScene({ service: _service }: { service: Service }) {
  const [activeTab, setActiveTab] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cycleSeed, setCycleSeed] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(0);
  const animFrameRef = useRef(0);
  const startTimeRef = useRef(0);
  const isRunningRef = useRef(false);
  const nextTabTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { setIsInView(entry.isIntersecting); },
      { threshold: 0.3 }
    );
    const el = containerRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (nextTabTimeoutRef.current) {
      clearTimeout(nextTabTimeoutRef.current);
      nextTabTimeoutRef.current = null;
    }

    if (!isInView) {
      cancelAnimationFrame(animFrameRef.current);
      isRunningRef.current = false;
      return;
    }

    const duration = AI_SIMULATIONS[activeTab]?.duration ?? 5000;
    progressRef.current = 0;
    startTimeRef.current = performance.now();
    isRunningRef.current = true;

    const tick = (now: number) => {
      if (!isRunningRef.current) return;
      const elapsed = now - startTimeRef.current;
      const next = Math.min(elapsed / duration, 1);
      if (next !== progressRef.current) {
        progressRef.current = next;
        setProgress(next);
      }
      if (next < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }
      isRunningRef.current = false;
      nextTabTimeoutRef.current = window.setTimeout(() => {
        progressRef.current = 0;
        setProgress(0);
        setActiveTab(prev => (prev + 1) % AI_SIMULATIONS.length);
      }, 300);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (nextTabTimeoutRef.current) {
        clearTimeout(nextTabTimeoutRef.current);
        nextTabTimeoutRef.current = null;
      }
      isRunningRef.current = false;
    };
  }, [activeTab, cycleSeed, isInView]);

  const handleTabClick = (index: number) => {
    cancelAnimationFrame(animFrameRef.current);
    if (nextTabTimeoutRef.current) {
      clearTimeout(nextTabTimeoutRef.current);
      nextTabTimeoutRef.current = null;
    }
    isRunningRef.current = false;
    progressRef.current = 0;
    setProgress(0);
    setActiveTab(index);
    setCycleSeed(s => s + 1);
  };

  const activeSimulation = AI_SIMULATIONS[activeTab];

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 8,
        gap: 8,
      }}
    >
      {/* Título del panel */}
      <div style={{ marginBottom: 8, flexShrink: 0 }}>
        <div style={{
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: '0.12em',
          color: \`\${AI_COLOR}80\`,
          marginBottom: 4,
        }}>
          AGENTE IA · EN VIVO
        </div>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.8)',
          lineHeight: 1.3,
        }}>
          Tu sistema comercial trabajando ahora mismo
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: \`repeat(\${AI_SIMULATIONS.length}, 1fr)\`,
        gap: 4,
        flexShrink: 0,
      }}>
        {AI_SIMULATIONS.map((sim, index) => {
          const isActive = index === activeTab;
          const IconComp = sim.icon;
          return (
            <button
              key={sim.id}
              type="button"
              onClick={() => handleTabClick(index)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '7px 4px',
                borderRadius: 8,
                border: isActive ? \`1px solid \${AI_COLOR}30\` : '1px solid transparent',
                background: isActive ? \`\${AI_COLOR}10\` : 'transparent',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 200ms ease',
              }}
            >
              {isActive && (
                <motion.div
                  layoutId="aiTabGlow"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: \`radial-gradient(circle at 50% 0%, \${AI_COLOR}15, transparent 70%)\`,
                    pointerEvents: 'none',
                  }}
                />
              )}

              <div style={{
                color: isActive ? AI_COLOR : 'rgba(255,255,255,0.2)',
                transition: 'color 200ms',
                position: 'relative',
              }}>
                <IconComp size={12} strokeWidth={1.8}/>
              </div>

              <span style={{
                fontSize: 8,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? AI_COLOR : 'rgba(255,255,255,0.2)',
                letterSpacing: '0.04em',
                position: 'relative',
                transition: 'color 200ms',
                whiteSpace: 'nowrap',
              }}>
                {sim.label}
              </span>

              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  height: 2,
                  width: \`\${progress * 100}%\`,
                  background: \`linear-gradient(90deg, \${AI_COLOR}80, \${AI_COLOR})\`,
                  borderRadius: '0 2px 2px 0',
                }}/>
              )}

              {!isActive && index < activeTab && (
                <div style={{
                  position: 'absolute',
                  bottom: 4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 3,
                  height: 3,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.15)',
                }}/>
              )}
            </button>
          );
        })}
      </div>

      {/* Simulation panel */}
      <div style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 22,
        border: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.025)',
        padding: 8,
        minHeight: 0,
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ height: '100%' }}
          >
            {activeTab === 0 ? (
              <SimChat isActive={isInView} progress={progress} color={activeSimulation.color}/>
            ) : activeTab === 1 ? (
              <SimLeadsIA isActive={isInView} progress={progress} color={activeSimulation.color}/>
            ) : activeTab === 2 ? (
              <SimAgenda isActive={isInView} progress={progress} color={activeSimulation.color}/>
            ) : (
              <SimMetricas isActive={isInView} progress={progress} color={activeSimulation.color}/>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
`;

// ─── 4. Splice in the new block ───────────────────────────────────────────────
const result = [
  ...patchedLines.slice(0, aiSceneStart),
  ...newAIScene.split('\n'),
  '',
  ...patchedLines.slice(automationStart),
];

fs.writeFileSync('src/components/sections/OurServices.tsx', result.join('\n'));
console.log('Success! AIScene replaced with tab system.');
