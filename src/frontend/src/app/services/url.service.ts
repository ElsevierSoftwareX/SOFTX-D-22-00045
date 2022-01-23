import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";


@Injectable(
  {
    providedIn: "root"
  }
)
export class UrlService {
  readonly toplevelUrl: string;

  constructor() {
    this.toplevelUrl = "https://" + environment.toplevel_server + "/restful";
  }

  private _token: string;

  // JWT token
  get token(): string {
    return this._token;
  }

  set token(value: string) {
    this._token = value;
  }

  // Domains
  get whitelistedDomains(): string[] {
    return environment.whitelist;
  }

  // Auth
  get authLogin(): string {
    return this.toplevelUrl + "/auth/login";
  }

  get authWatchdog(): string {
    return this.toplevelUrl + "/auth/refresh_token";
  }

  // Institution
  get institutionPersist(): string {
    return this.toplevelUrl + "/institution/persist";
  }

  get institutionGetAll(): string {
    return this.toplevelUrl + "/institution/get-all";
  }

  get institutionFindByName(): string {
    return this.toplevelUrl + "/institution/find-by-name";
  }

  get institutionDelete(): string {
    return this.toplevelUrl + "/institution/delete";
  }

  // User
  get userPersist(): string {
    return this.toplevelUrl + "/user/persist";
  }

  get userGet(): string {
    return this.toplevelUrl + "/user/get";
  }

  get userFindByName(): string {
    return this.toplevelUrl + "/user/find-by-name";
  }

  get userFindByInstitution(): string {
    return this.toplevelUrl + "/user/find-by-institution";
  }

  get userGetMyData(): string {
    return this.toplevelUrl + "/user/get-my-data";
  }

  get userChangePassword(): string {
    return this.toplevelUrl + "/user/change-password";
  }

  get userDelete(): string {
    return this.toplevelUrl + "/user/delete";
  }

  // Patient
  get patientPersist(): string {
    return this.toplevelUrl + "/patient/persist";
  }

  get patientFindByName(): string {
    return this.toplevelUrl + "/patient/find-by-name";
  }

  get patientFindByInsuranceNumber(): string {
    return this.toplevelUrl + "/patient/find-by-insurance-number";
  }

  get patientDelete(): string {
    return this.toplevelUrl + "/patient/delete";
  }

  // Image type
  get imageTypeGetAll(): string {
    return this.toplevelUrl + "/image-type/get-all";
  }

  get imageTypePersist(): string {
    return this.toplevelUrl + "/image-type/persist";
  }

  get imageTypeDelete(): string {
    return this.toplevelUrl + "/image-type/delete";
  }

  get imageTypeGet(): string {
    return this.toplevelUrl + "/image-type/get";
  }

  institutionPing(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/info/ping";
  }

  // Node
  nodePersist(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/node/persist";
  }

  nodeGetAll(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/node/get-all";
  }

  nodeGet(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/node/get";
  }

  nodeDelete(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/node/delete";
  }

  nodePing(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/info/ping";
  }

  // Image
  imageFindByPatient(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/image/find-by-patient";
  }

  imageGet(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/image/get";
  }

  imagePersist(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/image/persist";
  }

  imageDelete(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/image/delete";
  }

  // Radiology Report
  radiologyReportPersist(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/radiology-report/persist";
  }

  radiologyReportDelete(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/radiology-report/delete";
  }

  radiologyReportFindByPatient(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/radiology-report/find-by-patient";
  }

  radiologyReportGet(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/radiology-report/get";
  }

  radiologyReportAttachImage(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/radiology-report/attach-image";
  }

  radiologyReportDetachImage(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/radiology-report/detach-image";
  }

  radiologyReportListImages(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/radiology-report/list-images";
  }

  // Storage
  storageSaveImage(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/storage/save-image";
  }

  storageDeleteImage(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/storage/delete-image";
  }

  // Render
  renderLoadImage(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/render/load-image";
  }

  renderUnloadImage(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/render/unload-image";
  }

  renderFetchFrame(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/render/fetch-frame";
  }

  renderFetchVolume(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/render/fetch-volume";
  }

  renderSetResolutionAndFormat(address: string, port: number): string {
    return "https://" + address + ":" + port.toString() + "/restful/render/set-resolution-and-format";
  }
}
