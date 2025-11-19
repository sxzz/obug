# obug

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Unit Test][unit-test-src]][unit-test-href]

A lightweight JavaScript debugging utility, forked from [debug](https://www.npmjs.com/package/debug), featuring TypeScript and ESM support.

> [!NOTE]
> obug v1 retains most of the compatibility with [debug](https://github.com/debug-js/debug), but drops support for older browsers and Node.js, making it a drop-in replacement.
>
> The upcoming v2 refactors some API imports and usage for better support of ESM and TypeScript, easier customization, and an even smaller package size.

## Key Differences from `debug`

- ✨ Minimal footprint
- 📦 Zero dependencies
- 📝 Full TypeScript support
- 🚀 Native ESM compatibility
- 🌐 Optimized for modern runtimes
  - ES2015+ browsers
  - Node.js 20.19 and above

## Installation

```bash
npm install obug
```

## Usage

Please refer to the original [debug](https://github.com/debug-js/debug#usage) package for usage instructions.

## Original Authors

As obug is a fork of debug, we would like to acknowledge the original authors:

- TJ Holowaychuk
- Nathan Rajlich
- Andrew Rhyne
- Josh Junon

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2025-PRESENT [Kevin Deng](https://github.com/sxzz)

[The MIT License](./LICENSE) Copyright (c) 2014-2017 TJ Holowaychuk &lt;tj@vision-media.ca&gt;

[The MIT License](./LICENSE) Copyright (c) 2018-2021 Josh Junon

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/obug.svg
[npm-version-href]: https://npmjs.com/package/obug
[npm-downloads-src]: https://img.shields.io/npm/dm/obug
[npm-downloads-href]: https://www.npmcharts.com/compare/obug?interval=30
[unit-test-src]: https://github.com/sxzz/obug/actions/workflows/unit-test.yml/badge.svg
[unit-test-href]: https://github.com/sxzz/obug/actions/workflows/unit-test.yml
