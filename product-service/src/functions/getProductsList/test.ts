import { formatJSONResponse, formatJSONResponseError } from '@libs/api-gateway';
import { getProductsList } from './handler';
import { PILLOW } from '../../mock/pillows';

jest.mock('@libs/api-gateway', () => ({
  formatJSONResponse: jest.fn(),
  formatJSONResponseError: jest.fn(),
}));

describe('getProductsList', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('success responce, JSON with list of products', async () => {
    const expectedResponse = {
      statusCode: 200,
      body: JSON.stringify(PILLOW),
    };
    (formatJSONResponse as jest.Mock).mockReturnValue(expectedResponse);
    const response = await getProductsList();
    expect(response).toEqual(expectedResponse);
    expect(formatJSONResponse).toHaveBeenCalledWith(PILLOW);
    expect(formatJSONResponseError).not.toHaveBeenCalled();
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
      await getProductsList();
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