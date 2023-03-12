import { faker } from "@faker-js/faker";
import { formatJSONResponse } from "@libs/api-gateway";
import pillowServerice from "src/service";

export const createProduct = async (event) => {
    try {
        const pillowData = JSON.parse(event.body)
        const pillow = await pillowServerice.createPillow({
            id: faker.datatype.uuid(),
            title: pillowData.title,
            description: pillowData.description,
            matherials: pillowData.matherials,
            filler: pillowData.filler,
            height: pillowData.height,
            width: pillowData.width,
            price: pillowData.price,
        })

        return formatJSONResponse(pillow);
    } catch (e) {
        return formatJSONResponse({
            status: 500,
            message: e
        });
    }
}