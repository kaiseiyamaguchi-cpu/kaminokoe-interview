"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";

type Section = { id: string; title: string; content: string };

const ANALYSIS_MODEL = "gpt-4o";
const QUESTIONS_MODEL = "gpt-4o";

const ANALYSIS_SYSTEM = `あなたは日本の就活・転職市場をよく知る企業分析のプロフェッショナルです。
ユーザーが志望する会社について、面接で深掘りされても答えられるレベルの会社分析を Markdown で書いてください。

## 出力フォーマット (Markdown、上から順に)
## 1. 事業内容と収益モデル
   主要サービス／顧客／収益源／ビジネスモデルの構造。
## 2. ミッション・ビジョン・バリュー
   会社が掲げる思想と、それが具体的に何を意味しているか。
## 3. 業界ポジションと競合
   業界の規模・成長率・競合各社・自社のポジショニング。
## 4. 強み・差別化要因
   なぜこの会社が選ばれているのか。技術・ネットワーク・ブランド等。
## 5. 課題・弱み・リスク
   よくいう「弱み」より構造的な課題（市場成熟度・人材依存・規制など）。
## 6. 直近の動き（成長戦略・ニュース）
   公開情報の範囲で直近の事業展開や注目ニュース。
## 7. 求める人物像・カルチャー
   採用ページ・経営陣の発言からの推測。
## 8. キャリアパス（入社後の成長像）
   新卒／中途別の典型的な伸び方。
## 9. 業界トレンドと会社の戦略の整合性
   業界の追い風／逆風と、それに対する会社の打ち手。

## ルール
- 日本語、です・ます調か体言止めでOK。簡潔に。
- 公開情報からは確認できないことは「公開情報からは確認できないため、面接で確認するとよい」と書く。
- 推測で固有名詞や数字を捏造しない。
- ユーザーが提供した社内メモは積極的に活用してよい。
- 各セクション 3〜6 行が目安。
`;

const QUESTIONS_SYSTEM = `あなたは日本の面接コーチです。会社分析と候補者の自己情報を踏まえ、その会社で実際に聞かれる可能性が高い面接質問と、声に出して読める回答を 8〜12 個生成してください。

## ルール
- 質問 (question フィールド) は **必ず疑問形** で終わること。
  - 例: 「弊社の事業のうち、最も興味を持った点はどこですか？」
  - 例: 「あなたの強みは弊社のどんな場面で活かせると考えますか？」
  - 例: 「同業他社と比較して弊社を選ぶ理由を教えてください。」
- 回答 (answer) は 150〜300 文字、日本語、です・ます調、声に出してそのまま読める文章。
- 回答は会社分析の事実と、候補者ドラフトの事実を組み合わせて書く。事実を捏造してはいけない。
- 候補者ドラフトに該当情報がない場合は、ぼかさず「自分の経験＋会社の理念との接続」で答える方向で書く。
- 必ず会社の固有要素 (事業領域・ミッション・カルチャーなど) を 1 箇所以上織り込む。
- 自己紹介系・志望動機系・ガクチカ系・強み弱み系・困難系・チームワーク系・将来系・逆質問 (これだけ「最後に質問はありますか？」など) を網羅。

## 出力フォーマット (JSON のみ)
{
  "questions": [
    { "question": "...", "answer": "..." },
    ...
  ]
}
`;

