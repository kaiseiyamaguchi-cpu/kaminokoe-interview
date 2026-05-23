"use client";

import { useEffect, useState } from "react";
import { useConvexAuth, useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { AuthForm } from "@/components/AuthForm";
import { Shell } from "@/components/Shell";

type QaItem = {
  _id: Id<"interviewQaItems">;
  question: string;
  answer: string;
  presetKey?: string;
  sortOrder: number;
};

export default function QaPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[color:var(--text-dim)] text-sm">
        読み込み中...
      </div>
    );
  }
  if (!isAuthenticated) return <AuthForm />;
  return <QaEditor />;
}

function QaEditor() {
  const profile = useQuery(api.users.getProfile);
  const items = useQuery(api.interviewPrep.listInterviewQa);
  const ensurePresets = useMutation(api.interviewPrep.ensureInterviewPresets);
  const addCustom = useMutation(api.interviewPrep.addCustomInterviewQa);

  const [seeded, setSeeded] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (!seeded && items !== undefined && items.length === 0) {
      void ensurePresets({}).then(() => setSeeded(true));
    }
  }, [items, seeded, ensurePresets]);

  useEffect(() => {
    if (items && items.length > 0 && !selectedId) {
      setSelectedId(items[0]._id);
    }
  }, [items, selectedId]);

  const selectedItem = items?.find((i) => i._id === selectedId) ?? null;
  const filledCount = items?.filter((i) => i.answer.trim().length > 0).length ?? 0;
  const totalCount = items?.length ?? 0;

  return (
    <Shell active="qa">
      <div className="mb-4">
        <h1 className="text-xl font-bold">想定問答</h1>
        <p className="text-[12px] text-[color:var(--text-mute)] mt-1">
          ここで答えた内容がAIの回答の下敷きになります。記入率が高いほど面接サポートの精度が上がります。
        </p>
      </div>

      {totalCount > 0 && (
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-1.5 bg-[color:var(--bg3)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
              style={{ width: `${(filledCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="text-xs text-[color:var(--text-dim)] tabular whitespace-nowrap">
            {filledCount}/{totalCount} 記入済み
          </span>
        </div>
      )}

      <div className="flex gap-5 min-h-[480px]">
        {/* 左: 質問リスト */}
        <div className="w-[280px] shrink-0 space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)] hidden md:block">
          {items === undefined && (
            <p className="text-xs text-[color:var(--text-mute)] py-4">読み込み中...</p>
          )}
          {items?.map((item) => {
            const filled = item.answer.trim().length > 0;
            const active = item._id === selectedId;
            return (
              <button
                key={item._id}
                onClick={() => setSelectedId(item._id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-[13px] leading-snug transition-colors ${
                  active
                    ? "bg-[color:var(--accent-bg)] border border-[color:var(--accent)]/40 text-[color:var(--text)]"
                    : "bg-[color:var(--bg2)] border border-transparent hover:border-[color:var(--line2)] text-[color:var(--text-dim)]"
                }`}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={`mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full ${
                      filled ? "bg-[color:var(--success)]" : "bg-[color:var(--text-mute)]"
                    }`}
                  />
                  <span className="flex-1 line-clamp-2">{item.question}</span>
                </div>
                <span className="block text-[10px] text-[color:var(--text-mute)] mt-1 ml-3.5">
                  {filled ? `${item.answer.length}字` : "未記入"}
                </span>
              </button>
            );
          })}

          <button
            onClick={() => addCustom({ question: "（質問を編集してください）" })}
            className="w-full rounded-lg border border-dashed border-[color:var(--line2)] bg-transparent py-2.5 text-xs text-[color:var(--text-mute)] hover:bg-[color:var(--bg2)] transition"
          >
            ＋ 自由質問を追加
          </button>
        </div>

        {/* 右: 回答エディタ */}
        <div className="flex-1 min-w-0">
          {/* モバイル: アコーディオン表示 */}
          <div className="md:hidden space-y-2">
            {items?.map((item) => (
              <MobileQaCard
                key={item._id}
                item={item as QaItem}
                profile={profile}
              />
            ))}
            <button
              onClick={() => addCustom({ question: "（質問を編集してください）" })}
              className="w-full rounded-xl border border-dashed border-[color:var(--line2)] bg-transparent py-3 text-xs text-[color:var(--text-mute)] hover:bg-[color:var(--bg2)] transition"
            >
              ＋ 自由質問を追加
            </button>
          </div>

          {/* デスクトップ: 選択中の回答エディタ */}
          <div className="hidden md:block">
            {selectedItem ? (
              <AnswerEditor
                key={selectedItem._id}
                item={selectedItem as QaItem}
                profile={profile}
              />
            ) : (
              <div className="flex items-center justify-center h-[400px] text-sm text-[color:var(--text-mute)]">
                左の一覧から質問を選んでください
              </div>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function AnswerEditor({
  item,
  profile,
}: {
  item: QaItem;
  profile: { displayName?: string; university?: string; faculty?: string; graduationYear?: string } | null | undefined;
}) {
  const updateItem = useMutation(api.interviewPrep.updateInterviewQa);
  const deleteCustom = useMutation(api.interviewPrep.deleteCustomInterviewQa);
  const generateDraft = useAction(api.interviewPrepAi.generateQaDraft);

  const [answerDraft, setAnswerDraft] = useState(item.answer);
  const [questionDraft, setQuestionDraft] = useState(item.question);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [keywords, setKeywords] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  useEffect(() => {
    setAnswerDraft(item.answer);
    setQuestionDraft(item.question);
    setSavedAt(null);
    setKeywords("");
    setGenerateError(null);
  }, [item._id, item.answer, item.question]);

  const saveAnswer = async () => {
    if (answerDraft === item.answer) return;
    setSaving(true);
    try {
      await updateItem({ itemId: item._id, answer: answerDraft });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  const saveQuestion = async () => {
    if (item.presetKey || questionDraft === item.question) return;
    setSaving(true);
    try {
      await updateItem({ itemId: item._id, answer: item.answer, question: questionDraft });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateError(null);
    try {
      const result = await generateDraft({
        question: item.question,
        keywords: keywords.trim() || undefined,
        profile: {
          displayName: profile?.displayName ?? undefined,
          university: profile?.university ?? undefined,
          faculty: profile?.faculty ?? undefined,
          graduationYear: profile?.graduationYear ?? undefined,
        },
      });
      if (result.answer) {
        setAnswerDraft(result.answer);
        await updateItem({ itemId: item._id, answer: result.answer });
        setSavedAt(Date.now());
      }
    } catch (e) {
      setGenerateError(e instanceof Error ? e.message : String(e));
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("この質問を削除しますか？")) return;
    await deleteCustom({ itemId: item._id });
  };

  const isCustom = !item.presetKey;
  const charCount = answerDraft.trim().length;

  return (
    <div className="bg-[color:var(--bg2)] border border-[color:var(--line)] rounded-2xl p-6">
      {/* 質問ヘッダー */}
      <div className="mb-4">
        {isCustom ? (
          <input
            type="text"
            value={questionDraft}
            onChange={(e) => setQuestionDraft(e.target.value)}
            onBlur={saveQuestion}
            className="w-full bg-transparent border-b border-[color:var(--line2)] text-base font-semibold text-[color:var(--text)] pb-2 outline-none focus:border-[color:var(--accent)]"
            placeholder="質問を入力"
          />
        ) : (
          <h2 className="text-base font-semibold text-[color:var(--text)]">
            {item.question}
          </h2>
        )}
      </div>

      {/* 回答テキストエリア */}
      <textarea
        value={answerDraft}
        onChange={(e) => setAnswerDraft(e.target.value)}
        onBlur={saveAnswer}
        rows={10}
        placeholder="面接で声に出して読める回答を書いてください（150〜300字が目安）"
        className="w-full resize-none rounded-xl border border-[color:var(--line2)] bg-[color:var(--bg)] px-4 py-3 text-sm text-[color:var(--text)] leading-relaxed outline-none focus:border-[color:var(--accent)] transition"
      />

      {/* 文字数 + ステータス */}
      <div className="flex items-center justify-between mt-2 text-[11px] text-[color:var(--text-mute)]">
        <span className="tabular">
          {charCount}字
          {charCount > 0 && charCount < 150 && " ・ もう少し詳しく書くと効果的です"}
          {charCount >= 150 && charCount <= 300 && " ・ 適切な長さです"}
          {charCount > 300 && " ・ 少し長めです"}
        </span>
        <span>
          {saving ? "保存中..." : savedAt ? "保存済み" : "編集を離れると自動保存"}
        </span>
      </div>

      {/* AI下書き生成 */}
      <div className="mt-5 rounded-xl border border-[color:var(--accent)]/20 bg-[color:var(--accent-bg)] p-4">
        <p className="text-xs font-medium text-[color:var(--accent2)] mb-3">
          AI で下書きを生成
        </p>
        <input
          type="text"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="キーワード・骨子（例: チームリード、10万MAU、課題分解）"
          className="w-full rounded-lg border border-[color:var(--line2)] bg-[color:var(--bg)] px-3 py-2 text-sm text-[color:var(--text)] outline-none focus:border-[color:var(--accent)] mb-3"
        />
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 py-2.5 text-sm font-medium text-white hover:brightness-110 disabled:opacity-40 transition"
        >
          {generating
            ? "生成中..."
            : answerDraft.trim()
            ? "下書きを上書き生成"
            : "下書きを生成"}
        </button>
        {generateError && (
          <p className="text-xs text-[color:var(--error)] mt-2">{generateError}</p>
        )}
        <p className="text-[10px] text-[color:var(--text-mute)] mt-2">
          プロフィール（大学・学部）とキーワードから下書きを作ります。生成後に自由に編集できます。
        </p>
      </div>

      {/* 削除ボタン（カスタム質問のみ） */}
      {isCustom && (
        <div className="mt-4 pt-4 border-t border-[color:var(--line)]">
          <button
            onClick={handleDelete}
            className="text-xs text-[color:var(--error)] hover:bg-[color:var(--error)]/10 rounded-lg px-3 py-1.5 transition"
          >
            この質問を削除
          </button>
        </div>
      )}
    </div>
  );
}

function MobileQaCard({
  item,
  profile,
}: {
  item: QaItem;
  profile: { displayName?: string; university?: string; faculty?: string; graduationYear?: string } | null | undefined;
}) {
  const [open, setOpen] = useState(false);
  const filled = item.answer.trim().length > 0;

  return (
    <div className="bg-[color:var(--bg2)] border border-[color:var(--line)] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start gap-2.5 px-4 py-3 text-left hover:bg-[color:var(--bg3)] transition"
      >
        <span
          className={`mt-1.5 block h-1.5 w-1.5 shrink-0 rounded-full ${
            filled ? "bg-[color:var(--success)]" : "bg-[color:var(--text-mute)]"
          }`}
        />
        <span className="flex-1 text-[13px] text-[color:var(--text)] leading-snug">
          {item.question}
        </span>
        <span className="text-[10px] text-[color:var(--text-mute)] shrink-0">
          {filled ? `${item.answer.length}字` : "未記入"}
        </span>
      </button>
      {open && (
        <div className="border-t border-[color:var(--line)] p-4">
          <AnswerEditor item={item} profile={profile} />
        </div>
      )}
    </div>
  );
}
