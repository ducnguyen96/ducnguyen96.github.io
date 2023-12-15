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
    "introduction",
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
          ],
        },
      ],
    },
  ],
};

export default sidebars;
