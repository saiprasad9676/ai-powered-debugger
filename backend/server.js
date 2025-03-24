const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['https://ai-powered-debugger-saiprasad.vercel.app', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// MongoDB Atlas Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((err) => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dateOfBirth: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// History Schema
const historySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  code: { type: String, required: true },
  language: { type: String, required: true },
  output: { type: String },
  changes: { type: String },
  suggestions: { type: String },
  timestamp: { type: Date, default: Date.now }
});

const History = mongoose.model('History', historySchema);

// Language-specific prompts
const getLanguageSpecificPrompt = (language) => {
  const languagePrompts = {
    "python": "Focus on common Python issues like indentation, missing colons, or undefined variables.",
    "javascript": "Pay attention to JavaScript-specific issues like missing semicolons, undefined variables, or scope problems.",
    "java": "Focus on Java-specific issues like missing semicolons, type errors, or class structure problems.",
    "cpp": "Look for C++ specific issues like memory management, pointer errors, or undefined behavior.",
    "c": "Check for C-specific issues like memory allocation, pointer arithmetic, or buffer overflows."
  };
  
  return languagePrompts[language.toLowerCase()] || "Provide general programming guidance for this code.";
};

// User Routes
app.post('/api/users', async (req, res) => {
  try {
    const { username, firstName, lastName, email, dateOfBirth } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      username,
      firstName,
      lastName,
      email,
      dateOfBirth
    });

    await user.save();
    res.status(201).json(user);
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ message: 'Error saving user profile' });
  }
});

app.get('/api/users/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user profile' });
  }
});

// Debug API endpoints
app.post('/api/verify', async (req, res) => {
  try {
    const { code, language, userId } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required' });
    }

    console.log(`Verifying ${language} code for user ${userId}`);
    console.log(`API Key (first 5 chars): ${process.env.GEMINI_API_KEY.substring(0, 5)}...`);
    const languageInstructions = getLanguageSpecificPrompt(language);

    // Fixed API URL for Gemini 1.5 Flash
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    console.log(`Using API URL: ${apiUrl.substring(0, apiUrl.indexOf('?'))}...`);

    // API request body
    const requestBody = {
      contents: [{
        parts: [{
          text: `Code (${language}):
${code}
---

Analyze this code thoroughly. ${languageInstructions}

Respond with the following sections:
1. Syntax Errors: List all syntax errors and why they're errors.
2. Logical Bugs: Identify logical bugs or runtime errors.
3. Suggestions: Provide specific suggestions to improve code quality, readability, and efficiency.

Be specific and highlight line numbers where possible. Respond in markdown format.`
        }]
      }]
    };

    try {
      console.log('Sending request to Gemini API...');
      const geminiResponse = await axios.post(
        apiUrl,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 seconds timeout
        }
      );
      
      console.log('Received response from Gemini API');
      const result = geminiResponse.data.candidates[0].content.parts[0].text;
      
      // Split result into sections using regex
      const syntaxMatch = result.match(/Syntax Errors:(.*?)(?=Logical Bugs:|Suggestions:|$)/s);
      const logicalMatch = result.match(/Logical Bugs:(.*?)(?=Syntax Errors:|Suggestions:|$)/s);
      const suggestionsMatch = result.match(/Suggestions:(.*?)(?=Syntax Errors:|Logical Bugs:|$)/s);
      
      const syntaxErrors = syntaxMatch ? syntaxMatch[1].trim() : '';
      const logicalBugs = logicalMatch ? logicalMatch[1].trim() : '';
      const suggestions = suggestionsMatch ? suggestionsMatch[1].trim() : '';
      
      const changes = [
        syntaxErrors && `## Syntax Errors\n${syntaxErrors}`,
        logicalBugs && `## Logical Bugs\n${logicalBugs}`
      ].filter(Boolean).join('\n\n');

      res.json({
        changes: changes || 'No issues found in your code.',
        suggestions: suggestions ? `## Suggestions\n${suggestions}` : 'No suggestions available.'
      });
    } catch (apiError) {
      console.error('Gemini API Error:', apiError.message);
      if (apiError.response) {
        console.error('Response data:', apiError.response.data);
        console.error('Response status:', apiError.response.status);
      }
      throw new Error(`Gemini API error: ${apiError.message}`);
    }
  } catch (error) {
    console.error('Error verifying code:', error);
    res.status(500).json({ 
      message: 'Error verifying code', 
      error: error.message
    });
  }
});

