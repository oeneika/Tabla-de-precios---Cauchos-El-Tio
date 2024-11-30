import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiConsumes,
  ApiBody,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { DataService } from './data.service';
import { Express } from 'express';
import * as XLSX from 'xlsx';
import { ExcelRecord } from './interface/excelData.interface';

@ApiTags('Data') // Agrupa los endpoints bajo "Data" en Swagger
@Controller('data')
export class DataController {
  constructor(private readonly dataService: DataService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir archivo Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Subir archivo Excel con datos',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Archivo procesado correctamente' })
  @ApiResponse({ status: 400, description: 'Error en el archivo' })
  @Post('upload')
  async uploadXlsx(@UploadedFile() file: Express.Multer.File) {
    const buffer = file.buffer;

    // Convertir archivo Excel en JSON
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data: ExcelRecord[] = XLSX.utils.sheet_to_json<ExcelRecord>(
      workbook.Sheets[sheetName],
    );

    // Mapear los datos con los tipos adecuados
    const mappedData: ExcelRecord[] = data.map((row: any) => {
      const safeConvert = (value: any) => {
        const converted = Number(value);
        return !isNaN(converted) ? Number(converted.toFixed(2)) : 0;
      };

      return {
        descripcion: String(row['DESCRIPCION'] || ''),
        tienda: safeConvert(row['TIENDA']),
        taller: safeConvert(row['TALLER']),
        deposito: safeConvert(row['DEPOSITO']),
        sanMartin: safeConvert(row['SAN MARTIN']),
        precio: safeConvert(row['PRECIO']),
        promocion: row['PROMOCION'] ? safeConvert(row['PROMOCION']) : null,
      };
    });
    // Usar bulkWrite para procesamiento masivo
    await this.dataService.bulkUpsertData(mappedData);

    return {
      message: 'File processed successfully',
      recordsProcessed: mappedData.length,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obtener datos paginados' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async getAllData(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search = '',
  ) {
    console.log(page, 'page');
    return this.dataService.getAllData(page, limit, search);
  }
}
