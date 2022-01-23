import { HttpErrorResponse } from "@angular/common/http";
import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from "@angular/material-moment-adapter";
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from "@angular/material/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ImageData, ImageTypeData, NodeData } from "app/prototypes";
import { ImageTypeService } from "app/services/image-type.service";
import { LoginService } from "app/services/login.service";
import { NodeService } from "app/services/node.service";

@Component({
  selector: "app-manage-images-dialog",
  templateUrl: "./manage-images-dialog.component.html",
  styleUrls: ["./manage-images-dialog.component.css"],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: "hr-HR" },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class ManageImagesDialogComponent implements OnInit {
  imageDataForm: FormGroup;
  imageTypes: ImageTypeData[] = [];
  nodes: NodeData[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: ImageData,
    private formBuilder: FormBuilder,
    private imageTypeService: ImageTypeService,
    private nodeService: NodeService,
    private loginService: LoginService,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.imageTypeService.getAll().subscribe(
      (data: ImageTypeData[]) => {
        this.imageTypes = data;
      },
      (error: HttpErrorResponse) => {
        console.log(`UploadImages - load: error code ${error.status}`);
        this.snackBar.open("Error fetching image type data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );

    this.nodeService.getAll(this.loginService.ip_address, this.loginService.port_number).subscribe(
      (data: NodeData[]) => {
        this.nodes = data;
      },
      (error: HttpErrorResponse) => {
        console.log(`UploadImages - load: error code ${error.status}`);
        this.snackBar.open("Error fetching node data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
    this.initForm(this.data);
  }

  getNodeName(val: string): string {
    const retval: NodeData = this.nodes?.find(element => element.id === val);

    return retval?.name ?? "";
  }

  private initForm(id: ImageData): void {
    this.imageDataForm = this.formBuilder.group({
      id: [id.id, Validators.required],
      date_and_time: [id.date_and_time, Validators.required],
      image_type: [id.image_type, Validators.required],
      node: [id.node, Validators.required],
      patient: [id.patient, Validators.required],
      description: [id.description, Validators.required],
      checksum: [id.checksum, Validators.required],
      rows: [id.rows, Validators.required],
      columns: [id.columns, Validators.required],
      frames: [id.frames, Validators.required],
      rescale_slope: [id.rescale_slope, Validators.required],
      rescale_intercept: [id.rescale_intercept, Validators.required],
      window_center: [id.window_center, Validators.required],
      window_width: [id.window_width, Validators.required]
    });

    if (id === null) {
      this.imageDataForm.reset();
    }
  }
}
