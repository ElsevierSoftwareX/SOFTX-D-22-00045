import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "genderPipe"
})
export class GenderPipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case "M":
        return "Male";
      case "F":
        return "Female";
      default:
        return "";
    }
  }

}
