import { APIClient } from '@/lib/api/APIClient';
import { JobAttachmentDTO } from '@/lib/types/job';
import { notifyError } from '@/lib/toast';
import { extractErrorMessage } from '@/lib/utils/error-message-helper';

export async function downloadJobAttachment(
  jobId: number,
  attachment: JobAttachmentDTO,
) {
  if (!jobId || !attachment.id) return;

  try {
    const blob = await APIClient.jobs.getAttachment(jobId, attachment.id);
    const downloadName = attachment.fileExtension
      ? `${attachment.fileName}${
          attachment.fileExtension.startsWith('.')
            ? attachment.fileExtension
            : `.${attachment.fileExtension}`
        }`
      : attachment.fileName;
    const file =
      blob.type || !attachment.fileExtension
        ? blob
        : new Blob([blob], {
            type: guessMimeType(attachment.fileExtension) ?? blob.type,
          });

    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    notifyError(extractErrorMessage(error) || 'Failed to download attachment');
  }
}

function guessMimeType(fileExtension: string) {
  const ext = fileExtension.toLowerCase().replace(/^\./, '');

  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'jpeg':
    case 'jpg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'eml':
      return 'message/rfc822';
    default:
      return undefined;
  }
}
