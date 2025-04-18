import { themes as prismThemes } from "prism-react-renderer";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: "Nguyen Duc",
  tagline: "Blog cá nhân của tôi",
  favicon: "img/favicon.ico",

  // Set the production url of your site here
  url: "https://ducnguyen96.github.io",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "ducnguyen96", // Usually your GitHub org/user name.
  projectName: "ducnguyen96.github.io", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "vi",
    locales: ["vi", "en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/ducnguyen96/ducnguyen96.github.io/edit/master/",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            "https://github.com/ducnguyen96/ducnguyen96.github.io/edit/master/",
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "Home",
      logo: {
        alt: "Nguyen Duc Logo",
        src: "img/avatar.png",
      },
      items: [
        {
          to: "/docs/intro",
          position: "left",
          label: "Docs",
        },
        { to: "/blog", label: "Blog", position: "left" },
        {
          href: "https://github.com/ducnguyen96",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Machine Learning Roadmap",
              to: "/docs/category/machine-learning-roadmap",
            },
            {
              label: "Data Structures & Algorithms Roadmap",
              to: "/docs/category/data-structures-and-algorithms-roadmap",
            },
            {
              label: "Leetcode Roadmap",
              to: "/docs/category/leetcode-roadmap",
            },
          ],
        },
        {
          title: "Social",
          items: [
            {
              label: "Linkedin",
              href: "https://www.linkedin.com/in/ducnguyen948/",
            },
            {
              label: "Youtube",
              href: "https://www.youtube.com/@ducnguyenfake",
            },
            {
              label: "Facebook",
              href: "https://www.facebook.com/fnwvanduc/",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "Blog",
              to: "/blog",
            },
            {
              label: "GitHub",
              href: "https://github.com/ducnguyen96",
            },
          ],
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["nix", "json", "bash"],
    },
    stylesheets: [
      {
        href: "/katex/katex.min.css",
        type: "text/css",
      },
    ],
  } satisfies Preset.ThemeConfig,
};

export default config;
