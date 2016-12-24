const cleantmp = require('webpack-util-cleantmp');
const fs = require('fs');

function CopyToDisk() {}

CopyToDisk.prototype.apply = function(compiler) {
  compiler.plugin("emit", function(compilation, callback) {
    let subscription = cleantmp({
      prefix: 'integration',
      assets: compilation.assets,
      globToDisk: '**/*.js',
      globFromDisk: '**/*.json'
    }).subscribe((dir) => {
      // Will throw if file not present.
      fs.readFileSync(`./${dir}/bundle.js`);
      fs.writeFileSync(`${dir}/foo.json`, JSON.stringify({foo: 'bar'}));
      subscription.unsubscribe();
      compilation.assets['foo.json'].source();
    });
  });
}

module.exports = CopyToDisk;
