import { SelectionModel } from "@angular/cdk/collections";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, NgForm, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { FindByFirstAndLastName, FindPatientByInsuranceNumberRequest, PatientData, RecordId } from "app/prototypes";
import { PatientService } from "../../services/patient.service";
import { ManagePatientsDialogComponent } from "./manage-patients-dialog.component";

@Component({
  selector: "app-manage-patients",
  templateUrl: "./manage-patients.component.html",
  styleUrls: ["./manage-patients.component.css"]
})
export class ManagePatientsComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) tableSort: MatSort;
  @ViewChild(MatPaginator, { static: true }) tablePaginator: MatPaginator;
  tableSelection: SelectionModel<PatientData>;
  displayedColumns: string[];
  dialogRef: MatDialogRef<ManagePatientsDialogComponent>;
  oldPatientData: PatientData;
  newPatientData: PatientData;
  patients: MatTableDataSource<PatientData>;
  findByFirstAndLastNameForm: FormGroup;
  findByInsuranceNumberForm: FormGroup;

  constructor(
    private patientService: PatientService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.tableSelection = new SelectionModel<PatientData>(false, []);
    this.patients = new MatTableDataSource<PatientData>();
    this.displayedColumns = ["select", "first_name", "last_name", "gender", "date_of_birth", "insurance_number", "address"];
    this.patients.sort = this.tableSort;
    this.patients.paginator = this.tablePaginator;

    this.findByFirstAndLastNameForm = this.formBuilder.group({
      firstNamePattern: ["", Validators.required],
      lastNamePattern: ["", Validators.required]
    });

    this.findByInsuranceNumberForm = this.formBuilder.group({
      insuranceNumberPattern: ["", Validators.required]
    });
  }

  findByFirstAndLastName(form: NgForm): void {
    const req: FindByFirstAndLastName = {
      first_name: this.findByFirstAndLastNameForm.get("firstNamePattern").value,
      last_name: this.findByFirstAndLastNameForm.get("lastNamePattern").value
    };

    this.patientService.findByName(req).subscribe(
      (data: PatientData[]) => {
        this.patients.data = data;

        if (data.length === 0) {
          this.snackBar.open("Query did not match any results.", "",
            { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
        }
      },
      (error: HttpErrorResponse) => {
        console.log(`ManagePatients - findByFirstAndLastName: error code ${error.status}`);
        this.snackBar.open("Error fetching patient data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );

    form.reset();
  }

  findByInsuranceNumber(form: NgForm): void {
    const req: FindPatientByInsuranceNumberRequest = {
      insurance_number: this.findByInsuranceNumberForm.get("insuranceNumberPattern").value
    };

    this.patientService.findByInsuranceNumber(req).subscribe(
      (data: PatientData) => {
        this.patients.data = [data];

        if (Object.keys(data).length === 0) {
          this.snackBar.open("Query did not match expected number of results.", "",
            { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
        }
      },
      (error: HttpErrorResponse) => {
        console.log(`ManagePatients - findByInsuranceNumber: error code ${error.status}`);
        this.snackBar.open("Error fetching patient data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );

    form.reset();
  }

  tableFilter(filterValue: string): void {
    this.patients.filter = filterValue.trim().toLowerCase();

    if (this.patients.paginator) {
      this.patients.paginator.firstPage();
    }
  }

  persistPatient(addNew: boolean): void {
    if (addNew === true) {
      this.oldPatientData = <PatientData>{};
    } else {
      this.oldPatientData = this.tableSelection.selected[0];
    }

    this.dialogRef = this.dialog.open(ManagePatientsDialogComponent, { data: this.oldPatientData, disableClose: true });
    this.dialogRef.afterClosed().subscribe(result => {
      this.newPatientData = result;

      if (result !== null) {
        this.save();
      }
    });
  }

  save(): void {
    this.patientService.persist(this.newPatientData).subscribe(
      (response: RecordId) => {
        const index = this.patients.data.indexOf(this.oldPatientData);

        if (index !== -1) {
          this.patients.data[index] = this.newPatientData;
          this.patients.data = this.patients.data.slice();
        } else {
          this.newPatientData.id = response.id;
          this.patients.data = [];
          this.patients.data.push(this.newPatientData);
          this.patients.data = this.patients.data.slice();
        }
      },
      (error: HttpErrorResponse) => {
        console.log(`ManagePatients - persist: error code ${error.status}`);
        this.snackBar.open("Error while saving patient data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

  deletePatient(): void {
    const recId: RecordId = {
      id: this.tableSelection.selected[0].id
    };

    this.patientService.delete(recId).subscribe(
      () => {
        const index: number = this.patients.data.findIndex(d => d.id === this.tableSelection.selected[0].id);
        this.tableSelection.clear();
        this.patients.data.splice(index, 1);
        this.patients.data = this.patients.data.slice();
      },
      (error: HttpErrorResponse) => {
        console.log(`ManagePatients - delete: error code ${error.status}`);
        this.snackBar.open("Error while deleting patient data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

}
