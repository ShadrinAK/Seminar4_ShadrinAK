const pool = require('../config/db');

module.exports = {
  getAllEvents: async () => {
    const res = await pool.query(`
      SELECT e.*, v.name as organizer_name 
      FROM events e
      JOIN volunteers v ON e.organizer_id = v.id
      ORDER BY event_date
    `);
    return res.rows;
  },

  getEventById: async (id) => {
    const res = await pool.query(`
      SELECT e.*, v.name as organizer_name 
      FROM events e
      JOIN volunteers v ON e.organizer_id = v.id
      WHERE e.id = $1
    `, [id]);
    return res.rows[0];
  },

  createEvent: async (event) => {
    const { title, description, event_date, location, max_participants, organizer_id } = event;
    const res = await pool.query(
      `INSERT INTO events 
      (title, description, event_date, location, max_participants, organizer_id) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, event_date, location, max_participants, organizer_id]
    );
    return res.rows[0];
  },

  updateEvent: async (id, event) => {
    const { title, description, event_date, location, max_participants, organizer_id } = event;
    const res = await pool.query(
      `UPDATE events SET 
      title = $1, description = $2, event_date = $3, 
      location = $4, max_participants = $5, organizer_id = $6
      WHERE id = $7 RETURNING *`,
      [title, description, event_date, location, max_participants, organizer_id, id]
    );
    return res.rows[0];
  },

  deleteEvent: async (id) => {
    await pool.query('DELETE FROM events WHERE id = $1', [id]);
    return true;
  }
};
