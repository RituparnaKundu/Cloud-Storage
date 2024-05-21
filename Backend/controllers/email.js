import { log } from 'console';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rituparnakundu835@gmail.com',
    pass: 'xyrn kjtm vwbq augk'
  }
});

export const sendEmail = async (req, res) => {
  try {
    // Send mail with defined transport object
    const { recipientEmail, downloadLink } = req.body;
    console.log('recipientEmail:', recipientEmail);
    let info = await transporter.sendMail({
      from: 'rituparnakundu835@gmail.com', // Sender address
      to: recipientEmail, // Recipient address
      subject: 'Download Link for File', // Subject line
      text: `Download link: ${downloadLink}` // Plain text body
    }).then((data) => {
      console.log('Email sent:', data);
      res.json({ message: 'Email sent successfully' });
    }).catch((error) => {
      console.error('Error sending email:', error);
      res.status(500).json({ message: 'Error sending email' });
    });
  
   
  } catch (error) {
    console.error('Error sending email:', error);
  }
};
 