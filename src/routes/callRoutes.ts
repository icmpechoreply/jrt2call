import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validateRequest';
import { authenticateToken } from '../middleware/auth';
import { 
  initiateCall,
  endCall,
  sendDTMF,
  getCallStatus
} from '../controllers/callController';

const router = Router();

// Validation middleware
const callValidation = [
  body('phoneNumber')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format. Must be E.164 format'),
  body('callerId')
    .optional()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid caller ID format'),
  validateRequest
];

const dtmfValidation = [
  body('digit')
    .matches(/^[0-9A-D#*]$/)
    .withMessage('Invalid DTMF digit'),
  validateRequest
];

// Protected routes
router.use(authenticateToken);

// Call routes
router.post('/initiate', callValidation, initiateCall);
router.post('/end/:callId', endCall);
router.post('/dtmf/:callId', dtmfValidation, sendDTMF);
router.get('/status/:callId', getCallStatus);

export const callRoutes = router; 