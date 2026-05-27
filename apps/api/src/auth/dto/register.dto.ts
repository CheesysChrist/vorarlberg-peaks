import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'mountaineer42' })
  @IsString()
  @MinLength(3)
  username: string;

  @ApiProperty({ example: 'securepassword' })
  @IsString()
  @MinLength(8)
  password: string;
}
