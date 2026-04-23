import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()
const DISTRICTS_SQL = 'data/districts_202603070930.sql' // updated SQL file path

// parse SQL INSERT statements and return district data
function parseDistrictSQLInserts(sqlContent: string) {
    const districts: Array<{ id: string; name: string; province_id: string; district_id: string }> = []
    const inserts = sqlContent.split('INSERT INTO school_hero.districts')

    for (const part of inserts.slice(1)) {
        const matches = part.match(/\(([^)]+)\)/g) || []
        for (const m of matches) {
            const cols = m.slice(1, -1).split(',').map(s => s.trim())
            if (cols.length < 4) continue
            const clean = (v: string) => (v === 'NULL' ? '' : v.replace(/'/g, ''))
            districts.push({
                id: clean(cols[0]),
                name: clean(cols[1]),
                province_id: clean(cols[2]),
                district_id: clean(cols[3]),
            })
        }
    }
    return districts
}

async function seedDistrictsFromSQL() {
    console.log('🏙️ Seeding districts using', DISTRICTS_SQL)

    const sqlPath = path.join(process.cwd(), DISTRICTS_SQL)
    if (!fs.existsSync(sqlPath)) {
        console.error(`❌ SQL file not found at ${sqlPath}. Please place your updated districts.sql in the /data folder.`)
        return
    }

    const sql = fs.readFileSync(sqlPath, 'utf-8')
    const districts = parseDistrictSQLInserts(sql)
    console.log(`📊 Parsed ${districts.length} districts`)

    let created = 0, skipped = 0
    for (const d of districts) {
        try {
            const province = await prisma.province.findFirst({ where: { id: parseInt(d.province_id) } })
            if (!province) {
                console.warn(`Province ${d.province_id} not found, skipping ${d.name}`)
                skipped++
                continue
            }
            await prisma.district.upsert({
                where: { province_id_name: { province_id: province?.id, name: d.name } },
                update: { district_id: d.district_id },
                create: {
                    id: parseInt(d.id, 10),
                    name: d.name,
                    province_id: province?.id,
                    district_id: d.district_id
                },
            })
            created++
        } catch (e) {
            console.error('Error seeding', d.name, e)
            skipped++
        }
    }

    console.log(`✅ Created ${created}, skipped ${skipped}`)
}

if (require.main === module) {
    seedDistrictsFromSQL()
        .catch(console.error)
        .finally(() => prisma.$disconnect())
}

export { seedDistrictsFromSQL }