/* eslint-disable prettier/prettier */
import {Observable} from "rxjs";
import Axios, {CancelToken} from 'axios';

export function simulateDelay(timeDelayByCall: number[], name: string) {
    let callCount = 0;

    console.log('next ' + name + ' delay will be ' + (timeDelayByCall.length ? timeDelayByCall[callCount] : 0) + ' seconds');
    return function () {
        return wait((timeDelayByCall[callCount++] || 0) * 1000).then(a => {
            console.log('next ' + name + ' delay will be ' + (timeDelayByCall[callCount] || 0) + ' seconds');
            return a;
        });
    };
}

function wait(milliseconds: number) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, milliseconds);
    });
}


export function fromCancelablePromise<T>(fetch: (token: CancelToken) => Promise<T>): Observable<T> {
    return new Observable<T>((obs) => {
        const source = Axios.CancelToken.source();
        fetch(source.token)
            .then(response => {
                obs.next(response);
                obs.complete();
            })
            .catch(error => obs.error(error));

        return () => {
            if (!obs.closed) {
                try {
                    source.cancel()
                } catch {
                }
                obs.complete();
            }
        };
    });
}
