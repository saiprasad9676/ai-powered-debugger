import React from 'react';

const ErrorPanel = ({ errors, suggestions, output }) => {
  return (
    <div className="p-4 bg-gray-800">
      <h2 className="text-lg font-bold mb-2">Errors:</h2>
      <ul>
        {errors.map((error, index) => (
          <li key={index} className="text-red-500">{error}</li>
        ))}
      </ul>

      <h2 className="text-lg font-bold mt-4 mb-2">AI Suggestions:</h2>
      <ul>
        {suggestions.map((suggestion, index) => (
          <li key={index} className="text-green-500">{suggestion}</li>
        ))}
      </ul>

      <h2 className="text-lg font-bold mt-4 mb-2">Output:</h2>
      <pre className="bg-black p-2 rounded">{output}</pre>
    </div>
  );
};

export default ErrorPanel;