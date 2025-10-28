// Simple logging utility for production error tracking
class Logger {
  private static isDevelopment = process.env.NODE_ENV === 'development';

  static info(message: string, data?: any) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, data || '');
    }
  }

  static warn(message: string, data?: any) {
    console.warn(`[WARN] ${message}`, data || '');
  }

  static error(message: string, error?: any) {
    console.error(`[ERROR] ${message}`, error || '');
    
    // In production, send to error tracking service
    if (!this.isDevelopment) {
      this.sendToErrorService({ message, error, type: 'error' });
    }
  }

  static logOrderError(orderId: string, error: any) {
    const errorData = {
      orderId,
      error: error.message || error,
      timestamp: new Date().toISOString(),
      stack: error.stack
    };
    
    this.error('Order placement failed', errorData);
  }

  static logRestaurantLoadError(error: any) {
    const errorData = {
      error: error.message || error,
      timestamp: new Date().toISOString(),
      graphqlErrors: error.graphQLErrors,
      networkError: error.networkError
    };
    
    this.error('Restaurant loading failed', errorData);
  }

  static logCartError(action: string, error: any) {
    const errorData = {
      action,
      error: error.message || error,
      timestamp: new Date().toISOString()
    };
    
    this.error(`Cart ${action} failed`, errorData);
  }

  private static sendToErrorService(errorData: any) {
    // Simple error tracking - in production you'd use proper error service
    try {
      const payload = {
        ...errorData,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.getUserId()
      };
      
      // For now, just log to console
      console.error('Production Error Logged:', payload);
      
      // In production, send to error tracking service:
      // fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload)
      // }).catch(console.error);
      
    } catch (err) {
      console.error('Failed to log error:', err);
    }
  }

  private static getUserId(): string | null {
    // Get user ID from localStorage, cookies, or auth context
    try {
      return localStorage.getItem('userId') || null;
    } catch {
      return null;
    }
  }
}

// Error tracking hooks for React components
export const useErrorTracker = () => {
  const trackError = (error: any, context?: string) => {
    Logger.error(context || 'Component error', error);
  };

  const trackOrderError = (orderId: string, error: any) => {
    Logger.logOrderError(orderId, error);
  };

  const trackCartError = (action: string, error: any) => {
    Logger.logCartError(action, error);
  };

  return { trackError, trackOrderError, trackCartError };
};

export default Logger;