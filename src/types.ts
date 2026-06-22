export interface IprProperty {
  id?: number | string;
  district: string;
  propertyName?: string;
  propertyType: string;
  address?: string;
  acquisitionYear?: string;
  acquisitionCost: number | string;
  presentValue: number | string;
  ownership?: string;
  ownerName?: string;
  acquisitionDetails?: string;
  annualIncome?: number | string;
  status?: string;
}

export interface EmployeeProfile {
  name: string;
  employeeId: string;
  email: string;
  phone: string;
  joiningDate: string;
  dob: string;
  gender: string;
  designation: string;
  department: string;
  service: string;
  placeOfPosting: string;
  permanentAddress: string;
  presentAddress: string;
  annualIncome?: number | string;
}

export interface HodProfile {
  name: string;
  designation: string;
  department: string;
  email: string;
  phone: string;
}

export interface User {
  username: string;
  password?: string;
  role: 'employee' | 'hod';
  profile: EmployeeProfile | HodProfile;
}

export interface IprSubmission {
  id: string;
  username?: string;
  reportingYear: string;
  submissionDate: string;
  status: 'Submitted' | 'Approved' | 'Rejected' | 'Correction Required';
  employeeDetails: EmployeeProfile;
  properties: IprProperty[];
  signature: string;
  hodRemarks?: string;
  lastUpdated?: string;
}

export interface NotificationItem {
  id: number;
  message: string;
  date: string;
  type: 'success' | 'warning' | 'info' | 'danger';
}

export interface IprRequest {
  reportingYear: string;
  department: string;
  deadline: string;
  instructions: string;
  generatedDate?: string;
}
