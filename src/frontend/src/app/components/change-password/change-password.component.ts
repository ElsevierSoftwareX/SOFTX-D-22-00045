import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, NgForm, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Md5 } from "ts-md5/dist/md5";
import { UserService } from "../../services/user.service";


@Component({
  selector: "app-change-password",
  templateUrl: "./change-password.component.html",
  styleUrls: ["./change-password.component.css"]
})
export class ChangePasswordComponent implements OnInit {
  passwordForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.passwordForm = this.formBuilder.group({
      old_password: ["", Validators.required],
      new_password1: ["", Validators.required],
      new_password2: ["", Validators.required]
    });
  }

  changePassword(form: NgForm): void {
    if (this.passwordForm.get("new_password1").value !== this.passwordForm.get("new_password2").value) {
      this.snackBar.open("New passwords do not match.", "", { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });

      return;
    }

    this.userService.changePassword(
      <string>Md5.hashStr(this.passwordForm.get("old_password").value), <string>Md5.hashStr(this.passwordForm.get("new_password1").value)
    ).subscribe(
      () => {
        this.snackBar.open("The password has been successfully changed.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
        this.passwordForm.reset();
      },
      (error: HttpErrorResponse) => {
        console.log(`changePassword: error code ${error.status}`);
        this.snackBar.open("Error while changing password.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );

    form.reset();
  }

}
