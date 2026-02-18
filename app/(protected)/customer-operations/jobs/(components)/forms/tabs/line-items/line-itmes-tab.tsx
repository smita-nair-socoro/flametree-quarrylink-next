'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { DataTableClient } from '@/components/ui/data-table-client';
import { jobLineItemsColumns } from './(data-tables)/columns';
import { JobLineItem } from '@/lib/types/job';
import { calculateJobPricing } from '@/lib/utils/job-helpers';
import { TrendingDown, TrendingUp } from 'lucide-react';

interface LineItemsTabProps {
	jobLineItems: JobLineItem[];
}

export default function LineItemsTab({ jobLineItems }: LineItemsTabProps) {
	const isDesktop = useMediaQuery('(min-width: 768px)');

	const pricingBreakdown = React.useMemo(() => {
		return calculateJobPricing(jobLineItems);
	}, [jobLineItems]);

	const isAllCollection = React.useMemo(() => {
		if (!jobLineItems || jobLineItems.length === 0) return false;
		return jobLineItems.every((item) => item.type === 'COLLECTION');
	}, [jobLineItems]);

	return (
		<div className="flex flex-col gap-4 mt-6">
			<div
				className={cn(
					isDesktop
						? 'flex justify-between items-center'
						: 'flex flex-col gap-4',
				)}
			>
				<span className="text-lg font-semibold">
					Line Items
				</span>
				{/* will be changed to a formDialog later in another task */}
				<Button>
					<PlusIcon className="w-4 h-4" />
					Add New Product
				</Button>
			</div>

			<div className={isDesktop ? 'col-span-2' : 'col-span-1'}>
				<DataTableClient
					columns={jobLineItemsColumns}
					data={jobLineItems}
					simpleTable={true}
					defaultSorting={[{ id: 'productName', desc: false }]}
				/>
			</div>
			{(jobLineItems.length > 0) && (
				<div className="flex flex-col gap-3">
					{(() => {
						const separatorBorder =
							'border-t border-dashed border-[#8E51FF]';
						return (
							<>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{/* Cost Summary */}
									<div className="md:col-span-1 md:col-start-2 rounded-lg border border-[#DDD] bg-gray-50 px-4 py-3 shadow-sm">
										<h3 className="text-lg font-bold mb-3">
											Cost Summary
										</h3>
										<div className="flex flex-col gap-3 [&>div]:flex [&>div]:justify-between [&>div]:text-sm [&>div]:font-normal">
											<div>
												<span>Product Cost</span>
												<span>
													${pricingBreakdown.totalProductCostPrice}
												</span>
											</div>
											{!isAllCollection && (
												<div>
													<span>Truck Cost</span>
													<span>
														${pricingBreakdown.totalTruckCostPrice}
													</span>
												</div>
											)}
											<div className={`pt-2 ${separatorBorder}`}>
												<span>Subtotal (ex-GST)</span>
												<span>
													${pricingBreakdown.costSubtotalExGST}
												</span>
											</div>
											<div>
												<span>GST (10%)</span>
												<span>${pricingBreakdown.costGst}</span>
											</div>
											<div className={`pt-2 ${separatorBorder}`}>
												<span className="font-bold text-lg">
													Total Cost
												</span>
												<span className="font-bold text-lg">
													${pricingBreakdown.totalCost}
												</span>
											</div>
										</div>
									</div>
									{/* Sale Summary */}
									<div className="md:col-span-1 md:col-start-3 bg-purple-50 rounded-lg border border-[#DDD] px-4 py-3 shadow-sm">
										<h3 className="text-lg font-bold mb-3">
											Sale Summary
										</h3>
										<div className="flex flex-col gap-3 [&>div]:flex [&>div]:justify-between [&>div]:text-sm [&>div]:font-normal">
											<div>
												<span>Product Sell</span>
												<span>
													${pricingBreakdown.totalProductSellPrice}
												</span>
											</div>
											{!isAllCollection && (
												<div>
													<span>Truck Sell</span>
													<span>
														${pricingBreakdown.totalTruckSellPrice}
													</span>
												</div>
											)}
											<div className={`pt-2 ${separatorBorder}`}>
												<span>Subtotal (ex-GST)</span>
												<span>
													${pricingBreakdown.invoiceSubtotalExGST}
												</span>
											</div>
											<div>
												<span>GST (10%)</span>
												<span>${pricingBreakdown.invoiceGst}</span>
											</div>
											<div className={`pt-2 ${separatorBorder}`}>
												<span className="font-bold text-lg">
													Total Invoice
												</span>
												<span className="font-bold text-lg">
													${pricingBreakdown.totalInvoice}
												</span>
											</div>
										</div>
									</div>
								</div>
								{/* Gross Profit */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="flex justify-end items-center gap-2 py-3 px-4 bg-gray-50 border border-[#DDDDDD] rounded-lg md:col-span-2 md:col-start-2">
										<span className="text-lg font-semibold">
											Gross Profit:
										</span>
										{pricingBreakdown.grossProfitPercentage >= 0 ? (
											<TrendingUp className="w-5 h-5 text-green-600 shrink-0" />
										) : (
											<TrendingDown className="w-5 h-5 text-red-600 shrink-0" />
										)}
										<span
											className={cn(
												'text-lg font-bold',
												pricingBreakdown.grossProfitPercentage >= 0
													? 'text-green-600'
													: 'text-red-600'
											)}
										>
											{pricingBreakdown.grossProfitPercentage?.toFixed(
												2
											)}
											%
										</span>
										<span className="text-lg font-medium ml-5">
											{Number(pricingBreakdown.grossProfit) >= 0
												? ''
												: '-'}
											$
											{Math.abs(
												Number(pricingBreakdown.grossProfit)
											).toFixed(2)}
										</span>
									</div>
								</div>
							</>
						);
					})()}
				</div>
			)}
		</div>
	);
}