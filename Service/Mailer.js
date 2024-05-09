const nodemailer = require('nodemailer');

const dotenv = require('dotenv');

dotenv.config({path: '../Config/Config.env'});

const sendMail = async (emailData) =>{
    try {
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port:465,
            auth:{
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        let info = await transporter.sendMail({
            from: 'Hey 👻 <info@quicksolve.tech>',
            to: emailData.recipient,
            subject: emailData.subject,
            text: emailData.text,
            html: emailData.html,
        });

        console.log('Message sent successfully', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending mail', error);
        throw error;
    }
};

module.exports = sendMail;