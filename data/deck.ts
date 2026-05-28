import type { Card } from '@/types/tarot';

// Rider–Waite Tarot 78枚。画像は public/cards/{id}.webp（M2で同梱）。
// 出典: Wikimedia Commons (Public Domain) — 詳細は public/cards/LICENSE.txt 参照。

const major: Card[] = [
  {
    id: 'major-00',
    name: '愚者',
    nameEn: 'The Fool',
    arcana: 'major',
    number: 0,
    keywords: {
      upright: ['新しい始まり', '自由', '無邪気', '冒険', '可能性'],
      reversed: ['無謀', '不注意', '優柔不断', 'リスクの無視'],
    },
    imagePath: '/cards/major-00.webp',
  },
  {
    id: 'major-01',
    name: '魔術師',
    nameEn: 'The Magician',
    arcana: 'major',
    number: 1,
    keywords: {
      upright: ['創造', '意志', 'スキル', '集中', '実現力'],
      reversed: ['才能の浪費', '欺瞞', '迷い', '未熟さ'],
    },
    imagePath: '/cards/major-01.webp',
  },
  {
    id: 'major-02',
    name: '女教皇',
    nameEn: 'The High Priestess',
    arcana: 'major',
    number: 2,
    keywords: {
      upright: ['直感', '内なる知恵', '神秘', '静寂'],
      reversed: ['秘密', '混乱', '直感の無視', '表層的'],
    },
    imagePath: '/cards/major-02.webp',
  },
  {
    id: 'major-03',
    name: '女帝',
    nameEn: 'The Empress',
    arcana: 'major',
    number: 3,
    keywords: {
      upright: ['豊かさ', '母性', '創造性', '繁栄', '自然'],
      reversed: ['過保護', '停滞', '依存', '自己中心'],
    },
    imagePath: '/cards/major-03.webp',
  },
  {
    id: 'major-04',
    name: '皇帝',
    nameEn: 'The Emperor',
    arcana: 'major',
    number: 4,
    keywords: {
      upright: ['権威', '安定', '構造', 'リーダーシップ'],
      reversed: ['支配', '頑固', '権力の乱用', '弱さ'],
    },
    imagePath: '/cards/major-04.webp',
  },
  {
    id: 'major-05',
    name: '教皇',
    nameEn: 'The Hierophant',
    arcana: 'major',
    number: 5,
    keywords: {
      upright: ['伝統', '導き', '信念', '学び'],
      reversed: ['反抗', '型破り', '独自路線', '教義への疑い'],
    },
    imagePath: '/cards/major-05.webp',
  },
  {
    id: 'major-06',
    name: '恋人',
    nameEn: 'The Lovers',
    arcana: 'major',
    number: 6,
    keywords: {
      upright: ['愛', '調和', 'パートナーシップ', '選択'],
      reversed: ['不調和', '価値観の衝突', '優柔不断', '別離'],
    },
    imagePath: '/cards/major-06.webp',
  },
  {
    id: 'major-07',
    name: '戦車',
    nameEn: 'The Chariot',
    arcana: 'major',
    number: 7,
    keywords: {
      upright: ['勝利', '意志力', '前進', 'コントロール'],
      reversed: ['暴走', '方向喪失', '挫折', '自制心の欠如'],
    },
    imagePath: '/cards/major-07.webp',
  },
  {
    id: 'major-08',
    name: '力',
    nameEn: 'Strength',
    arcana: 'major',
    number: 8,
    keywords: {
      upright: ['内なる強さ', '勇気', '忍耐', '優しさ'],
      reversed: ['自信喪失', '弱さ', '感情の暴走'],
    },
    imagePath: '/cards/major-08.webp',
  },
  {
    id: 'major-09',
    name: '隠者',
    nameEn: 'The Hermit',
    arcana: 'major',
    number: 9,
    keywords: {
      upright: ['内省', '孤独', '探求', '導き手'],
      reversed: ['孤立', '頑なな引きこもり', '助言の拒絶'],
    },
    imagePath: '/cards/major-09.webp',
  },
  {
    id: 'major-10',
    name: '運命の輪',
    nameEn: 'Wheel of Fortune',
    arcana: 'major',
    number: 10,
    keywords: {
      upright: ['転機', '幸運', 'サイクル', '運命'],
      reversed: ['不運', '停滞', '抵抗できない流れ'],
    },
    imagePath: '/cards/major-10.webp',
  },
  {
    id: 'major-11',
    name: '正義',
    nameEn: 'Justice',
    arcana: 'major',
    number: 11,
    keywords: {
      upright: ['公正', '真実', '法', '因果'],
      reversed: ['不公平', '責任回避', '偏見'],
    },
    imagePath: '/cards/major-11.webp',
  },
  {
    id: 'major-12',
    name: '吊るされた男',
    nameEn: 'The Hanged Man',
    arcana: 'major',
    number: 12,
    keywords: {
      upright: ['視点の転換', '受容', '一時停止', '犠牲'],
      reversed: ['無駄な努力', '停滞', '逃避', '抵抗'],
    },
    imagePath: '/cards/major-12.webp',
  },
  {
    id: 'major-13',
    name: '死神',
    nameEn: 'Death',
    arcana: 'major',
    number: 13,
    keywords: {
      upright: ['終わり', '変容', '再生', '手放し'],
      reversed: ['変化への抵抗', '停滞', '執着'],
    },
    imagePath: '/cards/major-13.webp',
  },
  {
    id: 'major-14',
    name: '節制',
    nameEn: 'Temperance',
    arcana: 'major',
    number: 14,
    keywords: {
      upright: ['調和', '節度', '統合', '癒やし'],
      reversed: ['過剰', 'バランス喪失', '不調和'],
    },
    imagePath: '/cards/major-14.webp',
  },
  {
    id: 'major-15',
    name: '悪魔',
    nameEn: 'The Devil',
    arcana: 'major',
    number: 15,
    keywords: {
      upright: ['束縛', '欲望', '執着', '誘惑'],
      reversed: ['解放', '自由', '気づき'],
    },
    imagePath: '/cards/major-15.webp',
  },
  {
    id: 'major-16',
    name: '塔',
    nameEn: 'The Tower',
    arcana: 'major',
    number: 16,
    keywords: {
      upright: ['激変', '崩壊', '啓示', '解放'],
      reversed: ['崩壊の回避', '内部崩壊', '変化への抵抗'],
    },
    imagePath: '/cards/major-16.webp',
  },
  {
    id: 'major-17',
    name: '星',
    nameEn: 'The Star',
    arcana: 'major',
    number: 17,
    keywords: {
      upright: ['希望', '導き', 'インスピレーション', '癒やし'],
      reversed: ['失望', '不信', '希望の喪失'],
    },
    imagePath: '/cards/major-17.webp',
  },
  {
    id: 'major-18',
    name: '月',
    nameEn: 'The Moon',
    arcana: 'major',
    number: 18,
    keywords: {
      upright: ['不安', '幻想', '潜在意識', '直感'],
      reversed: ['幻想からの解放', '真実の顕現', '霧の晴れ'],
    },
    imagePath: '/cards/major-18.webp',
  },
  {
    id: 'major-19',
    name: '太陽',
    nameEn: 'The Sun',
    arcana: 'major',
    number: 19,
    keywords: {
      upright: ['成功', '喜び', '活力', '明晰さ'],
      reversed: ['一時的な落ち込み', '自信喪失', '誇大'],
    },
    imagePath: '/cards/major-19.webp',
  },
  {
    id: 'major-20',
    name: '審判',
    nameEn: 'Judgement',
    arcana: 'major',
    number: 20,
    keywords: {
      upright: ['再生', '覚醒', '赦し', '使命'],
      reversed: ['自己批判', '後悔', '気づきの拒絶'],
    },
    imagePath: '/cards/major-20.webp',
  },
  {
    id: 'major-21',
    name: '世界',
    nameEn: 'The World',
    arcana: 'major',
    number: 21,
    keywords: {
      upright: ['完成', '達成', '統合', '旅の終わり'],
      reversed: ['未完', '停滞', 'クロージャーの欠如'],
    },
    imagePath: '/cards/major-21.webp',
  },
];

