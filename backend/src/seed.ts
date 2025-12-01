import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User';
import { Video } from './models/Video';
import { Reward } from './models/Reward';

dotenv.config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/faceverify';

const seedDatabase = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB for seeding');

    // Create admin user
    const adminEmail = 'admin@faceverify.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        fullName: 'Admin User',
        email: adminEmail,
        password: adminPassword,
        role: 'ADMIN',
        faceDescriptor: Array(128).fill(0), // Dummy descriptor
        points: 0,
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Local Videos
    const videos = [
      {
        title: 'Spider Video',
        description: 'A test video about spiders.',
        url: '/videos/spider.mp4', // Local URL relative to frontend public folder
        thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800', // Placeholder thumbnail
        duration: 60, // Estimated, will be updated by frontend if needed, but good for DB
        points: 1, // RF: 1 point per video
        active: true,
      },
      {
        title: 'WisBTC Video',
        description: 'A test video about WisBTC.',
        url: '/videos/wisbtc.mp4', // Local URL relative to frontend public folder
        thumbnail: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800', // Placeholder thumbnail
        duration: 60,
        points: 1, // RF: 1 point per video
        active: true,
      },
    ];

    for (const video of videos) {
      const exists = await Video.findOne({ title: video.title });
      if (!exists) {
        await Video.create(video);
        console.log(`✅ Video created: ${video.title}`);
      }
    }

    // Sample Rewards
    const rewards = [
      {
        name: 'Premium Subscription - 1 Month',
        description: 'Access to premium content.',
        imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800',
        cost: 500,
        active: true,
      },
      {
        name: '$10 Gift Card',
        description: 'Redeem for a $10 gift card.',
        imageUrl: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800',
        cost: 1000,
        active: true,
      },
      {
        name: 'Coffee Voucher',
        description: 'Enjoy a free coffee.',
        imageUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800',
        cost: 200,
        active: true,
      },
    ];

    for (const reward of rewards) {
      const exists = await Reward.findOne({ name: reward.name });
      if (!exists) {
        await Reward.create(reward);
        console.log(`✅ Reward created: ${reward.name}`);
      }
    }

    console.log('🎉 Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
