const volunteerModel = require('../models/volunteerModel');

module.exports = {
  getVolunteers: async (req, res) => {
    try {
      const volunteers = await volunteerModel.getAllVolunteers();
      res.json(volunteers);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getVolunteer: async (req, res) => {
    try {
      const volunteer = await volunteerModel.getVolunteerById(req.params.id);
      if (!volunteer) {
        return res.status(404).json({ message: 'Volunteer not found' });
      }
      res.json(volunteer);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  createVolunteer: async (req, res) => {
    try {
      const newVolunteer = await volunteerModel.createVolunteer(req.body);
      res.status(201).json(newVolunteer);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  updateVolunteer: async (req, res) => {
    try {
      const updatedVolunteer = await volunteerModel.updateVolunteer(
        req.params.id,
        req.body
      );
      if (!updatedVolunteer) {
        return res.status(404).json({ message: 'Volunteer not found' });
      }
      res.json(updatedVolunteer);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  deleteVolunteer: async (req, res) => {
    try {
      await volunteerModel.deleteVolunteer(req.params.id);
      res.json({ message: 'Volunteer deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};
