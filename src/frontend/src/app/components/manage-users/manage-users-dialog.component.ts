import { HttpErrorResponse } from "@angular/common/http";
import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { InstitutionData, UserData } from "app/prototypes";
import { InstitutionService } from "app/services/institution.service";

@Component({
  selector: "app-manage-users-dialog",
  templateUrl: "./manage-users-dialog.component.html",
  styleUrls: ["./manage-users-dialog.component.css"]
})
export class ManageUsersDialogComponent implements OnInit {
  userDataForm: FormGroup;
  institutions: InstitutionData[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: UserData,
    private formBuilder: FormBuilder,
    private instService: InstitutionService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.initForm(this.data);

    this.instService.getAll().subscribe(
      (data: InstitutionData[]) => {
        this.institutions = data;
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageUsers - load: error code ${error.status}`);
        this.snackBar.open("Error fetching institution data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

  private initForm(ud: UserData): void {
    this.userDataForm = this.formBuilder.group({
      id: ud.id,
      username: [ud.username, Validators.required],
      password: [ud.password, Validators.required],
      first_name: [ud.first_name, Validators.required],
      last_name: [ud.last_name, Validators.required],
      administrator: [ud.administrator === true ? true : false, Validators.required],
      superuser: [ud.superuser === true ? true : false, Validators.required],
      doctor_of_medicine: [ud.doctor_of_medicine === true ? true : false, Validators.required],
      active: [ud.active === true ? true : false, Validators.required],
      institution: [ud.institution, Validators.required],
      address: ud.address,
      email: ud.email,
      phone: ud.phone
    });

    if (ud === null) {
      this.userDataForm.reset();
    }
  }
}
