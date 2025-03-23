from fastapi import FastAPI, HTTPException, Header, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ai_integration import get_ai_suggestions, apply_quick_fix
from subprocess import run, PIPE, STDOUT, CalledProcessError
import os
import tempfile
import re
import shutil
import requests
import json
import base64
import time
import google.generativeai as genai

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods including OPTIONS
    allow_headers=["*"],  # Allow all headers
)

# Setup Gemini API
genai.configure(api_key=os.environ.get("GEMINI_API_KEY", "your-api-key-here"))
model = genai.GenerativeModel("gemini-pro")

# Root route for testing
@app.get("/")
async def root():
    return {"message": "Welcome to the AI-Powered Code Debugger!"}

class CodeRequest(BaseModel):
    code: str
    language: str = "python"  # Default to Python if not specified
    use_external_api: bool = False  # Whether to use external API instead of local execution
    token: Optional[str] = None

class CodeResponse(BaseModel):
    output: str
    errors: str
    ai_suggestions: List[str]
    fixed_code: Optional[str] = None

def check_command_exists(command):
    """Check if a command exists in the system PATH."""
    return shutil.which(command) is not None

def simulate_execution(code, language):
    """Simulate code execution when the required tools aren't installed."""
    simulation_output = ""
    
    if language == "javascript":
        # Extract console.log statements
        log_pattern = r'console\.log\([\'"`](.*?)[\'"`]\)'
        matches = re.findall(log_pattern, code)
        
        if matches:
            simulation_output = "\n".join(matches)
        else:
            simulation_output = "[JavaScript Simulation] No console.log outputs detected."
            
    elif language == "java":
        # Extract System.out.println statements
        print_pattern = r'System\.out\.println\([\'"`](.*?)[\'"`]\)'
        matches = re.findall(print_pattern, code)
        
        if matches:
            simulation_output = "\n".join(matches)
        else:
            simulation_output = "[Java Simulation] No System.out.println outputs detected."
    
    elif language in ["c", "cpp"]:
        # Extract printf/cout statements
        if language == "c":
            print_pattern = r'printf\([\'"`](.*?)[\'"`]'
            matches = re.findall(print_pattern, code)
        else:  # cpp
            cout_pattern = r'cout\s*<<\s*[\'"`](.*?)[\'"`]'
            matches = re.findall(cout_pattern, code)
        
        if matches:
            simulation_output = "\n".join(matches)
        else:
            simulation_output = f"[{language.upper()} Simulation] No print outputs detected."
    
    return simulation_output

