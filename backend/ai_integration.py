import os
from dotenv import load_dotenv
import requests
import json

# Load environment variables from .env file
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")  # Load API key from .env
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

def get_language_specific_prompt(language):
    """Return language-specific instructions for the AI"""
    language_prompts = {
        "python": "Focus on common Python issues like indentation, missing colons, or undefined variables. Consider Python's dynamic typing and library imports.",
        "javascript": "Pay attention to JavaScript-specific issues like missing semicolons, undefined variables, or async/await problems. Consider browser compatibility and Node.js environment differences.",
        "java": "Focus on Java-specific issues like missing semicolons, type errors, or class structure problems. Consider Java's strict typing, method signatures, and compilation requirements.",
        "cpp": "Look for C++ specific issues like memory management, pointer errors, or missing include statements. Consider compilation stages and linking errors.",
        "c": "Check for C-specific issues like memory allocation, pointer arithmetic, or missing headers. Consider C's procedural nature and manual memory management."
    }
    return language_prompts.get(language.lower(), "Provide general programming guidance for this code.")

def get_ai_suggestions(code, errors, language="python"):
    language = language.lower()
    language_instructions = get_language_specific_prompt(language)
    
    prompt = f"""Code ({language}):
```{language}
{code}
```

Errors:
{errors}

{language_instructions}

Provide 3-5 clear, concise suggestions to fix these errors in {language}.
For each suggestion:
1. Identify the specific error or issue
2. Provide the correct code snippet to fix it
3. Briefly explain why this is a problem and how your fix resolves it"""

    try:
        response = requests.post(
            GEMINI_URL,
            params={"key": GEMINI_API_KEY},
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "temperature": 0.2,
                    "topP": 0.8,
                    "topK": 40
                }
            },
            timeout=10
        )
        
        response.raise_for_status()  # Raise exception for error status codes
        
        data = response.json()
        # Extract the suggestions from the response
        candidates = data.get("candidates", [])
        if candidates and candidates[0].get("content", {}).get("parts", []):
            text = candidates[0]["content"]["parts"][0]["text"]
            # Split the text into bullet points for better UI display
            suggestions = [line.strip() for line in text.split('\n') if line.strip()]
            return suggestions[:10]  # Limit to 10 suggestions for UI
    except requests.exceptions.RequestException as e:
        return [f"API error: {str(e)}", "Please check your API key and internet connection."]
    except json.JSONDecodeError:
        return ["Error decoding API response. The Gemini API may be experiencing issues."]
    except Exception as e:
        return [f"Unexpected error: {str(e)}", "Please try again later."]
    
    return ["No AI suggestions available. Please check your API key or try again later."]

def apply_quick_fix(code, language="python"):
    language = language.lower()
    language_instructions = get_language_specific_prompt(language)
    
    prompt = f"""Fix all errors in this {language} code and return ONLY the corrected version:
```{language}
{code}
```

{language_instructions}

Requirements:
1. Output ONLY the fixed code with no explanations
2. Keep the program logic intact while fixing syntax/errors
3. Make minimal changes to achieve a working program
4. Return the entire fixed code, not just the problematic parts
5. Preserve code comments and formatting as much as possible"""

    try:
        response = requests.post(
            GEMINI_URL,
            params={"key": GEMINI_API_KEY},
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{
                    "parts": [{"text": prompt}]
                }],
                "generationConfig": {
                    "temperature": 0.1,
                    "topP": 0.95,
                    "topK": 40
                }
            },
            timeout=10
        )
        
        response.raise_for_status()
        
        data = response.json()
        candidates = data.get("candidates", [])
        if candidates and candidates[0].get("content", {}).get("parts", []):
            text = candidates[0]["content"]["parts"][0]["text"]
            
            # Try to extract code block from the response
            if "```" in text:
                blocks = text.split("```")
                if len(blocks) >= 3:  # Markdown code blocks format
                    # Extract the content between the first pair of ``` markers
                    fixed_code = blocks[1].strip()
                    if language in fixed_code:  # Remove language identifier
                        fixed_code = fixed_code.replace(language, "", 1).strip()
                    return fixed_code
            
            # If no code blocks are found, return the raw text
            return text.strip()
    except requests.exceptions.RequestException as e:
        return code + f"\n\n# Error: API request failed - {str(e)}"
    except json.JSONDecodeError:
        return code + "\n\n# Error: Failed to decode API response"
    except Exception as e:
        return code + f"\n\n# Error: {str(e)}"
            
    return code  # Return original code if API call fails