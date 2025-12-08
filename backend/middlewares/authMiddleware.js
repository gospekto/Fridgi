const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const header = req.headers['authorization'];

  if (!header) return res.status(401).json({ message: "Brak tokenu" });

  const token = header.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Niepoprawny token" });

    req.user = decoded;
    next();
  });
};
