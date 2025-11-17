import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User';
import Agency from '../models/Agency';
import bcrypt from 'bcryptjs';

dotenv.config();

const createMockAgency = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/balkan-estate');
    console.log('✓ Connected to MongoDB');

    const email = 'zano@zano.com';
    const password = 'password123';

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Create user
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await User.create({
        email,
        password: hashedPassword,
        name: 'Zano Admin',
        phone: '+355123456789',
        role: 'agent',
        provider: 'local',
        isEmailVerified: true,
        licenseVerified: true,
        licenseNumber: 'AGT-001-2024',
        agentId: 'ZANO001',
        city: 'Tirana',
        country: 'Albania',
      });
      console.log('✓ User created:', email);
    } else {
      console.log('✓ User already exists:', email);
    }

    // Check if agency exists for this user
    let agency = await Agency.findOne({ ownerId: user._id });

    if (!agency) {
      // Generate slug and invitation code
      const agencyName = 'Zano Real Estate';
      const country = 'Albania';
      const slug = `${country.toLowerCase()},${agencyName.toLowerCase().replace(/\s+/g, '-')}`;
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const nameCode = agencyName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase();
      const invitationCode = `AGY-${nameCode}-${randomCode}`;

      // Create agency
      agency = await Agency.create({
        name: agencyName,
        slug: slug,
        invitationCode: invitationCode,
        ownerId: user._id,
        description: 'Premium real estate agency specializing in luxury properties across Albania and the Balkans.',
        email: 'agency@zano.com',
        phone: '+355123456789',
        address: 'Blloku Area, Rruga Ibrahim Rugova',
        city: 'Tirana',
        country: country,
        zipCode: '1001',
        website: 'https://zanorealestate.com',
        totalProperties: 0,
        totalAgents: 1,
        isFeatured: true,
        yearsInBusiness: 15,
        specialties: ['Luxury Homes', 'Commercial Properties', 'Investment Properties'],
        certifications: ['Licensed Real Estate Broker', 'Property Management Certified'],
        agents: [user._id],
      });

      // Update user with agency info
      user.agencyId = agency._id as any;
      user.agencyName = agency.name;
      await user.save();

      console.log('✓ Agency created:', agency.name);
      console.log('✓ Invitation Code:', agency.invitationCode);
    } else {
      console.log('✓ Agency already exists:', agency.name);
      console.log('✓ Invitation Code:', agency.invitationCode);
    }

    console.log('\n=== Mock Agency Created Successfully ===');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Agency:', agency.name);
    console.log('Invitation Code:', agency.invitationCode);
    console.log('=====================================\n');

    process.exit(0);
  } catch (error) {
    console.error('Error creating mock agency:', error);
    process.exit(1);
  }
};

createMockAgency();
