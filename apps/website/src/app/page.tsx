"use client";

import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import DepositsList from "./DepositList";
import WithdrawalsList from "./WithdrawalsLIst";

const socket = io(process.env.NEXT_PUBLIC_API_URL);

const TransactionsUpdates = () => {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [aggregates, setAggregates] = useState<any[]>([]);
  const [showMoreDeposits, setShowMoreDeposits] = useState(false);
  const [showMoreWithdrawals, setShowMoreWithdrawals] = useState(false);
  const [showMoreAggregates, setShowMoreAggregates] = useState(false);

  useEffect(() => {
    socket.on("deposit_changes", (data) => {
      data.assets = new BigNumber(data.assets)
        .shiftedBy(-6)
        .toFixed(2)
        .toString();
      data.shares = new BigNumber(data.shares)
        .shiftedBy(-6)
        .toFixed(2)
        .toString();
      console.log("New deposit:", data);
      setDeposits((prev) => [data, ...prev]);
    });

    socket.on("withdrawal_changes", (data) => {
      console.log("New withdrawatoFixed(2).l:", data);
      data.assets = new BigNumber(data.assets)
        .shiftedBy(-6)
        .toFixed(2)
        .toString();
      data.shares = new BigNumber(data.shares)
        .shiftedBy(-6)
        .toFixed(2)
        .toString();
      setWithdrawals((prev) => [data, ...prev]);
    });

    socket.on("aggregate_changes", (data) => {
      console.log("New aggregate update:", data);
      data.total_assets = new BigNumber(data.total_assets)
        .shiftedBy(-6)
        .toFixed(2)
        .toString();
      data.total_shares = new BigNumber(data.total_shares)
        .shiftedBy(-6)
        .toFixed(2)
        .toString();
      setAggregates((prev) => {
        const index = prev.findIndex(
          (item) =>
            item.owner === data.owner &&
            item.transaction_type === data.transaction_type
        );
        if (index !== -1) {
          const newAggregates = [...prev];
          newAggregates[index] = data;
          return newAggregates;
        } else {
          return [data, ...prev];
        }
      });
    });

    return () => {
      socket.off("deposit_changes");
      socket.off("withdrawal_changes");
      socket.off("aggregate_changes");
    };
  }, []);

  return (
    <div className="px-40 py-10  space-y-10 bg-gray-200">
      <DepositsList />
      <WithdrawalsList />
      <TransactionTable
        title="Recent Deposits"
        data={deposits || []}
        showMore={showMoreDeposits}
        properties={["sender", "owner", "assets", "shares", "timestamp"]}
        setShowMore={setShowMoreDeposits}
      />
      <TransactionTable
        title="Recent Withdrawals"
        data={withdrawals || []}
        properties={[
          "sender",
          "owner",
          "receiver",
          "assets",
          "shares",
          "timestamp",
        ]}
        showMore={showMoreWithdrawals}
        setShowMore={setShowMoreWithdrawals}
      />
      <TransactionTable
        title="Recent Aggregate Changes"
        data={aggregates || []}
        properties={[
          "owner",
          "total_assets",
          "total_shares",
          "transaction_type",
          "transaction_count",
        ]}
        showMore={showMoreAggregates}
        setShowMore={setShowMoreAggregates}
      />
    </div>
  );
};

const TransactionTable = ({
  title,
  data,
  properties,
  showMore,
  setShowMore,
}: {
  title: string;
  data: any[];
  properties: string[];
  showMore: boolean;
  setShowMore: (value: boolean) => void;
}) => {
  if (!data || data.length === 0) return null;

  const displayedData = showMore ? data : data.slice(0, 5);

  return (
    <div className="bg-white shadow-md rounded-lg full-width p-4">
      <h2 className="text-xl text-blue-800 font-semibold mb-4">{title}</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200 text-blue-800">
            {properties.map((key) => (
              <th key={key} className="text-left p-2 border-b">
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-gray">
          {displayedData.map((row, index) => (
            <tr key={index} className="hover:bg-gray-100">
              {properties.map((key) => (
                <td key={key} className="p-2 text-black border-b">
                  {String(row[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 5 && (
        <button
          className="mt-4 text-blue-800 underline"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
};
export default TransactionsUpdates;
