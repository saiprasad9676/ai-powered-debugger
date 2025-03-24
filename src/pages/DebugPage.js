import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const languages = [
  { id: 'python', label: 'Python', icon: '🐍' },
  { id: 'javascript', label: 'JavaScript', icon: 'JS' },
  { id: 'java', label: 'Java', icon: '☕' },
  { id: 'cpp', label: 'C++', icon: '⚙️' },
  { id: 'c', label: 'C', icon: '🔧' }
];

const DebugPage = () => {
  const navigate = useNavigate();
  const { currentUser, logOut, saveCodeHistory } = useAuth();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [changes, setChanges] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [debugging, setDebugging] = useState(false);

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const verifyCode = async () => {
    if (!code.trim()) return;
    
    setVerifying(true);
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer AIzaSyDwPU8OSBkuGt9wrSeBVLG8tE0NjkLxeCk`
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Verify this ${language} code and provide a detailed analysis with the following format:
              1. List all syntax errors and potential bugs
              2. Suggest improvements for better code quality
              3. Explain any potential performance issues
              
              Code:
              ${code}`
            }]
          }]
        })
      });

      const data = await response.json();
      const result = data.candidates[0].content.parts[0].text;
      
      // Split the response into sections
      const sections = result.split('\n\n');
      setChanges(sections[0] || 'No issues found.');
      setSuggestions(sections.slice(1).join('\n\n') || 'No suggestions available.');
    } catch (error) {
      console.error('Error verifying code:', error);
      setChanges('Error: Failed to verify code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const debugAndRun = async () => {
    if (!code.trim()) return;
    
    setDebugging(true);
    try {
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer AIzaSyDwPU8OSBkuGt9wrSeBVLG8tE0NjkLxeCk`
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Debug and run this ${language} code. Show the output and explain any errors:
              ${code}`
            }]
          }]
        })
      });

      const data = await response.json();
      const result = data.candidates[0].content.parts[0].text;
      setOutput(result);

      // Save to history
      await saveCodeHistory({
        language,
        originalCode: code,
        output: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error debugging code:', error);
      setOutput('Error: Failed to debug and run code. Please try again.');
    } finally {
      setDebugging(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      {/* Navigation */}
      <nav className="bg-[#2D2D2D] p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">AI Code Debugger</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/history')}
              className="px-4 py-2 bg-[#4F46E5] rounded-lg hover:bg-[#4338CA]"
            >
              History
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Language Selection */}
        <div className="flex justify-center bg-[#2D2D2D] rounded-lg p-2">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                language === lang.id 
                  ? 'bg-[#4F46E5] text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="text-xl">{lang.icon}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>

        {/* Code Editor */}
        <div className="bg-[#2D2D2D] rounded-lg overflow-hidden">
          <div className="px-4 py-2 flex items-center border-b border-gray-600">
            <span className="text-sm text-gray-400">Write or paste your code here</span>
            <div className="ml-auto flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-[300px] bg-[#1E1E1E] p-4 font-mono text-white focus:outline-none"
            placeholder="Enter your code here..."
            spellCheck="false"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={verifyCode}
            disabled={verifying || !code}
            className={`px-6 py-2 rounded-lg ${
              verifying || !code
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-[#2D2D2D] hover:bg-[#3D3D3D]'
            }`}
          >
            {verifying ? 'Verifying...' : 'Verify Code'}
          </button>
          <button
            onClick={debugAndRun}
            disabled={debugging || !code}
            className={`px-6 py-2 rounded-lg ${
              debugging || !code
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-[#4F46E5] hover:bg-[#4338CA]'
            }`}
          >
            {debugging ? 'Running...' : 'Debug & Run'}
          </button>
        </div>

        {/* Output Sections */}
        <div className="grid grid-cols-1 gap-6">
          {/* Output Window */}
          {output && (
            <div className="bg-[#2D2D2D] rounded-lg p-4">
              <h2 className="text-xl font-bold mb-2 flex items-center">
                <span className="mr-2">📤</span> Output
              </h2>
              <pre className="bg-[#1E1E1E] p-4 rounded font-mono overflow-x-auto whitespace-pre-wrap">
                {output}
              </pre>
            </div>
          )}

          {/* Changes Made */}
          {changes && (
            <div className="bg-[#2D2D2D] rounded-lg p-4">
              <h2 className="text-xl font-bold mb-2 flex items-center">
                <span className="mr-2">📝</span> Changes Made
              </h2>
              <pre className="bg-[#1E1E1E] p-4 rounded font-mono overflow-x-auto whitespace-pre-wrap">
                {changes}
              </pre>
            </div>
          )}

          {/* Suggestions */}
          {suggestions && (
            <div className="bg-[#2D2D2D] rounded-lg p-4">
              <h2 className="text-xl font-bold mb-2 flex items-center">
                <span className="mr-2">💡</span> Suggestions
              </h2>
              <pre className="bg-[#1E1E1E] p-4 rounded font-mono overflow-x-auto whitespace-pre-wrap">
                {suggestions}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugPage; 