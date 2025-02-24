import React from "react";
import Collapsable from "./Collapsable";

const RecentTransactionsTable = ({
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
  if (!data) return null;

  const displayedData = showMore ? data : data.slice(0, 5);

  return (
      <div className="bg-white shadow-md rounded-lg full-width p-4">
        <h2 className="text-lg font-medium text-black text-center mb-4">{title}</h2>
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

export default RecentTransactionsTable;
