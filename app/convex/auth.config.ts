export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL,
      applicationID: "convex",
    },
  ],
  // OAuth callbackのためのSITE_URL
  siteUrl: process.env.SITE_URL ?? "http://localhost:3000",
};
