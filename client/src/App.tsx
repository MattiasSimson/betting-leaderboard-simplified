import leaderbordLogo from "/leaderboard.png";
import "./App.css";
import { useEffect, useState } from "react";
import { fetchCustomers, fetchByCountry } from "./requests";
import type { LeaderboardCustomer } from "./types";

function App() {
  const [customers, setCustomers] = useState<LeaderboardCustomer[]>([]);
  const [allCustomers, setAllCustomers] = useState<LeaderboardCustomer[]>([]); 
  const [uniqueCountries, setUniqueCountries] = useState<string[]>([]); 

  async function init() {
    const data = await fetchCustomers();
    setAllCustomers(data);
    setCustomers(data);
    
    // get unique countries
    const countries = [...new Set(data.map(c => c.country))];
    setUniqueCountries(countries);
  }

  useEffect(() => {
    init();
  }, []);

  async function handleFetchByCountry(country: string) {
    if (country === "ALL") {
      setCustomers(allCustomers);
    } else {
      setCustomers(await fetchByCountry(country));
    }
  }

  return (
    <>
      <div>
        <img src={leaderbordLogo} className="logo" alt="Leaderboard logo" />
      </div>
      <h1>Betting Leaderboard</h1>
      <div>
        <h2>Betting Leaders</h2>
        <select onChange={(e) => handleFetchByCountry(e.target.value)}>
          <option value="ALL">ALL</option>
          {uniqueCountries.map((country, index) => (
            <option key={index} value={country}>{country}</option>
          ))}
        </select>
        <table>
          <thead>
            <tr>
              <th>Full Name</th>
              <th>Country</th>
              <th>Total Bets</th>
              <th>Win %</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            {customers.map(c => (
              <tr key={c.id}>
                <td>{c.first_name} {c.last_name}</td>
                <td>{c.country}</td>
                <td>{c.total_bets}</td>
                <td>{c.win_percentage}%</td>
                <td>${Number(c.profit).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default App;