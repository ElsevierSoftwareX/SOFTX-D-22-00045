import { SelectionModel } from "@angular/cdk/collections";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { NodeData, RecordId } from "app/prototypes";
import { timeout } from "rxjs/operators";
import { NodeService } from "../../services/node.service";
import { LoginService } from "./../../services/login.service";
import { ManageNodesDialogComponent } from "./manage-nodes-dialog.component";


@Component({
  selector: "app-manage-nodes",
  templateUrl: "./manage-nodes.component.html",
  styleUrls: ["./manage-nodes.component.css"]
})
export class ManageNodesComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) tableSort: MatSort;
  @ViewChild(MatPaginator, { static: true }) tablePaginator: MatPaginator;
  tableSelection: SelectionModel<NodeData>;
  nodes: MatTableDataSource<NodeData>;
  displayedColumns: string[];
  dialogRef: MatDialogRef<ManageNodesDialogComponent>;
  oldNodeData: NodeData;
  newNodeData: NodeData;

  constructor(
    private instService: NodeService,
    private loginService: LoginService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.tableSelection = new SelectionModel<NodeData>(false, []);
    this.nodes = new MatTableDataSource<NodeData>();
    this.displayedColumns = ["select", "name", "ip_address", "port_number"];
    this.nodes.sort = this.tableSort;
    this.nodes.paginator = this.tablePaginator;

    this.instService.getAll(this.loginService.ip_address, this.loginService.port_number).subscribe(
      (data: NodeData[]) => {
        this.nodes.data = data;
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageNodes - load: error code ${error.status}`);
        this.snackBar.open("Error fetching node data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

  tableFilter(filterValue: string): void {
    this.nodes.filter = filterValue.trim().toLowerCase();

    if (this.nodes.paginator) {
      this.nodes.paginator.firstPage();
    }
  }

  persistNode(addNew: boolean): void {
    if (addNew === true) {
      this.oldNodeData = <NodeData>{};
    } else {
      this.oldNodeData = this.tableSelection.selected[0];
    }

    this.dialogRef = this.dialog.open(ManageNodesDialogComponent, { data: this.oldNodeData, disableClose: true });
    this.dialogRef.afterClosed().subscribe(result => {
      this.newNodeData = result;

      if (result !== null) {
        this.save();
      }
    });
  }

  save(): void {
    this.instService.persist(this.loginService.ip_address, this.loginService.port_number, this.newNodeData).subscribe(
      (response: RecordId) => {
        const index = this.nodes.data.indexOf(this.oldNodeData);

        if (index !== -1) {
          this.nodes.data[index] = this.newNodeData;
          this.nodes.data = this.nodes.data.slice();
        } else {
          this.newNodeData.id = response.id;
          this.nodes.data = [];
          this.nodes.data.push(this.newNodeData);
          this.nodes.data = this.nodes.data.slice();
        }
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageNodes - persist: error code ${error.status}`);
        this.snackBar.open("Error while saving node data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

  deleteNode(): void {
    const recId: RecordId = {
      id: this.tableSelection.selected[0].id
    };

    this.instService.delete(this.loginService.ip_address, this.loginService.port_number, recId).subscribe(
      () => {
        const index: number = this.nodes.data.findIndex(d => d.id === this.tableSelection.selected[0].id);
        this.tableSelection.clear();
        this.nodes.data.splice(index, 1);
        this.nodes.data = this.nodes.data.slice();
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageNodes - delete: error code ${error.status}`);
        this.snackBar.open("Error while deleting node data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

  pingNode(): void {
    const address: string = this.tableSelection.selected[0].ip_address;
    const port: number = this.tableSelection.selected[0].port_number;

    this.instService.ping(address, port).pipe(timeout(2000)).subscribe(
      () => {
        alert("Server is responding");
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageNodes - ping: error code ${error.status}`);
        alert("Server is not responding");
      }
    );

  }
}