app.post('/api/debug', async (req, res) => {
  try {
    const { code, language, userId } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ message: 'Code and language are required' });
    }

    console.log(`Debugging ${language} code for user ${userId}`);
    console.log(`API Key (first 5 chars): ${process.env.GEMINI_API_KEY.substring(0, 5)}...`);
    const languageInstructions = getLanguageSpecificPrompt(language);

    // Fixed API URL for Gemini 1.5 Flash
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
    console.log(`Using API URL: ${apiUrl.substring(0, apiUrl.indexOf('?'))}...`);

    // API request body
    const requestBody = {
      contents: [{
        parts: [{
          text: `Code (${language}):
${code}
---

Debug and execute this code. ${languageInstructions}

Respond with the following sections:
1. Output: What the code would output when run correctly
2. Issues: Specific errors or bugs that prevent the code from running correctly
3. Fixed Code: Provide a corrected version of the code that would run properly
4. Suggestions: Additional improvements beyond fixing errors

Format your response in markdown.`
        }]
      }]
    };

    try {
      console.log('Sending request to Gemini API...');
      const geminiResponse = await axios.post(
        apiUrl,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60 seconds timeout
        }
      );
      
      console.log('Received response from Gemini API');
      const result = geminiResponse.data.candidates[0].content.parts[0].text;
      
      // Extract sections using regex
      const outputMatch = result.match(/Output:(.*?)(?=Issues:|Fixed Code:|Suggestions:|$)/s);
      const issuesMatch = result.match(/Issues:(.*?)(?=Output:|Fixed Code:|Suggestions:|$)/s);
      const fixedCodeMatch = result.match(/Fixed Code:(.*?)(?=Output:|Issues:|Suggestions:|$)/s);
      const suggestionsMatch = result.match(/Suggestions:(.*?)(?=Output:|Issues:|Fixed Code:|$)/s);
      
      const output = outputMatch ? outputMatch[1].trim() : 'No output generated.';
      const issues = issuesMatch ? issuesMatch[1].trim() : 'No issues found.';
      const fixedCode = fixedCodeMatch ? fixedCodeMatch[1].trim() : '';
      const suggestions = suggestionsMatch ? suggestionsMatch[1].trim() : 'No suggestions available.';
      
      const changes = [
        issues && `## Issues\n${issues}`,
        fixedCode && `## Fixed Code\n${fixedCode}`
      ].filter(Boolean).join('\n\n');

      res.json({
        output: `## Output\n${output}`,
        changes: changes || 'No issues found in your code.',
        suggestions: suggestions ? `## Suggestions\n${suggestions}` : 'No suggestions available.'
      });
      
      // Save to history after successful response
      try {
        await History.create({
          userId,
          code,
          language,
          output: `## Output\n${output}`,
          changes: changes || 'No issues found in your code.',
          suggestions: suggestions ? `## Suggestions\n${suggestions}` : 'No suggestions available.',
          timestamp: new Date()
        });
      } catch (historyError) {
        console.error('Error saving to history:', historyError);
        // Don't fail the main request if history save fails
      }
    } catch (apiError) {
      console.error('Gemini API Error:', apiError.message);
      if (apiError.response) {
        console.error('Response data:', apiError.response.data);
        console.error('Response status:', apiError.response.status);
      }
      throw new Error(`Gemini API error: ${apiError.message}`);
    }
  } catch (error) {
    console.error('Error debugging code:', error);
    res.status(500).json({ 
      message: 'Error debugging code', 
      error: error.message
    });
  }
});

// History Routes
app.post('/api/history', async (req, res) => {
  try {
    const { userId, code, language, output, changes, suggestions } = req.body;
    
    if (!userId || !code || !language) {
      return res.status(400).json({ message: 'User ID, code and language are required' });
    }

    const history = new History({
      userId,
      code,
      language,
      output: output || '',
      changes: changes || '',
      suggestions: suggestions || '',
      timestamp: new Date()
    });

    await history.save();
    res.status(201).json(history);
  } catch (error) {
    console.error('Error saving history:', error);
    res.status(500).json({ message: 'Error saving history' });
  }
});

app.get('/api/history/:userId', async (req, res) => {
  try {
    const history = await History.find({ userId: req.params.userId })
      .sort({ timestamp: -1 })
      .limit(5);
      
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ message: 'Error fetching history' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
}); 