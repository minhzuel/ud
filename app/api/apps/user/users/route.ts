import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { getClientIP } from '@/lib/api';
import { getDemoUser } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { systemLog } from '@/services/system-log';
import {
  UserAddSchema,
  UserAddSchemaType,
} from '@/app/apps/user/users/forms/user-add-schema';
import { UserStatus } from '@/app/models/user'; // Import your enum

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const query = searchParams.get('query') || '';
  const sortField = searchParams.get('sort') || 'name';
  const sortDirection = searchParams.get('dir') === 'desc' ? 'desc' : 'asc';
  const status = searchParams.get('status') || null;
  const roleId = searchParams.get('roleId') || null;

  try {
    // Test database connection first
    await prisma.$connect();

    // Map status query to enum type, fallback to null if invalid
    const statusFilter =
      status && status !== 'all' ? (status as UserStatus) : undefined;

    // Count total users with filters
    const totalCount = await prisma.user.count({
      where: {
        AND: [
          ...(statusFilter ? [{ status: statusFilter }] : []),
          ...(roleId && roleId !== 'all' ? [{ roleId }] : []),
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
    });

    // Set order logic
    const sortMap: Record<string, Prisma.UserOrderByWithRelationInput> = {
      name: { name: sortDirection as Prisma.SortOrder },
      role_name: { role: { name: sortDirection as Prisma.SortOrder } },
      status: { status: sortDirection as Prisma.SortOrder },
      createdAt: { createdAt: sortDirection as Prisma.SortOrder },
      lastSignInAt: { lastSignInAt: sortDirection as Prisma.SortOrder },
    };

    // Default to createdAt sorting if no valid field is found
    const orderBy = sortMap[sortField] || {
      createdAt: sortDirection as Prisma.SortOrder,
    };

    // Fetch users with filters
    const users = await prisma.user.findMany({
      where: {
        AND: [
          ...(statusFilter ? [{ status: statusFilter }] : []),
          ...(roleId && roleId !== 'all' ? [{ roleId }] : []),
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      select: {
        id: true,
        isTrashed: true,
        avatar: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        lastSignInAt: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: users,
      pagination: {
        total: totalCount,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    
    // Determine if it's a connection error
    const isConnectionError = error instanceof Error && 
      (error.message.includes('connect ECONNREFUSED') || 
       error.message.includes('Connection refused') ||
       error.message.toLowerCase().includes('timeout'));

    const errorMessage = isConnectionError
      ? 'Database connection error. Please check the database configuration.'
      : 'Oops! Something went wrong. Please try again in a moment.';

    return NextResponse.json(
      { 
        message: errorMessage,
        error: process.env.NODE_ENV === 'development' ? error : undefined 
      },
      { status: 500 },
    );
  } finally {
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error('Error disconnecting from database:', error);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if the user is authenticated
    const currentUser = await getDemoUser();
    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized action.' },
        { status: 401 }, // Access denied
      );
    }

    const clientIp = getClientIP(request);
    const body = await request.json();
    const parsedData = UserAddSchema.safeParse(body);

    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Invalid input.' },
        { status: 400 }, // Bad request
      );
    }

    const { name, email, roleId }: UserAddSchemaType = parsedData.data;

    // Check if the email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email is already registered.' },
        { status: 409 }, // Conflict
      );
    }

    // Check if the role exists
    const existingRole = await prisma.userRole.findUnique({
      where: { id: roleId },
    });

    if (!existingRole) {
      return NextResponse.json(
        {
          message:
            'Selected role does not exist. Someone might have deleted it already.',
        },
        { status: 404 }, // Not found
      );
    }

    // Use a transaction to insert multiple records atomically
    const result = await prisma.$transaction(async (tx) => {
      // Create a user
      const user = await tx.user.create({
        data: {
          name,
          email,
          status: UserStatus.ACTIVE,
          roleId,
        },
      });

      // Log the event
      await systemLog(
        {
          event: 'create',
          userId: currentUser.id,
          entityId: user.id,
          entityType: 'user',
          description: 'User added by user.',
          ipAddress: clientIp,
        },
        tx,
      );

      return user;
    });

    return NextResponse.json(
      {
        message: 'User successfully added.',
        user: result,
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
