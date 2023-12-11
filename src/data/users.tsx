/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable global-require */

import {translate} from '@docusaurus/Translate';
import {sortBy} from '@site/src/utils/jsUtils';

/*
 * ADD YOUR SITE TO THE DOCUSAURUS SHOWCASE
 *
 * Please don't submit a PR yourself: use the Github Discussion instead:
 * https://github.com/facebook/docusaurus/discussions/7826
 *
 * Instructions for maintainers:
 * - Add the site in the json array below
 * - `title` is the project's name (no need for the "Docs" suffix)
 * - A short (≤120 characters) description of the project
 * - Use relevant tags to categorize the site (read the tag descriptions on the
 *   https://docusaurus.io/showcase page and some further clarifications below)
 * - Add a local image preview (decent screenshot of the Docusaurus site)
 * - The image MUST be added to the GitHub repository, and use `require("img")`
 * - The image has to have minimum width 640 and an aspect of no wider than 2:1
 * - If a website is open-source, add a source link. The link should open
 *   to a directory containing the `docusaurus.config.js` file
 * - Resize images: node admin/scripts/resizeImage.js
 * - Run optimizt manually (see resize image script comment)
 * - Open a PR and check for reported CI errors
 *
 * Example PR: https://github.com/facebook/docusaurus/pull/7620
 */

// LIST OF AVAILABLE TAGS
// Available tags to assign to a showcase site
// Please choose all tags that you think might apply.
// We'll remove inappropriate tags, but it's less likely that we add tags.
export type TagType =
  | 'favorite'
  | 'opensource'
  | 'product'
  | 'react'
  | 'typescript'
  | 'javascript'
  | 'svelte'
  | 'nextjs'
  | 'go'
  | 'rust'
  | 'web'
  | 'backend'
  | 'frontend'
  | 'firebase'
  | 'nestjs'
  | 'microservices'
  | 'linux'
  | 'postgresql'
  | 'docker'
  | 'kubernetes'
  | 'aws'
  | 'php'
  | 'wordpress'
  | 'tailwindcss'

// Add sites to this list
// prettier-ignore
const Users: User[] = [
  {
    title: 'TESOL',
    description: 'TESOL is a wordpress website. It is a website for a language school. It has a blog, a contact form, and a page for the courses.',
    preview: require('./showcase/tesol.jpg'),
    website: '/projects/tesol',
    source: null,
    tags: ['php', 'wordpress', 'frontend', 'tailwindcss'],
  },
  {
    title: 'Issues',
    description: 'Issues is clone of github issues. It is a website for creating issues and commenting on them.',
    preview: require('./showcase/issues.jpg'),
    website: 'https://issues-af52b.web.app',
    source: null,
    tags: ['svelte', 'firebase', 'frontend', 'backend', 'typescript', 'tailwindcss'],
  }
];

export type User = {
  title: string;
  description: string;
  preview: string | null; // null = use our serverless screenshot service
  website: string;
  source: string | null;
  tags: TagType[];
};

export type Tag = {
  label: string;
  description: string;
  color: string;
};

