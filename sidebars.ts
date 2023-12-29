import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  docs: [
    {
      type: "category",
      label: "Go",
      link: {
        type: "generated-index",
        title: "Go Guides",
        description: "Go Guides",
        keywords: ["Go", "Guides"],
      },
      collapsed: false,
      items: [
        {
          type: "category",
          label: "REST Server",
          link: {
            type: "generated-index",
            title: "REST Server Guides",
            description: "REST Server Guides",
            keywords: ["Go", "REST Server"],
          },
          collapsed: false,
          items: [
            "go/rest-server/standard-library",
            "go/rest-server/using-a-router-package",
            "go/rest-server/using-a-web-framework",
            "go/rest-server/using-openapi-and-swagger",
            "go/rest-server/middleware",
            "go/rest-server/authentication",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Nodejs",
      link: {
        type: "generated-index",
        title: "Nodejs Guides",
        description: "Nodejs Guides",
        keywords: ["Nodejs", "Guides"],
      },
      collapsed: false,
      items: [
        {
          type: "category",
          label: "REST Server",
          link: {
            type: "generated-index",
            title: "REST Server Guides",
            description: "REST Server Guides",
            keywords: ["Nodejs", "REST Server"],
          },
          collapsed: false,
          items: [
            "nodejs/rest-server/standard-library",
            "nodejs/rest-server/using-a-router-package",
            "nodejs/rest-server/using-a-web-framework",
            "nodejs/rest-server/using-openapi-and-swagger",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Nix",
      link: {
        type: "generated-index",
        title: "Nix Guides",
        description: "Nix Guides",
        keywords: ["Nix", "Guides"],
      },
      collapsed: false,
      items: [
        {
          type: "category",
          label: "Nix Language",
          link: {
            type: "generated-index",
            title: "Nix Language Guides",
            keywords: ["Nix Language", "Guides"],
          },
          collapsed: false,
          items: ["nix/nix-language/basic"],
        },
        {
          type: "category",
          label: "Package Management",
          link: {
            type: "generated-index",
            title: "Nix Package Management Guides",
            keywords: ["Package management", "Guides"],
          },
          collapsed: false,
          items: [
            "nix/package-management/profiles",
            "nix/package-management/garbage-collection",
            "nix/package-management/functions-and-imports",
          ],
        },
      ],
    },
  ],
};

export default sidebars;
