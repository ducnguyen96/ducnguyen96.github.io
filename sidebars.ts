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
          items: [
            "go/rest-server/standard-library",
            "go/rest-server/using-a-router-package",
          ],
        },
      ],
    },
  ],
};

export default sidebars;
