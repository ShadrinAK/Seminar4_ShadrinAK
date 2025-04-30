const eventModel = require('../models/eventModel');

module.exports = {
  getEvents: async (req, res) => {
    try {
      const events = await eventModel.getAllEvents();
      res.json(events);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getEvent: async (req, res) => {
    try {
      const event = await eventModel.getEventById(req.params.id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.json(event);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  createEvent: async (req, res) => {
    try {
      const newEvent = await eventModel.createEvent(req.body);
      res.status(201).json(newEvent);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  updateEvent: async (req, res) => {
    try {
      const updatedEvent = await eventModel.updateEvent(
        req.params.id,
        req.body
      );
      if (!updatedEvent) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.json(updatedEvent);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  deleteEvent: async (req, res) => {
    try {
      await eventModel.deleteEvent(req.params.id);
      res.json({ message: 'Event deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};