// 小アルカナのキーワード生成: スートのテーマ × 数値の意味
const suitThemes: Record<
  'wands' | 'cups' | 'swords' | 'pentacles',
  {
    nameJa: string;
    nameEn: string;
    domain: string;
  }
> = {
  wands: { nameJa: 'ワンド', nameEn: 'Wands', domain: '情熱と行動' },
  cups: { nameJa: 'カップ', nameEn: 'Cups', domain: '感情と関係' },
  swords: { nameJa: 'ソード', nameEn: 'Swords', domain: '思考と葛藤' },
  pentacles: { nameJa: 'ペンタクル', nameEn: 'Pentacles', domain: '物質と現実' },
};

type MinorMeaning = { upright: string[]; reversed: string[] };

const pipMeanings: Record<
  'wands' | 'cups' | 'swords' | 'pentacles',
  Record<number, MinorMeaning>
> = {
  wands: {
    1: { upright: ['情熱', '新しいエネルギー', 'インスピレーション'], reversed: ['遅延', '意欲低下', '方向性の喪失'] },
    2: { upright: ['計画', '展望', '選択'], reversed: ['ためらい', '視野狭窄', '決断の先送り'] },
    3: { upright: ['展開', '長期視野', '協力'], reversed: ['遅れ', '見込み違い', '孤立'] },
    4: { upright: ['祝祭', '安定', '達成感'], reversed: ['不調和', '一時的不安', '形だけの祝い'] },
    5: { upright: ['競争', '葛藤', '挑戦'], reversed: ['和解', '対立の解消', '無益な争い'] },
    6: { upright: ['勝利', '承認', '名誉'], reversed: ['過信', '一時的成功', '評価の遅れ'] },
    7: { upright: ['防衛', '立場の維持', '勇気'], reversed: ['圧倒される', '譲歩', '消耗'] },
    8: { upright: ['加速', '迅速な動き', 'メッセージ'], reversed: ['遅延', '混乱', '誤伝達'] },
    9: { upright: ['粘り強さ', '備え', '最後の試練'], reversed: ['疲弊', '頑なさ', '消耗'] },
    10: { upright: ['重責', '抱え込み', '達成直前'], reversed: ['手放し', '負担の軽減', '過労'] },
  },
  cups: {
    1: { upright: ['新しい感情', '愛の始まり', '満たし'], reversed: ['感情の閉ざし', '失恋', '空虚'] },
    2: { upright: ['結びつき', '相互理解', 'パートナーシップ'], reversed: ['不和', '気持ちのすれ違い', '別離'] },
    3: { upright: ['祝祭', '友情', '喜びの分かち合い'], reversed: ['過剰', '孤立', '関係の疲れ'] },
    4: { upright: ['倦怠', '内省', '無関心'], reversed: ['再発見', '機会への気づき', '転換'] },
    5: { upright: ['喪失', '後悔', '悲嘆'], reversed: ['受容', '残されたものへの気づき', '癒やし'] },
    6: { upright: ['郷愁', '純粋さ', '思い出'], reversed: ['過去への執着', '幼稚さ', '前に進めない'] },
    7: { upright: ['幻想', '選択肢の多さ', '夢想'], reversed: ['現実直視', '集中', '幻想からの脱出'] },
    8: { upright: ['離脱', '旅立ち', '探求'], reversed: ['未練', '停滞', '中途半端'] },
    9: { upright: ['満足', '願望成就', '幸福感'], reversed: ['虚しさ', '自己満足', '不完全な満たし'] },
    10: { upright: ['家庭の幸福', '調和', '満たされた愛'], reversed: ['家族不和', '理想と現実', '関係の歪み'] },
  },
  swords: {
    1: { upright: ['明晰さ', '突破', '真実'], reversed: ['混乱', '誤った判断', '思考停止'] },
    2: { upright: ['膠着', '判断保留', '均衡'], reversed: ['決断', '感情の解放', '混乱の表面化'] },
    3: { upright: ['悲嘆', '失望', '心の痛み'], reversed: ['回復', '赦し', '癒やしの始まり'] },
    4: { upright: ['休息', '回復', '内省'], reversed: ['過度の活動', '燃え尽き', '休息の拒否'] },
    5: { upright: ['対立', '勝者なき争い', '不和'], reversed: ['和解', '撤退', '対立の終わり'] },
    6: { upright: ['移行', '穏やかな旅', '困難からの脱出'], reversed: ['停滞', '過去に縛られる', '進めない'] },
    7: { upright: ['策略', 'こっそり', '欺瞞'], reversed: ['露見', '告白', '誠実への回帰'] },
    8: { upright: ['制約', '自己束縛', '無力感'], reversed: ['解放', '自由への気づき', '脱出'] },
    9: { upright: ['不安', '悪夢', '心配'], reversed: ['回復', '希望の光', '不安の和らぎ'] },
    10: { upright: ['終焉', '裏切り', '最悪期'], reversed: ['再生', '底を打つ', '新たな夜明け'] },
  },
  pentacles: {
    1: { upright: ['豊かさの種', '機会', '新しい収入'], reversed: ['機会の喪失', '計画倒れ', '物質的不安'] },
    2: { upright: ['バランス', '柔軟性', '優先順位'], reversed: ['過負荷', '不均衡', '混乱'] },
    3: { upright: ['協働', '技能', '評価'], reversed: ['不協和', '低品質', '評価の欠如'] },
    4: { upright: ['保守', '所有', '安定志向'], reversed: ['手放し', '損失', '執着の解放'] },
    5: { upright: ['困窮', '孤立感', '不安'], reversed: ['回復', '助けの到来', '困難からの脱出'] },
    6: { upright: ['寛大さ', '分配', '助け合い'], reversed: ['不公平', '見返り期待', '依存'] },
    7: { upright: ['評価', '忍耐', '長期視点'], reversed: ['焦り', '徒労感', '投資の見直し'] },
    8: { upright: ['修練', '集中', '専門性'], reversed: ['雑な仕事', '集中力欠如', 'マンネリ'] },
    9: { upright: ['自立', '豊かさ', '達成'], reversed: ['見栄', '依存', '満たされぬ豊かさ'] },
    10: { upright: ['遺産', '繁栄', '世代を超えた豊かさ'], reversed: ['家族の不和', '伝統の崩壊', '財の喪失'] },
  },
};

