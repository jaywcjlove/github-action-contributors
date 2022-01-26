github-action-contributors
===

Github action generates dynamic image URL for contributor list to display it!

## Inputs

#### `token`

Your `GITHUB_TOKEN`. This is required. Why do we need `token`? Read more here: [About the GITHUB_TOKEN secret](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/authenticating-with-the-github_token#about-the-github_token-secret)

Default: `${{ github.token }}`

#### filter-author:

Regular expression filtering'.

#### count:

Specify the max count of contributors listed. Default list all contributors.

#### output:

output image path. default: `CONTRIBUTORS.svg`

#### truncate:

Truncate username by specified length, `0` for no truncate. default: `12`

#### svgWidth:

Width of the generated SVG. default: `740`

#### avatarSize:

Size of user avatar. default: `24`

#### avatarMargin:

Margin of user avatar. default: `5`

#### userNameHeight:

Height of user name. default: `0`

#### svgTemplate

Template to render SVG.

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

## Example Usage


```yml
- name: Generate Contributors Images
  uses: jaywcjlove/github-action-contributors@main
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    filter-author: 'renovate\\[bot\\]'
    output: build/CONTRIBUTORS.svg
```

## Quick Start

```shell
$ npm install

$ npm run watch # Listen compile .ts files.
$ npm run build # compile .ts files.
```
