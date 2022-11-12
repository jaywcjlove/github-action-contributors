import path from 'path';
import fs from 'fs';
import { setFailed, setOutput, getInput, info, startGroup, endGroup } from '@actions/core';
import { getOctokit, context } from '@actions/github';
import { Endpoints } from "@octokit/types";
import image2uri from 'image2uri';

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
    filterAuthor: getInput('filter-author'),
    svgPath: getInput('output') || './contributors.svg',
    truncate: Number.isNaN(truncate) ? 0 : truncate,
    svgWidth: Number.isNaN(svgWidth) ? 740 : svgWidth,
    avatarSize: Number.isNaN(avatarSize) ? 24 : avatarSize,
    avatarMargin: Number.isNaN(avatarMargin) ? 5 : avatarMargin,
    userNameHeight: Number.isNaN(userNameHeight) ? 0 : userNameHeight,
  }
}

function calcSectionHeight(total: number, options: ReturnType<typeof getInputs>) {
  const { avatarMargin } = options;
  const avatarHeight = options.avatarSize;
  const itemHeight = avatarHeight + 2 * avatarMargin + options.userNameHeight;
  const colCount = getColCount(options);
  return itemHeight * Math.ceil(total / colCount);
}

function getColCount(options: ReturnType<typeof getInputs>) {
  const { svgWidth } = options;
  const { avatarMargin } = options;
  const avatarWidth = options.avatarSize;
  const itemWidth = avatarWidth + 2 * avatarMargin;
  return Math.floor(svgWidth / itemWidth);
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

type UserData = Endpoints["GET /repos/{owner}/{repo}/contributors"]['response']['data'][number]

class Generator {
  options: ReturnType<typeof getInputs>;
  token: string;
  owner: string;
  repo: string;
  svg: string;
  data: UserData[] = [];
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
    let list = await octokit.paginate(octokit.rest.repos.listContributors, {
      owner: this.owner,
      repo: this.repo,
    })

    startGroup(`Request UserInfo: \x1b[34m(GET /repos/${this.owner}/${this.repo}/contributors)\x1b[0m`);
    list.forEach((userInfoDetail) => {
      info(`${JSON.stringify(userInfoDetail, null, 2)}`);
    })
    endGroup();

    if (list && list.length > 0) {
      list = list.filter((item) => !(new RegExp(this.options.filterAuthor)).test(item.login));
      if (Array.isArray(this.data)) {
        this.data = list;
      }
    }
    return list
  }
  async generator() {
    const avatar = await Promise.all(this.data.map(async (item, idx) => {
      startGroup(`Commit: \x1b[34m(${item.login})\x1b[0m`);
      info(`${JSON.stringify(item, null, 2)}`);
      endGroup();
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
  outputMarkdown() {
    const colCount = getColCount(this.options);
    let htmlTable = `<table><tr>`;
    let htmlList = ``;
    this.data.forEach((item, idx) => {
      if (idx + 1 % colCount === 0) {
        htmlTable += `  </tr><tr>`;
      }
      htmlTable += `  <td align="center">`;
      htmlTable += `    <a href="https://github.com/${item.login}">`;
      htmlTable += `    <img src="${item.avatar_url}" width="${this.options.avatarSize};" alt="${item.name || item.login}"/><br />`;
      htmlTable += `    <sub><b>${item.login}</b></sub>`;
      htmlTable += `    </a>`;
      htmlTable += `  </td>`;

      htmlList += `<a href="https://github.com/${item.login}">`;
      htmlList += `  <img src="${item.avatar_url}" width="${this.options.avatarSize};" alt="${item.name || item.login}"/><br />`;
      htmlList += `  <sub><b>${item.login}</b></sub>`;
      htmlList += `</a>`;
    });
    htmlTable += `</tr></table>`;
    startGroup(`Request response : \x1b[34m(htmlTable)\x1b[0m ${colCount}`);
    info(`${htmlTable}`);
    endGroup();

    setOutput('htmlTable', htmlTable)

    startGroup(`Request response : \x1b[34m(htmlList)\x1b[0m`);
    info(`${htmlList}`);
    endGroup();
    setOutput('htmlList', htmlTable)
  }
  async writeFile() {
    if (this.options.svgPath) {
      const data = new Uint8Array(Buffer.from(this.svg));
      await fs.promises.writeFile(this.options.svgPath, data);
      info(`Generated: "${this.options.svgPath}"`)
    }
  }
}

try {
  ;(async () => {
    const gen = new Generator();
    await gen.getContributors();
    await gen.generator();
    await gen.outputMarkdown();
    await gen.writeFile();
  })();
} catch (error) {
  setFailed(error.message);
}