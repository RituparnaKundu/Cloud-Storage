import express from 'express';
import { auth } from '../middleware/auth.js'
import { uploadFile, downloadFile , deleteFile, updateFile, getFile} from '../controllers/file.js';

const router = express.Router();

router.post('/upload', auth, uploadFile);
router.get('/download/:id', auth, downloadFile);
router.patch('/update/:id',updateFile);
router.get('/get/:id', getFile);
router.delete('/delete/:id', auth, deleteFile);

export default router;