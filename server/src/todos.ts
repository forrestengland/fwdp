import { Router } from 'express';
import { Pool } from 'pg';
import { authenticateToken, AuthenticatedRequest } from './authenticateToken';

const router = Router();
