import {
  AfterContentChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild
} from "@angular/core";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { SelectionModel } from "@angular/cdk/collections";
import {
  AttachImageToRadiologyReportRequest,
  FindByFirstAndLastName,
  FindByPatientRequest,
  FindPatientByInsuranceNumberRequest,
  ImageData,
  ImageInfo,
  ImageSearchResults,
  ImageTypeData,
  InstitutionData,
  NodeData,
  PatientData,
  RadiologyReportData,
  RadiologyReportImage,
  RadiologyReportSearchResults,
  RecordId,
  UserData
} from "../../prototypes";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { PatientService } from "../../services/patient.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { HttpErrorResponse } from "@angular/common/http";
import { MatTabGroup } from "@angular/material/tabs";
import { LoginService } from "../../services/login.service";
import { UserService } from "../../services/user.service";
import { RadiologyReportService } from "../../services/radiology-report.service";
import { InstitutionService } from "../../services/institution.service";
import { SelectImageDialogComponent } from "./select-image-dialog.component";
import { ImageTypeService } from "../../services/image-type.service";
import { ImageService } from "../../services/image.service";
import { RenderService } from "../../services/render.service";
import { NodeService } from "../../services/node.service";
import { ViewImageDialogComponent } from "./view-image-dialog.component";


@Component({
  selector: "app-manage-radiology-reports",
  templateUrl: "./manage-radiology-reports.component.html",
  styleUrls: ["./manage-radiology-reports.component.css"]
})
export class ManageRadiologyReportsComponent implements OnInit, AfterContentChecked, AfterViewInit {
  @ViewChild(MatSort, { static: true }) tableSort: MatSort;
  @ViewChild("paginator1") tablePaginatorPatient: MatPaginator;
  @ViewChild("paginator2") tablePaginatorReport: MatPaginator;
  @ViewChild("tabGroup") tabGroup: MatTabGroup;
  @ViewChild("form3") form3: ElementRef;
  tableSelectionPatient: SelectionModel<PatientData>;
  tableSelectionReport: SelectionModel<RadiologyReportSearchResults>;
  tableSelectionImage: SelectionModel<RadiologyReportImage>;
  displayedColumnsPatient: string[];
  displayedColumnsReport: string[];
  displayedColumnsImage: string[];
  institutionList: Array<InstitutionData>;
  imageTypeList: Array<ImageTypeData>;
  dialogRefSelectImage: MatDialogRef<SelectImageDialogComponent>;
  dialogRefViewImage: MatDialogRef<ViewImageDialogComponent>;
  patients: MatTableDataSource<PatientData>;
  reports: MatTableDataSource<RadiologyReportSearchResults>;
  reportsList: Array<RadiologyReportSearchResults>;
  images: MatTableDataSource<RadiologyReportImage>;
  imageDataList: Array<ImageData>;
  findPatientByFirstAndLastNameForm: FormGroup;
  findPatientByInsuranceNumberForm: FormGroup;
  radiologyReportForm: FormGroup;
  institutionServerAddress: string;
  institutionServerPort: number;
  reportDate: string;
  MDName: string;

  constructor(
    private loginService: LoginService,
    private userService: UserService,
    private patientService: PatientService,
    private radiologyReportService: RadiologyReportService,
    private institutionService: InstitutionService,
    private nodeService: NodeService,
    private imageTypeService: ImageTypeService,
    private imageService: ImageService,
    private renderService: RenderService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private changeDetector: ChangeDetectorRef,
  ) {
  }

