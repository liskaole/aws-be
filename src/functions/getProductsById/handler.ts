import { formatJSONResponse, formatJSONResponseError } from '@libs/api-gateway';
import pillowServerice from 'src/service';

export const getProductsById = async event => {
  try {
    const product = await pillowServerice.getPillow(event.pathParameters.productId)
    return formatJSONResponse(product)
  } catch (error) {
    return formatJSONResponseError(
      { message: "Pillow does not exit" }, 
      404
    );
  }
};