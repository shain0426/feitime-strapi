import type { Schema, Struct } from '@strapi/strapi';

export interface OrderItems extends Struct.ComponentSchema {
  collectionName: 'components_order_items';
  info: {
    displayName: 'items';
  };
  attributes: {
    item_total: Schema.Attribute.Decimal;
    pid: Schema.Attribute.String;
    quantity: Schema.Attribute.Integer;
    snapshot_image: Schema.Attribute.String;
    snapshot_name: Schema.Attribute.String;
    snapshot_price: Schema.Attribute.Decimal;
    snapshot_weight: Schema.Attribute.String;
  };
}

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
      'order.items': OrderItems;
      'quiz.option': QuizOption;
    }
  }
}
