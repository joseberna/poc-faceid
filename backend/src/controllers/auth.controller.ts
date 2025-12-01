import { Request, Response } from 'express';
import { User } from '../models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function euclideanDistance(desc1: number[], desc2: number[]): number {
  if (desc1.length !== desc2.length) return 1.0;
  return Math.sqrt(
    desc1
      .map((val, i) => val - desc2[i])
      .reduce((sum, diff) => sum + diff * diff, 0)
  );
}

export const register = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, faceDescriptor } = req.body;

    if (!fullName || !email || !password || !faceDescriptor) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // RF-15: Check for duplicate face
    const allUsers = await User.find({}, 'faceDescriptor');
    for (const u of allUsers) {
      const dist = euclideanDistance(faceDescriptor, u.faceDescriptor);
      if (dist < 0.45) {
        return res.status(400).json({ error: 'This face is already registered' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      faceDescriptor,
    });

    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, faceDescriptor } = req.body;

    if (!email || !faceDescriptor) {
      return res.status(400).json({ error: 'Email and face scan required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify Face
    const dist = euclideanDistance(faceDescriptor, user.faceDescriptor);
    if (dist > 0.45) {
      return res.status(401).json({ error: 'Face verification failed' });
    }

    // Generate Token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.fullName, points: user.points },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
