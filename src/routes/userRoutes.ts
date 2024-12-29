import { Router } from 'express';
import { UserController } from '../controllers/userController';
import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import { Request } from 'express';

const router = Router();

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    cb(null, process.env.CSV_UPLOAD_PATH || './uploads');
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype === 'text/csv' || path.extname(file.originalname).toLowerCase() === '.csv') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'));
  }
};

const upload = multer({ 
  storage,
  fileFilter
});

router.post('/upload', upload.single('csv'), UserController.uploadCSV);

export default router;