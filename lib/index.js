"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInputs = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const core_1 = require("@actions/core");
const github_1 = require("@actions/github");
const image2uri_1 = __importDefault(require("image2uri"));
function getInputs() {
    const count = parseInt((0, core_1.getInput)('count'), 10);
    const truncate = parseInt((0, core_1.getInput)('truncate'), 10);
    const svgWidth = parseInt((0, core_1.getInput)('svgWidth'), 10);
    const avatarSize = parseInt((0, core_1.getInput)('avatarSize'), 10);
    const avatarMargin = parseInt((0, core_1.getInput)('avatarMargin'), 10);
    const userNameHeight = parseInt((0, core_1.getInput)('userNameHeight'), 10);
    return {
        count: Number.isNaN(count) ? null : count,
        includeBots: (0, core_1.getInput)('includeBots') === 'true',
        affiliation: (0, core_1.getInput)('affiliation'),
        svgTemplate: (0, core_1.getInput)('svgTemplate'),
        svgPath: (0, core_1.getInput)('output') || './contributors.svg',
        truncate: Number.isNaN(truncate) ? 0 : truncate,
        svgWidth: Number.isNaN(svgWidth) ? 740 : svgWidth,
        avatarSize: Number.isNaN(avatarSize) ? 24 : avatarSize,
        avatarMargin: Number.isNaN(avatarMargin) ? 5 : avatarMargin,
        userNameHeight: Number.isNaN(userNameHeight) ? 0 : userNameHeight,
    };
}
exports.getInputs = getInputs;
function calcSectionHeight(total, options) {
    const { svgWidth } = options;
    const { avatarMargin } = options;
    const avatarWidth = options.avatarSize;
    const avatarHeight = options.avatarSize;
    const itemWidth = avatarWidth + 2 * avatarMargin;
    const itemHeight = avatarHeight + 2 * avatarMargin + options.userNameHeight;
    const colCount = Math.floor(svgWidth / itemWidth);
    return itemHeight * Math.ceil(total / colCount);
}
function getItemBBox(index, options) {
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
    };
}
class Generator {
    constructor() {
        this.data = [];
        const { owner, repo } = github_1.context.repo;
        if (!repo) {
            (0, core_1.setFailed)(`repo name does not exist!`);
        }
        if (!owner) {
            (0, core_1.setFailed)(`owner name does not exist!`);
        }
        this.repo = repo;
        this.owner = owner;
        this.options = getInputs();
        const myToken = (0, core_1.getInput)('token');
        if (!myToken) {
            (0, core_1.setFailed)(`token does not exist!`);
        }
        this.token = myToken;
        const output = (0, core_1.getInput)('output');
        if (!output) {
            (0, core_1.setFailed)(`'output' does not exist!`);
        }
        this.options.svgPath = path_1.default.resolve(process.cwd(), output);
        (0, core_1.info)(`output: \x1b[34m${this.options.svgPath}\x1b[0m`);
        (0, core_1.info)(`owner/repo: \x1b[34m${owner}/${repo}\x1b[0m`);
    }
    async getContributors() {
        const octokit = (0, github_1.getOctokit)(this.token);
        const list = await octokit.request(`GET /repos/${this.owner}/${this.repo}/contributors`, {
            owner: this.owner,
            repo: this.repo
        });
        if (list.data && list.data.length > 0) {
            this.data = list.data;
        }
        return list;
    }
    async generator() {
        const filterAuthor = (0, core_1.getInput)('filter-author');
        const avatar = await Promise.all(this.data.map(async (item, idx) => {
            (0, core_1.startGroup)(`Commit: \x1b[34m(${item.login})\x1b[0m / filterAuthor=> ${(new RegExp(filterAuthor)).test(item.login)}`);
            (0, core_1.info)(`${JSON.stringify(item, null, 2)}`);
            (0, core_1.endGroup)();
            if ((new RegExp(filterAuthor)).test(item.login)) {
                return '';
            }
            const { x, y, width, height } = getItemBBox(idx, this.options);
            const img = await (0, image2uri_1.default)(item.avatar_url, { ext: '.apng' });
            return `<a xlink:href="https://github.com/${item.login}" class="contributor-link" target="_blank" rel="nofollow sponsored" id="${item.login}">
<image x="${x}" y="${y}" width="${width}" height="${height}" xlink:href="${img}"/>
</a>`;
        }));
        const contributorsHeight = calcSectionHeight(this.data.length, this.options);
        this.svg = this.options.svgTemplate.replace('{{ width }}', String(this.options.svgWidth))
            .replace('{{ contributorsHeight }}', String(contributorsHeight))
            .replace('{{{ contributors }}}', avatar.join(''));
        (0, core_1.setOutput)('svg', this.svg);
        return this.svg;
    }
    async writeFile() {
        const data = new Uint8Array(Buffer.from(this.svg));
        await fs_1.default.promises.writeFile(this.options.svgPath, data);
        (0, core_1.info)(`Generated: "${this.options.svgPath}"`);
    }
}
try {
    ;
    (async () => {
        const gen = new Generator();
        await gen.getContributors();
        await gen.generator();
        await gen.writeFile();
    })();
}
catch (error) {
    (0, core_1.setFailed)(error.message);
}
//# sourceMappingURL=index.js.map