import { formatJSONResponse, formatJSONResponseError } from '@libs/api-gateway';
import { PILLOW } from '../../mock/pillows';

export const getProductsById = async event => {
  try {
    const productId = event?.pathParameters?.productId;

    const product = await new Promise(resolve =>
      setTimeout(
        () => resolve(PILLOW.find(item => item.id === productId)),
        300,
      ),
    );
    if (!product) {
      return formatJSONResponseError({ message: 'Pillow not found!' }, 404);
    }
    return formatJSONResponse(product);
  } catch (e) {
    return formatJSONResponseError({
      message: e.message,
    });
  }
};