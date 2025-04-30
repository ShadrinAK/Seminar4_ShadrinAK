const pool = require('../config/db');

module.exports = {
  getAllVolunteers: async () => {
    const res = await pool.query('SELECT * FROM volunteers ORDER BY id');
    return res.rows;
  },

  getVolunteerById: async (id) => {
    const res = await pool.query('SELECT * FROM volunteers WHERE id = $1', [id]);
    return res.rows[0];
  },

  createVolunteer: async (volunteer) => {
    const { name, email, phone } = volunteer;
    const res = await pool.query(
      'INSERT INTO volunteers (name, email, phone) VALUES ($1, $2, $3) RETURNING *',
      [name, email, phone]
    );
    return res.rows[0];
  },

  updateVolunteer: async (id, volunteer) => {
    const { name, email, phone } = volunteer;
    const res = await pool.query(
      'UPDATE volunteers SET name = $1, email = $2, phone = $3 WHERE id = $4 RETURNING *',
      [name, email, phone, id]
    );
    return res.rows[0];
  },

  deleteVolunteer: async (id) => {
    await pool.query('DELETE FROM volunteers WHERE id = $1', [id]);
    return true;
  }
};
