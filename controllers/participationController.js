const participationModel = require('../models/participationModel');

module.exports = {
  getParticipations: async (req, res) => {
    try {
      const participations = await participationModel.getAllParticipations();
      res.json(participations);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getParticipation: async (req, res) => {
    try {
      const participation = await participationModel.getParticipationById(req.params.id);
      if (!participation) {
        return res.status(404).json({ message: 'Participation not found' });
      }
      res.json(participation);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  createParticipation: async (req, res) => {
    try {
      const newParticipation = await participationModel.createParticipation(req.body);
      res.status(201).json(newParticipation);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  updateParticipation: async (req, res) => {
    try {
      const updatedParticipation = await participationModel.updateParticipation(
        req.params.id,
        req.body
      );
      if (!updatedParticipation) {
        return res.status(404).json({ message: 'Participation not found' });
      }
      res.json(updatedParticipation);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  deleteParticipation: async (req, res) => {
    try {
      await participationModel.deleteParticipation(req.params.id);
      res.json({ message: 'Participation deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};
