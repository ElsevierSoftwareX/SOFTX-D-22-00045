import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { PatientData } from "app/prototypes";

@Component({
  selector: "app-manage-patients-dialog",
  templateUrl: "./manage-patients-dialog.component.html",
  styleUrls: ["./manage-patients-dialog.component.css"],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: "hr-HR" },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class ManagePatientsDialogComponent implements OnInit {
  patientDataForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: PatientData,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.initForm(this.data);
  }

  private initForm(pd: PatientData): void {
    this.patientDataForm = this.formBuilder.group({
      id: pd.id,
      first_name: [pd.first_name, Validators.required],
      last_name: [pd.last_name, Validators.required],
      gender: [pd.gender, Validators.required],
      date_of_birth: [new Date(pd.date_of_birth), Validators.required],
      insurance_number: [pd.insurance_number, Validators.required],
      address: pd.address,
      email: pd.email,
      phone: pd.phone
    });

    if (pd === null) {
      this.patientDataForm.reset();
    }
  }
}
