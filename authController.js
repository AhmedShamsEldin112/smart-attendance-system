const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool, poolConnect, sql } = require('../db');
require('dotenv').config();

async function login(req, res) {
  try {
    const { student_id, password } = req.body;
    if (!student_id || !password) {
      return res.status(400).json({ success: false, message: 'Please provide student_id and password.' });
    }
    await poolConnect;
    const request = pool.request();
    request.input('student_id', sql.VarChar, student_id);
    const result = await request.query('SELECT * FROM students WHERE student_id = @student_id');
    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid student ID or password.' });
    }
    const student = result.recordset[0];
    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid student ID or password.' });
    }
    const token = jwt.sign(
      { id: student.id, student_id: student.student_id, name: student.name, email: student.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      data: { token, student: { id: student.id, student_id: student.student_id, name: student.name, email: student.email } }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
}

async function register(req, res) {
  try {
    const { student_id, name, email, password } = req.body;
    if (!student_id || !name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    await poolConnect;
    const checkRequest = pool.request();
    checkRequest.input('student_id', sql.VarChar, student_id);
    checkRequest.input('email', sql.VarChar, email);
    const existing = await checkRequest.query('SELECT id FROM students WHERE student_id = @student_id OR email = @email');
    if (existing.recordset.length > 0) {
      return res.status(409).json({ success: false, message: 'Student ID or email already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const insertRequest = pool.request();
    insertRequest.input('student_id', sql.VarChar, student_id);
    insertRequest.input('name', sql.VarChar, name);
    insertRequest.input('email', sql.VarChar, email);
    insertRequest.input('password', sql.VarChar, hashedPassword);
    await insertRequest.query('INSERT INTO students (student_id, name, email, password) VALUES (@student_id, @name, @email, @password)');
    return res.status(201).json({ success: true, message: 'Student registered successfully!' });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
}

module.exports = { login, register };
