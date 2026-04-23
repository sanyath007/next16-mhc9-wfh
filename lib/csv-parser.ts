import Papa from 'papaparse'

export const EXPECTED_COLUMNS = [
    'ลำดับ',
    'จังหวัด',
    'อำเภอ',
    'โรงเรียน',
    'จำนวน Consultant ที่ให้คำปรึกษา',
    'จำนวนอำเภอที่มีการขอคำปรึกษา',
    'จำนวนอำเภอที่มีการรับคำปรึกษา',
    'จำนวนอำเภอที่ไม่ได้รับคำขอปรึกษา',
    'จำนวนอำเภอที่มีการเริ่มให้คำปรึกษาแล้ว',
    'จำนวนอำเภอที่มีการให้คำปรึกษาสำเร็จแล้ว',
    'จำนวนนักเรียนที่มีการขอคำปรึกษา (รายคน)',
    'จำนวนนักเรียนที่มีการรับคำปรึกษา (รายคน)',
    'จำนวนนักเรียนที่ไม่ได้รับคำขอปรึกษา (รายคน)',
    'จำนวนนักเรียนที่มีการเริ่มให้คำปรึกษาแล้ว (รายคน)',
    'จำนวนนักเรียนที่มีการให้คำปรึกษาสำเร็จแล้ว (รายคน)',
    'จำนวนนักเรียนที่มีการขอคำปรึกษา (รายครั้ง)',
    'จำนวนนักเรียนที่มีการรับคำปรึกษา (รายครั้ง)',
    'จำนวนนักเรียนที่ไม่ได้รับคำขอปรึกษา (รายครั้ง)',
    'จำนวนนักเรียนที่มีการเริ่มให้คำปรึกษาแล้ว (รายครั้ง)',
    'จำนวนนักเรียนที่มีการให้คำปรึกษาสำเร็จแล้ว (รายครั้ง)',
]

export interface ParsedConsultingData {
    sequence: string
    provinceName: string
    districtName?: string
    schoolName?: string
    consultantCount: number
    statistics: Array<{
        type: 'DISTRICT' | 'STUDENT_PER_PERSON' | 'STUDENT_PER_SESSION'
        data: Array<{
            status: 'REQUESTED' | 'RECEIVED' | 'NOT_RECEIVED' | 'STARTED' | 'COMPLETED'
            count: number
        }>
    }>
}

export function parseCSVRow(row: Record<string, string>): ParsedConsultingData {
    const toInt = (key: string) => parseInt(row[key] || '0') || 0

    return {
        sequence: row['ลำดับ'] || '',
        provinceName: row['จังหวัด'] || '',
        districtName: row['อำเภอ'] || undefined,
        schoolName: row['โรงเรียน'] || undefined,
        consultantCount: toInt('จำนวน Consultant ที่ให้คำปรึกษา'),
        statistics: [
            {
                type: 'DISTRICT',
                data: [
                    { status: 'REQUESTED', count: toInt('จำนวนอำเภอที่มีการขอคำปรึกษา') },
                    { status: 'RECEIVED', count: toInt('จำนวนอำเภอที่มีการรับคำปรึกษา') },
                    { status: 'NOT_RECEIVED', count: toInt('จำนวนอำเภอที่ไม่ได้รับคำขอปรึกษา') },
                    { status: 'STARTED', count: toInt('จำนวนอำเภอที่มีการเริ่มให้คำปรึกษาแล้ว') },
                    { status: 'COMPLETED', count: toInt('จำนวนอำเภอที่มีการให้คำปรึกษาสำเร็จแล้ว') },
                ],
            },
            {
                type: 'STUDENT_PER_PERSON',
                data: [
                    { status: 'REQUESTED', count: toInt('จำนวนนักเรียนที่มีการขอคำปรึกษา (รายคน)') },
                    { status: 'RECEIVED', count: toInt('จำนวนนักเรียนที่มีการรับคำปรึกษา (รายคน)') },
                    { status: 'NOT_RECEIVED', count: toInt('จำนวนนักเรียนที่ไม่ได้รับคำขอปรึกษา (รายคน)') },
                    { status: 'STARTED', count: toInt('จำนวนนักเรียนที่มีการเริ่มให้คำปรึกษาแล้ว (รายคน)') },
                    { status: 'COMPLETED', count: toInt('จำนวนนักเรียนที่มีการให้คำปรึกษาสำเร็จแล้ว (รายคน)') },
                ],
            },
            {
                type: 'STUDENT_PER_SESSION',
                data: [
                    { status: 'REQUESTED', count: toInt('จำนวนนักเรียนที่มีการขอคำปรึกษา (รายครั้ง)') },
                    { status: 'RECEIVED', count: toInt('จำนวนนักเรียนที่มีการรับคำปรึกษา (รายครั้ง)') },
                    { status: 'NOT_RECEIVED', count: toInt('จำนวนนักเรียนที่ไม่ได้รับคำขอปรึกษา (รายครั้ง)') },
                    { status: 'STARTED', count: toInt('จำนวนนักเรียนที่มีการเริ่มให้คำปรึกษาแล้ว (รายครั้ง)') },
                    { status: 'COMPLETED', count: toInt('จำนวนนักเรียนที่มีการให้คำปรึกษาสำเร็จแล้ว (รายครั้ง)') },
                ],
            },
        ],
    }
}

/**
 * To use asynchronous papa's parse method as synchronously
 * @param string file
 * @returns Promise papa.ParseResult
 */
export function parseCsv(file: string): Promise<Papa.ParseResult<any>> {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            complete: function(results) {
                resolve(results)
            },
            error: function(err: any) {
                reject(err)
            }
        })
    })
}