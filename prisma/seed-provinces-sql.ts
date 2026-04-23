import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Function to parse SQL INSERT statements and extract province data
function parseSQLInserts(sqlContent: string) {
    const provinces: Array<{
        id: string
        name: string
        name_en: string | null
        short: string | null
        short_en: string | null
        region_id: number | null
    }> = []

    // Split by INSERT statements
    const insertStatements = sqlContent.split('INSERT INTO school_hero.provinces (id,name,name_en,short,short_en,region_id) VALUES')

    for (const statement of insertStatements.slice(1)) { // Skip first empty part
        // Extract values between parentheses
        const valuesMatch = statement.match(/\(([^)]+)\)/g)
        if (valuesMatch) {
            for (const valueStr of valuesMatch) {
                // Remove parentheses and split by comma
                const values = valueStr.slice(1, -1).split(',')
                if (values.length >= 6) {
                    // Parse each value (handling NULL values)
                    const parseValue = (val: string) => val.trim() === 'NULL' ? null : val.replace(/'/g, '').trim()

                    provinces.push({
                        id: parseValue(values[0]) || '',
                        name: parseValue(values[1]) || '',
                        name_en: parseValue(values[2]),
                        short: parseValue(values[3]),
                        short_en: parseValue(values[4]),
                        region_id: parseValue(values[5]) ? parseInt(parseValue(values[5])!) : null,
                    })
                }
            }
        }
    }

    return provinces
}

async function seedProvincesFromSQL() {
    console.log('🌍 Seeding provinces from SQL file...')

    const sqlPath = path.join(process.cwd(), 'data/provinces_202603070930.sql')

    if (!fs.existsSync(sqlPath)) {
        console.log('❌ SQL file not found. Please place provinces_202603070930.sql in the project root.')
        return
    }

    const sqlContent = fs.readFileSync(sqlPath, 'utf-8')
    const provinces = parseSQLInserts(sqlContent)

    console.log(`📊 Found ${provinces.length} provinces in SQL file`)

    let created = 0
    let skipped = 0

    for (const province of provinces) {
        try {
            await prisma.province.upsert({
                where: { id: parseInt(province.id, 10) },
                update: {},
                create: {
                    id: parseInt(province.id, 10),
                    name: province.name,
                    name_en: province.name_en,
                    short: province.short,
                    short_en: province.short_en,
                    region_id: province.region_id,
                },
            })
            created++
        } catch (error) {
            console.log(error);
            
            console.log(`⚠️  Skipped duplicate province: ${province.name}`)
            skipped++
        }
    }

    console.log(`✅ Created ${created} provinces, skipped ${skipped} duplicates`)
}

// Run if called directly
if (require.main === module) {
    seedProvincesFromSQL()
        .catch(console.error)
        .finally(() => prisma.$disconnect())
}

export { seedProvincesFromSQL }