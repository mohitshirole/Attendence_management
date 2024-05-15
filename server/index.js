const express = require('express');
const moment = require('moment');
const mongoose = require('mongoose');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const cors = require('cors');
const app = express();
const StudentModel = require('./models/Student');
const AttendanceModel = require('./models/Attendance2');
app.use(express.json());
app.use(cors());
mongoose.connect('mongodb+srv://gurucharan:Premguru125@cluster.t9bqdyu.mongodb.net/food?retryWrites=true&w=majority', {
    useNewUrlParser: true,
});

app.post('/insert', async (req, res) => {
    const name = req.body.name;
    const rollnumber = req.body.rollnumber;
    const student = new StudentModel({ name: name, rollNumber: rollnumber });
    try {
        await student.save();
        res.send('inserted data');
    }
    catch (err) {
        console.log(err);
    }
});
app.post('/attendance', (req, res) => {
  const attendanceData = req.body.attendanceData;

  //const date = new Date().setHours(0, 0, 0, 0); // Get the current date with time set to midnight
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleDateString();
    // const parts = formattedDate.split('/'); // Split the string by "/"
    // const date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    const date = moment(formattedDate, 'D/M/YYYY').toDate();
  // Create attendance records for each student
  const attendanceRecords = attendanceData.map(data => ({
    studentId: data.studentId,
    attendance: data.attendance
  }));

  // Find or create the attendance document for the current date
  AttendanceModel.findOneAndUpdate(
    { date },
    { $set: { attendanceRecords } },
    { upsert: true, new: true }
  )
    .then(() => {
      res.status(200).send('Attendance recorded successfully');
    })
    .catch(error => {
      console.error('Error recording attendance:', error);
      res.status(500).send('Error recording attendance');
    });
});
// Import the csv-writer package


// Endpoint to download attendance data for multiple dates as CSV
app.get('/download', (req, res) => {
  const startDate = new Date('2023-06-01');
  const endDate = new Date('2023-06-30');

  // Find the attendance records within the date range
  AttendanceModel.find({ date: { $gte: startDate, $lte: endDate } })
    .populate('attendanceRecords.studentId')
    .then(attendanceRecords => {
      if (attendanceRecords.length === 0) {
        return res.status(404).send('Attendance data not found');
      }

      // Extract unique dates and student names
      const uniqueDates = [...new Set(attendanceRecords.map(record => record.date.toISOString().split('T')[0]))];
      const studentNames = [...new Set(attendanceRecords.flatMap(record => record.attendanceRecords.map(r => r.studentId.name)))];

      // Prepare attendance data for CSV
      const csvData = studentNames.map(name => {
        const rowData = { Name: name };

        uniqueDates.forEach(date => {
          const attendanceRecord = attendanceRecords.find(record => record.date.toISOString().split('T')[0] === date);
          const attendance = attendanceRecord.attendanceRecords.find(r => r.studentId.name === name);
          rowData[date] = attendance ? attendance.attendance : '';
        });

        return rowData;
      });

      // Create CSV header configuration
      const csvHeader = [
        { id: 'Name', title: 'Name' },
        ...uniqueDates.map(date => ({ id: date, title: date }))
      ];

      // Create CSV writer
      const csvWriter = createCsvWriter({
        path: 'attendance.csv',
        header: csvHeader
      });

      // Write CSV data to file
      csvWriter
        .writeRecords(csvData)
        .then(() => {
          // Set response headers for file download
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename=attendance.csv');

          // Stream the generated CSV file to the response
          fs.createReadStream('attendance.csv').pipe(res);
        })
        .catch(error => {
          console.error('Error writing CSV file:', error);
          res.status(500).send('Error generating attendance CSV');
        });
    })
    .catch(error => {
      console.error('Error downloading attendance data:', error);
      res.status(500).send('Error downloading attendance data');
    });
});

app.get('/read', async (req, res) => {
    try {
        const data = await StudentModel.find({});
        res.send(data);
    }
    catch (err) {
        console.log(err);
    }
});
app.listen(3031, () =>
{
    console.log('server runningg....');
})