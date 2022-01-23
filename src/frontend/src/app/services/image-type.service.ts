import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ImageTypeData, RecordId } from "app/prototypes";
import { Observable } from "rxjs";
import { UrlService } from "./url.service";

@Injectable(
  {
    providedIn: "root"
  }
)
export class ImageTypeService {

  constructor(private urls: UrlService, private http: HttpClient) {
  }

  getAll(): Observable<Array<ImageTypeData>> {
    return this.http.post<Array<ImageTypeData>>(this.urls.imageTypeGetAll, null);
  }

  get(): Observable<ImageTypeData> {
    return this.http.post<ImageTypeData>(this.urls.imageTypeGet, null);
  }

  persist(data: ImageTypeData): Observable<RecordId> {
    return this.http.post<RecordId>(this.urls.imageTypePersist, data);
  }

  delete(data: RecordId): Observable<string> {
    return this.http.post(this.urls.imageTypeDelete, data, { responseType: "text" });
  }

}
