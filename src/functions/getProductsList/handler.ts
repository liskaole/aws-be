import { formatJSONResponse, formatJSONResponseError } from '@libs/api-gateway';
import { PILLOW } from '../../mock/pillows';

export const getProductsList = async () => {
  try {
    return await new Promise(resolve =>
      setTimeout(() => resolve(formatJSONResponse(PILLOW)), 300),
    );
  } catch (e) {
    return formatJSONResponseError({
      message: e.message,
    });
  }
};