import os
import json
import logging
from flask import Flask, request, jsonify, session
from werkzeug.utils import secure_filename
import google.generativeai as genai
import PyPDF2 as pdf
from dotenv import load_dotenv


load_dotenv()

API_KEY = os.getenv("GOOGLE_API_KEY")
if not API_KEY:
    raise ValueError("GOOGLE_API_KEY is not set in the environment variables")

genai.configure(api_key=API_KEY)

app = Flask(__name__)
app.secret_key = 'your_secret_key'

# In-memory storage for user data
users = {}

logging.basicConfig(level=logging.DEBUG, format='%(asctime)s - %(levelname)s - %(message)s')

def get_gemini_response(input_text):
    try:
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(input_text)
        return response.text
    except Exception as e:
        return str(e)

def input_pdf_text(uploaded_file):
    try:
        reader = pdf.PdfReader(uploaded_file)
        text = ""
        for page in range(len(reader.pages)):
            page = reader.pages[page]
            text += page.extract_text() or ""
        return text
    except Exception as e:
        return str(e)

input_prompt_template="""
Hey Act Like a skilled or very experience ATS(Application Tracking System)
with a deep understanding of tech field,software engineering,data science ,data analyst
and big data engineer. Your task is to evaluate the resume based on the given job description.
You must consider the job market is very competitive and you should provide 
best assistance for improving thr resumes. Assign the percentage Matching based 
on Jd and
the missing keywords with high accuracy
resume:{text}
description:{jd}

I want the response in one single string having the structure
{{"JD Match":"%","MissingKeywords:[]","Profile Summary":""}}
"""

@app.route('/evaluate_resume', methods=['POST'])
def evaluate_resume():
    # Check if the user is logged in
    #if 'user' not in session:
        #return jsonify({'error': 'Unauthorized access'}), 401

    if 'file' not in request.files or 'job_description' not in request.form:
        return jsonify({'error': 'Missing file or job description'}), 400

    uploaded_file = request.files['file']
    job_description = request.form['job_description']

    if uploaded_file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if not uploaded_file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Invalid file type. Please upload a PDF file.'}), 400

    filename = secure_filename(uploaded_file.filename)
    text = input_pdf_text(uploaded_file)

    if not text:
        return jsonify({'error': 'Failed to extract text from the PDF file.'}), 500

    input_prompt = input_prompt_template.format(text=text, jd=job_description)

    response = get_gemini_response(input_prompt)

    # Debugging: Print raw response from GenAI
    app.logger.debug("Raw Response from GenAI: %s", response)

    try:
        response_json = json.loads(response)
    except json.JSONDecodeError:
        response_json = {'error': 'Failed to decode response from generative AI'}

    return jsonify(response_json)
@app.route('/evaluate_bulk_resumes', methods=['POST'])
def evaluate_bulk_resumes():
    # Check if the user is logged in
    if 'user' not in session:
        return jsonify({'error': 'Unauthorized access'}), 401

    if 'files' not in request.files or 'job_description' not in request.form:
        return jsonify({'error': 'Missing files or job description'}), 400

    uploaded_files = request.files.getlist('files')
    job_description = request.form['job_description']

    leaderboard = []

    for uploaded_file in uploaded_files:
        if uploaded_file.filename == '':
            continue

        if not uploaded_file.filename.lower().endswith('.pdf'):
            continue

        text = input_pdf_text(uploaded_file)

        if not text:
            continue

        input_prompt = input_prompt_template.format(text=text, jd=job_description)
        response = get_gemini_response(input_prompt)


        try:
            response_json = json.loads(response)
            match_score = float(response_json.get("JD Match", "0").strip('%'))
            leaderboard.append({
                'filename': uploaded_file.filename,
                'match_score': match_score,
                'response': response_json
            })
        except (json.JSONDecodeError, ValueError, TypeError):
            continue

    # Sort leaderboard by match_score in descending order
    leaderboard.sort(key=lambda x: x['match_score'], reverse=True)

    return jsonify(leaderboard)

@app.route('/signup', methods=['POST'])
def signup():
    try:
        email = request.form['email']
        username = request.form['username']
        password = request.form['password']

        # Check if the email already exists
        if email in users:
            return jsonify({'error': 'Email already exists'}), 400

        # Store the user data in the in-memory dictionary
        users[email] = {
            'username': username,
            'password': password
        }

        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        email = request.form['email']
        password = request.form['password']

        # Check if the user exists and the password matches
        if email in users and users[email]['password'] == password:
            session['user'] = email
            return jsonify({'message': 'Logged in successfully'}), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/logout', methods=['POST'])
def logout():
    try:
        # Remove the user from the session
        session.pop('user', None)
        return jsonify({'message': 'Logged out successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
if __name__ == '__main__':
    app.run(debug=True)
