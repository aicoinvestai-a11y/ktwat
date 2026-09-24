/**
 * مشاهد الحركات التوضيحية — خطوتي 🎬
 *
 * كل مشهد يُرسم بـSVG مسطّح (بلا صور خارجية، بلا فيديو ثقيل) على مساحة 360×240،
 * ويتغيّر بحسب رقم الخطوة. الحركة داخل المشهد (قطرات ماء، عجين يُعصر…) أصناف CSS
 * تتوقف تلقائياً في الوضع الهادئ 🌿 وعند تفعيل «تقليل الحركة» في الجهاز.
 */
import type { AnimationKey } from '@/data/animations';

const P = {
  skin: '#f6d2b3',
  skin2: '#e7bd99',
  hair: '#4a3b33',
  blue: '#57ade2',
  blueD: '#318fd0',
  blueL: '#bde0f5',
  mint: '#4dbc8e',
  mintD: '#1a684b',
  sun: '#ffcb48',
  towel: '#ffe087',
  peach: '#fb8f57',
  paper: '#ffffff',
  line: '#d9d3c7',
  wood: '#d8b98a',
  woodD: '#c6a86a',
  steel: '#c2ced9',
  steelD: '#8ba0b5',
  ink: '#26313d',
  soil: '#a97a52',
  soilD: '#8c6242',
  grape: '#a893f8',
};

const arm = (x1: number, y1: number, x2: number, y2: number, w = 8, c = P.skin) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={w} strokeLinecap="round" />
);
const endOf = (x: number, y: number, deg: number, len: number): [number, number] => [
  x + Math.cos((deg * Math.PI) / 180) * len,
  y + Math.sin((deg * Math.PI) / 180) * len,
];

/** تيار ماء نازل مع قطرات متحركة (تتوقف في الوضع الهادئ) */
const Stream = ({ x, y1, y2, w = 10, delay = 0 }: { x: number; y1: number; y2: number; w?: number; delay?: number }) => (
  <g>
    <rect x={x - w / 2} y={y1} width={w} height={y2 - y1} rx={w / 2} fill={P.blueL} opacity={0.9} />
    <circle className="kw-drop" cx={x - 5} cy={y1 + 4} r={3} fill={P.blueD} style={{ animationDelay: `${delay}s` }} />
    <circle className="kw-drop" cx={x + 5} cy={y1 + 8} r={2.4} fill={P.blueD} style={{ animationDelay: `${delay + 0.5}s` }} />
  </g>
);

/** فقاعات صابون */
const Bubbles = ({ x, y, n = 4 }: { x: number; y: number; n?: number }) => (
  <g>
    {Array.from({ length: n }).map((_, i) => (
      <circle
        key={i}
        className="kw-bubble"
        cx={x + (i % 2 === 0 ? -10 : 9) + i * 2}
        cy={y - i * 3}
        r={3 + (i % 3)}
        fill="#ffffff"
        stroke={P.blueL}
        strokeWidth={1.5}
        style={{ animationDelay: `${i * 0.35}s` }}
      />
    ))}
  </g>
);

/** طفل مبسّط: رأس + جسم + ذراعان بزوايا + قدمان */
function Kid({
  x = 96,
  y = 92,
  armR = [25, 46] as [number, number],
  armL = [-25, 46] as [number, number],
  mouth = 'smile' as 'smile' | 'open' | 'flat',
  eyes = 'open' as 'open' | 'closed',
  shirt = P.blue,
  pants = P.blueD,
  hands = P.skin,
}: {
  x?: number;
  y?: number;
  armR?: [number, number];
  armL?: [number, number];
  mouth?: 'smile' | 'open' | 'flat';
  eyes?: 'open' | 'closed';
  shirt?: string;
  pants?: string;
  hands?: string;
}) {
  const sR: [number, number] = [x + 18, y + 32];
  const sL: [number, number] = [x - 18, y + 32];
  const eR = endOf(sR[0], sR[1], armR[0], armR[1]);
  const eL = endOf(sL[0], sL[1], armL[0], armL[1]);
  return (
    <g>
      {arm(sR[0], sR[1], eR[0], eR[1], 8, hands)}
      <circle cx={eR[0]} cy={eR[1]} r={6.5} fill={hands} />
      <line x1={x - 8} y1={y + 70} x2={x - 11} y2={y + 104} stroke={pants} strokeWidth={13} strokeLinecap="round" />
      <line x1={x + 8} y1={y + 70} x2={x + 11} y2={y + 104} stroke={pants} strokeWidth={13} strokeLinecap="round" />
      <rect x={x - 20} y={y + 18} width={40} height={56} rx={16} fill={shirt} />
      {arm(sL[0], sL[1], eL[0], eL[1], 8, hands)}
      <circle cx={eL[0]} cy={eL[1]} r={6.5} fill={hands} />
      <circle cx={x} cy={y} r={22} fill={P.skin} />
      <path d={`M${x - 22} ${y - 1}a22 22 0 0 1 44 0Z`} fill={P.hair} />
      {eyes === 'open' ? (
        <>
          <circle cx={x - 7} cy={y + 2} r={2.6} fill={P.ink} />
          <circle cx={x + 7} cy={y + 2} r={2.6} fill={P.ink} />
        </>
      ) : (
        <>
          <path d={`M${x - 11} ${y + 3}q4 3 8 0`} stroke={P.ink} strokeWidth={2} fill="none" strokeLinecap="round" />
          <path d={`M${x + 3} ${y + 3}q4 3 8 0`} stroke={P.ink} strokeWidth={2} fill="none" strokeLinecap="round" />
        </>
      )}
      {mouth === 'smile' && (
        <path d={`M${x - 7} ${y + 11}q7 6 14 0`} stroke={P.ink} strokeWidth={2.4} fill="none" strokeLinecap="round" />
      )}
      {mouth === 'open' && <ellipse cx={x} cy={y + 13} rx={5} ry={4.2} fill={P.ink} opacity={0.75} />}
      {mouth === 'flat' && <line x1={x - 6} y1={y + 13} x2={x + 6} y2={y + 13} stroke={P.ink} strokeWidth={2.2} strokeLinecap="round" />}
    </g>
  );
}

