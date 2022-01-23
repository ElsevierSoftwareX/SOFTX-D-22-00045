import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Checksum, FrameNumber, ImageInfo, ResolutionAndFormat, VolumeParameters } from "app/prototypes";
import { Observable } from "rxjs";
import { UrlService } from "./url.service";

@Injectable(
  {
    providedIn: "root"
  }
)
export class RenderService {

  constructor(private urls: UrlService, private http: HttpClient) {
  }

  loadImage(address: string, port: number, data: ImageInfo): Observable<string> {
    return this.http.post(this.urls.renderLoadImage(address, port), data, { responseType: "text" });
  }

  unloadImage(address: string, port: number, data: Checksum): Observable<string> {
    return this.http.post(this.urls.renderUnloadImage(address, port), data, { responseType: "text" });
  }

  fetchFrame(address: string, port: number, data: FrameNumber): Observable<Blob> {
    return this.http.post(this.urls.renderFetchFrame(address, port), data, { responseType: "blob" });
  }

  fetchVolume(address: string, port: number, data: VolumeParameters): Observable<Blob> {
    return this.http.post(this.urls.renderFetchVolume(address, port), data, { responseType: "blob" });
  }

  setResolutionAndFormat(address: string, port: number, data: ResolutionAndFormat): Observable<string> {
    return this.http.post(this.urls.renderSetResolutionAndFormat(address, port), data, { responseType: "text" });
  }

}
