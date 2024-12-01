import axios from "axios";
import Papa from "papaparse";
import DeletePopUp from './deletePopUp';
import React, { useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import { Table, TableRow, TableHead, TableHeader, TableBody, TableCell } from "./components/ui/table";

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
  courses: string[];
  availability: {
    [key: string]: string[]; // Map days to array of timeslots
  };
}

export const CsvButtonMentors = () => {
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

  const isTimeSlotHeader = (header: string): boolean => {
    // Check if header matches pattern like "10:00am to 10:30am"
    const timeSlotPattern = /^\d{1,2}:\d{2}(?:am|pm) to \d{1,2}:\d{2}(?:am|pm)$/i;
    return timeSlotPattern.test(header);
  };

  var csvParse = async (e: any) => {
    e.preventDefault();

    if (file) {
      Papa.parse(file, {
        header: true,
        beforeFirstChunk: (chunk) => {
          // remove first 4 rows
          const lines = chunk.split("\n");
          lines.splice(0, 4);
          return lines.join("\n");
        },
        complete: (results) => {
          const rows: any[] = results.data as any[];
          // Check if the last row is empty and remove it
          if (rows.length > 0 && Object.values(rows[rows.length - 1]).every(value => value === "")) {
            rows.pop(); // Remove the last row if it's empty
          }

          const headers = results.meta.fields || [];
          const sampleHeaders = headers.slice(5, 8);
          const timeSlotCount = sampleHeaders.filter(h => isTimeSlotHeader(h)).length;
          const isTimeSlotData = timeSlotCount > 0;

          rows.forEach((row) => {
            if (isTimeSlotData) {
              row["availability"] = {};
              const slotsPerDay = 12; // Group headers by day (12 slots per day)
              const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
              for (let dayIndex = 0; dayIndex < 5; dayIndex++) {
                const startIdx = 5 + (dayIndex * slotsPerDay);
                const endIdx = startIdx + slotsPerDay;
                const daySlots = headers.slice(startIdx, endIdx)
                  .filter((slot) => row[slot] === "Yes" || row[slot] === "Planning");
                
                if (daySlots.length > 0) {
                  row["availability"][days[dayIndex]] = daySlots;
                }
              }
            } else {
              row["courses"] = [];
              for (let i = 5; i < headers.length; i++) {
                const courseName = headers[i];
                if (row[courseName] === "Yes" || row[courseName] === "In Progress") {
                  row["courses"].push(courseName);
                }
              }
            }
          });

          const toSend = mapToFields(rows as ParsedData[]);
          console.log('Data interpretation:', isTimeSlotData ? 'Timeslot format' : 'Course format');
          console.log('toSend.slice(0, 5)', toSend.slice(0, 5));

          setData(toSend);
          sendMentorData(toSend);
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
        courses: (s["courses"] as unknown as string[]) || [],
        availability: (s["availability"] as unknown as { [key: string]: string[] }) || {},
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
      await axios.post(`${serverUrl}/mentors/insertMentors`, {
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }} >
      <form>
        <input
          className={"custom-file-input"}
          type={"file"}
          id={"csvFileInput"}
          accept={".csv"}
          onChange={handleOnChange}
        />
        {fileName && (
          <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
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
      <div>
        <Button
          className="Reset-all"
          onClick={() => setDeleteAll(true)}
        >
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
