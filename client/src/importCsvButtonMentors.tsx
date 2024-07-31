import React, { useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import axios from "axios";
import Papa from "papaparse";
const serverUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";


interface ParsedData {
  [key: string]: string;
}

interface CsvObject {
  [key: string]: string;
}
export const CsvButtonMentors = () => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ParsedData[]>([]);
  const [fileName, setFileName] = useState<String>("");

  const fileReader = new FileReader();

  const handleOnChange = (event: any) => {
    setFile(event.target.files[0]);
    setFileName(event.target.files[0].name);
  };

  const csvParse = (e: any) => {
    e.preventDefault();

    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          console.log("results", results);
          console.log("results.data", results.data);
          setData(results.data as ParsedData[]);
        },
        error: (error) => {
          console.error("Errors parsing CSV:", error);
        },
      });
    }
  };

  const handleOnSubmit = (e: any) => {
    e.preventDefault();
    csvParse(e);
    if (data) {
      sendMentorData(data);
      console.log("Data", data)
    }
  };

  const sendMentorData = async (csv: ParsedData[]) => {
    try {
      const response = await axios.post(
        `${serverUrl}/mentors/insertMentors`,
        { data: csv }
      );
      console.log("successful in sending data");
    } catch (error) {
      console.log("in sendMentorData")
      console.log(error);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <form>
        <input
          className={"custom-file-input"}
          type={"file"}
          id={"csvFileInput"}
          accept={".csv"}
          onChange={handleOnChange}
        />
        <label htmlFor="csvFileInput" className="custom-file-label">
          Choose file
        </label>
        {fileName && <span style={{ marginLeft: "10px" }}>{fileName}</span>}
        <Button
          className="bulk-add"
          onClick={(e) => {
            handleOnSubmit(e);
          }}
        >
          Bulk Add (CSV)
        </Button>
      </form>

      <br />

      {/* <table>
        <thead>
          <tr key={"header"}>
            {headerKeys.map((key) => (
              <th>{key}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {array.map((item) => (
            <tr key={item.id}>
              {Object.values(item).map((val: any) => (
                <td>{val}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table> */}
    </div>
  );
};