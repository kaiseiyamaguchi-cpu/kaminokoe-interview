/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as desktopHandoff from "../desktopHandoff.js";
import type * as http from "../http.js";
import type * as interviewPrep from "../interviewPrep.js";
import type * as interviewPrepAi from "../interviewPrepAi.js";
import type * as openai from "../openai.js";
import type * as purchases from "../purchases.js";
import type * as sessions from "../sessions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  desktopHandoff: typeof desktopHandoff;
  http: typeof http;
  interviewPrep: typeof interviewPrep;
  interviewPrepAi: typeof interviewPrepAi;
  openai: typeof openai;
  purchases: typeof purchases;
  sessions: typeof sessions;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
