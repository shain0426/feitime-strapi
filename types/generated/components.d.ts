import type { Schema, Struct } from '@strapi/strapi';

export interface QuizOption extends Struct.ComponentSchema {
  collectionName: 'components_quiz_options';
  info: {
    displayName: 'option';
    icon: 'bulletList';
  };
  attributes: {
    acidity: Schema.Attribute.Integer;
    aftertaste: Schema.Attribute.Integer;
    body: Schema.Attribute.Integer;
    clarity: Schema.Attribute.Integer;
    helper: Schema.Attribute.Text;
    key: Schema.Attribute.String;
    label: Schema.Attribute.String;
    sweetness: Schema.Attribute.Integer;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'quiz.option': QuizOption;
    }
  }
}
