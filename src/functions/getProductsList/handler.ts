import { formatJSONResponse, formatJSONResponseError } from '@libs/api-gateway';
import pillowServerice from 'src/service';

export const getProductsList = async () => {
  try {
    const pillows = await pillowServerice.getAllPillows();
    return formatJSONResponse(pillows)
  } catch (e) {
    return formatJSONResponseError({
      status: 500,
      message: e.message,
    });
  }
};