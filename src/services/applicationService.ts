import { applyToJob } from './jobService';
import { storage } from '../utils/storage';

export type ApplicationStatus = 'applied' | 'shortlisted' | 'selected' | 'rejected';

export interface ApplicationRecord {
  id: string;
  jobId: string;
  applicantId: string;
  applicantName: string;
  status: ApplicationStatus;
  appliedAt: string;
}

const APPLICATION_RECORDS_KEY = 'kaamsetu_application_records';

async function readRecords(): Promise<ApplicationRecord[]> {
  const raw = await storage.getItem(APPLICATION_RECORDS_KEY);
  if (!raw) return [];
  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed) || !parsed.every(isApplicationRecord)) {
    throw new Error('Saved applications have an invalid format.');
  }
  return parsed;
}

function isApplicationRecord(value: unknown): value is ApplicationRecord {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<ApplicationRecord>;
  return typeof item.id === 'string' &&
    typeof item.jobId === 'string' &&
    typeof item.applicantId === 'string' &&
    typeof item.applicantName === 'string' &&
    typeof item.appliedAt === 'string' &&
    ['applied', 'shortlisted', 'selected', 'rejected'].includes(item.status ?? '');
}

export async function submitApplication(
  jobId: string,
  applicantId: string,
  applicantName: string
): Promise<ApplicationRecord> {
  const existing = await readRecords();
  const duplicate = existing.find((item) => item.jobId === jobId && item.applicantId === applicantId);
  if (duplicate) return duplicate;
  await applyToJob(jobId);
  const record: ApplicationRecord = {
    id: `application-${Date.now()}-${jobId}`,
    jobId,
    applicantId,
    applicantName,
    status: 'applied',
    appliedAt: new Date().toISOString(),
  };
  await storage.setItem(APPLICATION_RECORDS_KEY, JSON.stringify([record, ...existing]));
  return record;
}

export async function getApplications(applicantId?: string): Promise<ApplicationRecord[]> {
  const records = await readRecords();
  return applicantId
    ? records.filter((item) => item.applicantId === applicantId)
    : records;
}

export async function updateApplicationStatus(
  applicationId: string,
  status: ApplicationStatus
): Promise<void> {
  const records = await readRecords();
  const index = records.findIndex((item) => item.id === applicationId);
  if (index < 0) throw new Error(`Application ${applicationId} does not exist.`);
  records[index] = { ...records[index], status };
  await storage.setItem(APPLICATION_RECORDS_KEY, JSON.stringify(records));
}
