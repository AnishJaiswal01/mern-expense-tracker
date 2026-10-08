import jwt from 'jsonwebtoken';

/**
 * Protect middleware — verifies the Bearer token on incoming requests.
 * Attaches decoded userId to `req.user`.
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized — no token' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized — token invalid' });
  }
};

export default protect;
