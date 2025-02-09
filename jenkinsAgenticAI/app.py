# import streamlit as st
# import requests
# from langchain_ollama import ChatOllama
# import re
# from langchain_core.output_parsers import StrOutputParser
# from langchain_core.prompts import (
#     SystemMessagePromptTemplate,
#     HumanMessagePromptTemplate,
#     AIMessagePromptTemplate,
#     ChatPromptTemplate
# )

# # Jenkins Configuration
# JENKINS_URL='http://localhost:8080'
# JENKINS_USER='shivang'
# JENKINS_API_TOKEN='11f588c399c6f81b19aacceb23cf86e19f'

# # Function to fetch Jenkins build logs
# def get_latest_build_logs(job_name):
#     try:
#         job_url = f"{JENKINS_URL}/job/{job_name}/lastBuild/consoleText"

#         response = requests.get(job_url, auth=(JENKINS_USER, JENKINS_API_TOKEN))
#         if response.status_code == 200:
#             result = response.text
#             print(type(result))
#             cleaned_text = re.sub(r'[{}]', '', result)
#             print(cleaned_text)
#             return cleaned_text
#         else:
#             return f"Failed to fetch logs: {response.status_code}"
#     except Exception as e:
#         return str(e)

# # Custom CSS styling
# st.markdown("""
# <style>
#     .main { background-color: #1a1a1a; color: #ffffff; }
#     .sidebar .sidebar-content { background-color: #2d2d2d; }
#     .stTextInput textarea { color: #ffffff !important; }
#     .stSelectbox div[data-baseweb="select"], .stSelectbox option,
#     div[role="listbox"] div { background-color: #2d2d2d !important; color: white !important; }
# </style>
# """, unsafe_allow_html=True)

# st.title("🧠 DeepSeek Code Companion")
# st.caption("🚀 AI-Powered Jenkins Pipeline Analysis & Debugging")

# # Sidebar Configuration
# with st.sidebar:
#     st.header("⚙️ Configuration")
#     selected_model = st.selectbox(
#         "Choose Model",
#         ["deepseek-r1:1.5b", "deepseek-r1:3b"],
#         index=0
#     )
#     st.divider()
#     st.markdown("### Model Capabilities")
#     st.markdown("""
#     - 🐍 Python Expert
#     - 🐞 Debugging Assistant
#     - 📊 Jenkins Pipeline Analysis
#     - 💡 Solution Design
#     """)
#     st.divider()
#     st.markdown("Built with [Ollama](https://ollama.ai/) | [LangChain](https://python.langchain.com/)")

# # Initiate AI engine
# llm_engine = ChatOllama(
#     model=selected_model,
#     base_url="http://localhost:11434",
#     temperature=0.3
# )

# # System Prompt Configuration
# system_prompt = SystemMessagePromptTemplate.from_template(
#     "You are an expert AI for analyzing Jenkins pipeline logs. Provide insights into failures, "
#     "possible fixes, and recommendations for optimizing CI/CD pipelines."
# )

# # Session State Management
# if "message_log" not in st.session_state:
#     st.session_state.message_log = [{"role": "ai", "content": "Hi! I'm DeepSeek. Ask me to analyze a Jenkins pipeline!"}]

# # Chat Container
# chat_container = st.container()
# with chat_container:
#     for message in st.session_state.message_log:
#         with st.chat_message(message["role"]):
#             st.markdown(message["content"])

# # Chat Input
# user_query = st.chat_input("Type your request (e.g., 'Analyze my pipeline: my-job-name')...")

# # Function to Generate AI Response
# def generate_ai_response(prompt_chain):
#     processing_pipeline = prompt_chain | llm_engine | StrOutputParser()
#     return processing_pipeline.invoke({})

# # Function to Build Prompt Chain
# def build_prompt_chain():
#     prompt_sequence = [system_prompt]
#     for msg in st.session_state.message_log:
#         if msg["role"] == "user":
#             prompt_sequence.append(HumanMessagePromptTemplate.from_template(msg["content"]))
#         elif msg["role"] == "ai":
#             prompt_sequence.append(AIMessagePromptTemplate.from_template(msg["content"]))
#     return ChatPromptTemplate.from_messages(prompt_sequence)

