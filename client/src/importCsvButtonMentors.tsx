import React, { useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import axios from "axios";
import Papa from "papaparse";
import { Availability, Course } from "./types";
const serverUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

interface ParsedData {
  [key: string]: string;
}

interface CsvObject {
  [key: string]: string;
}

interface parsedMentor {
  mentor_id: number;
  first_name: String;
  last_name: String;
  email_address: String;
  year: String;
  program: String;
  availability: Availability[];
  course: Course[];
}

export const CsvButtonMentors = () => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<ParsedData[]>([]);
  const [fileName, setFileName] = useState<String>("");

  const handleOnChange = (event: any) => {
    console.log("entering")
    const text = event.target.files[0];
    const lines = text.split("\n");
    const modifiedText = lines.slice(5).join("\n");
    console.log("modifiedText",modifiedText)
    setFile(event.target.files[0]);
    setFileName(event.target.files[0].name);
  };

  const csvParse = (e: any) => {
    e.preventDefault();
    console.log("file", file);
    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        // Remove the first four lines
        const lines = text.split("\n");
        const modifiedText = lines.slice(5).join("\n");
        console.log('modifiedText', modifiedText);

        if (modifiedText) {
          Papa.parse(modifiedText, {
            header: true,
            complete: (results) => {
              console.log("hi")
              console.log("modifiedtext", modifiedText)
              console.log('results.data', results.data)
              setData(results.data as ParsedData[]);
            },
            error: (error: any) => {
              console.error("Errors parsing CSV:", error);
            },
          });
        }
      }
    };
  };

  const formatCsvData = (mentorData: any) => {
    for (const mentor of mentorData) {
    }
  };

  const handleOnSubmit = (e: any) => {
    e.preventDefault();
    csvParse(e);
    if (data) {
      sendMentorData(data);
      console.log("Data", data);
    }
  };

  const sendMentorData = async (csv: ParsedData[]) => {
    try {
      const response = await axios.post(`${serverUrl}/mentors/insertMentors`, {
        data: csv,
      });
      console.log("successful in sending data");
    } catch (error) {
      console.log("in sendMentorData");
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
    </div>
  );
};
