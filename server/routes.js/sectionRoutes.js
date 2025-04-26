const express = require('express');
const Section = require('../models/Section');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { title } = req.body;
    
    const section = new Section({
      title,
      user: req.user._id,
      order: await Section.countDocuments({ user: req.user._id })
    });
    
    await section.save();
    res.status(201).json(section);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const sections = await Section.find({ user: req.user._id }).sort('order');
    res.json(sections);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, order } = req.body;
    
    const section = await Section.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    if (title) section.title = title;
    if (order !== undefined) section.order = order;
    
    await section.save();
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const section = await Section.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!section) {
      return res.status(404).json({ message: 'Section not found' });
    }
    
    await Task.deleteMany({ section: req.params.id });
    
    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;