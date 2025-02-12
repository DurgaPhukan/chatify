const mongoose = require('mongoose');
require('dotenv').config();
const { Schema } = mongoose;

// MongoDB Atlas connection string
const mongoURI = process.env.MONGO_URI;
console.log('\n\n\n===========>', process.env.PORT, mongoURI);
// Define User Schema
const userSchema = new Schema({
  id: Schema.Types.ObjectId,
  name: String,
  email: String,
});

const User = mongoose.model('User', userSchema);

// Define Broadcast Schema
const broadcastSchema = new Schema({
  id: Schema.Types.ObjectId,
  title: { type: String, required: true }, // Added title field
  description: { type: String, required: true }, // Added description field
  startTime: Date,
  endTime: Date,
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  visibility: { type: String, enum: ['private', 'public'] },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User' },
});

const Broadcast = mongoose.model('Broadcast', broadcastSchema);

// Define Invitation Schema
const invitationSchema = new Schema(
  {
    id: Schema.Types.ObjectId,
    invitationType: {
      type: String,
      enum: ['sent_by_creator', 'requested_by_user'],
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    broadcastId: { type: Schema.Types.ObjectId, ref: 'Broadcast' },
    joineeId: { type: Schema.Types.ObjectId, ref: 'User' },
    creatorId: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

const Invitation = mongoose.model('Invitation', invitationSchema);

// Define Chat Schema
const chatSchema = new Schema(
  {
    id: Schema.Types.ObjectId,
    message: String,
    creatorId: { type: Schema.Types.ObjectId, ref: 'User' },
    replyId: { type: Schema.Types.ObjectId, ref: 'Chat', default: null },
    mentionId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true },
);

const Chat = mongoose.model('Chat', chatSchema);

// Define Notification Schema
const notificationSchema = new Schema(
  {
    id: Schema.Types.ObjectId,
    type: {
      type: String,
      enum: ['broadcast', 'invitation', 'chat', 'general'],
      required: true,
    },
    message: { type: String, required: true },
    referenceId: {
      type: Schema.Types.ObjectId,
      refPath: 'type',
      default: null,
    },
    isRead: { type: Boolean, default: false },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

const Notification = mongoose.model('Notification', notificationSchema);

async function seedDatabase() {
  try {
    await mongoose.connect(mongoURI);

    console.log('Connected to MongoDB Atlas.');

    // Clear existing data
    await User.deleteMany({});
    await Broadcast.deleteMany({});
    await Invitation.deleteMany({});
    await Chat.deleteMany({});
    await Notification.deleteMany({});

    console.log('Existing data cleared.');

    // Create sample users
    const users = await User.insertMany([
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
      { name: 'Charlie', email: 'charlie@example.com' },
    ]);

    console.log('Users created.');

    // Create sample broadcasts with title and description
    const broadcasts = await Broadcast.insertMany([
      {
        title: 'Morning Yoga Session',
        description: 'A peaceful yoga session to start your day.',
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + 3600000), // +1 hour
        members: [users[0]._id, users[1]._id],
        visibility: 'public',
        creatorId: users[0]._id,
      },
      {
        title: 'Tech Talk: AI Innovations',
        description: 'A discussion on the latest advancements in AI.',
        startTime: new Date(),
        endTime: new Date(new Date().getTime() + 7200000), // +2 hours
        members: [users[1]._id, users[2]._id],
        visibility: 'private',
        creatorId: users[1]._id,
      },
    ]);

    console.log('Broadcasts created.');

    // Create sample invitations
    const invitations = await Invitation.insertMany([
      {
        invitationType: 'sent_by_creator',
        status: 'pending',
        broadcastId: broadcasts[0]._id,
        joineeId: users[1]._id,
        creatorId: users[0]._id,
      },
      {
        invitationType: 'requested_by_user',
        status: 'accepted',
        broadcastId: broadcasts[1]._id,
        joineeId: users[2]._id,
        creatorId: users[1]._id,
      },
    ]);

    console.log('Invitations created.');

    // Create sample chats
    const chats = await Chat.insertMany([
      {
        message: 'Hello everyone!',
        creatorId: users[0]._id,
      },
      {
        message: 'Hi Alice!',
        creatorId: users[1]._id,
        replyId: null,
        mentionId: users[0]._id,
      },
      {
        message: 'Great to see you all!',
        creatorId: users[2]._id,
        replyId: null,
        mentionId: null,
      },
    ]);

    console.log('Chats created.');

    // Create sample notifications
    const notifications = await Notification.insertMany([
      {
        type: 'broadcast',
        message: `Broadcast "${broadcasts[0].title}" starts soon.`,
        referenceId: broadcasts[0]._id,
        recipientId: users[1]._id,
        senderId: users[0]._id,
      },
      {
        type: 'invitation',
        message: 'Your invitation to join the broadcast was accepted.',
        referenceId: invitations[1]._id,
        recipientId: users[1]._id,
        senderId: users[2]._id,
      },
      {
        type: 'chat',
        message: 'Alice mentioned you in a message.',
        referenceId: chats[1]._id,
        recipientId: users[0]._id,
        senderId: users[1]._id,
      },
      {
        type: 'general',
        message: 'System maintenance is scheduled for tomorrow.',
        recipientId: users[2]._id,
        senderId: users[0]._id,
      },
    ]);

    console.log('Notifications created.');

    console.log('Database seeding completed.');
    mongoose.disconnect();
  } catch (err) {
    console.error('Error seeding database:', err);
  }
}

seedDatabase();
