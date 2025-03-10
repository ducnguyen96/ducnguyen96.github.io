import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  // tutorialSidebar: [{type: 'autogenerated', dirName: '.'}],

  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    'intro',
    'hello',
    {
      type: 'category',
      label: 'Tutorial',
      items: ['tutorial-basics/create-a-document'],
    },
  ],
   */

  docs: [
    "intro",
    {
      type: "category",
      label: "Machine learning roadmap",
      link: {
        type: "generated-index",
        title: "Machine learning roadmap",
        description:
          "Dưới đây là tổng hợp các kiến thức cần thiết cho việc học/thực hành machine learning. Nếu các bạn mới bắt đầu thì hãy học theo thứ tự từ trên xuống, nếu không thì có thể chọn bất cứ mục nào để ôn tập lại.",
        keywords: ["machine learning", "roadmap"],
      },
      collapsed: true,
      items: [
        {
          type: "category",
          label: "Math",
          link: {
            type: "generated-index",
            title: "Kiến thức toán học cần thiết",
            description:
              "Kiến thức dưới đây là mình giản lược lại từ cuốn sách của anh Tiệp, các bạn có thể lên trang machinelearningcoban hoặc vào github của anh Tiệp để tìm hiểu thêm nhé.",
            keywords: [
              "Math",
              "Đại số tuyến tính",
              "Xác suất thống kê",
              "algebra",
            ],
          },
          collapsed: true,
          items: [
            "machine-learning-roadmap/math/algebra",
            "machine-learning-roadmap/math/matrix-calculus",
            "machine-learning-roadmap/math/statistic",
            "machine-learning-roadmap/math/maxium_likelihood_and_maxium_a_posteriori",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Data structures and algorithms roadmap",
      link: {
        type: "generated-index",
        title: "Data structures & algorithms roadmap",
        description:
          "Dưới đây là lộ trình học data structures và algorithms. Nếu các bạn mới bắt đầu thì hãy học theo thứ tự từ trên xuống, nếu không thì có thể chọn bất cứ mục nào để ôn tập lại.",
        keywords: ["data structures", "algorithms"],
      },
      collapsed: true,
      items: [
        // {
        //   type: "category",
        //   label: "In Python",
        //   link: {
        //     type: "generated-index",
        //     title: "Data structures & algorithms In Python",
        //     description: " ",
        //     keywords: ["data structures", "algorithms"],
        //   },
        //   collapsed: true,
        //   items: ["data-structures-and-algorithms/python/setup"],
        // },
        {
          type: "category",
          label: "In C++",
          link: {
            type: "generated-index",
            title: "Data structures & algorithms In C++",
            description: " ",
            keywords: ["data structures", "algorithms"],
          },
          collapsed: true,
          items: [
            "data-structures-and-algorithms/cpp/setup",
            "data-structures-and-algorithms/cpp/union-find",
          ],
        },
      ],
    },
  ],
};

export default sidebars;
