import nodemailer from "nodemailer";

const sendMail = async (options) => {
  const transport = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    auth: {
      user: "apikey", // literally "apikey"
      pass: process.env.SENDGRID_API_KEY,
    },
  });

  await transport.sendMail({
    from: process.env.AUTH_EMAIL,
    to: options.email,
    subject: options.subject,
    text: options.text,
  });
};

export default sendMail;
// host: "smtp.gmail.com",
// port: 587,
// secure: false,
// auth: {
//   user: process.env.AUTH_EMAIL,
//   pass: process.env.AUTH_PASSWORD,
// },
