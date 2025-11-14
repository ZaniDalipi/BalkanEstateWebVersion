import mongoose from 'mongoose';

export const initializeDatabase = async (): Promise<void> => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      console.warn('⚠️  Database not connected yet, skipping index initialization');
      return;
    }

    const usersCollection = db.collection('users');

    // Check if the old problematic index exists
    const indexes = await usersCollection.indexes();
    const oldIndex = indexes.find(
      (idx) => idx.name === 'provider_1_providerId_1' && !idx.partialFilterExpression
    );

    if (oldIndex) {
      console.log('🔧 Fixing User index for multiple local users...');

      try {
        // Drop the old index
        await usersCollection.dropIndex('provider_1_providerId_1');
        console.log('  ✅ Dropped old provider_providerId index');

        // The new index will be created automatically by Mongoose
        console.log('  ✅ New partial index will be created by Mongoose');
      } catch (error: any) {
        if (error.code === 27) {
          console.log('  ℹ️  Index already dropped');
        } else {
          console.error('  ❌ Error dropping index:', error.message);
        }
      }
    } else {
      console.log('✅ User indexes are up to date');
    }
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    // Don't throw - let the app continue even if index fix fails
  }
};
