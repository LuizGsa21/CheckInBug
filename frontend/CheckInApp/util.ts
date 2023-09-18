/* eslint-disable prettier/prettier */
import {BehaviorSubject, combineLatest, from, isObservable, Observable, of, Subscription} from "rxjs";
import Axios, {CancelToken} from 'axios';
import {distinctUntilChanged, finalize, map, mergeMap, take} from "rxjs/operators";
import {fromPromise, isPromise} from "rxjs/internal-compatibility";

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

export type SelfOrFactory<T> = T | (() => T) | ((...args: any[]) => T);
export class CustomCommand<TExecute> {
    private _execute: SelfOrFactory<Observable<TExecute>> | SelfOrFactory<Promise<TExecute>>;

    private readonly _canExecute$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
    private readonly _isExecuting$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private _sub?: Subscription;
    public execute: (...args: any[]) => void;

    constructor(
        execute: SelfOrFactory<Observable<TExecute>> | SelfOrFactory<Promise<TExecute>>,
        canExecute: Observable<boolean> = of(true),
    ) {

        this._execute = execute;

        combineLatest([canExecute, this._isExecuting$])
            .pipe(
                map(([userDefinedCanExecute, isExecuting]: [boolean, boolean]) => {
                    return userDefinedCanExecute && !isExecuting;
                }),
                distinctUntilChanged()
            )
            .subscribe(this._canExecute$.next.bind(this._canExecute$), (e) => console.log(e), () => {});

        canExecute.subscribe(this._canExecute$.next.bind(this._canExecute$), (e) => console.log(e), () => {});



        this.execute = (...args: any[]) => {
            if (!this._canExecute$.getValue()) {
                return;
            }
            this._isExecuting$.next(true);
            this._execute = toObservable(this._execute, args);
            this._sub = this._execute.pipe(
                mergeMap(value => {
                    if (isObservable(value)) {
                        return value;
                    } else if (isPromise(value)) {
                        return fromPromise(value)
                    } else {
                        return of(value)
                    }
                }),
                take(1),
                finalize(() => this._isExecuting$.next(false))
            ).subscribe(() => {}, (e) => console.log(e), () => {})
        };
    }


    setExecute(execute: SelfOrFactory<Observable<TExecute>> | SelfOrFactory<Promise<TExecute>>) {
        this._execute = execute;
    }

    get isExecuting$() {
        return this._isExecuting$.pipe(distinctUntilChanged());
    }
    get isExecuting() {
        return this._isExecuting$.getValue();
    }

    get canExecute$(): Observable<boolean> {
        return this._canExecute$.pipe(distinctUntilChanged());
    }
    get canExecute(): boolean {
        return this._canExecute$.getValue();
    };


    unsubscribe() {
        this._sub?.unsubscribe();
    }
}

function toObservable(obj: any, ...args: any[]): Observable<any> {

    if (typeof obj === 'function') {
        return of(null).pipe(mergeMap((_) => toObservable(obj(...args))));
    }

    if (isPromise(obj)) {
        return of(null).pipe(mergeMap((_) => fromPromise(obj)));
    } else {
        return from(obj);
    }
}