const courtMeanings: Record<
  'page' | 'knight' | 'queen' | 'king',
  Record<'wands' | 'cups' | 'swords' | 'pentacles', MinorMeaning>
> = {
  page: {
    wands: { upright: ['探求心', '冒険の予感', '熱意ある若さ'], reversed: ['気まぐれ', '空回り', '計画性の欠如'] },
    cups: { upright: ['感受性', '創造的な閃き', '優しい知らせ'], reversed: ['未熟な感情', '現実逃避', '気分屋'] },
    swords: { upright: ['鋭い好奇心', '機敏さ', '真実の探求'], reversed: ['詮索', '皮肉', '不誠実'] },
    pentacles: { upright: ['学びの姿勢', '実直さ', '新しい機会'], reversed: ['怠惰', '機会の見落とし', '集中不足'] },
  },
  knight: {
    wands: { upright: ['情熱的な行動', '冒険', '突進'], reversed: ['短気', '無計画', '衝動'] },
    cups: { upright: ['ロマンチック', '理想主義', '誘い'], reversed: ['気まぐれ', '幻滅', '優柔不断'] },
    swords: { upright: ['果断', '迅速な行動', '論理'], reversed: ['攻撃的', '無謀', '横暴'] },
    pentacles: { upright: ['堅実', '責任感', '着実な前進'], reversed: ['頑固', '退屈', '停滞'] },
  },
  queen: {
    wands: { upright: ['情熱と自信', '魅力', '独立心'], reversed: ['嫉妬', '支配的', '不安定'] },
    cups: { upright: ['共感', '直感', '優しさ'], reversed: ['依存', '情緒不安定', '過剰な感情移入'] },
    swords: { upright: ['知性', '冷静な判断', '率直'], reversed: ['辛辣', '冷淡', '皮肉'] },
    pentacles: { upright: ['豊かさを育む', '安心感', '実務能力'], reversed: ['物質主義', '過保護', '消耗'] },
  },
  king: {
    wands: { upright: ['ビジョン', 'リーダーシップ', '影響力'], reversed: ['横暴', '独裁', '短気'] },
    cups: { upright: ['情緒の成熟', '寛容', '思慮深さ'], reversed: ['感情の抑圧', '操作的', '不安定'] },
    swords: { upright: ['知的権威', '公正', '明晰な判断'], reversed: ['冷酷', '独善', '権威の乱用'] },
    pentacles: { upright: ['繁栄', '堅実な成功', '保護者'], reversed: ['強欲', '腐敗', '頑迷'] },
  },
};

