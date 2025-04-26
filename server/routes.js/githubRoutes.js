const express = require('express');
const GithubRepo = require('../models/GithubRepo');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { name, url, token } = req.body;
    
    const repo = new GithubRepo({
      name,
      url,
      token: token ? token : null,
      user: req.user._id
    });
    
    await repo.save();
    res.status(201).json(repo);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const repos = await GithubRepo.find({ user: req.user._id });
    res.json(repos);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const repo = await GithubRepo.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!repo) {
      return res.status(404).json({ message: 'Repository not found' });
    }
    
    res.json({ message: 'Repository removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;