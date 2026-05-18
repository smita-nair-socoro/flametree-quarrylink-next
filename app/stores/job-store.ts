import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { JobDTO } from '@/lib/types/job';

interface JobStore {
  jobs: JobDTO[];
  selectedJob: JobDTO | null;
  isLoading: boolean;
  pendingJobFormTab: string | undefined;
  pendingInvoiceCreate: boolean;

  // Actions
  setJobs: (Jobs: JobDTO[]) => void;
  setSelectedJob: (customer: JobDTO | null) => void;
  setLoading: (loading: boolean) => void;
  setPendingJobFormNav: (tab?: string, openInvoice?: boolean) => void;
  clearPendingJobFormNav: () => void;

  getJobById: (id: number) => JobDTO | undefined;
}

export const useJobStore = create<JobStore>()(
  devtools(
    (set, get) => ({
      jobs: [],
      selectedJob: null,
      isLoading: false,
      pendingJobFormTab: undefined,
      pendingInvoiceCreate: false,

      // Actions
      setJobs: (jobs) => set({ jobs }),
      setSelectedJob: (job) => set({ selectedJob: job }),
      setLoading: (loading) => set({ isLoading: loading }),
      setPendingJobFormNav: (tab, openInvoice = false) =>
        set({ pendingJobFormTab: tab, pendingInvoiceCreate: openInvoice }),
      clearPendingJobFormNav: () =>
        set({ pendingJobFormTab: undefined, pendingInvoiceCreate: false }),

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
