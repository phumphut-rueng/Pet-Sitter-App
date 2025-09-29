// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Check if roles already exist
  const existingPetOwner = await prisma.role.findFirst({
    where: { role_name: 'Owner' }
  })

  const existingSitter = await prisma.role.findFirst({
    where: { role_name: 'Sitter' }
  })

  // Create roles if they don't exist
  let petOwnerRole = existingPetOwner
  if (!existingPetOwner) {
    petOwnerRole = await prisma.role.create({
      data: { role_name: 'Owner' }
    })
    console.log('Created Pet Owner role')
  } else {
    console.log('ℹPet Owner role already exists')
  }

  let sitterRole = existingSitter
  if (!existingSitter) {
    sitterRole = await prisma.role.create({
      data: { role_name: 'Sitter' }
    })
    console.log('Created Pet Sitter role')
  } else {
    console.log('Pet Sitter role already exists')
  }

  // -----------------------------
  // Seed basic pet types (idempotent)
  // หมายเหตุ: ตาราง pet_type มี unique(pet_type_name)
  // ใช้ createMany + skipDuplicates เพื่อกันซ้ำ
  // -----------------------------
  const basePetTypes = ['Dog', 'Cat', 'Bird', 'Rabbit']
  const toInsert = basePetTypes.map((name) => ({ pet_type_name: name }))

  // ถ้าตารางมีอยู่แล้ว รันซ้ำจะข้ามตัวที่ซ้ำให้อัตโนมัติ
  await prisma.pet_type.createMany({
    data: toInsert,
    skipDuplicates: true,
  })
  console.log('Ensured basic pet types:', basePetTypes.join(', '))

  console.log('Seed completed successfully!')
  console.log('Available roles:')
  console.log('   - Pet Owner (ID:', petOwnerRole?.id, ')')
  console.log('   - Sitter (ID:', sitterRole?.id, ')')
}

main()
  .catch((e) => {
    console.error('Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })