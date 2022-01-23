import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { ImageTypeData } from "app/prototypes";

@Component({
  selector: "app-manage-nodes-dialog",
  templateUrl: "./manage-image-types-dialog.component.html",
  styleUrls: ["./manage-image-types-dialog.component.css"]
})
export class ManageImageTypesDialogComponent implements OnInit {
  imageTypeForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: ImageTypeData,
    private formBuilder: FormBuilder,
  ) {
  }

  ngOnInit(): void {
    this.initForm(this.data);
  }

  private initForm(id: ImageTypeData): void {
    this.imageTypeForm = this.formBuilder.group({
      id: id.id,
      description: [id.description, Validators.required]
    });

    if (id === null) {
      this.imageTypeForm.reset();
    }
  }
}
