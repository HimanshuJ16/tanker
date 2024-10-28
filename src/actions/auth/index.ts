'use server'

import { client } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'

export async function onCompleteUserRegistration(
  fullname: string,
  username: string,
  password: string,
  contactNumber: string | null,
  email: string | null,
  district: string,
  role: string,
  parentId?: string,
  contractorId?: string
) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10)

    let circle = await client.circle.findFirst({
      where: {
        name: {
          equals: district,
          mode: 'insensitive'
        }
      },
    })

    if (!circle) {
      circle = await client.circle.create({
        data: { name: district },
      })
    }

    const user = await client.user.create({
      data: {
        fullname,
        username,
        password: hashedPassword,
        contactNumber,
        email,
        district,
        role,
        circle: {
          connect: { id: circle.id },
        },
      }
    })

    switch (role) {
      case 'se':
        await client.se.create({
          data: {
            name: fullname,
            username,
            district,
            circle: { connect: { id: circle.id } },
          },
        })
        break
      case 'xen':
        const se = await client.se.findFirst({ where: { district } })
        if (!se) throw new Error('No SE found for this district')
        await client.xen.create({
          data: {
            name: fullname,
            username,
            district,
            circle: { connect: { id: circle.id } },
            se: { connect: { id: se.id } },
          },
        })
        break
      case 'aen':
        if (!parentId) throw new Error('Parent XEN ID is required for AEN creation')
        await client.aen.create({
          data: {
            name: fullname,
            username,
            district,
            circle: { connect: { id: circle.id } },
            xen: { connect: { id: parentId } },
          },
        })
        break
      case 'jen':
        if (!parentId) throw new Error('Parent AEN ID is required for JEN creation')
        let contractor
        if (contractorId) {
          const user = await client.user.findUnique({
            where: { id: contractorId },
            select: {
              circle: { select: { id: true } },
            },
          })
          if (!user || !user.circle) throw new Error('User or User\'s Circle not found')
  
          const circle = user.circle
  
          contractor = await client.circle.findUnique({
            where: { id: circle.id },
            select: {
              contractors: { select: { id: true } },
            },
          })
  
          if (!contractor || contractor.contractors.length === 0) throw new Error('Contractor not found')
  
          contractor = contractor.contractors[0]
  
        } else {
          contractor = await client.contractor.findFirst({
            where: { circleId: circle.id },
          })

          if (!contractor) {
            contractor = await client.contractor.create({
              data: {
                name: 'Default Contractor',
                username: `default_contractor_${circle.id}`,
                district,
                circle: { connect: { id: circle.id } },
              },
            })
          }
        }
  
        await client.jen.create({
          data: {
            name: fullname,
            username,
            district,
            circle: { connect: { id: circle.id } },
            aen: { connect: { id: parentId } },
            contractor: { connect: { id: contractor.id } },
          },
        })
        break
      case 'vendor':
        if (!parentId) throw new Error('Parent JEN ID is required for Vendor creation')
        await client.vendor.create({
          data: {
            name: fullname,
            username,
            district,
            circle: { connect: { id: circle.id } },
            jen: { connect: { id: parentId } },
          },
        })
        break
      case 'contractor':
        await client.contractor.create({
          data: {
            name: fullname,
            username,
            district,
            circle: { connect: { id: circle.id } },
          },
        })
        break
    }

    return {
      status: 200,
      user,
    }
  } catch (error) {
    console.error('Error creating user:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          status: 400,
          error: 'A user with this username already exists.',
        }
      }
    }
    return {
      status: 500,
      error: 'Failed to create user',
    }
  }
}

export async function fetchParentRoles(district: string, role: string) {
  try {
    console.log(`Fetching parent roles for district: ${district}, role: ${role}`);

    const circle = await client.circle.findFirst({
      where: {
        name: {
          equals: district,
          mode: 'insensitive'
        }
      },
    })

    if (!circle) {
      console.error(`Circle not found for district: ${district}`);
      const allCircles = await client.circle.findMany({
        select: { name: true }
      });
      console.log('Available circles:', allCircles.map(c => c.name));
      throw new Error(`Circle not found for the given district: ${district}`)
    }

    console.log(`Circle found: ${circle.id}`);

    let parentRoles: string | any[] = [];

    switch (role) {
      case 'aen':
        parentRoles = await client.xen.findMany({
          where: { circleId: circle.id },
          select: { id: true, username: true, name: true },
        })
        break;
      case 'jen':
        parentRoles = await client.aen.findMany({
          where: { circleId: circle.id },
          select: { id: true, username: true, name: true },
        })
        break;
      case 'vendor':
        parentRoles = await client.jen.findMany({
          where: { circleId: circle.id },
          select: { id: true, username: true, name: true },
        })
        break;
      default:
        console.log(`No parent roles for role: ${role}`);
    }

    console.log(`Found ${parentRoles.length} parent roles:`, parentRoles);
    return parentRoles;
  } catch (error) {
    console.error('Error fetching parent roles:', error)
    throw error
  }
}

export async function fetchContractorDistrict(contractorId: string) {
  try {
    console.log(`Attempting to fetch user with ID: ${contractorId}`)

    const user = await client.user.findUnique({
      where: { id: contractorId },
      select: {
        id: true,
        district: true,
        circle: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!user) {
      console.error(`User not found for ID: ${contractorId}`)

      // Log all users for debugging (be cautious with this in production)
      const allUsers = await client.user.findMany({
        select: { id: true, username: true, district: true },
      })
      console.log('All users:', JSON.stringify(allUsers, null, 2))

      throw new Error(`User not found for ID: ${contractorId}`)
    }

    console.log(`User found:`, JSON.stringify(user, null, 2))

    // Use circle name as district if user's district is not set
    const district = user.district || user.circle?.name || ''

    if (!district) {
      throw new Error(`No district found for user ID: ${contractorId}`)
    }

    return district
  } catch (error) {
    console.error('Error in fetchContractorDistrict:', error)
    // Log error details for production
    if (process.env.NODE_ENV === 'production') {
      console.error(`Production error for user ID ${contractorId}:`, error)
    }
    throw error
  } finally {
    await client.$disconnect()
  }
}