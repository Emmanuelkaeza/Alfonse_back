import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseOptionalIntPipe implements PipeTransform<string, number | undefined> {
  transform(value: string, metadata: ArgumentMetadata): number | undefined {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new BadRequestException(`${metadata.data} doit être un nombre entier valide`);
    }
    
    return val;
  }
}
