import axios from "axios";
import Papa from "papaparse";
import DeletePopUp from "./deletePopUp";
import React, { useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import {
  Table,
  TableRow,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
} from "./components/ui/table";

const serverUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";

interface ParsedData {
  [key: string]: string;
}

export interface Mentor {
  mentor_id: number;
  name: String;
  email_address: String;
  year: String;
  program: String;
  availability: {
    [key: string]: string[]; // Map days to array of timeslots
  };
}
const TIMES = [
  "10:00am to 10:30am",
  "10:30am to 11:00am",
  "11:00am to 11:30am",
  "11:30am to 12:00pm",
  "12:00pm to 12:30pm",
  "12:30pm to 1:00pm",
  "1:00pm to 1:30pm",
  "1:30pm to 2:00pm",
  "2:00pm to 2:30pm",
  "2:30pm to 3:00pm",
  "3:00pm to 3:30pm",
  "3:30pm to 4:00pm",
];

export const AddTimeslots = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<String | "">("");
  const [deleteAll, setDeleteAll] = useState(false);
  const [data, setData] = useState<Mentor[]>([]);
  const [sent, setSent] = useState<Boolean>(false);

  const handleOnChange = (event: any) => {
    const text = event.target.files[0];
    if (typeof text === "string") {
      const lines = text.split("\n");
    }
    setFile(event.target.files[0]);
    setFileName(event.target.files[0].name);
  };

  // const isTimeSlotHeader = (header: string): boolean => {
  //   // Check if header matches pattern like "10:00am to 10:30am"
  //   const timeSlotPattern =
  //     /^\d{1,2}:\d{2}(?:am|pm) to \d{1,2}:\d{2}(?:am|pm)$/i;
  //   return timeSlotPattern.test(header);
  // };

  var csvParse = async (e: any) => {
    e.preventDefault();

    if (file) {
      Papa.parse(file, {
        beforeFirstChunk: (chunk) => {
          const lines = chunk.split("\n");
          lines.splice(0, 5);
          return lines.join("\n");
        },
        complete: (results) => {
          console.log("parsed results", results);
          const rows: any[] = results.data as any[];
          console.log(rows);
          // Check if the last row is empty and remove it
          // if (rows.length > 0 && Object.values(rows[rows.length - 1]).every(value => value === "")) {
          //   rows.pop(); // Remove the last row if it's empty
          // }

          const result: {
            availability: { [key: string]: string[] };
            "Student ID"?: string;
            "Full Name"?: string;
            "Email Address"?: string;
            Year?: string;
            Program?: string;
          }[] = [];
          rows.forEach((row) => {
            console.log("row", row);
            let new_row: {
              availability: { [key: string]: string[] };
              "Student ID"?: string;
              "Full Name"?: string;
              "Email Address"?: string;
              Year?: string;
              Program?: string;
            } = {
              availability: {},
              "Student ID": undefined,
              "Full Name": undefined,
              "Email Address": undefined,
              Year: undefined,
              Program: undefined,
            };

            new_row["Student ID"] = row[0];
            new_row["Full Name"] = row[1];
            new_row["Email Address"] = row[2];
            new_row["Year"] = row[3];
            new_row["Program"] = row[4];
            console.log("new_row", new_row);
            const slotsPerDay = 12; // Group headers by day (12 slots per day)
            const days = [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
            ];
            for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
              const startIdx = dayIndex * slotsPerDay;
              const endIdx = startIdx + slotsPerDay;
              //fill in this part
              const daySlots = [];
              for (let i = startIdx; i < endIdx; i++) {
                if (row[i + 5] === "Yes" || row[i + 5] === "Planning") {
                  daySlots.push(TIMES[i - startIdx]);
                }
              }
              console.log("dayslots", daySlots);

              if (daySlots.length > 0) {
                new_row["availability"][days[dayIndex]] = daySlots;
                console.log(new_row["availability"]);
              }
            }
            //  else {
            //       row["courses"] = [];
            //       for (let i = 5; i < headers.length; i++) {
            //         const courseName = headers[i];
            //         if (
            //           row[courseName] === "Yes" ||
            //           row[courseName] === "In Progress"
            //         ) {
            //           row["courses"].push(courseName);
            //         }
            //       }
            //     }

            result.push(new_row);
          });
          console.log("rows", rows);
          const toSend = result;
          // console.log(
          //   "Data interpretation:",
          //   isTimeSlotData ? "Timeslot format" : "Course format"
          // );
          console.log("toSend.slice(0, 5)", toSend.slice(0, 5));

          setData(toSend as Mentor[]);
          sendMentorData(toSend as Mentor[]);
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
        mentor_id: parseInt(s["Student ID"]),
        name: s["Full Name"],
        email_address: s["Email Address"],
        program: s["Program"],
        year: s["Year"],
        availability:
          (s["availability"] as unknown as { [key: string]: string[] }) || {},
      };
    });
  };

  const handleOnSubmit = (e: any) => {
    e.preventDefault();
    csvParse(e);
  };

  const sendMentorData = async (csv: Mentor[]) => {
    console.log("csv in sendMentordata", csv);
    try {
      console.log("serverurl", serverUrl);
      await axios.post(`${serverUrl}/mentors/addMentorAvailability`, {
        data: csv,
      });
      setSent(true);
      console.log("csv", csv);
      console.log("successful in sending data");
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (e: any) => {
    try {
      await axios.post(`${serverUrl}/mentors/deleteAllMentors`);
      setDeleteAll(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemoveFile = () => {
    setFileName("");
    setFile(null);
    (document.getElementById("csvFileInput") as HTMLInputElement).value = "";
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
      }}
    >
      <form>
        <input
          className={"custom-file-input"}
          type={"file"}
          id={"csvFileInput"}
          accept={".csv"}
          onChange={handleOnChange}
        />
        {fileName && (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            {fileName}
            <span onClick={handleRemoveFile}>{/* &times; */}</span>
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
      <div>
        <Button className="Reset-all" onClick={() => setDeleteAll(true)}>
          Reset All
        </Button>
        {deleteAll && (
          <DeletePopUp
            handleDelete={handleDelete}
            onClose={() => setDeleteAll(false)}
          />
        )}
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
                    {/* <TableCell>{mentor.courses.join(", ")}</TableCell> */}
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
