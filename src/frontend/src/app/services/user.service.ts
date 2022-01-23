import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {ChangePasswordRequest, FindByFirstAndLastName, MyUserData, RecordId, UserData} from "app/prototypes";
import {Observable} from "rxjs";
import {UrlService} from "./url.service";


@Injectable(
  {
    providedIn: "root"
  }
)
export class UserService {

  constructor(private urls: UrlService, private http: HttpClient) {
  }

  changePassword(old_password: string, new_password: string): Observable<string> {
    const data: ChangePasswordRequest = {
      old_password: old_password,
      new_password: new_password
    };

    return this.http.post(this.urls.userChangePassword, data, {responseType: "text"});
  }

  persist(userData: UserData): Observable<RecordId> {
    return this.http.post<RecordId>(this.urls.userPersist, userData);
  }

  get(userData: RecordId): Observable<Array<UserData>> {
    return this.http.post<Array<UserData>>(this.urls.userGet, userData);
  }

  findByName(userData: FindByFirstAndLastName): Observable<Array<UserData>> {
    return this.http.post<Array<UserData>>(this.urls.userFindByName, userData);
  }

  findByInstitution(userData: RecordId): Observable<Array<UserData>> {
    return this.http.post<Array<UserData>>(this.urls.userFindByInstitution, userData);
  }

  delete(userData: RecordId): Observable<string> {
    return this.http.post(this.urls.userDelete, userData, {responseType: "text"});
  }

  getMyData(): Observable<MyUserData> {
    return this.http.post<MyUserData>(this.urls.userGetMyData, null);
  }

}
