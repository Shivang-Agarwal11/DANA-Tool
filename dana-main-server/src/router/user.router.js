const express = require('express')
const userAuth = require('../middleware/userAuth')
const User = require('../models/User.model');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const sanitize = require('mongo-sanitize');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const router = express.Router();
const { fetchGitHubData, isBranchActive } = require('../utils/fetchGithubStats');
const decryptTokens = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};

const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 5 minutes
    max: 20, // 5 attempts
    message: {
        status: {
            code: 429,
            message: 'Too many login attempts. Please try again later in 15 minutes.'
        },
        data: {}
    }
});

const validateUserInput = [
    body('email').isEmail().normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/),
    body('contactNumber').isInt({ min: 6000000000, max: 9999999999 }),
    body('username').isLength({ min: 3 }).trim().escape(),
    body('name').trim().escape(),
    body('address').trim().escape()
];


router.post('/', loginLimiter, async (req, res) => {
    console.log("In Register User");
    const sanitizedData = sanitize(req.body)
    const user = new User(sanitizedData);
    try {
        await user.save();
        console.log(user);
        const token = await user.generateAuthToken();
        return res.status(201).send({
            status: {
                code: 201,
                message: 'User created successfully'
            },
            data: {
                user,
                token,

            }
        })
    } catch (error) {
        console.log(error);
        if (error['errorResponse'] != undefined) {
            if (error['errorResponse']['keyPattern'] != undefined) {
                if (JSON.stringify(error['errorResponse']['keyPattern']).includes('username')) {
                    error = "Username should be unique";
                }
                else if (JSON.stringify(error['errorResponse']['keyPattern']).includes('mail')) {
                    error = "Email already registered";
                }
            }
        }
        else if (error['errors'] != undefined && error['name'] !== undefined && error['name'].includes('Validation') !== undefined) {
            error = error['message']
        }
        return res.status(400).send({
            status: {
                code: 400,
                message: 'Bad Request, probably format of input doesn\'t matches with prescribed format',
            },
            data: {
                error: error
            }
        })
    }
});


router.post('/login', loginLimiter, async (req, res) => {
    console.log("In Login User");
    try {
        const username = req.body.username;
        const password = req.body.password;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        const user = await User.findByCredentials(username, password)
        const token = await user.generateAuthToken()
        res.status(200).send({
            status: {
                code: 200,
                message: 'User logged-in successfully'
            },
            data: {
                user,
                token
            }
        })
    } catch (error) {
        if (error.message === 'UserNotExist') {
            return res.status(404).send({
                status: {
                    code: 404,
                    message: 'Either username is incorrect or user not registered'
                },
                data: {}
            })
        } else if (error.message === 'PasswordNotMatch') {
            return res.status(403).send({
                status: {
                    code: 403,
                    message: 'Password didn\'t matched'
                },
                data: {}
            })
        }
        res.status(400).send({
            status: {
                code: 400,
                message: 'Bad request'
            },
            data: {}
        })
    }
});

router.post('/logout', loginLimiter, userAuth, async (req, res) => {
    console.log("In Logout User");
    const user = req.user
    try {
        user.tokens = []
        await user.save()
        res.status(200).send({
            status: {
                code: 204,
                message: 'User logged-out from all systems'
            },
            data: {}
        })
    } catch (error) {
        res.status(500).send({
            status: {
                code: 500,
                message: 'Internal server error occured'
            },
            data: {}
        })
    }
});

