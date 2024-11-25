import React from 'react';

export const ExportMatchedCsv = ({ csvString }: { csvString: string }) => {
    const downloadCsv = () => {
        // Create a Blob from the CSV string
     const blob = new Blob([csvString], { type: 'text/csv' });

     // Generate a download link and initiate the download
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.href = url;
     link.download = 'matches.csv';
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
     URL.revokeObjectURL(url);
    };
 
   return <button onClick={downloadCsv}>matches csv</button>;
}

export const ExportUnmatchedCsv = ({ csvString }: { csvString: string }) => {
    const downloadCsv = () => {
        // Create a Blob from the CSV string
        const blob = new Blob([csvString], { type: 'text/csv' });

        // Generate a download link and initiate the download
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'unmatched.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
 
   return <button onClick={downloadCsv}>unmatched csv</button>;
}