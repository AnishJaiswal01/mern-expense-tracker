import express from 'express';
import multer from 'multer';
import protect from '../middleware/auth.js';
import { scanBill } from '../controllers/billScanController.js';

const router = express.Router();

// Store file in memory (buffer) — no disk writes needed
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

router.use(protect);

// POST /api/bill-scan
router.post('/', upload.single('bill'), scanBill);

export default router;
