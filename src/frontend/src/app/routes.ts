import {Routes} from "@angular/router";
import {ChangePasswordComponent} from "./components/change-password/change-password.component";
import {DisplayMyUserDataComponent} from "./components/display-my-user-data/display-my-user-data.component";
import {LoginComponent} from "./components/login/login.component";
import {MainWindowComponent} from "./components/main-window/main-window.component";
import {ManageImageTypesComponent} from "./components/manage-image-types/manage-image-types.component";
import {ManageImagesComponent} from "./components/manage-images/manage-images.component";
import {UploadImagesComponent} from "./components/manage-images/upload-images.component";
import {ManageInstitutionsComponent} from "./components/manage-institutions/manage-institutions.component";
import {ManageNodesComponent} from "./components/manage-nodes/manage-nodes.component";
import {ManagePatientsComponent} from "./components/manage-patients/manage-patients.component";
import {ManageUsersComponent} from "./components/manage-users/manage-users.component";
import {ManageRadiologyReportsComponent} from "./components/manage-radiology-reports/manage-radiology-reports.component";

export const routes: Routes = [
  {path: "", redirectTo: "/login", pathMatch: "full"},
  {path: "login", component: LoginComponent},
  {
    path: "main", component: MainWindowComponent,
    children: [
      {path: "manage-institutions", component: ManageInstitutionsComponent},
      {path: "manage-users", component: ManageUsersComponent},
      {path: "manage-patients", component: ManagePatientsComponent},
      {path: "change-password", component: ChangePasswordComponent},
      {path: "manage-nodes", component: ManageNodesComponent},
      {path: "display-my-user-data", component: DisplayMyUserDataComponent},
      {path: "manage-images", component: ManageImagesComponent},
      {path: "upload-images", component: UploadImagesComponent},
      {path: "manage-image-types", component: ManageImageTypesComponent},
      {path: "manage-radiology-reports", component: ManageRadiologyReportsComponent}
    ]
  }
];
