import { defineConfig } from 'vite';

const repository = process.env.GITHUB_REPOSITORY;
const repoName = repository ? repository.split('/')[1] : '';

export default defineConfig({
  base: process.env.GITHUB_ACTIONS && repoName ? `/${repoName}/` : '/'
});
