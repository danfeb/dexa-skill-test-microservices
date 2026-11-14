import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';

export class UploadFilePayloadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  originalName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  mimeType!: string;

  @IsInt()
  @Min(1)
  size!: number;

  @IsString()
  @IsNotEmpty()
  data!: string;
}
