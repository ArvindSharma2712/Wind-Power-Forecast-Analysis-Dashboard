/**
 * Ingest of Original Elexon BMRS Stream Responses provided in the project assets/ directory:
 * 1. Wind generation forecast (WINDFOR) stream_response_1793111592799.json (73 records)
 * 2. Half-hourly generation outturn by fuel type (FUELHH) stream_response_1793113922664.json (HTTP 400 validation response)
 */

import rawWindforJson from '../../../assets/Wind generation forecast (WINDFOR) stream_response_1793111592799.json';
import rawFuelhhErrorJson from '../../../assets/Half-hourly generation outturn by fuel type (FUELHH) stream_response_1793113922664.json';

export const rawBMRSAssets = {
  windforRecords: rawWindforJson,
  fuelhhError: rawFuelhhErrorJson,
  metadata: {
    windforFilename: 'Wind generation forecast (WINDFOR) stream_response_1793111592799.json',
    windforCount: rawWindforJson.length,
    windforPublishTime: rawWindforJson[0]?.publishTime || '2026-10-27T11:30:00Z',
    windforStart: rawWindforJson[0]?.startTime || '2026-10-26T21:00:00Z',
    windforEnd: rawWindforJson[rawWindforJson.length - 1]?.startTime || '2026-10-29T21:00:00Z',
    fuelhhFilename: 'Half-hourly generation outturn by fuel type (FUELHH) stream_response_1793113922664.json',
    fuelhhStatus: rawFuelhhErrorJson.status || 400,
    fuelhhErrorMessage: rawFuelhhErrorJson.errors?.['']?.[0] || 'Unknown validation error',
    isOriginalAssetsData: true,
  },
};

/**
 * Transforms raw WINDFOR stream response into standard dashboard record format
 */
export function getTransformedAssetRecords() {
  return rawBMRSAssets.windforRecords.map((item, index) => {
    const deliveryDate = new Date(item.startTime);
    const dateStr = item.startTime.slice(0, 10);
    const totalMinutes = deliveryDate.getUTCHours() * 60 + deliveryDate.getUTCMinutes();
    const settlementPeriod = Math.floor(totalMinutes / 30) + 1;

    // Delivery End Time (30 mins or 1 hour later)
    const endDate = new Date(deliveryDate.getTime() + 30 * 60 * 1000);
    const deliveryEndTime = endDate.toISOString();

    return {
      id: `ASSET-WINDFOR-${index + 1}`,
      dateString: dateStr,
      settlementPeriod,
      deliveryStartTime: item.startTime,
      deliveryEndTime,
      forecastPublicationTime: item.publishTime,
      decisionCutoff: 'BMRS Live Stream Publish 11:30 UTC',
      fuelType: 'WIND',
      forecastGeneration: item.generation,
      actualGeneration: null, // Note: FUELHH returned 400 validation error in assets/
      signedError: null,
      absoluteError: null,
      isMissingActual: true,
      isUnmatched: false,
      isGenuineZero: false,
      isFromAssetsFile: true,
      qualityNote: 'Actual generation unavailable: BMRS FUELHH query returned 400 parameter conflict',
    };
  });
}