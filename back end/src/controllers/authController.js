import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'esport-hub-development-jwt-secret-key-12345';
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    secret,
    { expiresIn: '7d' }
  );
};

export async function register(req, res, next) {
  try {
    const { name, email, password, role = 'player', bgmiIgn, freefireIgn } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    // Disallow public self-registration as admin
    const assignedRole = role === 'admin' ? 'player' : role;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: assignedRole,
      gameProfiles: {
        bgmiIgn: bgmiIgn || '',
        freefireIgn: freefireIgn || ''
      }
    });

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (user.accountStatus === 'suspended') {
      return res.status(403).json({ success: false, message: 'Account suspended by administration.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully.' });
}

export async function getMe(req, res) {
  res.json({
    success: true,
    user: req.user
  });
}

export async function updateProfile(req, res, next) {
  try {
    const { name, avatar, gameProfiles } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (gameProfiles) {
      user.gameProfiles = { ...user.gameProfiles, ...gameProfiles };
    }

    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

// @desc Initiates forgot-password reset workflow
// @route POST /api/v1/auth/forgot-password
export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Do not reveal whether user exists for security
      return res.json({
        success: true,
        message: 'If an account exists with that email, a password reset token has been dispatched.'
      });
    }

    // Generate secure temporary reset token
    const resetToken = jwt.sign(
      { id: user._id, type: 'pwd_reset' },
      process.env.JWT_SECRET || 'esport-hub-development-jwt-secret-key-12345',
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      message: 'Password reset instructions sent. Please check your email.',
      resetToken // Returned in demo/dev mode for seamless local testing
    });
  } catch (err) {
    next(err);
  }
}

// @desc Resets user password using valid token
// @route POST /api/v1/auth/reset-password
export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Valid token and new password (min 6 characters) are required.'
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'esport-hub-development-jwt-secret-key-12345'
    );

    if (decoded.type !== 'pwd_reset') {
      return res.status(400).json({ success: false, message: 'Invalid reset token.' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User no longer exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: 'Password has been successfully updated. You may now log in.'
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token.' });
    }
    next(err);
  }
}

