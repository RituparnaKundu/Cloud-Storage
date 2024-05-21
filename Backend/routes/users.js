import express from 'express';
import { auth } from '../middleware/auth.js';
import { updateUser, deleteUser, getUser, getUsers } from '../controllers/auth.js';
import { getUserFiles,getUserFile } from '../controllers/file.js';

const router = express.Router();

router.get('/', auth, getUsers);
router.get('/:id',auth, getUser);
router.patch('/:id',auth, updateUser);
router.delete('/:id',auth, deleteUser);
router.get('/:id/files',auth, getUserFiles);
router.get('/:id/files/:id',auth, getUserFile);

export default router;