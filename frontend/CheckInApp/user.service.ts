import axios from "axios";

let axiosInstance = axios.create();

export class UserService {

  static CheckIn(): Promise<{status: 200, data: CheckInEvent, success: true} | {status: number, data: string | null, success: false}> {
    return axiosInstance.post("http://localhost:5279/User/CheckIn")
      .catch(r => {
        return { status: r.response.status, data: r.response.data, success: r.status == 200 };
      })
      .then(r => ({ status: r.status, data: r.data, success: r.status == 200 }));

  }

  static CheckOut(): Promise<{status: 200, data: CheckInEvent, success: true} | {status: number, data: string | null, success: false}> {
    return axiosInstance.post("http://localhost:5279/User/CheckOut")
      .catch(r => {
        return { status: r.response.status, data: r.response.data, success: r.status == 200 };
      })
      .then(r => ({ status: r.status, data: r.data, success: r.status == 200 }));

  }


  static UserInfo(): Promise<{status: 200, data: UserInfo, success: true} | {status: number, data: string | null, success: false}> {
    return axiosInstance.post("http://localhost:5279/User/UserInfo")
      .catch(r => {
        return { status: r.response.status, data: r.response.data, success: r.status == 200 };
      })
      .then(r => ({ status: r.status, data: r.data, success: r.status == 200 }));

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
