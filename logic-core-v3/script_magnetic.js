const fs = require('fs');
const content = fs.readFileSync('src/components/sections/OurServices.tsx', 'utf8');
const lines = content.split('\n');

// Find the line index of "function AutomationScene"
const automationIdx = lines.findIndex(l => l.trimStart().startsWith('function AutomationScene('));
if (automationIdx === -1) { console.error('AutomationScene not found'); process.exit(1); }

const magneticFlowPathComponent = `
type MagneticFlowPathProps = {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  burstWidth: import('framer-motion').MotionValue<number>;
  burstOpacity: import('framer-motion').MotionValue<number>;
  burstFilter: import('framer-motion').MotionValue<string>;
  color: string;
  connectionIndex: number;
};

function MagneticFlowPath({
  fromX,
  fromY,
  toX,
  toY,
  burstWidth,
  burstOpacity,
  burstFilter,
  color,
  connectionIndex,
}: MagneticFlowPathProps) {
  const cx1 = fromX + (toX - fromX) * 0.5;
  const cy1 = fromY;
  const cx2 = fromX + (toX - fromX) * 0.5;
  const cy2 = toY;
  const pathD = \`M \${fromX} \${fromY} C \${cx1} \${cy1}, \${cx2} \${cy2}, \${toX} \${toY}\`;

  const dashOffset = useMotionValue(0);

  useEffect(() => {
    let frame: number;
    let start: number | null = null;
    const speed = 0.4 + connectionIndex * 0.08;
    const animate = (ts: number) => {
      if (!start) start = ts;
      dashOffset.set(-((ts - start) * speed) % 60);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [connectionIndex, dashOffset]);

  return (
    <>
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="0.6"
        strokeOpacity="0.12"
        strokeLinecap="round"
      />
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeDasharray="8 52"
        style={{
          strokeWidth: burstWidth,
          opacity: burstOpacity,
          filter: burstFilter,
          strokeDashoffset: dashOffset,
        }}
      />
    </>
  );
}
`;

const newLines = [
  ...lines.slice(0, automationIdx),
  ...magneticFlowPathComponent.split('\n'),
  ...lines.slice(automationIdx),
];

fs.writeFileSync('src/components/sections/OurServices.tsx', newLines.join('\n'));
console.log('MagneticFlowPath inserted before AutomationScene.');
