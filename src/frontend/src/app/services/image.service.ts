import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {FindByPatientRequest, ImageData, ImageSearchResults} from "app/prototypes";
import {Observable} from "rxjs";
import {RecordId} from "../prototypes";
import {UrlService} from "./url.service";

@Injectable(
  {
    providedIn: "root"
  }
)
export class ImageService {

  constructor(private urls: UrlService, private http: HttpClient) {
  }

  findByPatient(address: string, port: number, data: FindByPatientRequest): Observable<Array<ImageSearchResults>> {
    return this.http.post<Array<ImageSearchResults>>(this.urls.imageFindByPatient(address, port), data);
  }

  get(address: string, port: number, data: RecordId): Observable<ImageData> {
    return this.http.post<ImageData>(this.urls.imageGet(address, port), data);
  }

  persist(address: string, port: number, data: ImageData): Observable<RecordId> {
    return this.http.post<RecordId>(this.urls.imagePersist(address, port), data);
  }

  delete(address: string, port: number, data: RecordId): Observable<string> {
    return this.http.post(this.urls.imageDelete(address, port), data, {responseType: "text"});
  }
}
