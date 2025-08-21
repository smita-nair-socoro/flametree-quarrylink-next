'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { QuotationDetails } from '@/lib/types/quotation';
import { EnhancedConfirmDialog } from '@/components/enhanced-confirm-dialog';
import QuotationForm from '@/app/(protected)/customer-operations/quotation/(components)/forms/quotation-form';
import { QuotationActionButtons } from '@/app/(protected)/customer-operations/quotation/(components)/forms/quotation-action-buttons';

interface DialogAdditionalInfo {
  label: string;
  value: string;
}

interface DialogConfig {
  title: string;
  description: string;
  details: string[];
  content?: string;
  confirmText: string;
  confirmVariant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost';
  confirmCustomColor?: string;
  confirmCustomClass?: string;
}

const dialogConfigs: Record<string, DialogConfig> = {
  sendToCustomer: {
    title: 'Confirm Sending Quote To Customer',
    description: 'Are you sure you want to send this quote to the customer?',
    details: [
      'Change quote status from Draft to Pending',
      'Generate and email a PDF quote to the customer',
      'Start the approval process',
      'The quote can no longer be edited',
    ],
    confirmText: 'Send Quote',
    confirmVariant: 'default',
  },

  approve: {
    title: 'Approve Quote',
    description: 'Are you sure you want to approve this quote?',
    details: [
      'Change quote status from Pending to Approved',
      'Lock the quote from further edits',
      'Make the quote ready for job conversion',
      'Notify relevant team members',
    ],
    confirmText: 'Approve Quote',
    confirmCustomClass:
      'bg-green-900 hover:bg-green-800 text-white border-green-700',
  },

  decline: {
    title: 'Are you sure you want to decline this quote?',
    description: '',
    details: [
      'Change quote status from Pending to Declined',
      'Lock the quote from further edits',
      'Notify the customer of the declined status',
      'Remove quote from active pending list',
      'Quote can be reactivated later if needed',
    ],
    confirmText: 'Decline Quote',
    confirmVariant: 'destructive',
  },

  convertToJob: {
    title: 'Convert Quote to Job',
    description: '',
    content: 'Are you sure you want to convert this quote to a job?',
    details: [
      'Create a new job (JOB###) from this quote',
      'Copy all line items to the new job',
      'Change quote status to "Converted to Job"',
      'This action cannot be undone',
    ],
    confirmText: 'Create Job',
    confirmCustomClass:
      'bg-blue-900 hover:bg-blue-800 text-white border-blue-700',
  },

  extendExpiry: {
    title: 'Confirm Extending Expiry Date',
    description: 'Extend the expiry date for this quote?',
    details: [
      'Change quote status from Expired to Pending',
      'Set new expiry date (14 days from today)',
      'Allow quote editing and modifications',
      'Enable sending to customer for approval again',
    ],
    confirmText: 'Extend Expiry Date',
    confirmCustomClass:
      'bg-green-900 hover:bg-green-800 text-white border-green-700',
  },

  archive: {
    title: 'Confirm Quote To Be Archived?',
    description: 'Are you sure you want to archive this quotation?',
    details: [
      'This action cannot be undone',
      'All quote data will be archived',
    ],
    confirmText: 'Archive Quote',
    confirmVariant: 'destructive',
  },
};

