import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Min,
} from 'class-validator';

export class CreateLinkDto {
  @ApiProperty({ example: 'Grafana', description: 'Display title of the link' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    example: 'https://grafana.internal.io',
    description: 'Target URL (must use http or https)',
  })
  @IsUrl({ require_tld: false, protocols: ['http', 'https'] })
  @Matches(/^https?:\/\//, {
    message: 'URL must start with http:// or https://',
  })
  url: string;

  @ApiPropertyOptional({
    example: 'Application monitoring and observability dashboards',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    example: 'activity',
    description: 'Lucide icon name',
  })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({
    example: 'Monitoring',
    description: 'Category for grouping links',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    example: 0,
    description: 'Sort position within category',
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the link is visible',
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: ['production', 'critical'],
    description: 'Searchable tags',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiPropertyOptional({
    example: 'production',
    description: 'Target environment',
  })
  @IsString()
  @IsOptional()
  environment?: string;
}
