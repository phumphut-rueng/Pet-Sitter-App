import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Check if roles already exist
  const existingPetOwner = await prisma.role.findFirst({
    where: { role_name: 'pet_owner' }
  })

  const existingSitter = await prisma.role.findFirst({
    where: { role_name: 'pet_sitter' }
  })

  // Create roles if they don't exist
  let petOwnerRole = existingPetOwner
  if (!existingPetOwner) {
    petOwnerRole = await prisma.role.create({
      data: { role_name: 'pet_owner' }
    })
    console.log('Created Pet Owner role')
  } else {
    console.log('ℹPet Owner role already exists')
  }

  let sitterRole = existingSitter
  if (!existingSitter) {
    sitterRole = await prisma.role.create({
      data: { role_name: 'pet_sitter' }
    })
    console.log('Created Pet Sitter role')
  } else {
    console.log('Pet Sitter role already exists')
  }

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