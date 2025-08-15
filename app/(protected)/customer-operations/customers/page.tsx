'use client';

import { FormDialog } from '@/components/form-dialog';
import CustomerForm from './(components)/forms/customer-form';

export default function CustomersPage() {
  //TODO: Fetch from server
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl">Customers</h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
          <FormDialog
            dialogTitle="Add Customer"
            dialogDescription="Fill in the required fields to add a new customer."
            buttonTitle="Add Customer"
          >
            <CustomerForm />
          </FormDialog>
        </div>
      </div>

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        {/* TODO: Add table here */}
      </div>
    </div>
  );
}
