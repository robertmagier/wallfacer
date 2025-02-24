"use client";

import BigNumber from "bignumber.js";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import DepositsList from "./DepositList";
import WithdrawalsList from "./WithdrawalsLIst";
import Section from "./Section";
import RecentTransactionsTable from "./RecentTransactions";

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
      data.assets = new BigNumber(data.assets).shiftedBy(-6).toFormat(2);
      data.shares = new BigNumber(data.shares).shiftedBy(-6).toFormat(2);

      data.timestamp = new Date(data.timestamp).toLocaleString("en-US", {
        timeStyle: "short",
        dateStyle: "medium",
        hourCycle: "h24",
      });
      console.log("New deposit:", data);
      setDeposits((prev) => [data, ...prev]);
    });

    socket.on("withdrawal_changes", (data) => {
      console.log("New withdrawatoFixed(2).l:", data);
      data.assets = new BigNumber(data.assets).shiftedBy(-6).toFormat(2);
      data.shares = new BigNumber(data.shares).shiftedBy(-6).toFormat(2);
      data.timestamp = new Date(data.timestamp).toLocaleString("en-US", {
        timeStyle: "short",
        dateStyle: "medium",
        hourCycle: "h24",
      });
      setWithdrawals((prev) => [data, ...prev]);
    });

    socket.on("aggregate_changes", (data) => {
      console.log("New aggregate update:", data);
      data.total_assets = new BigNumber(data.total_assets)
        .shiftedBy(-6)
        .toFormat(2);
      data.total_shares = new BigNumber(data.total_shares)
        .shiftedBy(-6)
        .toFormat(2);
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
      <div className="w-full flex">
      <img src="/wallfacer.svg" className="w-10"/>
        <h1 className="text-black ml-5">Wallfacer Demo</h1>
      </div>
      <Section title="Recent Transactions">
        <RecentTransactionsTable
          title="Recent Deposits"
          data={deposits || []}
          showMore={showMoreDeposits}
          properties={["sender", "assets", "shares", "timestamp"]}
          setShowMore={setShowMoreDeposits}
        />
        <RecentTransactionsTable
          title="Recent Withdrawals"
          data={withdrawals || []}
          properties={["receiver", "assets", "shares", "timestamp"]}
          showMore={showMoreWithdrawals}
          setShowMore={setShowMoreWithdrawals}
        />
        <RecentTransactionsTable
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
      </Section>

      <Section title="Historical Transactions">
        <DepositsList />
        <WithdrawalsList />
      </Section>
    </div>
  );
};

export default TransactionsUpdates;
