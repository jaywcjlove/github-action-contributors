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

Write contributors(**`htmlTable`**) to markdown Example:

<!--GAMFC_TABEL--><table><tr>
  <td align="center">
    <a href="https://github.com/jaywcjlove">
      <img src="https://avatars.githubusercontent.com/u/1680273?v=4" width="36;" alt="jaywcjlove"/>
    <br /><sub><b>jaywcjlove</b></sub>
    </a>
  </td>
  <td align="center">
    <a href="https://github.com/github-actions[bot]">
      <img src="https://avatars.githubusercontent.com/in/15368?v=4" width="36;" alt="github-actions[bot]"/>
    <br /><sub><b>github-actions[bot]</b></sub>
    </a>
  </td>
</tr></table><!--GAMFC_TABEL-END-->


Write contributors(**`htmlList`**) to markdown Example:

<!--GAMFC--><a href="https://github.com/jaywcjlove">
  <img src="https://avatars.githubusercontent.com/u/1680273?v=4" width="36;" alt="jaywcjlove"/>
</a>
<a href="https://github.com/github-actions[bot]">
  <img src="https://avatars.githubusercontent.com/in/15368?v=4" width="36;" alt="github-actions[bot]"/>
</a><!--GAMFC-END-->

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

Made with [contributors](https://github.com/jaywcjlove/github-action-contributors).
```

<a href="https://github.com/jaywcjlove/github-action-contributors/graphs/contributors">
  <img src="https://jaywcjlove.github.io/github-action-contributors/CONTRIBUTORS.svg" />
</a>

### Write contributors(**`htmlList`**) to markdown

```yml
- name: Generate Contributors Images
  uses: jaywcjlove/github-action-contributors@main
  id: contributors
  with:
    filter-author: (renovate\[bot\]|renovate-bot|dependabot\[bot\])
    avatarSize: 42

- name: Modify README.md
  uses: jaywcjlove/github-action-modify-file-content@main
  with:
    path: README.md
    body: '${{steps.contributors.outputs.htmlList}}'
```

Use in `README.md` markdown

```markdown
## Contributors

As always, thanks to our amazing contributors!

<!--GAMFC--><a href="https://github.com/jaywcjlove">
  <img src="https://avatars.githubusercontent.com/u/1680273?v=4" width="36;" alt="jaywcjlove"/>
</a>
<a href="https://github.com/github-actions[bot]">
  <img src="https://avatars.githubusercontent.com/in/15368?v=4" width="36;" alt="github-actions[bot]"/>
</a><!--GAMFC-END-->

Made with [contributors](https://github.com/jaywcjlove/github-action-contributors).
```

Write contributors(**`htmlList`**) to markdown Example:

<!--GAMFC--><a href="https://github.com/jaywcjlove">
  <img src="https://avatars.githubusercontent.com/u/1680273?v=4" width="36;" alt="jaywcjlove"/>
</a>
<a href="https://github.com/github-actions[bot]">
  <img src="https://avatars.githubusercontent.com/in/15368?v=4" width="36;" alt="github-actions[bot]"/>
</a><!--GAMFC-END-->

### Write contributors(**`htmlTable`**) to markdown

```yml
- name: Generate Contributors Images
  uses: jaywcjlove/github-action-contributors@main
  id: contributors
  with:
    filter-author: (renovate\[bot\]|renovate-bot|dependabot\[bot\])
    openDelimiter: '<!--GAMFC_DELIMITER-->'
    closeDelimiter: '<!--GAMFC_DELIMITER-END-->'
    hideName: 'true' # Hide names in htmlTable
    avatarSize: 100  # Set the avatar size.

- name: Modify htmlTable README.md
  uses: jaywcjlove/github-action-modify-file-content@main
  with:
    path: README.md
    body: '${{steps.contributors.outputs.htmlTable}}'
```

Use in `README.md` markdown

```markdown
## Contributors

As always, thanks to our amazing contributors!

<!--GAMFC_DELIMITER-->will be replaced here<!--GAMFC_DELIMITER-END-->

Made with [contributors](https://github.com/jaywcjlove/github-action-contributors).
```

Write contributors(**`htmlTable`**) to markdown Example:

<!--GAMFC_TABEL_HIDE_NAME--><table><tr>
  <td align="center">
    <a href="https://github.com/jaywcjlove">
      <img src="https://avatars.githubusercontent.com/u/1680273?v=4" width="100;" alt="jaywcjlove"/>
    </a>
  </td>
  <td align="center">
    <a href="https://github.com/github-actions[bot]">
      <img src="https://avatars.githubusercontent.com/in/15368?v=4" width="100;" alt="github-actions[bot]"/>
    </a>
  </td>
  <td align="center">
    <a href="https://github.com/renovate[bot]">
      <img src="https://avatars.githubusercontent.com/in/2740?v=4" width="100;" alt="renovate[bot]"/>
    </a>
  </td>
</tr></table><!--GAMFC_TABEL_HIDE_NAME-END-->

## Inputs

- `token` - Your `GITHUB_TOKEN`. This is required. Why do we need `token`? Read more here: [About the GITHUB_TOKEN secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret). Default: `${{ github.token }}`
- `filter-author` - Regular expression filtering'.
- `count` - Specify the max count of contributors listed. Default list all contributors.
- `output` - output image path. default: `CONTRIBUTORS.svg`
- `truncate` - Truncate username by specified length, `0` for no truncate. default: `12`
- `svgWidth` - Width of the generated SVG. default: `740`
- `avatarSize` - Size of user avatar. default: `24`
- `avatarMargin` - Margin of user avatar. default: `5`
- `hideName` - Hide names in `htmlTable`
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
- `htmlTable` Contributor HTML \<Table> form string
- `htmlList` Contributor HTML \<a> list form string

### `htmlTable`

```html
<table>
  <tr>
    <td align="center">
      <a href="https://github.com/jaywcjlove">
        <img src="https://avatars.githubusercontent.com/u/1680273?v=4" width="36;" alt="jaywcjlove"/><br />
        <sub><b>jaywcjlove</b></sub>
        </a>
    </td>
  </tr>
</table>
```

### `htmlList`

```html
<a href="https://github.com/jaywcjlove">
  <img src="https://avatars.githubusercontent.com/u/1680273?v=4" width="36;" alt="jaywcjlove"/>
</a>
<a href="https://github.com/github-actions[bot]">
  <img src="https://avatars.githubusercontent.com/in/15368?v=4" width="36;" alt="github-actions[bot]"/>
</a
```

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
- [Create Coverage Package](https://github.com/jaywcjlove/github-action-packag) Read and modify the contents of `package.json`.
- [Generated Badges](https://github.com/jaywcjlove/generated-badges) Create a badge using GitHub Actions and GitHub Workflow CPU time (no 3rd parties servers)

## Contributors

As always, thanks to our amazing contributors!

<!--GAMFC--><a href="https://github.com/jaywcjlove">
  <img src="https://avatars.githubusercontent.com/u/1680273?v=4" width="36;" alt="jaywcjlove"/>
</a>
<a href="https://github.com/github-actions[bot]">
  <img src="https://avatars.githubusercontent.com/in/15368?v=4" width="36;" alt="github-actions[bot]"/>
</a><!--GAMFC-END-->

Made with [contributors](https://github.com/jaywcjlove/github-action-contributors).

## License

Licensed under the MIT License.
