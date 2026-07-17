import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { DocketDTO } from '@/lib/types/docket';
import { JOB_LINE_ITEM_TYPE } from '@/lib/types/job-enums';
import {
  DocketPdfDocument,
  DocketPdfData,
} from '@/app/(protected)/customer-operations/dockets/(components)/pdf/DocketPdfDocument';
import { formatCalendarDate, formatLocalDate } from '@/lib/utils/date';
import { formatUomLabel } from '@/lib/utils/docket-helper';

// Pre-fetch remote images as base64 so react-pdf can render them without CORS issues
async function fetchImageAsBase64(
  url: string | undefined,
): Promise<string | undefined> {
  if (!url) return undefined;
  if (url.startsWith('data:')) return url;
  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
}

function formatLatLong(address?: {
  latitude?: number;
  longitude?: number;
}): string | undefined {
  if (address?.latitude == null || address?.longitude == null) return undefined;
  return `Lat ${address.latitude} / Long ${address.longitude}`;
}

function formatTruckType(value?: string): string | undefined {
  if (!value) return undefined;
  return value
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function formatLoadSize(docket: DocketDTO): string {
  const loadSize =
    docket.actualLoadSize ?? docket.plannedLoadSize ?? docket.loadSize ?? 0;
  const uom = docket.jobItem?.productSellUom ?? 'TN';
  const uomLabel = uom.toUpperCase() === 'TN' ? 't' : formatUomLabel(uom);
  return `${loadSize.toFixed(2)} ${uomLabel}`;
}

async function buildDocketPdfData(
  docket: DocketDTO,
  tenantName?: string,
): Promise<DocketPdfData> {
  const isCollection =
    docket.jobItem?.jobItemType === JOB_LINE_ITEM_TYPE.COLLECTION;

  const [unloadedPhoto, receiptPhoto, signature] = await Promise.all([
    fetchImageAsBase64(docket.unloadedPhotos?.[0]),
    fetchImageAsBase64(docket.receivedPhotos?.[0]),
    fetchImageAsBase64(docket.signatureImage),
  ]);

  const hasSignOff = Boolean(
    docket.deliveredAt || docket.receiverName || docket.signatureImage,
  );

  return {
    docketType: isCollection ? 'collection' : 'delivery',
    tenantName: tenantName || '—',
    docTitle: isCollection
      ? 'Collection Docket & Tax Invoice'
      : 'Delivery Docket & Tax Invoice',
    docketNumber: docket.docketNumber,
    dateLabel: formatCalendarDate(docket.deliveryCollectionDate, 'dd/MM/yyyy'),
    job: {
      jobNumber: docket.job?.jobNumber ?? '—',
      projectName: docket.job?.projectName,
    },
    product: {
      name: docket.jobItem?.product?.productName,
      truckType: formatTruckType(docket.truckType),
      rego: docket.truck?.licensePlate,
    },
    loadSizeLabel: formatLoadSize(docket),
    delivery: {
      pickupAddress: docket.pickUpAddress?.formattedAddress,
      pickupLatLong: formatLatLong(docket.pickUpAddress),
      deliveryAddress: docket.deliveryAddress?.formattedAddress,
      deliveryLatLong: formatLatLong(docket.deliveryAddress),
      contactName: docket.customerContactName,
      contactPhone: docket.customerContactPhone,
    },
    assignment:
      docket.driver || docket.truck
        ? {
            driverName: docket.driver?.driverName,
            truckRego: docket.truck?.licensePlate,
          }
        : undefined,
    signOff: hasSignOff
      ? {
          deliveredAtLabel: docket.deliveredAt
            ? `Delivered at ${formatLocalDate(docket.deliveredAt, 'hh:mm a')}`
            : undefined,
          receiverName: docket.receiverName,
          receiverOnSite: docket.receiverOnSite,
          unloadedPhoto,
          receiptPhoto,
          signature,
        }
      : undefined,
  };
}

/**
 * Generate and download a PDF for a docket using its data (no webpage involved).
 */
export async function downloadDocketPdf(
  docket: DocketDTO,
  tenantName?: string,
): Promise<void> {
  try {
    const data = await buildDocketPdfData(docket, tenantName);

    const blob = await pdf(<DocketPdfDocument data={data} />).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${docket.docketNumber}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to generate or download docket PDF:', error);
    throw new Error('PDF generation failed. Please try again.');
  }
}