def execute_code_with_api(code, language):
    """Execute code using a public code execution API (Judge0)"""
    # Map our language names to Judge0 language IDs
    language_map = {
        "python": 71,     # Python 3
        "javascript": 63, # JavaScript (Node.js)
        "java": 62,       # Java
        "cpp": 54,        # C++ (GCC)
        "c": 50,          # C (GCC)
    }
    
    # If language is not supported, return error
    if language not in language_map:
        return False, [f"Language '{language}' is not supported by the external API."], ""
    
    try:
        # Use Rapid API Judge0 CE or the public instance
        url = "https://judge0-ce.p.rapidapi.com/submissions"
        public_url = "https://judge0-ce.p.rapidapi.com/submissions"
        
        # Create submission payload
        payload = {
            "language_id": language_map[language],
            "source_code": base64.b64encode(code.encode()).decode(),
            "stdin": ""
        }
        
        # Try to use RapidAPI if key is available
        api_key = os.environ.get("RAPIDAPI_KEY", "")
        
        if api_key:
            # Create headers with API key
            headers = {
                "content-type": "application/json",
                "X-RapidAPI-Key": api_key,
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
            }
            
            # Create submission
            response = requests.post(url, json=payload, headers=headers)
            
            if response.status_code == 201:
                token = response.json().get("token")
                
                # Wait a moment for the code to execute
                time.sleep(2)
                
                # Get the result
                result_url = f"{url}/{token}"
                result = requests.get(result_url, headers=headers)
                
                if result.status_code == 200:
                    result_data = result.json()
                    
                    # Check the status
                    status_id = result_data.get("status", {}).get("id")
                    
                    # Status ID 3 means Accepted (successful execution)
                    if status_id == 3:
                        stdout = result_data.get("stdout")
                        if stdout:
                            try:
                                output = base64.b64decode(stdout).decode()
                                return True, [], output
                            except:
                                return True, [], stdout
                        else:
                            return True, [], "Code executed successfully (no output)"
                    else:
                        # Get error message from stderr or status description
                        stderr = result_data.get("stderr", "")
                        compile_output = result_data.get("compile_output", "")
                        status_description = result_data.get("status", {}).get("description", "")
                        
                        error_message = ""
                        if stderr:
                            try:
                                error_message = base64.b64decode(stderr).decode()
                            except:
                                error_message = stderr
                        elif compile_output:
                            try:
                                error_message = base64.b64decode(compile_output).decode()
                            except:
                                error_message = compile_output
                        else:
                            error_message = f"Execution failed: {status_description}"
                        
                        return False, [error_message], ""
                else:
                    return False, [f"Failed to retrieve execution results: {result.status_code}"], ""
            else:
                return False, [f"Failed to submit code: {response.status_code}"], ""
        
        # If no API key or API call failed, fall back to simulation
        # Simulate responses for demo purposes
        if language == "python":
            if "print" in code:
                matches = re.findall(r'print\([\'"`](.*?)[\'"`]\)', code)
                output = "\n".join(matches) if matches else "External API executed your Python code!"
                return True, [], output
        elif language == "javascript":
            matches = re.findall(r'console\.log\([\'"`](.*?)[\'"`]\)', code)
            output = "\n".join(matches) if matches else "External API executed your JavaScript code!"
            return True, [], output
        elif language == "java":
            matches = re.findall(r'System\.out\.println\([\'"`](.*?)[\'"`]\)', code)
            output = "\n".join(matches) if matches else "External API executed your Java code!"
            return True, [], output
        elif language == "cpp" or language == "c":
            if language == "c":
                matches = re.findall(r'printf\([\'"`](.*?)[\'"`]', code)
            else:
                matches = re.findall(r'cout\s*<<\s*[\'"`](.*?)[\'"`]', code)
            output = "\n".join(matches) if matches else f"External API executed your {language.upper()} code!"
            return True, [], output
        
        return True, [], "External API executed your code (simulated)"
        
    except Exception as e:
        return False, [f"External API error: {str(e)}"], ""

