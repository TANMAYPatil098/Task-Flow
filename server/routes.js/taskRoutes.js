const express = require('express');
const Task = require('../models/Task');
const Section = require('../models/Section');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { title, description, dueDate, section, priority } = req.body;
    
    if (section) {
      const sectionDoc = await Section.findOne({
        _id: section,
        user: req.user._id
      });
      
      if (!sectionDoc) {
        return res.status(404).json({ message: 'Section not found' });
      }
    }
    
    const task = new Task({
      title,
      description,
      dueDate,
      section,
      priority: priority || 'medium',
      status: 'pending',
      user: req.user._id,
      order: await Task.countDocuments({ section, user: req.user._id })
    });
    
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const { section, status } = req.query;
    const query = { user: req.user._id };
    
    if (section) query.section = section;
    if (status) query.status = status;
    
    const tasks = await Task.find(query).sort('order');
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, dueDate, section, priority, status, order } = req.body;
    
    const task = await Task.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }


    if (section && section !== task.section?.toString()) {
      const sectionDoc = await Section.findOne({
        _id: section,
        user: req.user._id
      });
      
      if (!sectionDoc) {
        return res.status(404).json({ message: 'Section not found' });
      }
    }
    
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (dueDate) task.dueDate = dueDate;
    if (section) task.section = section;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (order !== undefined) task.order = order;
    
    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/reorder', auth, async (req, res) => {
  try {
    const { tasks } = req.body;
    
    for (const task of tasks) {
      const taskExists = await Task.findOne({
        _id: task.id,
        user: req.user._id
      });
      
      if (!taskExists) {
        return res.status(404).json({ message: `Task ${task.id} not found` });
      }
    }
    
    const bulkOps = tasks.map(task => ({
      updateOne: {
        filter: { _id: task.id },
        update: { 
          order: task.order,
          section: task.section 
        }
      }
    }));
    
    await Task.bulkWrite(bulkOps);
    res.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;