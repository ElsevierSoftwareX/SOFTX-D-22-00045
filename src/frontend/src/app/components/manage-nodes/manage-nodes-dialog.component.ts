import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NodeData } from "app/prototypes";

@Component({
  selector: "app-manage-nodes-dialog",
  templateUrl: "./manage-nodes-dialog.component.html",
  styleUrls: ["./manage-nodes-dialog.component.css"]
})
export class ManageNodesDialogComponent implements OnInit {
  nodeDataForm: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: NodeData,
    private formBuilder: FormBuilder,
  ) {
  }

  ngOnInit(): void {
    this.initForm(this.data);
  }

  private initForm(id: NodeData): void {
    this.nodeDataForm = this.formBuilder.group({
      id: id.id,
      name: [id.name, Validators.required],
      ip_address: [id.ip_address, Validators.required],
      port_number: [id.port_number, Validators.required]
    });

    if (id === null) {
      this.nodeDataForm.reset();
    }
  }
}
