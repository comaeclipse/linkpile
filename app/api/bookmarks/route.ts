import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all bookmarks
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const isPublic = searchParams.get('public');

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { url: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categories = {
        some: {
          name: category,
        },
      };
    }

    if (tag) {
      where.tags = {
        some: {
          name: tag,
        },
      };
    }

    if (isPublic !== null) {
      where.isPublic = isPublic === 'true';
    }

    const bookmarks = await prisma.bookmark.findMany({
      where,
      include: {
        tags: true,
        categories: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(bookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}

// POST create new bookmark
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, title, description, isPublic, tags, categories } = body;

    if (!url || !title) {
      return NextResponse.json(
        { error: 'URL and title are required' },
        { status: 400 }
      );
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        url,
        title,
        description: description || '',
        isPublic: isPublic ?? true,
        tags: {
          connectOrCreate: tags?.map((tag: string) => ({
            where: { name: tag },
            create: { name: tag },
          })) || [],
        },
        categories: {
          connectOrCreate: categories?.map((category: string) => ({
            where: { name: category },
            create: { name: category },
          })) || [],
        },
      },
      include: {
        tags: true,
        categories: true,
      },
    });

    return NextResponse.json(bookmark, { status: 201 });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to create bookmark' },
      { status: 500 }
    );
  }
}
