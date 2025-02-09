const express = require('express')
const userAuth = require('../middleware/userAuth')
const User = require('../models/User.model');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const sanitize = require('mongo-sanitize');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const router = express.Router()

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
    const allowedUpdates = ['firstName', 'lastName' ,'email', 'password', 'jenkinsUrl', 'jenkinsToken','sonarURL','sonarToken','githubURL','githubToken']; // Define allowed fields
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
            job_name: req.body.jobName
        });
    
        console.log("Logs:", response.data.logs);
        console.log("AI Analysis:", response.data.analysis);
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
module.exports = router