import { Router } from 'express';
import { getCustomers, getLeaderboard } from './db/queries/customer';

export const router = Router();

router.get('/customers', async (req, res) => {
    const customers = await getCustomers();
    res.json(customers);
});

router.get('/leaderboard', async (req, res) => {
    try {
        const country = req.query.country as string | undefined;
        const leaderboard = await getLeaderboard(country);
        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
