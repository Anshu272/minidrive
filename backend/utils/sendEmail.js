import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Gmail uses SSL on 465
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // MUST be an App Password
      },
    });

    // Verify connection configuration before sending
    await transporter.verify();

    const info = await transporter.sendMail({
      from: `"MiniDrive Support" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Nodemailer Error:", error);
    // Rethrow so the controller knows it failed
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;