import {cleantmp} from 'webpack-util-cleantmp';
const fs = require('fs');

function CopyToDisk() {}

CopyToDisk.prototype.apply = function(compiler: any) {
  compiler.plugin("emit", function(compilation: any, callback: Function) {
    let subscription = cleantmp({
      prefix: 'integration',
      assets: compilation.assets,
      globToDisk: '**/*.js',
      globFromDisk: '**/*.json'
    }).subscribe((dir: string) => {
      // Will throw if file not present.
      fs.readFileSync(`./${dir}/bundle.js`);
      fs.writeFileSync(`${dir}/foo.json`, JSON.stringify({foo: 'bar'}));
      subscription.unsubscribe();
      // Will throw if not present
      compilation.assets['foo.json'].source();
      callback();
    });
  });
}

module.exports = CopyToDisk;
