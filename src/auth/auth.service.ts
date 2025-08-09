import { BadRequestException, NotFoundException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { User } from "src/users/entities/user.entity";
import { SignUpDto } from "./dto/sign-up.dto";
import { LoginDto } from "./dto/login.dto";
import { UsersService } from "src/users/users.service";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

export class AuthService {
  constructor(
     @InjectRepository(User) private repoUser: Repository<User>,
    private jwtService: JwtService,
  ) { }

  async logIn(data: LoginDto): Promise<any> {
    
    const user = await this.repoUser?.findOne(
      {
        where: { username: data.username },
        relations: {
          school: true,
          subjects: true,
          grades:true
        },
      }
    );
      if (!user) {
        throw new NotFoundException('Tài khoản hoặc mật khẩu không chính xác');
      }
      const isPass = await bcrypt.compare(data.password, user.password);
      if (!isPass) {
        throw new BadRequestException('Tài khoản hoặc mật khẩu không chính xác');
      }
      const payload = { ...user, password: undefined, };
      const accessToken = this.jwtService.sign(payload);
      return {
        ...payload,
        accessToken: accessToken,
      };
    
  }

}