# # Process User Query
# if user_query:
#     st.session_state.message_log.append({"role": "user", "content": user_query})

#     # Extract job name if user requests pipeline analysis
#     if user_query.lower().startswith("analyze my pipeline:"):
#         job_name = user_query.split(":", 1)[1].strip()
#         logs = get_latest_build_logs(job_name)
#         print(logs)
#         if "Failed to fetch logs" in logs:
#             ai_response = f"❌ Error: {logs}"
#         else:
#             with st.spinner("🧠 Analyzing Jenkins Logs..."):
#                 prompt_chain = build_prompt_chain()
#                 prompt_chain.messages.append(HumanMessagePromptTemplate.from_template(f"Debug the logs of jenkins given. Find any error if are there any and provide solutions to it:\n\n{logs}"))
#                 ai_response = generate_ai_response(prompt_chain)

#     else:
#         with st.spinner("🧠 Processing..."):
#             prompt_chain = build_prompt_chain()
#             ai_response = generate_ai_response(prompt_chain)

#     # Add AI response to log
#     st.session_state.message_log.append({"role": "ai", "content": ai_response})
    
#     # Rerun to update chat display
#     st.rerun()


from flask import Flask, request, jsonify
import requests
import jwt
from langchain_ollama import ChatOllama
import re
from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import (
    SystemMessagePromptTemplate,
    HumanMessagePromptTemplate,
    AIMessagePromptTemplate,
    ChatPromptTemplate
)

app = Flask(__name__)

# Initialize AI Model
llm_engine = ChatOllama(
    model="deepseek-r1:1.5b",
    base_url="http://localhost:11434",
    temperature=0.3
)

# Function to fetch Jenkins build logs dynamically
def get_latest_build_logs(jenkins_url, username, api_token, job_name,build_number):
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
        SystemMessagePromptTemplate.from_template(
            "You are an expert AI for analyzing Jenkins pipeline logs. Provide insights into failures, "
            "possible fixes, and recommendations for optimizing CI/CD pipelines."
        )
    ]

    for msg in previous_messages:
        if msg["role"] == "user":
            prompt_sequence.append(HumanMessagePromptTemplate.from_template(msg["content"]))
        elif msg["role"] == "ai":
            prompt_sequence.append(AIMessagePromptTemplate.from_template(msg["content"]))

    return ChatPromptTemplate.from_messages(prompt_sequence)


# API Endpoint to fetch and analyze Jenkins logs
@app.route('/analyze', methods=['POST'])
def analyze_logs():
    data = request.json
    jenkins_url = data.get("jenkins_url")
    username = data.get("username")
    api_token = data.get("api_token")
    job_name = data.get("job_name")
    build_number = data.get("buildNumber")
    build_number = build_number if build_number else 'lastBuild'

    if not jenkins_url or not username or not api_token or not job_name:
        return jsonify({"error": "Missing required fields"}), 400

    logs = get_latest_build_logs(jenkins_url, username, api_token, job_name,build_number)
    
    if "Failed to fetch logs" in logs:
        return jsonify({"error": logs}), 500

    prompt_chain = build_prompt_chain([{"role": "user", "content": f"Analyze the following Jenkins logs and respond strictly in the format below:\n\n"
    f"**Reason of failure (If any):**\n[Provide the reason if a failure is detected]\n\n"
    f"**Solution to failure:**\n[Suggest a solution if a failure is found]\n\n"
    f"**Analysis of logs:**\n[Summarize the key insights from the logs]\n\n"
    f"-----------------------------"
    f"Logs:\n{logs}"}])
    
    ai_response = generate_ai_response(prompt_chain)
    
    return jsonify({"logs": logs, "analysis": ai_response})


# API Endpoint for general chatbot conversation
@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    print(data)
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"error": "No message provided"}), 400

    # Maintain message history in request (if any)
    message_log = data.get("message_log", [])

    # Build AI response
    prompt_chain = build_prompt_chain(message_log + [{"role": "user", "content": user_message}])
    ai_response = generate_ai_response(prompt_chain)

    return jsonify({"response": ai_response})


# Run Flask App
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8089, debug=True)
