import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { UserService } from "../../services/user.service";
import { MyUserData } from "./../../prototypes";


@Component({
  selector: "app-display-my-user-data",
  templateUrl: "./display-my-user-data.component.html",
  styleUrls: ["./display-my-user-data.component.css"]
})
export class DisplayMyUserDataComponent implements OnInit {
  myUserData: MyUserData;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.userService.getMyData().subscribe(
      (data: MyUserData) => {
        this.myUserData = data;
      },
      (error: HttpErrorResponse) => {
        console.log(`DisplayMyUserDataComponent - load: error code ${error.status}`);
        this.snackBar.open("Error fetching user data data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }
}
