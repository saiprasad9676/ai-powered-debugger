import React, { useState, useEffect } from 'react';
import CodeEditor from './components/CodeEditor';
import { diffChars } from 'diff';
import './styles.css'; // Import global styles

// Import code templates from the CodeEditor component
import { codeTemplates } from './components/CodeEditor';

const App = () => {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [errors, setErrors] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [language, setLanguage] = useState('python');
  const [isLoading, setIsLoading] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const [apiStatus, setApiStatus] = useState({ ok: true, message: '' });
  const [isSimulation, setIsSimulation] = useState(false);
  const [isExternalApi, setIsExternalApi] = useState(false);
  const [useExternalApi, setUseExternalApi] = useState(false);
  const [originalCode, setOriginalCode] = useState('');
  const [debugResult, setDebugResult] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const languageOptions = [
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'javascript', label: 'JavaScript', icon: '📱' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'cpp', label: 'C++', icon: '⚙️' },
    { value: 'c', label: 'C', icon: '🔧' },
  ];

  useEffect(() => {
    // Reset the fixed status when code changes
    setIsFixed(false);
  }, [code]);

  useEffect(() => {
    // Reset UI state when language changes
    setOutput('');
    setErrors([]);
    setSuggestions([]);
    setIsFixed(false);
    setIsSimulation(false);
    setIsExternalApi(false);
  }, [language]);

  useEffect(() => {
    // Load template code when language changes
    setCode(codeTemplates[language] || "");
  }, [language]);

  const handleRun = async () => {
    setIsLoading(true);
    setApiStatus({ ok: true, message: '' });
    setIsSimulation(false);
    setIsExternalApi(false);
    
    try {
      // Use a consistent API URL that works with any origin
      const API_URL = 'http://127.0.0.1:8000';
      
      const response = await fetch(`${API_URL}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code, 
          language,
          use_external_api: useExternalApi 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      
      const data = await response.json();
      setOutput(data.output || '');
      setErrors(data.errors || []);
      setSuggestions(data.suggestions || []);
      setIsSimulation(data.is_simulation || false);
      setIsExternalApi(data.is_external_api || false);
      setOriginalCode(code);
    } catch (error) {
      console.error('Error running code:', error);
      setApiStatus({
        ok: false, 
        message: `Failed to connect to server. ${error.message}`
      });
      setErrors(['Failed to connect to server. Please check that the backend is running at http://127.0.0.1:8000']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFix = async () => {
    setIsLoading(true);
    setApiStatus({ ok: true, message: '' });
    
    try {
      // Use a consistent API URL that works with any origin
      const API_URL = 'http://127.0.0.1:8000';
      
      const response = await fetch(`${API_URL}/quickfix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code, 
          language,
          use_external_api: useExternalApi
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      
      const data = await response.json();
      setCode(data.fixed_code); // Update the editor with the fixed code
      setIsFixed(true);
      
      // Run the fixed code to show updated output
      handleRun();
    } catch (error) {
      console.error('Error applying quick fix:', error);
      setApiStatus({
        ok: false, 
        message: `Failed to apply quick fix. ${error.message}`
      });
      setErrors(['Failed to connect to server. Please check that the backend is running at http://127.0.0.1:8000']);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDebug = async (codeToDebug) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/debug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: codeToDebug,
          language: language,
        }),
      });

      const data = await response.json();
      setDebugResult(data);
    } catch (error) {
      console.error("Error:", error);
      setDebugResult({
        errors: "Failed to connect to the server. Please make sure the backend is running.",
      });
    }
    setIsLoading(false);
  };

  const handleFixCode = () => {
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };

  const resetCode = () => {
    setCode(codeTemplates[language] || "");
    setDebugResult(null);
  };

  // Since we're going to add auth later, for now we'll just set it to true
  useEffect(() => {
    setIsAuthenticated(true);
  }, []);

  // Get the current language object
  const currentLanguage = languageOptions.find(lang => lang.value === language) || languageOptions[0];

  // Function to apply diff highlighting
  const applyDiff = (original, updated) => {
    const diff = diffChars(original, updated);
    return diff.map((part, index) => (
      <span
        key={index}
        style={{
          color: part.added ? '#4ade80' : part.removed ? '#f87171' : '#d1d5db',
          fontWeight: part.added || part.removed ? 'bold' : 'normal',
          backgroundColor: part.added ? 'rgba(74, 222, 128, 0.1)' : part.removed ? 'rgba(248, 113, 113, 0.1)' : 'transparent',
          padding: part.added || part.removed ? '0 2px' : '0',
          borderRadius: '2px'
        }}
      >
        {part.value}
      </span>
    ));
  };

  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <header>
          <div className="container">
            <h1 className="app-title">AI-Powered Code Debugger</h1>
            <p className="app-subtitle">Sign in to access the code debugger</p>
          </div>
        </header>
        <main className="main-content">
          <div className="container">
            <div className="card login-card">
              <h2>Please sign in to continue</h2>
              <p>You'll be redirected to Google Sign-In</p>
              <button>Sign in with Google</button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header>
        <div className="container">
          <h1 className="app-title">AI-Powered Code Debugger ✨</h1>
          <p className="app-subtitle">
            Debug your code with the help of artificial intelligence
          </p>
        </div>
      </header>

      <main className="main-content">
        <div className="container">
          <div className="card">
            <div className="form-group">
              <label htmlFor="language-select">Select Programming Language:</label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  setDebugResult(null);
                }}
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="c">C</option>
                <option value="c++">C++</option>
              </select>
            </div>

            {showSuccessMessage && (
              <div className="success-message">
                Code Fixed Successfully!
              </div>
            )}

            <CodeEditor
              code={code}
              onChange={setCode}
              language={language}
              onDebug={handleDebug}
              debugResult={debugResult}
              onFix={handleFixCode}
            />

            <div className="button-row">
              <button onClick={resetCode} className="reset-button">
                Reset Code
              </button>
            </div>
          </div>

          {debugResult && debugResult.ai_suggestions && (
            <div className="card suggestions-card">
              <h2>AI Suggestions</h2>
              <div className="suggestions-content">
                <pre>{debugResult.ai_suggestions}</pre>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer>
        <div className="container">
          <p>&copy; {new Date().getFullYear()} AI-Powered Code Debugger</p>
        </div>
      </footer>
    </div>
  );
};

export default App;