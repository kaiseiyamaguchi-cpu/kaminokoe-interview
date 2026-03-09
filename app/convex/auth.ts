import LINE from "@auth/core/providers/line";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { DataModel } from "./_generated/dataModel";

// 管理者メールアドレス（パスワード認証を許可するメール）
const ADMIN_EMAILS = ["kaisei.yamaguchi@accel-shift.com"];

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    LINE({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
      checks: ["state"],
    }),
    Password<DataModel>({
      profile(params) {
        // 管理者メールのみ許可
        if (!ADMIN_EMAILS.includes(params.email as string)) {
          throw new Error("このメールアドレスは登録できません");
        }
        return {
          email: params.email as string,
          name: "管理者",
        };
      },
    }),
  ],
});
