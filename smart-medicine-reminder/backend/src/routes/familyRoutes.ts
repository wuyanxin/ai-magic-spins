import express from 'express';
import FamilyMember from '../models/FamilyMember';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const members = await FamilyMember.findAll();
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const member = await FamilyMember.findByPk(req.params.id);
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
    const newMember = await FamilyMember.create(req.body);
    res.status(201).json(newMember);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const [updated] = await FamilyMember.update(req.body, {
      where: { id: req.params.id }
    });
    if (!updated) {
      return res.status(404).json({ message: 'Family member not found' });
    }
    const updatedMember = await FamilyMember.findByPk(req.params.id);
    res.json(updatedMember);
  } catch (error) {
    res.status(400).json({ message: (error as Error).message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deleted = await FamilyMember.destroy({
      where: { id: req.params.id }
    });
    if (!deleted) {
      return res.status(404).json({ message: 'Family member not found' });
    }
    res.json({ message: 'Family member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
});

export default router;