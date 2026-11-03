import fs from "node:fs/promises";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import remarkUnwrapImages from "remark-unwrap-images";
const components = {
  BlogImage: ({ src, alt, width, height, caption }: { src: string; alt: string; width: number; height: number; caption?: string }) => React.createElement("figure", null,
    React.createElement("img", { src, alt, width, height }),
    caption && React.createElement("figcaption", null, caption)),
  AppStoreLink: () => React.createElement("a", { className: "app-link", href: "https://apps.apple.com/us/app/caloriecue-calorie-counter/id6757112503?utm_source=blog&utm_medium=inline_cta&utm_content=weigh-food-raw-or-cooked" }, "Download CalorieCue"),
  table: ({ children }: { children: React.ReactNode }) => React.createElement("div", { className: "table-scroll" }, React.createElement("table", null, children)),
};

async function main() {
  const root = process.cwd();
  const slug = "weigh-food-raw-or-cooked";
  const { data, content: source } = matter(await fs.readFile(path.join(root, `content/blog/${slug}.mdx`), "utf8"));
  if (data.published !== false) throw new Error("The article must remain a draft.");
  const { content } = await compileMDX({ source, components, options: { mdxOptions: { remarkPlugins: [remarkGfm, remarkUnwrapImages] } } });
  const rendered = renderToStaticMarkup(React.createElement("article", null, content));
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Draft — ${data.title}</title><link rel="stylesheet" href="/preview.css"><style>body{margin:0;background:#F5F1EC;color:#231D1A;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif}header{max-width:1000px;margin:0 auto;padding:48px 24px 24px;text-align:center}h1{max-width:840px;margin:18px auto;font-size:clamp(32px,5vw,54px);line-height:1.1;letter-spacing:-.035em}header p{max-width:700px;margin:14px auto;color:#5E544D;line-height:1.65}.draft{display:inline-block;border:1px solid #D9D2C9;background:#FBE3D7;color:#9E3A20;padding:7px 14px;border-radius:100px;font-size:13px;font-weight:700}.hero{display:block;width:100%;height:auto;border-radius:24px;margin:28px auto 0}main{max-width:740px;margin:0 auto;padding:4px 24px 80px}article img{max-width:100%;height:auto}table{min-width:100%}article figure>img{display:block}article figure:has(img[src$=".svg"]){max-width:640px;margin:32px auto}@media(max-width:500px){header{padding-top:28px}main{padding-left:20px;padding-right:20px}.hero{border-radius:16px}}</style></head><body><header><span class="draft">UNPUBLISHED DRAFT · NOVEMBER 3, 2026</span><h1>${data.title}</h1><p>${data.description}</p><img class="hero" src="${data.coverImage}" alt="${data.coverImageAlt}" width="1200" height="630"></header><main>${rendered}</main></body></html>`;
  // The preview is served without Next's image-optimization endpoint or hydration.
  const standalone = html.replace('<link rel="stylesheet" href="/preview.css">', "").replace(/href="\/(blog|tdee-calculator)([^\"]*)"/g, 'href="https://caloriecue.app/$1$2"').replace(/srcSet="[^"]*"/g, "").replace(/src="\/_next\/image\?url=([^&"]+)[^"]*"/g, (_, src) => `src="${decodeURIComponent(src)}"`);
  const previewCss = `<style>article{font-size:18px;line-height:1.65}article h2{font-size:30px;line-height:1.2;letter-spacing:-.02em;margin:48px 0 18px}article h3{font-size:23px;line-height:1.3;margin:34px 0 14px}article p{margin:0 0 20px;color:#3C342F}article a{color:#BC4527;text-underline-offset:3px}article li{margin:8px 0}article figcaption{font-size:14px;color:#5E544D;text-align:center;margin-top:12px;line-height:1.5}.table-scroll{overflow-x:auto;border:1px solid #E5DED5;border-radius:16px;margin:28px 0;background:#FDFCFB}article table{border-collapse:collapse;min-width:100%;font-size:15px}article th{background:#EEE8E1;text-align:left;font-size:12px;text-transform:uppercase;letter-spacing:.04em}article th,article td{padding:12px 16px;border-bottom:1px solid #EEE8E1}article em{font-size:15px;color:#5E544D}article .app-link{display:inline-block;background:#BC4527;border-radius:12px;color:white;padding:12px 20px;text-decoration:none;font-weight:700}@media(max-width:500px){article{font-size:17px}article h2{font-size:27px}article h3{font-size:21px}article table{min-width:520px}}</style>`;
  await fs.writeFile(path.join(root, "output/blog-research/raw-cooked/preview.html"), standalone.replace("</head>", previewCss + "</head>"));
  console.log("Draft MDX compiled; standalone reading preview saved. Production rendering uses the existing BlogImage and AppStoreLink components.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
