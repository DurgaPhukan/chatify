import React from 'react';

const ContactPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-6">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4 text-center">About Me</h1>
        <p className="text-gray-600 text-lg text-center mb-6">
          Hi, I'm Durga Phukan, a passionate software developer with a vision to make a positive impact through technology.
          Feel free to explore my portfolio or connect with me on LinkedIn. You can also reach out via email by clicking below.
        </p>

        <div className="flex items-center gap-4 justify-center">
          <a
            href="https://durgaphukan.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg shadow-md hover:bg-green-700 focus:ring-4 focus:ring-green-300 focus:outline-none"
          >
            Portfolio
          </a>
          <a
            href="https://www.linkedin.com/in/durga-phukan-1b125a1a1/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg shadow-md hover:bg-blue-600 focus:ring-4 focus:ring-blue-300 focus:outline-none"
          >
            LinkedIn
          </a>
          <a
            href="mailto:durgaphukan99@gmail.com"
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-pink-700 focus:ring-4 focus:ring-blue-300 focus:outline-none"
          >
            Send Email
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;