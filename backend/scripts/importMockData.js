const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Article = require('../models/Article');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');

// Model mapping
const modelMap = {
  users: User,
  articles: Article,
  comments: Comment,
  notifications: Notification
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/blog-platform';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Import data from JSON files
const importData = async () => {
  try {
    const mockDataDir = path.join(__dirname, '../db_mock_data');
    
    // Check if directory exists
    if (!fs.existsSync(mockDataDir)) {
      console.error(`❌ Directory not found: ${mockDataDir}`);
      console.log('💡 Please create the db_mock_data folder and add JSON files');
      process.exit(1);
    }

    // Get all JSON files
    const files = fs.readdirSync(mockDataDir).filter(file => file.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('⚠️  No JSON files found in db_mock_data folder');
      process.exit(1);
    }

    console.log(`\n📂 Found ${files.length} collection(s) to import\n`);

    // Import each collection
    for (const file of files) {
      const collectionName = path.basename(file, '.json');
      const Model = modelMap[collectionName];

      if (!Model) {
        console.log(`⚠️  Skipping ${file} - no model found for '${collectionName}'`);
        continue;
      }

      const filePath = path.join(mockDataDir, file);
      const jsonData = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(jsonData);

      if (!Array.isArray(data) || data.length === 0) {
        console.log(`⚠️  ${file} is empty or not an array`);
        continue;
      }

      // Clear existing data
      await Model.deleteMany({});
      console.log(`🗑️  Cleared existing ${collectionName}`);

      // Insert new data
      await Model.insertMany(data);
      console.log(`✅ Imported ${data.length} document(s) into ${collectionName}`);
    }

    console.log('\n✨ All data imported successfully!\n');
  } catch (error) {
    console.error('❌ Error importing data:', error.message);
    process.exit(1);
  }
};

// Delete all data
const deleteData = async () => {
  try {
    console.log('\n🗑️  Deleting all data...\n');
    
    await User.deleteMany({});
    console.log('✅ Users deleted');
    
    await Article.deleteMany({});
    console.log('✅ Articles deleted');
    
    await Comment.deleteMany({});
    console.log('✅ Comments deleted');
    
    await Notification.deleteMany({});
    console.log('✅ Notifications deleted');
    
    console.log('\n✨ All data deleted successfully!\n');
  } catch (error) {
    console.error('❌ Error deleting data:', error.message);
    process.exit(1);
  }
};

// Main execution
const main = async () => {
  await connectDB();

  // Check command line arguments
  const args = process.argv.slice(2);
  
  if (args.includes('--delete') || args.includes('-d')) {
    await deleteData();
  } else {
    await importData();
  }

  // Close connection
  await mongoose.connection.close();
  console.log('👋 Database connection closed');
  process.exit(0);
};

// Run the script
main();
