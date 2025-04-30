const pool = require('../config/db');

module.exports = {
  getAllParticipations: async () => {
    const res = await pool.query(`
      SELECT p.*, v.name as volunteer_name, e.title as event_title 
      FROM participations p
      JOIN volunteers v ON p.volunteer_id = v.id
      JOIN events e ON p.event_id = e.id
    `);
    return res.rows;
  },

  getParticipationById: async (id) => {
    const res = await pool.query(`
      SELECT p.*, v.name as volunteer_name, e.title as event_title 
      FROM participations p
      JOIN volunteers v ON p.volunteer_id = v.id
      JOIN events e ON p.event_id = e.id
      WHERE p.id = $1
    `, [id]);
    return res.rows[0];
  },

  createParticipation: async (participation) => {
    const { volunteer_id, event_id } = participation;
    const res = await pool.query(
      `INSERT INTO participations (volunteer_id, event_id) 
      VALUES ($1, $2) RETURNING *`,
      [volunteer_id, event_id]
    );
    return res.rows[0];
  },

  updateParticipation: async (id, participation) => {
    const { attended } = participation;
    const res = await pool.query(
      `UPDATE participations SET 
      attended = $1
      WHERE id = $2 RETURNING *`,
      [attended, id]
    );
    return res.rows[0];
  },

  deleteParticipation: async (id) => {
    await pool.query('DELETE FROM participations WHERE id = $1', [id]);
    return true;
  }
};
