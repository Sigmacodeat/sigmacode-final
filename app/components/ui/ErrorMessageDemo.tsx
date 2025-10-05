import React from 'react';
import { ErrorMessage } from './ErrorMessage';

export function ErrorMessageDemo() {
  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold mb-4">Error Message Demo</h2>

      <ErrorMessage
        title="Validation Error"
        message="Please fill in all required fields before submitting."
      />

      <ErrorMessage
        title="Network Error"
        message="Unable to connect to the server. Please check your internet connection and try again."
      />

      <ErrorMessage
        title="Authentication Required"
        message="Your session has expired. Please log in again to continue."
      />

      <ErrorMessage
        title="Permission Denied"
        message="You don't have permission to perform this action."
      />
    </div>
  );
}
