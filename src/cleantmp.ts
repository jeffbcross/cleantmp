import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { mkdtemp } from 'fs';
import * as path from 'path';
import * as rimraf from 'rimraf';

export default function cleantmp (prefix?: string): Observable<string> {
  return Observable.create((observer: Observer<string>) => {
    let folder: string;
    mkdtemp(prefix, (err: NodeJS.ErrnoException, _folder: string) => {
      if (err) {
        observer.error(err);
      } else {
        folder = _folder;
        observer.next(folder);
      }
    });

    return () => {
      if (folder) rimraf.sync(folder);
    };
  });
}
