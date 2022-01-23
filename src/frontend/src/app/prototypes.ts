export interface JWTToken {
  admin: boolean;
  superuser: boolean;
  exp: number;
  user_id: string;
  MD: boolean;
  orig_iat: number;
  institution_id: string;
  institution_ip_address: string;
  institution_port_number: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  expire: string;
  token: string;
}

export interface InstitutionData {
  id: string;
  name: string;
  address: string;
  ip_address: string;
  port_number: number;
}

export interface FindInstitutionByNameRequest {
  name: string;
}

export interface UserData {
  id: string;
  username: string;
  password: string;
  administrator: boolean;
  superuser: boolean;
  first_name: string;
  last_name: string;
  doctor_of_medicine: boolean;
  active: boolean;
  institution: string;
  address: string;
  email: string;
  phone: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface PatientData {
  id: string;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: Date;
  insurance_number: number;
  address: string;
  email: string;
  phone: string;
}

export interface FindByFirstAndLastName {
  first_name: string;
  last_name: string;
}

export interface FindPatientByInsuranceNumberRequest {
  insurance_number: number;
}

export interface RecordId {
  id: string;
}

export interface NodeData {
  id: string;
  name: string;
  ip_address: string;
  port_number: number;
}

export interface MyUserData {
  institution_data: InstitutionData;
  user_data: UserData;
}

export interface ImageTypeData {
  id: string;
  description: string;
}

export interface ImageData {
  id: string;
  date_and_time: Date;
  image_type: string;
  node: string;
  patient: string;
  description: string;
  checksum: string;
  rows: number;
  columns: number;
  frames: number;
  rescale_slope: number;
  rescale_intercept: number;
  window_center: number;
  window_width: number;
}

export interface ImageSearchResults {
  institution: string;
  imageData: ImageData;
}

export interface Checksum {
  md5sum: string;
}

export interface ImageInfo {
  md5sum: string;
  rows: number;
  columns: number;
  frames: number;
  rescale_slope: number;
  rescale_intercept: number;
  window_center: number;
  window_width: number;
}

export interface RadiologyReportData {
  id: string;
  description: string;
  findings: string;
  conclusion: string;
  recommendation: string;
  date_and_time: Date;
  patient: string;
  doctor_of_medicine: string;
}

export interface FindByPatientRequest {
  institution: string;
  patient: string;
}

export interface RadiologyReportSearchResults {
  institution: string;
  radiology_report: RadiologyReportData;
}

export interface AttachImageToRadiologyReportRequest {
  id: string;
  radiology_report: string;
  institution: string;
  image: string;
}

export interface RadiologyReportImage {
  id: string;
  institution: string;
  radiology_report: string;
  image: string;
}

export interface FrameNumber {
  md5sum: string;
  frame: number;
}

export interface VolumeParameters {
  md5sum: string;
  viewX: number;
  viewY: number;
  viewZ: number;
  translateX: number;
  translateY: number;
  translateZ: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  rotateAngle: number;
  gamma: number;
  renderingMode: number;
}

export interface ResolutionAndFormat {
  md5sum: string;
  width: number;
  height: number;
  format: string;
}
