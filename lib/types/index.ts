export interface ConsultingRow {
  sequence: string
  province: string
  district?: string
  school?: string
  level: number
  consultantCount: number
  districtRequested: number
  districtReceived: number
  districtNotReceived: number
  districtStarted: number
  districtCompleted: number
  studentRequestedPerson: number
  studentReceivedPerson: number
  studentNotReceivedPerson: number
  studentStartedPerson: number
  studentCompletedPerson: number
  studentRequestedSession: number
  studentReceivedSession: number
  studentNotReceivedSession: number
  studentStartedSession: number
  studentCompletedSession: number
}

export interface ProvinceStats {
  province: string
  consultants: number
  studentRequested: number
  studentReceived: number
  studentCompleted: number
  completionRate: number
  districtCount: number
  schoolCount: number
}

export interface DashboardSummary {
  totalProvinces: number
  totalDistricts: number
  totalSchools: number
  totalConsultants: number
  totalStudentsRequested: number
  totalStudentsReceived: number
  totalStudentsCompleted: number
  overallCompletionRate: number
  provinceStats: ProvinceStats[]
}

export interface ConsultRecord {
  id: string
  sequence: string
  province: string
  district?: string
  school?: string
  level: number
  consultantCount: number
  studentRequestedPerson: number
  studentReceivedPerson: number
  studentNotReceivedPerson: number
  studentStartedPerson: number
  studentCompletedPerson: number
  studentRequestedSession: number
  studentReceivedSession: number
  studentNotReceivedSession: number
  studentStartedSession: number
  studentCompletedSession: number
}
