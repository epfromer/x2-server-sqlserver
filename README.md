# pst-mongo

Extract objects from MS Outlook/Exchange PST files and stores in MongoDB

## Features
Walks a specified folder of PSTs, processes each and stores the emails in the specified MongoDB database.

## Install

`npm install --save pst-mongo`


## Scripts

 - **npm run clean** : `rimraf dist`
 - **npm run build** : `tsc`
 - **npm run start** : `NODE_ENV=dev npm-run-all clean build --parallel watch:build watch:server --print-label`
 - **npm run watch:build** : `tsc --watch`
 - **npm run watch:server** : `nodemon './dist/index.js' --watch './dist'`
 - **npm run readme** : `node ./node_modules/.bin/node-readme`

## Dependencies

Package | Version | Dev
--- |:---:|:---:
[config](https://www.npmjs.com/package/config) | ^1.30.0 | ✖
[log-update](https://www.npmjs.com/package/log-update) | ^2.3.0 | ✖
[mongodb](https://www.npmjs.com/package/mongodb) | ^3.0.5 | ✖
[nodemon](https://www.npmjs.com/package/nodemon) | ^1.17.3 | ✖
[pst-extractor](https://www.npmjs.com/package/pst-extractor) | ^1.1.0 | ✖
[rimraf](https://www.npmjs.com/package/rimraf) | ^2.6.2 | ✖
[winston](https://www.npmjs.com/package/winston) | ^2.4.1 | ✖
[@types/config](https://www.npmjs.com/package/@types/config) | 0.0.34 | ✔
[@types/long](https://www.npmjs.com/package/@types/long) | ^3.0.32 | ✔
[@types/mongodb](https://www.npmjs.com/package/@types/mongodb) | ^3.0.9 | ✔
[@types/node](https://www.npmjs.com/package/@types/node) | ^9.6.1 | ✔
[@types/typescript](https://www.npmjs.com/package/@types/typescript) | ^2.0.0 | ✔
[@types/winston](https://www.npmjs.com/package/@types/winston) | ^2.3.8 | ✔
[debug](https://www.npmjs.com/package/debug) | ^3.1.0 | ✔
[node-readme](https://www.npmjs.com/package/node-readme) | ^0.1.9 | ✔
[npm-run-all](https://www.npmjs.com/package/npm-run-all) | ^4.1.2 | ✔
[source-map-support](https://www.npmjs.com/package/source-map-support) | ^0.5.4 | ✔
[supports-color](https://www.npmjs.com/package/supports-color) | ^5.3.0 | ✔
[ts-node](https://www.npmjs.com/package/ts-node) | ^5.0.1 | ✔
[typescript](https://www.npmjs.com/package/typescript) | ^2.8.1 | ✔


## Contributing

Contributions welcome; Please submit all pull requests the against master branch. If your pull request contains JavaScript patches or features, you should include relevant unit tests. Please check the [Contributing Guidelines](contributng.md) for more details. Thanks!

## Author

Ed Pfromer (epfromer@gmail.com)

## License

 - **(Apache-2.0 OR GPL-3.0)** : null
