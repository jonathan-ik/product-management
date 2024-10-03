import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(9)
  @MaxLength(32)
  public password: string;

  @IsString()
  @IsNotEmpty()
  public first_name: string;

  @IsString()
  @IsNotEmpty()
  public last_name: string;

  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @MinLength(11)
  @MaxLength(14)
  public phone_number: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  public image: string;
}

export class UpdateUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public first_name: string;

  @IsString()
  @IsNotEmpty()
  public last_name: string;

 
}
