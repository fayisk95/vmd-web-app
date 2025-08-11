import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat'
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number, currency: string = '$', decimalLength: number = 2, chunkDelimiter: string = ','): string {
    if (!value && value !== 0) return '';
    
    const num = value.toFixed(Math.max(0, ~~decimalLength));
    return currency + (chunkDelimiter ? num.replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${chunkDelimiter}`) : num);
  }
}