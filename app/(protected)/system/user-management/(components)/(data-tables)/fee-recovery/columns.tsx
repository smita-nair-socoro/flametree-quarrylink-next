export type OverrideRule = 'charge_customer' | 'absorb_cost';
export type RuleType = 'global_default' | 'custom_rule';
export type StatusType = 'absorbed' | 'charging';

export interface CustomerOverrideRow {
  id: string;
  customer: string;
  customerCode: string;
  rule: RuleType;
  status: StatusType;
  feePerDocket: number;
  pastMonth: number;
  isCustom: boolean;
  overrideRule: OverrideRule;
  customFee: number;
}

// 6 column headers
export const COLUMN_HEADERS = [
  { key: 'customer', label: 'Customer' },
  { key: 'rule', label: 'Rule' },
  { key: 'status', label: 'Status' },
  { key: 'feePerDocket', label: 'Fee / docket' },
  { key: 'pastMonth', label: 'Past month' },
  { key: 'override', label: 'Override' },
] as const;

export const MOCK_CUSTOMER_OVERRIDES: CustomerOverrideRow[] = [
  {
    id: '1',
    customer: 'Adbri Limited',
    customerCode: 'ADB001',
    rule: 'global_default',
    status: 'absorbed',
    feePerDocket: 0,
    pastMonth: 348,
    isCustom: false,
    overrideRule: 'charge_customer',
    customFee: 2.4,
  },
  {
    id: '2',
    customer: 'Hanson Construction Materials Pty Ltd',
    customerCode: 'HAN002',
    rule: 'custom_rule',
    status: 'charging',
    feePerDocket: 3,
    pastMonth: 1266,
    isCustom: true,
    overrideRule: 'charge_customer',
    customFee: 3,
  },
  {
    id: '3',
    customer: 'Holcim Australia Pty Ltd',
    customerCode: 'HOL003',
    rule: 'custom_rule',
    status: 'absorbed',
    feePerDocket: 0,
    pastMonth: 0,
    isCustom: true,
    overrideRule: 'absorb_cost',
    customFee: 0,
  },
  {
    id: '4',
    customer: 'Boral Limited',
    customerCode: 'BOR004',
    rule: 'global_default',
    status: 'absorbed',
    feePerDocket: 0,
    pastMonth: 720,
    isCustom: false,
    overrideRule: 'charge_customer',
    customFee: 2.4,
  },
  {
    id: '5',
    customer: 'CSR Limited',
    customerCode: 'CSR005',
    rule: 'global_default',
    status: 'absorbed',
    feePerDocket: 0,
    pastMonth: 348,
    isCustom: false,
    overrideRule: 'charge_customer',
    customFee: 2.4,
  },
  {
    id: '6',
    customer: 'RSEA',
    customerCode: 'RSE006',
    rule: 'custom_rule',
    status: 'charging',
    feePerDocket: 4.5,
    pastMonth: 369,
    isCustom: true,
    overrideRule: 'charge_customer',
    customFee: 4.5,
  },
];
