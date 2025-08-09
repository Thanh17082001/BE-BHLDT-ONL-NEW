import { User } from "src/users/entities/user.entity";

export const schoolTypes: (user: User) => string[] = (user: User): string[] => {
    
  const SchoolTypeQuery= {
     'Tiểu học':  ['Tiểu học'], // Tiểu học
      'THCS': ['THCS'], // Trung học cơ sở
      'THPT': ['THPT'], // Trung học phổ thông
      'TH&THCS': ['Tiểu học', 'THCS'], // Tiểu học & Trung học cơ sở
        'THCS&THPT' : ['THCS', 'THPT'], // Trung học cơ sở & Trung học phổ thông
    }
    const { schoolType } = user.school;

    

   

    return SchoolTypeQuery[schoolType]
}