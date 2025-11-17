import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validateFile } from '@/lib/upload';
import { uploadToCloudinary } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'image' | 'video' | 'document';
    const folder = formData.get('folder') as string || 'general';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    const validation = validateFile(file, type);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Determine resource type for Cloudinary
    let resourceType: 'image' | 'video' | 'raw' = 'image';
    if (type === 'video') {
      resourceType = 'video';
    } else if (type === 'document') {
      resourceType = 'raw';
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(
      file,
      `karima/${folder}`,
      resourceType
    );

    return NextResponse.json({
      url: result.url,
      publicId: result.publicId,
      size: result.size,
      type: result.type,
      format: result.format,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