const courtMap: Array<{
  key: 'page' | 'knight' | 'queen' | 'king';
  number: number;
  ja: string;
  en: string;
}> = [
  { key: 'page', number: 11, ja: 'ペイジ', en: 'Page' },
  { key: 'knight', number: 12, ja: 'ナイト', en: 'Knight' },
  { key: 'queen', number: 13, ja: 'クイーン', en: 'Queen' },
  { key: 'king', number: 14, ja: 'キング', en: 'King' },
];

const pipNumberJa: Record<number, string> = {
  1: 'エース',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
};

const pipNumberEn: Record<number, string> = {
  1: 'Ace',
  2: 'Two',
  3: 'Three',
  4: 'Four',
  5: 'Five',
  6: 'Six',
  7: 'Seven',
  8: 'Eight',
  9: 'Nine',
  10: 'Ten',
};

function buildMinor(): Card[] {
  const cards: Card[] = [];
  (Object.keys(suitThemes) as Array<'wands' | 'cups' | 'swords' | 'pentacles'>).forEach((suit) => {
    const theme = suitThemes[suit];

    // Ace〜10
    for (let n = 1; n <= 10; n++) {
      const idNum = n.toString().padStart(2, '0');
      const meaning = pipMeanings[suit][n];
      cards.push({
        id: `${suit}-${idNum}`,
        name: `${theme.nameJa}の${pipNumberJa[n]}`,
        nameEn: `${pipNumberEn[n]} of ${theme.nameEn}`,
        arcana: 'minor',
        suit,
        number: n,
        keywords: meaning,
        imagePath: `/cards/${suit}-${idNum}.webp`,
      });
    }

    // Court
    courtMap.forEach((court) => {
      const meaning = courtMeanings[court.key][suit];
      cards.push({
        id: `${suit}-${court.key}`,
        name: `${theme.nameJa}の${court.ja}`,
        nameEn: `${court.en} of ${theme.nameEn}`,
        arcana: 'minor',
        suit,
        number: court.number,
        keywords: meaning,
        imagePath: `/cards/${suit}-${court.key}.webp`,
      });
    });
  });
  return cards;
}

export const DECK: ReadonlyArray<Card> = [...major, ...buildMinor()];

export function getCardById(id: string): Card | undefined {
  return DECK.find((c) => c.id === id);
}
