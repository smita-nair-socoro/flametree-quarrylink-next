'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { useMediaQuery } from '@/hooks/use-media-query';
import { DocketFormSchema } from './schemas/docket-form-schema';
import { EMPTY_DOCKET_FORM_VALUES } from '@/hooks/docket/use-docket-form-state';
import rawJson from '@/lib/tests/jobsDetailResponseData.json';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { FormSelect } from '@/components/ui/form-select';
import { JobLineItem } from '@/lib/types/job';
import { Label } from '@/components/ui/label';
import { Package } from 'lucide-react';

interface FormProps {
	id?: number;
	onCancel?: () => void;
	onSuccess?: () => void;
	onDirtyChange?: (isDirty: boolean) => void;
	onSaved?: () => void;
	className?: string;
	isQuickDocket?: boolean;
}

export default function DocketForm({
	id,
	onCancel,
	onSuccess,
	onDirtyChange,
	onSaved,
	className,
	isQuickDocket = true,
}: FormProps) {
	const isDesktop = useMediaQuery('(min-width: 768px)');
	const [isEditing] = React.useState(Boolean(id));
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const docketForm = useForm<z.infer<typeof DocketFormSchema>>({
		resolver: zodResolver(DocketFormSchema),
		mode: 'onChange',
		defaultValues: EMPTY_DOCKET_FORM_VALUES,
	});

	const allJobs = React.useMemo(() => {
		return rawJson.items.map((job) => ({
			label: `${job.jobNumber} - ${job.projectName}`,
			value: job.id,
		}));
	}, []);

	const selectedJobId = docketForm.watch('jobId');

	const jobLineItems = React.useMemo(() => {
		if (!selectedJobId) return [];
		const selectedJob = rawJson.items.find((job) => job.id === selectedJobId);
		return (selectedJob?.jobLineItems ?? []) as unknown as JobLineItem[];
	}, [selectedJobId]);

	const jobLineItemOptions = React.useMemo(() => {
		return jobLineItems
			.filter((lineItem) => lineItem.id !== undefined)
			.map((lineItem) => ({
				label: lineItem.productName,
				value: lineItem.id as number,
			}));
	}, [jobLineItems]);

	const truckTypeOptions = React.useMemo(() => {
		return [
			{ label: 'Truck', value: 'Truck' },
			{ label: 'Semi-Trailer', value: 'Semi-Trailer' },
			{ label: 'Truck + Trailer', value: 'Truck + Trailer' },
			{ label: 'Rigid truck', value: 'Rigid truck' },
		];
	}, []);

	const selectedJobLineItemDetails = React.useCallback(() => {
		const selectedJobLineItemId = docketForm.watch('jobLineItemId');
		const selectedJobLineItem = jobLineItems.find((lineItem) => lineItem.id === selectedJobLineItemId);
		return {
			productName: selectedJobLineItem?.productName ?? '',
			quarryName: selectedJobLineItem?.quarryName ?? '',
			productUom: selectedJobLineItem?.productSellUom ?? '',
			truckType: selectedJobLineItem?.truckType ?? '',
			truckUom: selectedJobLineItem?.truckSellUom ?? '',
			productSell: selectedJobLineItem?.productSellPrice ?? 0,
			productSellQty: selectedJobLineItem?.remainingQuantity ?? 0,
			type: selectedJobLineItem?.type ?? '',
			needTruckQty: selectedJobLineItem?.truckSellUom === 'HOURLY' || selectedJobLineItem?.truckSellUom === 'LOAD' || selectedJobLineItem?.truckSellUom === 'KM',
		};
	}, [jobLineItems, docketForm]);

	React.useEffect(() => {
		onDirtyChange?.(docketForm.formState.isDirty);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [docketForm.formState.isDirty]);


	async function onSubmit(values: z.infer<typeof DocketFormSchema>) {
		setIsSubmitting(true);
		console.log(`Docket Form Values:`, values);

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1000));

		setIsSubmitting(false);
	}

	return (
		<div className="w-full relative">
			{isSubmitting && (
				<div
					className={cn(
						'fixed inset-0 bg-background/20 backdrop-blur-[1px] z-[9999] flex items-center justify-center',
						isDesktop ? '' : 'pt-10',
					)}
				>
					<div className="flex flex-col items-center space-y-4 p-8">
						<Spinner size="medium" />
						<p className="text-lg text-muted-foreground font-bold">
							{isEditing ? 'Updating Docket...' : 'Adding Docket...'}
						</p>
					</div>
				</div>
			)}
			<Form {...docketForm}>
				<form
					id="add-new-docket-form"
					className={cn('p-1 w-full flex flex-col', className)}
					onSubmit={docketForm.handleSubmit(onSubmit)}
				>
					<div
						className={cn(
							'p-1 gap-1 w-full',
							isDesktop && isEditing
								? 'grid grid-cols-2 gap-x-8'
								: 'grid grid-cols-1',
							className,
						)}
					>
						<FormSelect
							control={docketForm.control}
							name="jobId"
							label="Job Reference*"
							searchLabel="Job References"
							options={allJobs}
							placeholder="Select Job"
							formItemClassName={
								isEditing && isDesktop ? 'col-span-1 col-start-1' : 'col-span-2'
							}
						/>

						<div className="border rounded-md p-4 flex flex-col gap-4">
							<div className="flex flex-col gap-2">
								<div className="items-center flex gap-2">
									<Package
										className="w-4 h-4"
									/>
									<span className="text-sm font-medium">Product & Vehicle Details</span>
								</div>
								<span className="text-sm text-muted-foreground">Product selection and vehicle configuration</span>
							</div>
							<div className="flex flex-col gap-2">
								<div className="grid grid-cols-2 gap-4">
									<FormSelect
										control={docketForm.control}
										name="jobLineItemId"
										label="Product*"
										searchLabel="Products"
										options={jobLineItemOptions}
										placeholder={!selectedJobId ? 'Select Job First' : jobLineItemOptions.length === 0 ? 'No Products Found' : 'Select Product'}
										disabled={!selectedJobId || jobLineItemOptions.length === 0}
									/>

									<FormField
										name="quarryName"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Quarry / Supplier</FormLabel>
												<FormControl>
													<Input
														className="w-full"
														readOnly
														value={field.value ?? selectedJobLineItemDetails().quarryName ?? ''}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className={cn(selectedJobLineItemDetails().type === 'COLLECTION' ? 'grid grid-cols-2 gap-4' : !selectedJobLineItemDetails().needTruckQty ? 'grid grid-cols-3 gap-4' : 'grid grid-cols-4 gap-4')}>
									{selectedJobLineItemDetails().type === 'DELIVERY' && (
										<FormSelect
											control={docketForm.control}
											name="truckType"
											label="Truck Type*"
											searchLabel="Truck Type"
											options={truckTypeOptions}
											placeholder="Select Truck Type"
											disabled={!selectedJobId || jobLineItemOptions.length === 0}
										/>
									)}

									<FormField
										name="productUoM"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Product UoM</FormLabel>
												<FormControl>
													<Input
														className="w-full"
														readOnly
														value={field.value ?? selectedJobLineItemDetails().productUom ?? ''}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										name="loadSize"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Load Size</FormLabel>
												<FormControl>
													<Input
														className="w-full"
														{...field}
														isNumber
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									{selectedJobLineItemDetails().needTruckQty && (
										<FormField
											name="truckQty"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Delivery Distance</FormLabel>
													<FormControl>
														<Input
															className="w-full"
															{...field}
															isNumber
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									)}
								</div>

							</div>
						</div>
					</div>
				</form>
			</Form>
		</div>
	);
}
