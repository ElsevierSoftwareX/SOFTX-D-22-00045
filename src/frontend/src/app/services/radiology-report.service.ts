import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {
  AttachImageToRadiologyReportRequest,
  FindByPatientRequest,
  RadiologyReportData,
  RadiologyReportImage,
  RadiologyReportSearchResults
} from "app/prototypes";
import {Observable} from "rxjs";
import {RecordId} from "../prototypes";
import {UrlService} from "./url.service";

@Injectable(
  {
    providedIn: "root"
  }
)
export class RadiologyReportService {

  constructor(private urls: UrlService, private http: HttpClient) {
  }

  persist(address: string, port: number, data: RadiologyReportData): Observable<RecordId> {
    return this.http.post<RecordId>(this.urls.radiologyReportPersist(address, port), data);
  }

  delete(address: string, port: number, data: RecordId): Observable<string> {
    return this.http.post(this.urls.radiologyReportDelete(address, port), data, {responseType: "text"});
  }

  findByPatient(address: string, port: number, data: FindByPatientRequest): Observable<Array<RadiologyReportSearchResults>> {
    return this.http.post<Array<RadiologyReportSearchResults>>(this.urls.radiologyReportFindByPatient(address, port), data);
  }

  get(address: string, port: number, data: RecordId): Observable<RadiologyReportData> {
    return this.http.post<RadiologyReportData>(this.urls.radiologyReportGet(address, port), data);
  }

  attachImage(address: string, port: number, data: AttachImageToRadiologyReportRequest): Observable<string> {
    return this.http.post(this.urls.radiologyReportAttachImage(address, port), data, {responseType: "text"});
  }

  detachImage(address: string, port: number, data: RecordId): Observable<string> {
    return this.http.post(this.urls.radiologyReportDetachImage(address, port), data, {responseType: "text"});
  }

  listImages(address: string, port: number, data: RecordId): Observable<Array<RadiologyReportImage>> {
    return this.http.post<Array<RadiologyReportImage>>(this.urls.radiologyReportListImages(address, port), data);
  }

}
