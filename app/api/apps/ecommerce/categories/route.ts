import { NextRequest, NextResponse } from 'next/server';
import { getClientIP } from '@/lib/api';
import { getDemoUser, isUnique } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { systemLog } from '@/services/system-log';
import {
  CategorySchema,
  CategorySchemaType,
} from '@/app/apps/ecommerce/categories/forms/category';
import { EcommerceCategoryStatus } from '@prisma/client';

interface CategoryWithCount {
  id: string;
  name: string;
  description?: string | null;
  status: EcommerceCategoryStatus;
  _count: {
    ecommerceProduct: number;
  };
}

// GET: Fetch all categories with permissions and creator details
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const query = searchParams.get('query') || '';
  const sortField = searchParams.get('sort') || 'name';
  const sortDirection = searchParams.get('dir') || 'asc';
  const skip = (page - 1) * limit;

  try {
    // Build where clause for search
    const where = query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
          ],
        }
      : {};

    // Get total count for pagination
    const total = await prisma.ecommerceCategory.count({
      where,
    });

    let isTableEmpty = false;

    if (total === 0) {
      // Check if the entire table is empty
      const overallTotal = await prisma.ecommerceCategory.count();
      isTableEmpty = overallTotal === 0;
    }

    // Get categories with product count
    const categories = total
      ? await prisma.ecommerceCategory.findMany({
          where,
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            _count: {
              select: {
                ecommerceProduct: true,
              },
            },
          },
          orderBy: {
            [sortField]: sortDirection,
          },
          skip,
          take: limit,
        })
      : [];

    const responseData = categories.map((category: CategoryWithCount) => ({
      ...category,
      productCount: category._count.ecommerceProduct,
    }));

    return NextResponse.json({
      data: responseData,
      meta: {
        total,
        page,
        limit,
      },
      empty: isTableEmpty,
    });
  } catch {
    return NextResponse.json(
      {
        message:
          'Oops! Something didn't go as planned. Please try again in a moment.',
      },
      { status: 500 },
    );
  }
}

// POST: Add a new category
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getDemoUser();

    if (!currentUser) {
      return NextResponse.json(
        { message: 'Unauthorized action' },
        { status: 401 },
      );
    }

    const clientIp = getClientIP(request);

    const body = await request.json();
    const parsedData = CategorySchema.safeParse(body);
    if (!parsedData.success) {
      return NextResponse.json(
        { error: 'Invalid input. Please check your data and try again.' },
        { status: 400 },
      );
    }

    const { name, slug, description }: CategorySchemaType = parsedData.data;

    // Check for uniqueness
    const isUniqueRole = await isUnique('ecommerceCategory', { slug, name });
    if (!isUniqueRole) {
      return NextResponse.json(
        { message: 'Name and slug must be unique.' },
        { status: 400 },
      );
    }

    // Create the new category
    const newCategory = await prisma.ecommerceCategory.create({
      data: {
        createdByUser: { connect: { id: currentUser.id } },
        name,
        slug,
        description,
      },
    });

    // Log
    await systemLog({
      event: 'create',
      userId: currentUser.id,
      entityId: newCategory.id,
      entityType: 'category',
      description: 'Category created by user',
      ipAddress: clientIp,
    });

    return NextResponse.json(newCategory);
  } catch {
    return NextResponse.json(
      {
        message:
          'Oops! Something didn't go as planned. Please try again in a moment.',
      },
      { status: 500 },
    );
  }
}
