import {
  DeleteObjectsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

const PRESIGN_EXPIRES_IN = 60 * 60 * 24 * 7; // 7 days

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} nao configurado. Defina em .env.local ou nas variaveis do Railway.`);
  }
  return value;
}

function getBucket(): string {
  return required("AWS_S3_BUCKET_NAME");
}

function getClient(): S3Client {
  return new S3Client({
    region: process.env.AWS_REGION || "auto",
    endpoint: required("AWS_ENDPOINT_URL_S3"),
    credentials: {
      accessKeyId: required("AWS_ACCESS_KEY_ID"),
      secretAccessKey: required("AWS_SECRET_ACCESS_KEY"),
    },
    forcePathStyle: false,
  });
}

export async function uploadObject(
  key: string,
  body: Buffer | Uint8Array,
  contentType: string
): Promise<string> {
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return key;
}

export async function removeObjects(keys: string[]): Promise<void> {
  const unique = [...new Set(keys.filter(Boolean))];
  if (unique.length === 0) return;
  const client = getClient();
  await client.send(
    new DeleteObjectsCommand({
      Bucket: getBucket(),
      Delete: {
        Objects: unique.map((Key) => ({ Key })),
        Quiet: true,
      },
    })
  );
}

export async function removeObject(key: string): Promise<void> {
  await removeObjects([key]);
}

export async function presignObject(key: string | null | undefined): Promise<string | null> {
  if (!key) return null;
  // Already a full URL (legacy) — return as-is
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  const client = getClient();
  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: getBucket(), Key: key }),
    { expiresIn: PRESIGN_EXPIRES_IN }
  );
}

export async function presignMany(keys: (string | null | undefined)[]): Promise<(string | null)[]> {
  return Promise.all(keys.map((k) => presignObject(k)));
}
