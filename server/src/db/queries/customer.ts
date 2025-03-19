import { db } from '../knex';
import { LeaderboardCustomer } from '../../types';

/**
 * 1) Gets the top 10 customers with positive profit, sorted by profit in descending order.
 * 2) Can be filtered by a single country (multiple country filtering available in the extended version).
 * 3) Returns properly formatted data matching the LeaderboardCustomer interface.
 */
export async function getLeaderboard(country?: string | string[]): Promise<LeaderboardCustomer[]> {
    // Base query with all calculations happening at database level
    let query = db('customer')
        .select(
            'customer.id',
            'customer.first_name',
            'customer.last_name',
            'customer.country',
            // STEP 1) count total completed bets
            // explanation: this counts only bets that have been completed (WON or LOST)
            db.raw('COUNT(CASE WHEN bet.status IN (\'WON\', \'LOST\') THEN 1 END) as total_bets'),
            // STEP 2) calculate win percentage
            // explanation: this calculates the percentage of bets that were won out of all completed bets.
            // it multiplies the count of WON bets by 100 and divides by the total count of completed bets.
            db.raw(`
                ROUND(
                    COUNT(CASE WHEN bet.status = 'WON' THEN 1 END) * 100.0 /
                    NULLIF(COUNT(CASE WHEN bet.status IN ('WON', 'LOST') THEN 1 END), 0)
                ) as win_percentage`),
            // STEP 3) calculate profit
            // explanation: this calculates the profit by summing the net wins from WON bets and subtracting the stakes of LOST bets.
            // net win for a WON bet is calculated as (stake * odds) - stake.
            db.raw(`
                SUM(CASE WHEN bet.status = 'WON' THEN (bet.stake * bet.odds) - bet.stake ELSE 0 END) -
                SUM(CASE WHEN bet.status = 'LOST' THEN bet.stake ELSE 0 END) as profit
            `)
        )
        .leftJoin('bet', 'customer.id', 'bet.customer_id')
        .groupBy('customer.id', 'customer.first_name', 'customer.last_name', 'customer.country')
        // STEP 4) filter customers with positive profit
        // explanation: this ensures only customers with a positive profit are included
        .having(db.raw('SUM(CASE WHEN bet.status = \'WON\' THEN (bet.stake * bet.odds) - bet.stake ELSE 0 END) - ' +
                      'SUM(CASE WHEN bet.status = \'LOST\' THEN bet.stake ELSE 0 END) > 0'))
        // STEP 5) order by profit descending
        // explanation: this orders the results so that customers with the highest profit appear first
        .orderBy('profit', 'desc')
        // STEP 6) limit to top 10
        // explanation: this limits the number of customers returned to the top 10 based on profit
        .limit(10);

    // STEP 7) apply country filter if provided
    // note: multiple country filtering is available in the "advanced", "pretty" version of the app
    if (country) {
        if (Array.isArray(country)) {
            query = query.whereIn('customer.country', country);
        } else if (country !== 'ALL') {
            query = query.where('customer.country', country);
        }
    }

    // execute query and format results
    const results = await query;

    // format results to match LeaderboardCustomer interface
    return results.map(row => ({
        id: row.id,
        first_name: row.first_name,
        last_name: row.last_name,
        country: row.country,
        total_bets: parseInt(row.total_bets) || 0,
        win_percentage: parseInt(row.win_percentage) || 0,
        profit: parseFloat(row.profit) || 0
    }));
}

// Keep the simple getCustomers query for the optional customer list
export const getCustomers = () => db('customer').select('*');