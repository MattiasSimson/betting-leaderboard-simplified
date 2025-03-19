import React from "react";
import type { LeaderboardCustomer, CustomerCountry } from "./types";

interface LeaderboardProps {
    customers: LeaderboardCustomer[];
    selectedCountry: "ALL" | CustomerCountry;
    onCountryChange: (country: "ALL" | CustomerCountry) => void;
}

function Leaderboard({ customers, selectedCountry, onCountryChange }: LeaderboardProps) {
    // store initial countries list in a ref so it doesn't change with filtering
    const [availableCountries, setAvailableCountries] = React.useState<("ALL" | CustomerCountry)[]>(["ALL"]);
    const hasInitialized = React.useRef(false);

    // calculate available countries only on first render with data
    React.useEffect(() => {
        if (!hasInitialized.current && customers.length > 0) {
            const uniqueCountries = [...new Set(customers.map(customer => customer.country))];
            setAvailableCountries(["ALL", ...uniqueCountries]);
            hasInitialized.current = true;
        }
    }, [customers]);

    return (
        <div>
            <div>
                <label>
                    Filter by country:
                    <select 
                        value={selectedCountry} 
                        onChange={(e) => onCountryChange(e.target.value as "ALL" | CustomerCountry)}
                    >
                        {availableCountries.map(country => (
                            <option key={country} value={country}>{country}</option>
                        ))}
                    </select>
                </label>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Country</th>
                        <th>Total Bets</th>
                        <th>Win %</th>
                        <th>Profit</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map(customer => (
                        <tr key={customer.id}>
                            <td>{customer.first_name} {customer.last_name}</td>
                            <td>{customer.country}</td>
                            <td>{customer.total_bets}</td>
                            <td>{customer.win_percentage}%</td>
                            <td>{customer.profit.toFixed(2)} €</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Leaderboard; 