from flask import Flask, request, jsonify
import requests
import jwt
import xml.etree.ElementTree as ET
import time
from langchain_ollama import ChatOllama
import re
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import (
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    AIMessagePromptTemplate,
    ChatPromptTemplate
)
import re
from langchain.prompts import PromptTemplate

app = Flask(__name__)

# Initialize AI Model
llm_engine = ChatOllama(
    model="deepseek-r1:1.5b",
    base_url="http://localhost:11434",
    temperature=0.3
)

def get_jenkins_build_script(jenkins_url,username,api_token,job_name,build_number):
    try:
        job_url=f"{jenkins_url}/job/{job_name}/config.xml"
        response = requests.get(job_url,auth=(username,api_token))
        print("here")
        if response.status_code == 200:
            xml_script = response.text
            root = ET.fromstring(xml_script)
            script_tag = root.find(".//script")
            if script_tag is not None:
                return script_tag.text
    except Exception as e:
        return str(e)

# Function to fetch Jenkins build logs dynamically
def get_latest_build_logs(jenkins_url, username, api_token, job_name, build_number):
    try:
        job_url = f"{jenkins_url}/job/{job_name}/{build_number}/consoleText"
        response = requests.get(job_url, auth=(username, api_token))
        if response.status_code == 200:
            logs = response.text
            cleaned_logs = re.sub(r'[{}]', '', logs)
            return cleaned_logs
        else:
            return f"Failed to fetch logs: {response.status_code}"
    except Exception as e:
        return str(e)

# Function to generate AI response
def generate_ai_response(prompt_chain):
    processing_pipeline = prompt_chain | llm_engine | StrOutputParser()
    return processing_pipeline.invoke({})

# Function to build AI prompt chain
def build_prompt_chain(previous_messages):
    prompt_sequence = [
        # SystemMessagePromptTemplate.from_template(
        #     "You are an expert AI for analyzing Jenkins pipeline logs. Provide insights into failures, "
        #     "possible fixes, and recommendations for optimizing CI/CD pipelines."
        # )
    ]

    for msg in previous_messages:
        if msg["role"] == "user":
            clean_content = msg["content"].replace("{", "{{").replace("}", "}}")
            prompt_sequence.append(HumanMessagePromptTemplate.from_template(clean_content))
        elif msg["role"] == "ai":
            prompt_sequence.append(AIMessagePromptTemplate.from_template(msg["content"]))

    return ChatPromptTemplate.from_messages(prompt_sequence)

def perform_task(task_name,status):
    print(f"Performing {task_name}...")
    time.sleep(2)  # Simulate task execution

    # Send task update to Node.js
    requests.post("http://localhost:8088/notify-task", json={"task": task_name, "status": status})

# API Endpoint to fetch and analyze Jenkins logs
@app.route('/analyze', methods=['POST'])
def analyze_logs():
    perform_task("Fetching Jenkins Logs", "In Progress")
    time.sleep(2)
    perform_task("Fetching Jenkins Logs", "In Progress")
    time.sleep(2)
    data = request.json
    jenkins_url = data.get("jenkins_url")
    username = data.get("username")
    api_token = data.get("api_token")
    job_name = data.get("job_name")
    build_number = data.get("buildNumber")
    logs = ("logs")
    build_number = build_number if build_number else 'lastBuild'
    print(build_number)
    if not jenkins_url or not username or not api_token or not job_name:
        return jsonify({"error": "Missing required fields"}), 400

    logs = get_latest_build_logs(jenkins_url, username, api_token, job_name,build_number)

    perform_task("Fetching Jenkins Logs", "Completed")
    time.sleep(2)
    perform_task("Fetching Buid Script","In Progress")
    time.sleep(2)
    build_script = get_jenkins_build_script(jenkins_url,username,api_token,job_name,build_number)
    perform_task("Fetching Buid Script","Completed")
    time.sleep(2)
    perform_task("Analyzing Jenkins Logs", "In Progress")
    time.sleep(2)
    if "Failed to fetch logs" in logs:
        return jsonify({"error": logs}), 500

    prompt_template = PromptTemplate(
    template=(
        "Analyze the following Jenkins logs and respond strictly in the format below and explain everything in detail:\n\n"
        "**Reason of failure (If any):**\n[Provide the reason if a failure is detected]\n\n"
        "**Solution to failure:**\n[Suggest a solution if a failure is found with detailed information]\n\n"
        "**Analysis of logs:**\n[Summarize the key insights from the logs]\n\n"
        "**New build Script**\n[Give a new fixed build script based on the old one]\n\n"
        "-----------------------------\n"
        "Logs:\n{logs}\n\n"
        "Build Script:\n{build_script}"
    ),
    input_variables=["logs", "build_script"]  # ✅ Correctly defined here
    )

    # prompt_chain = build_prompt_chain([
    #     {
    #         "role": "user",
    #         "content": (
    #             "Analyze the following Jenkins logs and respond strictly in the format below and explain everything in detail:\n\n"
    #             "**Reason of failure (If any):**\n[Provide the reason if a failure is detected]\n\n"
    #             "**Solution to failure:**\n[Suggest a solution if a failure is found with detailed information]\n\n"
    #             "**Analysis of logs:**\n[Summarize the key insights from the logs]\n\n"
    #             "**New build Script**\n[Give a new fixed build script based on the old one]\n\n"
    #             "-----------------------------\n"
    #             f"Logs:\n{logs}\n\n"
    #             f"Build Script:\n{build_script}"
    #         )
    #     }
    # ])
    prompt_chain = build_prompt_chain([
    {"role": "user", "content": prompt_template.format(logs=logs, build_script=build_script)}
    ])

    
    ai_response = generate_ai_response(prompt_chain)
    perform_task("Analyzing Jenkins Logs", "Completed")
    time.sleep(2)
    return jsonify({"logs": logs, "analysis": ai_response})


