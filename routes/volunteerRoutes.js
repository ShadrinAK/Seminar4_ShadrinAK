const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteerController');

router.get('/', volunteerController.getVolunteers);
router.get('/:id', volunteerController.getVolunteer);
router.post('/', volunteerController.createVolunteer);
router.put('/:id', volunteerController.updateVolunteer);
router.delete('/:id', volunteerController.deleteVolunteer);

module.exports = router;
