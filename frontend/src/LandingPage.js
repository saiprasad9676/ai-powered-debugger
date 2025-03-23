import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-600">
            AI-Powered Code Debugger
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Debug, enhance, and learn from your code with AI-powered analysis and suggestions
          </p>
          
          <div className="flex justify-center space-x-4 mb-16">
            <Link 
              to="/app" 
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              Launch Debugger
            </Link>
            <a 
              href="#features" 
              className="px-8 py-4 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
            >
              Learn More
            </a>
          </div>
          
          <div className="relative">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute top-32 left-64 w-32 h-32 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            
            <div className="relative bg-gray-800 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
              <div className="bg-gray-900 px-4 py-2 border-b border-gray-700 flex items-center">
                <div className="flex space-x-2 mr-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-gray-400 text-sm font-mono px-3 py-1 bg-gray-800 rounded-md">
                  AI-Powered Code Debugger
                </div>
              </div>
              <div className="p-4 bg-gray-900 text-gray-300 font-mono text-sm">
                <div className="text-green-400 mb-2">// Fixed code with AI assistance</div>
                <div className="mb-2 text-blue-300">function calculateSum(numbers) {'{'}</div>
                <div className="mb-2 ml-4">  return numbers.reduce((sum, num) {'=>'} sum + num, 0);</div>
                <div className="mb-2">{'}'}</div>
                <div className="mb-2 text-orange-300">console.log(calculateSum([1, 2, 3, 4, 5]));</div>
                <div className="mb-2 text-gray-500">// Output: 15</div>
              </div>
            </div>
          </div>
        </div>
        
        <div id="features" className="py-20">
          <h2 className="text-3xl font-bold text-center mb-16">Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="text-indigo-400 text-4xl mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Multiple Languages</h3>
              <p className="text-gray-400">
                Support for Python, JavaScript, Java, C, and C++ with language-specific syntax highlighting and error detection.
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="text-indigo-400 text-4xl mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">AI-Powered Suggestions</h3>
              <p className="text-gray-400">
                Get intelligent suggestions on how to fix errors and improve your code using advanced AI models.
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="text-indigo-400 text-4xl mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Quick Fix</h3>
              <p className="text-gray-400">
                One-click automatic fixes for common errors and code improvements, with visual diff to see what changed.
              </p>
            </div>
          </div>
        </div>
        
        <div className="py-12 text-center">
          <div className="inline-block bg-gray-800 px-6 py-4 rounded-lg border border-gray-700 mb-8">
            <h2 className="text-2xl font-bold mb-2">Ready to debug your code?</h2>
            <p className="text-gray-400 mb-4">Try our AI-powered code debugger now</p>
            <Link 
              to="/app" 
              className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
      
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400 mb-2">© 2023 AI-Powered Code Debugger</p>
          <p className="text-gray-500 text-sm">
            Designed and developed by <span className="text-indigo-400 font-medium">Momento</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 