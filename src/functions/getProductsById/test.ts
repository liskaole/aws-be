import { formatJSONResponse, formatJSONResponseError } from '@libs/api-gateway';
import { getProductsById } from './handler';
import { PILLOW } from '../../mock/pillows';

jest.mock('@libs/api-gateway', () => ({
  formatJSONResponse: jest.fn(),
  formatJSONResponseError: jest.fn(),
}));

describe('getProductsById', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('success responce, return JSON with a product', async () => {
    const expectedResponse = {
      statusCode: 200,
      body: JSON.stringify(PILLOW[0]),
    };
    (formatJSONResponse as jest.Mock).mockReturnValue(expectedResponse);
    const response = await getProductsById({
      pathParameters: { productId: '1' },
    });
    expect(response).toEqual(expectedResponse);
    expect(formatJSONResponse).toHaveBeenCalledWith(PILLOW[0]);
    expect(formatJSONResponseError).not.toHaveBeenCalled();
  });

  it('not found error if there is no pillow', async () => {
    const errorMessage = 'Pillow not found!';
    const expectedResponse = {
      statusCode: 404,
      body: { message: errorMessage },
    };
    (formatJSONResponseError as jest.Mock).mockReturnValue(expectedResponse);
    const response = await getProductsById({
      pathParameters: { productId: '5331f-fff433-245fd3-vde343' },
    });
    expect(response).toEqual(expectedResponse);
    expect(formatJSONResponse).not.toHaveBeenCalled();
    expect(formatJSONResponseError).toHaveBeenCalledWith(
      { message: errorMessage },
      404,
    );
  });

  it('error message if a responce 500', async () => {
    const errorMessage = 'Error!';
    const expectedResponse = {
      statusCode: 500,
      body: JSON.stringify({ message: errorMessage }),
    };
    (formatJSONResponseError as jest.Mock).mockReturnValue(expectedResponse);
    jest.spyOn(global, 'setTimeout').mockImplementation(() => {
      throw new Error(errorMessage);
    });
    try {
      await getProductsById({ pathParameters: { productId: '1' } });
    } catch (e) {
      expect(e).toEqual(expectedResponse);
      expect(formatJSONResponse).not.toHaveBeenCalled();
      expect(formatJSONResponseError).toHaveBeenCalledWith(
        { message: errorMessage },
        500,
      );
    }
    jest.restoreAllMocks();
  });
});