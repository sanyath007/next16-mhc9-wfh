import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseCSVRow, EXPECTED_COLUMNS } from '@/lib/csv-parser'
import Papa from 'papaparse'
import { auth } from '@/auth'

export async function POST(req: NextRequest) {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const userWithRole = session.user as { role: string; id: string }
    if (userWithRole.role === 'VIEWER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.csv')) {
        return NextResponse.json({ error: 'Only CSV files are supported' }, { status: 400 })
    }

    const text = await file.text()
    const { data, errors } = Papa.parse<Record<string, string>>(text, {
        header: true,
        skipEmptyLines: true,
    })

    if (errors.length > 0) {
        return NextResponse.json({ error: 'CSV parse error', details: errors }, { status: 400 })
    }

    /** Validate columns */
    const headers = Object.keys(data[0] || {})
    const missingCols = EXPECTED_COLUMNS.filter(col => !headers.includes(col))
    if (missingCols.length > 0) {
        return NextResponse.json({
            error: 'Missing required columns',
            missing: missingCols,
        }, { status: 400 })
    }

    try {
        /** Create upload record */
        const upload = await prisma.dataUpload.create({
            data: {
                filename: file.name,
                uploaded_by: userWithRole.id,
                row_count: data.length,
                year: 2025
            },
        })

        /** Process records with location lookup/creation */
        for (const row of data) {
            const parsed = parseCSVRow(row)

            /** Get or create Province */
            const province = await prisma.province.findFirst({
                where: { name: parsed.provinceName }
            })

            let districtId: string | null = null
            let schoolId: string | null = null

            /** Get or create District if provided */
            if (parsed.districtName) {
                const district = await prisma.district.findFirst({
                    where: {
                        province_id: province?.id,
                        name: parsed.districtName,
                    }
                })
                districtId = `${district?.id}`

                /** Get or create School if provided */
                if (parsed.schoolName) {
                    const school = await prisma.school.upsert({
                        where: {
                            district_id_name: {
                                district_id: district?.id!,
                                name: parsed.schoolName,
                            },
                        },
                        update: {},
                        create: {
                            name: parsed.schoolName,
                            district: { connect: { id: district?.id } },
                        },
                    })
                    schoolId = school.id
                    console.log(school);
                }
            }

            /** Create ConsultingRecord */
            const record = await prisma.consultingRecord.create({
                data: {
                    sequence: parsed.sequence,
                    upload: { connect: { id: upload?.id } },
                    province: { connect: { id: province?.id } },
                    district: { connect: { id: parseInt(districtId!) } },
                    school: { connect: { id: schoolId! } },
                    consultant_count: parsed.consultantCount,
                },
            })

            /** Create Statistics */
            for (const statGroup of parsed.statistics) {
                for (const stat of statGroup.data) {
                    await prisma.statistic.create({
                        data: {
                            record_id: record.id,
                            type: statGroup.type as any,
                            status: stat.status as any,
                            count: stat.count,
                        },
                    })
                }
            }
        }

        return NextResponse.json({
            success: true,
            uploadId: upload.id,
            rowCount: data.length,
        })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json(
            { error: 'Failed to process upload', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
}

export async function GET() {
    const session = await auth()

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const uploads = await prisma.dataUpload.findMany({
        orderBy: { uploaded_at: 'desc' },
        take: 20,
        include: {
            user: { select: { name: true, email: true } },
        },
    })

    return NextResponse.json(uploads)
}
