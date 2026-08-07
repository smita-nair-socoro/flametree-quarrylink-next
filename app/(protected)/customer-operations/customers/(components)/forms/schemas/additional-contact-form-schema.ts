import z from 'zod';
import {
  ADDITIONAL_CONTACT_METHOD_TYPE,
  ADDITIONAL_CONTACT_METHOD_TYPE_LABELS,
} from '@/lib/types/customer-enums';
import { FormSelectOption } from '@/components/ui/form-select';
import { sortByLabel } from '@/lib/utils/sort-options';

export const ADDITIONAL_CONTACT_METHOD_TYPE_OPTIONS: readonly FormSelectOption[] =
  (() => {
    const options = Object.values(ADDITIONAL_CONTACT_METHOD_TYPE).map(
      (value) => ({
        label: ADDITIONAL_CONTACT_METHOD_TYPE_LABELS[value],
        value,
      }),
    );

    const other = options.find(
      (option) => option.value === ADDITIONAL_CONTACT_METHOD_TYPE.OTHER,
    );
    const rest = sortByLabel(
      options.filter(
        (option) => option.value !== ADDITIONAL_CONTACT_METHOD_TYPE.OTHER,
      ),
      (option) => option.label,
    );

    return other ? [...rest, other] : rest;
  })();

const contactMethodSchema = z
  .object({
    type: z.nativeEnum(ADDITIONAL_CONTACT_METHOD_TYPE, {
      message: 'Type is required',
    }),
    value: z
      .string()
      .trim()
      .min(1, 'Required')
      .max(256, 'Maximum 256 characters'),
  })
  .superRefine((method, ctx) => {
    if (method.type === ADDITIONAL_CONTACT_METHOD_TYPE.EMAIL) {
      if (!z.string().email().safeParse(method.value).success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['value'],
          message: 'Invalid email format',
        });
      }
    }
  });

export const additionalContactFormSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(256, 'Maximum 256 characters'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(256, 'Maximum 256 characters'),
  positionRole: z.string().trim().max(256, 'Maximum 256 characters').optional(),
  contactMethods: z
    .array(contactMethodSchema)
    .min(1, 'At least one contact method is required'),
});
