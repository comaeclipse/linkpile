import { Bookmark } from './types';

export const INITIAL_BOOKMARKS: Bookmark[] = [
  {
    id: '1',
    url: 'https://react.dev',
    title: 'React - The library for web and native user interfaces',
    description: 'Official documentation for the React JavaScript library.',
    tags: ['javascript', 'react', 'frontend', 'dev'],
    createdAt: 1715421200000,
    isRead: false
  },
  {
    id: '2',
    url: 'https://tailwindcss.com',
    title: 'Tailwind CSS - Rapidly build modern websites without ever leaving your HTML',
    description: 'A utility-first CSS framework packed with classes like flex, pt-4, text-center and rotate-90.',
    tags: ['css', 'design', 'framework', 'webdev'],
    createdAt: 1715334800000,
    isRead: true
  },
  {
    id: '3',
    url: 'https://ai.google.dev',
    title: 'Google AI for Developers',
    description: 'Build with Gemini models using the new GenAI SDK.',
    tags: ['ai', 'google', 'gemini', 'api', 'llm'],
    createdAt: 1715248400000,
    isRead: false
  }
];

