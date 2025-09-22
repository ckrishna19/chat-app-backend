import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async ({ to, subject, text }) => {
  try {
    const msg = {
      to,
      from: process.env.AUTH_EMAIL, // verified sender
      subject,
      text,
    };

    await sgMail.send(msg);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    if (error.response) {
      console.error(error.response.body);
    }
  }
};
export default sendMail;
// host: "smtp.gmail.com",
// port: 587,
// secure: false,
// auth: {
//   user: process.env.AUTH_EMAIL,
//   pass: process.env.AUTH_PASSWORD,
// },
