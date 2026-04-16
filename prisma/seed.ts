import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.create({
    data: { login: 'admin', password: 'admin123', role: 'admin' },
  });
  const editor = await prisma.user.create({
    data: { login: 'editor', password: 'editor123', role: 'editor' },
  });

  const tech = await prisma.category.create({
    data: { name: 'Technology', description: 'Articles about technology' },
  });
  const science = await prisma.category.create({
    data: { name: 'Science', description: 'Articles about science' },
  });
  const news = await prisma.category.create({
    data: { name: 'News', description: 'Latest news' },
  });

  const [js, ts, node, db, docker] = await Promise.all([
    prisma.tag.create({ data: { name: 'javascript' } }),
    prisma.tag.create({ data: { name: 'typescript' } }),
    prisma.tag.create({ data: { name: 'nodejs' } }),
    prisma.tag.create({ data: { name: 'database' } }),
    prisma.tag.create({ data: { name: 'docker' } }),
  ]);

  const article1 = await prisma.article.create({
    data: {
      title: 'Getting Started with TypeScript',
      content:
        'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.',
      status: 'published',
      authorId: admin.id,
      categoryId: tech.id,
      tags: { connect: [{ id: js.id }, { id: ts.id }] },
    },
  });

  const article2 = await prisma.article.create({
    data: {
      title: 'Node.js Best Practices',
      content:
        'Here are the best practices for building scalable Node.js applications.',
      status: 'published',
      authorId: editor.id,
      categoryId: tech.id,
      tags: { connect: [{ id: node.id }, { id: js.id }] },
    },
  });

  const article3 = await prisma.article.create({
    data: {
      title: 'Introduction to Docker',
      content:
        'Docker is a platform for developing, shipping, and running applications in containers.',
      status: 'draft',
      authorId: admin.id,
      categoryId: tech.id,
      tags: { connect: [{ id: docker.id }] },
    },
  });

  await prisma.article.create({
    data: {
      title: 'Database Design Principles',
      content:
        'Good database design is the foundation of any successful application.',
      status: 'published',
      authorId: editor.id,
      categoryId: science.id,
      tags: { connect: [{ id: db.id }] },
    },
  });

  await prisma.article.create({
    data: {
      title: 'Weekly Tech Digest',
      content: 'A roundup of the most interesting technology news this week.',
      status: 'archived',
      authorId: admin.id,
      categoryId: news.id,
      tags: { connect: [{ id: ts.id }, { id: node.id }] },
    },
  });

  await prisma.comment.createMany({
    data: [
      {
        content: 'Great article, very helpful!',
        articleId: article1.id,
        authorId: editor.id,
      },
      {
        content: 'Thanks for sharing this.',
        articleId: article2.id,
        authorId: admin.id,
      },
      {
        content: 'Looking forward to the full version.',
        articleId: article3.id,
        authorId: editor.id,
      },
    ],
  });

  console.log('Seed completed successfully!');
  console.log(`Users: 2 (admin, editor)`);
  console.log(`Categories: 3`);
  console.log(`Tags: 5`);
  console.log(`Articles: 5`);
  console.log(`Comments: 3`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
