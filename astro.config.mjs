// @ts-check
import { defineConfig } from 'astro/config';

const [repoOwner = '', repoName = ''] = (process.env.GITHUB_REPOSITORY || '').split('/');
const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
const isUserSiteRepo = repoName && repoOwner && repoName.toLowerCase() === `${repoOwner.toLowerCase()}.github.io`;

// https://astro.build/config
export default defineConfig({
  site: repoOwner ? `https://${repoOwner}.github.io` : undefined,
  base: isGithubActions && repoName && !isUserSiteRepo ? `/${repoName}` : '/',
});
