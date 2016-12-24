Create and populate temporary directory with Webpack compilation assets
using Node's `mkdtemp` function, and have them automatically cleaned up when you're done using the
magic of RxJS Observables. This is particularly useful when writing plugins to wrap
other node libraries that load files from the file system.

## Installation

```
$ npm install webpack-util-cleantmp
```

## API

This library provides a single function, `cleantmp`, which returns an `Observable`
that will resolve with the name of the new directory.
The `cleantmp` function accepts 1 optional positional argument which conforms to
the `CleantmpOptions` interface.

### Simple Example

```typescript
const cleantmp = require('webpack-util-cleantmp').cleantmp;
const subscription = cleantmp().subscribe(dir => {
  console.log('tmp dir:', dir)
  subscription.unsubscribe();
});
```

### Interfaces

```typescript
interface CleantmpOptions {
  // the compilation.assets object from webpack
  // Required if `globToDisk` or `globFromDisk` are provided.
  assets?: WebpackCompilationAssets;
  // Glob pattern to use to copy compilation assets to fs
  // If no pattern is provided, no assets will be copied to file system.
  globToDisk?: string;
  // Glob pattern to copy file system assets back to compilation assets object
  // If no pattern provided, no assets will be copied back to compilation assets.
  globFromDisk?: string;
}

export interface WebpackCompilationAssets {
  [key:string]: {
    source: () => string,
    size: () => number
  }
}
```

### Example Plugin

```typescript
import {cleantmp} from 'webpack-util-cleantmp';

compiler.plugin('emit', (compilation, callback) => {
  const subscription = cleantmp('tmpprefix', {
    assets: compilation.assets,
    globToDisk: '**/*.json'
  })
    .subscribe((tmpDir: string) => {
      // i.e. tmpDir == tmpprefix8FzVr2
      const fileContents = fs.readFileSync(path.resolve(tmpDir, 'foo.json'), 'utf-8');
      // Unsubscribing == rm -rf <tmpdir>
      subscription.unsubscribe();
      callback();
    });
});
```
