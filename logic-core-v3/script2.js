const fs = require('fs');
const file = 'src/components/sections/OurServices.tsx';
let lines = fs.readFileSync(file, 'utf8').split('\n');

// 1. Update lucide-react imports
const importEndIndex = lines.findIndex(line => line.includes("} from 'lucide-react'"));
if (importEndIndex !== -1) {
    if (!lines[importEndIndex - 1].includes("Target")) {
        lines.splice(importEndIndex, 0, "  Target,", "  Calendar,", "  BarChart2,");
    }
}

// 2. Find AIScene bounds
const startIdx = lines.findIndex(l => l.includes('function AIScene({ service }: { service: Service }) {'));

if (startIdx !== -1) {
    let open = 0, endIdx = -1;
    for (let i = startIdx; i < lines.length; i++) {
        if (lines[i].includes('{')) open += (lines[i].match(/\{/g) || []).length;
        if (lines[i].includes('}')) open -= (lines[i].match(/\}/g) || []).length;
        if (open === 0) {
            endIdx = i;
            break;
        }
    }

    if (endIdx !== -1) {
        const newCode = `type AISimulation = {
  id: number
  label: string
  icon: LucideIcon
  duration: number
  color: string
}

const AI_COLOR = '#8b5cf6'

const AI_SIMULATIONS: AISimulation[] = [
  { id: 1, label: 'Chat IA',    icon: MessageSquare, duration: 6000, color: AI_COLOR },
  { id: 2, label: 'Leads',      icon: Target,        duration: 5500, color: AI_COLOR },
  { id: 3, label: 'Agenda',     icon: Calendar,      duration: 5000, color: AI_COLOR },
  { id: 4, label: 'Métricas',   icon: BarChart2,     duration: 4500, color: AI_COLOR },
]

function SimChat({ isActive, progress, color }: SimProps) {
  return <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, padding: 12 }}>Chat IA — próximo sprint</div>
}
function SimLeadsIA({ isActive, progress, color }: SimProps) {
  return <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, padding: 12 }}>Leads IA — próximo sprint</div>
}
function SimAgenda({ isActive, progress, color }: SimProps) {
  return <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, padding: 12 }}>Agenda — próximo sprint</div>
}
function SimMetricas({ isActive, progress, color }: SimProps) {
  return <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, padding: 12 }}>Métricas — próximo sprint</div>
}

function AIScene({ service }: { service: Service }) {
  const [activeTab, setActiveTab] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const animFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(0);
  const isRunningRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.3 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      isRunningRef.current = false;
      return;
    }

    if (isRunningRef.current) return;
    isRunningRef.current = true;
    startTimeRef.current = performance.now() - progressRef.current * AI_SIMULATIONS[activeTab].duration;

    const tick = (now) => {
      const duration = AI_SIMULATIONS[activeTab].duration;
      const elapsed = now - startTimeRef.current;
      const nextProgress = Math.min(elapsed / duration, 1);
      
      progressRef.current = nextProgress;
      setProgress(nextProgress);

      if (nextProgress < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
        return;
      }

      isRunningRef.current = false;
      setTimeout(() => {
        progressRef.current = 0;
        setProgress(0);
        setActiveTab((prev) => (prev + 1) % AI_SIMULATIONS.length);
      }, 400);
    };

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      isRunningRef.current = false;
    };
  }, [isInView, activeTab]);

  const handleTabClick = (index: number) => {
    if (index === activeTab) return;
    setActiveTab(index);
    progressRef.current = 0;
    setProgress(0);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    isRunningRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        padding: 8,
      }}
    >
      <div style={{ marginBottom: 8, flexShrink: 0, paddingLeft: 4 }}>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: \`\${AI_COLOR}80\`, marginBottom: 4 }}>
          AGENTE IA · EN VIVO
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.8)', lineHeight: 1.3 }}>
          Tu sistema comercial trabajando ahora mismo
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: 4,
        marginBottom: 10,
        flexShrink: 0,
      }}>
        {AI_SIMULATIONS.map((sim, index) => {
          const isActive = index === activeTab;
          const Icon = sim.icon;
          return (
            <button
              key={sim.id}
              onClick={() => handleTabClick(index)}
              style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '10px 4px 8px',
                borderRadius: 12,
                background: isActive ? \`\${AI_COLOR}10\` : 'transparent',
                border: \`1px solid \${isActive ? \`\${AI_COLOR}30\` : 'transparent'}\`,
                color: isActive ? 'white' : 'rgba(255,255,255,0.4)',
                transition: 'all 300ms',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              <Icon size={14} style={{ opacity: isActive ? 1 : 0.6 }} />
              <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 500, letterSpacing: '-0.01em' }}>
                {sim.label}
              </span>
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: 2,
                    width: \`\${progress * 100}%\`,
                    background: \`linear-gradient(90deg, \${AI_COLOR}80, \${AI_COLOR})\`,
                  }}
                />
              )}
            </button>
          )
        })}
      </div>

      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ height: '100%' }}
          >
            {activeTab === 0 ? <SimChat isActive={isInView} progress={progress} color={AI_COLOR} /> :
             activeTab === 1 ? <SimLeadsIA isActive={isInView} progress={progress} color={AI_COLOR} /> : 
             activeTab === 2 ? <SimAgenda isActive={isInView} progress={progress} color={AI_COLOR} /> :
             activeTab === 3 ? <SimMetricas isActive={isInView} progress={progress} color={AI_COLOR} /> : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}`;

        lines.splice(startIdx, endIdx - startIdx + 1, newCode);
        fs.writeFileSync(file, lines.join('\n'));
        console.log("Replaced AIScene successfully!");
    } else {
        console.log("End brace not found");
    }
} else {
    console.log("function AIScene bound not found");
}
