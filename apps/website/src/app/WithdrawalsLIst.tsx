// filepath: /home/robert/projects/praca/wallfacer/apps/website/src/app/DepositsList.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Collapsable from "./Collapsable";
import BigNumber from "bignumber.js";

const WithdrawalsList = () => {
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}transactions/withdrawals/10`
        );
        if(response.data.length > 0) {
          console.log("Withdrawals: ", response.data);
          const data:any[] = response.data;
          data.forEach((withdrawal) => {
            withdrawal.assets = new BigNumber(withdrawal.assets)
              .shiftedBy(-6)
              .toFormat(2)
            withdrawal.shares = new BigNumber(withdrawal.shares)
              .shiftedBy(-6)
              .toFormat(2)
              withdrawal.timestamp = new Date(withdrawal.timestamp).toLocaleString("en-US", {
                timeStyle: "short",
                dateStyle: "medium",
                hourCycle: "h24",
              });

          });
        }

        setWithdrawals(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch deposits");
        setLoading(false);
      }
    };

    fetchWithdrawals();
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
            {withdrawals.map((withdrawal, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="p-2 text-black border-b">{withdrawal.sender}</td>
                <td className="p-2 text-black border-b">{withdrawal.assets}</td>
                <td className="p-2 text-black border-b">{withdrawal.shares}</td>
                <td className="p-2 text-black border-b">
                  {withdrawal.timestamp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  );
};

export default WithdrawalsList;
