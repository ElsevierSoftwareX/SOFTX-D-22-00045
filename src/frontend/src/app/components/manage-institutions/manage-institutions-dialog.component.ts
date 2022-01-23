import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { InstitutionData } from "app/prototypes";

@Component({
  selector: "app-manage-institutions-dialog",
  templateUrl: "./manage-institutions-dialog.component.html",
  styleUrls: ["./manage-institutions-dialog.component.css"]
})
export class ManageInstitutionsDialogComponent implements OnInit {
  institutionDataForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: InstitutionData,
    private formBuilder: FormBuilder,
  ) {
  }

  ngOnInit(): void {
    this.initForm(this.data);
  }

  private initForm(id: InstitutionData): void {
    this.institutionDataForm = this.formBuilder.group({
      id: id.id,
      name: [id.name, Validators.required],
      address: [id.address, Validators.required],
      ip_address: [id.ip_address, Validators.required],
      port_number: [id.port_number, Validators.required]
    });

    if (id === null) {
      this.institutionDataForm.reset();
    }
  }
}
