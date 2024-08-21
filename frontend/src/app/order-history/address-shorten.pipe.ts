import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'addressShorten',
})
export class AddressShortenPipe implements PipeTransform {
  transform(value: string): string {
    const suffixToRemove = 'Ahmedabad, Gujarat, India';
    if (value.endsWith(suffixToRemove)) {
      return value.slice(0, value.length - suffixToRemove.length).trim();
    }
    return value;
  }
}
