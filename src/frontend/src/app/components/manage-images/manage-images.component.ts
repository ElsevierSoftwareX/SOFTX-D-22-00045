import {SelectionModel} from "@angular/cdk/collections";
import {formatDate, registerLocaleData} from "@angular/common";
import {HttpErrorResponse} from "@angular/common/http";
import localeHr from "@angular/common/locales/hr";
import {Component, OnInit, ViewChild} from "@angular/core";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {MatPaginator} from "@angular/material/paginator";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {
  Checksum,
  FindByPatientRequest,
  ImageData,
  ImageSearchResults,
  ImageTypeData,
  NodeData,
  PatientData,
  RecordId
} from "app/prototypes";
import {ImageTypeService} from "app/services/image-type.service";
import {LoginService} from "app/services/login.service";
import {NodeService} from "app/services/node.service";
import {ImageService} from "./../../services/image.service";
import {StorageService} from "./../../services/storage.service";
import {ManageImagesDialogComponent} from "./manage-images-dialog.component";
import {SelectPatientDialogComponent} from "./select-patient-dialog.component";

@Component({
  selector: "app-manage-images",
  templateUrl: "./manage-images.component.html",
  styleUrls: ["./manage-images.component.css"]
})
export class ManageImagesComponent implements OnInit {
  @ViewChild(MatPaginator, {static: true}) tablePaginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) tableSort: MatSort;
  dialogRefImage: MatDialogRef<ManageImagesDialogComponent>;
  dialogRefPatient: MatDialogRef<SelectPatientDialogComponent>;
  displayedColumns: string[];
  findByPatientForm: FormGroup;
  imageData: ImageData;
  imageTypes: ImageTypeData[] = [];
  images: MatTableDataSource<ImageData>;
  nodes: NodeData[] = [];
  patientData: PatientData;
  tableSelection: SelectionModel<ImageData>;


  constructor(
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private imageService: ImageService,
    private imageTypeService: ImageTypeService,
    private loginService: LoginService,
    private nodeService: NodeService,
    private storageService: StorageService
  ) {
    registerLocaleData(localeHr, "hr-HR");
  }

  ngOnInit(): void {
    this.tableSelection = new SelectionModel<ImageData>(false, []);
    this.images = new MatTableDataSource<ImageData>();
    this.displayedColumns = ["select", "date_and_time", "image_type", "node", "description"];
    this.images.sort = this.tableSort;
    this.images.paginator = this.tablePaginator;

    this.imageTypeService.getAll().subscribe(
      (data: ImageTypeData[]) => {
        this.imageTypes = data;
      },
      (error: HttpErrorResponse) => {
        console.log(`UploadImages - load: error code ${error.status}`);
        this.snackBar.open("Error fetching image type data.", "",
          {duration: 3000, horizontalPosition: "right", verticalPosition: "top"});
      }
    );

    this.nodeService.getAll(this.loginService.ip_address, this.loginService.port_number).subscribe(
      (data: NodeData[]) => {
        this.nodes = data;
      },
      (error: HttpErrorResponse) => {
        console.log(`UploadImages - load: error code ${error.status}`);
        this.snackBar.open("Error fetching node data.", "",
          {duration: 3000, horizontalPosition: "right", verticalPosition: "top"});
      }
    );

    this.findByPatientForm = this.formBuilder.group({
      patient: ["", Validators.required]
    });
  }

  getNodeName(val: string): string {
    const retval: NodeData = this.nodes?.find(element => element.id === val);

    return retval?.name ?? "";
  }

  getImageTypeName(val: string): string {
    const retval: ImageTypeData = this.imageTypes?.find(element => element.id === val);

    return retval?.description ?? "";
  }

  findImagesByPatient(): void {
    const req: FindByPatientRequest = {
      institution: this.loginService.sessionData.institution_id,
      patient: this.patientData.id
    };

    this.imageService.findByPatient(this.loginService.ip_address, this.loginService.port_number, req).subscribe(
      (data: Array<ImageSearchResults>) => {
        const id: Array<ImageData> = [];

        for (const d of data) {
          id.push(d.imageData);
        }

        this.images.data = id;

        if (data.length === 0) {
          this.snackBar.open("Query did not match any results.", "",
            {duration: 3000, horizontalPosition: "right", verticalPosition: "top"});
        }
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageImages - findImagesByPatient: error code ${error.status}`);
        this.snackBar.open("Error fetching image data.", "",
          {duration: 3000, horizontalPosition: "right", verticalPosition: "top"});
      }
    );
  }

  tableFilter(filterValue: string): void {
    this.images.filter = filterValue.trim().toLowerCase();

    if (this.images.paginator) {
      this.images.paginator.firstPage();
    }
  }

  editImage(): void {
    const id: ImageData = this.tableSelection.selected[0];

    this.dialogRefImage = this.dialog.open(ManageImagesDialogComponent, {data: id, disableClose: true});
    this.dialogRefImage.afterClosed().subscribe((result: ImageData) => {
      this.imageData = result;

      if (result !== null) {
        this.save();
      }
    });
  }

  save(): void {
    const id: ImageData = this.imageData;

    if (this.imageData === null) {
      return;
    }

    this.imageService.persist(this.loginService.ip_address, this.loginService.port_number, id).subscribe(
      (response: RecordId) => {
        id.id = response.id;

        let i: number;

        for (i = 0; i < this.images.data.length; i++) {
          if (this.images.data[i].id === id.id) {
            this.images.data[i] = id;
            this.images.data = this.images.data.slice();
            break;
          }
        }

        if (i >= this.images.data.length) {
          this.images.data.push(id);
          this.images.data = this.images.data.slice();
        }

        this.tableSelection.clear();
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageImages - persist: error code ${error.status}`);
        this.snackBar.open("Error while saving image data.", "",
          {duration: 3000, horizontalPosition: "right", verticalPosition: "top"});
      }
    );
  }

  deleteImage(): void {
    const record: ImageData = this.tableSelection.selected[0];
    const recId: RecordId = {
      id: record.id
    };

    this.imageService.delete(this.loginService.ip_address, this.loginService.port_number, recId).subscribe(
      () => {
        const index: number = this.images.data.findIndex(d => d.id === this.tableSelection.selected[0].id);
        this.tableSelection.clear();
        this.images.data.splice(index, 1);
        this.images.data = this.images.data.slice();

        const node: NodeData = this.nodes?.find(element => element.id === record.node);
        const checksum: Checksum = {
          md5sum: record.checksum
        };

        this.storageService.deleteImage(node.ip_address, node.port_number, checksum).subscribe(
          () => {
          },
          (error: HttpErrorResponse) => {
            console.log(`ManageImages - delete image from node: error code ${error.status}`);
            this.snackBar.open("Error while deleting image from node.", "",
              {duration: 3000, horizontalPosition: "right", verticalPosition: "top"});
          }
        );
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageImages - delete image data: error code ${error.status}`);
        this.snackBar.open("Error while deleting image data.", "",
          {duration: 3000, horizontalPosition: "right", verticalPosition: "top"});
      }
    );
  }

  selectPatient(): void {
    const pd: PatientData = <PatientData>{};

    this.dialogRefPatient = this.dialog.open(SelectPatientDialogComponent, {data: pd, disableClose: true});
    this.dialogRefPatient.afterClosed().subscribe((result: PatientData) => {
      this.patientData = result;

      if (result === null) {
        this.findByPatientForm.patchValue({patient: ""});
      } else {
        this.findByPatientForm.patchValue({
          patient: result.first_name + " " + result.last_name + ", " + result.insurance_number + ", " +
            formatDate(result.date_of_birth, "dd.MM.yyyy.", "hr-HR")
        });
      }
    });
  }

}
