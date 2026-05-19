import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/** オンボーディング資料の版上げ時に揃える */
export const ONBOARDING_GUIDE_VERSION = 1;

const KAISEI_SEED: Record<string, string> = {
  self_intro: `山口快生と申します。在学中から学生団体や個人で Web サービス開発を行い、IT スタートアップで PM／エンジニアとして経験を積んだのち、株式会社 AccelShift を起業しました。「AI で仕事の生産性を10倍にする」をミッションに、生成 AI 領域でのプロダクト開発と、複数企業へのテクノロジー支援を並行して行っています。直近では就活生向け面接サポートアプリ『うかるAI』をリリースし、毎週機能をアップデートしています。本日はどうぞよろしくお願いいたします。`,
  gakuchika: `学生時代に最も力を入れたのは、未経験から始めた Web サービス開発で、3 名のチームをリードして約 10 万 MAU 規模のサービスを作ったことです。最初は私のコーディング力不足で開発が頓挫しかけましたが、課題を「学習速度・優先順位付け・チーム連携」の 3 点に分解し、毎週の振り返りで改善を回し続けた結果、プロダクトマーケットフィットに到達することができました。この経験から、「不確実な課題でも分解して仮説検証を回せば前進できる」という確信を持っています。`,
  strength: `私の強みは「仮説思考と実装スピードの両立」です。コンサル的に課題を構造化してから手を動かすため、ムダなく結果に近づけます。直近の支援先では、月 20 時間かかっていた業務を、AI 活用とフロー再設計で月 2 時間に短縮しました。具体的には業務全体をマッピングして自動化可能な部分と人間の判断が必要な部分を切り分けたうえで、2 日でプロトタイプを作り検証しました。御社でも新規事業や既存プロセス改善でこの強みを発揮できると考えています。`,
  weakness: `細部のチェックを後回しにしがちな点です。スピードを優先するあまり、ドキュメントの最終確認や品質保証フェーズで漏れが生じることがありました。これに対しては、ひとつはチェックリストをテンプレ化したこと、もうひとつは必ず別のメンバーにクロスレビューを依頼するフローに変えたことで、直近半年間は大きなミスを発生させていません。スピードと品質の両立を意識して動いています。`,
  motivation: `御社を志望する理由は「テクノロジーで世の中の働き方を本質的に変えようとしている姿勢」に強く共感したからです。御社の事業は、表面的な機能追加ではなく、業界に根づいた構造的な課題に向き合っており、私自身が掲げてきた「AI で仕事の生産性を 10 倍にする」というテーマと完全に一致します。これまでに培った仮説思考と高速実装の両軸で、御社の事業の次の飛躍に貢献したいと考えています。`,
  future: `5 年後には御社の主力事業の意思決定を担うポジションに就き、自社内に閉じない事業創出をリードしたいと考えています。10 年後には、御社のアセットを活かしつつ新しい事業領域や海外展開の起点となる存在になることが目標です。そのためにまずは入社後 3 年で現場の解像度を最大限上げ、社内で誰よりも顧客と業界に詳しい人材になることを最初のマイルストーンに置いています。`,
  adversity: `過去最大の困難は、初めて立ち上げたプロジェクトでリリース直前にチームの 8 割が同時に離脱したことです。原因は方針の擦り合わせ不足とコミュニケーション量の不足でした。残ったメンバーで徹底的に振り返り、（1）週次 1on1 の導入、（2）プロジェクトの why を明文化した North Star の策定、（3）役割分担の明確化、を実施しました。結果、半年後には新メンバーを含めて全員が定着し、プロジェクトを完走させることができました。`,
  team: `チームでは「方向性を整理する役割」を担うことが多いです。直近のプロジェクトでも、各メンバーが言語化できていない違和感を引き出し、議論を構造化することで、前に進めなかった意思決定を 1 時間で前進させた経験があります。御社でも、職種を超えたコラボレーションが必要なフェーズで、こうした「議論をまとめて前進させる」役割を発揮できると考えています。`,
  reverse_questions: `ありがとうございます。3 点お伺いさせてください。1 点目は、御社の主力事業で直近 1 年で最も伸びている領域はどこでしょうか。2 点目は、私が配属を希望しているチームで、入社 1 年目に最も成果を出した方はどのような動き方をされていましたか。3 点目は、私のようなバックグラウンドの人材が御社で早期に活躍するために、入社前にキャッチアップしておくと良いことを教えていただけますでしょうか。`,
};

