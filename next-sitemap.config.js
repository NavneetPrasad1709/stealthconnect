/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || "https://stealthconnect.ai",
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/dashboard", "/admin", "/api"] },
    ],
  },
  exclude: ["/dashboard/*", "/admin/*", "/api/*"],
  generateIndexSitemap: false,
};
