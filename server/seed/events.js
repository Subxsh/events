const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Event = require('../models/Event');
const User = require('../models/User');

// Load environment variables
dotenv.config({ path: '../../.env' });

const sampleEvents = [
  {
    title: "Tech Conference 2024",
    description: "Join us for the biggest tech conference of the year featuring industry leaders, innovative workshops, and networking opportunities. Learn about the latest trends in AI, blockchain, and web development.",
    date: new Date('2024-03-15'),
    time: "09:00 AM",
    location: "Convention Center, Downtown",
    category: "conference",
    maxAttendees: 500,
    price: 99.99,
    isPaid: true,
    coverImage: "/uploads/default-event-cover.jpg"
  },
  {
    title: "React Workshop for Beginners",
    description: "Learn the fundamentals of React.js in this hands-on workshop. Perfect for developers who want to get started with modern frontend development.",
    date: new Date('2024-02-20'),
    time: "02:00 PM",
    location: "Tech Hub, Silicon Valley",
    category: "workshop",
    maxAttendees: 30,
    price: 49.99,
    isPaid: true,
    coverImage: "/uploads/default-event-cover.jpg"
  },
  {
    title: "Startup Networking Mixer",
    description: "Connect with fellow entrepreneurs, investors, and startup enthusiasts. Great opportunity to share ideas, find co-founders, and build your network.",
    date: new Date('2024-02-28'),
    time: "06:00 PM",
    location: "Rooftop Lounge, Business District",
    category: "networking",
    maxAttendees: 100,
    price: 0,
    isPaid: false,
    coverImage: "/uploads/default-event-cover.jpg"
  },
  {
    title: "Digital Marketing Seminar",
    description: "Discover the latest digital marketing strategies and tools. Learn about SEO, social media marketing, content creation, and analytics.",
    date: new Date('2024-03-05'),
    time: "10:00 AM",
    location: "Marketing Institute, City Center",
    category: "seminar",
    maxAttendees: 75,
    price: 29.99,
    isPaid: true,
    coverImage: "/uploads/default-event-cover.jpg"
  },
  {
    title: "Community Volunteer Day",
    description: "Join Sowmiya Events in giving back to the community. We'll be organizing various volunteer activities including park cleanup and food distribution.",
    date: new Date('2024-02-25'),
    time: "08:00 AM",
    location: "Community Park, Riverside",
    category: "social",
    maxAttendees: 200,
    price: 0,
    isPaid: false,
    coverImage: "/uploads/default-event-cover.jpg"
  },
  {
    title: "Photography Workshop",
    description: "Learn professional photography techniques from award-winning photographers. Covers both digital and film photography basics.",
    date: new Date('2024-03-10'),
    time: "11:00 AM",
    location: "Art Studio, Creative Quarter",
    category: "workshop",
    maxAttendees: 25,
    price: 75.00,
    isPaid: true,
    coverImage: "/uploads/default-event-cover.jpg"
  }
];

async function seedEvents() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sowmiya-events');
    console.log('Connected to MongoDB');

    // Find or create admin user
    let adminUser = await User.findOne({ email: 'admin@sowmiyaevents.com' });
    
    if (!adminUser) {
      adminUser = new User({
        name: 'Sowmiya Admin',
        email: 'admin@sowmiyaevents.com',
        password: 'admin123',
        role: 'admin'
      });
      await adminUser.save();
      console.log('Admin user created');
    }

    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');

    // Add organizer to each event
    const eventsWithOrganizer = sampleEvents.map(event => ({
      ...event,
      organizer: adminUser._id
    }));

    // Insert sample events
    await Event.insertMany(eventsWithOrganizer);
    console.log(`${sampleEvents.length} sample events created successfully`);

    console.log('\nSample events seeded successfully!');
    console.log('Admin credentials:');
    console.log('Email: admin@sowmiyaevents.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
}

seedEvents();