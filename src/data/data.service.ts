import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Data, DataDocument } from './entities/data.entity';
import { ExcelRecord } from './interface/excelData.interface';

@Injectable()
export class DataService {
  constructor(@InjectModel(Data.name) private dataModel: Model<DataDocument>) {}

  async upsertData(record: ExcelRecord): Promise<Data> {
    return this.dataModel
      .findOneAndUpdate(
        { descripcion: record.descripcion },
        {
          tienda: record.tienda,
          taller: record.taller,
          deposito: record.deposito,
          sanMartin: record.sanMartin,
          precio: record.precio,
          promocion: record.promocion,
        },
        { new: true, upsert: true },
      )
      .exec();
  }

  async bulkUpsertData(records: ExcelRecord[]): Promise<void> {
    const bulkOperations = records.map((record) => ({
      updateOne: {
        filter: { descripcion: record.descripcion },
        update: {
          $set: {
            tienda: Number(record.tienda.toFixed(2)),
            taller: Number(record.taller.toFixed(2)),
            deposito: Number(record.deposito.toFixed(2)),
            sanMartin: Number(record.sanMartin.toFixed(2)),
            precio: Number(record.precio.toFixed(2)),
            promocion: record.promocion
              ? Number(record.promocion.toFixed(2))
              : null,
          },
        },
        upsert: true,
      },
    }));

    await this.dataModel.bulkWrite(bulkOperations);
  }

  async getAllData(
    page = 1,
    limit = 10,
  ): Promise<{
    data: Data[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    // Convertir a números para evitar inyección
    page = Number(page);
    limit = Number(limit);

    // Asegurar valores mínimos
    page = page > 0 ? page : 1;
    limit = limit > 0 ? limit : 10;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.dataModel.find().skip(skip).limit(limit).exec(),
      this.dataModel.countDocuments(),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
