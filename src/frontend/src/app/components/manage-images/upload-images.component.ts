import { formatDate, registerLocaleData } from "@angular/common";
import { HttpErrorResponse, HttpEvent, HttpEventType } from "@angular/common/http";
import localeHr from "@angular/common/locales/hr";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, NgForm, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ImageData, ImageInfo, NodeData, PatientData } from "app/prototypes";
import { timeout } from "rxjs/operators";
import { ImageTypeData } from "../../prototypes";
import { ImageTypeService } from "../../services/image-type.service";
import { ImageService } from "../../services/image.service";
import { LoginService } from "../../services/login.service";
import { NodeService } from "../../services/node.service";
import { StorageService } from "../../services/storage.service";
import { SelectPatientDialogComponent } from "./select-patient-dialog.component";


@Component({
  selector: "app-upload-images",
  templateUrl: "./upload-images.component.html",
  styleUrls: ["./upload-images.component.css"]
})
export class UploadImagesComponent implements OnInit {
  @ViewChild("openFile1") openFile1: ElementRef;
  @ViewChild("openFile2") openFile2: ElementRef;
  @ViewChild("form") form: ElementRef;
  saveImageDataForm: FormGroup;
  imageTypes: ImageTypeData[] = [];
  nodes: NodeData[] = [];
  uploadFile: File;
  uploadProgress: number;
  dialogRef: MatDialogRef<SelectPatientDialogComponent>;
  patientData: PatientData;

  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private imageService: ImageService,
    private imageTypeService: ImageTypeService,
    private loginService: LoginService,
    private nodeService: NodeService,
    private storageService: StorageService,
    private dialog: MatDialog
  ) {
    registerLocaleData(localeHr, "hr-HR");
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

    this.saveImageDataForm = this.formBuilder.group({
      dateTime: ["", Validators.required],
      imageType: ["", Validators.required],
      node: ["", Validators.required],
      patient: ["", Validators.required],
      description: ["", Validators.required],
      checksum: ["", Validators.required],
      rows: ["", Validators.required],
      columns: ["", Validators.required],
      frames: ["", Validators.required],
      rescale_slope: ["", Validators.required],
      rescale_intercept: ["", Validators.required],
      window_center: ["", Validators.required],
      window_width: ["", Validators.required]
    });

    this.uploadProgress = 0;
  }

  onFileChange(): void {
    if (this.openFile2.nativeElement.files.length === 1) {
      this.uploadFile = this.openFile2.nativeElement.files[0];
      this.openFile1.nativeElement.value = this.openFile2.nativeElement.files[0].name;
    } else {
      this.uploadFile = null;
      this.openFile1.nativeElement.value = "";
    }
  }

  uploadImage(): void {
    const formData: FormData = new FormData();

    formData.append("file", this.uploadFile);

    let ip_address: string;
    let port_number: number;

    this.nodes.forEach(element => {
      if (element.id === this.saveImageDataForm.get("node").value) {
        ip_address = element.ip_address;
        port_number = element.port_number;
      }
    });

    this.storageService.saveImage(ip_address, port_number, formData).pipe(timeout(60000)).subscribe(
      (event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            this.uploadProgress = Math.round(100 * event.loaded / event.total);
            break;
          case HttpEventType.ResponseHeader:
            if (event.status !== 200) {
              console.log(`UploadImages - upload image: error code ${event.status}`);
              this.snackBar.open("Error uploading image.", "", {
                duration: 3000,
                horizontalPosition: "right",
                verticalPosition: "top"
              });
            }
            break;
          case HttpEventType.Response:
            if (event.status === 200) {
              const imgInfo: ImageInfo = event.body;

              this.saveImageDataForm.patchValue({
                checksum: imgInfo.md5sum,
                rows: imgInfo.rows,
                columns: imgInfo.columns,
                frames: imgInfo.frames,
                rescale_slope: imgInfo.rescale_slope,
                rescale_intercept: imgInfo.rescale_intercept,
                window_center: imgInfo.window_center,
                window_width: imgInfo.window_width
              });

              this.snackBar.open("Image successfully saved.", "",
                { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
              this.form.nativeElement.requestSubmit();
            }
        }
      },
      () => {
        console.log("UploadImages - upload image response timeout.");
        this.snackBar.open("Error uploading image.", "", {
          duration: 3000,
          horizontalPosition: "right",
          verticalPosition: "top"
        });
      }
    );
  }

  saveImageData(form: NgForm): void {
    const imageData: ImageData = {
      id: null,
      date_and_time: this.saveImageDataForm.get("dateTime").value,
      image_type: this.saveImageDataForm.get("imageType").value,
      node: this.saveImageDataForm.get("node").value,
      patient: this.patientData.id,
      description: this.saveImageDataForm.get("description").value,
      checksum: this.saveImageDataForm.get("checksum").value,
      rows: this.saveImageDataForm.get("rows").value,
      columns: this.saveImageDataForm.get("columns").value,
      frames: this.saveImageDataForm.get("frames").value,
      rescale_slope: this.saveImageDataForm.get("rescale_slope").value,
      rescale_intercept: this.saveImageDataForm.get("rescale_intercept").value,
      window_center: this.saveImageDataForm.get("window_center").value,
      window_width: this.saveImageDataForm.get("window_width").value
    };

    this.imageService.persist(this.loginService.ip_address, this.loginService.port_number, imageData).subscribe(
      () => {
        this.snackBar.open("Image metadata successfully saved.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
        form.reset();
      },
      (error: HttpErrorResponse) => {
        console.log(`UploadImages - save image data: error code ${error.status}`);
        this.snackBar.open("Error while uploading image data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

  selectPatient(): void {
    const pd: PatientData = <PatientData>{};

    this.dialogRef = this.dialog.open(SelectPatientDialogComponent, { data: pd, disableClose: true });
    this.dialogRef.afterClosed().subscribe((result: PatientData) => {
      this.patientData = result;

      if (result === null) {
        this.saveImageDataForm.patchValue({ patient: "" });
      } else {
        this.saveImageDataForm.patchValue({
          patient: result.first_name + " " + result.last_name + ", "
            + result.insurance_number + ", " + formatDate(result.date_of_birth, "dd.MM.yyyy.", "hr-HR")
        });
      }
    });
  }

}
