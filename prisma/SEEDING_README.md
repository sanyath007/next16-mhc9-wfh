# Database Seeding Guide

This guide explains how to seed your normalized database with location data (provinces, districts, schools) from SQL files.

## Overview

Your database has been normalized with separate tables for:
- **Provinces** - จังหวัด (77 provinces)
- **Districts** - อำเภอ (with province relationships)
- **Schools** - โรงเรียน (with district relationships)

## Available Seeding Scripts

### 1. Main Seed (`npm run db:seed`)
Seeds provinces (hardcoded) + default users. Run this first.

### 2. Provinces from SQL (`npm run db:seed:provinces`)
Parses `provinces_202603070930.sql` and seeds all 77 Thai provinces.

**Requirements:**
- Place `provinces_202603070930.sql` in project root
- File should contain INSERT statements for `school_hero.provinces`

### 3. Districts from SQL (`npm run db:seed:districts`)
Parses districts SQL file and creates district records.

**Requirements:**
- Place your districts SQL file as `districts.sql` in project root
- Update the parser function to match your SQL column structure
- Provinces must be seeded first

### 4. Schools from SQL (`npm run db:seed:schools`)
Parses schools SQL file and creates school records.

**Requirements:**
- Place your schools SQL file as `schools.sql` in project root
- Update the parser function to match your SQL column structure
- Districts must be seeded first

## Usage Examples

```bash
# 1. Seed provinces + users
npm run db:seed

# 2. Seed provinces from SQL (alternative to step 1)
npm run db:seed:provinces

# 3. Seed districts (requires provinces)
npm run db:seed:districts

# 4. Seed schools (requires districts)
npm run db:seed:schools
```

## SQL File Format

Your SQL files should contain INSERT statements like:

```sql
INSERT INTO school_hero.provinces (id,name,name_en,short,short_en,region_id) VALUES
 ('10','กรุงเทพมหานคร','Bangkok','กทม',NULL,'1'),
 ('11','สมุทรปราการ','Samutprakan','สป',NULL,'3');
```

## Customization

Each seeding script has a parser function that extracts data from SQL INSERT statements. If your SQL files have different column orders or table names, update the `parse*SQLInserts` functions accordingly.

## Error Handling

- Scripts skip duplicate records (using upsert)
- Missing provinces/districts are logged and skipped
- All operations are wrapped in try-catch blocks

## Data Relationships

The seeding maintains referential integrity:
- Districts reference provinces
- Schools reference districts
- All use foreign key constraints

## Troubleshooting

1. **"SQL file not found"** - Place the SQL file in project root with correct name
2. **"Province not found"** - Ensure provinces are seeded before districts/schools
3. **"Duplicate key error"** - Script uses upsert, should handle duplicates automatically
4. **Parser errors** - Check SQL format matches expected INSERT statement structure