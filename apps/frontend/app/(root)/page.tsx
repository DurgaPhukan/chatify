export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <header className="bg-white shadow-md w-full py-4 px-8">
        <div className="w-full flex justify-between items-center ">
          <h1 className="text-2xl font-bold text-pink-600">Chatify</h1>
          <nav className="">
            <ul className="flex space-x-4">
              <li><a href="/broadcasts" className="text-gray-700 hover:text-blue-600">Broadcasts</a></li>
              <li><a href="#about" className="text-gray-700 hover:text-blue-600">About</a></li>
              <li><a href="#contact" className="text-gray-700 hover:text-blue-600">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto flex flex-col items-center text-center py-16">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Chatify</h2>
        <p className="text-gray-600 mb-8 max-w-2xl">
          Connect, communicate, and collaborate effortlessly. Experience seamless real-time messaging tailored just for you.
        </p>
        <div className="space-x-4">
          <button className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700">
            Get Started
          </button>
          <button className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg shadow-md hover:bg-gray-300">
            Learn More
          </button>
        </div>
      </main>

      <footer className="bg-gray-800 w-full py-4 text-center text-white">
        <p>&copy; {new Date().getFullYear()} Chatify. All rights reserved.</p>
      </footer>
    </div>
  );
}
