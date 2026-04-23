import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(req: NextRequest) {
  const session = await auth()

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const uploadId = searchParams.get('uploadId')
  const province = searchParams.get('province')
  const yearParam = searchParams.get('year')

  // load all uploads so we can pick the correct one and extract available years
  const allUploads: any[] = await prisma.dataUpload.findMany({
    orderBy: { uploaded_at: 'desc' },
  })

  const years = Array.from(new Set(allUploads.map(u => u.year))).sort((a, b) => b - a)

  let upload: any | null = null

  if (uploadId) {
    upload = allUploads.find(u => u.id === uploadId) || null
  } else if (yearParam) {
    const y = parseInt(yearParam, 10)
    if (!isNaN(y)) {
      upload = allUploads.find(u => u.year === y) || null
    }
  }

  if (!upload) {
    upload = allUploads[0] || null
  }

  if (!upload) {
    return NextResponse.json({ summary: null, records: [] })
  }

  const targetUploadId = upload.id
  const selectedYear = upload.year

  const where = {
    upload_id: targetUploadId,
    ...(province ? { province: { name: province } } : {}),
  }

  const records = await prisma.consultingRecord.findMany({
    where,
    include: {
      province: true,
      district: true,
      school: true,
      statistics: true,
    },
  })

  // Determine level for each record
  const recordsWithLevel = records.map(record => ({
    ...record,
    level: record.school_id ? 3 : record.district_id ? 2 : 1,
  }))

  // Compute summary from province-level records (level 1)
  const provinceRecords = recordsWithLevel.filter(r => r.level === 1)

  // Helper function to get statistic count
  const getStatCount = (stats: any[], type: string, status: string) =>
    stats.find(s => s.type === type && s.status === status)?.count || 0

  const totalStudentsRequested = provinceRecords.reduce((s, r) => 
    s + getStatCount(r.statistics, 'STUDENT_PER_PERSON', 'REQUESTED'), 0)
  const totalStudentsReceived = provinceRecords.reduce((s, r) => 
    s + getStatCount(r.statistics, 'STUDENT_PER_PERSON', 'RECEIVED'), 0)
  const totalStudentsCompleted = provinceRecords.reduce((s, r) => 
    s + getStatCount(r.statistics, 'STUDENT_PER_PERSON', 'COMPLETED'), 0)
  const totalConsultants = provinceRecords.reduce((s, r) => s + r.consultant_count, 0)

  const provinces = [...new Set(recordsWithLevel.map(r => r.province.name))]
  const districts = [...new Set(recordsWithLevel.filter(r => r.level >= 2).map(r => r.district?.name).filter(Boolean))]
  const schools = recordsWithLevel.filter(r => r.level === 3 && r.school).length

  const provinceStats = provinceRecords.map(r => ({
    province: r.province.name,
    consultants: r.consultant_count,
    studentRequested: getStatCount(r.statistics, 'STUDENT_PER_PERSON', 'REQUESTED'),
    studentReceived: getStatCount(r.statistics, 'STUDENT_PER_PERSON', 'RECEIVED'),
    studentCompleted: getStatCount(r.statistics, 'STUDENT_PER_PERSON', 'COMPLETED'),
    completionRate: getStatCount(r.statistics, 'STUDENT_PER_PERSON', 'REQUESTED') > 0
      ? Math.round((getStatCount(r.statistics, 'STUDENT_PER_PERSON', 'COMPLETED') / getStatCount(r.statistics, 'STUDENT_PER_PERSON', 'REQUESTED')) * 100)
      : 0,
    districtCount: recordsWithLevel.filter(d => d.province.name === r.province.name && d.level === 2).length,
    schoolCount: recordsWithLevel.filter(d => d.province.name === r.province.name && d.level === 3).length,
  }))

  // Transform records for response
  const transformedRecords = recordsWithLevel
    .filter(r => r.level === 2 || r.level === 3)
    .map(r => ({
      id: r.id,
      sequence: r.sequence,
      province: r.province.name,
      district: r.district?.name,
      school: r.school?.name,
      level: r.level,
      consultantCount: r.consultant_count,
      districtRequested: getStatCount(r.statistics, 'DISTRICT', 'REQUESTED'),
      districtReceived: getStatCount(r.statistics, 'DISTRICT', 'RECEIVED'),
      districtNotReceived: getStatCount(r.statistics, 'DISTRICT', 'NOT_RECEIVED'),
      districtStarted: getStatCount(r.statistics, 'DISTRICT', 'STARTED'),
      districtCompleted: getStatCount(r.statistics, 'DISTRICT', 'COMPLETED'),
      studentRequestedPerson: getStatCount(r.statistics, 'STUDENT_PER_PERSON', 'REQUESTED'),
      studentReceivedPerson: getStatCount(r.statistics, 'STUDENT_PER_PERSON', 'RECEIVED'),
      studentNotReceivedPerson: getStatCount(r.statistics, 'STUDENT_PER_PERSON', 'NOT_RECEIVED'),
      studentStartedPerson: getStatCount(r.statistics, 'STUDENT_PER_PERSON', 'STARTED'),
      studentCompletedPerson: getStatCount(r.statistics, 'STUDENT_PER_PERSON', 'COMPLETED'),
      studentRequestedSession: getStatCount(r.statistics, 'STUDENT_PER_SESSION', 'REQUESTED'),
      studentReceivedSession: getStatCount(r.statistics, 'STUDENT_PER_SESSION', 'RECEIVED'),
      studentNotReceivedSession: getStatCount(r.statistics, 'STUDENT_PER_SESSION', 'NOT_RECEIVED'),
      studentStartedSession: getStatCount(r.statistics, 'STUDENT_PER_SESSION', 'STARTED'),
      studentCompletedSession: getStatCount(r.statistics, 'STUDENT_PER_SESSION', 'COMPLETED'),
    }))

  return NextResponse.json({
    uploadId: targetUploadId,
    selectedYear,
    years: years,
    summary: {
      totalProvinces: provinces.length,
      totalDistricts: districts.length,
      totalSchools: schools,
      totalConsultants,
      totalStudentsRequested,
      totalStudentsReceived,
      totalStudentsCompleted,
      overallCompletionRate: totalStudentsRequested > 0
        ? Math.round((totalStudentsCompleted / totalStudentsRequested) * 100)
        : 0,
      provinceStats,
    },
    records: transformedRecords,
  })
}
