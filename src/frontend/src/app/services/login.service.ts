import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { JWTToken, LoginRequest, LoginResponse } from "app/prototypes";
import { Observable, Subscription, timer } from "rxjs";
import { Md5 } from "ts-md5/dist/md5";
import { UrlService } from "./url.service";


@Injectable(
  {
    providedIn: "root"
  }
)
export class LoginService {
  private _sessionData: JWTToken;
  private timerSubscription: Subscription;

  constructor(
    private http: HttpClient,
    private urls: UrlService
  ) { }

  get sessionData(): JWTToken {
    return this._sessionData;
  }

  set sessionData(value: JWTToken) {
    this._sessionData = value;
  }

  get ip_address(): string {
    return this._sessionData.institution_ip_address;
  }

  get port_number(): number {
    return this._sessionData.institution_port_number;
  }

  login(username: string, password: string): Observable<LoginResponse> {
    const data: LoginRequest = {
      username: username,
      password: <string>Md5.hashStr(password)
    };

    return this.http.post<LoginResponse>(this.urls.authLogin, data);
  }

  watchdog(): void {
    this.timerSubscription = timer(4 * 60 * 1000, 4 * 60 * 1000).subscribe(
      () => {
        this.http.post<LoginResponse>(this.urls.authWatchdog, null).subscribe(
          (response: LoginResponse) => {
            this.urls.token = response.token;
          },
          (error: HttpErrorResponse) => {
            console.log(`userWatchdog: error code ${error.status}`);
            this.timerSubscription.unsubscribe();
            alert("Error in watchdog timer.");
          }
        );
      }
    );
  }

  stopTimer(): void {
    this.timerSubscription.unsubscribe();
  }

}
