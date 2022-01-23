import { HttpClient, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {Checksum, ImageInfo} from "app/prototypes";
import { Observable } from "rxjs";
import { UrlService } from "./url.service";

@Injectable(
  {
    providedIn: "root"
  }
)
export class StorageService {

  constructor(private urls: UrlService, private http: HttpClient) {
  }

  saveImage(address: string, port: number, data: FormData): Observable<any> {
    const req = new HttpRequest("POST", this.urls.storageSaveImage(address, port), data, {
      reportProgress: true
    });

    return this.http.request(req);
  }

  deleteImage(address: string, port: number, data: Checksum): Observable<string> {
    return this.http.post(this.urls.storageDeleteImage(address, port), data, { responseType: "text" });
  }

}
