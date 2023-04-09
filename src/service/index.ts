import dynamoDBClient from "../model/database";
import PillowServise from "./pillowServise"

const pillowServerice = new PillowServise(dynamoDBClient());
export default pillowServerice;