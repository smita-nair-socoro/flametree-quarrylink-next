'use client';
import * as React from 'react';
import { FormDialog } from '@/components/form-dialog';
import { JobLineItem, jobItems } from '@/lib/types/job';
import JobLineItemForm from '@/app/(protected)/customer-operations/jobs/(components)/forms/job-line-item-form';
import { ActionDialog } from '@/components/action-dialog';
import { JobLineItemActionButtons } from '@/app/(protected)/customer-operations/jobs/(components)/forms/job-line-item-action-buttons';
import { Trash2 } from 'lucide-react';
import { centsToDollars } from '@/lib/utils/currency';
import { useSelectedJob } from '@/app/stores/job-store';

interface DialogConfig {
	title?: string;
	description?: React.ReactNode;
	content?: React.ReactNode;
	confirmText?: string;
	confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
	confirmCustomColor?: string;
	confirmCustomClass?: string;
	confirmIcon?: React.ReactNode;
	confirmActionNeeded?: boolean;
}

interface SelectedAction {
	key: string;
}

// Will change once we have the actual API endpoints
const getDialogConfigs = (
	lineItemData?: JobLineItem | jobItems | null,
	selectedAction?: SelectedAction
): Record<string, DialogConfig> => {
	const lineItemName = 'productName' in (lineItemData || {}) 
		? (lineItemData as JobLineItem).productName 
		: (lineItemData as jobItems)?.product?.productName;
	
	const productCode = 'supplierProductName' in (lineItemData || {})
		? (lineItemData as JobLineItem).supplierProductName
		: (lineItemData as jobItems)?.product?.productCode;

	const totalSellPrice = centsToDollars(
		lineItemData?.totalProductSellPrice || 0
	);
	const productQty = lineItemData?.productSellQty;
	const productUom = lineItemData?.productSellUom;

	if (selectedAction?.key === 'remove') {
		return {
			remove: {
				title: 'Remove Line Item',
				description: (
					<div className="flex justify-start items-center gap-2">
						<div className="flex w-[40px] h-[40px] justify-center bg-[#FFE2E2] rounded-full">
							<span className="flex items-center justify-center">
								<Trash2 className="h-[20px] w-[20px] text-[#E7000B]" />
							</span>
						</div>
						<div className="flex flex-col gap-0.5">
							<span className="font-medium">{lineItemName}</span>
							<span className="text-sm text-[#6A7282]">{productCode}</span>
						</div>
					</div>
				),
				content: (
					<div className="flex flex-col gap-5">
						<span className="text-[14px] text-[#364153] font-normal">
							Are you sure you want to remove this line item from the quote?
						</span>
						<div className="border-1 border-[#E7000B] rounded-md p-[16.625px] bg-[#FFE2E2]">
							<div className="flex justify-start gap-2 self-stretch">
								<Trash2 className="h-[20px] w-[20px] text-[#E7000B] flex-shrink-0 mt-0.5" />
								<div className="flex flex-col gap-1">
									<span className="text-[16px] text-[#E7000B] font-medium">
										LIne Item Removal
									</span>
									<span className="text-[14px] font-normal text-[#E7000B]">
										This line item will be permanentl yremoved from the quote.
										This action cannot be undone.
									</span>
								</div>
							</div>
						</div>

						<div className="rounded-md p-1 bg-[#E5E5E5]">
							<div className="flex flex-col gap-1 px-4 py-2">
								<div className="flex justify-between">
									<span className="text-[14px] font-normal text-[#6A7282]">
										Quantity:
									</span>
									<span className="text-[16px] font-normal text-[#364153]">
										{productQty} {productUom}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-[14px] font-normal text-[#6A7282]">
										Total Sell Value:
									</span>
									<span className="text-[16px] font-normal text-[#101828]">
										${totalSellPrice}
									</span>
								</div>
							</div>
						</div>

						<div className="flex flex-col gap-2">
							<span className="font-medium text-[14px] text-[#101828]">
								What happens when line item is removed:
							</span>
							<ul className="text-[14px] font-normal text-[#6A7282] space-y-0.5 list-disc list-outside pl-5">
								<li> Line item is permanently removed from quote</li>
								<li> Quote total will be recalculated automatically</li>
								<li> Action cannot be undone once confirmed</li>
							</ul>
						</div>
					</div>
				),
				confirmText: 'Remove Line Item',
				confirmVariant: 'destructive',
				confirmCustomColor: '#E7000B',
			},
		};
	}
	return {};
};

import { useJobLineItemStore } from '@/app/stores/job-line-item-store';

export function useJobLineItemActions(
	lineItemData?: JobLineItem | jobItems | null
) {
	const [activeDialog, setActiveDialog] = React.useState<string | null>(null);
	const [viewOpen, setViewOpen] = React.useState(false);
	const [selectedAction, setSelectedAction] =
		React.useState<SelectedAction | null>(null);

	const selectedLineItem = useJobLineItemStore(
		(state) => state.selectedLineItem
	);
	const setSelectedLineItem = useJobLineItemStore(
		(state) => state.setSelectedLineItem
	);

	const lineItemId = selectedLineItem?.id;

	// Get selected quotation to check status
	const selectedJob = useSelectedJob();



	const dialogConfigs = getDialogConfigs(
		lineItemData,
		selectedAction || undefined
	);

	const createDialogAction = (actionKey: string) => {
		return () => {
			setSelectedAction({ key: actionKey });
			setActiveDialog(actionKey);
		};
	};

	const actions = {
		view: (lineItem?: JobLineItem | jobItems | null) => {
			const toSelect = lineItem ?? lineItemData;
			if (toSelect) {
				// We need to cast or convert to JobLineItem for the store if it expects JobLineItem
				// For now, assuming store handles it or we cast as any to bypass strict check if store is not updated yet
				// Ideally store should be updated too.
				setSelectedLineItem(toSelect as any);
			}
			setViewOpen(true);
		},
		remove: createDialogAction('remove'),
		duplicate: createDialogAction('duplicate'),
	};

	// Render active dialog
	const confirmDialogs = Object.entries(dialogConfigs).map(([key, config]) => {
		if (activeDialog !== key) return null;

		return (
			<ActionDialog
				key={key}
				open={activeDialog === key}
				onOpenChangeAction={(open) => {
					if (!open) {
						setActiveDialog(null);
						setSelectedAction(null);
					}
				}}
				title={config.title ?? ''}
				description={config.description}
				content={config.content}
				confirmText={config.confirmText ?? ''}
				confirmVariant={config.confirmVariant}
				confirmCustomColor={config.confirmCustomColor}
				confirmCustomClass={config.confirmCustomClass}
				confirmIcon={config.confirmIcon}
				confirmActionNeeded={config.confirmActionNeeded}
				onConfirmAction={async () => {
					switch (key) {
						case 'remove':
							console.log('Remove job line item:', lineItemId);
							break;
						case 'duplicate':
							console.log('Duplicate job line item:', lineItemId);
							break;
					}
				}}
			/>
		);
	});

	const viewDialog = viewOpen ? (
		<FormDialog
			id={lineItemId}
			dialogTitle="View / Edit Quotation"
			open={viewOpen}
			dialogWidth="700px"
			onOpenChangeAction={(open) => {
				setViewOpen(open);
				// Ensure dropdown menu state is reset when dialog closes
				if (!open) {
					// Small delay to ensure proper cleanup
					setTimeout(() => {
						setViewOpen(false);
					}, 100);
				}
			}}
			headerButtons={
				<JobLineItemActionButtons jobLineItem={lineItemData} />
			}
			hideTrigger
			headerInfo={{
				useSelectedJobLineItem: true,
			}}
		>
			<JobLineItemForm id={lineItemId} />
		</FormDialog>
	) : null;

	return {
		actions,
		confirmDialogs,
		viewDialog,
	};
}