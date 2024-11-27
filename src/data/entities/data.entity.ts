import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DataDocument = HydratedDocument<Data>;

@Schema()
export class Data {
  @Prop({ type: String, required: true })
  descripcion: string;

  @Prop({ type: Number, default: 0 })
  tienda: number;

  @Prop({ type: Number, default: 0 })
  taller: number;

  @Prop({ type: Number, default: 0 })
  deposito: number;

  @Prop({ type: Number, default: 0 })
  sanMartin: number;

  @Prop({ type: Number, default: 0 })
  precio: number;

  @Prop({ type: Number, required: false })
  promocion?: number;
}

export const DataSchema = SchemaFactory.createForClass(Data);