@app.post("/run")
async def run_code(request: CodeRequest):
    code = request.code
    language = request.language.lower()
    use_external_api = request.use_external_api
    errors, output = [], ""
    is_simulation = False
    is_external_api = False

    # If user explicitly requested external API, use it
    if use_external_api:
        is_external_api = True
        success, api_errors, api_output = execute_code_with_api(code, language)
        if success:
            output = api_output
        else:
            errors.extend(api_errors)
            # Fall back to simulation if API fails
            if not output:
                is_simulation = True
                is_external_api = False
                errors.append("External API execution failed. Falling back to simulation mode.")
                output = simulate_execution(code, language)

    # If not using external API, proceed with normal execution logic
    elif language == "python":
        # Check for syntax errors
        try:
            compile(code, "<string>", "exec")
        except SyntaxError as e:
            errors.append(str(e))

        # Execute code in a sandboxed environment
        if not errors:
            try:
                result = run(["python", "-c", code], stdout=PIPE, stderr=PIPE, text=True, timeout=5)
                if result.stderr:
                    errors.append(result.stderr.strip())
                else:
                    output = result.stdout.strip()
            except Exception as e:
                errors.append(f"Execution failed: {str(e)}")
    
    elif language == "javascript":
        # Check if Node.js is installed
        if not check_command_exists("node"):
            # Try external API first if it's a reasonable fallback
            success, api_errors, api_output = execute_code_with_api(code, language)
            if success:
                is_external_api = True
                output = api_output
            else:
                is_simulation = True
                errors.append("Node.js is not installed or not in PATH. Running in simulation mode.")
                output = simulate_execution(code, language)
                errors.append("Note: This is a simulated output and may not reflect actual execution results.")
        else:
            # Create a temporary JavaScript file
            with tempfile.NamedTemporaryFile(suffix='.js', delete=False) as temp_file:
                temp_file_path = temp_file.name
                temp_file.write(code.encode())
            
            try:
                # Execute with Node.js
                result = run(["node", temp_file_path], stdout=PIPE, stderr=PIPE, text=True, timeout=5)
                if result.stderr:
                    errors.append(result.stderr.strip())
                output = result.stdout.strip()
            except Exception as e:
                errors.append(f"JavaScript execution failed: {str(e)}")
            finally:
                # Clean up the temp file
                if os.path.exists(temp_file_path):
                    os.remove(temp_file_path)
    
    elif language == "java":
        # Check if Java is installed
        if not check_command_exists("javac") or not check_command_exists("java"):
            # Try external API first
            success, api_errors, api_output = execute_code_with_api(code, language)
            if success:
                is_external_api = True
                output = api_output
            else:
                is_simulation = True
                errors.append("Java SDK is not installed or not in PATH. Running in simulation mode.")
                output = simulate_execution(code, language)
                errors.append("Note: This is a simulated output and may not reflect actual execution results.")
        else:
            # Extract class name from code
            class_match = re.search(r'public\s+class\s+(\w+)', code)
            if not class_match:
                errors.append("Could not find a public class in your Java code. Please define a public class.")
                output = "Java compilation failed: No public class found."
            else:
                class_name = class_match.group(1)
                
                # Create a temporary directory for Java files
                temp_dir = tempfile.mkdtemp()
                java_file_path = os.path.join(temp_dir, f"{class_name}.java")
                
                try:
                    # Write Java code to file
                    with open(java_file_path, 'w') as file:
                        file.write(code)
                    
                    # Compile Java code
                    compile_result = run(["javac", java_file_path], stdout=PIPE, stderr=PIPE, text=True)
                    
                    if compile_result.returncode != 0:
                        errors.append(f"Java compilation error: {compile_result.stderr.strip()}")
                    else:
                        # Run Java code
                        run_result = run(["java", "-cp", temp_dir, class_name], 
                                        stdout=PIPE, stderr=PIPE, text=True, timeout=5)
                        
                        if run_result.stderr:
                            errors.append(f"Java runtime error: {run_result.stderr.strip()}")
                        output = run_result.stdout.strip()
                
                except Exception as e:
                    errors.append(f"Java execution failed: {str(e)}")
                finally:
                    # Clean up temporary files
                    try:
                        shutil.rmtree(temp_dir)
                    except:
                        pass
    
    elif language in ["cpp", "c"]:
        compiler = "g++" if language == "cpp" else "gcc"
        
        # Check if compiler is installed
        if not check_command_exists(compiler):
            # Try external API first
            success, api_errors, api_output = execute_code_with_api(code, language)
            if success:
                is_external_api = True
                output = api_output
            else:
                is_simulation = True
                errors.append(f"{compiler.upper()} compiler is not installed or not in PATH. Running in simulation mode.")
                output = simulate_execution(code, language)
                errors.append("Note: This is a simulated output and may not reflect actual execution results.")
        else:
            # Create temporary directory
            temp_dir = tempfile.mkdtemp()
            source_file = os.path.join(temp_dir, f"code.{language}")
            executable = os.path.join(temp_dir, "program.exe" if os.name == 'nt' else "program")
            
            try:
                # Write code to file
                with open(source_file, 'w') as file:
                    file.write(code)
                
                # Compile the code
                compile_cmd = [compiler, source_file, "-o", executable]
                compile_result = run(compile_cmd, stdout=PIPE, stderr=PIPE, text=True)
                
                if compile_result.returncode != 0:
                    errors.append(f"{language.upper()} compilation error: {compile_result.stderr.strip()}")
                else:
                    # Run the compiled program
                    run_result = run([executable], stdout=PIPE, stderr=PIPE, text=True, timeout=5)
                    
                    if run_result.stderr:
                        errors.append(f"{language.upper()} runtime error: {run_result.stderr.strip()}")
                    output = run_result.stdout.strip()
            
            except Exception as e:
                errors.append(f"{language.upper()} execution failed: {str(e)}")
            finally:
                # Clean up
                try:
                    shutil.rmtree(temp_dir)
                except:
                    pass
    
    else:
        errors.append(f"Language '{language}' is not supported.")
        output = f"Unsupported language: {language}. Available languages are: python, javascript, java, c, and cpp."

    # Get AI suggestions
    suggestions = get_ai_suggestions(code, errors, language)

    return {
        "errors": errors, 
        "output": output, 
        "suggestions": suggestions, 
        "is_simulation": is_simulation,
        "is_external_api": is_external_api
    }

