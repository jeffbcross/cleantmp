import cleantmp, { WebpackCompilationAssets } from './cleantmp';
import { Observable } from 'rxjs/Observable';
import * as fs from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

describe('cleantmp', () => {
  const defaultPrefix = 'tmpprefix';
  const assets: WebpackCompilationAssets = {
    'package.json': {
      source: () => '{"foo":"bar"}',
      size: () => 10
    }
  };

  afterEach(() => {
    fs.readdirSync('.')
      .filter((p:string) => p.startsWith(defaultPrefix))
      .forEach((dir: string) => {
        rimraf.sync(dir);
      });
  });


  it('should return an observable', () => {
    expect(cleantmp({ prefix: defaultPrefix }) instanceof Observable).toBe(true);
  });

  it('should not create a tmp dir immediately', () => {
    cleantmp({ prefix: defaultPrefix });
    expect(getFilesWithPrefix(defaultPrefix).length).toBe(0);
  });

  it('should create a tmp dir when subscribed', (done) => {
    cleantmp({ prefix: defaultPrefix })
      .take(1)
      .subscribe(() => {
        expect(getFilesWithPrefix(defaultPrefix).length).toBe(1);
        done();
      });
  });

  it('should use "tmp" if not provided prefix', (done) => {
    cleantmp()
      .take(1)
      .subscribe((folder: string) => {
        expect(/^tmp/.test(folder)).toBe(true);
        done();
      });
  });

  it('should remove the tmp dir when unsubscribed', (done) => {
    cleantmp({ prefix: defaultPrefix })
      .take(1)
      .subscribe(null, done.fail, () => {
        setTimeout(() => {
          expect(getFilesWithPrefix(defaultPrefix).length).toBe(0);
          done();
        }, 0);
      });
  });

  it('should emit error if cannot create directory', (done) => {
    const nextSpy = jasmine.createSpy('next');
    cleantmp({ prefix: `./dist/foo/bar/baz` })
      .subscribe(nextSpy, () => {
        expect(nextSpy).not.toHaveBeenCalled();
        done();
      });
  });

  it('should create in a different directory if provided', (done) => {
    cleantmp({ prefix: `./dist/${defaultPrefix}` })
      .take(1)
      .subscribe((dir: string) => {
        expect(fs.statSync(dir).isDirectory()).toBe(true);
        done()
      });
  });

  it('should copy files from the compilation assets to the dir', (done) => {
    cleantmp({ prefix: defaultPrefix, assets, pattern: '**/*.json' })
      .take(1)
      .subscribe((dir: string) => {
        const contents = fs.readdirSync(dir);
        expect(contents[0]).toBe('package.json');
        expect(fs.readFileSync(path.resolve(dir, contents[0]), 'utf-8'))
          .toBe('{"foo":"bar"}')
      }, done.fail, done);
  });

  it('should copy files back from dir to compilation assets', (done) => {
    const cssContents = '* {color: #f00}';
    cleantmp({ prefix: defaultPrefix, assets, pattern: '**/*.json', copyFolderToAssets: true})
      .take(1)
      .subscribe((dir: string) => {
        fs.writeFileSync(path.resolve(dir, 'myfile.css'), cssContents);
      }, done.fail, () => {
        setTimeout(() => {
          expect(assets['myfile.css'].source()).toBe(cssContents);
          delete assets['myfile.css'];
          done();
        }, 0);
      });
  });


  it('should copy files back from dir to compilation assets with pattern', (done) => {
    cleantmp({
      prefix: defaultPrefix,
      assets,
      pattern: '**/*.json',
      copyFolderToAssets: true,
      copyFolderToAssetsPattern: '**/*.json'})
      .take(1)
      .subscribe((dir: string) => {
        fs.writeFileSync(path.resolve(dir, 'myfile.css'), '* {color: #f00}');
      }, done.fail, () => {
        setTimeout(() => {
          expect(assets['myfile.css']).toBeUndefined();
          done();
        }, 0);
      });
  });
});

function getFilesWithPrefix(prefix: string): string[] {
  const files = fs.readdirSync('.');
  return files.filter((f: string) => f.indexOf(prefix) === 0);
}