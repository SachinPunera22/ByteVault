import { QueryTypesEnum, type HandlerImplementation } from "../../constants";
import { CreateValidator } from "./create-validator-service";

export const QueryValidationMapper: Record<
  QueryTypesEnum,
  HandlerImplementation
> = {
  [QueryTypesEnum.CREATE]: CreateValidator.getInstance(),
};
