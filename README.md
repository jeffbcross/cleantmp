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
which accepts two positional optional arguments:
 * `prefix: string`: optional prefix
 * `options: CleantmpOptions`: Additional options


### Interfaces

```typescript
interface CleantmpOptions {
  // the compilation.assets object from webpack
  // Required if `pattern` or `copyFolderToAssetsPattern` are provided.
  assets?: WebpackCompilationAssets;
  // Glob pattern to use to copy compilation assets to fs
  // If no pattern is provided, no assets will be copied to file system.
  pattern?: string;
  //
  copyFolderToAssets?: boolean;
  // Glob pattern to copy file system assets back to compilation assets object
  // If no pattern provided, no assets will be copied back.
  copyFolderToAssetsPattern?: string;
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
import cleantmp from 'webpack-util-cleantmp';

compiler.plugin('emit', (compilation) => {
  const subscription = cleantmp('tmpprefix', {
    assets: compilation.assets,
    pattern: '**/*.json'
  })
    .subscribe((tmpDir: string) => {
      // i.e. tmpDir == tmpprefix8FzVr2
      const fileContents = fs.readFileSync(path.resolve(tmpDir, 'foo.json'), 'utf-8');
      // Unsubscribing == rm -rf <tmpdir>
      subscription.unsubscribe();
    });
});
```

