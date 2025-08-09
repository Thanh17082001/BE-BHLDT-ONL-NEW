import { StudentService } from './student.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import * as XLSX from 'xlsx';
import { Controller, Get, Post, Body, Put, Param, Delete, Query, Req, UseGuards, Patch, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { PageOptionsDto } from 'src/common/pagination/page-option-dto';
import { Roles } from 'src/role/role.decorator';
import { Role } from 'src/role/role.enum';
import { User } from 'src/users/entities/user.entity';
import { RolesGuard } from 'src/role/role.guard';
import { Student } from './entities/student.entity';
import { changeClassStudent } from './dto/change-class-student.dto';
import { Promoted2Dto } from './dto/promoted2-dto';
import { PromotedDto } from './dto/promoted-dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { Ward } from 'src/ward/entities/ward.entity';
import { District } from 'src/district/entities/district.entity';
import { Province } from 'src/province/entities/supplier.entity';
import { ImportFileExcelStudent } from './dto/excel.dto';
import { ProvinceService } from 'src/province/province.service';
import { DistrictService } from 'src/district/district.service';
import { WardService } from 'src/ward/ward.service';

import * as moment from 'moment';

@Controller('student')
@UseGuards(RolesGuard)

export class StudentController {
  constructor(
    private readonly stundentService: StudentService,
private readonly provinceService: ProvinceService,
    private readonly districtService: DistrictService,
    private readonly wardService: WardService,
  ) { }

  @Post()
  @Roles(Role.TEACHER)
  create(@Body() createStudentDto: CreateStudentDto, @Req() request: Request) {
    const user: User = request['user'] ?? null;
    return this.stundentService.create(createStudentDto, user);
  }


  @Post('import-excel')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @Roles(Role.TEACHER)
  async uploadFileExcel(@UploadedFile() file: Express.Multer.File, @Body() importFileExcel: ImportFileExcelStudent, @Req() request: Request) {
    const user: User = request['user'] ?? null;
    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);
      let students: Array<Student> = []
      let errors: Array<{ row: number, error: string }> = [];
      for (let i = 0; i < data.length; i++) {
        try {
          const item = data[i];
          
          const ward: Ward = await this.wardService.findOneByWardName(item['Phường, xã'])
          const district: District = await this.districtService.findByName(item['Quận, huyện'])
          const province: Province = await this.provinceService.findByName(item['Tỉnh, thành phố'])

          const student: CreateStudentDto = {
            code: item['Mã định danh Bộ GD&ĐT'],
            fullname: item['Họ tên'],
            gender: item['Giới tính'],
            birthday: moment(item['Ngày sinh'], 'DD/MM/YYYY').toDate(),
            phone: item['Số điện thoại'],
            email: item['Email'],
            street: item['Số nhà, đường'],
            ward_id: ward.id ? +ward.id : 0,
            district_id: district.id ? +district.id : 0,
            province_id: province.id ? +province.id : 0,
            classId: +importFileExcel.classId,
          }
          const result = await this.stundentService.create(student, user);
          students.push(result)
        } catch (error) {
           console.log(error);
          errors.push({ row: i + 1, error: error.message });
        }

      }
      return { students, errors }
    } catch (error) {
      throw new BadRequestException(error)
    }
  }

  @Get()
  @Roles(Role.TEACHER)
  async findAll(@Query() pageOptionDto: PageOptionsDto, @Query() query: Partial<Student>, @Req() request: Request) {
    const user = request['user'] ?? null;
    return this.stundentService.findAll(pageOptionDto, query, user);
  }

  @Get(':id')
  @Roles(Role.TEACHER)

  findOne(@Param('id') id: string) {
    return this.stundentService.findOne(+id);
  }

 

  @Patch('/change-class-student')
  @Roles(Role.TEACHER)
  async changeClassStudent(@Body() updateStudentDto: changeClassStudent): Promise<Student> {
    return this.stundentService.changeClassStudent(+updateStudentDto.id, +updateStudentDto.classId);
  }

  @Put('/promoted-class')
  @Roles(Role.TEACHER)
  async promoted(@Body() update: Promoted2Dto): Promise<Array<Student>> {
    const { stundentIds, newClassId, oldSchoolYearId, newSchoolYearId, oldClassId } = update;
    const arrayResult = []
    for (let i = 0; i < stundentIds.length; i++) {
      const data: PromotedDto = {
        stundentId: stundentIds[i],
        newClassId,
        oldSchoolYearId,
        newSchoolYearId,
        oldClassId
      }
      const result = await this.stundentService.updateStudent(data)
      arrayResult.push(result)
    }

    return arrayResult
  }

  @Put(':id')
  @Roles(Role.TEACHER)
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto, @Req() request: Request) {
    const user: User = request['user'] ?? null;
    return this.stundentService.update(+id, updateStudentDto,user);
  }

  @Delete(':id')
  @Roles(Role.TEACHER)
  remove(@Param('id') id: string) {
    return this.stundentService.remove(+id);
  }
}

