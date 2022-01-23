import { SelectionModel } from "@angular/cdk/collections";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { InstitutionData, RecordId } from "app/prototypes";
import { timeout } from "rxjs/operators";
import { InstitutionService } from "../../services/institution.service";
import { ManageInstitutionsDialogComponent } from "./manage-institutions-dialog.component";


@Component({
  selector: "app-manage-institutions",
  templateUrl: "./manage-institutions.component.html",
  styleUrls: ["./manage-institutions.component.css"]
})
export class ManageInstitutionsComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) tableSort: MatSort;
  @ViewChild(MatPaginator, { static: true }) tablePaginator: MatPaginator;
  tableSelection: SelectionModel<InstitutionData>;
  institutions: MatTableDataSource<InstitutionData>;
  displayedColumns: string[];
  dialogRef: MatDialogRef<ManageInstitutionsDialogComponent>;
  oldInstitutionData: InstitutionData;
  newInstitutionData: InstitutionData;

  constructor(
    private instService: InstitutionService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.tableSelection = new SelectionModel<InstitutionData>(false, []);
    this.institutions = new MatTableDataSource<InstitutionData>();
    this.displayedColumns = ["select", "name", "address", "ip_address", "port_number"];
    this.institutions.sort = this.tableSort;
    this.institutions.paginator = this.tablePaginator;

    this.instService.getAll().subscribe(
      (data: InstitutionData[]) => {
        this.institutions.data = data;
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageInstitutions - load: error code ${error.status}`);
        this.snackBar.open("Error fetching institution data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

  tableFilter(filterValue: string): void {
    this.institutions.filter = filterValue.trim().toLowerCase();

    if (this.institutions.paginator) {
      this.institutions.paginator.firstPage();
    }
  }

  persistInstitution(addNew: boolean): void {
    if (addNew === true) {
      this.oldInstitutionData = <InstitutionData>{};
    } else {
      this.oldInstitutionData = this.tableSelection.selected[0];
    }

    this.dialogRef = this.dialog.open(ManageInstitutionsDialogComponent, {
      data: this.oldInstitutionData,
      disableClose: true
    });
    this.dialogRef.afterClosed().subscribe(result => {
      this.newInstitutionData = result;

      if (result !== null) {
        this.save();
      }
    });
  }

  save(): void {
    this.instService.persist(this.newInstitutionData).subscribe(
      (response: RecordId) => {
        const index = this.institutions.data.indexOf(this.oldInstitutionData);

        if (index !== -1) {
          this.institutions.data[index] = this.newInstitutionData;
          this.institutions.data = this.institutions.data.slice();
        } else {
          this.newInstitutionData.id = response.id;
          this.institutions.data = [];
          this.institutions.data.push(this.newInstitutionData);
          this.institutions.data = this.institutions.data.slice();
        }
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageInstitutions - persist: error code ${error.status}`);
        this.snackBar.open("Error while saving institution data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

  deleteInstitution(): void {
    const recId: RecordId = {
      id: this.tableSelection.selected[0].id
    };

    this.instService.delete(recId).subscribe(
      () => {
        const index: number = this.institutions.data.findIndex(d => d.id === this.tableSelection.selected[0].id);
        this.tableSelection.clear();
        this.institutions.data.splice(index, 1);
        this.institutions.data = this.institutions.data.slice();
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageInstitutions - delete: error code ${error.status}`);
        this.snackBar.open("Error while deleting institution data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

  pingInstitution(): void {
    const address: string = this.tableSelection.selected[0].ip_address;
    const port: number = this.tableSelection.selected[0].port_number;

    this.instService.ping(address, port).pipe(timeout(2000)).subscribe(
      () => {
        alert("Server is responding");
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageInstitutions - ping: error code ${error.status}`);
        alert("Server is not responding");
      }
    );

  }
}
