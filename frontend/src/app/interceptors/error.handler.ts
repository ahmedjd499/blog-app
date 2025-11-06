import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: Error): void {
    console.error('Global error handler:', error);
    
    // You can add more sophisticated error handling here
    // For example, send errors to a logging service
    
    // Show user-friendly error message
    const message = this.getErrorMessage(error);
    
    // You could use a toast service here instead of alert
    if (message && !message.includes('ExpressionChangedAfterItHasBeenCheckedError')) {
      console.error(message);
    }
  }

  private getErrorMessage(error: Error): string {
    if (!error) return 'An unknown error occurred';
    
    // Handle different types of errors
    if (error.message) {
      return error.message;
    }
    
    return 'An unexpected error occurred';
  }
}
