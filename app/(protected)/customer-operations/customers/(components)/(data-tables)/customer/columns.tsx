// QLINK-248

// 'use client';
// import { TableBadges } from '@/components/table-badges';
// import { TableClientSortableHeader } from '@/components/table-client-sortable-header';
// import { ColumnDef } from '@tanstack/react-table';
// import { CustomerDetails } from '@/lib/types/customer';
// import { formatCustomerStatus } from '@/lib/utils/customer-helper';
// import { CUSTOMER_STATUS } from '@/lib/types/customer-enums';

// export const customerColumns: ColumnDef<CustomerDetails>[] = [
//   {
//     id: 'customer_name',
//     accessorFn: (row) => row.business_name,
//     header: ({ column }) => {
//       return (
//         <TableClientSortableHeader column={column} title="Customer Name" />
//       );
//     },
//     cell: (info) => info.getValue(),
//     meta: 'Customer Name',
//   },
//   {
//     id: 'customer_type',
//     accessorFn: (row) => row.customer_type,
//     header: ({ column }) => {
//       return (
//         <TableClientSortableHeader column={column} title="Customer Type" />
//       );
//     },
//     cell: ({ row }) => {
//       const customer_type = row.original.customer_type;
//       return <TableBadges names={customer_type} visibleCount={1} />;
//     },
//     meta: 'Customer Type',
//   },
//   {
//     id: 'contact_name',
//     accessorFn: (row) => row.contact_name,
//     header: ({ column }) => {
//       return <TableClientSortableHeader column={column} title="Contact Name" />;
//     },
//     cell: (info) => info.getValue(),
//     meta: 'Contact Name',
//   },
//   {
//     id: 'email',
//     accessorFn: (row) => row.email,
//     header: ({ column }) => {
//       return <TableClientSortableHeader column={column} title="Email" />;
//     },
//     cell: (info) => info.getValue(),
//     meta: 'Email',
//   },
//   {
//     id: 'payment_terms',
//     accessorFn: (row) => row.payment_terms,
//     header: ({ column }) => {
//       return (
//         <TableClientSortableHeader column={column} title="Payment Terms" />
//       );
//     },
//     cell: ({ row }) => {
//       const payment_terms = row.original.payment_terms;
//       return <TableBadges names={payment_terms} visibleCount={1} />;
//     },
//     meta: 'Payment Terms',
//   },
//   {
//     id: 'credit_limit',
//     accessorFn: (row) => row.credit_limit,
//     header: ({}) => {
//       return <div className="text-right max-w-36">Credit Limit</div>;
//     },
//     cell: ({ row }) => {
//       const cents = parseFloat(row.original.credit_limit.toString());
//       const dollars = cents / 100;
//       const formatted = new Intl.NumberFormat('en-US', {
//         style: 'currency',
//         currency: 'USD',
//       }).format(dollars);
//       return (
//         <div className="text-right font-medium w-36 max-w-36 truncate">
//           {formatted}
//         </div>
//       );
//     },
//     meta: 'Credit Limit',
//   },
//   {
//     id: 'credit_limit',
//     accessorFn: (row) => row.credit_limit,
//     header: ({}) => {
//       return <div className="text-right max-w-36">Remaining Credit</div>;
//     },
//     cell: ({ row }) => {
//       const cents = parseFloat(
//         (row.original.credit_limit - row.original.credit_limit).toString()
//       );
//       const dollars = cents / 100;
//       const formatted = new Intl.NumberFormat('en-US', {
//         style: 'currency',
//         currency: 'USD',
//       }).format(dollars);
//       return (
//         <div className="text-right font-medium w-36 max-w-36 truncate">
//           {formatted}
//         </div>
//       );
//     },
//     meta: 'Remaining Credit Limit',
//   },
//   {
//     id: 'status',
//     accessorFn: (row) => row.customer_status,
//     header: ({ column }) => {
//       return <TableClientSortableHeader column={column} title="Status" />;
//     },
//     cell: ({ getValue }) => {
//       const names = formatCustomerStatus(getValue<string>() as CUSTOMER_STATUS);
//       return <TableBadges names={names} visibleCount={1} />;
//     },
//     meta: 'Status',
//   },
//   {
//     id: 'account_manager',
//     accessorFn: (row) => row.account_manager,
//     header: ({ column }) => {
//       return (
//         <TableClientSortableHeader column={column} title="Account Manager" />
//       );
//     },
//     cell: (info) => info.getValue(),
//     meta: 'Account Manager',
//   },
//   {
//     id: 'actions',
//     header: () => {
//       return <div></div>;
//     },
//     cell: ({ row }) => {
//       const customer = row.original;
//       return <div>{/* TODO: Add actions QLINK-637*/}</div>;
//     },
//   },
// ];
