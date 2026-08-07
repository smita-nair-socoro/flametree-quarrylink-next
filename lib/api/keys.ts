export const ProductKeys = {
  all: ['products'] as const,
  list: (filters?: { page?: number; perPage?: number; search?: string }) =>
    [...ProductKeys.all, 'list', filters] as const,
  detail: (id: number) => [...ProductKeys.all, 'detail', id] as const,
  detailWithMaterial: (id: number) =>
    [...ProductKeys.all, 'detail', id, 'material'] as const,
  detailWithQuarrySupplierProduct: (id: number) =>
    [...ProductKeys.all, 'detail', id, 'quarry-supplier-product'] as const,
  reporting: () => [...ProductKeys.all, 'reporting'] as const,
};

export const QuarryKeys = {
  all: ['quarries'] as const,
  list: () => [...QuarryKeys.all, 'list'] as const,
  detail: (id: number) => [...QuarryKeys.all, 'detail', id] as const,
  suburbs: () => [...QuarryKeys.all, 'suburbs'] as const,
  linkedProducts: (quarryId: number) =>
    [...QuarryKeys.all, 'linked-products', quarryId] as const,
  reporting: () => [...QuarryKeys.all, 'reporting'] as const,
};

export const CategoryKeys = {
  all: ['categories'] as const,
  list: () => [...CategoryKeys.all, 'list'] as const,
  detail: (id: number) => [...CategoryKeys.all, 'detail', id] as const,
  detailWithMaterial: (id: number) =>
    [...ProductKeys.all, 'detail', id, 'material'] as const,
  detailWithQuarrySupplierProduct: (id: number) =>
    [...ProductKeys.all, 'detail', id, 'quarry-supplier-product'] as const,
};

export const CustomerKeys = {
  all: ['customers'] as const,
  reporting: () => [...CustomerKeys.all, 'reporting'] as const,
  list: () => [...CustomerKeys.all, 'list'] as const,
  detail: (id: number) => [...CustomerKeys.all, 'detail', id] as const,
  deliveryAddresses: (customerId: number, limit?: number) =>
    [...CustomerKeys.all, 'delivery-addresses', customerId, limit] as const,
  attachments: (customerId: number) =>
    [...CustomerKeys.all, 'attachments', customerId] as const,
  additionalContacts: (
    customerId: number,
    params?: { page?: number; pageSize?: number },
  ) =>
    [...CustomerKeys.all, 'additional-contacts', customerId, params] as const,
  additionalContactDetail: (customerId: number, contactId: number) =>
    [
      ...CustomerKeys.all,
      'additional-contacts',
      customerId,
      'detail',
      contactId,
    ] as const,
};

export const QuotationKeys = {
  all: ['quotations'] as const,
  list: () => [...QuotationKeys.all, 'list'] as const,
  detail: (id: number) => [...QuotationKeys.all, 'detail', id] as const,
  reporting: () => [...QuotationKeys.all, 'reporting'] as const,
  quoteItem: (id: number) => [...QuotationKeys.all, 'quote-item', id] as const,
};

export const TenantKeys = {
  all: ['tenants'] as const,
  list: () => [...TenantKeys.all, 'list'] as const,
  detail: (id: string) => [...TenantKeys.all, 'detail', id] as const,
};
export const MaterialsKeys = {
  all: ['materials'] as const,
  list: () => [...MaterialsKeys.all, 'list'] as const,
  detail: (id: number) => [...MaterialsKeys.all, 'detail', id] as const,
};

export const QuarrySupplierProductKeys = {
  all: ['quarry-supplier-products'] as const,
  detail: (quarrySupplierId: number, productId: number) =>
    [
      ...QuarrySupplierProductKeys.all,
      'detail',
      quarrySupplierId,
      productId,
    ] as const,
};

export const JobKeys = {
  all: ['jobs'] as const,
  list: () => [...JobKeys.all, 'list'] as const,
  detail: (id: number) => [...JobKeys.all, 'detail', id] as const,
  items: (jobId: number) => [...JobKeys.all, 'items', jobId] as const,
  item: (jobItemId: number) => [...JobKeys.all, 'item', jobItemId] as const,
  statistics: () => [...JobKeys.all, 'statistics'] as const,
};

export const UserKeys = {
  all: ['users'] as const,
  list: () => [...UserKeys.all, 'list'] as const,
  accountManagers: () => [...UserKeys.all, 'account-managers'] as const,
  operations: () => [...UserKeys.all, 'operations'] as const,
  detail: (id: string) => [...UserKeys.all, 'detail', id] as const,
  dependencies: (id: string) => [...UserKeys.all, 'dependencies', id] as const,
};

export const DriverKeys = {
  all: ['drivers'] as const,
  list: () => [...DriverKeys.all, 'list'] as const,
  detail: (id: number) => [...DriverKeys.all, 'detail', id] as const,
  assignments: (id: number) => [...DriverKeys.all, 'assignments', id] as const,
  checklists: (id: number) => [...DriverKeys.all, 'checklists', id] as const,
  statistics: () => [...DriverKeys.all, 'statistics'] as const,
};

