import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import '../styles/DebugPage.css';

const languages = [
  { id: 'python', label: 'Python', icon: '🐍' },
  { id: 'javascript', label: 'JavaScript', icon: 'JS' },
  { id: 'java', label: 'Java', icon: '☕' },
  { id: 'cpp', label: 'C++', icon: 'C++' },
  { id: 'csharp', label: 'C#', icon: 'C#' }
];

const DebugPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [output, setOutput] = useState('');
  const [changes, setChanges] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_BASE_URL || 'https://ai-debugger-backend.onrender.com';

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);

  const handleCodeChange = (e) => {
    setCode(e.target.value);
  };

  const handleLanguageChange = (selectedLanguage) => {
    setLanguage(selectedLanguage);
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setError('Please enter code to verify');
      return;
    }

    setLoading(true);
    setError('');
    setChanges('');
    setSuggestions('');
    setOutput('');

    try {
      console.log('Sending verification request to:', `${API_URL}/api/verify`);
      const response = await axios.post(`${API_URL}/api/verify`, {
        code,
        language,
        userId: currentUser.email
      });

      console.log('Verification response:', response.data);
      setChanges(response.data.changes || 'No issues found in your code.');
      setSuggestions(response.data.suggestions || 'No suggestions available.');
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify code. Please try again. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDebugRun = async () => {
    if (!code.trim()) {
      setError('Please enter code to debug and run');
      return;
    }

    setLoading(true);
    setError('');
    setChanges('');
    setSuggestions('');
    setOutput('');

    try {
      console.log('Sending debug request to:', `${API_URL}/api/debug`);
      const response = await axios.post(`${API_URL}/api/debug`, {
        code,
        language,
        userId: currentUser.email
      });

      console.log('Debug response:', response.data);
      setOutput(response.data.output || 'No output generated.');
      setChanges(response.data.changes || 'No issues found in your code.');
      setSuggestions(response.data.suggestions || 'No suggestions available.');
      
      // Save to history
      await axios.post(`${API_URL}/api/history`, {
        userId: currentUser.email,
        code,
        language,
        output: response.data.output,
        changes: response.data.changes,
        suggestions: response.data.suggestions,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      console.error('Debug error:', err);
      setError('Failed to debug and run code. Please try again. ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const goToHistory = () => {
    navigate('/history');
  };

  const handleLogout = () => {
    navigate('/');
  };

  // Custom renderer for code blocks in markdown
  const components = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      
      return !inline && match ? (
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={match[1]}
          showLineNumbers={true}
          wrapLines={true}
          {...props}
        >
          {codeString}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  // Pre-process code to display with syntax highlighting in the editor
  const renderCodeWithSyntaxHighlighting = () => {
    return (
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        showLineNumbers={true}
        customStyle={{
          margin: 0,
          padding: '10px',
          height: '100%',
          boxSizing: 'border-box',
          backgroundColor: 'transparent',
          fontSize: '14px',
          fontFamily: 'monospace'
        }}
      >
        {code || ''}
      </SyntaxHighlighter>
    );
  };

  return (
    <div className="debug-container">
      <header className="debug-header">
        <h1>AI Code Debugger</h1>
        <div className="header-buttons">
          <button className="history-btn" onClick={goToHistory}>History</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="language-selector">
        {languages.map((lang) => (
          <button 
            key={lang.id}
            className={`lang-btn ${language === lang.id ? 'active' : ''}`} 
            onClick={() => handleLanguageChange(lang.id)}
          >
            <span className="lang-icon">{lang.icon}</span> {lang.label}
          </button>
        ))}
      </div>

      <div className="code-editor">
        <div className="editor-header">
          <span>Write or paste your code here</span>
          <div className="editor-buttons">
            <span className="editor-dot red"></span>
            <span className="editor-dot yellow"></span>
            <span className="editor-dot green"></span>
          </div>
        </div>
        <div className="editor-container">
          <textarea 
            value={code} 
            onChange={handleCodeChange} 
            placeholder="Write or paste your code here"
            spellCheck="false"
            className="code-textarea"
          ></textarea>
          <div className="syntax-highlighter-overlay">
            {renderCodeWithSyntaxHighlighting()}
          </div>
        </div>
      </div>

      <div className="action-buttons">
        <button 
          className="verify-btn" 
          onClick={handleVerifyCode}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Verify Code'}
        </button>
        <button 
          className="debug-btn" 
          onClick={handleDebugRun}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Debug & Run'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="output-container">
        <div className="output-section">
          <h3>📝 Changes Made</h3>
          <div className="markdown-content">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]}
              components={components}
            >
              {changes}
            </ReactMarkdown>
          </div>
        </div>
        
        <div className="output-section">
          <h3>💡 Suggestions</h3>
          <div className="markdown-content">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]}
              components={components}
            >
              {suggestions}
            </ReactMarkdown>
          </div>
        </div>
        
        <div className="output-section">
          <h3>🚀 Output</h3>
          <div className="markdown-content">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]}
              components={components}
            >
              {output}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPage; 