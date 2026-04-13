require('dotenv').config();
const nodemailer = require('nodemailer');

console.log("Email User: ", process.env.EMAIL_USER);
console.log("Email Pass: ", process.env.EMAIL_PASS ? "****" + process.env.EMAIL_PASS.slice(-4) : "MISSING");

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.error("Nodemailer Verify Error: ", error);
    } else {
        console.log("Nodemailer Verify Success: Server is ready to take our messages");
    }
});
