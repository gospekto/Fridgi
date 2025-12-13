const bcrypt = require('bcrypt');
const User = require('../models/User');
const UserToken = require('../models/UserToken');
const { generateAccessToken, generateRefreshToken } = require('../utils/auth');
const { Op } = require('sequelize');
const config = require('../config');

module.exports = {

  register: async (req, res) => {
    try {
      const { email, password, name } = req.body;

      const existing = await User.findOne({ where: { email } });
      if (existing)
        return res.status(400).json({ message: "Email już istnieje" });

      const hash = await bcrypt.hash(password, 10);

      const user = await User.create({
        email,
        password_hash: hash,
        name
      });

      res.json({ message: "Utworzono użytkownika", user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Błąd serwera" });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user)
        return res.status(400).json({ message: "Błędne dane logowania" });

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok)
        return res.status(400).json({ message: "Błędne dane logowania" });

      const accessToken = generateAccessToken(user);
      const refreshToken = generateRefreshToken(user);

      await UserToken.create({
        user_id: user.id,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + 30*24*60*60*1000)
      });

      res.json({
        accessToken,
        refreshToken,
        user
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Błąd serwera" });
    }
  },

  refresh: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken)
        return res.status(401).json({ message: "Brak refreshToken" });

      const stored = await UserToken.findOne({
        where: {
          refresh_token: refreshToken,
          expires_at: { [Op.gt]: new Date() }
        }
      });

      if (!stored)
        return res.status(403).json({ message: "Refresh token nieprawidłowy lub wygasł" });

      const jwt = require('jsonwebtoken');

      jwt.verify(refreshToken, config.JWT_REFRESH_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ message: "Refresh token nieważny" });

        const user = await User.findByPk(decoded.id);
        if (!user)
          return res.status(404).json({ message: "Użytkownik nie istnieje" });

        const newAccess = generateAccessToken(user);
        const newRefresh = generateRefreshToken(user);

        stored.refresh_token = newRefresh;
        stored.expires_at = new Date(Date.now() + 30*24*60*60*1000);
        await stored.save();

        res.json({
          accessToken: newAccess,
          refreshToken: newRefresh
        });
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Błąd serwera" });
    }
  }
};