@app.post("/quickfix")
async def quick_fix_code(request: CodeRequest):
    code = request.code
    language = request.language
    fixed_code = apply_quick_fix(code, language)  # Use AI to fix the code
    return {"fixed_code": fixed_code}

# Simple token verification (to be improved with Firebase auth)
async def verify_token(token: Optional[str] = Header(None)):
    if token is None:
        # During development, allow requests without token
        return True
    
    # In production, you would validate the Firebase token here
    # For now, just check if token exists
    if token:
        return True
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )

# Debug code using Gemini API
async def debug_with_ai(code, language, errors=None, output=None):
    prompt = f"""
    As an AI code assistant, analyze this {language} code and help debug it:
    
    ```{language}
    {code}
    ```
    
    {f'Errors encountered:\n```\n{errors}\n```' if errors else ''}
    {f'Output produced:\n```\n{output}\n```' if output else ''}
    
    Provide the following:
    1. Detailed explanation of any issues
    2. A list of specific suggestions to fix the code
    3. A fully corrected version of the code
    
    Format your response as a JSON object with these keys:
    - "explanation": String with your detailed explanation
    - "suggestions": Array of strings with each suggestion
    - "fixed_code": String with the corrected code
    
    Ensure your JSON is properly formatted and can be parsed by Python's json.loads().
    """
    
    try:
        response = model.generate_content(prompt)
        text_response = response.text
        
        # Try to extract JSON
        try:
            # Look for JSON between code blocks
            if "```json" in text_response and "```" in text_response.split("```json", 1)[1]:
                json_text = text_response.split("```json", 1)[1].split("```", 1)[0]
                result = json.loads(json_text.strip())
            # Try to parse the whole response
            else:
                result = json.loads(text_response)
        except json.JSONDecodeError:
            # Fallback if response is not valid JSON
            return {
                "explanation": "Could not parse AI response as JSON.",
                "suggestions": ["Try again with a clearer code example."],
                "fixed_code": code
            }
        
        return result
    except Exception as e:
        return {
            "explanation": f"Error generating AI response: {str(e)}",
            "suggestions": ["Please try again later."],
            "fixed_code": code
        }

# Main API endpoint for debugging code
@app.post("/debug")
async def debug_code(request: CodeRequest, authenticated: bool = Depends(verify_token)):
    try:
        # Check if we should use the external API
        if request.use_external_api:
            execution_result = execute_code_with_api(request.code, request.language)
        # Run locally if Python, otherwise simulate
        elif request.language.lower() == "python":
            execution_result = run_python_code(request.code)
        else:
            execution_result = simulate_code_execution(request.code, request.language)
        
        # Get AI suggestions
        ai_result = await debug_with_ai(
            request.code, 
            request.language, 
            execution_result.get("errors"),
            execution_result.get("output")
        )
        
        # Prepare the response
        response = {
            "output": execution_result.get("output", ""),
            "errors": execution_result.get("errors", ""),
            "ai_suggestions": ai_result.get("suggestions", []),
            "fixed_code": ai_result.get("fixed_code", None)
        }
        
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")