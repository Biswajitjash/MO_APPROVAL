import express from 'express';
import authManager from '../utils/authManager.js';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    console.log(`🔐 Login attempt: ${userId}`);

    const result = await authManager.authenticate(userId, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

// Logout
router.post('/logout', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    const result = authManager.logout(token);
    res.json(result);

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

// Verify token
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    const result = authManager.verifyToken(token);

    if (!result.valid) {
      return res.status(401).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({
      success: false,
      error: 'Verification failed'
    });
  }
});

// Get current user
router.get('/me', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    const result = authManager.verifyToken(token);

    if (!result.valid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    res.json({ success: true, user: result.user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user info'
    });
  }
});

// Change password
router.post('/change-password', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const { oldPassword, newPassword } = req.body;

    const verification = authManager.verifyToken(token);

    if (!verification.valid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await authManager.changePassword(
      verification.user.userId,
      oldPassword,
      newPassword
    );

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
});

// Admin: Get all users
router.get('/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    const verification = authManager.verifyToken(token);

    if (!verification.valid || verification.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const users = await authManager.getAllUsers();
    res.json({ success: true, users });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get users'
    });
  }
});

// Admin: Add user
router.post('/users', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    const verification = authManager.verifyToken(token);

    if (!verification.valid || verification.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const result = await authManager.addUser(req.body);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json(result);

  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add user'
    });
  }
});

// Register new user (public endpoint - no auth required)
router.post('/register', async (req, res) => {
  try {
    const { userId, password, name, email, role, plant } = req.body;

    if (!userId || !password || !name || !email) {
      return res.status(400).json({
        success: false,
        error: 'User ID, password, name, and email are required'
      });
    }

    console.log(`📝 Registration attempt: ${userId}`);

    const result = await authManager.addUser({
      userId,
      password,
      name,
      email,
      role: role || 'user',
      plant: plant || ''
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    console.log(`✓ User ${userId} registered successfully`);

    res.json(result);

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

export default router;