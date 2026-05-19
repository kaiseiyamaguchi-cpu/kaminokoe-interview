import Google from "@auth/core/providers/google";
import LINE from "@auth/core/providers/line";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { DataModel } from "./_generated/dataModel";

// 管理者メールアドレス（パスワード認証を許可するメール）
const ADMIN_EMAILS = ["kaisei.yamaguchi@accel-shift.com"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const providers: any[] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: { scope: "openid email profile", prompt: "select_account" },
      },
    }),
  );
}

providers.push(
  LINE({
    clientId: process.env.LINE_CLIENT_ID!,
    clientSecret: process.env.LINE_CLIENT_SECRET!,
    checks: ["state"],
    authorization: {
      params: { scope: "profile openid", bot_prompt: "aggressive" },
    },
  }),
);

providers.push(
  Password<DataModel>({
    profile(params) {
      if (!ADMIN_EMAILS.includes(params.email as string)) {
        throw new Error("このメールアドレスは登録できません");
      }
      return { email: params.email as string, name: "管理者" };
    },
  }),
);

const ALLOWED_ORIGINS = [
  "https://kanpe.ai",
  "https://app.kanpe.ai",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:3847",
];

export const { auth, signIn, signOut, store } = convexAuth({
  providers,
  callbacks: {
    async redirect({ redirectTo }) {
      try {
        const url = new URL(redirectTo);
        if (ALLOWED_ORIGINS.includes(url.origin)) {
          return redirectTo;
        }
      } catch {
        // fallthrough
      }
      return ALLOWED_ORIGINS[0];
    },
  },
});
