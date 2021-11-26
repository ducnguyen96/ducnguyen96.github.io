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
  plugins: ["@docusaurus/plugin-ideal-image"],

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
      navbar: {
        title: "ducnguyen96",
        logo: {
          alt: "ducnguyen96",
          src: "img/logo.jpeg",
        },
        items: [
          {
            type: "doc",
            docId: "backend/nginx_basic",
            position: "left",
            label: "Tutorial",
          },
          { to: "/blog", label: "Blog", position: "left" },
          {
            href: "https://github.com/ducnguyen96",
            label: "GitHub",
            position: "right",
          },
          {
            href: "https://www.youtube.com/channel/UCCrvmlNIXLgZOMAMn9VKBeA",
            label: "Youtube",
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
                label: "Tutorial",
                to: "/docs/backend/nginx_basic",
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
        copyright: `Copyright © ${new Date().getFullYear()} ducnguyen96, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
