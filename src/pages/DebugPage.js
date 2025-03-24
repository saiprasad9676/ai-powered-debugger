import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const languages = [
  { id: 'python', label: 'Python', icon: '🐍' },
  { id: 'javascript', label: 'JavaScript', icon: 'JS' },
  { id: 'java', label: 'Java', icon: '☕' },
  { id: 'cpp', label: 'C++', icon: '⚙️' },
  { id: 'c', label: 'C', icon: '🔧' }
];

const DebugPage = () => {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [output, setOutput] = useState('');
  const [changes, setChanges] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { currentUser, saveCodeHistory } = useAuth();

  const verifyCode = async () => {
    try {
      setVerifying(true);
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyDwPU8OSBkuGt9wrSeBVLG8tE0NjkLxeCk'}`
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Verify this ${language} code and list all errors and potential fixes:\n${code}`
            }]
          }]
        })
      });

      const data = await response.json();
      const result = data.candidates[0].content.parts[0].text;
      
      // Parse the response to separate changes and suggestions
      const [changesSection, suggestionsSection] = result.split('Suggestions:');
      setChanges(changesSection.trim());
      setSuggestions(suggestionsSection ? suggestionsSection.trim() : '');
    } catch (error) {
      console.error('Error verifying code:', error);
      setChanges('Error: Failed to verify code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleDebugAndRun = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyDwPU8OSBkuGt9wrSeBVLG8tE0NjkLxeCk'}`
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Debug and run this ${language} code, show the output:\n${code}`
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
        fixedCode: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error debugging code:', error);
      setOutput('Error: Failed to debug and run code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Language Selection */}
        <div className="flex justify-center mb-4 bg-[#2D2D2D] rounded-lg p-2">
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
        <div className="bg-[#1E1E1E] rounded-lg overflow-hidden border border-gray-700">
          <div className="bg-[#2D2D2D] px-4 py-2 flex items-center">
            <span className="text-sm text-gray-400">Enter your code here</span>
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
            placeholder="Paste your code here..."
            spellCheck="false"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={verifyCode}
            disabled={verifying || !code}
            className={`bg-[#2D2D2D] text-white px-6 py-2 rounded-lg hover:bg-[#3D3D3D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F46E5] ${
              verifying || !code ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {verifying ? 'Verifying...' : 'Verify Code'}
          </button>
          <button
            onClick={handleDebugAndRun}
            disabled={loading || !code}
            className={`bg-[#4F46E5] text-white px-6 py-2 rounded-lg hover:bg-[#4338CA] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4F46E5] ${
              loading || !code ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Running...' : 'Debug & Run'}
          </button>
        </div>

        {/* Output Window */}
        {output && (
          <div className="bg-[#2D2D2D] rounded-lg p-4">
            <h2 className="text-xl font-bold mb-2 flex items-center">
              <span className="mr-2">📤</span> Output
            </h2>
            <pre className="bg-[#1E1E1E] p-4 rounded font-mono overflow-x-auto">
              {output}
            </pre>
          </div>
        )}

        {/* Changes Made Window */}
        {changes && (
          <div className="bg-[#2D2D2D] rounded-lg p-4">
            <h2 className="text-xl font-bold mb-2 flex items-center">
              <span className="mr-2">📝</span> Changes Made
            </h2>
            <pre className="bg-[#1E1E1E] p-4 rounded font-mono overflow-x-auto">
              {changes}
            </pre>
          </div>
        )}

        {/* Suggestions Window */}
        {suggestions && (
          <div className="bg-[#2D2D2D] rounded-lg p-4">
            <h2 className="text-xl font-bold mb-2 flex items-center">
              <span className="mr-2">💡</span> Suggestions
            </h2>
            <pre className="bg-[#1E1E1E] p-4 rounded font-mono overflow-x-auto">
              {suggestions}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default DebugPage; 