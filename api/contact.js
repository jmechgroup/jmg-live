// 1. Use 'require' instead of 'import' (Compatibiltiy Fix)
const nodemailer = require('nodemailer');

// 2. Use 'module.exports' instead of 'export default'
module.exports = async (req, res) => {
  
  // A. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST allowed' });
  }

  const { name, email, message } = req.body;

  // B. Validate Fields
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // C. Setup Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER, // Matches Vercel Environment Variable
      pass: process.env.GMAIL_PASS, // Matches Vercel Environment Variable
    },
  });

  try {
    // D. Send Email
    await transporter.sendMail({
      from: `"Website Inquiry" <${process.env.GMAIL_USER}>`, // Sender must be YOU (Gmail rule)
      to: 'jmechgroup@gmail.com',   // Where you receive the email
      replyTo: email,               // <--- IMPORTANT: Lets you click "Reply" to answer the customer
      subject: `New Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd;">
            <h2>New Contact Message</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <br>
            <p><strong>Message:</strong></p>
            <p style="background: #f9f9f9; padding: 15px;">${message.replace(/\n/g, '<br>')}</p>
        </div>
      `,
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Email Error:", error);
    return res.status(500).json({ error: error.message });
  }
};
