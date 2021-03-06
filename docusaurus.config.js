// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Developer Roadmap",
  tagline: "",
  url: "https://ducnguyen96.github.io",
  baseUrl: "/",
  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "ducnguyen96", // Usually your GitHub org/user name.
  projectName: "ducnguyen96.github.io", // Usually your repo name.
  deploymentBranch: "gh-pages",
  plugins: [
    "@docusaurus/plugin-ideal-image",
    [
      "@docusaurus/plugin-pwa",
      {
        debug: true,
        offlineModeActivationStrategies: [
          "appInstalled",
          "standalone",
          "queryString",
        ],
        pwaHead: [
          {
            tagName: "link",
            rel: "icon",
            href: "/img/logo.jpeg",
          },
          {
            tagName: "link",
            rel: "manifest",
            href: "/manifest.json", // your PWA manifest
          },
          {
            tagName: "meta",
            name: "theme-color",
            content: "#25C2A0",
          },
          {
            tagName: "meta",
            name: "apple-mobile-web-app-capable",
            content: "yes",
          },
          {
            tagName: "meta",
            name: "apple-mobile-web-app-status-bar-style",
            content: "#000",
          },
          {
            tagName: "link",
            rel: "apple-touch-icon",
            href: "/img/logo.jpeg",
          },
          {
            tagName: "link",
            rel: "mask-icon",
            href: "/img/favicon.ico",
          },
          {
            tagName: "meta",
            name: "msapplication-TileImage",
            content: "/img/logo.jpeg",
          },
          {
            tagName: "meta",
            name: "msapplication-TileColor",
            content: "#000",
          },
        ],
      },
    ],
  ],

  i18n: {
    defaultLocale: "vi",
    locales: ["vi"],
  },

  presets: [
    [
      "@docusaurus/preset-classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl:
            "https://github.com/ducnguyen96/ducnguyen96.github.io/edit/master/",
        },
        blog: {
          showReadingTime: true,
          blogSidebarCount: "ALL",
          // Please change this to your repo.
          editUrl:
            "https://github.com/ducnguyen96/ducnguyen96.github.io/edit/master/",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      algolia: {
        contextualSearch: true,
        appId: "D7GGKMYV4U",
        apiKey: "4ecf77a6d860f569d4e043afa4277a14",
        indexName: "test",
      },
      navbar: {
        title: "",
        logo: {
          alt: "ducnguyen96",
          src: "img/logo.jpeg",
        },
        items: [
          {
            type: "doc",
            docId: "introduction",
            position: "left",
            label: "Docs",
          },
          { to: "/blog", label: "Blog", position: "left" },
          {
            to: "https://github.com/ducnguyen96",
            label: "GitHub",
            position: "right",
          },
          {
            to: "https://www.youtube.com/channel/UCCrvmlNIXLgZOMAMn9VKBeA",
            label: "Youtube",
            position: "right",
          },
          {
            to: "https://ducnguyen96.github.io/projects/cv/",
            label: "CV",
            position: "right",
          },
          {
            to: "https://ducnguyen96.github.io/projects/cv-pdf/",
            label: "CV-PDF",
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
                label: "Docs",
                to: "/docs/introduction",
              },
            ],
          },
          {
            title: "Community",
            items: [
              // {
              //   label: "Stack Overflow",
              //   href: "https://stackoverflow.com/questions/tagged/docusaurus",
              // },
              // {
              //   label: "Discord",
              //   href: "https://discordapp.com/invite/docusaurus",
              // },
              {
                label: "Youtube",
                href: "https://www.youtube.com/channel/UCCrvmlNIXLgZOMAMn9VKBeA",
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
        copyright: `Copyright ?? ${new Date().getFullYear()} ducnguyen96, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
