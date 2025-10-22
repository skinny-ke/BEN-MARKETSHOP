const User = require('../Models/User');
const jwt = require('jsonwebtoken');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });
    user = new User({ name, email, password });
    await user.save();
    const token = user.generateAccessToken();
    const refresh = user.generateRefreshToken();
    user.refreshToken = refresh;
    await user.save();
    res.json({ token, refresh, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = user.generateAccessToken();
    const refresh = user.generateRefreshToken();
    user.refreshToken = refresh;
    await user.save();
    res.json({ token, refresh, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { next(err); }
};

exports.logout = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.refreshToken = null;
    await user.save();
    res.json({ message: 'Logged out' });
  } catch (err) { next(err); }
};
