// useMedicationStore.js
import { create } from 'zustand';
import { getAllMedications } from '../api';

const useMedicationStore = create((set) => ({
  medications: [],
  isLoading: false,
  error: null,
  selectedMed: null, // optional: track selected med here if needed

  fetchMedications: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getAllMedications();
      const meds = response.data.data || [];
      
      // reset selectedMed if null or deleted
      set({ 
        medications: meds, 
        isLoading: false, 
        selectedMed: meds.length > 0 ? meds[0] : null 
      });
    } catch (error) {
      console.error("Failed to fetch medications", error);
      set({ 
        error: "Failed to load medication list.", 
        isLoading: false, 
        medications: [], 
        selectedMed: null 
      });
    }
  },
}));

export default useMedicationStore;
