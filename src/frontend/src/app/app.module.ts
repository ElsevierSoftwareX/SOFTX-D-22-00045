import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { ErrorStateMatcher, MAT_DATE_LOCALE, ShowOnDirtyErrorStateMatcher } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogModule } from "@angular/material/dialog";
import { MatDividerModule } from "@angular/material/divider";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSelectModule } from "@angular/material/select";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSortModule } from "@angular/material/sort";
import { MatTableModule } from "@angular/material/table";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { JWT_OPTIONS, JwtModule } from "@auth0/angular-jwt";
import { AppComponent } from "./app.component";
import { ChangePasswordComponent } from "./components/change-password/change-password.component";
import { DisplayMyUserDataComponent } from "./components/display-my-user-data/display-my-user-data.component";
import { LoginComponent } from "./components/login/login.component";
import { MainWindowComponent } from "./components/main-window/main-window.component";
import { ManageImageTypesDialogComponent } from "./components/manage-image-types/manage-image-types-dialog.component";
import { ManageImageTypesComponent } from "./components/manage-image-types/manage-image-types.component";
import { ManageImagesDialogComponent } from "./components/manage-images/manage-images-dialog.component";
import { ManageImagesComponent } from "./components/manage-images/manage-images.component";
import { SelectPatientDialogComponent } from "./components/manage-images/select-patient-dialog.component";
import { UploadImagesComponent } from "./components/manage-images/upload-images.component";
import { ManageInstitutionsDialogComponent } from "./components/manage-institutions/manage-institutions-dialog.component";
import { ManageInstitutionsComponent } from "./components/manage-institutions/manage-institutions.component";
import { ManageNodesDialogComponent } from "./components/manage-nodes/manage-nodes-dialog.component";
import { ManageNodesComponent } from "./components/manage-nodes/manage-nodes.component";
import { ManagePatientsDialogComponent } from "./components/manage-patients/manage-patients-dialog.component";
import { ManagePatientsComponent } from "./components/manage-patients/manage-patients.component";
import { ManageUsersDialogComponent } from "./components/manage-users/manage-users-dialog.component";
import { ManageUsersComponent } from "./components/manage-users/manage-users.component";
import { GenderPipe } from "./pipes/gender.pipe";
import { routes } from "./routes";
import { UrlService } from "./services/url.service";
import { ManageRadiologyReportsComponent } from "./components/manage-radiology-reports/manage-radiology-reports.component";
import { MatTabsModule } from "@angular/material/tabs";
import { SelectImageDialogComponent } from "./components/manage-radiology-reports/select-image-dialog.component";
import { ViewImageDialogComponent } from "./components/manage-radiology-reports/view-image-dialog.component";
import { MatSliderModule } from "@angular/material/slider";
import { MatRadioModule } from "@angular/material/radio";


export function jwtOptionsFactory(urls: UrlService) {
  return {
    tokenGetter: () => urls.token,
    allowedDomains: urls.whitelistedDomains,
    disallowedRoutes: [urls.authLogin]
  };
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainWindowComponent,
    ChangePasswordComponent,
    ManageInstitutionsComponent,
    ManageInstitutionsDialogComponent,
    ManagePatientsComponent,
    ManagePatientsDialogComponent,
    GenderPipe,
    ManageUsersComponent,
    ManageUsersDialogComponent,
    ManageNodesComponent,
    ManageNodesDialogComponent,
    DisplayMyUserDataComponent,
    ManageImagesComponent,
    ManageImagesDialogComponent,
    ManageImageTypesComponent,
    ManageImageTypesDialogComponent,
    UploadImagesComponent,
    SelectPatientDialogComponent,
    ManageRadiologyReportsComponent,
    SelectImageDialogComponent,
    ViewImageDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(routes, {relativeLinkResolution: "legacy"}),
    JwtModule.forRoot({jwtOptionsProvider: {provide: JWT_OPTIONS, useFactory: jwtOptionsFactory, deps: [UrlService]}}),
    FormsModule,
    FlexLayoutModule,
    MatSnackBarModule,
    MatInputModule,
    MatButtonModule,
    MatSidenavModule,
    MatExpansionModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatSliderModule,
    MatRadioModule
  ],
  providers: [
    {provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher},
    {provide: MAT_DATE_LOCALE, useValue: "hr-HR"},
    FormBuilder,
    UrlService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
