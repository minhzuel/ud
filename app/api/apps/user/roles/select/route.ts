import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const roles = await prisma.userRole.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    
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
  }
}