export const generateCompanyPrep = action({
  args: {
    companyName: v.string(),
    companyVision: v.optional(v.string()),
    qaItems: v.array(
      v.object({
        question: v.string(),
        answer: v.string(),
      }),
    ),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{ analysis: string; sections: Section[] }> => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error("Not authenticated");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not configured");
    if (!args.companyName.trim()) throw new Error("会社名が必要です");

    // ---------- Phase 1: 会社分析 ----------
    const analysisPrompt =
      `会社名: ${args.companyName.trim()}\n` +
      (args.companyVision?.trim()
        ? `社内メモ・参考情報:\n${args.companyVision.trim()}\n`
        : "社内メモ: なし\n");

    const analysisRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: ANALYSIS_MODEL,
        messages: [
          { role: "system", content: ANALYSIS_SYSTEM },
          { role: "user", content: analysisPrompt },
        ],
        max_tokens: 3000,
        temperature: 0.4,
      }),
    });
    if (!analysisRes.ok) {
      const txt = await analysisRes.text();
      throw new Error(`OpenAI analysis ${analysisRes.status}: ${txt}`);
    }
    const analysisJson = (await analysisRes.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const analysis = (analysisJson.choices[0]?.message?.content || "").trim();
    if (!analysis) throw new Error("会社分析の生成に失敗しました");

    // ---------- Phase 2: 想定質問 + 回答 ----------
    const qaBlock = args.qaItems
      .filter((x) => x.answer?.trim())
      .map((x) => `Q: ${x.question}\nA: ${x.answer.trim()}`)
      .join("\n---\n");

    const questionsUser =
      `## 会社分析\n${analysis}\n\n` +
      `## 候補者プロフィール (一問一答メモ)\n${qaBlock || "（メモなし）"}\n`;

    const questionsRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: QUESTIONS_MODEL,
        messages: [
          { role: "system", content: QUESTIONS_SYSTEM },
          { role: "user", content: questionsUser },
        ],
        response_format: { type: "json_object" },
        max_tokens: 4000,
        temperature: 0.6,
      }),
    });
    if (!questionsRes.ok) {
      const txt = await questionsRes.text();
      throw new Error(`OpenAI questions ${questionsRes.status}: ${txt}`);
    }
    const questionsJson = (await questionsRes.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const raw = questionsJson.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw) as {
      questions?: Array<{ question?: string; answer?: string }>;
    };

    const list = parsed.questions ?? [];
    const sections: Section[] = list
      .filter(
        (s): s is { question: string; answer: string } =>
          typeof s.question === "string" &&
          typeof s.answer === "string" &&
          s.question.trim().length > 0 &&
          s.answer.trim().length > 0,
      )
      .map((s, idx) => {
        let q = s.question.trim();
        // 疑問形でなければ末尾に「？」を補う
        if (!/[?？]$|ですか[。]?$|ますか[。]?$|ください[。]?$|でしょうか[。]?$/.test(q)) {
          q = q.replace(/[。]$/, "") + "？";
        }
        return {
          id: `q${idx}-${Date.now()}`,
          title: q,
          content: s.answer.trim(),
        };
      });

    if (sections.length === 0) throw new Error("想定質問の生成に失敗しました");

    return { analysis, sections };
  },
});

// gpt-4o → gpt-4o-mini で TTL を 1/2 以下に。
// suggestion の出始めスピード優先。品質差はカンペ用途なら許容範囲。
const ANSWER_MODEL = "gpt-4o-mini";

const ANSWER_SYSTEM = `あなたは、面接を受けている候補者本人の代わりに、その場で口頭で答える「カンペ」を出力する AI です。

## 絶対ルール
- 出力は候補者本人が一人称（私は…）で、声に出して読める平叙文。
- 質問形を含めない（？／〜ですか／〜ますか／〜ください／〜お聞かせ／〜お伺いしたい／〜ご教示）。
- 候補者を二人称で扱わない（「山口様の…」「あなたの…」禁止）。
- 候補者プロフィール／会話履歴の事実を尊重し、捏造しない。
- 150〜300 字。

## 回答ロジック (上から順に試す)
1. 面接官の質問が「事前準備の想定質問対応集」に **意味的に近いものがあれば**、その回答を **ほぼそのまま** ベースにする（質問の角度に合わせて言い回しのみ微調整）。
2. 部分的に近い／組み合わせれば答えられるなら、複数の準備を骨子に組み合わせる。
3. どれにも該当しなければ、プロフィール+企業分析+会話履歴から自分の言葉で組み立てる。

## 出力フォーマット (JSON のみ)
{
  "matched_prep_id": "...のid もしくは null",
  "used_strategy": "retrieved" | "adapted" | "generated_fresh",
  "answer": "本文（質問形を含まないこと）"
}
`;

