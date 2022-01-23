import { SelectionModel } from "@angular/cdk/collections";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, NgForm, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { FindByFirstAndLastName, InstitutionData, RecordId, UserData } from "app/prototypes";
import { Md5 } from "ts-md5/dist/md5";
import { InstitutionService } from "../../services/institution.service";
import { UserService } from "../../services/user.service";
import { ManageUsersDialogComponent } from "./manage-users-dialog.component";

@Component({
  selector: "app-manage-users",
  templateUrl: "./manage-users.component.html",
  styleUrls: ["./manage-users.component.css"]
})
export class ManageUsersComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) tableSort: MatSort;
  @ViewChild(MatPaginator, { static: true }) tablePaginator: MatPaginator;
  tableSelection: SelectionModel<UserData>;
  displayedColumns: string[];
  dialogRef: MatDialogRef<ManageUsersDialogComponent>;
  oldUserData: UserData;
  newUserData: UserData;
  users: MatTableDataSource<UserData>;
  institutions: InstitutionData[] = [];
  findByFirstAndLastNameForm: FormGroup;
  findByInstitutionForm: FormGroup;

  constructor(
    private userService: UserService,
    private instService: InstitutionService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
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

    this.tableSelection = new SelectionModel<UserData>(false, []);
    this.users = new MatTableDataSource<UserData>();
    this.displayedColumns = ["select", "first_name", "last_name", "active", "md", "institution", "address"];
    this.users.sort = this.tableSort;
    this.users.paginator = this.tablePaginator;

    this.findByFirstAndLastNameForm = this.formBuilder.group({
      firstNamePattern: ["", Validators.required],
      lastNamePattern: ["", Validators.required]
    });

    this.findByInstitutionForm = this.formBuilder.group({
      institutionPattern: ["", Validators.required]
    });
  }

  findByFirstAndLastName(form: NgForm): void {
    const req: FindByFirstAndLastName = {
      first_name: this.findByFirstAndLastNameForm.get("firstNamePattern").value,
      last_name: this.findByFirstAndLastNameForm.get("lastNamePattern").value
    };

    this.userService.findByName(req).subscribe(
      (data: UserData[]) => {
        this.users.data = data;

        if (data.length === 0) {
          this.snackBar.open("Query did not match any results.", "",
            { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
        }
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageUsers - findByFirstAndLastName: error code ${error.status}`);
        this.snackBar.open("Error fetching user data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );

    form.reset();
  }

  findByInstitution(form: NgForm): void {
    const req: RecordId = {
      id: this.findByInstitutionForm.get("institutionPattern").value
    };

    this.userService.findByInstitution(req).subscribe(
      (data: UserData[]) => {
        this.users.data = data;

        if (data.length === 0) {
          this.snackBar.open("Query did not match any results.", "",
            { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
        }
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageUsers - findByInstitution: error code ${error.status}`);
        this.snackBar.open("Error fetching patient data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );

    form.reset();
  }

  tableFilter(filterValue: string): void {
    this.users.filter = filterValue.trim().toLowerCase();

    if (this.users.paginator) {
      this.users.paginator.firstPage();
    }
  }

  getInstitutionName(id: string): string {
    for (const i of this.institutions) {
      if (i.id === id) {
        return i.name;
      }
    }

    return null;
  }

  persistUser(addNew: boolean): void {
    if (addNew === true) {
      this.oldUserData = <UserData>{};
    } else {
      this.oldUserData = this.tableSelection.selected[0];
    }

    this.dialogRef = this.dialog.open(ManageUsersDialogComponent, { data: this.oldUserData, disableClose: true });
    this.dialogRef.afterClosed().subscribe(result => {
      this.newUserData = result;

      if (result !== null) {
        this.save();
      }
    });
  }

  save(): void {
    if (this.newUserData.password.length !== 32) {
      this.newUserData.password = <string>Md5.hashStr(this.newUserData.password);
    }

    this.userService.persist(this.newUserData).subscribe(
      (response: RecordId) => {
        const index = this.users.data.indexOf(this.oldUserData);

        if (index !== -1) {
          this.users.data[index] = this.newUserData;
          this.users.data = this.users.data.slice();
        } else {
          this.newUserData.id = response.id;
          this.users.data = [];
          this.users.data.push(this.newUserData);
          this.users.data = this.users.data.slice();
        }
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageUsers - save: error code ${error.status}`);
        this.snackBar.open("Error while saving user data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

  deleteUser(): void {
    const recId: RecordId = {
      id: this.tableSelection.selected[0].id
    };

    this.userService.delete(recId).subscribe(
      () => {
        const index: number = this.users.data.findIndex(d => d.id === this.tableSelection.selected[0].id);
        this.tableSelection.clear();
        this.users.data.splice(index, 1);
        this.users.data = this.users.data.slice();
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageUsers - delete: error code ${error.status}`);
        this.snackBar.open("Error while deleting user data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }
}
