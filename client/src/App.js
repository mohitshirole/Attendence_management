import React, { useState, useEffect } from 'react';
import './App.css';
import Axios from 'axios';
import StudentList from './StudentList';

function App() {
  const [name, setName] = useState('');
  const [rollnumber, setRollnumber] = useState(0);
  const [studentList, setStudentList] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});

  useEffect(() => {
    Axios.get('http://localhost:3031/read')
      .then((response) => {
        setStudentList(response.data);
      })
      .catch((error) => {
        console.error('Error fetching student list:', error);
      });
  }, []);

  const addToList = () => {
    Axios.post('http://localhost:3031/insert', { name: name, rollnumber: rollnumber })
      .then((response) => {
        console.log('Student added successfully');
        // Update the student list with the new student
        setStudentList((prevList) => [...prevList, response.data]);
        // Reset the form inputs
        setName('');
        setRollnumber(0);
      })
      .catch((error) => {
        console.error('Error adding student:', error);
      });
  };

  const handleAttendanceChange = (studentId, attendance) => {
    setAttendanceData((prevData) => ({
      ...prevData,
      [studentId]: attendance,
    }));
  };

  const handleUpdateAttendance = () => {
    const attendanceArray = Object.entries(attendanceData).map(([studentId, attendance]) => ({
      studentId,
      attendance,
    }));

    Axios.post('http://localhost:3031/attendance', { attendanceData: attendanceArray })
      .then(() => {
        console.log('Attendance recorded successfully');
      })
      .catch((error) => {
        console.error('Error recording attendance:', error);
      });
  };

  const handleDownloadAttendance = () => {
    Axios.get('http://localhost:3031/download', { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'attendance.csv');
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((error) => {
        console.error('Error downloading attendance data:', error);
      });
  };

  return (
    <div className="App">
      <h1> BASIC ATTENDANCE MANAGEMENT APPLICATION</h1>
      <div className="StudentForm">
        <label>Name :</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        <label>Roll Number :</label>
        <input type="number" value={rollnumber} onChange={(e) => setRollnumber(e.target.value)} />
        <button onClick={addToList}>Add to List</button>
      </div>
      <StudentList
        studentList={studentList}
        attendanceData={attendanceData}
        handleAttendanceChange={handleAttendanceChange}
      />
      <div className="ButtonContainer">
        <button className="UpdateButton" onClick={handleUpdateAttendance}>
          Update
        </button>
        <button className="DownloadButton" onClick={handleDownloadAttendance}>
          Download Attendance
        </button>
      </div>
    </div>
  );
}

export default App;
