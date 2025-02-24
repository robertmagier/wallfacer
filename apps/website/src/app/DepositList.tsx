// filepath: /home/robert/projects/praca/wallfacer/apps/website/src/app/DepositsList.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Collapsable from "./Collapsable";
import BigNumber from "bignumber.js";

const DepositsList = () => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        console.log("Fetching deposits from ", process.env.NEXT_PUBLIC_API_URL);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}transactions/deposits/10`
        );
        setDeposits(response.data);
        if (response.data.length > 0) {
          console.log("Deposits: ", response.data);
          const data: any[] = response.data;
          data.forEach((deposit) => {
            deposit.assets = new BigNumber(deposit.assets)
              .shiftedBy(-6)
              .toFormat(2);
            deposit.shares = new BigNumber(deposit.shares)
              .shiftedBy(-6)
              .toFormat(2);
            deposit.timestamp = new Date(deposit.timestamp).toLocaleString(
              "en-US",
              {
                timeStyle: "short",
                dateStyle: "medium",
                hourCycle: "h24",
              }
            );
          });
        }
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch deposits");
        setLoading(false);
      }
    };

    fetchDeposits();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 text-blue-800">
            <th className="text-left p-2 border-b">Sender</th>
            <th className="text-left p-2 border-b">Assets</th>
            <th className="text-left p-2 border-b">Shares</th>
            <th className="text-left p-2 border-b">Timestamp</th>
          </tr>
        </thead>
        <tbody className="bg-gray">
          {deposits.map((deposit, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="p-2 text-black border-b">{deposit.sender}</td>
              <td className="p-2 text-black border-b">{deposit.assets}</td>
              <td className="p-2 text-black border-b">{deposit.shares}</td>
              <td className="p-2 text-black border-b">
                {deposit.timestamp}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DepositsList;
