'use client';

import { ColumnDef } from '@tanstack/react-table';
import { jobItems } from '@/lib/types/job';
import { centsToDollars } from '@/lib/utils/currency';
import { JobLineItemTableActions } from './job-line-items-table-actions';
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';
import { TableBadges } from '@/components/table-badges';

export const jobLineItemsColumns: ColumnDef<jobItems>[] = [
	{
		id: 'productName',
		accessorFn: (row) => row.product?.productName,
		header: () => {
			return <div>Product</div>;
		},
		cell: ({ row }) => {
			const productName = row.original.product?.productName || 'N/A';
			const deliveryAddress =
				row.original.address?.formattedAddress || '';
			console.log(deliveryAddress);
			return (
				<div className="min-w-0 w-[70px] sm:w-[90px] md:w-[110px] lg:w-[130px] xl:w-[150px]">
					<Tooltip delayDuration={300}>
						<TooltipTrigger asChild>
							<p className="font-semibold text-gray-900 text-sm truncate">
								{productName}
							</p>
						</TooltipTrigger>
						<TooltipContent variant="white">
							<p>{productName}</p>
						</TooltipContent>
					</Tooltip>
					{deliveryAddress && (
						<p
							className="text-gray-500 text-xs whitespace-normal"
							title={deliveryAddress}
						>
							{deliveryAddress}
						</p>
					)}
				</div>
			);
		},
		meta: 'Product Name',
	},
	{
		id: 'type',
		accessorFn: (row) => row.jobItemType,
		header: () => {
			return <div>Type</div>;
		},
		cell: ({ row }) => {
			return <TableBadges names={[row.original.jobItemType]} visibleCount={1} />;
		},
		meta: 'Type',
	},
	{
		id: 'quarryName',
		accessorFn: (row) => row.quarrySupplierId,
		header: () => {
			return <div>Supplier</div>;
		},
		cell: (info) => {
			const value = (info.getValue() as string) || 'N/A';
			return (
				<Tooltip delayDuration={300}>
					<TooltipTrigger asChild>
						<div
							className="truncate block w-[60px] sm:w-[80px] md:w-[100px] lg:w-[120px] xl:w-[140px]"
						>
							{value}
						</div>
					</TooltipTrigger>
					<TooltipContent variant="white">
						<p>{value}</p>
					</TooltipContent>
				</Tooltip>
			);
		},
		meta: 'quarryName',
	},
	{
		id: 'totalCostPrice',
		accessorFn: (row) => row.totalProductCostPrice,
		header: () => {
			return (
				<div className="flex items-center gap-1">
					Total Cost{' '}
					<Tooltip>
						<TooltipTrigger asChild>
							<HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
						</TooltipTrigger>
						<TooltipContent>
							<p>(ex-GST)</p>
						</TooltipContent>
					</Tooltip>
				</div>
			);
		},
		cell: ({ row }) => {
			const total =
				(row.original.totalProductCostPrice ?? 0);
			return <div>${centsToDollars(total)}</div>;
		},
		meta: 'Total Cost Price',
	},
	{
		id: 'totalSellPrice',
		accessorFn: (row) => row.totalProductSellPrice,
		header: () => {
			return (
				<div className="flex items-center gap-1">
					Total Sell{' '}
					<Tooltip>
						<TooltipTrigger asChild>
							<HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
						</TooltipTrigger>
						<TooltipContent>
							<p>(ex-GST)</p>
						</TooltipContent>
					</Tooltip>
				</div>
			);
		},
		cell: ({ row }) => {
			console.log(row.original);
			const total =
				(row.original.totalProductSellPrice ?? 0);
			return <div>${centsToDollars(total)}</div>;
		},
		meta: 'Total Sell Price',
	},
	{
		id: 'productSellQty',
		accessorFn: (row) => row.productSellQty,
		header: () => {
			return <div>QTY</div>;
		},
		cell: ({ row }) => {
			const productSellQty = row.original.productSellQty;
			const productSellUom =
				row.original.productSellUom === 'KG_20'
					? 'x 20kg'
					: row.original.productSellUom;
			const displayText = `${productSellQty} ${productSellUom}`;
			return (
				<Tooltip delayDuration={300}>
					<TooltipTrigger asChild>
						<div className="truncate block w-[30px] sm:w-[40px] md:w-[50px] lg:w-[60px] xl:w-[70px]">
							{displayText}
						</div>
					</TooltipTrigger>
					<TooltipContent variant="white">
						<p>{displayText}</p>
					</TooltipContent>
				</Tooltip>
			);
		},
		meta: 'Product Sell QTY',
	},
	{
		id: 'remainingQuantity',
		accessorFn: (row) => row.remainingQuantity,
		header: () => {
			return <div>Remaining QTY</div>;
		},
		cell: ({ row }) => {
			const remainingQuantity = row.original.remainingQuantity;
			const productSellUom =
				row.original.productSellUom === 'KG_20'
					? 'x 20kg'
					: row.original.productSellUom;
			const displayText = `${remainingQuantity} ${productSellUom}`;
			return (
				<Tooltip delayDuration={300}>
					<TooltipTrigger asChild>
						<div className="truncate block w-[30px] sm:w-[40px] md:w-[50px] lg:w-[60px] xl:w-[70px]">
							{displayText}
						</div>
					</TooltipTrigger>
					<TooltipContent variant="white">
						<p>{displayText}</p>
					</TooltipContent>
				</Tooltip>
			);
		},
		meta: 'Product Sell QTY',
	},

	{
		id: 'grossProfit',
		accessorFn: (row) => {
			// Calculate gross profit
			const totalCost = (row.totalProductCostPrice || 0) + (row.jobItemType === 'COLLECTION' ? 0 : (row.totalTruckCostPrice || 0));
			const totalSell = (row.totalProductSellPrice || 0) + (row.jobItemType === 'COLLECTION' ? 0 : (row.totalTruckSellPrice || 0));

			// Calculate GST (assuming prices are ex-GST)
			const gstRate = 0.1;
			const totalCostIncGst = totalCost * (1 + gstRate);
			const totalSellIncGst = totalSell * (1 + gstRate);

			const grossProfitCents = totalSellIncGst - totalCostIncGst;
			const grossProfitPercentage = totalSellIncGst > 0 ? (grossProfitCents / totalSellIncGst) * 100 : 0;

			return grossProfitPercentage;
		},
		header: () => {
			return <div>GP</div>;
		},
		cell: ({ row }) => {
			const grossProfit = row.getValue('grossProfit') as number;
			return <div>{grossProfit.toFixed(2)}%</div>;
		},
		meta: 'Gross Profit',
		size: 40,
	},
	{
		id: 'actions',
		header: () => {
			return <div></div>;
		},
		cell: ({ row }) => {
			return (
				<div>
					<JobLineItemTableActions jobLineItem={row.original} />
				</div>
			);
		},
	},
];
