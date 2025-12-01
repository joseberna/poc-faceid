import { Router } from 'express';
import { getRewards, redeemReward } from '../controllers/reward.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getRewards);
router.post('/:id/redeem', authMiddleware, redeemReward);

export default router;