  ngOnInit(): void {
    this.tableSelectionPatient = new SelectionModel<PatientData>(false, []);
    this.patients = new MatTableDataSource<PatientData>();
    this.displayedColumnsPatient = ["select", "first_name", "last_name", "gender", "date_of_birth", "insurance_number", "address"];
    this.patients.sort = this.tableSort;
    this.patients.paginator = this.tablePaginatorPatient;

    this.tableSelectionReport = new SelectionModel<RadiologyReportSearchResults>(false, []);
    this.reports = new MatTableDataSource<RadiologyReportSearchResults>();
    this.displayedColumnsReport = ["select", "institution_name", "date"];
    this.reports.sort = this.tableSort;
    this.reports.paginator = this.tablePaginatorReport;

    this.tableSelectionImage = new SelectionModel<RadiologyReportImage>(false, []);
    this.images = new MatTableDataSource<RadiologyReportImage>();
    this.displayedColumnsImage = ["select", "institution", "imageType", "date"];
    this.images.sort = this.tableSort;

    this.findPatientByFirstAndLastNameForm = this.formBuilder.group({
      firstNamePattern: ["", Validators.required],
      lastNamePattern: ["", Validators.required]
    });

    this.findPatientByInsuranceNumberForm = this.formBuilder.group({
      insuranceNumberPattern: ["", Validators.required]
    });
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  ngAfterViewInit(): void {
    this.institutionService.getAll().subscribe(
      (data: Array<InstitutionData>) => {
        this.institutionList = data;

      },
      (error: HttpErrorResponse) => {
        console.log(`ManagePatients - getAll: error code ${error.status}`);
        this.snackBar.open("Error fetching institution data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );

    this.imageTypeService.getAll().subscribe(
      (data: Array<ImageTypeData>) => {
        this.imageTypeList = data;

      },
      (error: HttpErrorResponse) => {
        console.log(`ManageImageTypes - getAll: error code ${error.status}`);
        this.snackBar.open("Error fetching image type data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

  findByFirstAndLastName(form: HTMLFormElement): void {
    const req: FindByFirstAndLastName = {
      first_name: this.findPatientByFirstAndLastNameForm.get("firstNamePattern").value,
      last_name: this.findPatientByFirstAndLastNameForm.get("lastNamePattern").value
    };

    this.patientService.findByName(req).subscribe(
      (data: PatientData[]) => {
        this.patients.data = data;

        if (data.length === 0) {
          this.snackBar.open("Query did not match any results.", "",
            { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
        }
      },
      (error: HttpErrorResponse) => {
        console.log(`ManagePatients - findByFirstAndLastName: error code ${error.status}`);
        this.snackBar.open("Error fetching patient data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );

    form.reset();
  }

  findByInsuranceNumber(form: HTMLFormElement): void {
    const req: FindPatientByInsuranceNumberRequest = {
      insurance_number: this.findPatientByInsuranceNumberForm.get("insuranceNumberPattern").value
    };

    this.patientService.findByInsuranceNumber(req).subscribe(
      (data: PatientData) => {
        this.patients.data = [data];

        if (Object.keys(data).length === 0) {
          this.snackBar.open("Query did not match expected number of results.", "",
            { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
        }
      },
      (error: HttpErrorResponse) => {
        console.log(`ManagePatients - findByInsuranceNumber: error code ${error.status}`);
        this.snackBar.open("Error fetching patient data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );

    form.reset();
  }

  tablePatientsFilter(filterValue: string): void {
    this.patients.filter = filterValue.trim().toLowerCase();

    if (this.patients.paginator) {
      this.patients.paginator.firstPage();
    }
  }

  tableReportsFilter(filterValue: string): void {
    this.reports.filter = filterValue.trim().toLowerCase();

    if (this.reports.paginator) {
      this.reports.paginator.firstPage();
    }
  }

  tableImagesFilter(filterValue: string): void {
    this.images.filter = filterValue.trim().toLowerCase();

    if (this.images.paginator) {
      this.images.paginator.firstPage();
    }
  }

  searchReports(): void {
    this.tabGroup.selectedIndex = 1;
    this.reportsList = [];

    for (const id of this.institutionList) {
      const req: FindByPatientRequest = {
        institution: id.id,
        patient: this.tableSelectionPatient.selected[0].id
      };

      this.radiologyReportService.findByPatient(id.ip_address, id.port_number, req).subscribe(
        (data: Array<RadiologyReportSearchResults>) => {
          if (data.length > 0) {
            this.reportsList.push(...data);
            this.reports.data = this.reportsList;
          }
        },
        (error: HttpErrorResponse) => {
          console.log(`ManageRadiologyReportsComponent - failed fetch of patient data from institution ${id.name}: error code ${error.status}`);
          this.snackBar.open("Error fetching patient data from institution " + id.name, "",
            { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
        }
      );
    }
  }

  findInstitutionFromID(id: string): InstitutionData {
    for (const inst of this.institutionList) {
      if (inst.id === id) {
        return inst;
      }
    }

    return null;
  }

  findImageTypeFromImage(id: string): ImageTypeData {
    for (const img of this.imageDataList) {
      if (img.id === id) {
        for (const it of this.imageTypeList) {
          if (it.id === img.image_type) {
            return it;
          }
        }
      }
    }

    return null;
  }

  findDateFromImage(id: string): Date {
    for (const img of this.imageDataList) {
      if (img.id === id) {
        return img.date_and_time;
      }
    }

    return null;
  }

  newReport(): void {
    this.radiologyReportForm = this.formBuilder.group({
      id: null,
      description: ["", Validators.required],
      findings: ["", Validators.required],
      conclusion: ["", Validators.required],
      recommendation: ["", Validators.required],
      date_and_time: [{ value: new Date(), disabled: true }, Validators.required],
      patient: [this.tableSelectionPatient.selected[0].id, Validators.required],
      doctor_of_medicine: [this.loginService.sessionData.user_id, Validators.required]
    });

    this.getMDFirstAndLastName(this.loginService.sessionData.user_id);
    this.reportDate = new Intl.DateTimeFormat("hr").format(new Date());
    this.institutionServerAddress = this.loginService.sessionData.institution_ip_address;
    this.institutionServerPort = this.loginService.sessionData.institution_port_number;
    this.tabGroup.selectedIndex = 2;
  }

  getMDFirstAndLastName(user_id: string): void {
    const req: RecordId = {
      id: user_id
    };

    this.userService.get(req).subscribe(
      (data: Array<UserData>) => {
        if (data.length >= 1) {
          this.MDName = data[0].first_name + " " + data[0].last_name;
        }
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageRadiologyReportsComponent - get user data: error code ${error.status}`);
        this.snackBar.open("Error fetching user data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

  editReport(): void {
    this.radiologyReportForm = this.formBuilder.group({
      id: [this.tableSelectionReport.selected[0].radiology_report.id, Validators.required],
      description: [this.tableSelectionReport.selected[0].radiology_report.description, Validators.required],
      findings: [this.tableSelectionReport.selected[0].radiology_report.findings, Validators.required],
      conclusion: [this.tableSelectionReport.selected[0].radiology_report.conclusion, Validators.required],
      recommendation: [this.tableSelectionReport.selected[0].radiology_report.recommendation, Validators.required],
      date_and_time: [{
        value: new Date(this.tableSelectionReport.selected[0].radiology_report.date_and_time), disabled: true
      }, Validators.required],
      patient: [this.tableSelectionReport.selected[0].radiology_report.patient, Validators.required],
      doctor_of_medicine: [this.tableSelectionReport.selected[0].radiology_report.doctor_of_medicine, Validators.required]
    });

    this.getMDFirstAndLastName(this.tableSelectionReport.selected[0].radiology_report.doctor_of_medicine);
    this.reportDate = new Intl.DateTimeFormat("hr").format(new Date(this.tableSelectionReport.selected[0].radiology_report.date_and_time));
    this.institutionServerAddress = this.findInstitutionFromID(this.tableSelectionReport.selected[0].institution).ip_address;
    this.institutionServerPort = this.findInstitutionFromID(this.tableSelectionReport.selected[0].institution).port_number;
    this.tabGroup.selectedIndex = 2;
    this.images.data = [];
    this.tableSelectionImage.clear();
    this.fetchImages(this.tableSelectionReport.selected[0].radiology_report.id);
  }

  fetchImages(radiology_report_id: string): void {
    this.imageDataList = [];

    const req: RecordId = {
      id: radiology_report_id
    };

    this.radiologyReportService.listImages(this.institutionServerAddress, this.institutionServerPort, req).subscribe(
      (data: Array<RadiologyReportImage>) => {
        for (const f of data) {
          const inst: InstitutionData = this.findInstitutionFromID(f.institution);
          const req: RecordId = {
            id: f.image
          };

          this.imageService.get(inst.ip_address, inst.port_number, req).subscribe(
            (id: ImageData) => {
              if (id !== null) {
                this.imageDataList.push(id);

                for (let i = 0; i < data.length; i++) {
                  if (data[i].image === id.id) {
                    const tmpArray = this.images.data;
                    tmpArray.push(data[i]);
                    this.images.data = tmpArray;
                    this.reportsList.splice(i, 1);
                    break;
                  }
                }
              }
            },
            (error: HttpErrorResponse) => {
              console.log(`ManageImagesComponent - get image data: error code ${error.status}`);
              this.snackBar.open("Error getting image data.", "",
                { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
            }
          );
        }
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageRadiologyReportsComponent - list images: error code ${error.status}`);
        this.snackBar.open("Error listing images.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

  saveReport(form: HTMLFormElement): void {
    const req: RadiologyReportData = {
      id: this.radiologyReportForm.get("id").value,
      date_and_time: this.radiologyReportForm.get("date_and_time").value,
      doctor_of_medicine: this.radiologyReportForm.get("doctor_of_medicine").value,
      patient: this.radiologyReportForm.get("patient").value,
      description: this.radiologyReportForm.get("description").value,
      findings: this.radiologyReportForm.get("findings").value,
      recommendation: this.radiologyReportForm.get("recommendation").value,
      conclusion: this.radiologyReportForm.get("conclusion").value
    };

    this.radiologyReportService.persist(this.institutionServerAddress, this.institutionServerPort, req).subscribe(
      () => {
        form.reset();
        this.tabGroup.selectedIndex = 0;
        this.radiologyReportForm = undefined;
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageRadiologyReportsComponent - save report data: error code ${error.status}`);
        this.snackBar.open("Error saving report data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

  deleteReport(): void {
    const req: RecordId = {
      id: this.radiologyReportForm.get("id").value
    };

    this.radiologyReportService.delete(this.institutionServerAddress, this.institutionServerPort, req).subscribe(
      () => {
        for (const rep of this.reportsList) {
          if (rep.radiology_report.id === req.id) {
            const index = this.reportsList.indexOf(rep);

            if (index !== -1) {
              this.reportsList.splice(index, 1);
            }

            this.reports.data = this.reportsList;
            break;
          }
        }

        this.form3.nativeElement.reset();
        this.tabGroup.selectedIndex = 0;
        this.radiologyReportForm = undefined;
        this.tableSelectionReport.clear();
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageRadiologyReportsComponent - delete report data: error code ${error.status}`);
        this.snackBar.open("Error deleting report data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

  searchImages(): void {
    this.dialogRefSelectImage = this.dialog.open(SelectImageDialogComponent, {
      data: {
        patient_id: this.tableSelectionPatient.selected[0].id,
        institutions: this.institutionList,
        imageTypes: this.imageTypeList
      },
      disableClose: true
    });

    this.dialogRefSelectImage.afterClosed().subscribe(result => {
      if (result !== null) {
        this.attachImage(result);
      }
    });
  }

  attachImage(isr: ImageSearchResults): void {
    const req: AttachImageToRadiologyReportRequest = {
      id: null,
      image: isr.imageData.id,
      radiology_report: this.tableSelectionReport.selected[0].radiology_report.id,
      institution: isr.institution
    };

    this.radiologyReportService.attachImage(this.institutionServerAddress, this.institutionServerPort, req).subscribe(
      () => {
        this.images.data = [];
        this.fetchImages(this.tableSelectionReport.selected[0].radiology_report.id);
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageRadiologyReportsComponent - attach image to radiology report: error code ${error.status}`);
        this.snackBar.open("Error attaching image to radiology report.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

  removeImage(): void {
    const req: RecordId = {
      id: this.tableSelectionImage.selected[0].id
    };

    this.radiologyReportService.detachImage(this.institutionServerAddress, this.institutionServerPort, req).subscribe(
      () => {
        for (let i = 0; i < this.images.data.length; i++) {
          if (this.images.data[i].image === this.tableSelectionImage.selected[0].image) {
            const tmpArray = this.images.data;
            tmpArray.splice(i, 1);
            this.images.data = tmpArray;
            break;
          }
        }

        for (let i = 0; i < this.imageDataList.length; i++) {
          if (this.imageDataList[i].id === this.tableSelectionImage.selected[0].image) {
            this.imageDataList.splice(i, 1);
            break;
          }
        }
      },
      (error: HttpErrorResponse) => {
        console.log(`ManageRadiologyReportsComponent - detach image from report data: error code ${error.status}`);
        this.snackBar.open("Error detaching image from report.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }

  displayImage(): void {
    let inst: InstitutionData;
    let req: RecordId;

    for (const i of this.imageDataList) {
      if (i.id === this.tableSelectionImage.selected[0].image) {
        inst = this.findInstitutionFromID(this.tableSelectionImage.selected[0].institution);

        req = {
          id: i.node
        };

        break;
      }
    }

    this.nodeService.get(inst.ip_address, inst.port_number, req).subscribe(
      (node: NodeData) => {

        let ii: ImageInfo;

        for (const img of this.imageDataList) {
          if (img.id === this.tableSelectionImage.selected[0].image) {
            ii = {
              md5sum: img.checksum,
              rows: img.rows,
              columns: img.columns,
              frames: img.frames,
              rescale_slope: img.rescale_slope,
              rescale_intercept: img.rescale_intercept,
              window_center: img.window_center,
              window_width: img.window_width
            };
          }
        }

        this.dialogRefViewImage = this.dialog.open(ViewImageDialogComponent, {
          data: {
            nodeData: node,
            imageData: ii
          },
          width: "100%",
          height: "100%",
          disableClose: true
        });

        // this.dialogRefViewImage.afterClosed().subscribe(result => {
        // if (result !== null) {
        //   this.attachImage(result);
        // }
        // });


      },
      (error: HttpErrorResponse) => {
        console.log(`ManageRadiologyReportsComponent - Could not fetch node data: error code ${error.status}`);
        this.snackBar.open("Error fetching node data.", "",
          { duration: 3000, horizontalPosition: "right", verticalPosition: "top" });
      }
    );
  }
}
