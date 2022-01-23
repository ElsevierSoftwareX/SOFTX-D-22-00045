import { SelectionModel } from "@angular/cdk/collections";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ImageTypeData, RecordId } from "app/prototypes";
import { ImageTypeService } from "app/services/image-type.service";
import { ManageImageTypesDialogComponent } from "./manage-image-types-dialog.component";


@Component({
  selector: "app-manage-nodes",
  templateUrl: "./manage-image-types.component.html",
  styleUrls: ["./manage-image-types.component.css"]
})
export class ManageImageTypesComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) tableSort: MatSort;
  @ViewChild(MatPaginator, { static: true }) tablePaginator: MatPaginator;
  tableSelection: SelectionModel<ImageTypeData>;
  imageTypes: MatTableDataSource<ImageTypeData>;
  displayedColumns: string[];
  dialogRef: MatDialogRef<ManageImageTypesDialogComponent>;
  oldImageType: ImageTypeData;
  newImageType: ImageTypeData;

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private imageTypeService: ImageTypeService
  ) {
  }

  ngOnInit(): void {
    this.tableSelection = new SelectionModel<ImageTypeData>(false, []);
    this.imageTypes = new MatTableDataSource<ImageTypeData>();
    this.displayedColumns = ["select", "description"];
    this.imageTypes.sort = this.tableSort;
    this.imageTypes.paginator = this.tablePaginator;

    this.imageTypeService.getAll().subscribe(
      (data: ImageTypeData[]) => {
        this.imageTypes.data = data;
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageImageTypes - load: error code ${error.status}`);
        this.snackBar.open("Error fetching image types.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

  tableFilter(filterValue: string): void {
    this.imageTypes.filter = filterValue.trim().toLowerCase();

    if (this.imageTypes.paginator) {
      this.imageTypes.paginator.firstPage();
    }
  }

  persistImageType(addNew: boolean): void {
    if (addNew === true) {
      this.oldImageType = <ImageTypeData>{};
    } else {
      this.oldImageType = this.tableSelection.selected[0];
    }

    this.dialogRef = this.dialog.open(ManageImageTypesDialogComponent, { data: this.oldImageType, disableClose: true });
    this.dialogRef.afterClosed().subscribe(result => {
      this.newImageType = result;

      if (result !== null) {
        this.save();
      }
    });
  }

  save(): void {
    this.imageTypeService.persist(this.newImageType).subscribe(
      (response: RecordId) => {
        const index = this.imageTypes.data.indexOf(this.oldImageType);

        if (index !== -1) {
          this.imageTypes.data[index] = this.newImageType;
          this.imageTypes.data = this.imageTypes.data.slice();
        } else {
          this.newImageType.id = response.id;
          this.imageTypes.data = [];
          this.imageTypes.data.push(this.newImageType);
          this.imageTypes.data = this.imageTypes.data.slice();
        }
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageImageTypes - persist: error code ${error.status}`);
        this.snackBar.open("Error while saving image types.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

  deleteImageType(): void {
    const recId: RecordId = {
      id: this.tableSelection.selected[0].id
    };

    this.imageTypeService.delete(recId).subscribe(
      () => {
        const index: number = this.imageTypes.data.findIndex(d => d.id === this.tableSelection.selected[0].id);
        this.tableSelection.clear();
        this.imageTypes.data.splice(index, 1);
        this.imageTypes.data = this.imageTypes.data.slice();
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageImageTypes - delete: error code ${error.status}`);
        this.snackBar.open("Error while deleting image type.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

}
