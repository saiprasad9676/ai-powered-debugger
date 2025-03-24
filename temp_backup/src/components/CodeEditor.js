import React, { useState, useEffect, useRef } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material-darker.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/mode/python/python';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/clike/clike';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/selection/active-line';
import { diffChars } from 'diff';

// Sample code templates for different languages
export const codeTemplates = {
  python: '# Python code example\ndef hello_world():\n    print("Hello, World!")\n\nhello_world()',
  javascript: '// JavaScript code example\nfunction helloWorld() {\n    console.log("Hello, World!");\n}\n\nhelloWorld();',
  java: '// Java code example\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, World!");\n    }\n}',
  cpp: '// C++ code example\n#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}',
  c: '// C code example\n#include <stdio.h>\n\nint main() {\n    printf("Hello, World!\\n");\n    return 0;\n}'
};

const CodeEditor = ({ code, setCode, handleRun, handleQuickFix, language, isLoading }) => {
  const editorRef = useRef(null);
  const [originalCode, setOriginalCode] = useState('');
  
  // Clean up leading blank lines
  useEffect(() => {
    if (code && code.startsWith('\n')) {
      const cleanedCode = code.replace(/^\n+/, '');
      if (cleanedCode !== code) {
        setCode(cleanedCode);
      }
    }
  }, [code, setCode]);
  
  // Force load template when component mounts if code is empty
  useEffect(() => {
    if (!code || code.trim() === '') {
      const template = codeTemplates[language] || '';
      setCode(template);
      setOriginalCode(template);
    }
  }, []);
  
  // Set a template when language changes
  useEffect(() => {
    const template = codeTemplates[language] || '';
    setCode(template);
    setOriginalCode(template);
    
    // Focus and refresh editor after template is set
    if (editorRef.current) {
      setTimeout(() => {
        editorRef.current.refresh();
        editorRef.current.focus();
      }, 50);
    }
  }, [language]);

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
  
  // Map language to CodeMirror mode
  const getMode = () => {
    switch(language) {
      case 'javascript':
        return 'javascript';
      case 'python':
        return 'python';
      case 'java':
      case 'cpp':
      case 'c':
        return 'text/x-c++src';
      default:
        return 'python';
    }
  };

  // Get language icon
  const getLanguageIcon = () => {
    switch(language) {
      case 'python':
        return (
          <svg viewBox="0 0 128 128" width="20" height="20">
            <linearGradient id="python-original-a" gradientUnits="userSpaceOnUse" x1="70.252" y1="1237.476" x2="170.659" y2="1151.089" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)"><stop offset="0" stopColor="#5A9FD4"/><stop offset="1" stopColor="#306998"/></linearGradient><linearGradient id="python-original-b" gradientUnits="userSpaceOnUse" x1="209.474" y1="1098.811" x2="173.62" y2="1149.537" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)"><stop offset="0" stopColor="#FFD43B"/><stop offset="1" stopColor="#FFE873"/></linearGradient><path fill="url(#python-original-a)" d="M63.391 1.988c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H29.977c-7.176 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V67.234c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.866-1.008zM50.037 9.557c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z" transform="translate(0 10.26)"/><path fill="url(#python-original-b)" d="M91.682 28.38v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.549v23.515c0 6.691 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 87.927c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z" transform="translate(0 10.26)"/>
          </svg>
        );
      case 'javascript':
        return (
          <svg viewBox="0 0 128 128" width="20" height="20">
            <path fill="#F0DB4F" d="M1.408 1.408h125.184v125.185H1.408z"/><path fill="#323330" d="M116.347 96.736c-.917-5.711-4.641-10.508-15.672-14.981-3.832-1.761-8.104-3.022-9.377-5.926-.452-1.69-.512-2.642-.226-3.665.821-3.32 4.784-4.355 7.925-3.403 2.023.678 3.938 2.237 5.093 4.724 5.402-3.498 5.391-3.475 9.163-5.879-1.381-2.141-2.118-3.129-3.022-4.045-3.249-3.629-7.676-5.498-14.756-5.355l-3.688.477c-3.534.893-6.902 2.748-8.877 5.235-5.926 6.724-4.236 18.492 2.975 23.335 7.104 5.332 17.54 6.545 18.873 11.531 1.297 6.104-4.486 8.08-10.234 7.378-4.236-.881-6.592-3.034-9.139-6.949-4.688 2.713-4.688 2.713-9.508 5.485 1.143 2.499 2.344 3.63 4.26 5.795 9.068 9.198 31.76 8.746 35.83-5.176.165-.478 1.261-3.666.38-8.581zM69.462 58.943H57.753l-.048 30.272c0 6.438.333 12.34-.714 14.149-1.713 3.558-6.152 3.117-8.175 2.427-2.059-1.012-3.106-2.451-4.319-4.485-.333-.584-.583-1.036-.667-1.071l-9.52 5.83c1.583 3.249 3.915 6.069 6.902 7.901 4.462 2.678 10.459 3.499 16.731 2.059 4.082-1.189 7.604-3.652 9.448-7.401 2.666-4.915 2.094-10.864 2.07-17.444.06-10.735.001-21.468.001-32.237z"/>
          </svg>
        );
      case 'java':
        return (
          <svg viewBox="0 0 128 128" width="20" height="20">
            <path fill="#EA2D2E" d="M47.617 98.12s-4.767 2.774 3.397 3.71c9.892 1.13 14.947.968 25.845-1.092 0 0 2.871 1.795 6.873 3.351-24.439 10.47-55.308-.607-36.115-5.969zm-2.988-13.665s-5.348 3.959 2.823 4.805c10.567 1.091 18.91 1.18 33.354-1.6 0 0 1.993 2.025 5.132 3.131-29.542 8.64-62.446.68-41.309-6.336z"/><path fill="#EA2D2E" d="M69.802 61.271c6.025 6.935-1.58 13.17-1.58 13.17s15.289-7.891 8.269-17.777c-6.559-9.215-11.587-13.792 15.635-29.58 0 .001-42.731 10.67-22.324 34.187z"/><path fill="#EA2D2E" d="M102.123 108.229s3.529 2.91-3.888 5.159c-14.102 4.272-58.706 5.56-71.094.171-4.451-1.938 3.899-4.625 6.526-5.192 2.739-.593 4.303-.485 4.303-.485-4.953-3.487-32.013 6.85-13.743 9.815 49.821 8.076 90.817-3.637 77.896-9.468zM49.912 70.294s-22.686 5.389-8.033 7.348c6.188.828 18.518.638 30.011-.326 9.39-.789 18.813-2.474 18.813-2.474s-3.308 1.419-5.704 3.053c-23.042 6.061-67.544 3.238-54.731-2.958 10.832-5.239 19.644-4.643 19.644-4.643zm40.697 22.747c23.421-12.167 12.591-23.86 5.032-22.285-1.848.385-2.677.72-2.677.72s.688-1.079 2-1.543c14.953-5.255 26.451 15.503-4.823 23.725 0-.002.359-.327.468-.617z"/><path fill="#EA2D2E" d="M76.491 1.587S89.459 14.563 64.188 34.51c-20.266 16.006-4.621 25.13-.007 35.559-11.831-10.673-20.509-20.07-14.688-28.815C58.041 28.42 81.722 22.195 76.491 1.587z"/><path fill="#EA2D2E" d="M52.214 126.021c22.476 1.437 57-.8 57.817-11.436 0 0-1.571 4.032-18.577 7.231-19.186 3.612-42.854 3.191-56.887.874 0 .001 2.875 2.381 17.647 3.331z"/>
          </svg>
        );
      case 'cpp':
      case 'c':
        return (
          <svg viewBox="0 0 128 128" width="20" height="20">
            <path fill="#659AD3" d="M115.4 30.7L67.1 2.9c-.8-.5-1.9-.7-3.1-.7-1.2 0-2.3.3-3.1.7l-48 27.9c-1.7 1-2.9 3.5-2.9 5.4v55.7c0 1.1.2 2.4 1 3.5l106.8-62c-.6-1.2-1.5-2.1-2.4-2.7z"/><path fill="#03599C" d="M10.7 95.3c.5.8 1.2 1.5 1.9 1.9l48.2 27.9c.8.5 1.9.7 3.1.7 1.2 0 2.3-.3 3.1-.7l48-27.9c1.7-1 2.9-3.5 2.9-5.4V36.1c0-.9-.1-1.9-.6-2.8l-106.6 62z"/><path fill="#fff" d="M85.3 76.1C81.1 83.5 73.1 88.5 64 88.5c-13.5 0-24.5-11-24.5-24.5s11-24.5 24.5-24.5c9.1 0 17 4.9 21.3 12.3l13-7.5C93.2 30.7 79.5 19.5 64 19.5c-24.5 0-44.5 20-44.5 44.5s20 44.5 44.5 44.5c15.5 0 29.2-11.2 34.3-24.8l-13-7.6z"/><path fill="#fff" d="M104.8 49.8h-4.9v-4.9h-4.9v4.9h-4.9v4.9h4.9v4.9h4.9v-4.9h4.9v-4.9zM119.8 49.8h-4.9v-4.9h-4.9v4.9h-4.9v4.9h4.9v4.9h4.9v-4.9h4.9v-4.9z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full bg-gray-900 rounded-lg overflow-hidden shadow-xl border border-gray-700">
      {/* Editor Header */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-3 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-gray-700 py-1 px-3 rounded-full">
            {getLanguageIcon()}
            <span className="text-sm font-medium text-gray-200">{language.charAt(0).toUpperCase() + language.slice(1)}</span>
          </div>
          <span className="text-xs text-gray-400 bg-gray-700 py-1 px-2 rounded">
            {language === 'python' ? 'Ready to execute' : 'Syntax validation only'}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>
      </div>
      
      {/* Editor */}
      <div className="relative overflow-hidden">
        <CodeMirror
          value={code}
          onBeforeChange={(editor, data, value) => {
            // Remove blank lines at the top if they exist
            if (value.startsWith('\n')) {
              value = value.replace(/^\n+/, '');
            }
            setCode(value);
          }}
          options={{
            mode: getMode(),
            theme: 'monokai',
            lineNumbers: true,
            lineWrapping: true,
            smartIndent: true,
            autoCloseBrackets: true,
            matchBrackets: true,
            styleActiveLine: true,
            viewportMargin: Infinity,
            tabSize: 2,
            firstLineNumber: 1, // Ensure line numbering starts at 1
            indentUnit: 2,
            indentWithTabs: false,
            extraKeys: {
              "Tab": function(cm) {
                if (cm.somethingSelected()) {
                  cm.indentSelection("add");
                } else {
                  cm.replaceSelection("  ", "end");
                }
              }
            }
          }}
          className="code-editor"
          editorDidMount={editor => {
            // Store editor reference
            editorRef.current = editor;
            // Make sure the editor is properly initialized
            editor.refresh();
            // Focus the editor and ensure cursor is at beginning
            setTimeout(() => {
              editor.focus();
              editor.setCursor(0, 0);
              
              // If the editor is completely empty, add placeholder text
              if (editor.getValue().trim() === '') {
                const template = codeTemplates[language] || '';
                editor.setValue(template);
                setOriginalCode(template);
              }
            }, 100);
          }}
        />
        
        {/* Line Numbers Gutter Effect */}
        <div className="absolute top-0 bottom-0 left-0 w-10 bg-gradient-to-r from-black to-transparent opacity-20 pointer-events-none"></div>
      </div>
      
      {/* Editor Footer */}
      <div className="bg-gray-800 p-4 border-t border-gray-700 flex flex-wrap gap-3">
        <button
          onClick={() => {
            setOriginalCode(code);
            handleQuickFix();
          }}
          disabled={isLoading}
          className={`bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md flex items-center transition-all shadow-md hover:shadow-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Fixing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 3L5 7M5 7L9 11M5 7H15C18.3137 7 21 9.68629 21 13C21 16.3137 18.3137 19 15 19H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Quick Fix
            </>
          )}
        </button>
        <button
          onClick={handleRun}
          disabled={isLoading}
          className={`bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md flex items-center transition-all shadow-md hover:shadow-lg ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Running...
            </>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 3L19 12L5 21V3Z" fill="currentColor"/>
              </svg>
              Debug Code
            </>
          )}
        </button>
        <button
          onClick={() => {
            setCode(codeTemplates[language] || '');
            setOriginalCode(codeTemplates[language] || '');
          }}
          className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md flex items-center transition-all shadow-md hover:shadow-lg"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16 6L12 2L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 2V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Reset
        </button>
      </div>
      
      {/* Diff View */}
      {code !== originalCode && (
        <div className="bg-gray-900 border-t border-gray-700 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-gray-400 flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
              </svg>
              Code Changes
            </h3>
            <span className="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full">Diff View</span>
          </div>
          <div className="text-sm p-3 border border-gray-800 rounded bg-gray-950 font-mono overflow-x-auto max-h-36 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
            {applyDiff(originalCode, code)}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;