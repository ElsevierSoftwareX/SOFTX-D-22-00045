import {SelectionModel} from "@angular/cdk/collections";
import {Component, Inject, OnInit, ViewChild} from "@angular/core";
import {MatPaginator} from "@angular/material/paginator";
import {MatSnackBar} from "@angular/material/snack-bar";
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {FindByPatientRequest, ImageSearchResults, ImageTypeData, InstitutionData} from "app/prototypes";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";
import {ImageService} from "../../services/image.service";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: "app-select-image-dialog",
  templateUrl: "./select-image-dialog.component.html",
  styleUrls: ["./select-image-dialog.component.css"]
})
export class SelectImageDialogComponent implements OnInit {
  @ViewChild(MatSort, {static: true}) tableSort: MatSort;
  @ViewChild(MatPaginator, {static: true}) tablePaginator: MatPaginator;
  tableSelection: SelectionModel<ImageSearchResults>;
  displayedColumns: string[];
  images: MatTableDataSource<ImageSearchResults>;
  imagesList: Array<ImageSearchResults>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { patient_id: string, institutions: Array<InstitutionData>, imageTypes: Array<ImageTypeData> },
    private imageService: ImageService,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.tableSelection = new SelectionModel<ImageSearchResults>(false, []);
    this.images = new MatTableDataSource<ImageSearchResults>();
    this.displayedColumns = ["select", "institution", "imageType", "date"];
    this.images.sort = this.tableSort;
    this.images.paginator = this.tablePaginator;
    this.imagesList = [];

    for (const id of this.data.institutions) {
      const req: FindByPatientRequest = {
        institution: id.id,
        patient: this.data.patient_id
      };

      this.imageService.findByPatient(id.ip_address, id.port_number, req).subscribe(
        (data: Array<ImageSearchResults>) => {
          if (data.length > 0) {
            this.imagesList.push(...data);
            this.images.data = this.imagesList;
          }
        },
        (error: HttpErrorResponse) => {
          console.log(`ManageRadiologyReportsComponent - failed fetch of image data from institution ${id.name}: error code ${error.status}`);
          this.snackBar.open("Error fetching image data from institution " + id.name, "",
            {duration: 3000, horizontalPosition: "right", verticalPosition: "top"});
        }
      );
    }
  }

  findInstitutionFromID(id: string): InstitutionData {
    for (const inst of this.data.institutions) {
      if (inst.id === id) {
        return inst;
      }
    }

    return null;
  }

  findImageTypeFromID(id: string): ImageTypeData {
    for (const it of this.data.imageTypes) {
      if (it.id === id) {
        return it;
      }
    }

    return null;
  }

  tableFilter(filterValue: string): void {
    this.images.filter = filterValue.trim().toLowerCase();

    if (this.images.paginator) {
      this.images.paginator.firstPage();
    }
  }

}

