require('dotenv').config();
const nodemailer = require('nodemailer');
const emailConfig = require('./emailConfig');

const authUser = emailConfig.EMAIL_USER !== 'REPLACE_WITH_EMAIL' ? emailConfig.EMAIL_USER : process.env.EMAIL_USER;
const authPass = emailConfig.EMAIL_PASS !== 'REPLACE_WITH_PASSWORD' ? emailConfig.EMAIL_PASS : process.env.EMAIL_PASS;

console.log("Email User: ", authUser);
console.log("Email Pass: ", authPass ? "****" + authPass.slice(-4) : "MISSING");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: authUser,
        pass: authPass
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("Nodemailer Verify Error: ", error);
    } else {
        console.log("Nodemailer Verify Success: Server is ready to take our messages");
    }
});