router.put('/', userAuth, loginLimiter, async (req, res) => {
    console.log("In Update User");
    const allowedUpdates = ['firstName', 'lastName' ,'email','username', 'password', 'jenkinsUrl', 'jenkinsToken','sonarURL','sonarToken','githubURL','githubToken','githubUser']; // Define allowed fields
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every(update => allowedUpdates.includes(update)); // Validate fields
    const user = req.user;

    if (!isValidUpdate) {
        return res.status(400).send({
            status: {
                code: 400,
                message: 'Invalid fields for update'
            },
            data: {}
        });
    }

    try {
        // Apply updates to the user object
        updates.forEach(update => user[update] = req.body[update]);

        await user.save(); // Save the updated user document

        res.status(200).send({
            status: {
                code: 200,
                message: 'User record updated successfully'
            },
            data: {
                user
            }
        });
    } catch (error) {
        // Handle specific errors, e.g., database validation or others
        if (error.name === 'ValidationError') {
            return res.status(400).send({
                status: {
                    code: 400,
                    message: 'Validation error occurred',
                },
                data: {
                    error: error.message
                }
            });
        }

        res.status(500).send({
            status: {
                code: 500,
                message: 'Internal server error occurred'
            },
            data: {}
        });
    }
});



router.delete('/', loginLimiter, userAuth, async (req, res) => {
    console.log("In Delete User");
    const user = req.user
    try {
        // Delete the user document
        const result = await User.deleteOne({ _id: user._id });

        if (result.deletedCount === 0) {
            return res.status(404).send({
                status: {
                    code: 404,
                    message: 'User not found'
                },
                data: {}
            });
        }

        res.status(200).send({
            status: {
                code: 200,
                message: 'User deleted successfully'
            },
            data: {}
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send({
            status: {
                code: 500,
                message: 'Internal server error occurred'
            },
            data: {
                error: error.message
            }
        });
    }
});

router.get("/analyze/pipeline", userAuth,async (req, res) => {
    try {
        const response = await axios.post('http://localhost:8089/analyze', {
            jenkins_url: "http://localhost:8080",
            username: req.user.jenkinsUser,
            api_token: decryptTokens(req.user.jenkinsToken),
            job_name: req.body.jobName,
            buildNumber: req.body.buildNumber===undefined?'latest':req.body.buildNumber,
        });
    
        console.log(req.body.buildNumber)
        res.status(200).json(response.data.analysis);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get("/jenkins/chat", userAuth,async (req, res) => {
    try {
        const response = await axios.post('http://localhost:8089/chat', {
            message: "How do I optimize my Jenkins pipeline?",
            message_log: []
        });
        res.status(200).json(response.data);
        console.log("AI Response:", response);
    } catch (error) {
        console.error("Error:", error.response.data);
        res.status(500).json({ error: error.message });
    }
});
router.get("/github/stats", userAuth, async (req, res) => {
    try {
        const GITHUB_TOKEN = decryptTokens(req.user.githubToken);
        const GITHUB_OWNER = req.user.githubUser;
        const GITHUB_REPO = req.user.githubURL;

        // Fetch all stats concurrently
        const [openPRs, closedPRs, openIssues, closedIssues, branches] = await Promise.all([
            fetchGitHubData(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls?state=open`, GITHUB_TOKEN),
            fetchGitHubData(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls?state=closed`, GITHUB_TOKEN),
            fetchGitHubData(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?state=open`, GITHUB_TOKEN),
            fetchGitHubData(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?state=closed`, GITHUB_TOKEN),
            fetchGitHubData(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/branches`, GITHUB_TOKEN),
        ]);

        // Process branch activity
        let activeBranches = 0;
        let inactiveBranches = 0;
        let branchActivity = [];

        if (branches) {
            const branchStatuses = await Promise.all(
                branches.map(async (branch) => {
                    const isActive = await isBranchActive(branch.name, GITHUB_OWNER, GITHUB_REPO, GITHUB_TOKEN);
                    return { name: branch.name, active: isActive };
                })
            );

            activeBranches = branchStatuses.filter(b => b.active).length;
            inactiveBranches = branchStatuses.filter(b => !b.active).length;
            branchActivity = branchStatuses;
        }

        const stats = {
            pullRequests: {
                open: openPRs ? openPRs.length : 0,
                closed: closedPRs ? closedPRs.length : 0,
            },
            issues: {
                open: openIssues ? openIssues.length : 0,
                closed: closedIssues ? closedIssues.length : 0,
            },
            branches: {
                total: branches ? branches.length : 0,
                active: activeBranches,
                inactive: inactiveBranches,
                activity: branchActivity, // List of branch activity
            },
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error("Error fetching GitHub stats:", error.message);
        res.status(500).json({ error: "Failed to fetch GitHub stats" });
    }
});

router.get("/github/commits",userAuth, async (req, res) => {
    try {
        const GITHUB_TOKEN = decryptTokens(req.user.githubToken);
        const GITHUB_OWNER = req.user.githubUser;
        const GITHUB_REPO = req.user.githubURL;
        const commits = await fetchGitHubData(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits`,GITHUB_TOKEN);

        if (!commits) return res.status(500).json({ error: "Failed to fetch commits" });

        let totalCommits = commits.length;
        let commitsPerDay = {};
        let contributors = {};
        let commitActivity = [];
        let codeChanges = [];

        commits.forEach(commit => {
            const author = commit.commit.author.name;
            const date = commit.commit.author.date.split("T")[0];

            // Count commits per day
            commitsPerDay[date] = (commitsPerDay[date] || 0) + 1;

            // Count commits per contributor
            contributors[author] = (contributors[author] || 0) + 1;

            // Log commit activity
            commitActivity.push({ author, date, commits: 1 });

            // Additions & deletions (if available)
            if (commit.stats) {
                codeChanges.push({
                    date,
                    additions: commit.stats.additions,
                    deletions: commit.stats.deletions
                });
            }
        });

        // Prepare response
        const stats = {
            totalCommits,
            commitsPerDay,
            topContributors: contributors,
            commitActivity,
            codeChanges
        };

        res.status(200).json(stats);
    } catch (error) {
        console.error("Error fetching GitHub commits:", error.message);
        res.status(500).json({ error: "Failed to fetch commit stats" });
    }
});

router.get('/jenkins/jobs', userAuth, async (req, res) => {
    try{
        const auth = {
            auth: {
              username: req.user.jenkinsUser,
              password: decryptTokens(req.user.jenkinsToken)
            },
          };
        JENKINS_URL = req.user.jenkinsUrl;
        const response = await axios.get(`${JENKINS_URL}/api/json?tree=jobs[name]`, auth);
        res.status(200).json(response.data);
    }  catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.post('/jenkins/build/last', userAuth, async (req, res) => {
    try {
        // console.log(req)
        const auth = {
            auth: {
              username: req.user.jenkinsUser,
              password: decryptTokens(req.user.jenkinsToken)
            },
          };
        JENKINS_URL = req.user.jenkinsUrl;
        JOB_NAME = req.body.jobName;
        const response = await axios.get(`${JENKINS_URL}/job/${JOB_NAME}/lastBuild/api/json`, auth);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/jenkins/build/history', userAuth, async (req, res) => {
    try {
        const auth = {
            auth: {
              username: req.user.jenkinsUser,
              password: decryptTokens(req.user.jenkinsToken)
            },
          };
        JENKINS_URL = req.user.jenkinsUrl;
        JOB_NAME = req.body.jobName;
        const response = await axios.get(
            `${JENKINS_URL}/job/${JOB_NAME}/api/json?tree=builds[number,status,result,duration,timestamp]`,
            auth
          );
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/jenkins/queue', userAuth, async (req, res) => {
    try {
        const auth = {
            auth: {
              username: req.user.jenkinsUser,
              password: decryptTokens(req.user.jenkinsToken)
            },
          };
        JENKINS_URL = req.user.jenkinsUrl;
        const response = await axios.get(`${JENKINS_URL}/queue/api/json`, auth);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/jenkins/logs', userAuth, async (req, res) => {
    try {
        const auth = {
            auth: {
              username: req.user.jenkinsUser,
              password: decryptTokens(req.user.jenkinsToken)
            },
          };
        JENKINS_URL = req.user.jenkinsUrl;
        JOB_NAME = req.body.jobName;
        BUILD_NUMBER = req.body.buildNumber;
        const response = await axios.get(`${JENKINS_URL}/job/${JOB_NAME}/${BUILD_NUMBER}/consoleText`, auth);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
module.exports = router