const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const userAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '') || req.body.token;
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Check for token expiration
        const currentTime = Date.now();
        const tokenStartTime = decoded.startDate;
        const expirationTime = 60 * 60 * 1000; // 60 minutes in milliseconds
        
        if (currentTime - tokenStartTime > expirationTime) {
            console.log('Token expired. Please log in again.');
            user.tokens = user.tokens.filter((token1) => {
                return token1.token !== token
            });
            await user.save()
            return res.status(401).send({
                status: {
                    code: 401,
                    message: 'Token expired. Please log in again.'
                },
                data: {}
            });
        }

        // Find user with the token
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });
        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).send({
            status: {
                code: 401,
                message: 'Unauthorized access'
            },
            data: {}
        });
    }
};

module.exports = userAuth;