export const DocketKeys = {
  all: ['dockets'] as const,
  list: () => [...DocketKeys.all, 'list'] as const,
  detail: (id: number) => [...DocketKeys.all, 'detail', id] as const,
  byJobId: (jobId: number) => [...DocketKeys.all, 'by-job-id', jobId] as const,
  truckInspection: (docketId: number) =>
    [...DocketKeys.all, 'truck-inspection', docketId] as const,
  preStartChecklist: (docketId: number) =>
    [...DocketKeys.all, 'pre-start-checklist', docketId] as const,
  statistics: () => [...DocketKeys.all, 'statistics'] as const,
  docketsByTruckId: (truckId: number) =>
    [...DocketKeys.all, 'by-truck-id', truckId] as const,
  docketsByDriverId: (driverId: number) =>
    [...DocketKeys.all, 'by-driver-id', driverId] as const,
};

export const ChecklistKeys = {
  all: ['checklists'] as const,
  truckTemplate: (truckType?: string) =>
    [...ChecklistKeys.all, 'truck-template', truckType ?? ''] as const,
  driverTemplate: () => [...ChecklistKeys.all, 'driver-template'] as const,
  truckSubmission: (submissionId: number) =>
    [...ChecklistKeys.all, 'truck-submission', submissionId] as const,
  driverSubmission: (submissionId: number) =>
    [...ChecklistKeys.all, 'driver-submission', submissionId] as const,
};

export const InvoicesKeys = {
  all: ['invoices'] as const,
  list: (jobId: number) => [...InvoicesKeys.all, 'list', jobId] as const,
  detail: (id: number) => [...InvoicesKeys.all, 'detail', id] as const,
  url: (id: number) => [...InvoicesKeys.all, 'url', id] as const,
  pdf: (id: number) => [...InvoicesKeys.all, 'pdf', id] as const,
};

export const HaulierKeys = {
  all: ['hauliers'] as const,
  list: () => [...HaulierKeys.all, 'list'] as const,
  statistics: () => [...HaulierKeys.all, 'statistics'] as const,
  detail: (id: number) => [...HaulierKeys.all, 'detail', id] as const,
  drivers: (id: number) => [...HaulierKeys.all, 'drivers', id] as const,
  trucks: (id: number) => [...HaulierKeys.all, 'trucks', id] as const,
};

export const TruckKeys = {
  all: ['trucks'] as const,
  list: () => [...TruckKeys.all, 'list'] as const,
  detail: (id: number) => [...TruckKeys.all, 'detail', id] as const,
  drivers: (id: number) => [...TruckKeys.all, 'drivers', id] as const,
  inspections: (id: number) => [...TruckKeys.all, 'inspections', id] as const,
  dockets: (id: number) => [...TruckKeys.all, 'dockets', id] as const,
  statistics: () => [...TruckKeys.all, 'statistics'] as const,
};

export const XeroKeys = {
  all: ['xero'] as const,
  connect: () => [...XeroKeys.all, 'connect'] as const,
  status: () => [...XeroKeys.all, 'status'] as const,
};

export const MyobBusinessKeys = {
  all: ['myob-business'] as const,
  connect: () => [...MyobBusinessKeys.all, 'connect'] as const,
  status: () => [...MyobBusinessKeys.all, 'status'] as const,
};

export const MyobAcumaticaKeys = {
  all: ['myob-acumatica'] as const,
  connect: () => [...MyobAcumaticaKeys.all, 'connect'] as const,
  status: () => [...MyobAcumaticaKeys.all, 'status'] as const,
};

export const SchedulerKeys = {
  all: ['scheduler'] as const,
  trucks: (start: string, end: string) =>
    [...SchedulerKeys.all, 'trucks', start, end] as const,
  drivers: (start: string, end: string) =>
    [...SchedulerKeys.all, 'drivers', start, end] as const,
};

export const DriverAppKeys = {
  all: ['driver-app'] as const,
  assignedDockets: () => [...DriverAppKeys.all, 'assigned'] as const,
  assignedDocketDetail: (docketId: number) =>
    [...DriverAppKeys.all, 'assigned', docketId] as const,
};

export const AccountingKeys = {
  trackingCategories: ['tracking-categories'] as const,
  trackingCategoryDefinitions: ['tracking-categories-definitions'] as const,
  accountCodes: ['account-codes'] as const,
  accountCodeById: (id: number) =>
    [...AccountingKeys.accountCodes, id] as const,
};

export const DepartmentKeys = {
  all: ['departments'] as const,
  list: () => [...DepartmentKeys.all, 'list'] as const,
};

export const PolicyDocumentKeys = {
  all: ['policy-documents'] as const,
  list: () => [...PolicyDocumentKeys.all, 'list'] as const,
  view: (id: number) => [...PolicyDocumentKeys.all, 'view', id] as const,
};

export const TextTemplateKeys = {
  all: ['text-templates'] as const,
  detail: (id: number) => [...TextTemplateKeys.all, 'detail', id] as const,
};

export const ExternalLinkKeys = {
  all: ['external-links'] as const,
  detail: (id: number) => [...ExternalLinkKeys.all, 'detail', id] as const,
};

export const QuoteContentLibraryKeys = {
  all: ['quote-content-library'] as const,
  list: (params?: { sortBy?: string; direction?: string }) =>
    [...QuoteContentLibraryKeys.all, 'list', params] as const,
};

export const QuoteEditorContentKeys = {
  all: ['quote-editor-content'] as const,
  detail: (quoteId: number) => [...QuoteEditorContentKeys.all, quoteId] as const,
};
