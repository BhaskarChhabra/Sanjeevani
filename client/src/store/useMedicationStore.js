import { create } from 'zustand';
import { getAllMedications, getDoseLogs } from '../api';

const useMedicationStore = create((set) => ({
  medications: [],
  isLoading: false,
  error: null,

  fetchMedications: async () => {
    set({ isLoading: true, error: null });
    try {
      // 1️⃣ Fetch all medications
      const res = await getAllMedications();
      const meds = res.data.data || [];

      // 2️⃣ Fetch dose logs for each medication (parallel)
      const doseLogsPromises = meds.map((med) => getDoseLogs(med._id));
      const doseLogsResponses = await Promise.allSettled(doseLogsPromises);

      // 3️⃣ Combine dose logs into one array
      const allLogs = doseLogsResponses
        .filter((r) => r.status === "fulfilled")
        .flatMap((r) => r.value.data.data || []);

      // 4️⃣ Compute Taken/Missed per medication
      const medsWithStats = meds.map((med) => {
        const medLogs = allLogs.filter((log) => log.medication === med._id);
        const taken = medLogs.filter((log) => log.status === "Taken").length;
        const missed = medLogs.filter((log) => log.status === "Missed").length;

        return {
          ...med,
          taken,
          missed,
          totalDoses: taken + missed
        };
      });

      set({ medications: medsWithStats, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch medications or dose logs", error);
      set({
        error: "Failed to load medication list.",
        isLoading: false,
        medications: [],
      });
    }
  },
}));

export default useMedicationStore;
