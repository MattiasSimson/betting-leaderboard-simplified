import { useEffect, useState } from "react";
import "./App.css";
import Leaderboard from "./Leaderboard";
import { fetchLeaderboard } from "./requests";
import type { LeaderboardCustomer, CustomerCountry } from "./types";

function App() {
    const [customers, setCustomers] = useState<LeaderboardCustomer[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<"ALL" | CustomerCountry>("ALL");

    async function loadLeaderboard() {
        const country = selectedCountry === "ALL" ? undefined : selectedCountry;
        setCustomers(await fetchLeaderboard(country));
    }

    useEffect(() => {
        loadLeaderboard();
    }, [selectedCountry]);

    return (
        <>
            <h1>Betting Leaderboard</h1>
            <Leaderboard 
                customers={customers}
                selectedCountry={selectedCountry}
                onCountryChange={setSelectedCountry}
            />
            {/* All Customers section (I'm already doing the mapping in the Leaderboard component.)
            <div>
                <h2>All Customers</h2>
                {customers.map(c => (
                    <p key={c.id}>{c.first_name} {c.last_name}</p>
                ))}
            </div>
            */}
        </>
    );
}

export default App;
