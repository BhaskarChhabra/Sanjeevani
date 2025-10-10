// reminderUtils.js

/**
 * Helper function to get the current day code (e.g., 'TH')
 * Matches Mongoose schema values: ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']
 * @returns {string} Two-letter day code.
 */
export const getCurrentDayCode = () => {
    // Date.getDay() returns 0 for Sunday, 1 for Monday, etc.
    const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    return days[new Date().getDay()];
};