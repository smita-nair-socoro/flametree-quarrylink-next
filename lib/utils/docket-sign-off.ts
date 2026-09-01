export function getDocketSignOffCopy(isCollection: boolean) {
  if (isCollection) {
    return {
      atPrefix: 'Collected at',
      nameLabel: 'Collector Name',
      photo1Label: 'Photo 1',
      photo2Label: 'Photo 2',
      signatureLabel: 'Collector Signature',
      emptyPhotoPlaceholder: 'No photo provided',
      emptySignaturePlaceholder: 'No photo provided',
      showReceiverOnSite: false,
    } as const;
  }

  return {
    atPrefix: 'Delivered at',
    nameLabel: 'Receiver Name',
    photo1Label: 'Unloaded Photo',
    photo2Label: 'Receipt Photo',
    signatureLabel: 'Receiver Signature',
    emptyPhotoPlaceholder: 'No photo provided',
    emptySignaturePlaceholder: 'No signature provided',
    showReceiverOnSite: true,
  } as const;
}
