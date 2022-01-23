import {HttpClient} from "@angular/common/http";
import {Injectable} from "@angular/core";
import {NodeData, RecordId} from "app/prototypes";
import {Observable} from "rxjs";
import {UrlService} from "./url.service";

@Injectable(
  {
    providedIn: "root"
  }
)
export class NodeService {

  constructor(private urls: UrlService, private http: HttpClient) {
  }

  getAll(address: string, port: number): Observable<Array<NodeData>> {
    return this.http.post<Array<NodeData>>(this.urls.nodeGetAll(address, port), null);
  }

  persist(address: string, port: number, data: NodeData): Observable<RecordId> {
    return this.http.post<RecordId>(this.urls.nodePersist(address, port), data);
  }

  get(address: string, port: number, data: RecordId): Observable<NodeData> {
    return this.http.post<NodeData>(this.urls.nodeGet(address, port), data);
  }

  delete(address: string, port: number, data: RecordId): Observable<string> {
    return this.http.post(this.urls.nodeDelete(address, port), data, {responseType: "text"});
  }

  ping(address: string, port: number): Observable<string> {
    return this.http.post(this.urls.nodePing(address, port), null, {responseType: "text"});
  }

}
