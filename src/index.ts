import path from 'path';
import fs from 'fs';
import { setFailed, setOutput, getInput, info, startGroup, endGroup } from '@actions/core';
import { getOctokit, context } from '@actions/github';
import image2uri from 'image2uri';

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

export function getInputs() {
  const count = parseInt(getInput('count'), 10)
  const truncate = parseInt(getInput('truncate'), 10)
  const svgWidth = parseInt(getInput('svgWidth'), 10)
  const avatarSize = parseInt(getInput('avatarSize'), 10)
  const avatarMargin = parseInt(getInput('avatarMargin'), 10)
  const userNameHeight = parseInt(getInput('userNameHeight'), 10)
  return {
    count: Number.isNaN(count) ? null : count,
    includeBots: getInput('includeBots') === 'true',
    affiliation: getInput('affiliation') as 'all' | 'direct' | 'outside',
    svgTemplate: getInput('svgTemplate'),
    svgPath: getInput('output') || './contributors.svg',
    truncate: Number.isNaN(truncate) ? 0 : truncate,
    svgWidth: Number.isNaN(svgWidth) ? 740 : svgWidth,
    avatarSize: Number.isNaN(avatarSize) ? 24 : avatarSize,
    avatarMargin: Number.isNaN(avatarMargin) ? 5 : avatarMargin,
    userNameHeight: Number.isNaN(userNameHeight) ? 0 : userNameHeight,
  }
}

function calcSectionHeight(total: number, options: ReturnType<typeof getInputs>) {
  const { svgWidth } = options;
  const { avatarMargin } = options;
  const avatarWidth = options.avatarSize;
  const avatarHeight = options.avatarSize;
  const itemWidth = avatarWidth + 2 * avatarMargin;
  const itemHeight = avatarHeight + 2 * avatarMargin + options.userNameHeight;
  const colCount = Math.floor(svgWidth / itemWidth);
  return itemHeight * Math.ceil(total / colCount);
}

function getItemBBox(index: number, options: ReturnType<typeof getInputs>) {
  const { svgWidth, avatarMargin } = options;
  const avatarWidth = options.avatarSize;
  const avatarHeight = options.avatarSize;
  const colCount = Math.floor(svgWidth / (avatarWidth + 2 * avatarMargin));
  const colIndex = index % colCount;
  const rowIndex = Math.floor(index / colCount);
  return {
    x: avatarMargin + colIndex * (avatarWidth + avatarMargin),
    y: avatarMargin + rowIndex * (avatarHeight + avatarMargin + options.userNameHeight),
    width: avatarWidth,
    height: avatarHeight,
  }
}

class Generator {
  options: ReturnType<typeof getInputs>;
  token: string;
  owner: string;
  repo: string;
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
    this.options = getInputs();

    const myToken = getInput('token');
    if (!myToken) {
      setFailed(`token does not exist!`);
    }
    this.token = myToken;

    const output = getInput('output');
    if (!output) {
      setFailed(`'output' does not exist!`);
    }
    this.options.svgPath = path.resolve(process.cwd(), output);
    info(`output: \x1b[34m${this.options.svgPath}\x1b[0m`);
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
    const avatar = await Promise.all(this.data.map(async (item, idx) => {
      startGroup(`Commit: \x1b[34m(${item.login})\x1b[0m`);
      info(`${JSON.stringify(item, null, 2)}`);
      endGroup();
      info(`${filterAuthor} ${(new RegExp(filterAuthor)).test(item.login)}`);
      if ((new RegExp(filterAuthor)).test(item.login)) {
        return '';
      }
      const { x, y, width, height } = getItemBBox(idx, this.options);
      const img = await image2uri(item.avatar_url, { ext: '.apng' });
      return `<a xlink:href="https://github.com/${item.login}" class="contributor-link" target="_blank" rel="nofollow sponsored" id="${item.login}">
<image x="${x}" y="${y}" width="${width}" height="${height}" xlink:href="${img}"/>
</a>`;
    }));
    const contributorsHeight = calcSectionHeight(this.data.length, this.options);
    this.svg = this.options.svgTemplate.replace('{{ width }}', String(this.options.svgWidth))
      .replace('{{ contributorsHeight }}', String(contributorsHeight))
      .replace('{{{ contributors }}}', avatar.join(''));
    setOutput('svg', this.svg)
    return this.svg;
  }
  async writeFile() {
    const data = new Uint8Array(Buffer.from(this.svg));
    await fs.promises.writeFile(this.options.svgPath, data);
    info(`Generated: "${this.options.svgPath}"`)
  }
}

try {
  ;(async () => {
    const gen = new Generator();
    await gen.getContributors();
    await gen.generator();
    await gen.writeFile();
  })();
} catch (error) {
  setFailed(error.message);
}