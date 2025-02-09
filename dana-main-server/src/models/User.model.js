const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator=require('validator');

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
                throw new Error('Invalid email address');
            }
        }
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
         type: String,
        required: true,
        trim: true,
        minlength: 8,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"');
            }
        }
    },
    jenkinsUrl: {
        type: String,
        required: false,
        trim: true
    },
    jenkinsUser:{
        type: String,
        required: false,
        trim: true
    },
    jenkinsToken: {
        type: String,
        required: false
    },
    sonarURL: {
        type: String,
        required: false,
        trim: true
    },
    sonarUser:{
        type: String,
        required: false,
        trim: true
    },
    sonarToken: {
        type: String,
        required: false
    },
    githubURL: {
        type: String,
        required: false,
        trim: true
    },
    githubUser:{
        type: String,
        required: false,
        trim: true
    } ,
    githubToken: {
        type: String,
        required: false
    },
    tokens: [{
        token: {
            type: String
        }
    }]
});

// Method to generate authentication token
userSchema.methods.generateAuthToken = async function() {
    const user = this;
    const startDate = Date.now(); // Current timestamp
    const token = jwt.sign(
        { 
            _id: user._id.toString(), 
            startDate 
        }, 
        process.env.JWT_SECRET
    );
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

// Method to clean the data returned
userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();
    delete userObject.__v;
    delete userObject.jenkinsToken;
    delete userObject.sonarToken;
    delete userObject.githubToken;
    delete userObject.tokens;
    return userObject;
};

// Static method to find user by credentials (email or username)
userSchema.statics.findByCredentials=async (username, password)=>{
    const user=await User.findOne({username})
    if (!user) {
        throw new Error('UserNotExist')
    }
    const isMatch=await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('PasswordNotMatch')
    }
    return user
};

userSchema.pre('save', async function (next) {
    const user=this
    if (user.isModified('password')) {
        user.password=await bcrypt.hash(user.password, 10)
    }
    if (user.isModified('jenkinsToken')) {
        const jenkinsToken = jwt.sign(user.jenkinsToken, process.env.JWT_SECRET);
        user.jenkinsToken = jenkinsToken;
    }
    if (user.isModified('sonarToken')) {
        const sonarToken = jwt.sign(user.sonarToken, process.env.JWT_SECRET);
        user.sonarToken = sonarToken;
    }
    if (user.isModified('githubToken')) {
        const githubToken = jwt.sign(user.githubToken, process.env.JWT_SECRET);
        user.githubToken = githubToken;
    }
    next();
});

const User = mongoose.model('Developer', userSchema);

module.exports = User;