export const generateAnswer = action({
  args: {
    question: v.string(),
    prepSections: v.array(
      v.object({
        id: v.string(),
        title: v.string(),
        content: v.string(),
      }),
    ),
    profile: v.object({
      displayName: v.optional(v.string()),
      companyName: v.optional(v.string()),
      companyVision: v.optional(v.string()),
      analysis: v.optional(v.string()),
      strengths: v.optional(v.string()),
      experience: v.optional(v.string()),
      motivation: v.optional(v.string()),
    }),
    conversationLog: v.array(
      v.object({
        source: v.union(v.literal("interviewer"), v.literal("candidate")),
        text: v.string(),
      }),
    ),
  },
  handler: async (
    ctx,
    args,
  ): Promise<{
    matched_prep_id: string | null;
    used_strategy: "retrieved" | "adapted" | "generated_fresh";
    answer: string;
  }> => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error("Not authenticated");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

    const prepBlock = args.prepSections.length
      ? args.prepSections
          .map(
            (s) =>
              `[id:${s.id}] Q: ${s.title}\nA: ${s.content}`,
          )
          .join("\n\n---\n\n")
      : "（事前準備なし）";

    const profileBlock = [
      args.profile.displayName ? `候補者名: ${args.profile.displayName}` : null,
      args.profile.companyName ? `志望: ${args.profile.companyName}` : null,
      args.profile.strengths ? `強み: ${args.profile.strengths}` : null,
      args.profile.experience ? `ガクチカ: ${args.profile.experience}` : null,
      args.profile.motivation ? `志望理由: ${args.profile.motivation}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const historyBlock = args.conversationLog.length
      ? args.conversationLog
          .map((t) => `[${t.source === "interviewer" ? "面接官" : "候補者"}] ${t.text}`)
          .join("\n")
      : "（履歴なし）";

    const userMsg =
      `## 事前準備の想定質問対応集（最優先で参照）\n${prepBlock}\n\n` +
      (args.profile.analysis
        ? `## 会社分析\n${args.profile.analysis}\n\n`
        : "") +
      `## 候補者プロフィール（フォールバック）\n${profileBlock}\n\n` +
      `## 直近の会話履歴\n${historyBlock}\n\n` +
      `## 今の面接官の質問\n${args.question}`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: ANSWER_MODEL,
        messages: [
          { role: "system", content: ANSWER_SYSTEM },
          { role: "user", content: userMsg },
        ],
        response_format: { type: "json_object" },
        max_tokens: 400,
        temperature: 0.4,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`OpenAI answer ${res.status}: ${txt}`);
    }

    const data = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const raw = data.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw) as {
      matched_prep_id?: string | null;
      used_strategy?: string;
      answer?: string;
    };

    let answer = (parsed.answer ?? "").trim();
    // 念のためサニタイズ: 質問形が末尾にあれば置換
    answer = answer.replace(/(\?|？|教えてください|お聞かせください|お伺いしたいです|ご教示ください)。?$/g, "。");

    const strategy =
      parsed.used_strategy === "retrieved" ||
      parsed.used_strategy === "adapted" ||
      parsed.used_strategy === "generated_fresh"
        ? parsed.used_strategy
        : "generated_fresh";

    return {
      matched_prep_id: parsed.matched_prep_id ?? null,
      used_strategy: strategy,
      answer,
    };
  },
});

// ─────────────────────────────────────────────────────────
// AI 下書き生成: プロフィール + キーワードから一問一答の下書きを作る
// ─────────────────────────────────────────────────────────

const DRAFT_MODEL = "gpt-4o-mini";

const DRAFT_SYSTEM = `あなたは日本の面接コーチです。候補者の基本プロフィールと、ユーザーが指定した質問・キーワードから、面接で口頭で答えられる「回答の下書き」を作ります。

## ルール
- 150〜300 字、日本語、です・ます調。
- 自分(候補者)の視点で書く。「私は〜」など一人称。
- 質問文にしない。断定で締める。
- プロフィールから推測できないことは「（あなたの具体的なエピソードをここに）」のようなプレースホルダーで残し、ユーザーが埋められる形にする。
- キーワードが渡されたら最優先で活用し、骨子を組み立てる。
- 出力フォーマット: { "answer": "..." } の JSON のみ。
`;

export const generateQaDraft = action({
  args: {
    question: v.string(),
    keywords: v.optional(v.string()),
    profile: v.object({
      displayName: v.optional(v.string()),
      university: v.optional(v.string()),
      faculty: v.optional(v.string()),
      graduationYear: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args): Promise<{ answer: string }> => {
    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error("Not authenticated");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

    const profileBlock = [
      args.profile.displayName ? `氏名: ${args.profile.displayName}` : null,
      args.profile.university ? `大学: ${args.profile.university}` : null,
      args.profile.faculty ? `学部: ${args.profile.faculty}` : null,
      args.profile.graduationYear ? `卒年: ${args.profile.graduationYear}` : null,
    ]
      .filter(Boolean)
      .join("\n") || "（プロフィール未入力）";

    const userMsg =
      `## 質問\n${args.question}\n\n` +
      `## 候補者プロフィール\n${profileBlock}\n\n` +
      (args.keywords?.trim()
        ? `## キーワード・骨子\n${args.keywords.trim()}\n\n`
        : "## キーワード\n（未指定。プロフィールから自然に組み立ててください）\n\n") +
      `→ 上記をもとに、150〜300字の回答下書きを JSON で出力してください。`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: DRAFT_MODEL,
        messages: [
          { role: "system", content: DRAFT_SYSTEM },
          { role: "user", content: userMsg },
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
        temperature: 0.5,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`OpenAI draft ${res.status}: ${txt}`);
    }

    const data = (await res.json()) as {
      choices: Array<{ message: { content: string } }>;
    };
    const raw = data.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw) as { answer?: string };
    return { answer: (parsed.answer ?? "").trim() };
  },
});
