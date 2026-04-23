import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Function to parse SQL INSERT statements for schools and extract data
function parseSchoolSQLInserts(sqlContent: string) {
    const schools: Array<{
        name: string
        districtName: string
        provinceName: string
    }> = []

    // Split by INSERT statements - adjust table name as needed
    const insertStatements = sqlContent.split('INSERT INTO school_hero\\.schools')

    for (const statement of insertStatements.slice(1)) { // Skip first empty part
        // Extract values between parentheses
        const valuesMatch = statement.match(/\(([^)]+)\)/g)
        if (valuesMatch) {
        for (const valueStr of valuesMatch) {
            // Remove parentheses and split by comma
            const values = valueStr.slice(1, -1).split(',')
            if (values.length >= 4) { // id, name, district_id, province_id or similar
            const parseValue = (val: string) => val.trim() === 'NULL' ? null : val.replace(/'/g, '').trim()

            schools.push({
                name: parseValue(values[1]) || '',
                districtName: '', // You'll need to populate this based on your SQL structure
                provinceName: '', // You'll need to populate this based on your SQL structure
            })
            }
        }
        }
    }

    return schools
}

async function seedSchoolsFromSQL() {
    console.log('🏫 Seeding schools from SQL file...')

    const sqlPath = path.join(process.cwd(), 'schools.sql') // Adjust filename as needed

    if (!fs.existsSync(sqlPath)) {
        console.log('❌ SQL file not found. Please place your schools SQL file in the project root.')
        console.log('Expected filename: schools.sql')
        return
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf-8')
    const schools = parseSchoolSQLInserts(sqlContent)

    console.log(`📊 Found ${schools.length} schools in SQL file`)

    let created = 0
    let skipped = 0

    for (const school of schools) {
        try {
        // First, find the district by name and province
        const district = await prisma.district.findFirst({
            where: {
            name: school.districtName,
            province: {
                name: school.provinceName
            }
            }
        })

        if (!district) {
            console.log(`⚠️  District not found for school: ${school.name} (district: ${school.districtName}, province: ${school.provinceName})`)
            skipped++
            continue
        }

        await prisma.school.upsert({
            where: {
            district_id_name: {
                district_id: district?.id,
                name: school.name,
            }
            },
            update: {},
            create: {
            name: school.name,
            district_id: district?.id,
            },
        })
        created++
        } catch (error) {
        console.log(`⚠️  Error seeding school: ${school.name} - ${error}`)
        skipped++
        }
    }

    console.log(`✅ Created ${created} schools, skipped ${skipped} schools`)
}

// Run if called directly
if (require.main === module) {
    seedSchoolsFromSQL()
        .catch(console.error)
        .finally(() => prisma.$disconnect())
}

export { seedSchoolsFromSQL }