export class Validator {
  fields: any[];

  constructor() {
    this.fields = [];
  }

  addField(key: string, name: string, type: string, min=NaN, max=NaN) {
    this.fields.push({key: key, name: name, type: type, min: min, max: max});
  }

  validate(data: any): string[] {
    const errors: string[] = [];
    this.fields.forEach(field => Validator.validateField(field, data, errors));
    return errors;
  }

  private static validateField(field: any, data: any, errors: string[]) {
    if( !data.hasOwnProperty(field.key) ) {
      errors.push(`${field.name} is required`);
    }
    else if( typeof data[field.key] !== field.type ) {
      errors.push(`${field.name} must be of type ${field.type}`);
    }
    else { Validator.checkSize(field, data[field.key], errors); }
  }

  private static checkSize(field: any, value: any, errors: string[]) {
    switch(field.type) {
      case 'string':
        if( !isNaN(field.min) && value.length < field.min ) {
          errors.push(`${field.name} must be at least ${field.min} characters`);
        }
        else if( !isNaN(field.max) && value.length > field.max ) {
          errors.push(`${field.name} cannot be more than ${field.max} characters`);
        }
        break;
      case 'number':
        if( !isNaN(field.min) && value < field.min ) {
          errors.push(`${field.name} cannot be less than ${field.min}`);
        }
        else if( !isNaN(field.max) && value > field.max ) {
          errors.push(`${field.name} cannot be longer than ${field.max}`);
        }
        break;
      default:
        // nothing to do
    }
  }
}