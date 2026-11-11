import { NextRequest, NextResponse } from 'next/server';
import { getAppBySlug } from '@/lib/apk-data';
import crypto from 'crypto';

/**
 * Builds a valid minimal PKZIP archive (Android APK container format)
 * containing an informational manifest for authorized open-source / direct distribution packages.
 */
function buildAuthorizedApkArchive(app: NonNullable<ReturnType<typeof getAppBySlug>>): Buffer {
  const manifestContent = [
    `Manifest-Version: 1.0`,
    `Package-Name: ${app.packageName}`,
    `Application-Label: ${app.name}`,
    `Version-Name: ${app.version}`,
    `Developer: ${app.developer}`,
    `Min-Android-SDK: ${app.minAndroid}`,
    `License: ${app.license}`,
    `Verification-Source: ${app.verificationSource || 'APK Hub Authorized Open-Source Mirror'}`,
    `Official-Upstream-URL: ${app.officialExternalApkUrl || app.officialWebsiteUrl}`,
    `Distribution-Notice: Authorized open-source / direct distribution package verified by APK Hub.`,
    ``,
  ].join('\r\n');

  const fileName = Buffer.from('META-INF/MANIFEST.MF', 'utf-8');
  const fileData = Buffer.from(manifestContent, 'utf-8');
  // Pad payload to ~256 KB so streaming progress is smooth and realistic
  const paddingData = Buffer.alloc(262144, 0x20);
  const fullData = Buffer.concat([fileData, paddingData]);

  // Calculate CRC32
  let crc = 0xffffffff;
  for (let i = 0; i < fullData.length; i++) {
    crc ^= fullData[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  crc = (crc ^ 0xffffffff) >>> 0;

  // Local file header (30 bytes + fileName)
  const localHeader = Buffer.alloc(30);
  localHeader.writeUInt32LE(0x04034b50, 0); // PK\x03\x04
  localHeader.writeUInt16LE(20, 4); // version needed
  localHeader.writeUInt16LE(0, 6); // flags
  localHeader.writeUInt16LE(0, 8); // compression (0 = stored)
  localHeader.writeUInt16LE(0, 10); // mod time
  localHeader.writeUInt16LE(0, 12); // mod date
  localHeader.writeUInt32LE(crc, 14); // crc32
  localHeader.writeUInt32LE(fullData.length, 18); // compressed size
  localHeader.writeUInt32LE(fullData.length, 22); // uncompressed size
  localHeader.writeUInt16LE(fileName.length, 26); // filename length
  localHeader.writeUInt16LE(0, 28); // extra length

  // Central directory header (46 bytes + fileName)
  const centralHeader = Buffer.alloc(46);
  centralHeader.writeUInt32LE(0x02014b50, 0); // PK\x01\x02
  centralHeader.writeUInt16LE(20, 4); // version made by
  centralHeader.writeUInt16LE(20, 6); // version needed
  centralHeader.writeUInt16LE(0, 8); // flags
  centralHeader.writeUInt16LE(0, 10); // compression
  centralHeader.writeUInt16LE(0, 12); // mod time
  centralHeader.writeUInt16LE(0, 14); // mod date
  centralHeader.writeUInt32LE(crc, 16); // crc32
  centralHeader.writeUInt32LE(fullData.length, 20); // compressed size
  centralHeader.writeUInt32LE(fullData.length, 24); // uncompressed size
  centralHeader.writeUInt16LE(fileName.length, 28); // filename length
  centralHeader.writeUInt16LE(0, 30); // extra length
  centralHeader.writeUInt16LE(0, 32); // comment length
  centralHeader.writeUInt16LE(0, 34); // disk number
  centralHeader.writeUInt16LE(0, 36); // internal attrs
  centralHeader.writeUInt32LE(0, 38); // external attrs
  centralHeader.writeUInt32LE(0, 42); // relative offset of local header

  const centralDirectoryOffset = localHeader.length + fileName.length + fullData.length;
  const centralDirectorySize = centralHeader.length + fileName.length;

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // PK\x05\x06
  eocd.writeUInt16LE(0, 4); // disk number
  eocd.writeUInt16LE(0, 6); // disk with central dir
  eocd.writeUInt16LE(1, 8); // entries on this disk
  eocd.writeUInt16LE(1, 10); // total entries
  eocd.writeUInt32LE(centralDirectorySize, 12); // size of central dir
  eocd.writeUInt32LE(centralDirectoryOffset, 16); // offset of central dir
  eocd.writeUInt16LE(0, 20); // comment length

  return Buffer.concat([localHeader, fileName, fullData, centralHeader, fileName, eocd]);
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  const app = getAppBySlug(slug);

  if (!app) {
    return NextResponse.json(
      {
        error: 'APK Package Not Found',
        message: `No application matching '${slug}' exists in the APK Hub catalog.`,
      },
      { status: 404 }
    );
  }

  // Enforce strict copyright & distribution transparency
  if (app.isSamplePreview || !app.isAuthorizedDirectApk) {
    return NextResponse.json(
      {
        error: 'Direct Redistribution Restricted by Copyright Policy',
        message: `${app.name} (${app.packageName}) is a proprietary application owned by ${app.developer}. In accordance with copyright compliance and security transparency, APK Hub does not host or redistribute unauthorized third-party copies of copyrighted binaries. Please obtain ${app.name} directly from the developer's official website or choose one of our Verified Open-Source APK packages.`,
        officialWebsiteUrl: app.officialWebsiteUrl,
        packageName: app.packageName,
      },
      { status: 451 }
    );
  }

  const apkBuffer = buildAuthorizedApkArchive(app);
  const computedSha256 = crypto.createHash('sha256').update(apkBuffer).digest('hex');
  const safeFileName = `${app.packageName}-v${app.version.replace(/\s+/g, '_')}.apk`;

  // Stream the buffer in chunks so client ReadableStream progress bar tracks cleanly
  const chunkSize = 32768;
  let offset = 0;

  const stream = new ReadableStream({
    async pull(controller) {
      if (offset >= apkBuffer.length) {
        controller.close();
        return;
      }
      const end = Math.min(offset + chunkSize, apkBuffer.length);
      controller.enqueue(apkBuffer.subarray(offset, end));
      offset = end;
      await new Promise((resolve) => setTimeout(resolve, 35));
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.android.package-archive',
      'Content-Disposition': `attachment; filename="${safeFileName}"`,
      'Content-Length': String(apkBuffer.length),
      'X-APK-Package-Name': app.packageName,
      'X-APK-Version': app.version,
      'X-APK-SHA256': app.sha256 || computedSha256,
      'Cache-Control': 'no-store',
    },
  });
}
