import { Expose, Exclude } from "class-transformer";

export class WardDto {
    @Expose()
    id: number;
    @Expose()
    name: string;
    @Expose()
    code: number;
    @Expose()
    district: number;
}