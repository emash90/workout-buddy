import { PartialType } from '@nestjs/mapped-types';
import { CreateGoalsDto } from './create-goals.dto';

export class UpdateGoalsDto extends PartialType(CreateGoalsDto) {}
