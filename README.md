# iso-3166-2.json

[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][downloads-url]
[![Size][size-image]][size-url]
[![Gzipped size][size-image-gz]][size-url]

> JSON file of ISO 3166-2 subdivisions.

## Install

```bash
$ npm i iso-3166-2.json --save
```

## Layout

```js
{
  [country code]: {
    name: [country name]
    divisions: {
      [subdivision code]: [subdivision name]
    }
  }
}
```

or

```js
{
  ...
  US: {
    name: "United States"
    divisions: {
      ...
      "US-CA": "California"
      ...
    }
  }
  ...
}
```

## Source

[eQuest.csv](./data/eQuest.csv)

From eQuest, derived from:

http://docs.equest.com/eQuestCountryAndStateCodes.xls

## Contributing

This fork prepares contributions for upstream; it does not publish a separate
package. With Node 22, run `npm ci --ignore-scripts` followed by `npm run verify`.
Checks run offline after installation and preserve the published data. See
[CONTRIBUTING.md](./CONTRIBUTING.md) for source provenance, historical duplicate
exceptions, and review requirements.

[size-image]: https://badge-size.herokuapp.com/olahol/iso-3166-2.json/master/iso-3166-2.json.svg
[size-image-gz]: https://badge-size.herokuapp.com/olahol/iso-3166-2.json/master/iso-3166-2.json.svg?compression=gzip
[size-url]: https://github.com/olahol/iso-3166-2.json/iso-3166-2.json

[npm-image]: https://img.shields.io/npm/v/iso-3166-2.json.svg?style=flat-square
[npm-url]: https://npmjs.org/package/iso-3166-2.json
[downloads-image]: http://img.shields.io/npm/dm/iso-3166-2.json.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/iso-3166-2.json
