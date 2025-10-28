'use client';
import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TeamMember } from '@/lib/types/team-member';
import { AlertTriangle, Users, FileText, Briefcase } from 'lucide-react';
import { FormSelect } from '@/components/ui/form-select';
import { Form } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Mock data for team members
const MOCK_TEAM_MEMBERS = [
  { id: '1', name: 'Sarah Johnson' },
  { id: '2', name: 'Michael Chen' },
  { id: '3', name: 'Emily Rodriguez' },
  { id: '4', name: 'David Kim' },
  { id: '5', name: 'Jessica Williams' },
];

// Mock data for active jobs
const MOCK_ACTIVE_JOBS = [
  { id: '1', name: 'Construction Project Alpha', location: 'Downtown Site A' },
  { id: '2', name: 'Renovation Project Beta', location: 'Uptown Building B' },
  {
    id: '3',
    name: 'Infrastructure Project Gamma',
    location: 'Industrial Zone C',
  },
];

// Form schema
const deleteTeamMemberSchema = z.object({
  accountManagerReassignTo: z.string().min(1, 'Please select a team member'),
  jobReassignTo: z.string().min(1, 'Please select a job assignee'),
  keepHistoricalRecords: z.boolean(),
  deletionReason: z.string().min(1, 'Deletion reason is required'),
});

type DeleteTeamMemberFormValues = z.infer<typeof deleteTeamMemberSchema>;

interface DeleteTeamMemberModalProps {
  teamMember: TeamMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTeamMemberModal({
  teamMember,
  open,
  onOpenChange,
}: DeleteTeamMemberModalProps) {
  const [keepHistoricalRecords, setKeepHistoricalRecords] =
    React.useState(true);

  const form = useForm<DeleteTeamMemberFormValues>({
    resolver: zodResolver(deleteTeamMemberSchema),
    defaultValues: {
      accountManagerReassignTo: '',
      jobReassignTo: '',
      keepHistoricalRecords: true,
      deletionReason: '',
    },
  });

  // Mock data - in real implementation, these would come from API
  const customerCount = 8;
  const quotationCount = 15;
  const activeJobsCount = 3;

  // Convert mock data to FormSelectOption format
  const teamMemberOptions = MOCK_TEAM_MEMBERS.map((member) => ({
    label: member.name,
    value: member.id,
  }));

  const jobOptions = MOCK_ACTIVE_JOBS.map((job) => ({
    label: `${job.name} - ${job.location}`,
    value: job.id,
  }));

  const onSubmit = (data: DeleteTeamMemberFormValues) => {
    // TODO: Implement actual delete logic
    console.log('Deleting user:', {
      teamMember,
      ...data,
    });
    onOpenChange(false);
    form.reset();
  };

  const handleCancel = () => {
    form.reset();
    setKeepHistoricalRecords(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Delete User: {teamMember.user_name}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            This user has dependencies that need to be reassigned before
            deletion can proceed.
          </p>

          <div className="bg-orange-50 border border-orange-200 rounded-md p-3">
            <p className="text-sm text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              This user has data that needs reassignment:
            </p>
          </div>

          {/* Account Manager Section */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4 text-blue-600" />
              Account Manager for {customerCount} customers
            </div>
            <FormSelect
              control={form.control}
              name="accountManagerReassignTo"
              label="Reassign to:"
              searchLabel="team member"
              options={teamMemberOptions}
              placeholder="Select team member..."
              popoverWidthClass="w-[300px]"
            />
          </div>

          {/* Quotations Section */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileText className="h-4 w-4 text-green-600" />
              Created {quotationCount} quotations
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="keep-historical"
                checked={keepHistoricalRecords}
                onCheckedChange={(checked) =>
                  setKeepHistoricalRecords(checked as boolean)
                }
              />
              <label
                htmlFor="keep-historical"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Keep as &quot;{teamMember.user_name}&quot; (Historical records)
              </label>
            </div>
          </div>

          {/* Active Jobs Section */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Briefcase className="h-4 w-4 text-purple-600" />
              Assigned to {activeJobsCount} active jobs
            </div>
            <FormSelect
              control={form.control}
              name="jobReassignTo"
              label="Reassign to:"
              searchLabel="job"
              options={jobOptions}
              placeholder="Select job assignee..."
              popoverWidthClass="w-[400px]"
            />
          </div>

          {/* Deletion Reason */}
          <div className="space-y-2">
            <Label htmlFor="deletion-reason" className="text-red-600">
              Deletion Reason (required):
            </Label>
            <Textarea
              id="deletion-reason"
              placeholder="e.g., Employee left company"
              {...form.register('deletionReason')}
              className="min-h-[80px]"
            />
            {form.formState.errors.deletionReason && (
              <p className="text-sm text-red-600">
                {form.formState.errors.deletionReason.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={!form.formState.isValid}
            >
              Delete & Reassign
            </Button>
          </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