/** مغسلة بسيطة: سطح + حوض + صنبور */
const Sink = ({ x = 250, y = 132, faucent = true }: { x?: number; y?: number; faucent?: boolean }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x="-86" y="26" width="172" height="14" rx="6" fill={P.steel} />
    <path d="M-58 40h116a12 12 0 0 1 12 12v8a18 18 0 0 1-18 18h-104a18 18 0 0 1-18-18v-8a12 12 0 0 1 12-12Z" fill="#e4eef6" stroke={P.steelD} strokeWidth={2} />
    <path d="M-80 100h160v14H-80Z" fill={P.steelD} opacity={0.35} />
    {faucent && (
      <>
        <rect x="-6" y="-34" width="12" height="34" rx="5" fill={P.steelD} />
        <path d="M0 -34c0-8 26-8 26 10v8" fill="none" stroke={P.steelD} strokeWidth={8} strokeLinecap="round" />
      </>
    )}
  </g>
);

/** قِدر/وعاء */
const Bowl = ({ x, y, w = 110, fill = '#f3ece2' }: { x: number; y: number; w?: number; fill?: string }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M${-w / 2} 0h${w}c-4 30-18 48-${w / 2} 48S${-w / 2 + 4} 30 ${-w / 2} 0Z`} fill={fill} stroke={P.line} strokeWidth={2} />
    <ellipse cx="0" cy="0" rx={w / 2} ry="10" fill="#ffffff" stroke={P.line} strokeWidth={2} />
  </g>
);

/* ————————————————————————— الحركات ————————————————————————— */

function WuduScene({ step }: { step: number }) {
  return (
    <g>
      <Sink x={254} y={132} />
      {step <= 5 || step === 8 ? <Stream x={254} y1={112} y2={168} delay={step * 0.1} /> : null}
      <Kid
        x={104}
        y={84}
        eyes={step === 2 || step === 3 || step === 8 ? 'closed' : 'open'}
        mouth={step === 2 ? 'open' : 'smile'}
        armR={step === 1 ? [8, 52] : step === 4 ? [-12, 46] : step === 5 ? [-6, 74] : step === 6 ? [-52, 40] : step === 7 ? [-70, 34] : step === 8 ? [30, 54] : [-4, 58]}
        armL={step === 1 ? [-8, 52] : step === 4 ? [10, 46] : step === 5 ? [4, 40] : step === 6 ? [-40, 34] : step === 7 ? [-58, 30] : step === 8 ? [-2, 44] : [8, 56]}
      />
      {step === 2 && (
        <>
          <path d="M118 100q10 8 20 2" stroke={P.blueD} strokeWidth={3} fill="none" strokeLinecap="round" />
          <circle className="kw-bubble" cx="128" cy="106" r="3" fill={P.blueL} />
        </>
      )}
      {step === 3 && <circle className="kw-drop" cx="128" cy="98" r="2.6" fill={P.blueD} />}
      {step === 4 && (
        <>
          <path d="M112 96q16 10 32 0" stroke={P.blueL} strokeWidth={4} fill="none" strokeLinecap="round" />
          <circle className="kw-drop" cx="128" cy="118" r="3" fill={P.blueD} />
        </>
      )}
      {step === 5 && (
        <>
          <path d="M150 118q22 6 44 -2" stroke={P.blueL} strokeWidth={4} fill="none" strokeLinecap="round" />
          <circle className="kw-drop" cx="176" cy="128" r="3" fill={P.blueD} />
        </>
      )}
      {step === 6 && <path d="M92 66q36 -10 72 0" stroke={P.blueL} strokeWidth={5} fill="none" strokeLinecap="round" />}
      {step === 7 && (
        <>
          <circle cx={104 - 22} cy={84 + 2} r="5" fill={P.skin2} />
          <circle cx={104 + 22} cy={84 + 2} r="5" fill={P.skin2} />
        </>
      )}
      {step === 8 && <ellipse cx="206" cy="176" rx="20" ry="9" fill={P.skin} />}
      <figcaption className="sr-only" />
    </g>
  );
}

function PrayerScene({ step }: { step: number }) {
  const rug = (
    <g>
      <rect x="104" y="182" width="152" height="34" rx="10" fill={P.grape} opacity={0.35} />
      <rect x="112" y="188" width="136" height="22" rx="7" fill="none" stroke={P.grape} strokeWidth={2} opacity={0.6} />
    </g>
  );
  const arch = (
    <path d="M170 22h20a10 10 0 0 1 10 10v18h-40V32a10 10 0 0 1 10-10Z" fill="none" stroke={P.mintD} strokeWidth={3} opacity={0.35} />
  );
  return (
    <g>
      {arch}
      {rug}
      {step === 1 && (
        <g>
          <Kid x={180} y={78} armR={[-8, 34]} armL={[188, 34]} mouth="flat" />
          <path d="M172 96q8 6 16 0" stroke={P.ink} strokeWidth={2} fill="none" />
        </g>
      )}
      {step === 2 && (
        <g>
          <rect x="150" y="132" width="60" height="46" rx="14" fill={P.blue} transform="rotate(-58 180 155)" />
          <circle cx="214" cy="140" r="20" fill={P.skin} />
          <path d="M194 138a20 20 0 0 1 40 0Z" fill={P.hair} />
          <line x1="146" y1="176" x2="146" y2="188" stroke={P.blueD} strokeWidth={13} strokeLinecap="round" />
          <line x1="166" y1="176" x2="166" y2="188" stroke={P.blueD} strokeWidth={13} strokeLinecap="round" />
        </g>
      )}
      {step === 3 && (
        <g>
          <rect x="140" y="152" width="76" height="30" rx="12" fill={P.blue} />
          <circle cx="220" cy="164" r="19" fill={P.skin} />
          <path d="M201 162a19 19 0 0 1 38 0Z" fill={P.hair} />
          <line x1="140" y1="182" x2="140" y2="186" stroke={P.blueD} strokeWidth={13} strokeLinecap="round" />
        </g>
      )}
      {step === 4 && (
        <g>
          <rect x="150" y="140" width="52" height="42" rx="14" fill={P.blue} />
          <circle cx="180" cy="112" r="20" fill={P.skin} />
          <path d="M160 110a20 20 0 0 1 40 0Z" fill={P.hair} />
          <line x1="200" y1="172" x2="216" y2="184" stroke={P.blueD} strokeWidth={12} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

function HandwashScene({ step }: { step: number }) {
  return (
    <g>
      <Sink x={250} y={132} />
      {step === 1 || step === 4 ? <Stream x={250} y1={112} y2={170} delay={0.2} /> : null}
      <Kid
        x={100}
        y={84}
        armR={step === 5 ? [-30, 52] : [6, 58]}
        armL={step === 5 ? [30, 52] : [-6, 58]}
        mouth="smile"
      />
      {step === 2 && (
        <g>
          <rect x="222" y="150" width="30" height="18" rx="6" fill={P.sun} stroke={P.woodD} strokeWidth={2} transform="rotate(-14 237 159)" />
        </g>
      )}
      {(step === 3 || step === 4) && <Bubbles x={236} y={152} n={5} />}
      {step === 3 && (
        <g className="kw-sway">
          <path d="M224 146q14 -8 28 0" stroke={P.skin} strokeWidth={9} fill="none" strokeLinecap="round" />
        </g>
      )}
      {step === 5 && (
        <g>
          <rect x="196" y="150" width="72" height="34" rx="12" fill={P.towel} />
          <path d="M210 150v34M234 150v34M258 150v34" stroke="#f0d977" strokeWidth="3" />
        </g>
      )}
    </g>
  );
}

function TeethScene({ step }: { step: number }) {
  const open = step !== 4;
  return (
    <g>
      <g transform="translate(180 108)">
        <path d="M-84 0c0-30 38-48 84-48s84 18 84 48v22c0 26-38 44-84 44S-84 48-84 22Z" fill="#fff7f2" stroke={P.line} strokeWidth={2} opacity={open ? 1 : 0.2} />
        {open && (
          <>
            <path d="M-62 -14c14-12 110-12 124 0" stroke={P.line} strokeWidth={2} fill="none" />
            <rect x="-56" y="-16" width="112" height="16" rx="5" fill={P.paper} stroke={P.blueL} strokeWidth={2} />
            <rect x="-58" y="22" width="116" height="16" rx="5" fill={P.paper} stroke={P.blueL} strokeWidth={2} />
            {step === 2 && <path d="M-40 -6h80" stroke={P.mint} strokeWidth={4} strokeDasharray="8 6" strokeLinecap="round" />}
            {step === 3 && <path d="M-40 30h80" stroke={P.mint} strokeWidth={4} strokeDasharray="8 6" strokeLinecap="round" />}
          </>
        )}
      </g>
      {step === 1 && (
        <g>
          <rect x="228" y="70" width="86" height="12" rx="6" fill={P.blue} transform="rotate(-24 271 76)" />
          <rect x="300" y="52" width="26" height="14" rx="4" fill={P.towel} transform="rotate(-24 313 59)" />
          <circle className="kw-bubble" cx="306" cy="58" r="4" fill="#ffffff" />
        </g>
      )}
      {step === 2 && (
        <g>
          <rect x="176" y="62" width="86" height="12" rx="6" fill={P.blue} transform="rotate(14 219 68)" />
          <rect x="252" y="80" width="26" height="14" rx="4" fill={P.towel} transform="rotate(14 265 87)" />
        </g>
      )}
      {step === 3 && (
        <g>
          <rect x="176" y="146" width="86" height="12" rx="6" fill={P.blue} transform="rotate(-14 219 152)" />
          <rect x="252" y="128" width="26" height="14" rx="4" fill={P.towel} transform="rotate(-14 265 135)" />
        </g>
      )}
      {step === 4 && (
        <g>
          <path d="M126 96q54 30 108 0" stroke={P.blueL} strokeWidth={6} fill="none" strokeLinecap="round" />
          <circle className="kw-drop" cx="180" cy="130" r="4" fill={P.blueD} />
        </g>
      )}
    </g>
  );
}

function CombScene({ step }: { step: number }) {
  const tidy = step === 3;
  return (
    <g>
      <g transform="translate(150 118)">
        <circle cx="0" cy="0" r="62" fill={P.skin} />
        <path d="M-62 -6a62 62 0 0 1 124 0Z" fill={P.hair} />
        {[0, 1, 2, 3, 4].map((i) => (
          <path
            key={i}
            d={tidy ? `M${-52 + i * 22} -46q${tidy ? 4 : 10} ${40} ${tidy ? 0 : 6} 62` : `M${-52 + i * 22} -46q12 34 -6 60`}
            stroke={P.hair}
            strokeWidth={7}
            fill="none"
            strokeLinecap="round"
            opacity={0.9}
          />
        ))}
      </g>
      {step === 1 && (
        <g transform="rotate(-30 268 120)">
          <rect x="250" y="112" width="70" height="12" rx="5" fill={P.peach} />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={256 + i * 12} y1="124" x2={256 + i * 12} y2="136" stroke={P.peach} strokeWidth="4" strokeLinecap="round" />
          ))}
        </g>
      )}
      {step === 2 && (
        <g className="kw-sway" transform="rotate(18 150 66)">
          <rect x="120" y="58" width="76" height="12" rx="5" fill={P.peach} />
          {[0, 1, 2, 3, 4].map((i) => (
            <line key={i} x1={126 + i * 13} y1="70" x2={126 + i * 13} y2="82" stroke={P.peach} strokeWidth="4" strokeLinecap="round" />
          ))}
        </g>
      )}
      {step === 3 && (
        <g className="kw-sparkle">
          <circle cx="86" cy="70" r="5" fill={P.sun} />
          <circle cx="234" cy="150" r="4" fill={P.sun} />
        </g>
      )}
    </g>
  );
}

function NailsScene({ step }: { step: number }) {
  return (
    <g>
      {step < 3 && (
        <g transform="translate(180 120)">
          <rect x="-60" y="-10" width="120" height="70" rx="26" fill={P.skin} />
          {[-44, -18, 8, 34].map((fx, i) => (
            <g key={i}>
              <rect x={fx} y="-58" width="22" height="54" rx="11" fill={P.skin} />
              <rect x={fx + 6} y="-64" width="10" height="12" rx="4" fill={P.skin2} />
            </g>
          ))}
          <rect x="-92" y="6" width="40" height="24" rx="12" fill={P.skin} />
        </g>
      )}
      {step === 1 && (
        <g transform="rotate(-18 96 168)">
          <path d="M78 168h34l10 12H78Z" fill={P.steelD} />
          <path d="M112 168l14-8 6 20-10 6Z" fill={P.steel} />
        </g>
      )}
      {step === 2 && (
        <g>
          <path d="M158 66l12-6 8 10-12 6Z" fill={P.steel} />
          <circle className="kw-drop" cx="164" cy="82" r="3" fill={P.skin2} />
        </g>
      )}
      {step === 3 && (
        <g>
          <Sink x={250} y={132} />
          <Stream x={250} y1={112} y2={170} delay={0.1} />
          <g transform="translate(196 140)">
            <rect x="-40" y="-6" width="80" height="46" rx="20" fill={P.skin} />
            <Bubbles x={0} y={-14} n={4} />
          </g>
        </g>
      )}
    </g>
  );
}

function KneadScene({ step }: { step: number }) {
  return (
    <g>
      <rect x="60" y="176" width="240" height="16" rx="8" fill={P.wood} />
      {step <= 3 && (
        <g>
          <Bowl x={180} y={140} w={124} />
          {step === 1 && (
            <g transform="rotate(-28 120 96)">
              <path d="M96 92h44l-6 34h-32Z" fill={P.paper} stroke={P.line} strokeWidth={2} />
              <path d="M104 92h28v10h-28Z" fill={P.sun} />
              <circle className="kw-drop" cx="128" cy="128" r="3" fill="#f3ece2" />
              <circle className="kw-drop" cx="138" cy="130" r="2.4" fill="#f3ece2" style={{ animationDelay: '.4s' }} />
            </g>
          )}
          {step === 2 && (
            <g>
              <path d="M232 82h30l-8 26h-14Z" fill={P.blueL} stroke={P.blue} strokeWidth={2} />
              <Stream x={246} y1={108} y2={140} w={7} delay={0.2} />
            </g>
          )}
          {step === 3 && (
            <g className="kw-sway">
              <line x1="176" y1="96" x2="186" y2="140" stroke={P.woodD} strokeWidth={7} strokeLinecap="round" />
              <ellipse cx="188" cy="142" rx="18" ry="7" fill={P.woodD} />
              <path d="M150 132a34 16 0 0 1 60 0" stroke="#efe4d5" strokeWidth={5} fill="none" />
            </g>
          )}
          {step === 3 && <ellipse cx="182" cy="146" rx="40" ry="12" fill="#f3ece2" opacity={0.9} />}
        </g>
      )}
      {step === 4 && (
        <g>
          <ellipse className="kw-squash" cx="180" cy="164" rx="64" ry="26" fill="#f3ece2" stroke={P.line} strokeWidth={2} />
          <g transform="translate(140 128)">
            <rect x="-34" y="-8" width="68" height="42" rx="18" fill={P.skin} />
          </g>
          <g transform="translate(222 132)">
            <rect x="-34" y="-8" width="68" height="42" rx="18" fill={P.skin} />
          </g>
        </g>
      )}
      {step === 5 && (
        <g>
          <circle cx="112" cy="164" r="18" fill="#f3ece2" stroke={P.line} strokeWidth={2} />
          <circle cx="180" cy="168" r="22" fill="#f3ece2" stroke={P.line} strokeWidth={2} />
          <circle cx="250" cy="164" r="16" fill="#f3ece2" stroke={P.line} strokeWidth={2} />
          <g className="kw-sparkle">
            <circle cx="146" cy="126" r="4" fill={P.sun} />
            <circle cx="216" cy="122" r="3.4" fill={P.sun} />
          </g>
        </g>
      )}
    </g>
  );
}

function CutScene({ step }: { step: number }) {
  const cutGap = step >= 3;
  return (
    <g>
      <rect x="70" y="96" width="170" height="120" rx="8" fill={P.paper} stroke={P.line} strokeWidth={2} transform="rotate(-6 155 156)" />
      <g transform="rotate(-6 155 156)">
        <line x1="86" y1="150" x2="224" y2="150" stroke={P.peach} strokeWidth={2.5} strokeDasharray="7 6" />
        {cutGap && <rect x="86" y="144" width="70" height="12" fill="#ffffff" />}
        {cutGap && <rect x="86" y="150" width="70" height="0" />}
      </g>
      {step === 1 && (
        <g transform="translate(0 0)">
          <rect x="86" y="176" width="76" height="40" rx="18" fill={P.skin} />
        </g>
      )}
      {(step === 2 || step === 3) && (
        <g transform={step === 2 ? 'rotate(-16 250 120)' : 'rotate(-4 250 130)'}>
          <path d="M226 116l58-14 6 12-58 16Z" fill={P.steel} />
          <path d="M226 132l58 14 6-12-58-16Z" fill={P.steelD} />
          <circle cx="232" cy="124" r="9" fill="none" stroke={P.peach} strokeWidth={5} />
          <circle cx="252" cy="124" r="9" fill="none" stroke={P.peach} strokeWidth={5} />
        </g>
      )}
      {step === 4 && (
        <g>
          <rect x="88" y="150" width="60" height="26" rx="6" fill={P.paper} stroke={P.line} strokeWidth={2} />
          <path d="M100 163h36" stroke={P.mint} strokeWidth={3} strokeLinecap="round" />
          <g transform="rotate(-10 288 176)">
            <path d="M268 168l44-10 4 10-44 12Z" fill={P.steel} />
            <path d="M268 180l44 10 4-10-44-12Z" fill={P.steelD} />
          </g>
        </g>
      )}
    </g>
  );
}

function FoldScene({ step }: { step: number }) {
  const w = step === 1 ? 200 : step === 2 || step === 3 ? 100 : 100;
  const h = step === 4 ? 68 : 116;
  const x = 180 - w / 2;
  const y = 160 - h;
  return (
    <g>
      <rect x="70" y="184" width="220" height="12" rx="6" fill={P.wood} opacity={0.5} />
      <rect x={x} y={y} width={w} height={h} rx="6" fill={P.paper} stroke={P.line} strokeWidth={2} />
      {(step === 2 || step === 3) && <line x1={x + w - 2} y1={y} x2={x + w - 2} y2={y + h} stroke={P.peach} strokeWidth={2.5} />}
      {step === 3 && (
        <g transform="translate(150 154)">
          <rect x="-26" y="-6" width="56" height="30" rx="14" fill={P.skin} />
          <path d="M-14 -14q10 -8 20 0" stroke={P.peach} strokeWidth={3} fill="none" strokeLinecap="round" />
        </g>
      )}
      {step === 4 && <line x1={x} y1={y + h - 2} x2={x + w} y2={y + h - 2} stroke={P.peach} strokeWidth={2.5} />}
      {step === 4 && (
        <g className="kw-sparkle">
          <circle cx="246" cy="96" r="4" fill={P.sun} />
          <circle cx="118" cy="86" r="3.4" fill={P.sun} />
        </g>
      )}
    </g>
  );
}

function SweepScene({ step }: { step: number }) {
  return (
    <g>
      <rect x="40" y="186" width="280" height="14" rx="7" fill="#efe9df" />
      {(step === 2 || step === 3) && (
        <g className="kw-sway">
          <line x1="150" y1="72" x2="196" y2="182" stroke={P.woodD} strokeWidth={8} strokeLinecap="round" />
          <path d="M186 182h44l-6 18h-32Z" fill={P.sun} />
        </g>
      )}
      {step === 1 && (
        <g>
          <line x1="168" y1="76" x2="196" y2="180" stroke={P.woodD} strokeWidth={8} strokeLinecap="round" />
          <path d="M186 180h44l-6 18h-32Z" fill={P.sun} />
          <rect x="118" y="96" width="80" height="42" rx="20" fill={P.skin} />
        </g>
      )}
      {step === 2 && (
        <g>
          <path d="M232 190h44" stroke={P.ink} strokeWidth={3} strokeDasharray="6 5" opacity={0.4} />
          <circle className="kw-drop" cx="244" cy="176" r="3" fill={P.ink} opacity={0.25} />
        </g>
      )}
      {step === 3 && (
        <g>
          <path d="M96 178h56l-8 14H104Z" fill={P.steel} />
          <path d="M150 166a26 12 0 0 1 8 12" stroke={P.steelD} strokeWidth={6} fill="none" />
          <circle cx="120" cy="176" r="4" fill={P.ink} opacity={0.2} />
          <circle cx="134" cy="178" r="3" fill={P.ink} opacity={0.2} />
        </g>
      )}
      {step === 4 && (
        <g>
          <rect x="214" y="120" width="66" height="72" rx="10" fill={P.steel} />
          <rect x="208" y="112" width="78" height="14" rx="7" fill={P.steelD} />
          <path d="M226 136h42M226 152h42" stroke="#ffffff" strokeWidth={4} opacity={0.5} />
          <g className="kw-sparkle">
            <circle cx="292" cy="104" r="4" fill={P.sun} />
          </g>
        </g>
      )}
    </g>
  );
}

function WipeScene({ step }: { step: number }) {
  return (
    <g>
      <rect x="76" y="66" width="208" height="120" rx="12" fill="#f3f7fa" stroke={P.steelD} strokeWidth={3} />
      {step >= 2 && (
        <>
          <path d="M96 84h168" stroke="#ffffff" strokeWidth={10} opacity={0.9} />
          <path d="M96 84h168" stroke={P.blueL} strokeWidth={3} opacity={0.6} />
        </>
      )}
      {step === 1 && (
        <g>
          <rect x="152" y="112" width="76" height="44" rx="10" fill={P.towel} />
          <path d="M176 92h28l-6 18h-16Z" fill={P.blue} />
          <circle className="kw-drop" cx="190" cy="112" r="3.4" fill={P.blueD} />
        </g>
      )}
      {step === 2 && (
        <g className="kw-wipe">
          <rect x="150" y="80" width="80" height="46" rx="12" fill={P.towel} />
          <path d="M170 126h40" stroke={P.towel} strokeWidth={3} />
        </g>
      )}
      {step === 3 && (
        <g>
          <rect x="252" y="66" width="34" height="120" rx="8" fill={P.towel} opacity={0.95} />
          <path d="M262 80v92M276 80v92" stroke="#f0d977" strokeWidth={3} />
        </g>
      )}
      {step === 4 && (
        <g>
          <rect x="196" y="150" width="88" height="42" rx="12" fill={P.paper} stroke={P.line} strokeWidth={2} />
          <path d="M206 162h68" stroke={P.towel} strokeWidth={8} strokeLinecap="round" />
          <g className="kw-sparkle">
            <circle cx="150" cy="120" r="5" fill={P.sun} />
            <circle cx="228" cy="96" r="3.6" fill={P.sun} />
          </g>
        </g>
      )}
    </g>
  );
}

function CrossScene({ step }: { step: number }) {
  return (
    <g>
      {/* الشارع */}
      <rect x="0" y="150" width="360" height="70" fill="#e7e2d9" />
      <rect x="0" y="150" width="360" height="8" fill={P.steel} />
      <rect x="0" y="212" width="360" height="8" fill={P.steel} />
      {[70, 150, 230, 310].map((x, i) => (
        <rect key={i} x={x} y="178" width="34" height="7" rx="3" fill={P.sun} />
      ))}
      {/* ممر المشاة */}
      <g>
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={72 + i * 44} y="160" width="26" height="48" rx="4" fill="#ffffff" opacity={0.85} />
        ))}
      </g>
      {/* الرصيف */}
      <rect x="0" y="132" width="360" height="20" fill="#efe9df" />
      {/* إشارة المرور */}
      <g transform="translate(322 60)">
        <rect x="0" y="0" width="22" height="56" rx="7" fill={P.ink} />
        <circle cx="11" cy="14" r="6" fill={step >= 4 ? P.mint : '#6b7a89'} />
        <circle cx="11" cy="42" r="6" fill={step >= 4 ? '#6b7a89' : P.peach} />
      </g>
      {/* الطفل */}
      {step < 5 ? (
        <Kid x={54} y={70} armL={[170, 40]} armR={step === 1 ? [10, 44] : [-14, 40]} mouth="flat" eyes="open" />
      ) : (
        <Kid x={168} y={64} armL={[10, 52]} armR={[-6, 52]} mouth="smile" eyes="open" shirt={P.mint} />
      )}
      {/* اتجاه النظر */}
      {step === 2 && <path d="M78 84q26 10 52 4" stroke={P.blueD} strokeWidth={3} fill="none" strokeLinecap="round" markerEnd="" />}
      {step === 3 && <path d="M30 84q-14 10-20 6" stroke={P.blueD} strokeWidth={3} fill="none" strokeLinecap="round" />}
      {step === 4 && <path d="M78 84q26 10 52 4" stroke={P.blueD} strokeWidth={3} fill="none" strokeLinecap="round" />}
      {step === 5 && (
        <g>
          <rect x="118" y="60" width="76" height="42" rx="20" fill={P.skin} opacity={0.95} />
          <path d="M194 82q26 0 34 16" stroke={P.skin} strokeWidth={12} fill="none" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

function DressScene({ step }: { step: number }) {
  const shoeOn = step >= 2;
  return (
    <g>
      {/* كرسي */}
      <g>
        <rect x="228" y="112" width="76" height="14" rx="6" fill={P.wood} />
        <rect x="234" y="126" width="10" height="46" rx="5" fill={P.woodD} />
        <rect x="288" y="126" width="10" height="46" rx="5" fill={P.woodD} />
        <rect x="228" y="60" width="12" height="54" rx="5" fill={P.wood} />
      </g>
      <rect x="0" y="184" width="360" height="12" fill="#efe9df" />
      <Kid
        x={150}
        y={62}
        armR={step === 4 ? [58, 44] : step === 3 ? [44, 46] : [18, 44]}
        armL={step === 5 ? [-52, 36] : [-18, 46]}
        mouth={step === 5 ? 'smile' : 'flat'}
        shirt={P.grape}
      />
      {/* الحذاء */}
      <g transform={step === 5 ? 'translate(0 0)' : 'translate(0 0)'}>
        <g className={step === 2 ? 'kw-slide' : undefined}>
          <path
            d={shoeOn ? 'M118 186c2-12 16-18 30-16l22 4c8 2 12 6 12 12Z' : 'M168 190c2-10 14-14 26-12l16 4c7 2 10 5 10 8Z'}
            fill={P.blue}
            stroke={P.blueD}
            strokeWidth={2}
          />
          <path d={shoeOn ? 'M120 186h58' : 'M170 190h50'} stroke={P.ink} strokeWidth={3} opacity={0.25} />
          {step === 4 && <rect x="176" y="170" width="34" height="10" rx="5" fill={P.sun} />}
        </g>
      </g>
      {step === 4 && (
        <g>
          <path d="M190 158l10 12" stroke={P.blueD} strokeWidth={3} />
        </g>
      )}
      {step === 5 && (
        <g className="kw-sparkle">
          <circle cx="196" cy="150" r="5" fill={P.sun} />
          <circle cx="118" cy="150" r="3.6" fill={P.sun} />
        </g>
      )}
    </g>
  );
}

function HammerScene({ step }: { step: number }) {
  return (
    <g>
      <rect x="52" y="168" width="256" height="20" rx="8" fill={P.wood} />
      <rect x="52" y="164" width="256" height="6" rx="3" fill={P.woodD} />
      {/* مسمار */}
      <g>
        <rect x="196" y={step >= 3 ? 138 : 128} width="12" height={step >= 3 ? 32 : 42} rx="4" fill={P.steel} />
        <rect x="188" y={step >= 3 ? 132 : 122} width="28" height="10" rx="4" fill={P.steelD} />
      </g>
      {step === 1 && (
        <g>
          <rect x="120" y="120" width="86" height="46" rx="22" fill={P.skin} />
          <g transform="rotate(-24 296 96)">
            <rect x="272" y="88" width="14" height="46" rx="6" fill={P.woodD} />
            <rect x="262" y="132" width="34" height="18" rx="6" fill={P.steelD} />
          </g>
        </g>
      )}
      {step === 2 && (
        <g>
          <ellipse cx="202" cy="150" rx="30" ry="16" fill={P.skin} />
          <g transform="rotate(-52 290 96)">
            <rect x="272" y="88" width="14" height="46" rx="6" fill={P.woodD} />
            <rect x="262" y="132" width="34" height="18" rx="6" fill={P.steelD} />
          </g>
        </g>
      )}
      {step === 3 && (
        <g className="kw-sway">
          <g transform="rotate(-14 280 120)">
            <rect x="262" y="118" width="14" height="46" rx="6" fill={P.woodD} />
            <rect x="252" y="162" width="34" height="18" rx="6" fill={P.steelD} />
          </g>
          <circle className="kw-sparkle" cx="238" cy="146" r="4" fill={P.sun} />
        </g>
      )}
      {step === 4 && (
        <g>
          <path d="M206 158v10" stroke={P.steel} strokeWidth={10} strokeLinecap="round" />
          <g className="kw-sparkle">
            <circle cx="250" cy="130" r="5" fill={P.sun} />
            <circle cx="170" cy="140" r="3.4" fill={P.sun} />
          </g>
        </g>
      )}
    </g>
  );
}

function GlueScene({ step }: { step: number }) {
  return (
    <g>
      <rect x="60" y="176" width="240" height="14" rx="7" fill={P.wood} opacity={0.6} />
      {/* أنبوب الغراء */}
      {step <= 2 && (
        <g transform={step === 2 ? 'rotate(-34 132 120)' : undefined}>
          <rect x="112" y="104" width="40" height="76" rx="12" fill="#f2f6fa" stroke={P.steelD} strokeWidth={2} />
          <rect x="120" y="86" width="24" height="20" rx="6" fill={P.peach} />
          <path d="M132 86l6-14h-12Z" fill={P.steelD} />
        </g>
      )}
      {/* قطعتان */}
      <rect
        x={step >= 3 ? 180 : 186}
        y={step >= 3 ? 150 : 146}
        width="96"
        height="30"
        rx="6"
        fill={P.paper}
        stroke={P.line}
        strokeWidth={2}
        transform={step >= 3 ? 'rotate(-4 228 165)' : undefined}
      />
      <rect
        x={step >= 3 ? 180 : 186}
        y={step >= 3 ? 150 : 146}
        width="96"
        height="30"
        rx="6"
        fill={P.mint}
        opacity={step >= 3 ? 0.45 : 0.25}
        transform={step >= 3 ? 'rotate(6 228 165)' : undefined}
      />
      {step === 2 && (
        <>
          <circle className="kw-drop" cx="136" cy="96" r="3.4" fill="#ffffff" />
          <circle cx="192" cy="140" r="4" fill="#ffffff" stroke={P.blueL} strokeWidth={1.5} />
        </>
      )}
      {step === 3 && (
        <g>
          <rect x="196" y="112" width="78" height="44" rx="20" fill={P.skin} />
        </g>
      )}
      {step === 4 && (
        <g>
          <rect x="228" y="116" width="66" height="40" rx="8" fill="#eef2f6" stroke={P.steelD} strokeWidth={2} />
          <path d="M240 136h42" stroke={P.steelD} strokeWidth={4} strokeLinecap="round" />
          <g className="kw-sparkle">
            <circle cx="196" cy="120" r="4.4" fill={P.sun} />
          </g>
        </g>
      )}
    </g>
  );
}

export const SCENES: Record<AnimationKey, (p: { step: number }) => JSX.Element> = {
  wudu: WuduScene,
  prayer: PrayerScene,
  handwash: HandwashScene,
  teeth: TeethScene,
  comb: CombScene,
  nails: NailsScene,
  knead: KneadScene,
  cut: CutScene,
  fold: FoldScene,
  sweep: SweepScene,
  wipe: WipeScene,
  cross: CrossScene,
  dress: DressScene,
  hammer: HammerScene,
  glue: GlueScene,
};
