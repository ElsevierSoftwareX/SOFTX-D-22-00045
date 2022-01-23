import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FindInstitutionByNameRequest, InstitutionData, RecordId } from "app/prototypes";
import { Observable } from "rxjs";
import { UrlService } from "./url.service";


@Injectable(
  {
    providedIn: "root"
  }
)
export class InstitutionService {

  constructor(private urls: UrlService, private http: HttpClient) {
  }

  getAll(): Observable<Array<InstitutionData>> {
    return this.http.post<Array<InstitutionData>>(this.urls.institutionGetAll, null);
  }

  persist(data: InstitutionData): Observable<RecordId> {
    return this.http.post<RecordId>(this.urls.institutionPersist, data);
  }

  findByName(data: FindInstitutionByNameRequest): Observable<Array<InstitutionData>> {
    return this.http.post<Array<InstitutionData>>(this.urls.institutionFindByName, data);
  }

  delete(data: RecordId): Observable<string> {
    return this.http.post(this.urls.institutionDelete, data, { responseType: "text" });
  }

  ping(address: string, port: number): Observable<string> {
    return this.http.post(this.urls.institutionPing(address, port), null, { responseType: "text" });
  }

}
