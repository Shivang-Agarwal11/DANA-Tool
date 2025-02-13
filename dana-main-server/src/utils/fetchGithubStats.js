import axios from "axios";

export const fetchGitHubData = async (url,GITHUB_TOKEN) => {
    try {
        const response = await axios.get(url, {
            headers: {
                Authorization: `token ${GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3+json",
            },
        });
        return response.data;
    } catch (error) {
        console.error("GitHub API Error:", error.response?.data || error.message);
        return null;
    }
};

export const isBranchActive = async (branch,GITHUB_OWNER,GITHUB_REPO,GITHUB_TOKEN) => {
    const commits = await fetchGitHubData(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits?sha=${branch}`,GITHUB_TOKEN
    );
    if (!commits || commits.length === 0) return false;

    const lastCommitDate = new Date(commits[0].commit.committer.date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return lastCommitDate >= thirtyDaysAgo;
};