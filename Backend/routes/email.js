import express from 'express';
import { sendEmail } from '../controllers/email.js';
const router = express.Router();


// Route for sending the file download link via email
router.post('/send', sendEmail);

export default router;