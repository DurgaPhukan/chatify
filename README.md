# Chatify

Chatify is a modern real-time chat application designed to provide seamless communication and an exceptional user experience. The application comes with features like multi-people chat rooms, broadcast channel creation, and real-time messaging. It uses cutting-edge technologies such as WebSocket, MongoDB, NestJS, and Next.js to deliver optimal performance and scalability.

---

## Features

### Key Functionalities
- **Real-Time Communication**: Instant messaging powered by WebSocket for a seamless experience.
- **Broadcast Channels**: Users can create broadcast channels, invite participants, and manage access.
- **Multi-People Chat Rooms**: Allows multiple users to communicate simultaneously.
- **Chat History**: Persistent chat history to revisit past conversations.
- **Custom Authentication**: Secure and efficient authentication system.
- **Youthful UI**: Modern, smooth, and visually appealing interface.

### Technical Advantages
- **Next.js & Tailwind**: Combines server-side rendering and modern UI design for better performance and SEO.
- **NestJS Backend**: Ensures better type safety, structured code, and high performance.
- **MongoDB**: Scalable database for efficient data management.
- **WebSocket Communication**: Real-time interactions for improved user engagement.
- **Future-Proof Design**: Schema and architecture designed for scalability and future enhancements.

---

## Installation

Follow these steps to set up and run Chatify locally:

### Prerequisites
- **Node.js**: Ensure you have Node.js installed.
- **MongoDB Atlas**: Setup a MongoDB Atlas account or use a local MongoDB instance.

### Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd chatify
   ```

2. Install dependencies in the main folder:
   ```bash
   npm install
   ```

3. Navigate to `/app/frontend` and install dependencies:
   ```bash
   cd app/frontend
   npm install
   ```

4. Navigate to `/app/backend` and install dependencies:
   ```bash
   cd app/backend
   npm install
   ```

---

## Running the Application

### Frontend
1. Add a `.env` file in `/app/frontend` with the following content:
   ```env
   NEXT_PUBLIC_BACK_END_URL=http://localhost:4000
   ```
2. Start the frontend development server:
   ```bash
   npm run dev
   ```

### Backend
1. Add a `.env` file in `/app/backend` with the following content:
   ```env
   PORT=4000
   MONGO_URI="mongodb+srv://username:password@cluster0.nb87q.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
   JWT_SECRET="secret"
   FRONTEND_URL=http://localhost:3000
   ```
2. Start the backend server:
   ```bash
   npm start
   ```

---

## Advantages

- **Seamless Real-Time Communication**: Uses WebSocket for real-time interactions, ensuring a smooth user experience.
- **Scalability**: Designed with scalability in mind, perfect for handling a large user base.
- **Modern UI**: Built with Tailwind and Next.js, providing a visually stunning and responsive interface.
- **Secure Authentication**: Robust custom authentication system with JWT for secure user sessions.
- **Future-Ready**: Flexible schema design and modular code structure for easy expansion.

---

## Technologies Used

- **Frontend**: Next.js, Tailwind CSS
- **Backend**: NestJS, WebSocket, MongoDB
- **Database**: MongoDB Atlas
- **Authentication**: JWT (JSON Web Tokens)

---

## Contributing
We welcome contributions to improve Chatify! Feel free to submit issues, feature requests, or pull requests.

---

## License
This project is licensed under the MIT License.

---

## Contact
For any questions or suggestions, please contact us at [your-email@example.com].
