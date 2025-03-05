import axios from "axios";

export async function fetchSonarQubeStats(SONARQUBE_URL, SONARQUBE_TOKEN, PROJECT_KEY) {
    try {
        const axiosInstance = axios.create({
            baseURL: SONARQUBE_URL,
            headers: {
                Authorization: `Basic ${Buffer.from(`${SONARQUBE_TOKEN}:`).toString("base64")}`,
            },
        });

        // Fetch project measures (extended metrics)
        const measures = await axiosInstance.get(`/api/measures/component`, {
            params: {
                component: PROJECT_KEY,
                metricKeys: "bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,ncloc,functions,complexity,violations,security_hotspots",
            },
        });

        // Fetch quality gate status
        const qualityGate = await axiosInstance.get(`/api/qualitygates/project_status`, {
            params: { projectKey: PROJECT_KEY },
        });

        // Fetch issues (bugs, vulnerabilities, code smells)
        const issues = await axiosInstance.get(`/api/issues/search`, {
            params: {
                componentKeys: PROJECT_KEY,
                types: "BUG,VULNERABILITY,CODE_SMELL",
                pageSize: 100,
            },
        });

        // Fetch analysis history
        const analysisHistory = await axiosInstance.get(`/api/project_analyses/search`, {
            params: { project: PROJECT_KEY },
        });

        // Fetch coding rule violations
        const rules = await axiosInstance.get(`/api/rules/search`, {
            params: { languages: "java" }, // Modify as per your project language
        });

        // Fetch security hotspots
        const securityHotspots = await axiosInstance.get(`/api/hotspots/search`, {
            params: { projectKey: PROJECT_KEY },
        });

        // Structuring response
        return {
            project: PROJECT_KEY,
            measures: measures.data.component.measures.map(m => ({
                metric: m.metric,
                value: m.value,
            })),
            qualityGateStatus: qualityGate.data.projectStatus.status,
            issues: issues.data.issues.map(issue => ({
                key: issue.key,
                message: issue.message,
                severity: issue.severity,
                type: issue.type,
            })),
            analysisHistory: analysisHistory.data.analyses.map(a => ({
                date: a.date,
                key: a.key,
            })),
            rules: rules.data.rules.map(rule => ({
                key: rule.key,
                name: rule.name,
                severity: rule.severity,
            })),
            securityHotspots: securityHotspots.data.hotspots.map(hotspot => ({
                message: hotspot.message,
                severity: hotspot.severity,
                status: hotspot.status,
            })),
        };

    } catch (error) {
        console.error(`❌ Error fetching SonarQube data:`, error.response?.data || error.message);
        throw new Error(`Failed to fetch SonarQube data: ${error.message}`);
    }
}
