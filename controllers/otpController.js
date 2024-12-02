const otpModel = require('../models/otpModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const emailTemplate = require('../views/emailTemplate');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function requestOtp(req, res) {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send('Email is required');
    }

    try {
        const exists = await otpModel.emailExists(email);

        if (exists) {
            const otp = crypto.randomInt(100000, 999999).toString();
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

            await otpModel.saveOtp(email, otp, expiresAt);

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Your OTP Code',
                html: emailTemplate(otp)
            });

            res.status(200).send('OTP has been sent to your email.');
        } else {
            res.status(404).send('Email not found');
        }
    } catch (err) {
        console.error('An error occurred:', err);
        res.status(500).send('An error occurred');
    }
}


async function verifyOtp(req, res) {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).send('Email and OTP are required');
    }

    try {
        const { isValid, user_Type_ID, user_Code,company_Id,deliveryman_id} = await otpModel.verifyOtp(email, otp);
            console.log("oi",company_Id);
            
        if (isValid) {
            res.status(200).json({
                message: 'OTP verified successfully!',
                user_type: user_Type_ID, // Send the user_type to the frontend
                userID:user_Code,
                company_Id:company_Id,
                deliveryman_id:deliveryman_id
            });
            // Proceed with login logic based on user_type
        } else {
            res.status(400).send('Invalid or expired OTP.');
        }
    } catch (err) {
        console.error('An error occurred:', err);
        res.status(500).send('An error occurred');
    }
}

// module.exports = {
//     verifyOtp
// };


module.exports = {
    requestOtp,
    verifyOtp
};
