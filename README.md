github-action-contributors
===

[![Build & Deploy](https://github.com/jaywcjlove/github-action-contributors/actions/workflows/ci.yml/badge.svg)](https://github.com/jaywcjlove/github-action-contributors/actions/workflows/ci.yml)
[![Repo Dependents](https://badgen.net/github/dependents-repo/jaywcjlove/github-action-contributors)](https://github.com/jaywcjlove/github-action-contributors/network/dependents)

Github action generates dynamic image URL for contributor list to display it!

## Contributors

As always, thanks to our amazing contributors!

<a href="https://github.com/jaywcjlove/github-action-contributors/graphs/contributors">
  <img src="https://jaywcjlove.github.io/github-action-contributors/CONTRIBUTORS.svg" />
</a>

Made with [github-action-contributors](https://github.com/jaywcjlove/github-action-contributors).

## Usage

```yml
- run: mkdir -p build
- name: Generate Contributors Images
  uses: jaywcjlove/github-action-contributors@main
  with:
    filter-author: (renovate\[bot\]|renovate-bot|dependabot\[bot\])
    output: build/CONTRIBUTORS.svg
    avatarSize: 42

- name: Deploy
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./build
```

```
https://jaywcjlove.github.io/github-action-contributors/CONTRIBUTORS.svg
```

Use in markdown

```markdown
## Contributors

As always, thanks to our amazing contributors!

<a href="https://github.com/jaywcjlove/github-action-contributors/graphs/contributors">
  <img src="https://jaywcjlove.github.io/github-action-contributors/CONTRIBUTORS.svg" />
</a>

Made with [github-action-contributors](https://github.com/jaywcjlove/github-action-contributors).
```

## Inputs

- `token` - Your `GITHUB_TOKEN`. This is required. Why do we need `token`? Read more here: [About the GITHUB_TOKEN secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret). Default: `${{ github.token }}`
- `filter-author` - Regular expression filtering'.
- `count` - Specify the max count of contributors listed. Default list all contributors.
- `output` - output image path. default: `CONTRIBUTORS.svg`
- `truncate` - Truncate username by specified length, `0` for no truncate. default: `12`
- `svgWidth` - Width of the generated SVG. default: `740`
- `avatarSize` - Size of user avatar. default: `24`
- `avatarMargin` - Margin of user avatar. default: `5`
- `userNameHeight` - Height of user name. default: `0`
- `svgTemplate` - Template to render SVG.

```xml
<svg
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  version="1.1"
  width="{{ width }}"
  height="{{ contributorsHeight }}"
>
  <style>.contributor-link { cursor: pointer; }</style>
  {{{ contributors }}}
</svg>
```

## Outputs

- `svg` svg image string: `<svg xmlns....`.

## Quick Start

```shell
$ npm install

$ npm run watch # Listen compile .ts files.
$ npm run build # compile .ts files.
```

## Related

- [Github Release Changelog](https://github.com/jaywcjlove/changelog-generator) Generator A GitHub Action that compares the commit differences between two branches
- [Create Tags From](https://github.com/jaywcjlove/create-tag-action) Auto create tags from commit or package.json.
- [Create Coverage Badges](https://github.com/jaywcjlove/coverage-badges-cli) Create coverage badges from coverage reports. (no 3rd parties servers)
- [Generated Badges](https://github.com/jaywcjlove/generated-badges) Create a badge using GitHub Actions and GitHub Workflow CPU time (no 3rd parties servers)


## Contributors

As always, thanks to our amazing contributors!

<a href="https://github.com/jaywcjlove/github-action-contributors/graphs/contributors">
  <img src="https://jaywcjlove.github.io/github-action-contributors/CONTRIBUTORS.svg" />
</a>

Made with [action-contributors](https://github.com/jaywcjlove/github-action-contributors).

## License

Licensed under the MIT License.
