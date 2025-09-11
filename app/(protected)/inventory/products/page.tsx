'use client';

export default function ProductsPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage your product catalog and inventory
          </p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
          {/* TODO: QLINK-659 Add and View/Edit Product Modal form */}
        </div>
      </div>

      <div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">
        {/* TODO: QLINK-657 Products DataTable */}
      </div>
    </div>
  );
}
