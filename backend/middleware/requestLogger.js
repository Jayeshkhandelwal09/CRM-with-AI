const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override res.end to capture response details
  res.end = function(chunk, encoding) {
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Get user info if available
    const userId = req.user ? req.user.id : 'anonymous';
    const userEmail = req.user ? req.user.email : 'anonymous';
    
    // Get request details
    const method = req.method;
    const url = req.originalUrl || req.url;
    const statusCode = res.statusCode;
    const userAgent = req.get('User-Agent') || 'unknown';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    
    // Create log entry
    const logEntry = {
      timestamp: new Date().toISOString(),
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`,
      userId,
      userEmail,
      ip,
      userAgent: userAgent.substring(0, 200), // Truncate long user agents
      requestSize: req.get('Content-Length') || 0,
      responseSize: res.get('Content-Length') || 0
    };
    
    // Determine log level based on status code
    let logLevel = 'info';
    if (statusCode >= 400 && statusCode < 500) {
      logLevel = 'warn';
    } else if (statusCode >= 500) {
      logLevel = 'error';
    }
    
    // Format log message
    const logMessage = `${method} ${url} ${statusCode} ${responseTime}ms - User: ${userEmail} (${userId}) - IP: ${ip}`;
    
    // Log to console (in production, you might want to use a proper logging service)
    if (logLevel === 'error') {
      console.error(`[ERROR] ${logMessage}`, logEntry);
    } else if (logLevel === 'warn') {
      console.warn(`[WARN] ${logMessage}`, logEntry);
    } else {
      console.log(`[INFO] ${logMessage}`);
    }
    
    // Log slow requests (> 1 second)
    if (responseTime > 1000) {
      console.warn(`[SLOW REQUEST] ${logMessage} - Response time exceeded 1 second`);
    }
    
    // Call original end function
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

module.exports = requestLogger; 