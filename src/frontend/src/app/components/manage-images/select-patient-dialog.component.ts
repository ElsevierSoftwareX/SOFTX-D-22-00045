import {SelectionModel} from "@angular/cdk/collections";
import {HttpErrorResponse} from "@angular/common/http";
import {Component, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup, NgForm, Validators} from "@angular/forms";
import {MatPaginator} from "@angular/material/paginator";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {FindByFirstAndLastName, FindPatientByInsuranceNumberRequest, PatientData} from "app/prototypes";
import {PatientService} from "../../services/patient.service";

@Component({
  selector: "app-select-patient-dialog",
  templateUrl: "./select-patient-dialog.component.html",
  styleUrls: ["./select-patient-dialog.component.css"]
})
export class SelectPatientDialogComponent implements OnInit {
  @ViewChild(MatSort, {static: true}) tableSort: MatSort;
  @ViewChild(MatPaginator, {static: true}) tablePaginator: MatPaginator;
  tableSelection: SelectionModel<PatientData>;
  displayedColumns: string[];
  patients: MatTableDataSource<PatientData>;
  findByFirstAndLastNameForm: FormGroup;
  findByInsuranceNumberForm: FormGroup;

  constructor(
    private patientService: PatientService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
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
            {duration: 3000, horizontalPosition: "right", verticalPosition: "top"});
        }
      },
      (error: HttpErrorResponse) => {
        console.log(`SelectPatientDialog - findByFirstAndLastName: error code ${error.status}`);
        this.snackBar.open("Error fetching patient data.", "",
          {duration: 3000, horizontalPosition: "right", verticalPosition: "top"});
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
            {duration: 3000, horizontalPosition: "right", verticalPosition: "top"});
        }
      },
      (error: HttpErrorResponse) => {
        console.log(`SelectPatientDialog - findByInsuranceNumber: error code ${error.status}`);
        this.snackBar.open("Error fetching patient data.", "",
          {duration: 3000, horizontalPosition: "right", verticalPosition: "top"});
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

}
