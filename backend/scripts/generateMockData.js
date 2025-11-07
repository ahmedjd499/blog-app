const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');

// Generate realistic mock data
const generateMockData = async () => {
  console.log('🔨 Generating mock data...\n');

  // Hash password for all users (password123)
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Generate user IDs
  const adminId = new ObjectId();
  const editorId = new ObjectId();
  const editorId2 = new ObjectId();
  const writerId = new ObjectId();
  const readerId = new ObjectId();
  const johnId = new ObjectId();
  const sarahId = new ObjectId();

  // Users
  const users = [
    {
      _id: adminId,
      username: 'admin',
      email: 'admin@test.com',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      _id: editorId,
      username: 'editor',
      email: 'editor@test.com',
      password: hashedPassword,
      role: 'editor',
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
    },
    {
      _id: editorId2,
      username: 'editor2',
      email: 'editor2@test.com',
      password: hashedPassword,
      role: 'editor',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-12')
    },
    {
      _id: writerId,
      username: 'writer',
      email: 'writer@test.com',
      password: hashedPassword,
      role: 'writer',
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03')
    },
    {
      _id: readerId,
      username: 'reader',
      email: 'reader@test.com',
      password: hashedPassword,
      role: 'reader',
      createdAt: new Date('2024-01-04'),
      updatedAt: new Date('2024-01-04')
    },
    {
      _id: johnId,
      username: 'john_writer',
      email: 'john@example.com',
      password: hashedPassword,
      role: 'writer',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05')
    },
    {
      _id: sarahId,
      username: 'sarah_editor',
      email: 'sarah@example.com',
      password: hashedPassword,
      role: 'editor',
      createdAt: new Date('2024-01-06'),
      updatedAt: new Date('2024-01-06')
    }
  ];

  // Generate article IDs
  const article1Id = new ObjectId();
  const article2Id = new ObjectId();
  const article3Id = new ObjectId();
  const article4Id = new ObjectId();
  const article5Id = new ObjectId();

  // Articles
  const articles = [
    {
      _id: article1Id,
      title: 'Getting Started with MEAN Stack Development',
      slug: 'getting-started-with-mean-stack-development',
      excerpt: 'Learn the fundamentals of building full-stack applications with MongoDB, Express, Angular, and Node.js.',
      content: '<h2>Introduction to MEAN Stack</h2><p>The MEAN stack is a powerful combination of technologies for building modern web applications. It consists of MongoDB (database), Express.js (backend framework), Angular (frontend framework), and Node.js (runtime environment).</p><h3>Why Choose MEAN Stack?</h3><p>The MEAN stack offers several advantages including JavaScript throughout the stack, scalability, and a rich ecosystem of libraries and tools.</p>',
      author: adminId,
      published: true,
      views: 1250,
      likes: 89,
      tags: ['MEAN', 'JavaScript', 'Tutorial', 'Web Development'],
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    },
    {
      _id: article2Id,
      title: 'Real-Time Features with Socket.io',
      slug: 'real-time-features-with-socketio',
      excerpt: 'Implementing real-time communication in your web applications using Socket.io and Node.js.',
      content: '<h2>Understanding Socket.io</h2><p>Socket.io enables real-time, bidirectional communication between web clients and servers. It makes building chat applications, live notifications, and collaborative tools much easier.</p><h3>Key Features</h3><ul><li>Automatic reconnection</li><li>Binary support</li><li>Room and namespace support</li><li>Fallback to HTTP long-polling</li></ul>',
      author: writerId,
      published: true,
      views: 980,
      likes: 67,
      tags: ['Socket.io', 'Real-time', 'Node.js', 'WebSocket'],
      createdAt: new Date('2024-02-05'),
      updatedAt: new Date('2024-02-05')
    },
    {
      _id: article3Id,
      title: 'Role-Based Access Control in Express.js',
      slug: 'role-based-access-control-in-expressjs',
      excerpt: 'Implementing secure role-based permissions and authentication in your Node.js applications.',
      content: '<h2>Understanding RBAC</h2><p>Role-Based Access Control (RBAC) is a method of regulating access to resources based on user roles. In a typical application, you might have roles like Admin, Editor, Writer, and Reader, each with different permissions.</p><h3>Implementation Strategy</h3><p>We use middleware functions to check user roles before allowing access to specific routes or actions. This ensures security and proper authorization throughout the application.</p>',
      author: editorId,
      published: true,
      views: 756,
      likes: 52,
      tags: ['Security', 'Express.js', 'Authentication', 'Authorization'],
      createdAt: new Date('2024-02-10'),
      updatedAt: new Date('2024-02-10')
    },
    {
      _id: article4Id,
      title: 'Building Responsive UIs with Angular and Tailwind CSS',
      slug: 'building-responsive-uis-with-angular-tailwind',
      excerpt: 'Create beautiful, responsive user interfaces using Angular components and Tailwind CSS utility classes.',
      content: '<h2>Why Tailwind CSS?</h2><p>Tailwind CSS is a utility-first CSS framework that provides low-level utility classes to build custom designs. Unlike traditional CSS frameworks, Tailwind doesn\'t impose design decisions on you.</p><h3>Integration with Angular</h3><p>Integrating Tailwind CSS with Angular is straightforward. We\'ll cover installation, configuration, and best practices for using utility classes in Angular templates.</p>',
      author: johnId,
      published: true,
      views: 1420,
      likes: 103,
      tags: ['Angular', 'Tailwind CSS', 'UI/UX', 'Frontend'],
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-02-15')
    },
    {
      _id: article5Id,
      title: 'MongoDB Schema Design Best Practices',
      slug: 'mongodb-schema-design-best-practices',
      excerpt: 'Learn how to design efficient and scalable MongoDB schemas for your applications.',
      content: '<h2>Schema Design Principles</h2><p>MongoDB is a NoSQL database that offers flexible schema design. However, good schema design is crucial for performance and scalability.</p><h3>Key Considerations</h3><ul><li>Embed vs Reference</li><li>Indexing strategy</li><li>Data duplication</li><li>Query patterns</li></ul><p>Understanding when to embed documents and when to use references is fundamental to good MongoDB schema design.</p>',
      author: sarahId,
      published: true,
      views: 890,
      likes: 71,
      tags: ['MongoDB', 'Database', 'Schema Design', 'NoSQL'],
      createdAt: new Date('2024-02-20'),
      updatedAt: new Date('2024-02-20')
    }
  ];

  // Comments
  const comments = [
    {
      _id: new ObjectId(),
      article: article1Id,
      author: readerId,
      content: 'Great article! Very helpful for beginners.',
      createdAt: new Date('2024-02-02'),
      updatedAt: new Date('2024-02-02')
    },
    {
      _id: new ObjectId(),
      article: article1Id,
      author: writerId,
      content: 'Thanks for the comprehensive guide. Looking forward to more tutorials!',
      createdAt: new Date('2024-02-03'),
      updatedAt: new Date('2024-02-03')
    },
    {
      _id: new ObjectId(),
      article: article2Id,
      author: johnId,
      content: 'Socket.io is amazing! Used it in my recent project.',
      createdAt: new Date('2024-02-06'),
      updatedAt: new Date('2024-02-06')
    },
    {
      _id: new ObjectId(),
      article: article3Id,
      author: readerId,
      content: 'Can you provide more examples of permission checks?',
      createdAt: new Date('2024-02-11'),
      updatedAt: new Date('2024-02-11')
    },
    {
      _id: new ObjectId(),
      article: article4Id,
      author: sarahId,
      content: 'Tailwind CSS has changed the way I write CSS. Great combination with Angular!',
      createdAt: new Date('2024-02-16'),
      updatedAt: new Date('2024-02-16')
    }
  ];

  // Notifications
  const notifications = [
    {
      _id: new ObjectId(),
      recipient: adminId,
      type: 'comment',
      title: 'New comment on your article',
      message: 'reader commented on "Getting Started with MEAN Stack Development"',
      article: article1Id,
      articleTitle: 'Getting Started with MEAN Stack Development',
      read: false,
      createdAt: new Date('2024-02-02')
    },
    {
      _id: new ObjectId(),
      recipient: writerId,
      type: 'comment',
      title: 'New comment on your article',
      message: 'john_writer commented on "Real-Time Features with Socket.io"',
      article: article2Id,
      articleTitle: 'Real-Time Features with Socket.io',
      read: true,
      createdAt: new Date('2024-02-06')
    }
  ];

  // Create db_mock_data directory if it doesn't exist
  const mockDataDir = path.join(__dirname, '../db_mock_data');
  if (!fs.existsSync(mockDataDir)) {
    fs.mkdirSync(mockDataDir, { recursive: true });
    console.log('✅ Created db_mock_data directory');
  }

  // Write JSON files
  fs.writeFileSync(
    path.join(mockDataDir, 'users.json'),
    JSON.stringify(users, null, 2)
  );
  console.log('✅ Generated users.json');

  fs.writeFileSync(
    path.join(mockDataDir, 'articles.json'),
    JSON.stringify(articles, null, 2)
  );
  console.log('✅ Generated articles.json');

  fs.writeFileSync(
    path.join(mockDataDir, 'comments.json'),
    JSON.stringify(comments, null, 2)
  );
  console.log('✅ Generated comments.json');

  fs.writeFileSync(
    path.join(mockDataDir, 'notifications.json'),
    JSON.stringify(notifications, null, 2)
  );
  console.log('✅ Generated notifications.json');

  console.log('\n✨ Mock data generation complete!');
  console.log('\n📝 All test users have password: password123\n');
  console.log('To import the data, run: npm run import-data\n');
};

// Run the generator
generateMockData().catch(console.error);
