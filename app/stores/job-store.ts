import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Job } from '@/lib/types/job';

interface JobStore {
  jobs: Job[];
  selectedJob: Job | null;
  isLoading: boolean;

  // Actions
  setJobs: (Jobs: Job[]) => void;
  setSelectedJob: (customer: Job | null) => void;
  setLoading: (loading: boolean) => void;

  getJobById: (id: number) => Job | undefined;
}

export const useJobStore = create<JobStore>()(
  devtools(
    (set, get) => ({
      jobs: [],
      selectedJob: null,
      isLoading: false,

      // Actions
      setJobs: (jobs) => set({ jobs }),

      setSelectedJob: (job) => set({ selectedJob: job }),
      setLoading: (loading) => set({ isLoading: loading }),

      // Selectors
      getJobById: (id) => {
        const state = get();
        return state.jobs.find((j) => j.id === id);
      },
    }),
    { name: 'job-store' },
  ),
);

export const useSelectedJob = () => useJobStore((state) => state.selectedJob);

export const useJobs = () => useJobStore((state) => state.jobs);

export const useJobLoading = () => useJobStore((state) => state.isLoading);

export const useJobById = (id: number) => {
  return useJobStore((state) => state.jobs.find((j) => j.id === id));
};
