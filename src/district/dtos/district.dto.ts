import { Expose, Exclude } from "class-transformer";

export class DistrictDto {
    @Expose()
    id: number;
    @Expose()
    name: string;
    @Expose()
    code: number;
    @Expose()
    province: number;
}