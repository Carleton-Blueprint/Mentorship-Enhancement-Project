import React, { useState } from "react";
import "./App.css";
import { Button } from "./components/ui/button";
import axios from 'axios';
const serverUrl = process.env.REACT_APP_SERVER_URL;
export const CsvButton = () => {
  const [file, setFile] = useState<File | null>(null);
  const [array, setArray] = useState<any[]>([]);
  const [fileName, setFileName] = useState<String>('');

  const fileReader = new FileReader();

  const handleOnChange = (event: any) => {
    setFile(event.target.files[0]);
    setFileName(event.target.files[0].name);
  };

  interface CsvObject {
    [key: string]: string;
  }

  const csvFileToArray = (string: string) => {
    const csvHeader = string.slice(0, string.indexOf("\n")).split(",");
    const csvRows = string.slice(string.indexOf("\n") + 1).split("\n");

    const array = csvRows.map((i: string): CsvObject => {
      const values = i.split(",");
      const obj: CsvObject = csvHeader.reduce((object, header, index) => {
        object[header.trim()] = values[index] ? values[index].trim() : "";
        return object;
      }, {} as CsvObject);
      return obj;
    });

    setArray(array);
    return array;
  };

  const handleOnSubmit = (e: any) => {
    e.preventDefault();

    if (file) {
      fileReader.onload = function (event) {
        const text = event.target?.result;
        let array = {}
        if (typeof text === "string") {
          array = csvFileToArray(text);
        } else {
          console.error("File reading error: result is not a string.");
        }
      };

      fileReader.readAsText(file);
      sendStudentData(array);
    }
  };

  const sendStudentData = async (array: CsvObject[]) => {
    try {
      const response = await axios.post(`${serverUrl}/students/insertStudents`, {data: array});
      console.log("successful in sending data");
    } catch (error) {
      console.log(error);
    }
  }

  const headerKeys = Object.keys(Object.assign({}, ...array));

  return (
    <div style={{ textAlign: "center"}}>
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
        {fileName && <span style={{ marginLeft: '10px' }}>{fileName}</span>}
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

      <table>
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
      </table>
    </div>
  );
};
