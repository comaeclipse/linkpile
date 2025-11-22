import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create some tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'javascript' },
      update: {},
      create: { name: 'javascript' },
    }),
    prisma.tag.upsert({
      where: { name: 'react' },
      update: {},
      create: { name: 'react' },
    }),
    prisma.tag.upsert({
      where: { name: 'nextjs' },
      update: {},
      create: { name: 'nextjs' },
    }),
    prisma.tag.upsert({
      where: { name: 'typescript' },
      update: {},
      create: { name: 'typescript' },
    }),
    prisma.tag.upsert({
      where: { name: 'tutorial' },
      update: {},
      create: { name: 'tutorial' },
    }),
  ]);

  // Create some categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'Development' },
      update: {},
      create: { name: 'Development' },
    }),
    prisma.category.upsert({
      where: { name: 'Design' },
      update: {},
      create: { name: 'Design' },
    }),
    prisma.category.upsert({
      where: { name: 'Resources' },
      update: {},
      create: { name: 'Resources' },
    }),
  ]);

  // Create sample bookmarks
  await prisma.bookmark.create({
    data: {
      url: 'https://nextjs.org/',
      title: 'Next.js Official Documentation',
      description: 'The official Next.js documentation and guides',
      isPublic: true,
      tags: {
        connect: [
          { id: tags.find((t) => t.name === 'nextjs')!.id },
          { id: tags.find((t) => t.name === 'react')!.id },
        ],
      },
      categories: {
        connect: [{ id: categories.find((c) => c.name === 'Development')!.id }],
      },
    },
  });

  await prisma.bookmark.create({
    data: {
      url: 'https://www.typescriptlang.org/',
      title: 'TypeScript Documentation',
      description: 'Official TypeScript documentation and handbook',
      isPublic: true,
      tags: {
        connect: [
          { id: tags.find((t) => t.name === 'typescript')!.id },
          { id: tags.find((t) => t.name === 'javascript')!.id },
        ],
      },
      categories: {
        connect: [{ id: categories.find((c) => c.name === 'Development')!.id }],
      },
    },
  });

  await prisma.bookmark.create({
    data: {
      url: 'https://react.dev/',
      title: 'React Documentation',
      description: 'Learn React with the new official documentation',
      isPublic: true,
      tags: {
        connect: [
          { id: tags.find((t) => t.name === 'react')!.id },
          { id: tags.find((t) => t.name === 'javascript')!.id },
          { id: tags.find((t) => t.name === 'tutorial')!.id },
        ],
      },
      categories: {
        connect: [{ id: categories.find((c) => c.name === 'Development')!.id }],
      },
    },
  });

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