export const seedKaiseiQa = mutation({
  args: {},
  handler: async (ctx) => {
    // email > displayName 「山口快生」 > 最新の userProfile の順で検索
    let profile = await ctx.db
      .query("userProfiles")
      .filter((q) => q.eq(q.field("email"), "kaiseiguchi@gmail.com"))
      .first();

    if (!profile) {
      profile = await ctx.db
        .query("userProfiles")
        .filter((q) => q.eq(q.field("displayName"), "山口快生"))
        .first();
    }

    if (!profile) {
      const all = await ctx.db.query("userProfiles").collect();
      profile = all.sort((a, b) => b._creationTime - a._creationTime)[0] ?? null;
    }

    if (!profile) {
      throw new Error("userProfile が見つかりません。先に Desktop アプリでログインしてください。");
    }

    const userId = profile.userId;
    const now = Date.now();

    // プリセットを ensure
    const existing = await ctx.db
      .query("interviewQaItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const have = new Map<string, typeof existing[number]>();
    for (const row of existing) {
      if (row.presetKey) have.set(row.presetKey, row);
    }

    let inserted = 0;
    let updated = 0;
    for (const row of PRESET_QA_ROWS) {
      const seedAnswer = KAISEI_SEED[row.presetKey] ?? "";
      const existingRow = have.get(row.presetKey);
      if (existingRow) {
        await ctx.db.patch(existingRow._id, {
          answer: seedAnswer,
          updatedAt: now,
        });
        updated++;
      } else {
        await ctx.db.insert("interviewQaItems", {
          userId,
          presetKey: row.presetKey,
          question: row.question,
          answer: seedAnswer,
          sortOrder: row.sortOrder,
          createdAt: now,
          updatedAt: now,
        });
        inserted++;
      }
    }

    return { userId, inserted, updated };
  },
});

/** 最初から並ぶテンプレ想定質問（回答はユーザーが入力） */
export const PRESET_QA_ROWS: {
  presetKey: string;
  sortOrder: number;
  question: string;
}[] = [
  { presetKey: "self_intro", sortOrder: 0, question: "自己紹介をしてください（約1分）" },
  {
    presetKey: "gakuchika",
    sortOrder: 1,
    question: "学生時代に力を入れたことは何ですか？",
  },
  { presetKey: "strength", sortOrder: 2, question: "あなたの強みを教えてください" },
  {
    presetKey: "weakness",
    sortOrder: 3,
    question:
      "あなたの弱みを教えてください。また、それをどのようにカバー・改善していますか？",
  },
  {
    presetKey: "motivation",
    sortOrder: 4,
    question: "弊社への志望理由を教えてください（共通の書きではなく自分の原体験とつなげてください）",
  },
  {
    presetKey: "future",
    sortOrder: 5,
    question: "入社後にやってみたいこと・チャレンジしたいことを教えてください",
  },
  {
    presetKey: "adversity",
    sortOrder: 6,
    question: "困難や挫折をどう乗り越えてきましたか？",
  },
  {
    presetKey: "team",
    sortOrder: 7,
    question: "チームで成果を出した経験を具体的に教えてください（役割・行動・成果）",
  },
  {
    presetKey: "reverse_questions",
    sortOrder: 8,
    question: "この企業の面接で逆質問したいこと・気になることを教えてください",
  },
];

export const listInterviewQa = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }
    const rows = await ctx.db
      .query("interviewQaItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    rows.sort((a, b) => a.sortOrder - b.sortOrder);
    return rows;
  },
});

