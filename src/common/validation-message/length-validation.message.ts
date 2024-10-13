import { ValidationArguments } from 'class-validator';

export const lengthValidationMessage = (args: ValidationArguments) => {
  if (args.constraints.length === 2) {
    return `${args.property}은 ${args.constraints[0]} 과 ${args.constraints[1]} 사이의 길이를 가져야 합니다.`;
  } else {
    return `${args.property}는 최소 ${args.constraints[0]}글자이어야 합니다.`;
  }
};
