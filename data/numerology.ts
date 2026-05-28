import type { LifePathNumber } from '@/types/divination';

// 各ライフパスナンバーの基本テーマ。Claude にプロンプトとして渡し、解釈の幅を統制する。

interface LifePathProfile {
  number: LifePathNumber;
  title: string;
  shortDescription: string;
  keywords: {
    strengths: string[];
    challenges: string[];
  };
}

export const LIFE_PATH_PROFILES: ReadonlyArray<LifePathProfile> = [
  {
    number: 1,
    title: '開拓者',
    shortDescription: '独立心と先駆性。自分の道を切り開くリーダー。',
    keywords: {
      strengths: ['独立心', '創始力', '決断力', 'リーダーシップ', '勇気'],
      challenges: ['頑固さ', '孤立しがち', '焦り', '周囲への配慮不足'],
    },
  },
  {
    number: 2,
    title: '調停者',
    shortDescription: '繊細な共感力と協調性。人と人をつなぐ橋渡し役。',
    keywords: {
      strengths: ['共感', '協調', '優しさ', '調整力', '繊細な感受性'],
      challenges: ['優柔不断', '依存', '自己主張の弱さ', '気を遣いすぎ'],
    },
  },
  {
    number: 3,
    title: '表現者',
    shortDescription: '明るさと創造性。場を華やがせるクリエイター。',
    keywords: {
      strengths: ['創造性', '明るさ', '社交性', '表現力', '楽観'],
      challenges: ['浅さ', '飽きっぽさ', '感情の波', '責任回避'],
    },
  },
  {
    number: 4,
    title: '建設者',
    shortDescription: '堅実と忍耐。一歩ずつ確かなものを積み上げる職人。',
    keywords: {
      strengths: ['誠実', '勤勉', '安定感', '組織力', '忍耐'],
      challenges: ['頑なさ', '変化への抵抗', '完璧主義', '柔軟性の欠如'],
    },
  },
  {
    number: 5,
    title: '冒険者',
    shortDescription: '自由と変化を求める旅人。多彩な経験で学ぶ。',
    keywords: {
      strengths: ['自由', '好奇心', '適応力', '行動力', '多才'],
      challenges: ['落ち着きのなさ', '無責任', '飽きっぽさ', '刹那的'],
    },
  },
  {
    number: 6,
    title: '養育者',
    shortDescription: '愛と責任感。家族やコミュニティを支える温かい人。',
    keywords: {
      strengths: ['愛情', '責任感', '美意識', '奉仕', '調和'],
      challenges: ['過保護', '自己犠牲', '完璧主義', '介入しすぎ'],
    },
  },
  {
    number: 7,
    title: '探求者',
    shortDescription: '内省と知性。物事の本質を見極める研究者。',
    keywords: {
      strengths: ['知性', '洞察力', '直感', '専門性', '精神性'],
      challenges: ['孤立', '懐疑的', '冷淡に見られる', '内に閉じる'],
    },
  },
  {
    number: 8,
    title: '実現者',
    shortDescription: '野心と実行力。物質と精神の両面で成功を築く力。',
    keywords: {
      strengths: ['野心', '実行力', '統率力', '現実感覚', 'バランス'],
      challenges: ['権威主義', '物質偏重', 'ワーカホリック', '支配的'],
    },
  },
  {
    number: 9,
    title: '博愛者',
    shortDescription: '広い視野と理想。世界全体に貢献しようとする魂。',
    keywords: {
      strengths: ['理想主義', '寛容', '芸術性', '献身', '広い視野'],
      challenges: ['感情の浮き沈み', '夢想的', '自己犠牲', '理想と現実の乖離'],
    },
  },
  {
    number: 11,
    title: '霊感のメッセンジャー',
    shortDescription: '鋭い直感と理想。光と影の両方を持つ精神性の持ち主。',
    keywords: {
      strengths: ['直感', 'インスピレーション', '高い理想', '影響力'],
      challenges: ['神経の繊細さ', '理想と現実の落差', '感情の不安定', '燃え尽き'],
    },
  },
  {
    number: 22,
    title: 'マスタービルダー',
    shortDescription: '大きな夢を現実に変える力。理想を形にする建築家。',
    keywords: {
      strengths: ['壮大なビジョン', '実現力', 'カリスマ', '実用性'],
      challenges: ['プレッシャー', '完璧主義', '責任の重さ', '自分への過信'],
    },
  },
  {
    number: 33,
    title: '愛の教師',
    shortDescription: '無条件の愛と奉仕。人類への深い慈愛を体現する稀有な魂。',
    keywords: {
      strengths: ['無条件の愛', '癒やし', '深い思いやり', '献身'],
      challenges: ['自己犠牲', '感情の重さ', '使命感の重圧', '現実逃避'],
    },
  },
];

export function getLifePathProfile(n: LifePathNumber): LifePathProfile {
  const found = LIFE_PATH_PROFILES.find((p) => p.number === n);
  if (!found) {
    throw new Error(`Unknown life path number: ${n}`);
  }
  return found;
}
