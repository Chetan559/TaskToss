export const storage = {
  save: <T>(key: string, data: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  load: <T>(key: string): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      return null;
    }
  },

  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },
};

export const STORAGE_KEYS = {
  SINGLE_LIST: 'randomPicker_singleList',
  SINGLE_HISTORY: 'randomPicker_singleHistory',
  DUAL_LIST_A: 'randomPicker_dualListA',
  DUAL_LIST_B: 'randomPicker_dualListB',
  DUAL_HISTORY: 'randomPicker_dualHistory',
};
