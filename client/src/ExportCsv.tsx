import React from "react";

export const ExportCsv = ({ csvString }: { csvString: string }) => {
  const downloadCsv = () => {
    // Create a Blob from the CSV string
    const blob = new Blob([csvString], { type: "text/csv" });

    // Generate a download link and initiate the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "all_students.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return <button onClick={downloadCsv}>export csv</button>;
};
