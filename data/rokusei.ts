import type {
  RokuseiCycle,
  RokuseiCycleId,
  RokuseiStar,
  RokuseiStarId,
} from '@/types/divination';

// 6つの星のデータ。占星術における6つの惑星の概念から。
// 本サービスは細木数子氏/同名団体の登録商標「六星占術®」とは無関係の独立実装。

export const ROKUSEI_STARS: ReadonlyArray<RokuseiStar> = [
  {
    id: 'saturn',
    nameJa: '土星人',
    nameEn: 'Saturn',
    symbol: '♄',
    element: '土・誠実',
    imagePath: '/rokusei/saturn.webp',
  },
  {
    id: 'venus',
    nameJa: '金星人',
    nameEn: 'Venus',
    symbol: '♀',
    element: '金・愛',
    imagePath: '/rokusei/venus.webp',
  },
  {
    id: 'mars',
    nameJa: '火星人',
    nameEn: 'Mars',
    symbol: '♂',
    element: '火・行動',
    imagePath: '/rokusei/mars.webp',
  },
  {
    id: 'uranus',
    nameJa: '天王星人',
    nameEn: 'Uranus',
    symbol: '♅',
    element: '風・独創',
    imagePath: '/rokusei/uranus.webp',
  },
  {
    id: 'jupiter',
    nameJa: '木星人',
    nameEn: 'Jupiter',
    symbol: '♃',
    element: '木・包容',
    imagePath: '/rokusei/jupiter.webp',
  },
  {
    id: 'mercury',
    nameJa: '水星人',
    nameEn: 'Mercury',
    symbol: '☿',
    element: '水・知性',
    imagePath: '/rokusei/mercury.webp',
  },
];

export function getRokuseiStar(id: RokuseiStarId): RokuseiStar | undefined {
  return ROKUSEI_STARS.find((s) => s.id === id);
}

// 12の運命周期。Claudeにプロンプトとして渡すための短い説明付き。
// 「大殺界」相当の警戒期間は3つ（陰影・停止・減退）。

export const ROKUSEI_CYCLES: ReadonlyArray<RokuseiCycle> = [
  {
    id: 'seed',
    nameJa: '種子',
    description: '新しい始まりの兆し。目立たないが内側で芽吹きが起きている時期',
    isDaisakkai: false,
  },
  {
    id: 'sprout',
    nameJa: '緑生',
    description: '芽が伸びる時期。行動を起こすと吉、種まきから育成へ',
    isDaisakkai: false,
  },
  {
    id: 'bloom',
    nameJa: '立花',
    description: '花が咲く時期。人前に出る活躍が増え、運気が高まる',
    isDaisakkai: false,
  },
  {
    id: 'fragile',
    nameJa: '健弱',
    description: '頂点から休息へ向かう時期。健康と無理のない判断を意識',
    isDaisakkai: false,
  },
  {
    id: 'achieve',
    nameJa: '達成',
    description: '実りを得る時期。これまでの努力が形になりやすい',
    isDaisakkai: false,
  },
  {
    id: 'turmoil',
    nameJa: '乱気',
    description: '気持ちや環境が揺らぐ時期。新しい大きな決断は控えめに',
    isDaisakkai: false,
  },
  {
    id: 'reunion',
    nameJa: '再会',
    description: '人とのつながりが再構築される時期。古い縁が支えになる',
    isDaisakkai: false,
  },
  {
    id: 'wealth',
    nameJa: '財成',
    description: '金運や成果が安定する時期。実利を整える好機',
    isDaisakkai: false,
  },
  {
    id: 'stable',
    nameJa: '安定',
    description: '穏やかな時期。基礎を固めるのに向く',
    isDaisakkai: false,
  },
  {
    id: 'shadow',
    nameJa: '陰影',
    description: '影が差す警戒期。新しい挑戦より既存の整理に向ける',
    isDaisakkai: true,
  },
  {
    id: 'pause',
    nameJa: '停止',
    description: '物事が止まりやすい警戒期。守りを固める時期',
    isDaisakkai: true,
  },
  {
    id: 'decline',
    nameJa: '減退',
    description: 'エネルギーが下降する警戒期。決断を急がず内省を',
    isDaisakkai: true,
  },
];

export function getRokuseiCycle(id: RokuseiCycleId): RokuseiCycle | undefined {
  return ROKUSEI_CYCLES.find((c) => c.id === id);
}
