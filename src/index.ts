import path from 'path';
import { setFailed, getInput, info } from '@actions/core';
import { getOctokit, context } from '@actions/github';
import image2uri from 'image2uri';

const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="890" height="262">
<style>.github-contributors-svg { cursor: pointer; }</style>
{{{contributors}}}
</svg>`;

type Data = {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
  contributions: number;
}

class Generator {
  token: string;
  owner: string;
  repo: string;
  output: string;
  svg: string;
  data: Array<Data> = [];
  constructor() {
    const { owner, repo } = context.repo;
    if (!repo) {
      setFailed(`repo name does not exist!`);
    }
    if (!owner) {
      setFailed(`owner name does not exist!`);
    }
    this.repo = repo;
    this.owner = owner;

    const myToken = getInput('token');
    if (!myToken) {
      setFailed(`token does not exist!`);
    }
    this.token = myToken;

    const output = getInput('output');
    if (!output) {
      setFailed(`'output' does not exist!`);
    }
    this.output = path.resolve(process.cwd(), output);
    info(`output: \x1b[34m${this.output}\x1b[0m`);
    info(`owner/repo: \x1b[34m${owner}/${repo}\x1b[0m`);
  }
  async getContributors() {
    const octokit = getOctokit(this.token);
    const list = await octokit.request(`GET /repos/${this.owner}/${this.repo}/contributors`, {
      owner: this.owner,
      repo: this.repo
    });
    if (list.data && list.data.length > 0) {
      this.data = list.data;
    }
    return list
  }
  async generator() {
    const filterAuthor = getInput('filter-author');
    const avatar = await Promise.all(this.data.map(async (item) => {
      if ((new RegExp(filterAuthor)).test(item.login)) {
        return '';
      }
      const img = await image2uri(item.avatar_url, { ext: '.apng' });
      return `<a xlink:href="https://github.com/${item.login}" class="github-contributors-svg" target="_blank" rel="nofollow sponsored" id="${item.login}">
<image x="106" y="210" width="24" height="24" xlink:href="${img}"/>
</a>`;
    }));
    return svgStr.replace('{{{contributors}}}', avatar.join(''));
  }
}

try {
  ;(async () => {
    const gen = new Generator();
    await gen.getContributors();
    const str = await gen.generator();
    console.log(str)
  })();
} catch (error) {
  setFailed(error.message);
}