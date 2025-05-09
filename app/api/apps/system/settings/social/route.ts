import { NextRequest, NextResponse } from 'next/server';
import { getClientIP } from '@/lib/api';
import { getDemoUser } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { systemLog } from '@/services/system-log';
import { SocialSettingsSchema } from '@/app/apps/system/settings/forms/social-settings-schema';

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

    // Parse the request body as JSON
    const body = await request.json();

    const settings = await prisma.systemSetting.findFirst();
    if (!settings) {
      return NextResponse.json(
        { message: 'Settings not found.' },
        { status: 404 },
      );
    }

    // Validate the input using the Zod schema
    const validationResult = SocialSettingsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid input. Please check your data and try again.' },
        { status: 400 },
      );
    }

    // Update only the social settings fields
    await prisma.systemSetting.update({
      where: { id: settings.id },
      data: validationResult.data,
    });

    // Log the event
    await systemLog({
      event: 'update',
      userId: currentUser.id,
      entityId: currentUser.id,
      entityType: 'system.settings',
      description: 'System settings updated.',
      ipAddress: clientIp,
    });

    // Return success response
    return NextResponse.json(
      { message: 'Social settings updated successfully' },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { message: 'Oops! Something went wrong. Please try again in a moment.' },
      { status: 500 },
    );
  }
}
