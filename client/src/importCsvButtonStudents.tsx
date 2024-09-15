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
import axios from "axios";
import Papa from "papaparse";
const serverUrl = process.env.REACT_APP_SERVER_URL || "http://localhost:5000";
;

interface ParsedData {
  [key: string]: string;
}

interface Student {
  id: number;
  student_id: number;
  email: String;
  first_name: String;
  last_name: String;
  major: String,
  preferred_name: String,
  preferred_pronouns: String,
  courses: Array<String>;
  availability: Availability[];
  year_level: number;
}

interface Availability {
  day: String;
  time_ranges: TimeRange[];
}

interface TimeRange {
  start_time: Time;
  end_time: Time;
}

interface Time {
  hours: number;
  minutes: number;
}

export const CsvButtonStudents = () => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<Student[]>([]);
  const [array, setArray] = useState<any[]>([]);
  const [fileName, setFileName] = useState<String>("");
  const [sent, setSent] = useState<Boolean>(false);

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
          console.log("results", results.data);
          const toSend = mapToFields(results.data as ParsedData[]);
          console.log("toSend", toSend);
          setData(toSend);
        },
        error: (error) => {
          console.error("Errors parsing CSV:", error);
        },
      });
    }
  };

  function parseTime(timeStr: string): Time {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours !== 12) {
      hours += 12;
    } else if (modifier === "AM" && hours === 12) {
      hours = 0;
    }
    return { hours, minutes };
  }

  function parseTimeRange(timeRangeStr: string): TimeRange {
    const [startTimeStr, endTimeStr] = timeRangeStr
      .split(" to ")
      .map((time) => time.trim());
    return {
      start_time: parseTime(startTimeStr),
      end_time: parseTime(endTimeStr),
    };
  }

  // Mapping function
  const mapToFields = (students: ParsedData[]): Student[] => {
    return students.map((s: ParsedData): Student => {
      const daysOfWeek = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ];

      const availability: Availability[] = daysOfWeek
        .map((day) => {
          const times = s[day]?.split(";").filter(Boolean) || [];
          const parsedTimes: TimeRange[] = [];
          times.forEach((time) => {
            parsedTimes.push(parseTimeRange(time));
          });
          return {
            day,
            time_ranges: parsedTimes,
          };
        })
        .filter((day) => day.time_ranges.length > 0);

      const courses = s[
        "Please list any courses in which you would like to improve your grades."
      ]
        .split(",")
        .map((course: string) => course.trim());

      return {
        id: parseInt(s["ID"]),
        student_id: parseInt(s["Student Number"]),
        email: s["Carleton Email"],
        first_name: s["First Name"],
        last_name: s["Last Name"],
        major: s["What is your major?"],
        preferred_name: s["Preferred Name"],
        preferred_pronouns: s["Preferred Pronouns"],
        year_level: parseInt(s["What is your year level?"]),
        courses,
        availability,
      };
    });
  };

  const handleOnSubmit = (e: any) => {
    e.preventDefault();
    csvParse(e);
    if (data) {
      sendStudentData(data);
    }
  };

  const sendStudentData = async (csv: Student[]) => {
    try {
      const response = await axios.post(
        `${serverUrl}/students/insertStudents`,
        { data: csv }
      );
      console.log("successful in sending data");
      setSent(true);
    } catch (error) {
      console.log(error);
    }
  };
  
  const formatTime = (time: { hours: number, minutes: number }) => {
    const hours = time.hours % 12 || 12; // Convert to 12-hour format
    const minutes = time.minutes.toString().padStart(2, '0');
    const period = time.hours < 12 ? 'AM' : 'PM';
    return `${hours}:${minutes} ${period}`;
  };
  
  const renderAvailability = (student: Student) => {
    return (
      <div key={student.id}>
        <ul>
          {student.availability.map((availability: Availability) => (
            <li>
              <strong>{availability.day}:</strong>
              <ul>
                {availability.time_ranges.map((range, index) => (
                  <li key={index}>
                    {formatTime(range.start_time)} - {formatTime(range.end_time)}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    );
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
        {fileName && <span style={{ marginLeft: "10px" }}>{fileName}</span>}
        <Button
          className="bulk-add"
          onClick={(e) => {
            handleOnSubmit(e);
          }}
          disabled={!fileName}
        >
          Bulk Add (CSV)
        </Button>
      </form>

      <br />
      <div>
        {sent && (
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Number</TableHead>
                  <TableHead>First Name</TableHead>
                  <TableHead>Last Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Availability</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((student: any) => (
                  <TableRow>
                    <TableCell>{student.student_id}</TableCell>
                    <TableCell>{student.first_name}</TableCell>
                    <TableCell>{student.last_name}</TableCell>
                    <TableCell>{student.email}</TableCell>
                    {/* {student.courses.map((course: any) => {
                      <TableCell>{course}</TableCell>;
                    })}
                    {student.availability.map((availability: any) => {
                      <TableCell>{availability}</TableCell>;
                    })} */}
                    <TableCell>{student.courses.join(', ')}</TableCell>
                    <TableCell>{renderAvailability(student)}</TableCell>
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