# API Endpoint for general chatbot conversation
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json

    user_message = data.get("message", "")
    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # Get the message history for context
    message_log = data.get("message_log", [])

    # Build AI response with message context
    prompt_chain = build_prompt_chain(message_log + [{"role": "user", "content": user_message}])
    ai_response = generate_ai_response(prompt_chain)

    return jsonify({"response": ai_response})

@app.route('/create-issue',methods=['POST'])
def create_issue():
    data= request.json
    github_user = data.get("github_user")
    github_repo = data.get("github_repo")
    github_token = data.get("github_token")
    issue_text = data.get("issue_text")
    title=""
    description=""
    perform_task("Generating Title and Description","In Progress")
    time.sleep(2)
    while(len(title)==0):
        title, description = get_title_description(issue_text)
    perform_task("Generating Title and Description","Completed")
    time.sleep(2)
    perform_task("Creating Github Issue","In Progress")
    time.sleep(2)
    response = create_issue_github(github_repo=github_repo,github_token=github_token,github_user=github_user,title=title,description=description)
    perform_task("Creating Github Issue","Completed")
    time.sleep(2)
    return response
    
def get_title_description(issue_text):
    prompt_template = PromptTemplate(
    template=(
        "You will be provided with a summary or text containing information about an issue. "
        "Your task is to extract the necessary details and generate a **GitHub issue title and description** in the exact format below:\n\n"
        "**Title:**\n[Provide a concise and relevant title for the issue]\n\n"
        "**Description:**\n[Provide a clear and structured description of the issue]\n\n"
        "Strictly follow this format and do not include any analysis or additional information.\n"
        "-----------------------------\n"
        "Input Summary/Text:\n{summary}"
    ),
    input_variables=["summary"]  # ✅ Expecting only a summary or text input
    )
    prompt_chain = build_prompt_chain([
    {"role": "user", "content": prompt_template.format(summary=issue_text)}
    ])
    ai_response = generate_ai_response(prompt_chain)
    title_match = re.search(r"\*\*Title:\*\* (.+)", ai_response)
    title = title_match.group(1).strip() if title_match else "Title not found"

    # Extract Description
    description_match = re.search(r"\*\*Description:\*\*\s+(.+)", ai_response, re.DOTALL)
    description = description_match.group(1).strip() if description_match else "Description not found"
    return title,description

def create_issue_github(github_user,github_repo,github_token, title, description):
    url = f"https://api.github.com/repos/{github_user}/{github_repo}/issues"
    headers = {
        "Authorization": f"Bearer {github_token}",
        "Accept": "application/vnd.github.v3+json"
    }
    data = {
        "title": title,
        "body": description
    }

    response = requests.post(url, json=data, headers=headers)

    if response.status_code == 201:
        issue_url = response.json().get("html_url")
        return jsonify({"response":f"✅ Issue created successfully: {issue_url}", "status_code":response.status_code})
    else:
        return jsonify({"response":f"❌ Failed to create issue: {response.status_code} - {response.text}","status_code":response.status_code})
# Run Flask App
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8089, debug=True)
