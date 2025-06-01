const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const config = require('../config');

/**
 * JWT Utility Service
 * Handles token generation, verification, and refresh functionality
 */
class JWTService {
  constructor() {
    this.accessTokenSecret = config.jwtSecret;
    this.refreshTokenSecret = config.jwtRefreshSecret;
    this.accessTokenExpiry = config.jwtExpire;
    this.refreshTokenExpiry = config.jwtRefreshExpire;
    
    if (!this.accessTokenSecret || !this.refreshTokenSecret) {
      throw new Error('JWT secrets are not configured in environment variables');
    }
  }

  /**
   * Generate access token for user
   * @param {Object} payload - User payload (typically user ID)
   * @returns {String} JWT access token
   */
  generateAccessToken(payload) {
    return jwt.sign(
      payload,
      this.accessTokenSecret,
      {
        expiresIn: this.accessTokenExpiry,
        issuer: 'crm-ai-app',
        audience: 'crm-ai-users'
      }
    );
  }

  /**
   * Generate refresh token for user
   * @param {Object} payload - User payload (typically user ID)
   * @returns {String} JWT refresh token
   */
  generateRefreshToken(payload) {
    return jwt.sign(
      payload,
      this.refreshTokenSecret,
      {
        expiresIn: this.refreshTokenExpiry,
        issuer: 'crm-ai-app',
        audience: 'crm-ai-users'
      }
    );
  }

  /**
   * Generate both access and refresh tokens
   * @param {String} userId - User ID
   * @param {String} email - User email
   * @returns {Object} Object containing both tokens
   */
  generateTokenPair(userId, email) {
    const payload = {
      id: userId,
      email: email,
      type: 'access'
    };

    const refreshPayload = {
      id: userId,
      email: email,
      type: 'refresh'
    };

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(refreshPayload),
      expiresIn: this.accessTokenExpiry
    };
  }

  /**
   * Verify access token
   * @param {String} token - JWT token to verify
   * @returns {Promise<Object>} Decoded token payload
   */
  async verifyAccessToken(token) {
    try {
      const decoded = await promisify(jwt.verify)(token, this.accessTokenSecret, {
        issuer: 'crm-ai-app',
        audience: 'crm-ai-users'
      });
      
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type');
      }
      
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Access token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid access token');
      } else if (error.name === 'NotBeforeError') {
        throw new Error('Access token not active yet');
      }
      throw error;
    }
  }

  /**
   * Verify refresh token
   * @param {String} token - JWT refresh token to verify
   * @returns {Promise<Object>} Decoded token payload
   */
  async verifyRefreshToken(token) {
    try {
      const decoded = await promisify(jwt.verify)(token, this.refreshTokenSecret, {
        issuer: 'crm-ai-app',
        audience: 'crm-ai-users'
      });
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }
      
      return decoded;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Refresh token has expired');
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error('Invalid refresh token');
      } else if (error.name === 'NotBeforeError') {
        throw new Error('Refresh token not active yet');
      }
      throw error;
    }
  }

  /**
   * Extract token from Authorization header
   * @param {String} authHeader - Authorization header value
   * @returns {String|null} Extracted token or null
   */
  extractTokenFromHeader(authHeader) {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  /**
   * Get token expiration time
   * @param {String} token - JWT token
   * @returns {Date|null} Expiration date or null if invalid
   */
  getTokenExpiration(token) {
    try {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) {
        return new Date(decoded.exp * 1000);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   * @param {String} token - JWT token
   * @returns {Boolean} True if expired, false otherwise
   */
  isTokenExpired(token) {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;
    return expiration < new Date();
  }

  /**
   * Decode token without verification (for debugging)
   * @param {String} token - JWT token
   * @returns {Object|null} Decoded payload or null
   */
  decodeToken(token) {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate a new access token from a valid refresh token
   * @param {String} refreshToken - Valid refresh token
   * @returns {Promise<Object>} New token pair
   */
  async refreshAccessToken(refreshToken) {
    const decoded = await this.verifyRefreshToken(refreshToken);
    
    // Generate new access token with same user info
    return this.generateTokenPair(decoded.id, decoded.email);
  }
}

// Create and export singleton instance
const jwtService = new JWTService();

module.exports = jwtService; 