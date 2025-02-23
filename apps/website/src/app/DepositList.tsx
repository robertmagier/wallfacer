// filepath: /home/robert/projects/praca/wallfacer/apps/website/src/app/DepositsList.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DepositsList = () => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeposits = async () => {
      try {
        const response = await axios.get('http://localhost:3001/transactions/deposits/10');
        setDeposits(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch deposits');
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
      <h2 className="text-xl text-blue-800 font-semibold mb-4">Deposits</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 text-blue-800">
            <th className="text-left p-2 border-b">Sender</th>
            <th className="text-left p-2 border-b">Owner</th>
            <th className="text-left p-2 border-b">Assets</th>
            <th className="text-left p-2 border-b">Shares</th>
            <th className="text-left p-2 border-b">Timestamp</th>
          </tr>
        </thead>
        <tbody className="bg-gray">
          {deposits.map((deposit, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="p-2 text-black border-b">{deposit.sender}</td>
              <td className="p-2 text-black border-b">{deposit.owner}</td>
              <td className="p-2 text-black border-b">{deposit.assets}</td>
              <td className="p-2 text-black border-b">{deposit.shares}</td>
              <td className="p-2 text-black border-b">{new Date(deposit.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DepositsList;