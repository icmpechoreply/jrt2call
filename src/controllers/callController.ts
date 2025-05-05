import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import axios from 'axios';

// Initialize axios instance for NetSapiens API
const netsapiensApi = axios.create({
  baseURL: process.env.NETSAPIENS_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add subscriber token to requests
netsapiensApi.interceptors.request.use((config) => {
  config.headers['Authorization'] = `Bearer ${process.env.NETSAPIENS_SUBSCRIBER_TOKEN}`;
  return config;
});

export const initiateCall = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phoneNumber, callerId } = req.body;

    logger.info({
      message: 'Initiating call',
      phoneNumber: phoneNumber.slice(-4), // Log only last 4 digits for HIPAA compliance
      userId: req.user?.id
    });

    const response = await netsapiensApi.post('/calls', {
      to: phoneNumber,
      from: callerId,
      callbackUrl: `${process.env.API_GATEWAY_URL}/api/calls/callback`
    });

    res.status(201).json({
      status: 'success',
      data: {
        callId: response.data.callId,
        status: response.data.status
      }
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      logger.error({
        message: 'NetSapiens API error',
        error: error.response?.data,
        status: error.response?.status
      });
      throw new AppError('Failed to initiate call', error.response?.status || 500);
    }
    next(error);
  }
};

export const endCall = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { callId } = req.params;

    logger.info({
      message: 'Ending call',
      callId,
      userId: req.user?.id
    });

    await netsapiensApi.post(`/calls/${callId}/end`);

    res.status(200).json({
      status: 'success',
      message: 'Call ended successfully'
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new AppError('Failed to end call', error.response?.status || 500);
    }
    next(error);
  }
};

export const sendDTMF = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { callId } = req.params;
    const { digit } = req.body;

    logger.info({
      message: 'Sending DTMF',
      callId,
      userId: req.user?.id
    });

    await netsapiensApi.post(`/calls/${callId}/dtmf`, {
      digits: digit
    });

    res.status(200).json({
      status: 'success',
      message: 'DTMF sent successfully'
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new AppError('Failed to send DTMF', error.response?.status || 500);
    }
    next(error);
  }
};

export const getCallStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { callId } = req.params;

    logger.info({
      message: 'Fetching call status',
      callId,
      userId: req.user?.id
    });

    const response = await netsapiensApi.get(`/calls/${callId}`);

    res.status(200).json({
      status: 'success',
      data: {
        callId: response.data.callId,
        status: response.data.status,
        duration: response.data.duration,
        startTime: response.data.startTime,
        endTime: response.data.endTime
      }
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new AppError('Failed to get call status', error.response?.status || 500);
    }
    next(error);
  }
}; 