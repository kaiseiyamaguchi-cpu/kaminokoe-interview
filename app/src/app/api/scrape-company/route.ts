import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI();

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URLが必要です" }, { status: 400 });
    }

    // URLからページ内容を取得
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; KaminokoeBot/1.0)",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "ページの取得に失敗しました" },
        { status: 400 }
      );
    }

    const html = await response.text();

    // HTMLからテキストを抽出（簡易版）
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 10000); // 最大10000文字

    // OpenAI APIでビジョン・ミッションを抽出
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `あなたは企業分析の専門家です。以下のウェブページの内容から、企業のビジョン、ミッション、バリュー、理念、大切にしている価値観を抽出してください。

出力形式：
- 200文字以内で簡潔にまとめる
- 箇条書きではなく、文章で
- 見つからない場合は「情報が見つかりませんでした」と返す`,
        },
        {
          role: "user",
          content: `以下のページ内容から企業理念を抽出してください：\n\n${textContent}`,
        },
      ],
      max_tokens: 300,
    });

    const vision = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ vision });
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json(
      { error: "解析に失敗しました" },
      { status: 500 }
    );
  }
}
