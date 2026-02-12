'use client';

import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Quarry } from '@/lib/types/quarry';
import { AddressType } from '@/lib/types/address';
import { QuarryType } from '@/lib/types/quarry-enums';

const EMPTY_ADDRESS: AddressType = {
    address1: '',
    address2: '',
    formattedAddress: '',
    city: '',
    region: '',
    postalCode: '',
    country: '',
    lat: 0,
    lng: 0,
    googlePlaceId: '',
};

export const EMPTY_QUARRY_SUPPLIER_FORM_VALUES = {
    quarry_supplier_type: 'QUARRY' as const,
    name: '',
    website: '',
    email: '',
    phone: '',
    address: '',
    contact_person_name: '',
    contact_person_phone: '',
    contact_person_email: '',
    opening_closing_info: '',
    weighbridge_info: '',
    notes: '',
    created_at: undefined as Date | undefined,
    updated_at: undefined as Date | undefined,
    created_by: 'current_user',
    last_modified_by: 'current_user',
};

function addressFromQuarry(quarry: Quarry | null): AddressType {
    if (!quarry?.address) return EMPTY_ADDRESS;
    const a = quarry.address;
    return {
        address1: a.streetDetailsPrimary || '',
        address2: a.streetDetailsOptional || '',
        formattedAddress: a.formattedAddress || '',
        city: a.city || '',
        region: a.state || '',
        postalCode: a.postcode || '',
        country: a.country || '',
        lat: a.latitude ?? 0,
        lng: a.longitude ?? 0,
        googlePlaceId: a.googlePlaceId?.toString() ?? '',
    };
}

function formValuesFromQuarry(quarry: Quarry) {
    const opt = (v: string | undefined, na = 'N/A') =>
        v === na ? '' : v ?? '';
    return {
        quarry_supplier_type: quarry.quarrySupplierType ?? 'QUARRY',
        name: quarry.name ?? '',
        website: quarry.website === 'N/A' ? '' : quarry.website ?? '',
        email: quarry.email ?? '',
        phone: quarry.phone ?? '',
        address: quarry.address?.formattedAddress ?? '',
        contact_person_name: opt(quarry.contactPersonName),
        contact_person_phone: opt(quarry.contactPersonPhone),
        contact_person_email: opt(quarry.contactPersonEmail),
        opening_closing_info: opt(quarry.openingClosingInfo),
        weighbridge_info: opt(quarry.weighbridgeInfo),
        notes: opt(quarry.notes),
        created_at: quarry.createdAt ? new Date(quarry.createdAt) : undefined,
        updated_at: quarry.updatedAt ? new Date(quarry.updatedAt) : undefined,
        created_by: quarry.createdBy ?? 'current_user',
        last_modified_by: quarry.lastModifiedBy ?? 'current_user',
    };
}

/**
 * Manages initial form state and sync: when quarry detail loads (editing) or when
 * switching to create mode, resets form and local state (type, address, searchInput).
 */
export function useQuarrySupplierFormState(
    selectedQuarrySupplier: Quarry | null,
    isEditing: boolean,
    quarrySupplierForm: UseFormReturn<any>
) {
    const [selectedType, setSelectedType] =
        React.useState<QuarryType>(QuarryType.QUARRY);
    const [address, setAddress] = React.useState<AddressType>(EMPTY_ADDRESS);
    const [searchInput, setSearchInput] = React.useState('');
    const didInitRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        if (!isEditing) {
            didInitRef.current = null;
            setSelectedType(QuarryType.QUARRY);
            setSearchInput('');
            setAddress(EMPTY_ADDRESS);
            quarrySupplierForm.reset(EMPTY_QUARRY_SUPPLIER_FORM_VALUES);
            return;
        }

        // If no quarry supplier is selected, return
        if (!selectedQuarrySupplier?.id) return;
        // If the quarry supplier has already been initialized, return
        if (didInitRef.current === selectedQuarrySupplier.id) return;
        didInitRef.current = selectedQuarrySupplier.id;

        setSelectedType(
            selectedQuarrySupplier.quarrySupplierType ?? QuarryType.QUARRY
        );
        setSearchInput(
            selectedQuarrySupplier.address?.formattedAddress?.toString() ?? ''
        );
        setAddress(addressFromQuarry(selectedQuarrySupplier));
        quarrySupplierForm.reset(formValuesFromQuarry(selectedQuarrySupplier));
    }, [isEditing, selectedQuarrySupplier, quarrySupplierForm]);

    return {
        selectedType,
        setSelectedType,
        address,
        setAddress,
        searchInput,
        setSearchInput,
    };
}
