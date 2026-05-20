"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import Image from "next/image";

const GRADUATION_YEARS = ["25卒", "26卒", "27卒", "28卒", "29卒", "既卒・転職"];

export function ProfileSetup() {
  const completeProfile = useMutation(api.users.completeProfile);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    displayName: "",
    email: "",
    university: "",
    faculty: "",
    graduationYear: "",
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const canSubmit = form.displayName.trim() && form.university.trim() && form.graduationYear;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      await completeProfile({
        displayName: form.displayName.trim(),
        email: form.email.trim(),
        university: form.university.trim(),
        faculty: form.faculty.trim() || undefined,
        graduationYear: form.graduationYear,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <Image src="/icon-512.png" alt="kanpe.ai" width={32} height={32} className="h-8 w-8" />
            <span className="text-2xl font-medium tracking-tight">kanpe.ai</span>
          </div>
          <h1 className="text-lg font-bold mt-2">プロフィールを登録</h1>
          <p className="text-sm text-[color:var(--text-dim)] mt-1">
            面接サポートの精度が上がります
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[color:var(--bg2)] border border-[color:var(--line)] rounded-2xl p-6 space-y-4">
          {error && (
            <p className="text-[color:var(--error)] text-sm text-center">{error}</p>
          )}

          <Field label="お名前" required>
            <input
              value={form.displayName}
              onChange={set("displayName")}
              placeholder="山田 太郎"
              className="input-field"
              autoFocus
            />
          </Field>

          <Field label="メールアドレス">
            <input
              value={form.email}
              onChange={set("email")}
              type="email"
              placeholder="example@university.ac.jp"
              className="input-field"
            />
          </Field>

          <Field label="大学名" required>
            <input
              value={form.university}
              onChange={set("university")}
              placeholder="○○大学"
              className="input-field"
            />
          </Field>

          <Field label="学部・学科">
            <input
              value={form.faculty}
              onChange={set("faculty")}
              placeholder="経済学部"
              className="input-field"
            />
          </Field>

          <Field label="卒業年度" required>
            <select
              value={form.graduationYear}
              onChange={set("graduationYear")}
              className="input-field"
            >
              <option value="">選択してください</option>
              {GRADUATION_YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </Field>

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="w-full py-3.5 rounded-xl text-base font-bold transition-all bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30 disabled:opacity-40 disabled:pointer-events-none mt-2"
          >
            {submitting ? "保存中..." : "はじめる"}
          </button>

          <p className="text-[11px] text-[color:var(--text-mute)] text-center">
            初回登録で <span className="text-[color:var(--accent2)] font-bold">30分無料</span>（3チケット）プレゼント
          </p>
        </form>
      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          background: var(--bg);
          border: 1px solid var(--line2);
          color: var(--text);
          padding: 0.625rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }
        .input-field:focus {
          outline: none;
          border-color: var(--accent);
        }
      `}</style>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-[color:var(--text-dim)] block mb-1.5">
        {label}{required && <span className="text-[color:var(--error)] ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
