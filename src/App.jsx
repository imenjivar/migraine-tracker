import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay } from 'date-fns';
import 'react-day-picker/dist/style.css';

// --- STYLES ---
const css = `
  .has-meds { font-weight: bold; color: white; }
  .day-container { display: flex; flex-direction: column; gap: 20px; max-width: 400px; margin: auto; }
  .med-item { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .color-coding { display: flex; align-items: left; margin-bottom: 0px; }
`;

export default function App() {
  // --- STATE ---
  const [selectedDay, setSelectedDay] = useState(new Date());
  
  // Master list of available medications
  const [medicationList, setMedicationList] = useState(() => {
    // const saved = localStorage.getItem('meds_master_list');
    // return saved ? JSON.parse(saved) : ["Sumatriptan", "Ibuprofen", "Magnesium"];
    return [{ id: 1, name: "Tylenol", color: "#ef4444" }, { id: 2, name: "Zomig", color: "#3b82f6" }]
  });

  // Calendar data: { date: "2026-03-31", meds: ["Ibuprofen"] }
  const [calendarData, setCalendarData] = useState(() => {
    const saved = localStorage.getItem('meds_calendar_data');
    return saved ? JSON.parse(saved) : [];
  });

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('meds_master_list', JSON.stringify(medicationList));
  }, [medicationList]);

  useEffect(() => {
    localStorage.setItem('meds_calendar_data', JSON.stringify(calendarData));
  }, [calendarData]);

  // --- LOGIC: MODIFIERS FOR COLOR CODING ---
  // Highlight days that have at least one medication logged
  // 1. INTERSECTION: Both Tylenol AND Zomig
  const bothDays = calendarData
    .filter(item => item.meds.includes("Tylenol") && item.meds.includes("Zomig"))
    .map(item => new Date(item.date));

  // 2. EXCLUSIVE: Tylenol ONLY (No Zomig)
  const onlyTylenolDays = calendarData
    .filter(item => item.meds.includes("Tylenol") && !item.meds.includes("Zomig"))
    .map(item => new Date(item.date));

  // 3. EXCLUSIVE: Zomig ONLY (No Tylenol)
  const onlyZomigDays = calendarData
    .filter(item => !item.meds.includes("Tylenol") && item.meds.includes("Zomig"))
    .map(item => new Date(item.date));

  const modifiers = { hasBoth: bothDays, hasTylenol: onlyTylenolDays, hasZomig: onlyZomigDays };
  const modifiersStyles = {
    hasTylenol: { backgroundColor: `#ef444499`, borderRadius: '50%' },
    hasZomig: { backgroundColor: `#3b82f699`, borderRadius: '50%' },
    hasBoth: { backgroundColor: `#861b9e99`, borderRadius: '50%' }
  };

  // --- LOGIC: CHECKLIST ---
  const currentDayData = calendarData.find(d => isSameDay(new Date(d.date), selectedDay));
  const selectedMedsForDay = currentDayData ? currentDayData.meds : [];

  const toggleMedForDay = (medName) => {
    const dateStr = selectedDay.toISOString();
    let updatedData;

    if (selectedMedsForDay.includes(medName)) {
      // Remove it
      updatedData = calendarData.map(d => 
        isSameDay(new Date(d.date), selectedDay) 
          ? { ...d, meds: d.meds.filter(m => m !== medName) }
          : d
      );
    } else {
      // Add it
      if (currentDayData) {
        updatedData = calendarData.map(d => 
          isSameDay(new Date(d.date), selectedDay) 
            ? { ...d, meds: [...d.meds, medName] }
            : d
        );
      } else {
        updatedData = [...calendarData, { date: dateStr, meds: [medName] }];
      }
    }
    setCalendarData(updatedData);
  };

  // --- LOGIC: MASTER LIST MGMT ---
  // const addMedication = () => {
  //   const name = prompt("Enter new medication name:");
  //   if (name) setMedicationList([...medicationList, name]);
  // };

  // const editMedication = (name) => {
  //   setMedicationList(medicationList.filter(m => m !== name));
  //   // Clean up calendar data too
  //   setCalendarData(calendarData.map(d => ({
  //     ...d, meds: d.meds.filter(m => m !== name)
  //   })));
  // };

  // const deleteMedication = (name) => {
  //   setMedicationList(medicationList.filter(m => m !== name));
  //   // Clean up calendar data too
  //   setCalendarData(calendarData.map(d => ({
  //     ...d, meds: d.meds.filter(m => m !== name)
  //   })));
  // };

  return (
    <div className="day-container">
      <style>{css}</style>
      
      {/* 1. CALENDAR */}
      <DayPicker 
        mode="single"
        selected={selectedDay}
        onSelect={(day) => day && setSelectedDay(day)}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
      />
      <div className="color-coding">
        <b>Color coding:</b>
      </div>
      {medicationList.map(med => (
          <div key={med.id} className="color-coding">
            <div style={{
              width: '12px',
              height: '12px',
              borderRadius: '4px',
              border: `2px solid ${med.color}`,
              backgroundColor: `${med.color}20`, // Adding 20 at the end makes it 12% transparent
              flexShrink: 0,
              marginTop: '4px',
              marginRight: '10px'
            }} />
            <span>{med.name}</span>
          </div>
      ))}
      <div className="color-coding">
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '4px',
          border: `2px solid #861b9e`,
          backgroundColor: `#861b9e20`, // Adding 20 at the end makes it 12% transparent
          flexShrink: 0,
          marginTop: '4px',
          marginRight: '10px'
        }} />
        <span>Both</span>
      </div>

      {/* 2. CHECKLIST FOR SELECTED DATE */}
      <h3>Meds for {format(selectedDay, 'PP')}</h3>
      {medicationList.map(med => (
        <div key={med.id} className="med-item">
          <label>
            <input 
              type="checkbox" 
              checked={selectedMedsForDay.includes(med.name)} 
              onChange={() => toggleMedForDay(med.name)}
            /> {med.name}
          </label>
        </div>
      ))}

      {/* 3. MASTER LIST MANAGEMENT */}
      {/* <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}> */}
        {/* <h3>My Medications</h3> */}
        {/* <button onClick={addMedication} style={{ cursor: 'pointer' }}>+</button> */}
      {/* </div> */}
      {/* {medicationList.map(med => ( */}
        {/* <div key={med} className="med-item"> */}
          {/* <span>{med}</span> */}
          {/* <button onClick={() => editMedication(med)} style={{ color: 'white', border: 'none', background: 'none' }}>Edit</button> */}
          {/* <button onClick={() => deleteMedication(med)} style={{ color: 'red', border: 'none', background: 'none' }}>Delete</button> */}
        {/* </div> */}
      {/* ))} */}
    </div>
  );
}