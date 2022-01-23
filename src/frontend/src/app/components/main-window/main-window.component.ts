import {Component} from "@angular/core";
import {LoginService} from "../../services/login.service";


@Component({
  selector: "app-main-window",
  templateUrl: "./main-window.component.html",
  styleUrls: ["./main-window.component.css"]
})
export class MainWindowComponent {
  constructor(private loginService: LoginService) {
  }

  stopTimer(): void {
    this.loginService.stopTimer();
  }

  isUserAdmin(): boolean {
    return this.loginService.sessionData.admin;
  }

  isUserSuperuser(): boolean {
    return this.loginService.sessionData.superuser;
  }
}
