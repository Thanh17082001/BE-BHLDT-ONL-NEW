import { Expose, Exclude } from "class-transformer";

export class ProvinceDto {
    @Expose()
    id: number;
    @Expose()
    name: string;
    @Expose()
    code: number;
}