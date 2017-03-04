import { Observable, Observer } from 'rxjs';
import { mkdtemp, writeFile } from 'fs';
import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';
import * as minimatch from 'minimatch';
import * as mkdirp from 'mkdirp';

const glob = require('glob');

export function cleantmp (options: CleantmpOptions = {}): Observable<string> {
  const prefix = options.prefix || 'tmp';
  return Observable.create((observer: Observer<string>) => {
    let folder: string;
    mkdtemp(prefix, (err: NodeJS.ErrnoException, _folder: string) => {
      if (err) {
        observer.error(err);
      } else {
        folder = _folder;
        if (options.assets) {
          copyAssetsToFolder(folder, options.assets, options.globToDisk)
            .then(() => {
              observer.next(folder);
            }, (err: any) => {
              observer.error(err);
            });
        } else {
          observer.next(folder);
        }
      }
    });

    return () => {
      if (folder) {
        if (options.globFromDisk) copyFolderToAssets(folder, options.assets, options.globFromDisk)
        rimraf.sync(folder);
      }
    };
  });
}

function copyAssetsToFolder(directory: string, assets: WebpackCompilationAssets, pattern?: string): Promise<void> {
  return Promise.resolve(Object.keys(assets)
      .filter((match: string) => minimatch(match, pattern)))
    .then((matches: string[]) => Promise.all(matches.map((match: string) => {
        return new Promise((res, rej) => {
          const subdir = match.replace(path.basename(match), '');
          if (subdir) mkdirp.sync(path.join(directory, subdir))          
          writeFile(path.resolve(directory, match), assets[match].source(), (err: any) => {
            if (err) return rej(err);
            res();
          });
        });
      })));
}

function copyFolderToAssets(directory: string, assets: WebpackCompilationAssets, pattern?: string) {
  pattern = pattern || '**/*';
  glob.sync(pattern, {cwd: directory}).forEach((f: string) => {
    const source = fs.readFileSync(path.resolve(directory, f)).toString();
    assets[f] = {
      source: () => source,
      size: () => source.length
    };
  });
}

export interface CleantmpOptions {
  prefix?: string;
  assets?: WebpackCompilationAssets;
  globToDisk?: string;
  globFromDisk?: string;
}

export interface WebpackCompilationAssets {
  [key:string]: {
    source: () => string,
    size: () => number
  }
}