export const ensureInterviewPresets = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("interviewQaItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const have = new Set(
      existing.map((r) => r.presetKey).filter((k): k is string => Boolean(k))
    );

    const now = Date.now();

    for (const row of PRESET_QA_ROWS) {
      if (have.has(row.presetKey)) continue;
      await ctx.db.insert("interviewQaItems", {
        userId,
        presetKey: row.presetKey,
        question: row.question,
        answer: "",
        sortOrder: row.sortOrder,
        createdAt: now,
        updatedAt: now,
      });
    }

    const again = await ctx.db
      .query("interviewQaItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    again.sort((a, b) => a.sortOrder - b.sortOrder);
    return again;
  },
});

export const updateInterviewQa = mutation({
  args: {
    itemId: v.id("interviewQaItems"),
    answer: v.string(),
    question: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const row = await ctx.db.get(args.itemId);
    if (!row || row.userId !== userId) {
      throw new Error("not found");
    }

    const patch: { answer: string; question?: string; updatedAt: number } = {
      answer: args.answer,
      updatedAt: Date.now(),
    };

    if (args.question !== undefined) {
      if (row.presetKey) {
        throw new Error("テンプレ質問の文言は変更できません（回答のみ編集できます）");
      }
      patch.question = args.question;
    }

    await ctx.db.patch(args.itemId, patch);
    return await ctx.db.get(args.itemId);
  },
});

export const addCustomInterviewQa = mutation({
  args: { question: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("interviewQaItems")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const nextOrder =
      existing.reduce((m, r) => Math.max(m, r.sortOrder), -1) + 1;

    const now = Date.now();
    return await ctx.db.insert("interviewQaItems", {
      userId,
      question: args.question.trim() || "（質問を編集してください）",
      answer: "",
      sortOrder: nextOrder,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const deleteCustomInterviewQa = mutation({
  args: { itemId: v.id("interviewQaItems") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const row = await ctx.db.get(args.itemId);
    if (!row || row.userId !== userId) throw new Error("not found");
    if (row.presetKey) {
      throw new Error("標準セットの質問は削除できません（回答のみ空にできます）");
    }

    await ctx.db.delete(args.itemId);
    return { ok: true };
  },
});

export const listCompanyPreps = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const rows = await ctx.db
      .query("companyInterviewPreps")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    rows.sort((a, b) => b.createdAt - a.createdAt);
    return rows;
  },
});

export const getCompanyPrep = query({
  args: { prepId: v.id("companyInterviewPreps") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const row = await ctx.db.get(args.prepId);
    if (!row || row.userId !== userId) return null;

    return row;
  },
});

export const patchCompanyPrepSections = mutation({
  args: {
    prepId: v.id("companyInterviewPreps"),
    sections: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        content: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const row = await ctx.db.get(args.prepId);
    if (!row || row.userId !== userId) throw new Error("not found");

    await ctx.db.patch(args.prepId, {
      sections: args.sections,
      updatedAt: Date.now(),
    });
    return await ctx.db.get(args.prepId);
  },
});

export const insertCompanyPrep = mutation({
  args: {
    companyName: v.string(),
    companyUrl: v.string(),
    companyVision: v.optional(v.string()),
    analysis: v.optional(v.string()),
    sections: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        content: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    return await ctx.db.insert("companyInterviewPreps", {
      userId,
      companyName: args.companyName.trim(),
      companyUrl: args.companyUrl.trim(),
      companyVision: args.companyVision?.trim(),
      analysis: args.analysis?.trim(),
      sections: args.sections,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const patchCompanyPrepAnalysis = mutation({
  args: {
    prepId: v.id("companyInterviewPreps"),
    analysis: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const prep = await ctx.db.get(args.prepId);
    if (!prep || prep.userId !== userId) throw new Error("not found");
    await ctx.db.patch(args.prepId, {
      analysis: args.analysis,
      updatedAt: Date.now(),
    });
  },
});
