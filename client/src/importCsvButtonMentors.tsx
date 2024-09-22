import axios from "axios";
import Papa from "papaparse";
import React, { useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import {Table, TableRow, TableHead, TableHeader, TableBody, TableCell} from "./components/ui/table";

// import { Availability, Course } from "./types";
const serverUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

interface ParsedData {
  [key: string]: string;
}

interface Mentor {
  //mentor_id: number;
  name: String;
  email_address: String;
  year: String;
  program: String;
  courses: any;
}

export const CsvButtonMentors = () => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Mentor[]>([]);
  const [fileName, setFileName] = useState<String | "">("");
  const [sent, setSent] = useState<Boolean>(false);

  const handleOnChange = (event: any) => {
    const text = event.target.files[0];
    if (typeof text === "string") {
      const lines = text.split("\n");
      const modifiedText = lines.slice(5).join("\n");
      console.log("modifiedText", modifiedText);
    }
    setFile(event.target.files[0]);
    setFileName(event.target.files[0].name);
  };

  const csvParse = async (e: any) => {
    e.preventDefault();
    const courseList =[
      'BIOL 1010', 'BIOL 1103', 'BIOL 1104', 'BIOL 1105', 'BIOL 2002', 
      'BIOL 2005', 'BIOL 2104', 'BIOL 2200', 'BIOL 2201', 'BIOL 2303', 
      'BIOL 2600', 'CHEM 1001', 'CHEM 1002', 'CHEM 1004', 'CHEM 1006',
      'CHEM 2103', 'CHEM 2203', 'CHEM 2204', 
      'CHEM 2207', 'CHEM 2208', 'CHEM 2501', 'CHEM 2800', 'COMP 1005', 
      'COMP 1006', 'COMP 1405', 'COMP 1406', 'COMP 1504', 'COMP 1805', 
      'COMP 2108', 'COMP 2401', 'COMP 2402', 'COMP 2404', 'COMP 2406', 
      'COMP 2804', 'ENSC 1500', 'ERTH 1009', 'ERTH 1010', 'ERTH 2004', 
      'ERTH 2102', 'ERTH 2312', 'ERTH 2314', 'ERTH 2415', 'FOOD 1001', 
      'FOOD 2002', 'FOOD 2003', 'HLTH 1000', 'HLTH 2001', 'HLTH 2002', 
      'HLTH 2003', 'HLTH 2004', 'HLTH 2020', 'ISAP 1001', 'ISAP 2002', 
      'MATH 1004', 'MATH 1005', 'MATH 1007', 'MATH 1009', 'MATH 1052', 
      'MATH 1104', 'MATH 1107', 'MATH 1152', 'MAT 1800', 'MATH 2004', 
      'MATH 2007', 'MATH 2008', 'MATH 2052', 'MATH 2107', 'NSCI 1000', 
      'NEUR 1202', 'NEUR 1203', 'NEUR 2004', 'NEUR 2201', 'PHYS 1003', 
      'PHYS 1004', 'PHYS 1007', 'PHYS 1008', 'PHYS 1901', 'PHYS 2202', 
      'PHYS 2305', 'PHYS 2401', 'PHYS 2604', 'STAT 2507', 'STAT 2509', 
      'STAT 2607', 'STAT 2655'
  ];

    console.log("file", file);
    if (file) {
      Papa.parse(file, {
        header: true,
        beforeFirstChunk: (chunk) => {
          const lines = chunk.split("\n");
          lines.splice(0, 4);
          return lines.join("\n");
        },
        complete: (results) => {
          const rows: any[] = results.data as any[];
          rows.forEach((row) => {
            row["course"] = [];

            courseList.forEach((course) => {
              if (course !== undefined)
                if (row[course] === "Yes" || row[course] === "In Progress") {
                  row["course"].push(course);
                }
            });

            courseList.forEach((course) => {
              if (course !== undefined) delete row[course];
            });
          });

          const toSend = mapToFields(rows as ParsedData[]);

          setData(toSend);
          sendMentorData(toSend); // Send data immediately after parsing
        },
        error: (error) => {
          console.error("Errors parsing CSV:", error);
        },
      });
    }
  };

  const mapToFields = (mentors: ParsedData[]): Mentor[] => {
    return mentors.map((s: ParsedData): Mentor => {
      return {
        name: s["Full Name"],
        email_address: s["Email Address"],
        program: s["Program"],
        year: s["Year"],
        courses: s["course"],
      };
    });
  };

  const handleOnSubmit = (e: any) => {
    e.preventDefault();
    csvParse(e);
  };
  
  const sendMentorData = async (csv: Mentor[]) => {
    console.log('csv in sendMentordata', csv);
    try {
      const response = await axios.post(`${serverUrl}/mentors/insertMentors`, {
        data: csv,
      });
      setSent(true);
      console.log("csv", csv);
      console.log("successful in sending data");
    } catch (error) {
      console.log("in sendMentorData");
      console.log(error);
    }
  };

  const handleRemoveFile = () => {
    setFileName("");
    setFile(null);
    (document.getElementById("csvFileInput") as HTMLInputElement).value = "";
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "10px", 
    }} >
      <form>
        <input
          className={"custom-file-input"}
          type={"file"}
          id={"csvFileInput"}
          accept={".csv"}
          onChange={handleOnChange}
        />
        {fileName && (
            <span style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px", 
              }}>
              {fileName}
              <span
              style={{
                cursor: "pointer",
                color: "red",
                fontWeight: "bold",
                fontSize: "24px",
              }}
                onClick={handleRemoveFile}
              >
                &times;
              </span>
        </span>
        )}
      </form>
      <div>
          <Button
            className="bulk-add"
            onClick={(e) => handleOnSubmit(e)}
            disabled={!fileName}
          >
            Bulk Add (CSV)
          </Button>
        </div>
      <br />
      <div>
        {sent && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Courses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((mentor: any) => (
                  <TableRow>
                    <TableCell>{mentor.name}</TableCell>
                    <TableCell>{mentor.email}</TableCell>
                    <TableCell>{mentor.program}</TableCell>
                    <TableCell>{mentor.courses.join(', ')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
};
