import nodemailer from "nodemailer";

const sendMail = async (options) => {
  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASSWORD,
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
