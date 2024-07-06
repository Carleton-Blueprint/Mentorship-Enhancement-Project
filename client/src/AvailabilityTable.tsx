import React, { useEffect, useState } from 'react';
import { FormSchema } from "./schemas/entityForm";
import { UseFormReturn } from 'react-hook-form';
import { z } from "zod";

type AvailabilityTableProps = {
  form: UseFormReturn<z.infer<typeof FormSchema>>;
};

const AvailabilityTable: React.FC<AvailabilityTableProps> = ({ form }) => {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const timeslots = ['10:00 -\n10:30 AM', '10:30 -\n11:00 AM', '11:00 -\n11:30 AM',
    '11:30 -\n12:00 PM', '12:00 -\n12:30 PM', '12:30 -\n1:00 PM',
    '1:00 -\n1:30 PM', '1:30 -\n2:00 PM', '2:00 -\n2:30 PM',
    '2:30 -\n3:00 PM', '3:00 -\n3:30 PM', '3:30 -\n4:00 PM'];
  
  const [availability, setAvailability] = useState<boolean[][]>([[]]);

  useEffect(() => {
    const rows = daysOfWeek.length;
    const columns = timeslots.length;
    setAvailability(Array.from({ length: rows }, () => Array(columns).fill(false)));
  }, [daysOfWeek.length, timeslots.length])

  function selectTimeslot(event: React.MouseEvent<HTMLLabelElement, MouseEvent>, rowNum: number, colNum: number): void {
    const target = event.currentTarget;
    if (target.classList.contains('selected')) {
      target.classList.remove('selected');
    }
    else {
      target.classList.add('selected');
    }
    const newAvailability = [...availability];
    newAvailability[rowNum][colNum] = !newAvailability[rowNum][colNum];
    setAvailability(newAvailability);
    console.log(availability);
  }

  return (
    <>
      <div className="text-sm font-medium required">Availability</div>
      <table className="w-full table-fixed mt-2">
        <tbody>
          {daysOfWeek.map((day, rowNum) => (
            <tr key={rowNum}>
              <td className="select-none text-center font-medium bg-[#D9D9D9]">{day}</td>
              {timeslots.map((timeslot, colNum) => (
                <td key={colNum}>
                  <label
                    className="timeslot-label select-none"
                    onClick={(event) => selectTimeslot(event, rowNum, colNum)}
                  >
                    {timeslot}
                  </label>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default AvailabilityTable;
