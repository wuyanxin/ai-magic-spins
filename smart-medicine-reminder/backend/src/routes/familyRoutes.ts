import express from 'express';
import FamilyMember from '../models/FamilyMember';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const members = await FamilyMember.find();
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const member = await FamilyMember.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Family member not found' });
    }
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.post('/', async (req, res) => {
  try {
    const newMember = new FamilyMember(req.body);
    const savedMember = await newMember.save();
    res.status(201).json(savedMember);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedMember = await FamilyMember.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedMember) {
      return res.status(404).json({ message: 'Family member not found' });
    }
    res.json(updatedMember);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedMember = await FamilyMember.findByIdAndDelete(req.params.id);
    if (!deletedMember) {
      return res.status(404).json({ message: 'Family member not found' });
    }
    res.json({ message: 'Family member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;