export function useQuotationActions(
  quotationId: number | undefined,
  quotationData?: QuotationDetails | null,
) {
  const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
  const [viewOpen, setViewOpen] = React.useState(false);

  const createDialogAction = (
    dialogType: keyof typeof dialogConfigs,
    action: () => void,
  ) => {
    return () => {
      setActiveDialog(dialogType);
    };
  };

  const actions = {
    duplicate: () => {
      console.log('Duplicate quotation:', quotationId);
      // TODO: implement duplicate logic
    },

    sendToCustomer: createDialogAction('sendToCustomer', () => {
      console.log('Send to customer:', quotationId);
      // TODO: implement send to customer mutation logic
    }),

    approve: createDialogAction('approve', () => {
      console.log('Approve quotation:', quotationId);
      // TODO: implement approve logic
    }),

    decline: createDialogAction('decline', () => {
      console.log('Decline quotation:', quotationId);
      // TODO: implement decline logic
    }),

    convertToJob: createDialogAction('convertToJob', () => {
      console.log('Convert to job:', quotationId);
      // TODO: implement convert to job logic
    }),

    extendExpiry: createDialogAction('extendExpiry', () => {
      console.log('Extend expiry:', quotationId);
      // TODO: implement extend expiry logic
    }),

    view: () => {
      setViewOpen(true);
    },

    download: () => {
      console.log('Download quotation:', quotationId);
      // TODO: implement download logic
    },

    print: () => {
      console.log('Print quotation:', quotationId);
      // TODO: implement print logic
    },

    archive: createDialogAction('archive', () => {
      console.log('Archive quotation:', quotationId);
      // TODO: implement delete logic
    }),
  };

  // Generate additional info based on dialog type and quotation data
  const getAdditionalInfo = (dialogType: string): DialogAdditionalInfo[] => {
    const info: DialogAdditionalInfo[] = [];

    if (!quotationData) return info;

    // Customer Email for send to customer
    if (quotationData.customer?.email && dialogType === 'sendToCustomer') {
      info.push({
        label: 'Customer Email',
        value: quotationData.customer.email,
      });
    }

    // Quote Total (using total_sell_price)
    if (quotationData.total_sell_price) {
      info.push({
        label: 'Quote Total',
        value: `$${quotationData.total_sell_price.toLocaleString()}`,
      });
    }

    // Customer Name (business_name or contact_name)
    if (quotationData.customer) {
      const customerName =
        quotationData.customer.business_name ||
        quotationData.customer.contact_name;
      if (customerName) {
        info.push({ label: 'Customer', value: customerName });
      }
    }

    // Project Name for convert to job
    if (quotationData.project_name && dialogType === 'convertToJob') {
      info.push({ label: 'Project', value: quotationData.project_name });
    }

    // Line Items count for convert to job
    if (quotationData.quote_items?.length && dialogType === 'convertToJob') {
      info.push({
        label: 'Line Items',
        value: `${quotationData.quote_items.length} products`,
      });
    }

    // Current Expiry for extend expiry
    if (quotationData.expiry_date && dialogType === 'extendExpiry') {
      // TODO: Format date properly
      info.push({ label: 'Current Expiry', value: quotationData.expiry_date });
    }

    return info;
  };

  // Render active dialog
  const confirmDialogs = Object.entries(dialogConfigs).map(([key, config]) => {
    if (activeDialog !== key) return null;

    return (
      <EnhancedConfirmDialog
        key={key}
        open={true}
        onOpenChangeAction={() => setActiveDialog(null)}
        title={config.title}
        description={config.description}
        content={config.content}
        details={config.details}
        additionalInfo={getAdditionalInfo(key)}
        confirmText={config.confirmText}
        confirmVariant={config.confirmVariant}
        confirmCustomColor={config.confirmCustomColor}
        confirmCustomClass={config.confirmCustomClass}
        onConfirmAction={() => {
          switch (key) {
            case 'sendToCustomer':
              console.log('Send to customer:', quotationId, quotationData);
              // TODO: implement send to customer mutation logic
              break;
            case 'approve':
              console.log('Approve quotation:', quotationId, quotationData);
              // TODO: implement approve logic
              break;
            case 'decline':
              console.log('Decline quotation:', quotationId, quotationData);
              // TODO: implement decline logic
              break;
            case 'convertToJob':
              console.log('Convert to job:', quotationId, quotationData);
              // TODO: implement convert to job logic
              break;
            case 'extendExpiry':
              console.log('Extend expiry:', quotationId, quotationData);
              // TODO: implement extend expiry logic
              break;
            case 'archive':
              console.log('Archive quotation:', quotationId, quotationData);
              // TODO: implement archive logic
              break;
          }
        }}
      />
    );
  });

  const viewDialog = (
    <FormDialog
      id={quotationId}
      dialogTitle="View / Edit Quotation"
      open={viewOpen}
      onOpenChangeAction={setViewOpen}
      headerButtons={<QuotationActionButtons quotation={quotationData} />}
      hideTrigger
      headerInfo={{
        useSelectedQuotation: true,
      }}
    >
      <QuotationForm />
    </FormDialog>
  );

  return {
    actions,
    confirmDialogs,
    viewDialog,
  };
}
