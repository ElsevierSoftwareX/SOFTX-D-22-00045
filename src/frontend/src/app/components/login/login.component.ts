import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { JWTToken, LoginResponse } from "app/prototypes";
import jwtDecode from "jwt-decode";
import { LoginService } from "../../services/login.service";
import { UrlService } from "./../../services/url.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private urls: UrlService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ["", Validators.required],
      password: ["", Validators.required]
    });
  }

  login(): void {
    this.loginService.login(this.loginForm.get("username").value, this.loginForm.get("password").value).subscribe(
      (response: LoginResponse) => {
        const decode: JWTToken = jwtDecode(response.token);

        this.loginService.sessionData = decode;
        this.loginService.watchdog();
        this.urls.token = response.token;
        this.router.navigateByUrl("/main");
      },
      (error: HttpErrorResponse) => {
        console.log(`userLogin: error code ${error.status}`);
        this.snackBar.open("Error while logging in.", "", { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }
}
