# DANA Tool - DevOps Automation, No-Code/Low-Code & Agentic AI Tool
[![GitHub stars](https://img.shields.io/github/stars/Shivang-Agarwal11/DANA-Tool)](https://github.com/Shivang-Agarwal11/DANA-Tool/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/Shivang-Agarwal11/DANA-Tool)](https://github.com/Shivang-Agarwal11/DANA-Tool/network/members)
[![GitHub issues](https://img.shields.io/github/issues/Shivang-Agarwal11/DANA-Tool)](https://github.com/Shivang-Agarwal11/DANA-Tool/issues)

![Repo Views](https://img.shields.io/github/watchers/Shivang-Agarwal11/DANA-Tool?style=social)
![GitHub repo size](https://img.shields.io/github/repo-size/Shivang-Agarwal11/DANA-Tool)
![GitHub last commit](https://img.shields.io/github/last-commit/Shivang-Agarwal11/DANA-Tool)
![GitHub all releases](https://img.shields.io/github/downloads/Shivang-Agarwal11/DANA-Tool/total)

DANA is an AI-Powered CI/CD Management Platform that integrates agentic AI for intelligent automation, real-time observability, and low-code pipeline configuration.


## 🌟 Overview

In the field of DevOps Automation, CI/CD Optimization, and Agentic AI, DANA aims to enhance CI/CD pipeline observability, automate troubleshooting, and simplify pipeline creation using *low-code/no-code* solutions.

Many enterprises struggle with complex CI/CD configurations, pipeline failures, and inefficient monitoring, leading to deployment bottlenecks, higher costs, and developer frustration. DANA addresses these challenges by providing an integrated solution for managing and optimizing your DevOps pipeline.

## ✨ Features

- **Monitor and Visualize CI/CD Pipelines**: Dynamic, real-time insights on failures, build performance, and security compliance
- **Automate Failure Detection and Resolution**: Using AI agents trained on historical pipeline errors
- **Low-Code/No-Code Pipeline Creation**: Configure builds and deployments without writing complex scripts
- **Integration with Popular DevOps Tools**:
  - Jenkins for CI/CD pipeline monitoring
  - GitHub for repository management
  - SonarQube for code quality metrics

## 🏗️ Architecture

DANA consists of three main components:

1. **dana-main-server**: Backend Node.js server with MongoDB integration
2. **dana-ui**: Frontend UI application
3. **AgenticAI**: AI agents for Jenkins pipeline analysis and automation and for github automation for creating issues and analyzing PR's.

## 🚀 Installation

### Prerequisites

- Node.js (for the backend and frontend)
- MongoDB
- Python with virtual environment support
- Ollama
- DeepSeek 1.5 r

### Setting up the Backend (dana-main-server)

1. Clone the repository:
   ```bash
   git clone https://github.com/Shivang-Agarwal11/DANA-Tool.git
   cd DANA-Tool/dana-main-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file with your MongoDB credentials

4. Start the server:
   ```bash
   npm run dev
   ```

### Setting up the Frontend (dana-ui)

1. Navigate to the dana-ui directory:
   ```bash
   cd ../dana-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the UI:
   ```bash
   npm start
   ```

### Setting up the AI Agent (AgenticAI-Jenkins)

1. Navigate to the AgenticAI directory:
   ```bash
   cd ../AgenticAI-Jenkins
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

4. Install Ollama and DeepSeek 1.5 r

5. Run the agent:
   ```bash
   python app.py
   ```

## 📊 API Documentation

DANA provides a comprehensive REST API for interacting with various DevOps tools. The main endpoints include:

### User Management
- `POST /`: Create a new user account
- `GET /`: Get authenticated user details
- `PUT /`: Update user details
- `DELETE /`: Delete user account
- `POST /login`: Authenticate user and get access token

### Jenkins Integration
- `GET /jenkins/jobs`: List all Jenkins jobs
- `GET /jenkins/build/history`: Get build history for a specific job
- `GET /jenkins/queue`: View builds in the Jenkins queue
- `GET /jenkins/logs`: Retrieve logs for a specific build
- `POST /jenkins/build/last`: Get statistics for the last build of a job
- `POST /jenkins/build/steps`: Get step information for a specific build
- `GET /jenkins/chat`: Chat with the Jenkins AI assistant

### Pipeline Analysis
- `GET /analyze/pipeline`: Analyze Jenkins pipeline logs

### GitHub Integration
- `GET /github/commits`: Get commits from a configured repository

### SonarQube Integration
- `GET /sonarqube/stats`: Get SonarQube statistics for a project

## 🛠️ Use Cases

- **DevOps Engineers**: Streamline CI/CD management, automate troubleshooting, and optimize build pipelines
- **Development Teams**: Reduce time spent on pipeline configuration and debugging
- **Project Managers**: Get insights into build performance and deployment bottlenecks
- **Security Teams**: Monitor compliance and security checks throughout the CI/CD process

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Jenkins](https://www.jenkins.io/)
- [GitHub](https://github.com/)
- [SonarQube](https://www.sonarqube.org/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
