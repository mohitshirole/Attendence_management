import React, { useState } from 'react';
import './StudentList.css';
import SearchComponent from './SearchComponent';

function StudentList({ studentList, attendanceData, handleAttendanceChange }) {
  const [searchResults, setSearchResults] = useState(studentList);

  const handleSearch = (results) => {
    setSearchResults(results);
  };

  return (
    <div className="StudentList">
      <SearchComponent
        data={studentList}
        searchKey="name"
        setSearchResults={handleSearch}
      />

      <table>
        <thead>
          <tr>
            <th style={{ textAlign: 'center' }}>Name</th>
            <th style={{ textAlign: 'center' }}>Roll Number</th>
            <th style={{ textAlign: 'center' }}>Attendance</th>
          </tr>
        </thead>
        <tbody>
          {searchResults.map((student) => (
            <tr key={student._id}>
              <td>{student.name}</td>
              <td>{student.rollNumber}</td>
              <td>
                <div className="attendance-container">
                  <label>
                    <input
                      type="radio"
                      name={`attendance-${student._id}`}
                      value="present"
                      checked={attendanceData[student._id] === 'present'}
                      onChange={() =>
                        handleAttendanceChange(student._id, 'present')
                      }
                    />
                    Present
                  </label>
                  <label>
                    <input
                      type="radio"
                      name={`attendance-${student._id}`}
                      value="absent"
                      checked={attendanceData[student._id] === 'absent'}
                      onChange={() =>
                        handleAttendanceChange(student._id, 'absent')
                      }
                    />
                    Absent
                  </label>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default StudentList;