export const Tags: {[type in TagType]: Tag} = {
  favorite: {
    label: translate({message: 'Favorite'}),
    description: translate({
      message:
        'My favorite that you must absolutely check out!',
      id: 'showcase.tag.favorite.description',
    }),
    color: '#e9669e',
  },

  opensource: {
    label: translate({message: 'Open-Source'}),
    description: translate({
      message: 'Open-Source apps can be useful for inspiration!',
      id: 'showcase.tag.opensource.description',
    }),
    color: '#39ca30',
  },

  product: {
    label: translate({message: 'Product'}),
    description: translate({
      message: 'Not a toy project, but a real product!',
      id: 'showcase.tag.product.description',
    }),
    color: '#dfd545',
  },

  react: {
    label: 'React',
    description: translate({
      message: 'Made with React',
      id: 'showcase.tag.react.description',
    }),
    color: '#61dafb',
  },

  typescript: {
    label: 'TypeScript',
    description: translate({
      message: 'Made with TypeScript',
      id: 'showcase.tag.typescript.description',
    }),
    color: '#007acc',
  },

  javascript: {
    label: 'JavaScript',
    description: translate({
      message: 'Made with JavaScript',
      id: 'showcase.tag.javascript.description',
    }),
    color: '#f0db4f',
  },

  svelte: {
    label: 'Svelte',
    description: translate({
      message: 'Made with Svelte',
      id: 'showcase.tag.svelte.description',
    }),
    color: '#ff3e00',
  },

  nextjs: {
    label: 'Next.js',
    description: translate({
      message: 'Made with Next.js',
      id: 'showcase.tag.nextjs.description',
    }),
    color: '#000000',
  },

  go: {
    label: 'Go',
    description: translate({
      message: 'Made with Go',
      id: 'showcase.tag.go.description',
    }),
    color: '#00add8',
  },

  rust: {
    label: 'Rust',
    description: translate({
      message: 'Made with Rust',
      id: 'showcase.tag.rust.description',
    }),
    color: '#B7410E',
  },

  web: {
    label: 'Web',
    description: translate({
      message: 'Made for the Web',
      id: 'showcase.tag.web.description',
    }),
    color: '#4285f4',
  },

  backend: {
    label: 'Backend',
    description: translate({
      message: 'Made for the Backend',
      id: 'showcase.tag.backend.description',
    }),
    color: '#4285f4',
  },

  frontend: {
    label: 'Frontend',
    description: translate({
      message: 'Made for the Frontend',
      id: 'showcase.tag.frontend.description',
    }),
    color: '#4285f4',
  },

  firebase: {
    label: 'Firebase',
    description: translate({
      message: 'Made with Firebase',
      id: 'showcase.tag.firebase.description',
    }),
    color: '#ffa611',
  },

  nestjs: {
    label: 'NestJS',
    description: translate({
      message: 'Made with NestJS',
      id: 'showcase.tag.nestjs.description',
    }),
    color: '#ea2845',
  },

  microservices: {
    label: 'Microservices',
    description: translate({
      message: 'Made for Microservices',
      id: 'showcase.tag.microservices.description',
    }),
    color: '#ea2845',
  },

  linux: {
    label: 'Linux',
    description: translate({
      message: 'Made for Linux',
      id: 'showcase.tag.linux.description',
    }),
    color: '#000000',
  },

  postgresql: {
    label: 'PostgreSQL',
    description: translate({
      message: 'Made with PostgreSQL',
      id: 'showcase.tag.postgresql.description',
    }),
    color: '#336791',
  },

  docker: {
    label: 'Docker',
    description: translate({
      message: 'Made with Docker',
      id: 'showcase.tag.docker.description',
    }),
    color: '#2496ed',
  },

  kubernetes: {
    label: 'Kubernetes',
    description: translate({
      message: 'Made with Kubernetes',
      id: 'showcase.tag.kubernetes.description',
    }),
    color: '#326ce5',
  },

  aws: {
    label: 'AWS',
    description: translate({
      message: 'Made with AWS',
      id: 'showcase.tag.aws.description',
    }),
    color: '#ff9900',
  },

  php: {
    label: 'PHP',
    description: translate({
      message: 'Made with PHP',
      id: 'showcase.tag.php.description',
    }),
    color: '#8892bf',
  },

  wordpress: {
    label: 'WordPress',
    description: translate({
      message: 'Made with WordPress',
      id: 'showcase.tag.wordpress.description',
    }),
    color: '#21759b',
  },

  tailwindcss: {
    label: 'Tailwind CSS',
    description: translate({
      message: 'Made with Tailwind CSS',
      id: 'showcase.tag.tailwindcss.description',
    }),
    color: '#38b2ac',
  },
};

export const TagList = Object.keys(Tags) as TagType[];
function sortUsers() {
  let result = Users;
  // Sort by site name
  result = sortBy(result, (user) => user.title.toLowerCase());
  // Sort by favorite tag, favorites first
  result = sortBy(result, (user) => !user.tags.includes('favorite'));
  return result;
}

export const sortedUsers = sortUsers();
