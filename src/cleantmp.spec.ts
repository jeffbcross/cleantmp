import cleantmp from './cleantmp';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/take';
import * as fs from 'fs';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000;

describe('cleantmp', () => {
  const defaultPrefix = 'tmpprefix';
  it('should return an observable', () => {
    expect(cleantmp(defaultPrefix) instanceof Observable).toBe(true);
  });

  it('should not create a tmp dir immediately', () => {
    cleantmp(defaultPrefix);
    expect(getFilesWithPrefix(defaultPrefix).length).toBe(0);
  });

  it('should create a tmp dir when subscribed', (done) => {
    cleantmp(defaultPrefix)
      .take(1)
      .subscribe(() => {
        expect(getFilesWithPrefix(defaultPrefix).length).toBe(1);
        done();
      });
  });

  it('should remove the tmp dir when unsubscribed', (done) => {
    cleantmp(defaultPrefix)
      .take(1)
      .subscribe(null, null, () => {
        setTimeout(() => {
          expect(getFilesWithPrefix(defaultPrefix).length).toBe(0);
          done();
        }, 0);

      });
  });

  it('should emit error if cannot create directory', (done) => {
    const nextSpy = jasmine.createSpy('next');
    cleantmp(`./dist/foo/bar/baz`)
      .subscribe(nextSpy, () => {
        expect(nextSpy).not.toHaveBeenCalled();
        done();
      });
  });

  it('should create in a different directory if provided', (done) => {
    cleantmp(`./dist/${defaultPrefix}`)
      .take(1)
      .subscribe((dir: string) => {
        expect(fs.statSync(dir).isDirectory()).toBe(true);
        done()
      });
  });
});

function getFilesWithPrefix(prefix: string): string[] {
  const files = fs.readdirSync('.');
  return files.filter((f: string) => f.indexOf(prefix) === 0);
}