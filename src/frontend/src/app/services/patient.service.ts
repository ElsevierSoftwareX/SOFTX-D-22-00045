import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FindByFirstAndLastName, FindPatientByInsuranceNumberRequest, PatientData, RecordId } from "app/prototypes";
import { Observable } from "rxjs";
import { UrlService } from "./url.service";

@Injectable(
  {
    providedIn: "root"
  }
)
export class PatientService {

  constructor(private urls: UrlService, private http: HttpClient) {
  }

  findByName(requestData: FindByFirstAndLastName): Observable<Array<PatientData>> {
    return this.http.post<Array<PatientData>>(this.urls.patientFindByName, requestData);
  }

  findByInsuranceNumber(requestData: FindPatientByInsuranceNumberRequest): Observable<PatientData> {
    return this.http.post<PatientData>(this.urls.patientFindByInsuranceNumber, requestData);
  }

  persist(patientData: PatientData): Observable<RecordId> {
    return this.http.post<RecordId>(this.urls.patientPersist, patientData);
  }

  delete(patientData: RecordId): Observable<string> {
    return this.http.post(this.urls.patientDelete, patientData, { responseType: "text" });
  }

}
