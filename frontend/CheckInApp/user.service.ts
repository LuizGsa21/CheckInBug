/* eslint-disable prettier/prettier */
import axios from 'axios';
import {fromCancelablePromise, simulateDelay} from './util';
import {BehaviorSubject} from 'rxjs';
import {filter, map, takeUntil, tap} from 'rxjs/operators';
import {flatMap} from 'rxjs/internal/operators';
import {fromPromise} from 'rxjs/internal-compatibility';

let axiosInstance = axios.create();

const simulateUserInfoDelay = simulateDelay([0, 10, 10], 'User/UserInfo');
const simulateCheckInDelay = simulateDelay([10], 'User/CheckIn');

export class UserService {
  private static ignoreRefresh$ = new BehaviorSubject<boolean>(false);
  static cancelPendingUserRefresh() {
    if (this.ignoreRefresh$.getValue()) {
      return;
    }
    this.ignoreRefresh$.next(true);
    this.ignoreRefresh$.next(false);
  }

  static async CheckIn(): Promise<
    | {status: 200; data: CheckInEvent; success: true}
    | {status: number; data: string | null; success: false}
  > {
     try {
       this.ignoreRefresh$.next(true);
       return await axiosInstance
           .post('http://localhost:5279/User/CheckIn')
           .catch(r => {
             return {
               status: r.response.status,
               data: r.response.data,
               success: r.status == 200,
             };
           })
           .then(r => ({status: r.status, data: r.data, success: r.status == 200}))
     } finally {
       this.ignoreRefresh$.next(false);
     }
  }

  static async CheckOut(): Promise<
    | {status: 200; data: CheckInEvent; success: true}
    | {status: number; data: string | null; success: false}
  > {
    try {
      this.ignoreRefresh$.next(true);
      return await axiosInstance
          .post('http://localhost:5279/User/CheckOut')
          .catch(r => {
            return {
              status: r.response.status,
              data: r.response.data,
              success: r.status == 200,
            };
          })
          .then(r => simulateCheckInDelay().then(_ => r))
          .then(r => ({status: r.status, data: r.data, success: r.status == 200}))
    } finally {
      this.ignoreRefresh$.next(false);
    }
  }

  static UserInfo(): Promise<
    | {status: 200; data: UserInfo; success: true}
    | {status: number; data: string | null; success: false, cancelled?: boolean}
  > {
    console.log('http://localhost:5279/User/UserInfo');

    return fromCancelablePromise(ct => {
      return axiosInstance.post('http://localhost:5279/User/UserInfo', {
        cancelToken: ct,
      });
    })
      .pipe(
        flatMap(r => fromPromise(simulateUserInfoDelay()).pipe(map(() => r))),
        takeUntil(this.ignoreRefresh$.pipe(filter(ignore => ignore))),
      )
      .toPromise()
      .catch(r => ({
        status: r.response.status,
        data: r.response.data,
        success: r.status == 200,
      }))
      .then(r => {
        if (r === undefined) {
          // request cancelled
          return {status: -1, data: null, success: false, cancelled: true};
        }
        return {status: r.status, data: r.data, success: r.status == 200};
      });
  }
}

interface CheckInEvent {
  timeIn: string | null;
  timeOut: string | null;
  isForcedCheckout: boolean;
}

export interface UserInfo {
  email: string;
  lastCheckIn: CheckInEvent;
}
